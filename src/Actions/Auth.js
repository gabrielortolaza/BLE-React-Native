import firebase from "@react-native-firebase/app";
import axios from "axios";
import createAuthRefreshInterceptor from "axios-auth-refresh";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Keychain from "react-native-keychain";
import moment from "moment";
import { Platform, Linking } from "react-native";
import messaging from "@react-native-firebase/messaging";
import VersionNumber from "react-native-version-number";
import { getModel, getSystemVersion } from "react-native-device-info";
import _ from "lodash";
import { PLAPI_BASE_URL } from "react-native-dotenv";

import store from "../New_Store";
import * as RootNavigation from "../App/RootNavigation";
import * as C from "../Config/constants";
import {
  UPDATE_AUTH_STATUS, LOGGED_OUT, UPDATE_NOTIFICATIONS_ALLOWED,
  GLOBAL_BREAST_TYPE, API_AUTH
} from "../Types";
import { addMessage, setRequesting } from "./Status";
import {
  updatePrograms, updatePausePrograms, updatePumpStatus,
  pumpDisconnectFromSignOut, importProgram, checkForStoredProgramImages,
  changeADProgramPumpName
} from "./Pump";
import { updateScheduleEvents } from "./Schedule";
import {
  isValidPassword, isValidEmail, isEmpty, getFirstAndLastName
} from "../Services/SharedFunctions";
import { amberProgram, program1Default } from "../Config/Modes";
import * as M from "../Config/messages";
import { PLAPI_LOGIN } from "../Config/api";
import {
  DEFAULT_PROGRAM_DELETED, KEY_USER_TUTORIAL, LAST_PLAY_MODE_STORED,
  REMEMBER_ME, STORAGE_PROGRAM_IMAGES, STORAGE_PROGRAMS,
  CHANGED_AD_PROGRAMS_PUMP_NAME,
} from "../Config/LocalStorage";
import { addProfileToList, createProfile } from "../Http/KlaviyoService";

export const authAxios = axios.create({
  baseURL: PLAPI_BASE_URL
});

let thisProfileString = "";

const updateAuthStatus = (payload) => {
  return {
    type: UPDATE_AUTH_STATUS,
    payload
  };
};

const refreshApiAuthLogic = async (failedRequest) => {
  const { email } = firebase.auth().currentUser;

  const firebaseUserIdToken = await firebase.auth().currentUser.getIdToken();

  const data = {
    email,
    firebaseUserIdToken
  };

  const options = {
    method: "POST",
    data,
    url: `${PLAPI_BASE_URL}${PLAPI_LOGIN}`,
  };

  return axios(options)
    .then(async (tokenRefreshResponse) => {
      const accessToken = tokenRefreshResponse.data.access_token;

      failedRequest.response.config.headers.Authorization = `Bearer ${accessToken}`;

      store.dispatch({
        type: API_AUTH,
        payload: {
          accessToken,
          authenticated: true
        }
      });

      await Keychain.setGenericPassword(
        "token",
        JSON.stringify({
          accessToken
        }),
      );

      setApiInterceptor(accessToken);

      return Promise.resolve();
    })
    .catch((e) => {
      console.error(e);

      // Signout as token is no longer valid
      store.dispatch({
        type: API_AUTH,
        payload: {
          accessToken: null,
          authenticated: false
        }
      });

      store.dispatch(signOut());
    });
};

createAuthRefreshInterceptor(authAxios, refreshApiAuthLogic, {});

const setApiInterceptor = (accessToken) => {
  authAxios.interceptors.request.use(
    (config) => {
      if (!config.headers.Authorization) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }

      return config;
    },
    (error) => {
      return Promise.reject(error);
    },
  );
};

const programLibraryApiInit = () => {
  return (dispatch) => {
    // Load JSON web token if stored
    Keychain.getGenericPassword()
      .then((value) => {
        const jwt = JSON.parse(value.password);

        dispatch({
          type: API_AUTH,
          payload: {
            accessToken: jwt.accessToken || null,
            authenticated: !!jwt.accessToken,
          }
        });

        setApiInterceptor(jwt.accessToken);
      })
      .catch((error) => {
        // Auth refresh call will retrieve a new one
        // when an API call is made
        console.log(`Keychain Error: ${error.message}`);
        dispatch({
          type: API_AUTH,
          payload: {
            accessToken: null,
            authenticated: false,
          }
        });
      });
  };
};

