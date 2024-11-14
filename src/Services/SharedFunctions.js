/* eslint-disable no-extend-native */
import { Platform, Dimensions } from "react-native";
import firebase from "@react-native-firebase/app";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  PROGRAM_LIBRARY_BODY, PUMPING_TAGS, PUMP_DEVICE,
  PUMP_TYPE, IN_DST, OUT_DST,
  SG2_SHORT_BLE_SERVICE_COMMUNICATION
} from "../Config/constants";
import { Colors, Images } from "../Themes";
import {
  KEY_USER_TUTORIAL, LAST_STASH_ALERT_DATE, MILK_STASH_TUTORIAL, STORAGE_PROGRAM_PAUSE
} from "../Config/LocalStorage";
import ApiRatings from "../Http/Ratings";

const { width, height } = Dimensions.get("window");

export const appWidth = width;
export const appHeight = height;

export const addSessionDataArr = [
  {
    titl: "Manually", icon: "edit", iconColor: Colors.tertiary, key: "manual"
  },
  {
    titl: "Using timer", icon: "timer", iconColor: Colors.lightBlue, key: "record"
  },
  {
    titl: "Using SuperGenie", image: Images.tabSuperGenieOn, key: "genie"
  }
];

export const playModeDataArr = [
  {
    titl: "A Program", image: Images.tabSuperGenieOn, key: "program"
  },
  {
    titl: "Manual Mode", image: Images.manualMode, key: "manual"
  },
];

export const isEmpty = (obj) => (Object.keys(obj).length === 0 && obj.constructor === Object);

/**
 * Recalculate size based on screen resolution
 */
export const size = (sizee) => {
  let normalWidth;
  if (Platform.OS === "ios") {
    normalWidth = Platform.isPad ? 768 : 375;
  } else if (Platform.OS === "android") {
    normalWidth = 411;
  }
  const ratio = normalWidth / width;

  return Math.ceil(sizee / ratio);
};

export const isValidPassword = (value) => {
  return value.length > 5;
};

export const isValidEmail = (value) => {
  const regex = /\S+@\S+\.\S+/;
  return regex.test(value);
};

export const filterLogs = (logList) => {
  if (logList && logList.slice()) {
    return logList.filter((x) => x.type !== "stash"); // Remove stash from logs
  }

  return [];
};

