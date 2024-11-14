import firebase from "@react-native-firebase/app";

import { SUBSCRIBE_TO_GOALS, RESET_GOALS } from "../Types";

const getRef = (uid, path = "") => firebase.database().ref(`userdata/${uid}/goals/${path}`);

export const subscribeToGoals = (uid) => {
  return (dispatch) => {
    getRef(uid).on("value", (snapshot) => {
      dispatch({
        type: SUBSCRIBE_TO_GOALS,
        payload: {
          list: snapshot.val() || {},
          listUpdatedAt: Date.now()
        }
      });
    });
  };
};

export const resetGoalSubscription = () => {
  return (dispatch) => {
    // getRef().off();
    dispatch({
      type: RESET_GOALS,
      payload: {
        listUpdatedAt: 0,
        list: {}
      }
    });
  };
};

export const saveGoals = (key, volume) => {
  return (dispatch, getState) => {
    const { list } = getState().goals;

    list[key] = {
      key,
      volume,
      startedAt: Date.now()
    };

    const { uid } = firebase.auth().currentUser;
    getRef(uid, key).set(list[key]);
    firebase.analytics().logEvent("goal_saved");
  };
};