export const authInit = () => {
  return (dispatch, getState) => {
    const { lastUid } = getState().auth; // TODO lastUid

    firebase.auth().onAuthStateChanged((user) => {
      console.log("auth changed:", user);
      setUid(user ? user.uid : 0, lastUid, dispatch, "");

      if (user) {
        // Listen for push notification changes
        firebase
          .database()
          .ref(`pushNotif/userData/${user.uid}/`)
          .on("value", (pushUserSnapshot) => {
            const pushUserVal = pushUserSnapshot.val();

            if (pushUserVal) {
              dispatch(setNotificationsAllowed(null, pushUserVal));
            }
          });

        dispatch(programLibraryApiInit());

        AsyncStorage.getItem(CHANGED_AD_PROGRAMS_PUMP_NAME).then((val) => {
          if (!val) {
            setTimeout(() => {
              store.dispatch(changeADProgramPumpName());
            }, 5500);
          }
        });
      } else {
        // User signed out
        console.log("User signed out!");
        dispatch(apiLogout());
      }
    });
  };
};

export const requestUserNotifPermission = (takeToSettings = false) => {
  return async (dispatch) => {
    const authStatus = await messaging().requestPermission();
    const enabled = authStatus
      === messaging.AuthorizationStatus.AUTHORIZED
        || authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    console.log(enabled, "Authorization status:", authStatus);

    if (enabled) {
      // User has authorised
      const pushToken = await getToken();
      dispatch(updateFCMToken(pushToken));
      setNotificationsAllowed(true);
    } else {
      // User has rejected permissions
      setNotificationsAllowed(false);

      if (takeToSettings) {
        Linking.openSettings();
      }
    }
  };
};

const getToken = async () => {
  const fcmToken = await firebase.messaging().getToken();
  console.log("fcm token:::", fcmToken);
  return fcmToken;
};

export const updateFCMToken = (fcmToken) => {
  return (dispatch) => {
    dispatch(updateStoreFCMToken(fcmToken));
    const user = firebase.auth().currentUser;

    if (user) {
      finishUpdateFCMToken(user, fcmToken);
    }
  };
};

const finishUpdateFCMToken = (user, fcmToken) => {
  const tokenDBRef = firebase.database().ref(`userdata/${user.uid}/fcmToken`);
  const pushNotifRef = firebase.database().ref(`pushNotif/userData/${user.uid}/fcmToken`);

  if (fcmToken) {
    if (Platform.OS === "ios") {
      tokenDBRef.update({ ios: fcmToken });
      pushNotifRef.update({ ios: fcmToken });
    } else if (Platform.OS === "android") {
      tokenDBRef.update({ android: fcmToken });
      pushNotifRef.update({ android: fcmToken });
    }
  }
};

const removeFCMToken = (uid, removeAll) => {
  const tokenDBRef = firebase.database().ref(`userdata/${uid}/fcmToken/${Platform.OS}`);
  const pushNotifRef = firebase.database().ref(`pushNotif/userData/${uid}/fcmToken/${Platform.OS}`);
  const pushNotifAllRef = firebase.database().ref(`pushNotif/userData/${uid}`);

  if (removeAll) {
    pushNotifAllRef.remove();
  } else {
    tokenDBRef.remove();
    pushNotifRef.remove();
  }
};

const updateStoreFCMToken = (fcmToken) => {
  return (dispatch) => {
    dispatch(updateAuthStatus({ fcmToken }));
  };
};

export const saveProgramUser = (id, program) => {
  const { uid } = firebase.auth().currentUser;

  if (uid) firebase.database().ref(`userdata/${uid}/programs/${id}`).set(_.cloneDeep(program));
};

export const saveBulkProgramUser = (programs) => {
  const { uid } = firebase.auth().currentUser;

  if (uid) firebase.database().ref(`userdata/${uid}/programs`).set(_.cloneDeep(programs));
};