export const uuidv4 = () => {
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    // eslint-disable-next-line no-bitwise
    const r = Math.random() * 16 | 0;
    // eslint-disable-next-line no-bitwise, no-mixed-operators
    const v = c === "x" ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

/**
 * Convert decimal to binary
 * 5 -> 0101, 8 -> 1000
 */
export const dec2bin4 = (dec) => {
  // eslint-disable-next-line no-bitwise
  const binValue = (dec >>> 0).toString(2);
  const result = (`0000${parseInt(binValue, 10).toString()}`).slice(-4);
  return result;
};

export const dec2bin8 = (dec) => {
  // eslint-disable-next-line no-bitwise
  const binValue = (dec >>> 0).toString(2);
  const result = (`00000000${parseInt(binValue, 10).toString()}`).slice(-8);
  return result;
};

export const appToPumpCycle = (cycle) => {
  if (cycle <= 72) {
    return (cycle - 38) / 2;
  }
  return (cycle - 4) / 4;
};

export const pumpToAppCycle = (cycle) => {
  if (cycle <= 17) {
    return (2 * cycle) + 38;
  }
  return (4 * cycle) + 4;
};

export const findTitle = (source, key, shortTitle = false) => {
  const found = source.find((e) => e.key === key);
  return (
    shortTitle ? (found && found.shortTitle)
      : (found && found.titl)
  );
};

export const stopProgramPayload = () => {
  return {
    timer: null,
    playingProgram: false,
  };
};

export const isGen2Pump = (name) => {
  const {
    SG2, GG2
  } = PUMP_DEVICE;
  return (name === SG2 || name === GG2);
};

export const isNumeric = (str) => {
  if (typeof str !== "string") return false;
  return !isNaN(str) && !isNaN(parseFloat(str)); // Ensure strings of whitespace fail
};

export const checkNavigateForPlayOption = (
  prevPlayOptions,
  setPrevPlayOptionSelected,
  navigation,
  goBack
) => {
  // Right now only need check for Manual, standard flow is GenieHome
  // in case of new option on the button need to add over here
  if (prevPlayOptions === "manual") {
    // Disabling feature for now
    // navigation.navigate("ManualRun", { type: "manual", prevPlayOptions });
    setPrevPlayOptionSelected("");
  }

  if (goBack) {
    navigation.pop();
  } else {
    navigation.navigate("Tabs");
  }
};

export const getUserFinishedStashTutorial = async () => {
  try {
    const val = await AsyncStorage.getItem(MILK_STASH_TUTORIAL);
    if (val && val === "true") {
      return true;
    }
    return false;
  } catch (e) {
    return true;
  }
};

export const getUserFinishedTutorial = async () => {
  try {
    const val = await AsyncStorage.getItem(KEY_USER_TUTORIAL);
    if (val && val === "true") {
      return true;
    }
    return false;
  } catch (e) {
    return false;
  }
};

export const setUserFinishedTutorial = (val) => {
  if (val && val === true) {
    AsyncStorage.setItem(KEY_USER_TUTORIAL, "true");
  } else {
    AsyncStorage.setItem(KEY_USER_TUTORIAL, "false");
  }
};

export const setUserFinishedStashTutorial = (val) => {
  if (val === true) {
    AsyncStorage.setItem(MILK_STASH_TUTORIAL, "true");
  } else {
    AsyncStorage.setItem(MILK_STASH_TUTORIAL, "false");
  }
};

export const formatAPIPrograms = (programs) => {
  for (let i = 0; i < programs.length; i++) {
    let totalDuration = 0;

    for (let x = 0; x < programs[i].steps.length; x++) {
      totalDuration += programs[i].steps[x].duration;
    }

    for (let x = 0; x < programs[i].pauseSteps.length; x++) {
      totalDuration += programs[i].pauseSteps[x].duration;
    }

    programs[i].totalDuration = totalDuration;
  }

  return programs;
};

// Adds index to the steps based on the *current*
// step position if index does not already exist
export const addIndexToStepsIfMissing = (steps) => {
  if (steps.length > 0) {
    const hasIndexProp = Object.prototype.hasOwnProperty.call(steps[0], "index");

    if (!hasIndexProp || (typeof steps[0].index !== "number")) {
      for (let i = 0; i < steps.length; i++) {
        steps[i].index = i;
      }
    }
  }

  return steps;
};

// Adds originalIndex for later pause step addition
export const addOriginalIndex = (currentProgram) => {
  if (currentProgram.steps.length > 1) {
    // Removes any(1) extra empty program step
    const lastIndex = currentProgram.steps.length - 1;
    if (currentProgram.steps[lastIndex].duration === 0
      && currentProgram.steps[lastIndex - 1].duration === 0) {
      currentProgram.steps.splice(lastIndex, 1);
    }
  }

  // Dissociate from currentProgram object
  const currentProgramSteps = [];
  currentProgram.steps.forEach((x) => {
    currentProgramSteps.push({ ...x });
  });

  // Adds originalIndex for later pause step addition
  for (let i = 0; i < currentProgramSteps.length; i++) {
    currentProgramSteps[i].originalIndex = currentProgramSteps[i].index;
  }

  return currentProgramSteps;
};

export const convertPLTags = (plTags) => {
  const tagsArr = [];

  for (let i = 0; i < plTags.length; i++) {
    const indexOfTag = PUMPING_TAGS.map((e) => e.id).indexOf(plTags[i]);
    tagsArr.push(PUMPING_TAGS[indexOfTag]);
  }

  return tagsArr;
};

export const formatPLToProgram = (id, plProgram) => {
  const program = {
    id,
    programLibraryId: plProgram.id,
    name: plProgram.name,
    pumpName: plProgram.pumpName,
    description: plProgram.description,
    tags: plProgram.tags,
    steps: plProgram.steps
  };

  return program;
};

export const formatProgramSelectionData = (item, data) => {
  return item.pumpName === PUMP_DEVICE.GG2
    ? data.filter((x) => x.key !== 1)
    : data;
};

export const formatToAPIPauseSteps = (programId, pauseObj) => {
  const pauseSteps = [];
  if (pauseObj) {
    Object.keys(pauseObj[programId]).forEach((key) => {
      pauseSteps.push({
        index: JSON.parse(key),
        duration: pauseObj[programId][key].duration
      });
    });
  }
  return pauseSteps;
};

export const shareToPlBody = (item, description, selectedTags, pauseSteps, userDisplayName) => {
  const programBody = {
    ...PROGRAM_LIBRARY_BODY,
    userUUID: firebase.auth().currentUser.uid,
    name: item.name,
    description,
    pumpName: item.pumpName || PUMP_TYPE[0].key,
    tags: selectedTags,
    steps: addIndexToStepsIfMissing(item.steps),
    pauseSteps,
    creatorName: userDisplayName || "",
  };

  return programBody;
};

export const getPauseObj = (currentProgram) => {
  return new Promise((resolve) => {
    let pauseObj = null;

    AsyncStorage.getItem(STORAGE_PROGRAM_PAUSE).then((val) => {
      if (val) {
        const newVal = JSON.parse(val);
        // If pause exists in current program
        if (Object.prototype.hasOwnProperty.call(newVal, currentProgram.id)) {
          // Add to steps
          pauseObj = { [currentProgram.id]: newVal[currentProgram.id] };
        }
      }
      resolve(pauseObj);
    });
  });
};

export const checkUniqueProgramName = (programs, currentProgram) => {
  // eslint-disable-next-line no-unused-vars, no-restricted-syntax
  for (const key of Object.keys(programs)) {
    if (programs[key].name === currentProgram.name) {
      return false;
    }
  }
  return currentProgram;
};

// Makes sure program name is unique, returns program
export const correctProgramName = (programs, currentProgram) => {
  const programName = currentProgram.name;
  let gottenUniqueName = false;
  let nameAppend = 1;

  while (!gottenUniqueName) {
    const program = checkUniqueProgramName(programs, currentProgram);

    if (program) {
      gottenUniqueName = true;
      return program;
    }

    currentProgram.name = `${programName}(${nameAppend})`;

    nameAppend += 1;
  }
};

export const checkIfToDisplayPlReviewModal = (program) => {
  return new Promise((resolve) => {
    const { uid } = firebase.auth().currentUser;
    const { programLibraryId } = program;

    if (programLibraryId) {
      const askedToLeaveProgramReviewRef = firebase.database().ref(`userdata/${uid}/askedToLeaveProgramReview/${programLibraryId}`);

      askedToLeaveProgramReviewRef.once("value", (snapshot) => {
        const val = snapshot.val();

        if (val) {
          resolve(false);
        } else {
          ApiRatings.retrieveRatings(`?programId=${programLibraryId}&userUUID=${uid}`)
            .then(({ results }) => {
              const hasLeftARating = results?.length > 0;

              if (hasLeftARating) {
                resolve(false);
              } else {
                resolve(true);
                askedToLeaveProgramReviewRef.update({ leftAt: Date.now() });
              }
            }).catch(() => resolve(false));
        }
      });
    } else {
      resolve(false);
    }
  });
};

export const checkIfUserIsInDST = () => {
  Date.prototype.stdTimezoneOffset = function () {
    const jan = new Date(this.getFullYear(), 0, 1);
    const jul = new Date(this.getFullYear(), 6, 1);

    return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
  };

  Date.prototype.isDstObserved = function () {
    return this.getTimezoneOffset() < this.stdTimezoneOffset();
  };

  const today = new Date();

  if (today.isDstObserved()) {
    return IN_DST;
  }

  return OUT_DST;
};

export const checkUserDSTSettings = () => {
  return new Promise((resolve) => {
    const { uid } = firebase.auth().currentUser;

    const fbRef = firebase.database().ref(`userdata/${uid}/dstSettings`);

    const inDST = checkIfUserIsInDST();

    fbRef.once("value", (snapshot) => {
      const val = snapshot.val();

      if (!val) {
        // Don't alter schedules if it's the first time running
        resolve(null);
        fbRef.update({ dstSettings: inDST });
      } else if (val.dstSettings !== inDST) {
        // Update Firebase regardless of the user's decision
        fbRef.update({ dstSettings: inDST });

        resolve(inDST);
      } else {
        // DST has been unchanged
        resolve(null);
      }
    });
  });
};

export const addSubtractHourFromDate = (date, hourVal) => {
  Date.prototype.addSubHours = function (h) {
    this.setTime(this.getTime() + (h * 60 * 60 * 1000));
    return this;
  };

  return new Date(date).addSubHours(hourVal).getTime();
};

export const getCorrectDuration = (dataObj) => {
  // Manual logs duration is always 0, recording has a value
  return dataObj.duration || dataObj.totalDuration;
};

export const getFullDate = (date) => {
  const day = new Date(date).getDate();
  return day < 10 ? `0${day}` : day;
};

export const getFullMonth = (date) => {
  const month = new Date(date).getMonth() + 1;
  return month < 10 ? `0${month}` : month;
};

export const getHourMinSec = (dur) => {
  if (!dur) return "0h 0m 0s";

  const hour = dur / 60 / 60;
  const hourWhole = Math.trunc(hour);
  const minute = (hour % 1) * 60;
  const minuteWhole = Math.trunc(minute);
  const secondsWhole = Math.trunc((minute % 1) * 60);

  return `${hourWhole}h ${minuteWhole}m ${secondsWhole}s`;
};

export const convertImagePickerResToDocPicker = (res) => {
  const newObj = {};

  newObj.fileCopyUri = res.path;
  newObj.uri = res.path;
  newObj.size = res.size;
  newObj.name = res.filename;
  newObj.type = res.mime;

  return newObj;
};

export const getSetStashAlertStatus = async (reset = false) => {
  try {
    const lastAlertDate = await AsyncStorage.getItem(LAST_STASH_ALERT_DATE);
    const currentDate = new Date().toISOString().split("T")[0];

    if (lastAlertDate !== currentDate) {
      if (reset) {
        await AsyncStorage.setItem(LAST_STASH_ALERT_DATE, currentDate);
      }
      return true;
    }
    return false;
  } catch (error) {
    return false;
  }
};

export const isSG2Pump = (serviceUUIDs) => {
  if (
    serviceUUIDs && serviceUUIDs.indexOf(SG2_SHORT_BLE_SERVICE_COMMUNICATION)
      > -1
  ) {
    return true;
  }
  return false;
};

export const getFirstAndLastName = (fullName) => {
  const nameParts = fullName.trim().split(/\s+/);
  if (nameParts.length === 1) {
    return {
      firstName: nameParts[0],
      lastName: ""
    };
  }

  return {
    firstName: nameParts[0],
    lastName: nameParts[nameParts.length - 1]
  };
};