export const deleteProgramUser = (id) => {
  const { uid } = firebase.auth().currentUser;
  if (uid) firebase.database().ref(`userdata/${uid}/programs/${id}`).set(null);
};

export const deletePauseProgramUser = (id) => {
  const { uid } = firebase.auth().currentUser;
  if (uid) firebase.database().ref(`userdata/${uid}/pausePrograms/${id}`).set(null);
};

const setUid = (uid, lastUid, dispatch, method = "") => {
  dispatch(updateAuthStatus({
    uid
  })); // Stop storing uid for security reasons

  if (uid) {
    dispatch(updateAuthStatus({
      lastUid: uid
    })); // Stop storing uid for security reasons
    retrieveProgram(dispatch, uid);
    retrieveScheduleData(dispatch, uid);
    firebase
      .database()
      .ref(`userdata/${uid}`)
      .keepSynced(true);
    firebase
      .database()
      .ref(`userdata/${uid}/profile`)
      .on("value", (profileSnapshot) => downloadProfile(dispatch, profileSnapshot));

    firebase.analytics().setUserId(uid);
    firebase.analytics().logEvent("login", { method }); // predefined Firebase Analytics constant
  } else {
    if (lastUid) {
      firebase
        .database()
        .ref(`userdata/${lastUid}`)
        .keepSynced(false);
      firebase
        .database()
        .ref(`userdata/${lastUid}/profile`)
        .off();
      if (method) {
        firebase.analytics().logEvent("logout", { method });
      }
      // when sign out, set store value as true
      dispatch(updateAuthStatus({
        newsletter: true,
        lastUid: null,
        profile: C.DEFAULT_PROFILE,
        isRequesting: "",
        errorMessage: "",
      }));
    }
    firebase.analytics().setUserId(null);
  }
};

const downloadProfile = (dispatch, profileSnapshot) => {
  const profile = profileSnapshot.val();
  const profileString = JSON.stringify(profile);
  if (profile && profile.uid && profileString !== thisProfileString) {
    if (!thisProfileString) {
      setAnalyticsProperties(profile);
    }
    downloadProfileAction(dispatch, profile);
    thisProfileString = profileString;
    if (profile.utcOffset !== moment().utcOffset()) {
      uploadProfile(profile.uid, { utcOffset: moment().utcOffset() });
    }
  }
};

const downloadProfileAction = (dispatch, profile) => {
  console.log("download profile:", profile);
  dispatch(updateAuthStatus({
    profile: { ...C.DEFAULT_PROFILE, ...profile },
    // when sign in, set store value as true if there is newsletter value in profile
    newsletter: (profile.newsletter === true || profile.newsletter === false)
  }));

  dispatch({
    type: GLOBAL_BREAST_TYPE,
    payload: { breastType: profile.breastType || C.BREAST_TYPE.left }
  });
};

export const uploadProfile = async (uid, profile) => {
  try {
    await firebase
      .database()
      .ref(`userdata/${uid}/profile`)
      .update(profile);
    setAnalyticsProperties(profile);
  } catch (error) {
    try {
      firebase.analytics.logEvent("Error", {
        message: error.message,
        type: "UpdateProfileError"
      });
    } catch (e) {
      //
    }
  }
};

const setAnalyticsProperties = (profile) => {
  Object.keys(profile).map((property) => {
    const value = profile[property];
    if (Array.isArray(value)) {
      firebase
        .analytics()
        .setUserProperty(
          `count${property[0].toUpperCase() + property.substring(1)}`,
          String(value.length)
        );
    } else if (typeof value === "object") {
      firebase
        .analytics()
        .setUserProperty(
          `has${property[0].toUpperCase() + property.substring(1)}`,
          String(value ? 1 : 0)
        );
    } else if (typeof value === "boolean") {
      firebase.analytics().setUserProperty(property, String(value ? 1 : 0));
    } else {
      firebase.analytics().setUserProperty(property, String(value));
    }
  });
};

export const setMeasureUnit = (measureUnit) => {
  return (dispatch, getState) => {
    const { profile, uid } = getState().auth;
    profile.measureUnit = measureUnit;
    dispatch(updateAuthStatus({
      profile,
    }));
    if (uid) {
      uploadProfile(uid, { measureUnit });
    }
  };
};

export const setDefaultSessionType = (defaultSessionType = "pump") => {
  return (dispatch, getState) => {
    const { profile, uid } = getState().auth;
    profile.defaultSessionType = defaultSessionType;
    dispatch(updateAuthStatus({
      profile,
    }));
    if (uid) {
      uploadProfile(uid, { defaultSessionType });
    }
  };
};

export const setNotificationsAllowed = (notificationsAllowed, pushUserVal = null) => {
  if (notificationsAllowed === null) {
    return {
      type: UPDATE_NOTIFICATIONS_ALLOWED,
      payload: pushUserVal.notificationsAllowed
    };
  }

  const { uid } = firebase.auth().currentUser;

  if (uid) {
    firebase.database().ref(`pushNotif/userData/${uid}`)
      .update({ notificationsAllowed });
  }
};

export const setDisplayName = (displayName) => {
  return (dispatch, getState) => {
    const { profile, uid } = getState().auth;
    profile.displayName = displayName;
    dispatch(updateAuthStatus({
      profile,
    }));
    if (uid) {
      uploadProfile(uid, { displayName });
    }
  };
};

export const setPictureUrl = (pictureUrl) => {
  return (dispatch, getState) => {
    const { profile, uid } = getState().auth;
    profile.pictureUrl = pictureUrl;
    dispatch(updateAuthStatus({
      profile,
    }));
    if (uid) {
      uploadProfile(uid, { pictureUrl });
    }
  };
};

export const setDefaultManualSettings = (manualSettings) => {
  return (dispatch, getState) => {
    const { profile, uid } = getState().auth;
    profile.manualSettings = manualSettings;
    dispatch(updateAuthStatus({
      profile,
    }));
    if (uid) {
      uploadProfile(uid, { manualSettings });
    }
  };
};

export const setProgramsPosition = (programsPosition) => {
  return (dispatch, getState) => {
    const { profile, uid } = getState().auth;
    profile.programsPosition = programsPosition;
    dispatch(updateAuthStatus({
      profile,
    }));
    if (uid) {
      uploadProfile(uid, { programsPosition });
    }
  };
};

export const apiLogout = () => {
  return async (dispatch) => {
    await Keychain.resetGenericPassword();
    dispatch({
      type: API_AUTH,
      payload: {
        accessToken: null,
        authenticated: false
      }
    });
  };
};

export const resetPassword = () => {
  return (dispatch, getState) => {
    const auth = firebase.auth();
    const { email } = getState().auth.profile;
    auth.sendPasswordResetEmail(email).then(() => {
      firebase.analytics().logEvent("reset_password_sent");
      dispatch(addMessage(M.RESET_LINK_SENT));
    }).catch((error) => {
      console.log(error);
      dispatch(addMessage(M.SOMETHING_WRONG));
    });
  };
};

export const signOut = () => {
  return (dispatch, getState) => {
    const { lastUid } = getState().auth;
    const user = firebase.auth().currentUser;

    setUid(0, lastUid, dispatch, "signout");
    removeFCMToken(user.uid, false);
    firebase.auth().signOut();
    dispatch(pumpDisconnectFromSignOut());
    dispatch(userLogOut(user.uid));
    RootNavigation.replace("TourStart");
  };
};

export const deleteAccount = (navigation) => {
  return (dispatch) => {
    try {
      const user = firebase.auth().currentUser;
      const { uid } = user;

      removeFCMToken(uid, true);

      firebase.database().ref(`userdata/${uid}`).remove()
        .then(() => {
          user.delete().then(() => {
            dispatch(pumpDisconnectFromSignOut());
            dispatch(userLogOut(uid));
            dispatch(addMessage(M.USER_DELETE_SUCCESS));
            navigation.replace("TourStart");
          }, (error) => {
            dispatch(addMessage(error.message));
          });
        })
        .catch((error) => {
          dispatch(addMessage(error.message));
        });
    } catch (e) {
      dispatch(addMessage(M.SOMETHING_WRONG));
    }
  };
};

const createUserProfile = async (user, additionalUserInfo, extraData = {}) => {
  console.log(user.uid, "creating profile", additionalUserInfo);
  const ref = firebase.database().ref(`userdata/${user.uid}`);
  await new Promise((resolve) => ref.on("value", resolve)); // COMBAK: Should be ref.once?
  const profile = {
    ...C.DEFAULT_PROFILE,
    uid: user.uid,
    utcOffset: moment().utcOffset(),
    displayName:
      (additionalUserInfo.profile && additionalUserInfo.profile.name)
      || user.displayName || "",
    email:
      (additionalUserInfo.profile && additionalUserInfo.profile.email)
      || user.email || "",
    ...extraData
  };

  const userdata = {
    profile
  };

  await ref.set(userdata);
  firebase.analytics().logEvent("account_created");
};

const signInWithEmail = (email, password, dispatch, nav, lastUid) => {
  console.log("signInWithEmail:", email);
  firebase
    .auth()
    .signInWithEmailAndPassword(email, password)
    .then(({ user }) => {
      dispatch(checkForStoredProgramImages(user.uid));
      dispatch(checkForProgramDynamicLink());
      setUid(user.uid, lastUid, dispatch, "signin_email");
      dispatch(requestUserNotifPermission());
      dispatch(setRequesting(""));
      nav.navigate("Tabs");
    })
    .catch((e) => {
      console.log(e.code, "signin error:", e);
      firebase
        .analytics()
        .logEvent("email_signin_error", e);
      let errorMessage;
      if (e.code && e.code.indexOf("auth/") >= 0) {
        if (e.code === "auth/user-not-found") {
          errorMessage = M.USER_NOT_FOUND_ERROR;
        } else if (e.code === "auth/wrong-password") {
          errorMessage = M.SIGN_ERROR_WRONG_PASS;
        } else if (e.code === "auth/too-many-requests") {
          errorMessage = M.TOO_MANY_REQUEST;
        } else {
          errorMessage = e.message;
        }
      } else {
        errorMessage = M.AUTH_ERROR;
      }
      dispatch(addMessage(errorMessage));
    });
};

const signUpWithEmail = async (
  email, password, displayName, dispatch, nav, lastUid, receiveNewsletters
) => {
  try {
    const {
      user,
      additionalUserInfo
    } = await firebase
      .auth()
      .createUserWithEmailAndPassword(email, password);
    dispatch(setRequesting(""));
    if (user && additionalUserInfo && additionalUserInfo.isNewUser) {
      const extraData = {
        displayName,
        newsletter: !!receiveNewsletters
      };
      createUserProfile(user, additionalUserInfo, extraData);
      if (receiveNewsletters) {
        dispatch(createKlaviyoProfile(email, displayName));
      }
      dispatch(checkForProgramDynamicLink());
      setUid(user.uid, lastUid, dispatch, "signup_email");
      dispatch(requestUserNotifPermission());
      // when sign up, set store value as true
      dispatch(updateAuthStatus({
        newsletter: true
      }));
      nav.navigate("Schedule", { fromSignup: true });
    }
  } catch (e) {
    console.log(e.code, "signup error:", e);
    firebase
      .analytics()
      .logEvent("email_signup_error", e);
    let errorMessage;
    if (e.code && e.code.indexOf("auth/") >= 0) {
      if (e.code === "auth/email-already-in-use") {
        errorMessage = M.SIGN_ERROR_DUPLICATE_MAIL;
      } else if (e.code === "auth/too-many-requests") {
        errorMessage = M.TOO_MANY_REQUEST;
      } else {
        errorMessage = e.message;
      }
    } else {
      errorMessage = M.AUTH_ERROR;
    }
    dispatch(addMessage(errorMessage));
  }
};

export const createKlaviyoProfile = (email, displayName, showNotification = false) => {
  return (dispatch) => {
    const { firstName, lastName } = getFirstAndLastName(displayName);
    const profile = {
      data: {
        type: "profile",
        attributes: {
          email,
          first_name: firstName,
          last_name: lastName,
        }
      }
    };
    createProfile(profile).then((response) => {
      console.log("created klaviyo profile:", response);
      const profile1 = {
        data: [
          {
            type: "profile",
            id: response?.data?.id,
          }
        ]
      };
      addProfileToList(profile1).then((response) => {
        console.log("added profile to list:", response);
        if (showNotification) {
          dispatch(addMessage(M.SUBSCRIBED_SUCCESSFULLY));
        }
      });
    }).catch((error) => {
      if (error?.response?.status === 409) {
        dispatch(addMessage(M.ALREADY_SUBSCRIBED));
      }
    });
  };
};

export const saveNewsletterValue = (value) => {
  const { uid } = firebase.auth().currentUser;
  if (uid) {
    firebase.database().ref(`userdata/${uid}/profile`).update({ newsletter: value });
  }
};

const checkForProgramDynamicLink = () => {
  return (dispatch) => {
    AsyncStorage.getItem(C.importProgramLink)
      .then((val) => {
        if (val) {
          dispatch(importProgram(val));
        }
      });
  };
};

export function signWithEmail(
  {
    displayName = "",
    email = "",
    password = "",
    termsAccepted = false,
    receiveNewsletters = false,
    routeName = ""
  },
  nav
) {
  const isSignUp = routeName === "SignUp";

  return function (dispatch, getState) {
    const { lastUid } = getState().auth;
    const { programs } = getState().pump;

    // To update programs in store if pumpInit() is not called
    if (isEmpty(programs)) { // COMBAK: Shared function with pumpInit in Pump Actions,
      // also better in auth changed listener AFTER signing in only
      AsyncStorage.getItem(STORAGE_PROGRAMS).then((lprograms) => {
        if (lprograms) { // COMBAK: Shared function with pumpInit in Pump Actions
          const newPrograms = {};
          console.log("init store programs:", lprograms);
          const parsed = JSON.parse(lprograms);
          Object.keys(parsed).filter((k) => k).forEach((k) => {
            if (k !== null && parsed[k] && !isEmpty(parsed[k])) {
              newPrograms[k] = parsed[k];
            }
          });
          dispatch(updatePumpStatus({
            programs: newPrograms
          }));
        }
      });
    }

    if (isSignUp && !displayName) {
      dispatch(addMessage(M.SIGN_ERROR_NAME));
    } else if (!isValidEmail(email)) {
      dispatch(addMessage(M.SIGN_ERROR_MAIL));
    } else if (!isValidPassword(password)) {
      dispatch(addMessage(M.SIGN_ERROR_PASS));
    } else if (isSignUp && !termsAccepted) {
      dispatch(addMessage(M.SIGN_ERROR_TOS));
    } else {
      setTimeout(() => {
        if (isSignUp) {
          signUpWithEmail(email, password, displayName, dispatch, nav, lastUid, receiveNewsletters);
        } else {
          signInWithEmail(email, password, dispatch, nav, lastUid);
        }
      }, 150);
    }
  };
}

export const forgotPassword = ({ email = "" }) => {
  return (dispatch) => {
    if (!email) {
      dispatch(addMessage(M.RESET_PWD_EMPTY_MAIL));
    } else if (!isValidEmail(email)) {
      dispatch(addMessage(M.SIGN_ERROR_MAIL));
    } else {
      firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
          dispatch(addMessage(M.RESET_PWD_SUCCESS));
        })
        .catch((e) => {
          if (e.toString().indexOf("no user record") > -1) {
            dispatch(addMessage(M.USER_NOT_FOUND_ERROR));
          } else {
            dispatch(addMessage(M.RESET_PWD_ERROR));
          }
        });
    }
  };
};

export const submitFeedback = (message, type) => {
  return (dispatch) => {
    const { uid, email } = firebase.auth().currentUser;
    const { key } = firebase.database().ref(C.FRB_USER_REQUESTS).push();
    const { appVersion, buildVersion, bundleIdentifier } = VersionNumber;

    const data = {
      key,
      uid,
      email,
      type: type || "request",
      message,
      appVersion,
      buildVersion,
      bundleIdentifier,
      model: getModel(),
      os: `${Platform.OS} ${getSystemVersion()}`,
      createdAt: Date.now()
    };

    try {
      firebase.database()
        .ref(`${C.FRB_USER_REQUESTS}/${key}`)
        .update(data);
      dispatch(addMessage(M.THANK_YOU_FEEDBACK));
      firebase.analytics().logEvent("request_sent");
    } catch (e) {
      dispatch(addMessage(M.SOMETHING_WRONG));
    }
  };
};

const retrieveScheduleData = (dispatch, uid) => {
  firebase.database().ref(`userdata/${uid}/schedule`).on("value", (snapshot) => {
    const events = snapshot.val() || {};
    const eventsUpdatedAt = Date.now();
    dispatch(updateScheduleEvents({
      events,
      eventsUpdatedAt
    }, false));
  });
};

const retrieveProgram = (dispatch, uid) => {
  uid && firebase.database().ref(`userdata/${uid}/programs`).on("value", (snapshot) => updateProgram(snapshot, dispatch));
  uid && firebase.database().ref(`userdata/${uid}/pausePrograms`).on("value", (snapshot) => updatePauseProgram(snapshot, dispatch));
};

const updateProgram = (snapshot, dispatch) => {
  const programData = snapshot.val();
  const programs = { ...programData };
  console.log("defaul programs", programs);
  dispatch(updatePrograms(programs));
  // dispatch(updateAuthStatus({
  //   programs,
  // }));
};

const updatePauseProgram = (snapshot, dispatch) => {
  const programData = snapshot.val();
  if (!programData) return;
  const pausePrograms = {};
  Object.keys(programData).forEach((key) => {
    const program = programData[key];

    if (program) {
      const temp = {};
      Object.keys(program).forEach((key1) => {
        if (key1 !== null && program[key1]) {
          temp[key1] = program[key1];
        }
      });
      pausePrograms[key] = temp;
    }
  });
  console.log("pause+programs", pausePrograms);
  dispatch(updatePausePrograms(pausePrograms));
  // dispatch(updateAuthStatus({
  //   pausePrograms,
  // }));
};

const userLogOut = (uid) => {
  return (dispatch, getState) => {
    let { programs } = getState().pump;

    programs = Object.keys(programs)
      .sort().map((k) => programs[k]);

    thisProfileString = "";
    // Clear storage on sign out and preserve sign in remember me
    AsyncStorage.getItem(REMEMBER_ME).then((rememberMeAuth) => {
      AsyncStorage.getItem(LAST_PLAY_MODE_STORED).then((lastPlayMode) => {
        AsyncStorage.getItem(KEY_USER_TUTORIAL).then((tutorial) => {
          let picImgObj = { [uid]: {} };
          programs.map(async (x) => {
            const value = await AsyncStorage.getItem(`programRunImage${x.id}`);

            if (value !== null) {
              picImgObj[uid][`programRunImage${x.id}`] = value;
            }
          });
          AsyncStorage.getItem(STORAGE_PROGRAM_IMAGES).then((val) => {
            if (val) {
              picImgObj = { ...JSON.parse(val), ...picImgObj };
            }

            AsyncStorage.clear().then(() => {
              AsyncStorage.setItem(STORAGE_PROGRAM_IMAGES, JSON.stringify(picImgObj));

              if (rememberMeAuth) {
                AsyncStorage.setItem(REMEMBER_ME, rememberMeAuth);
              }

              if (lastPlayMode) {
                AsyncStorage.setItem(LAST_PLAY_MODE_STORED, lastPlayMode);
              }

              if (tutorial === "true") {
                AsyncStorage.setItem(KEY_USER_TUTORIAL, tutorial);
              }

              // to restore two programs
              const programs = {};
              programs[amberProgram.id] = amberProgram;
              programs[program1Default.id] = program1Default;
              AsyncStorage.setItem(STORAGE_PROGRAMS, JSON.stringify(programs));
              AsyncStorage.removeItem(DEFAULT_PROGRAM_DELETED);
            });
          });
        });
      });
    });

    dispatch({
      type: LOGGED_OUT
    });
  };
};
