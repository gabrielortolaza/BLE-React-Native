/* eslint-disable no-unused-vars */
import { Platform, PermissionsAndroid } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firebase from "@react-native-firebase/app";
import notifee from "@notifee/react-native";
import * as RNFS from "react-native-fs";
import { NordicDFU, DFUEmitter } from "react-native-nordic-dfu";
import Geolocation from "@react-native-community/geolocation";
import {
  check, openSettings, PERMISSIONS,
  RESULTS
} from "react-native-permissions";
import branch from "react-native-branch";
import _ from "lodash";
import Share from "react-native-share";

import {
  removeListeners as BLERemoveListeners, addListener as BLEAddListener,
  checkState as BLECheckState, start as BLEStart, retrieveServices as BLERetrieveServices,
  startNotification as BLEStartNotification, getConnectedPeripherals as BLEGetConnectedPeripherals,
  scan as BLEScan, connect as BLEConnect, disconnect as BLEDisconnect,
  writeWithoutResponse as BLEWriteWithoutResponse, write as BLEWrite, read as BLERead,
  readRSSI, handleAndroidBlePermissions
} from "../Services/BLE";
import * as C from "../Config/constants";
import {
  createPacket, parsePacket, parsePumpStatusChar1,
  parsePumpStatusChar2, parsePumpStatusChar6, parsePumpStatusChar3
} from "../Services/packets";
import {
  LETDOWN, program1Default, amberProgram,
  MODES
} from "../Config/Modes";
import {
  isEmpty, isGen2Pump, appToPumpCycle,
  uuidv4, correctProgramName, isSG2Pump
} from "../Services/SharedFunctions";
import { addMessage, setRequesting } from "./Status";
import {
  saveProgramUser, deleteProgramUser, deletePauseProgramUser, saveBulkProgramUser
} from "./Auth";
import { startPairing } from "../App/RootNavigation";
import {
  UPDATE_PUMP_STATUS, INITIAL_PROGRAM_STATE, PROGRAM_FROM_PUMP,
  SET_UP_PROGRAM, STOP_SESSION, UPDATE_PROGRAM_STATE,
  UPDATE_PROGRAM_TIMER, PUMP_TICK_TOCK, SET_CURRENT_PROGRAM,
  SET_CURRENT_SESSION, SET_CYCLE_INDEX, SET_VACUUM_INDEX,
  SPLIT_PROGRAM_STEP, SAVE_CHANGED_PROGRAM, SAVING_PROGRAM,
  DELETE_PROGRAM, UPDATE_CHANGED_PROGRAM, PUMP_DISCONNECTED,
  CLEAN_PROGRAM_UNMOUNT, UPDATE_PERIPHERALS, FW_UPDATE,
  UPDATE_APP_STATE, UPDATE_PUMP_RSSI, WATCHING_LOCATION,
  PROGRAM_RECONNECTED, UPDATE_PUMP_NAME
} from "../Types";
import * as M from "../Config/messages";
import {
  DEFAULT_PROGRAM_DELETED, LOCATION_PERMISSION, REMEMBER_DEVICE_ID,
  STORAGE_PROGRAMS, STORAGE_PROGRAM_IMAGES, STORAGE_PROGRAM_PAUSE,
  CHANGED_AD_PROGRAMS_PUMP_NAME, ADDED_CREATED_ID
} from "../Config/LocalStorage";

const { DISCONNECTED, CONNECTING, CONNECTED } = C.CONNECT_STATUS;

const dfuPath = `${RNFS.DocumentDirectoryPath}/upgrade.zip`;
const pumpProgramStepTime = 500; // Time to give ble libarary to send program steps

let thisPumpDevice = "";
let itIsSG2 = false;
let scanning = false;
let bleState = C.OFF;
let thisConnectedId = null;
let thisConnectStatus = DISCONNECTED;
let isConnectingPeripheral = false;
let rssiTimer = null;
let scanAttemptCount = 0;
// It is used to fix immediate disconect message
// https://app.asana.com/0/1155411277098769/1177549422861035/f

let resumedProgramViaApp = false;
let sessionTimer = null;
let programDisconnectTimer = null;
let programDisconnectCount = 0;
const programDisconnectMaxTime = 30;

let DFUId = null;
let DFUCount = 0;

let geoWatchId = null;

let lastStartProgramTime = 0;

export const pumpInit = () => {
  return (dispatch) => {
    const programs = {};
    console.log("pump init::");
    AsyncStorage.getItem(REMEMBER_DEVICE_ID).then((deviceId) => {
      console.log("found remember device", deviceId);
      if (deviceId) {
        dispatch(updatePumpStatus({
          id: deviceId,
        }));
      }
    });

    AsyncStorage.getItem("programs").then((lprograms) => { // COMBAK: Should query Firebase first and then concat
      if (lprograms) {
        console.log("Got from:", lprograms);
        const parsed = JSON.parse(lprograms);
        Object.keys(parsed).filter((k) => k).forEach((k) => {
          if (k !== null && parsed[k] && !isEmpty(parsed[k])) {
            programs[k] = parsed[k];
          }
        });
        dispatch(updatePumpStatus({
          programs,
        }));
      }
      AsyncStorage.getItem("setAmberProgram").then((setAmberProgram) => {
        if (!setAmberProgram) {
          console.log("get local pp:", programs);
          AsyncStorage.setItem("setAmberProgram", "1");
          programs[amberProgram.id] = JSON.parse(JSON.stringify(amberProgram));

          dispatch(updatePumpStatus({
            programs,
          }));
          AsyncStorage.setItem(STORAGE_PROGRAMS, JSON.stringify(programs));
        }
      });
    });

    AsyncStorage.getItem(DEFAULT_PROGRAM_DELETED).then((val) => {
      if (!val) {
        programs[program1Default.id] = JSON.parse(JSON.stringify(program1Default));
      }

      dispatch(updatePumpStatus({
        programs,
      }));
    });

    // Get location permission status for playing programs
    AsyncStorage.getItem(LOCATION_PERMISSION).then((val) => {
      if (val) {
        dispatch(updatePumpStatus({
          locationEnabled: JSON.parse(val),
        }));
      }
    });
  };
};

const removeImportProgramLink = () => {
  AsyncStorage.removeItem(C.importProgramLink);
};

export const importProgram = (importProgramLink, navigation = null) => {
  return (dispatch, getState) => {
    firebase.analytics().logEvent("Import_program_try");
    const { programs } = getState().pump;

    const user = firebase.auth().currentUser;
    if (!user) {
      AsyncStorage.setItem(C.importProgramLink, importProgramLink);
      dispatch(addMessage(M.LOGIN_DOWNLOAD_PROGRAM));
      return;
    }

    const neewProgramId = newProgramId(programs);

    if (neewProgramId === C.NO_AVAILABLE_PROGRAM_ID) {
      dispatch(addMessage(M.MAX_PROGRAM_ID_REACHED));
      return;
    }

    // Validate link
    if (importProgramLink.substr(0, 5) !== "https") {
      dispatch(addMessage(M.PROGRAM_IMPORT_ERROR));
      removeImportProgramLink();
      return;
    }

    if (importProgramLink.indexOf("Genie%2F") === -1) {
      // If not decoded then decode
      importProgramLink = decodeURIComponent(importProgramLink);
    }

    // If another url has been appended
    const urlStartingFrom = importProgramLink.indexOf("https://firebasestorage");
    importProgramLink = importProgramLink.substr(
      urlStartingFrom, importProgramLink.length
    );

    console.log("Got after decode and url append:", urlStartingFrom, importProgramLink);

    if (importProgramLink.substr(0, 23) !== "https://firebasestorage") {
      dispatch(addMessage(M.PROGRAM_IMPORT_ERROR2));
      removeImportProgramLink();
      return;
    }

    const ref = firebase.storage().refFromURL(importProgramLink);
    console.log(ref);
    const endIndex = ref.path.lastIndexOf(".txt");
    const beginIndex = ref.path.lastIndexOf("%2F", endIndex);
    const uuid = ref.path.slice(beginIndex + 3, endIndex);
    const path = `${RNFS.DocumentDirectoryPath}/${uuid}.txt`;
    console.log(ref, endIndex, beginIndex, uuid);

    const finishImport = (importProgramName) => {
      RNFS.unlink(path)
        .then(() => {
          console.log("FILE DELETED");

          dispatch(addMessage(`Successfully imported ${importProgramName}`));
          firebase.analytics().logEvent("Import_program_success");

          removeImportProgramLink();

          navigation && navigation.navigate("SuperGenie");
        })
        // `unlink` will throw an error, if the item to unlink does not exist
        .catch((err) => {
          console.log(err.message);
          removeImportProgramLink();
        });
    };

    if (!(uuid.length > 0)) {
      // Alert
      removeImportProgramLink();
      return;
    }

    firebase
      .storage()
      .ref(ref.path)
      .writeToFile(
        path
      )
      .then((success) => {
        console.log(success);
        RNFS.readFile(path, "utf8")
          .then((item) => {
            // Validate and save
            const newItem = JSON.parse(item);
            const { pauses } = newItem;
            newItem.id = neewProgramId;
            newItem.imported = true;

            console.log(newItem);

            if (pauses) {
              AsyncStorage.getItem("program-pause").then((val) => {
                const pauseKey = Object.keys(pauses);

                const oldProgramId = pauseKey[0];
                pauses[neewProgramId] = pauses[oldProgramId];
                if (pauseKey[0] !== neewProgramId) { delete pauses[oldProgramId]; }

                const newVal = { ...JSON.parse(val), ...pauses };
                console.log(newVal);

                AsyncStorage.setItem("program-pause", JSON.stringify(newVal)).then(() => {
                  savePauseProgram(neewProgramId, pauses[neewProgramId]);
                  delete newItem.pauses;
                  dispatch(saveProgram(neewProgramId, newItem));
                  finishImport(newItem.name);
                });
              });
            } else {
              dispatch(saveProgram(neewProgramId, newItem));
              finishImport(newItem.name);
            }
          })
          .catch((error) => {
            console.log(error);
            removeImportProgramLink();
          });
      })
      .catch((failure) => {
        console.log(failure);
        dispatch(addMessage(M.PROGRAM_IMPORT_ERROR3));
        removeImportProgramLink();
      });
  };
};

export const updatePumpStatus = (payload) => {
  return {
    type: UPDATE_PUMP_STATUS,
    payload
  };
};

export const updatePumpName = (payload) => {
  return {
    type: UPDATE_PUMP_NAME,
    payload: { pumpDeviceName: payload },
  };
};

/* Actions with device: ----------------------- */
const scan = () => {
  return (dispatch) => {
    console.log("scanning....", scanAttemptCount);

    if (scanning) return;

    scanning = true;
    dispatch(updatePumpStatus({
      scanning: true,
    }));

    BLEScan()
      .then(() => {
        console.log("scan success:");
      }).catch((e) => {
        console.log("scan failed:", e);
        scanning = false;
      });
  };
};

export const connectPump = (id) => {
  return (dispatch, getState) => {
    console.log(`connect:::${id}`);
    const pumpState = getState().pump;
    const { connectStatus, peripherals } = pumpState;

    if (connectStatus === CONNECTING || connectStatus === CONNECTED) return;

    if (!isEmpty(peripherals) && peripherals[id]) {
      thisPumpDevice = peripherals[id].name;
      dispatch(updatePumpStatus({
        pumpDevice: thisPumpDevice
      }));
    }

    itIsSG2 = isSG2Pump(peripherals[id].advertising.serviceUUIDs);

    dispatch(updatePumpStatus({
      connectStatus: CONNECTING,
      isSG2: itIsSG2
    }));

    return BLEConnect(id)
      .then(() => {
        console.log("ble connected...");
      })
      .catch((e) => {
        console.log("connect catch:", e);
        thisConnectStatus = DISCONNECTED;
        dispatch(updatePumpStatus({
          connectStatus: DISCONNECTED,
          isSG2: false
        }));
      });
  };
};

export const disconnect = (triggerSearch = true) => {
  return (dispatch) => {
    BLEDisconnect(thisConnectedId)
      .then(() => {
        thisConnectStatus = DISCONNECTED;

        dispatch(updatePumpStatus({
          triggerSearch,
          connectStatus: DISCONNECTED,
          speed: null,
          strength: null,
          mode: null,
          battery: 0,
          light: C.LIGHT_OFF,
        }));
      })
      .catch((e) => {
        console.log("disconnect catch:", e);
      });
  };
};

export const sendConnectRequest = () => {
  console.log("sendConnectRequest");
  if (thisPumpDevice === C.PUMP_DEVICE.SUPERGENIE) {
    sendPacket(createPacket(C.OP_CONNECT_REQUEST));
  } else if (isGen2Pump(thisPumpDevice)) {
    sendPacket([0, 0, 0, 0, 0, 100, 0, 0], C.SG2_CHARACTERISTIC6);
  }
};

export const pumpDisconnectFromSignOut = () => {
  return (dispatch, getState) => {
    const pumpState = getState().pump;
    if (pumpState.playStatus === C.OP_START || pumpState.playStatus === C.OP_PAUSE) {
      console.log("pump is stopping...");
      sendPacket(createPacket(C.OP_STOP));
      setTimeout(() => {
        if (pumpState.connectStatus === CONNECTED) {
          dispatch(disconnect(true));
        }
      }, 2000);
    } else if (pumpState.connectStatus === CONNECTED) {
      dispatch(disconnect(true));
    }
  };
};

export const toggleLight = () => {
  return (dispatch, getState) => {
    console.log("toggleLight");
    if (thisPumpDevice === C.PUMP_DEVICE.SUPERGENIE) {
      let light = C.LIGHT_LOW;
      const pumpState = getState().pump;
      if (pumpState.light === C.LIGHT_LOW) {
        light = C.LIGHT_HIGH;
      } else if (pumpState.light === C.LIGHT_HIGH) {
        light = C.LIGHT_OFF;
      }
      sendPacket(createPacket(C.OP_LIGHT, [light]));
    } else if (isGen2Pump(thisPumpDevice)) {
      sendPacket([0, 0, 0, 1, 0, 0, 0, 0]);
    }
  };
};

const trackLocation = () => {
  return (dispatch) => {
    dispatch({
      type: WATCHING_LOCATION,
      payload: true
    });
    geoWatchId = Geolocation.watchPosition(
      (position) => {
        console.log("Location watch:", position);
      },
      (error) => {
        console.log("Location watch error:", error.code, error.message);
      },
      {
        enableHighAccuracy: false
      }
    );
  };
};

export const stopTrackingLocation = () => {
  return (dispatch) => {
    Geolocation.clearWatch(geoWatchId);
    geoWatchId = null;

    dispatch({
      type: WATCHING_LOCATION,
      payload: false
    });
  };
};

export const stopForegroundService = () => {
  notifee.stopForegroundService();
};

export const toggleLocation = (val) => {
  return (dispatch) => {
    if (val) {
      AsyncStorage.setItem(LOCATION_PERMISSION, "true");
    } else {
      AsyncStorage.setItem(LOCATION_PERMISSION, "false");
    }
    dispatch(updatePumpStatus({
      locationEnabled: val,
    }));
  };
};

export const startProgram = (id, timer = true, programs = {}, newProgramSteps = []) => {
  return (dispatch, getState) => {
    const { locationEnabled, currentProgram, foregroundNotifChannId } = getState().pump;

    const newLastStartProgramTime = Date.now();
    if ((newLastStartProgramTime - lastStartProgramTime) < 1400) {
      // Pressed play program button twice very fast
      console.log("Pressed play twice quickly..");
      return;
    }
    lastStartProgramTime = newLastStartProgramTime;

    console.log("startProgram:", id, timer);

    const program = JSON.parse(JSON.stringify(programs[id]));
    program.startedAt = Date.now();

    if (isGen2Pump(thisPumpDevice)) {
      program.steps = newProgramSteps;
    }

    dispatch(startProgramWithSession(program));

    if (!timer) {
      if (isGen2Pump(thisPumpDevice)) {
        // Gen2 pump firmware needs more time to process program steps and start
        setTimeout(() => {
          dispatch(startTimer());
        }, (program.steps.length + 2) * pumpProgramStepTime);
      } else {
        dispatch(startTimer());
      }

      dispatch(updatePumpStatus({
        programId: id
      }));

      dispatch({
        type: UPDATE_PROGRAM_TIMER,
        payload: {
          ...(!timer && { timer: true }),
          startedProgramAt: Date.now(),
          playingProgram: true,
          totalTime: 0
        }
      });
    }

    if (Platform.OS === "android") {
      notifee.displayNotification({
        id: `${C.FOREGROUND_SERVICE_PLAY_PROGRAM}s`,
        title: `Playing ${currentProgram.name}`,
        body: "in the background",
        android: {
          channelId: foregroundNotifChannId,
          asForegroundService: true,
          pressAction: {
            id: "default"
          }
        },
      });
    }

    if (Platform.OS === "ios" && locationEnabled) {
      check(PERMISSIONS.IOS.LOCATION_WHEN_IN_USE)
        .then((res) => {
          switch (res) {
            case RESULTS.GRANTED:
              dispatch(trackLocation());
              break;
            case RESULTS.BLOCKED:
              dispatch(addMessage(M.LOCATION_ACCESS_BLOCKED));
              setTimeout(() => {
                openSettings()
                  .catch((err) => {
                    console.log(err);
                  });
              }, 3000);
              break;
            default:
              Geolocation.requestAuthorization(
                () => {
                  dispatch(toggleLocation(true));
                  dispatch(trackLocation());
                },
                () => {
                  dispatch(toggleLocation(false));
                  dispatch(addMessage(M.LOCATION_ACCESS_DENIED));
                }
              );
              break;
          }
        });
    }
  };
};

const startProgramWithSession = (program) => {
  return (dispatch) => {
    if (!program) {
      dispatch(setRequesting({}));
      return;
    }
    console.log("startProgramWithSession:", program);

    if (isGen2Pump(thisPumpDevice)) {
      sendProgramData(program, [((32 * 2) + program.id), 0, 0, 0, 0, 0, 0, 0]);
      dispatch(setRequesting({}));
    } else if (thisPumpDevice === C.PUMP_DEVICE.SUPERGENIE) {
      sendPacket(createPacket(C.OP_PROGRAM_START, [program.id, program.steps.length]));
      const bodyData = createProgramBody(program);
      bodyData.forEach((data, i) => {
        setTimeout(() => {
          sendPacket(createPacket(C.OP_PROGRAM_START_BODY, data));
        }, (i + 1) * 500);
      });
      dispatch(setRequesting({}));
    }
  };
};

const tickTock = () => {
  return (dispatch) => {
    dispatch({
      type: PUMP_TICK_TOCK,
      payload: {}
    });
  };
};

const startTimer = () => {
  return (dispatch) => {
    sessionTimer = setInterval(() => {
      // code that will be called every 1 second
      dispatch(tickTock());
    }, 1000);
  };
};

export const stopTimer = () => {
  sessionTimer && clearInterval(sessionTimer);
  sessionTimer = null;
};

const resumeProgramFinGen2 = (timer) => {
  return (dispatch) => {
    dispatch({
      type: UPDATE_PROGRAM_TIMER,
      payload: {
        ...(!timer && { timer: true }),
        playingProgram: true
      }
    });

    dispatch(startTimer());
  };
};

export const resumeProgram = (
  timer = true, rezumeProgram = null, sendOnly = null,
  dontSendToPump = null
) => {
  if (thisPumpDevice === C.PUMP_DEVICE.SUPERGENIE) {
    if (sendOnly) {
      sendPacket(createPacket(C.OP_START, [0, 0, 0]));
    } else {
      return (dispatch) => {
        if (!timer) {
          if (!rezumeProgram) {
            dispatch(startTimer());
          }

          dispatch({
            type: UPDATE_PROGRAM_TIMER,
            payload: {
              ...(!timer && { timer: true }),
              playingProgram: true,
              ...(rezumeProgram && { rezumeProgram: false })
            }
          });
        }

        if (!dontSendToPump) {
          sendPacket(createPacket(C.OP_START, [0, 0, 0]));
        }
      };
    }
  } else if (isGen2Pump(thisPumpDevice)) {
    return (dispatch, getState) => {
      const { programId } = getState().pump;

      if (!timer) {
        resumedProgramViaApp = true;
        dispatch(resumeProgramFinGen2(timer));
      }

      sendPacket([((32 * 3) + programId), 0, 0, 0, 0, 0, 0, 0]);
    };
  }
};

export const readOngoingProgramData = () => {
  BLERead(thisConnectedId, C.SG2_SERVICE_COMMUNICATION, C.SG2_CHARACTERISTIC2)
    .then((x) => {
      // For when App is back from the background/suspended state
      console.log("readOngoingProgramData:", x);
    })
    .catch((err) => {
      console.log(err);
    });
};

export const readProgramData = (programId = null) => {
  sendPacket([2, programId || 11, 0, 0, 0, 0, 0, 0], C.SG2_CHARACTERISTIC1);
};

const requestProgramData = (id) => {
  console.log("requestProgramData:", id);
  sendPacket(createPacket(C.OP_PROGRAM_SHOW, [id]));
};

export const sendProgramData = (program, playProgram = null) => {
  if (!program) return;

  console.log("sending ProgramData:", program);
  console.log("program steps:", program.steps);

  if (thisPumpDevice === C.PUMP_DEVICE.SUPERGENIE) {
    sendPacket(createPacket(C.OP_PROGRAM_SAVE, [program.id, program.steps.length]));
    const bodyData = createProgramBody(program);
    bodyData.forEach((data, i) => {
      console.log("save program data", i, data);
      setTimeout(() => {
        sendPacket(createPacket(C.OP_PROGRAM_SAVE_BODY, data));
      }, (i + 1) * 500);
    });
  } else if (isGen2Pump(thisPumpDevice)) {
    program.steps.forEach((data, i) => {
      console.log(i, "save program data", data);
      const cycle = data.pause ? 0 : appToPumpCycle(data.cycle);
      const minutes = Math.floor(data.duration / 60);
      const seconds = data.duration % 60;
      const octet4 = data.pause ? 1 : data.mode === 1 ? 7 : 5; // 111 or 101, 001(pause step)
      setTimeout(() => {
        // Octet 7: 0 R/W
        // Octet 6: Program number
        // Octet 5: Step number
        // Octet 4: octet4 On/off mode exist
        // Octet 3: Vacuum
        // Octet 2: Cycle
        // Octet 1: Minutes
        // Octet 0: Seconds
        sendPacket(
          [0, program.id, i, octet4, data.pause ? 0 : data.vacuum, cycle, minutes, seconds],
          C.SG2_CHARACTERISTIC1
        );
      }, (i + 1) * pumpProgramStepTime);
    });

    if (!playProgram) {
      setTimeout(() => {
        sendPacket([0, program.id, program.steps.length, 0, 0, 0, 0, 0], C.SG2_CHARACTERISTIC1);
      }, (program.steps.length + 1) * pumpProgramStepTime);
    }

    if (playProgram) {
      setTimeout(() => {
        sendPacket(playProgram);
      }, (program.steps.length + 2) * pumpProgramStepTime);
    }
  }
};

const deleteProgramData = (id) => {
  sendPacket(createPacket(C.OP_PROGRAM_DELETE, [id, 0]));
};

const createProgramBody = (program) => {
  if (!program) return;
  const data = [];
  for (let i = 0; i < program.steps.length; i++) {
    const step = program.steps[i];
    const minutes = Math.floor(step.duration / 60);
    const seconds = step.duration % 60;
    data.push([program.id, i, step.cycle, step.vacuum, step.mode, minutes, seconds]);
  }
  return data;
};

export const startSession = (cycle, vacuum, mode) => {
  return (dispatch, getState) => {
    console.log("startSession:", cycle, vacuum, mode);
    if (thisPumpDevice === C.PUMP_DEVICE.SUPERGENIE) {
      sendPacket(createPacket(C.OP_START, [cycle || 0, vacuum || 0, mode]));
    } else if (isGen2Pump(thisPumpDevice)) {
      sendPacket([0, 0, 0, 0, 100, 0, 0, 0]);
    }

    dispatch(startTimer());

    const state = getState().pump;
    let payload = {
      timer: true,
    };

    if (state.playStatus !== C.OP_PAUSE) {
      // no need to set start time when resuming from pause state
      payload = {
        ...payload,
        startedProgramAt: Date.now()
      };
    }

    dispatch({
      type: UPDATE_PROGRAM_TIMER,
      payload,
    });
  };
};

export const stopSession = (payload, skipStop) => {
  return (dispatch, getState) => {
    console.log("stopSession");
    if (thisPumpDevice === C.PUMP_DEVICE.SUPERGENIE && !skipStop) {
      sendPacket(createPacket(C.OP_STOP));
    } else if (isGen2Pump(thisPumpDevice)) {
      const { programPlaying, programId } = getState().pump;

      if (programPlaying) {
        sendPacket([32 + programId, 0, 0, 0, 0, 0, 0, 0]);
      } else {
        sendPacket([0, 0, 0, 0, 101, 0, 0, 0]);
      }
    }

    if (payload) {
      dispatch({
        type: STOP_SESSION,
        payload
      });
    }
  };
};

export const pauseSession = (timer = null, sendOnly) => {
  if (sendOnly) {
    if (thisPumpDevice === C.PUMP_DEVICE.SUPERGENIE) {
      sendPacket(createPacket(C.OP_PAUSE));
    }
  } else {
    return (dispatch, getState) => {
      if (thisPumpDevice === C.PUMP_DEVICE.SUPERGENIE) {
        sendPacket(createPacket(C.OP_PAUSE));
      } else if (isGen2Pump(thisPumpDevice)) {
        const { programPlaying, programId } = getState().pump;

        if (programPlaying) {
          sendPacket([96 + programId, 0, 0, 0, 0, 0, 0, 0]);
        } else {
          sendPacket([0, 0, 0, 0, 100, 0, 0, 0]);
        }
      }

      if (timer === null) {
        dispatch({
          type: UPDATE_PROGRAM_TIMER,
          payload: { timer: null }
        });
      }
    };
  }
};

export const updateProgramState = (payload) => {
  return (dispatch) => {
    dispatch({
      type: UPDATE_PROGRAM_STATE,
      payload
    });
  };
};

export const turnOff = () => {
  if (isGen2Pump(thisPumpDevice)) {
    sendPacket([0, 0, 0, 0, 200, 0, 0, 0]);
  } else if (thisPumpDevice === C.PUMP_DEVICE.SUPERGENIE) {
    sendPacket(createPacket(C.OP_TURN_OFF));
  }
};

/**
 * @param {Number} cycle - target cycle value
 * @param {Number} vacuum - target vacuum value
 * @param {Number} mode - target mode
 * @param {Boolean} toggleMode - toggling mode or not
 */
export const setAll = (cycle, vacuum, mode, toggleMode) => {
  console.log("setAll:", cycle, vacuum, mode, toggleMode);
  if (isGen2Pump(thisPumpDevice)) {
    const modeVal = toggleMode ? 100 : 0;
    sendPacket([0, 0, 0, 0, 0, 0, 0, modeVal]);
  } else if (thisPumpDevice === C.PUMP_DEVICE.SUPERGENIE) {
    sendPacket(createPacket(C.OP_UPDATE, [cycle, vacuum, mode]));
  }
};

/**
 * @param {Number} cycle - target cycle value
 * @param {Boolean} increment - increasing cycle or not
 */
export const setCycle = (cycle, increment) => {
  console.log("setCycle:", increment);
  if (isGen2Pump(thisPumpDevice)) {
    const val = increment ? 100 : 50;
    sendPacket([0, 0, 0, 0, 0, 0, val, 0]);
  } else if (thisPumpDevice === C.PUMP_DEVICE.SUPERGENIE) {
    sendPacket(createPacket(C.OP_UPDATE, [cycle, 0, 0]));
  }
};

export const setVacuum = (vacuum, increment) => {
  console.log("setVacuum:", increment);
  if (isGen2Pump(thisPumpDevice)) {
    const val = increment ? 100 : 50;
    sendPacket([0, 0, 0, 0, 0, val, 0, 0]);
  } else if (thisPumpDevice === C.PUMP_DEVICE.SUPERGENIE) {
    sendPacket(createPacket(C.OP_UPDATE, [0, vacuum, 0]));
  }
};

export const setMode = (mode, toggleMode) => {
  console.log(mode, "setMode:", toggleMode);
  if (isGen2Pump(thisPumpDevice)) {
    const modeVal = toggleMode ? 100 : 0;
    sendPacket([0, 0, 0, 0, 0, 0, 0, modeVal]);
  } else if (thisPumpDevice === C.PUMP_DEVICE.SUPERGENIE) {
    sendPacket(createPacket(C.OP_UPDATE, [0, 0, mode]));
  }
};

export const requestStatus = () => {
  if (thisConnectStatus === CONNECTED) {
    sendPacket(createPacket(C.OP_STATUS));
  }
};

export const wakeUpPump = () => {
  if (isGen2Pump(thisPumpDevice)) {
    sendPacket([1, 0, 8, 0, 0, 0, 1, 1], C.SG2_CHARACTERISTIC5);
  }
};

export const sendPacket = (packet, charId = C.SG2_CHARACTERISTIC2) => {
  // console.log("send packet1:", packet, charId);
  const validated = validatePacket(packet);
  if (!validated) return;

  if (thisPumpDevice === C.PUMP_DEVICE.SUPERGENIE) {
    // eslint-disable-next-line import/no-named-as-default-member
    BLEWriteWithoutResponse(
      thisConnectedId,
      itIsSG2 ? C.SG2_BLE_SERVICE_COMMUNICATION : C.BLE_SERVICE_COMMUNICATION,
      itIsSG2 ? C.SG2_BLE_CHAR_READ_WRITE : C.BLE_CHARACTERISTIC_WRITE,
      packet
    ).catch((e) => {
      console.log("writeWithoutResponse failed:", e);
    });
  } else if (isGen2Pump(thisPumpDevice)) {
    // console.log("send packet2:", Date.now());
    // eslint-disable-next-line import/no-named-as-default-member
    BLEWrite(
      thisConnectedId, C.SG2_SERVICE_COMMUNICATION, charId, packet
    )
      .then(() => {
        // console.log("send packet3:", packet, charId);
      })
      .catch((e) => {
        console.log(charId, packet, "write failed:", e);
      });
  }
};

const initBLEAndPumpState = () => {
  return (dispatch) => {
    thisConnectStatus = DISCONNECTED;
    scanning = false;

    dispatch(updatePumpStatus({
      connectedId: null,
      connectStatus: DISCONNECTED,
      speed: null,
      strength: null,
      mode: null,
      battery: 0,
      light: C.LIGHT_OFF,
      connectResponse: null,
    }));
  };
};

/* Initialize and terminate : ----------------------- */
export const pumpStart = () => {
  return (dispatch) => {
    BLERemoveListeners();
    BLEAddListener("BleManagerStopScan", () => dispatch(onStopScan()));
    BLEAddListener("BleManagerDidUpdateState", (result) => dispatch(onDidUpdateState(result)));
    BLEAddListener("BleManagerDiscoverPeripheral", (result) => dispatch(onDiscoverPeripheral(result)));
    BLEAddListener("BleManagerConnectPeripheral", (result) => dispatch(onConnectPeripheral(result)));
    BLEAddListener("BleManagerDisconnectPeripheral", (result) => dispatch(onDisconnectPeripheral(result)));
    BLEAddListener("BleManagerDidUpdateValueForCharacteristic", (result) => { dispatch(onDidUpdateValueForCharacteristic(result)); });
    handleAndroidBlePermissions()
      .then(() => {
        BLEStart().then(() => {
          BLECheckState();
        });
      })
      .catch(() => {
        dispatch(addMessage(M.BLUETOOTH_PERMISSIONS_DENIED));
      });
  };
};

export const close = () => {
  console.log("remove listeners");
  BLERemoveListeners();
};

/* Callback functions : ----------------------- */
const onStopScan = () => {
  return (dispatch) => {
    if (DFUId) {
      // If DFU is active
      return;
    }

    console.log(thisConnectStatus, "onStopScan...", scanning);
    scanning = false;
    if (thisConnectStatus === DISCONNECTED) {
      scanAttemptCount += 1;
      if (scanAttemptCount > 2) {
        scanAttemptCount = 0;
        dispatch(updatePumpStatus({
          scanning: false,
        }));
      } else {
        dispatch(scan());
      }
    } else {
      scanAttemptCount = 0;
      dispatch(updatePumpStatus({
        scanning: false,
      }));
    }
  };
};

const onDidUpdateState = (result) => {
  const { state } = result;

  return (dispatch, getState) => {
    console.log("onDidUpdateState: ", state);

    const { connectStatus, activeProgram } = getState().pump;

    bleState = (state === "on"); // true or false

    dispatch(updatePumpStatus({
      bleState,
    }));

    if (state === "off") {
      dispatch(addMessage(M.BLUETOOTH_OFF));

      if (Platform.OS === "ios" && connectStatus === CONNECTED) {
        // onDisconnectPeripheral does not trigger on IOS
        // when bluetooth is switched off
        const result = { peripheral: thisConnectedId };

        dispatch(onDisconnectPeripheral(result));
      }

      dispatch(initBLEAndPumpState());
    }

    if (bleState && !scanning) {
      dispatch(scan());
    }
  };
};

const onDiscoverPeripheral = (result) => {
  const {
    id, name, rssi, advertising
  } = result;
  // console.log("discovered:", name, result);

  return (dispatch, getState) => {
    const pumpState = getState().pump;

    if (name === C.PUMP_DEVICE.SUPERGENIE || isGen2Pump(name)) {
      console.log("Found SuperGenie device", name);
    } else if (name === C.PUMP_DEVICE.SG_DFU) {
      // Catch DFU state here
      console.log("Found SG DFU device");

      DFUId = id;
      return;
    } else return;

    if (!pumpState) return;
    console.log(`onDiscoverPeripheral:${pumpState.id}/${id}/${name}/${rssi}/${advertising}`);
    const peripherals = {};
    peripherals[id] = {
      id, name, rssi, advertising
    };

    let updatedPeripherals = {
      ...pumpState.peripherals,
      ...peripherals
    };

    // Sort by key
    updatedPeripherals = _(updatedPeripherals)
      .toPairs()
      .sortBy(0)
      .fromPairs()
      .value();

    dispatch({
      type: UPDATE_PERIPHERALS,
      payload: {
        peripherals: updatedPeripherals
      }
    });

    // Pump auto reconnection
    if (pumpState.id && pumpState.id !== id) return;
    if (pumpState.connectStatus !== DISCONNECTED) return;
    AsyncStorage.getItem(REMEMBER_DEVICE_ID)
      .then((val) => {
        if (val && val === id) { // Connect if it is a remembered device
          dispatch(connectPump(id));
        }
      });
  };
};

const onConnectPeripheral = (result) => {
  return (dispatch, getState) => {
    const { peripheral } = result;
    const pumpState = getState().pump;
    const { isSG2 } = pumpState;
    const { programDisconnected } = pumpState.activeProgram;

    console.log(`onConnectPeripheral:${isSG2}:${pumpState.id}:${peripheral}`);

    thisConnectedId = peripheral;

    if (thisPumpDevice === C.PUMP_DEVICE.SUPERGENIE) {
      BLERetrieveServices(peripheral).then(() => {
        BLEStartNotification(
          peripheral,
          isSG2 ? C.SG2_BLE_SERVICE_COMMUNICATION : C.BLE_SERVICE_COMMUNICATION,
          isSG2 ? C.SG2_BLE_CHAR_READ_WRITE : C.BLE_CHARACTERISTIC_READ
        )
          .then(() => {
            thisConnectStatus = CONNECTED;
            isConnectingPeripheral = true;
            dispatch(updatePumpStatus({
              connectedId: peripheral,
              connectStatus: CONNECTED,
            }));
            if (pumpState.id && pumpState.id === peripheral) { // There is remember device
              dispatch(addMessage(M.PUMP_CONNECT.replace("pump", pumpState.pumpDeviceName)));
              requestStatus();
            } else {
              // The further process will be done after receive accept response from pump
            }

            setTimeout(() => {
              isConnectingPeripheral = false;
            }, 4000);

            // Check if the App was playing a program and got disconnected
            if (programDisconnected) {
              setTimeout(() => {
                const { programId, currentProgram } = getState().pump;
                const payload = {};
                if (programId === currentProgram.id) {
                  payload.playingProgram = true;
                }

                dispatch({
                  type: PROGRAM_RECONNECTED,
                  payload
                });
                stopProgramDisconnectTimer();
                requestStatus(); // Update values
                setTimeout(() => {
                  dispatch(continueProgramFromDisconnect());
                }, 1500);
              }, 1000);
            }
          }).catch((e) => {
            console.log("startNotification failed:", e);
          });
      }).catch((e) => {
        console.log("retrieveServices failed:", e);
      });
    } else if (isGen2Pump(thisPumpDevice)) {
      BLERetrieveServices(peripheral).then(() => {
        BLEStartNotification(peripheral, C.SG2_SERVICE_COMMUNICATION, C.SG2_CHARACTERISTIC1)
          .then((res1) => {
            console.log("res1::::", res1);
            BLEStartNotification(peripheral, C.SG2_SERVICE_COMMUNICATION, C.SG2_CHARACTERISTIC2)
              .then((res2) => {
                console.log("res2::::", res2);
                BLEStartNotification(peripheral, C.SG2_SERVICE_COMMUNICATION, C.SG2_CHARACTERISTIC3)
                  .then((res3) => {
                    console.log("res3::::", res3);
                    BLEStartNotification(
                      peripheral, C.SG2_SERVICE_COMMUNICATION, C.SG2_CHARACTERISTIC5
                    )
                      .then((res5) => {
                        console.log("res5:::", res5);
                        BLEStartNotification(
                          peripheral, C.SG2_SERVICE_COMMUNICATION, C.SG2_CHARACTERISTIC6
                        )
                          .then((res6) => {
                            console.log("res6::::", res6);
                            thisConnectStatus = CONNECTED;
                            isConnectingPeripheral = true;
                            dispatch(updatePumpStatus({
                              canReadChar6: true,
                              connectedId: peripheral,
                              connectStatus: CONNECTED,
                            }));
                            if (pumpState.id && pumpState.id === peripheral) {
                              // There is remember device
                              dispatch(addMessage(M.PUMP_CONNECT.replace("pump", pumpState.pumpDeviceName)));
                              requestStatus();
                              // setTimeout(() => {
                              //   this.requestProgramData(1)
                              // }, 500)
                              // setTimeout(() => {
                              //   this.requestProgramData(2)
                              // }, 1000)
                            } else {
                              // The further process will be done
                              // after receive accept response from pump
                            }

                            setTimeout(() => {
                              isConnectingPeripheral = false;
                            }, 4000);

                            setTimeout(() => {
                              dispatch(checkForPumpUpdate(peripheral));
                            }, 15000); // Wait for pump values to update
                          }).catch((e) => {
                            console.log("start noti6 failed", e);
                          });
                      }).catch((e) => {
                        console.log("start noti5 failed", e);
                      });
                  }).catch((e) => {
                    console.log("startNotification3 failed:", e);
                  });
              }).catch((e) => {
                console.log("startNotification2 failed:", e);
              });
          }).catch((e) => {
            console.log("startNotification1 failed:", e);
          });
      }).catch((e) => {
        console.log("retrieveServices failed:", e);
      });
    }

    // Log RSSI
    if (rssiTimer) {
      // For times when it disconnects while the App is suspended
      rssiTimer && clearInterval(rssiTimer);
      rssiTimer = null;
    }

    rssiTimer = setInterval(() => {
      readRSSI(peripheral)
        .then((rssi) => {
          // console.log("Current RSSI: ", rssi);
          dispatch(updatePumpRSSI({ rssi }));
        })
        .catch((error) => {
          console.log("readRSSI error:", error);
        });
    }, 20000);
  };
};

const stopProgramFromDisconnect = () => {
  return (dispatch) => {
    stopTimer();

    dispatch(stopSession(
      {
        timer: null,
        totalTime: 0
      },
      true
    ));

    dispatch(
      updatePumpStatus({
        playStatus: C.OP_STOP,
        activeProgram: { programDisconnected: false }
      })
    );
  };
};

const onDisconnectPeripheral = (result) => {
  return (dispatch, getState) => {
    const state = getState().pump;
    const { peripheral } = result;
    const { programId, activeProgram } = state;
    const { playingProgram } = activeProgram;

    console.log(isConnectingPeripheral, "onDisconnectPeripheral:", peripheral);

    dispatch(addMessage(M.PUMP_DISCONNECT.replace("pump", (state.pumpDeviceName || "Pump"))));

    if (thisConnectedId === peripheral) {
      if (playingProgram && programId !== C.MANUAL_PROGRAM_ID) {
        dispatch(initiateProgramDisconnectSync());
      } else if (playingProgram) {
        dispatch(stopProgramFromDisconnect());
      }

      // Wait 'x' secs for reconnection when pump is disconnected, and then redirect to home tab
      // ONLY for manual mode: Keep timer going while 'x' elapses, and stop if disconnected for > x
      setTimeout(() => {
        if (thisConnectStatus === CONNECTED) { // pump turned off or on or temporarily disconnected
          const { programDisconnected } = getState().pump.activeProgram;
          let fromPage = null;
          if (programDisconnected) {
            fromPage = "programDisconnect";
          }

          startPairing(fromPage);
          // dispatch(setSuperGenieLoad(false));
        } else {
          // pump is connected immediately, automatically,
          // or disconnected manually, so no need anything here
        }

        // moved here as need to use thisConnectStatus
        // to distinguish manual disconnection and pump turn off
        if (thisConnectStatus === CONNECTED) {
          dispatch(initBLEAndPumpState());
          dispatch(updatePumpStatus({
            peripherals: {} // no pump
          }));
        }
      }, 5000);

      // Alert pump store it's disconnected
      dispatch({
        type: PUMP_DISCONNECTED,
        payload: {}
      });
    }

    rssiTimer && clearInterval(rssiTimer);
  };
};

const onDidUpdateValueForCharacteristic = (result) => {
  return (dispatch, getState) => {
    const state = getState().pump;

    const { value, characteristic } = result;

    if (isGen2Pump(thisPumpDevice)) {
      if (characteristic.toUpperCase() === C.SG2_CHARACTERISTIC1.toUpperCase()) {
        const programStep = parsePumpStatusChar1(value);
        processProgramStepFromPump(programStep);
      }

      if (characteristic.toUpperCase() === C.SG2_CHARACTERISTIC2.toUpperCase()) {
        const pumpStatus = parsePumpStatusChar2(value);
        // console.log("pump status char2::", pumpStatus);

        const playStatus = pumpStatus.pumpingStatus;

        // Resume program playing if resumed from Pump
        if (
          state.activeProgram.playingProgram
            && state.programPaused
              && playStatus === C.OP_START
                && playStatus !== state.playStatus
                && !resumedProgramViaApp
        ) {
          // Program resumed from pump
          dispatch(resumeProgramFinGen2(state.activeProgram.timer));
        } else if (
          state.activeProgram.playingProgram
            && state.programPaused
              && playStatus === C.OP_START
                && playStatus !== state.playStatus
        ) {
          // Program resumed via App, programatically or manually
          resumedProgramViaApp = false;
        }

        dispatch(updatePumpStatus({
          programSeq: pumpStatus.programSeq,
          speed: pumpStatus.speed,
          strength: pumpStatus.strength,
          mode: pumpStatus.mode,
          light: pumpStatus.light,
          playStatus,
          minutes: pumpStatus.pumpingMinutes,
          seconds: pumpStatus.pumpingSeconds,
          programPlaying: pumpStatus.programPlaying,
          programPaused: pumpStatus.programPaused,
          // initialize connect response as pairing screen is receiving incorrect connect response
          connectResponse: null,
        }));
      }

      if (characteristic.toUpperCase() === C.SG2_CHARACTERISTIC3.toUpperCase()) {
        const pumpStatus = parsePumpStatusChar3(value);
        // console.log("pump status char3::", pumpStatus);
        dispatch(updatePumpStatus({
          battery: pumpStatus.battery
        }));
      }

      if (characteristic.toUpperCase() === C.SG2_CHARACTERISTIC6.toUpperCase()) {
        const authStatus = parsePumpStatusChar6(value);

        if (authStatus.connectResponse === C.OP_ACCEPT) {
          dispatch(updatePumpStatus({
            connectResponse: C.OP_ACCEPT,
          }));
        } else if (authStatus.connectResponse === C.OP_REJECT) {
          dispatch(updatePumpStatus({
            connectResponse: C.OP_REJECT,
          }));
        }
        dispatch(updatePumpStatus({
          firmwareVersion: authStatus.firmwareVersion
        }));
      }
    } else if (thisPumpDevice === C.PUMP_DEVICE.SUPERGENIE) {
      let index = 0;
      while (value.length > index) {
        const length = value[index];
        const packet = value.slice(index, index + length);

        const response = parsePacket(packet);

        switch (response.type) {
          case C.OP_CONNECT_RESPONSE:
            if (response.connectResponse === C.OP_ACCEPT) {
              dispatch(updatePumpStatus({
                connectResponse: C.OP_ACCEPT,
              }));

              setTimeout(() => {
                requestStatus();
              }, 1000); // Time for App pump interaction
            } else {
              dispatch(updatePumpStatus({
                connectResponse: C.OP_REJECT,
              }));
            }
            break;
          case C.OP_VERSION_RESPONSE:
            dispatch(updatePumpStatus({
              boardVersion: response.boardVersion,
              firmwareVersion: response.firmwareVersion
            }));
            break;
          case C.OP_STATUS_RESPONSE:
            if (response.programId !== 1 && response.programId !== 2) {
              // Don't need to update status as app doesn't have P1/P2
              dispatch(updatePumpStatus({
                speed: response.cycle,
                strength: response.vacuum,
                mode: response.mode,
                light: response.light,
                battery: response.battery,
                playStatus: response.status,
                // set -1 because response.programId is 0 when play manual
                programId: (
                  state.activeProgram.playingProgram || state.activeProgram.programDisconnected
                ) ? response.programId : -1,
                programSeq: response.seq < 25 ? response.seq : 0, // Bug in firmware
                minutes: response.minutes,
                seconds: response.seconds,
              }));

              // Resume App program activity if program is
              // resumed from the pump itself
              if (
                response.status === C.OP_START
                && state.playStatus === C.OP_PAUSE
                && state.activeProgram.playingProgram
                && response.programId === state.programId
                && !state.activeProgram.timer
              ) {
                dispatch(resumeProgram(null, null, null, true));
              }

              // Pause session from the pump while pumping
              if (
                response.status === C.OP_PAUSE && sessionTimer
                && state.playStatus !== C.OP_PAUSE
                && state.programId === C.MANUAL_PROGRAM_ID
              ) {
                stopTimer();
                dispatch({
                  type: UPDATE_PROGRAM_TIMER,
                  payload: { timer: null }
                });
              }

              // Start session from the pump (power button)
              if (response.status === C.OP_START && !sessionTimer
                && state.playStatus !== C.OP_START && state.programId === C.MANUAL_PROGRAM_ID) {
                dispatch(startTimer());
                dispatch({
                  type: UPDATE_PROGRAM_TIMER,
                  payload: { timer: true, startedProgramAt: Date.now() }
                });
              }
            }
            break;
          case C.OP_PROGRAM_SHOW_RESPONSE:
            // Do not sync with the pump
            // if (response.sessionCount <= 0) {
            //   this.programs[response.programId] = null
            //   delete this.programs[response.programId]
            // } else {
            //   this.programs[response.programId] = {
            //     ...C.EMPTY_PROGRAM,
            //     id: response.programId,
            //     name: this.getDefaultProgramName(response.programId),
            //     steps: new Array(response.sessionCount)
            //   }
            // }
            // AsyncStorage.setItem('programs', JSON.stringify(toJS(this.programs)))
            break;
          case C.OP_PROGRAM_SHOW_RESPONSE_BODY:
            // if (!this.programs[response.programId]) {
            //   this.programs[response.programId] = {
            //     ...C.EMPTY_PROGRAM,
            //     id: response.programId,
            //     name: this.getDefaultProgramName(response.programId),
            //     steps: []
            //   }
            // }
            // this.programs[response.programId].steps[response.seq] = {
            //   duration: response.minutes * 60 + response.seconds,
            //   mode: response.mode,
            //   vacuum: response.vacuum,
            //   cycle: response.cycle,
            //   index: response.seq
            // }
            // console.log("just:", response.programId);
            // this.programs = { ...this.programs, [response.programId]: {...this.normalizeProgram(this.programs[response.programId])} }
            // console.log('OPPROGRAM_SHOW_RESPONSE_BODY programs', toJS(this.programs))
            // AsyncStorage.setItem('programs', JSON.stringify(toJS(this.programs)))
            // user && user.saveProgram(response.programId, this.programs[response.programId])
            break;
          default:
        }
        index += length;
      }
    }
  };
};

export const updatePumpRSSI = (rssi) => {
  return {
    type: UPDATE_PUMP_RSSI,
    payload: rssi
  };
};

export const checkForPumpUpdate = (peripheral, forceCheck = false) => {
  return (dispatch, getState) => {
    AsyncStorage.getItem(C.pumpFWCheckTime)
      .then((val) => {
        if ((val && JSON.parse(val) < (Date.now() - 86400000)) || forceCheck) { // Check once a day
          const { firmwareVersion } = getState().pump;
          firebase.database().ref("pump/firmware")
            .once("value", (snapshot) => {
              const fbFWVal = snapshot.val();

              if (fbFWVal) {
                const { version, downloadUrl } = fbFWVal;

                if (version > firmwareVersion) {
                  // Alert user
                  dispatch(addMessage(M.PUMP_UPDATE_AVAILABLE));

                  dispatch({
                    type: FW_UPDATE,
                    payload: {
                      updateAvailable: true,
                      firmwareDownloadUrl: downloadUrl,
                      updatePumpId: peripheral
                    }
                  });
                } else {
                  dispatch(addMessage(M.NO_PUMP_UPDATE_AVAILABLE));
                }

                AsyncStorage.setItem(C.pumpFWCheckTime, JSON.stringify(Date.now()));
              }
            });
        } else {
          AsyncStorage.setItem(C.pumpFWCheckTime, JSON.stringify(Date.now()));
        }
      });
  };
};

const clearDFUId = () => {
  DFUId = null;
  onStopScan();
};

DFUEmitter.addListener(
  "DFUProgress",
  ({
    percent, currentPart, partsTotal,
    avgSpeed, speed
  }) => {
    console.log(`DFU progress: ${percent}%`);
    console.log(`DFU current part: ${currentPart} partsTotal: ${partsTotal} avgSpeed: ${avgSpeed} speed: ${speed}`);
  }
);

DFUEmitter.addListener("DFUStateChanged", ({ state }) => {
  console.log("DFU State:", state);
});

export const updatePumpFirmware = () => {
  return (dispatch, getState) => {
    const { firmwareDownloadUrl, pumpDeviceName } = getState().pump;

    // Download update file
    // Create a reference from a Google Cloud Storage URI
    const gsRef = firebase.storage().refFromURL(firmwareDownloadUrl);

    gsRef.getDownloadURL()
      .then((url) => {
        const options = {
          fromUrl: url,
          toFile: dfuPath,
        };

        RNFS.downloadFile(options)
          .promise.then((success) => {
            console.log(success);

            // Send into DFU mode
            sendPacket([0, 0, 0, 0, 0, 0, 0, 100], C.SG2_CHARACTERISTIC6);

            const updatePumpFirmwareFin = () => {
              // const { connectedId } = getState().pump;
              console.log("updatePumpFirmwareFin");

              DFUCount += 1;

              if (!DFUId) {
                return;
              }

              clearInterval(this.updateTimer);

              RNFS.exists(dfuPath)
                .then((x) => {
                  console.log("Exists:", x, dfuPath);

                  const filePath = Platform.OS === "ios"
                    ? `file://${dfuPath}`
                    : dfuPath;

                  NordicDFU.startDFU({
                    deviceAddress: DFUId,
                    name: C.PUMP_DEVICE.SG_DFU,
                    filePath
                  })
                    .then((res) => {
                      clearDFUId();
                      console.log("Transfer done:", res);

                      dispatch({
                        type: FW_UPDATE,
                        payload: {
                          updateAvailable: false,
                          firmwareDownloadUrl: null,
                          updatePumpId: null
                        }
                      });

                      dispatch(addMessage(M.UPDATE_FIRMWARE_DONE.replace("pump", pumpDeviceName)));
                    })
                    .catch((e) => {
                      clearDFUId();
                      console.log("DFU error:", e); /* Log in Bugsnag */
                      dispatch(addMessage(M.UPDATE_FIRMWARE_ERROR));
                    });
                })
                .catch((error) => {
                  clearDFUId();
                  console.log(error);
                });
            };

            DFUCount = 0;

            this.updateTimer = setInterval(() => {
              // Check that App has connected to DFU pump
              if (DFUCount >= 5) {
                clearInterval(this.updateTimer);
                clearDFUId();
              } else {
                updatePumpFirmwareFin();
              }
            }, 5000); // Every x seconds
          })
          .catch((error) => {
            console.log(error);
            dispatch(addMessage(M.DOWNLOAD_FILE_ERROR));
          });
      })
      .catch((error) => {
        // Handle any errors
        console.log(error);
        dispatch(addMessage(M.DOWNLOAD_LINK_ERROR));
      });
  };
};

const initiateProgramDisconnectSync = () => {
  return (dispatch, getState) => {
    programDisconnectTimer = setInterval(() => {
      programDisconnectCount += 1;

      if (programDisconnectCount >= programDisconnectMaxTime) {
        // End program
        const { programDisconnected } = getState().pump.activeProgram;
        if (programDisconnected) {
          dispatch(stopProgramFromDisconnect());
        }

        stopProgramDisconnectTimer();
      }
    }, 1000);
  };
};

const stopProgramDisconnectTimer = () => {
  programDisconnectTimer && clearInterval(programDisconnectTimer);
  programDisconnectTimer = null;

  programDisconnectCount = 0;
};

const setChangedDisconnParams = () => {
  // Checking and setting params that changed
  // while disconnected during program play
  return (dispatch, getState) => {
    const { programSeq, activeProgram } = getState().pump;
    const { newProgram, totalTime } = activeProgram;
    const payload = { activeProgram: {} };

    // Check if pauseSeqPassed is correct
    let pauseStepsPassed = 0;
    let timeElapsed = 0;
    let newTotalTime = totalTime;
    for (let i = 0; i < newProgram.length; i++) {
      const isPauseStep = newProgram[i].pause;

      if (isPauseStep && newProgram[i + 1].originalIndex <= programSeq) {
        pauseStepsPassed += 1;
      }
      if (isPauseStep) {
        if (newProgram[i + 1].originalIndex <= programSeq) {
          timeElapsed += newProgram[i].duration;
          newTotalTime += newProgram[i].duration;
        }
      } else {
        // eslint-disable-next-line no-lonely-if
        if (newProgram[i].originalIndex < programSeq) {
          timeElapsed += newProgram[i].duration;
        }
      }
    }

    payload.activeProgram.currentTime = newTotalTime - timeElapsed;
    payload.activeProgram.pauseSeqPassed = pauseStepsPassed;
    payload.activeProgram.currentIndex = programSeq;
    payload.activeProgram.carouselPosition = programSeq + pauseStepsPassed;

    dispatch(updatePumpStatus(payload));
  };
};

const continueProgramFromDisconnect = () => {
  return (dispatch, getState) => {
    const pumpState = getState().pump;
    const {
      programId, currentProgram, playStatus,
      activeProgram
    } = pumpState;
    const { inPauseSeq } = activeProgram;

    // Check to see if pump is still running the program
    if (programId === currentProgram.id) {
      if (playStatus === C.OP_START) {
        if (inPauseSeq) {
          // End program because user resumed program from
          // the pump while disconnected
          dispatch(stopProgramFromDisconnect());
        } else {
          // Check and set changed parameters
          dispatch(setChangedDisconnParams());
          // Resume program
          setTimeout(() => {
            dispatch(resumeProgram(null, null, null, true));
          }, 750);
        }
      } else if (playStatus === C.OP_PAUSE) {
        if (!inPauseSeq) {
          // Check and set changed parameters
          dispatch(setChangedDisconnParams());
        }

        if (inPauseSeq) {
          // Continue counting
          dispatch(resumeProgram(null, null, null, true));
        }
      } else {
        // Ask to save
        dispatch(stopProgramFromDisconnect());
      }
    } else {
      // Ask to save
      dispatch(stopProgramFromDisconnect());
    }
  };
};

export const processProgramStepFromPump = (programStep) => {
  return (dispatch, getState) => {
    const { programFromPump } = getState().pump;

    let lastSavedDate = null;
    programFromPump.forEach((step) => {
      if (step.savedDate > lastSavedDate) {
        lastSavedDate = step.savedDate;
      }
    });

    programStep.savedDate = Date.now();

    if ((Date.now() - lastSavedDate) > 3000) {
      dispatch({
        type: PROGRAM_FROM_PUMP,
        payload: [programStep]
      });
    } else {
      programFromPump.push(programStep);

      dispatch({
        type: PROGRAM_FROM_PUMP,
        payload: programFromPump
      });
    }
  };
};

/* Actions without device: ----------------------- */
export const newProgramId = (programs) => {
  const programs1And2 = 2;

  const strKeys = Object.keys(programs);
  const keys = strKeys.map((key) => {
    // eslint-disable-next-line radix
    return parseInt(key);
  });
  console.log("kyes:", keys);

  if (keys.length === 0) return 3; // start new program id from 3

  for (let i = 0; i < C.HIGHEST_PROGRAM_ID + 1; i++) {
    if (
      !programs[i] && i > programs1And2 && i <= C.HIGHEST_PROGRAM_ID && i !== C.DEFAULT_PROGRAM_ID
    ) return i;
  }

  return C.NO_AVAILABLE_PROGRAM_ID;
};

const validatePacket = (packet) => {
  if (packet.constructor === Array) {
    if (packet.indexOf(null) > -1 || packet.indexOf(undefined) > -1) {
      console.log("Sneaky", packet);
      return false;
    }
    return true;
  }

  // If packet is not an array return true
  return true;
};

export const deleteProgram = (id, programs) => {
  return (dispatch) => {
    programs[id] = undefined;
    delete programs[id];

    AsyncStorage.getItem("program-pause").then((val) => {
      let newVal = {};
      if (val) {
        newVal = JSON.parse(val);
        delete newVal[id];
      }

      AsyncStorage.setItem("program-pause", JSON.stringify(newVal));

      // Delete on server
      deletePauseProgramUser(id);
    });

    // this.deleteProgramData(id) // Do not delete program from pump
    deleteProgramUser(id);
    AsyncStorage.setItem(STORAGE_PROGRAMS, JSON.stringify(programs));

    // If default program remember it's deleted
    if (id === C.DEFAULT_PROGRAM_ID) {
      AsyncStorage.setItem(DEFAULT_PROGRAM_DELETED, "true");
    }

    // Check if to remove from programsPosition
    AsyncStorage.getItem("programsPosition").then((val) => {
      if (val) {
        val = JSON.parse(val);

        if (Object.prototype.hasOwnProperty.call(val, JSON.stringify(id))) {
          delete val[JSON.stringify(id)];
          // AsyncStorage.setItem("programsPosition", JSON.stringify(val));
        }
      }
    });

    dispatch({
      type: DELETE_PROGRAM,
      payload: {
        programs
      }
    });
  };
};

// Add createdId to private programs that don't have it
export const addCreatedIdToLegacy = () => {
  return (dispatch) => {
    AsyncStorage.getItem(STORAGE_PROGRAMS).then((val) => {
      if (val) {
        const programs = JSON.parse(val);

        const programKeys = Object.keys(programs);
        for (let i = 0; i < programKeys.length; i++) {
          if (!programs[programKeys[i]].createdId) {
            console.log("Addedzzz", programs[programKeys[i]]);
            programs[programKeys[i]].createdId = uuidv4();
          }
        }

        AsyncStorage.setItem(STORAGE_PROGRAMS, JSON.stringify(programs));

        // Send data to firebase
        const user = firebase.auth().currentUser;

        if (user) {
          saveBulkProgramUser(programs);
        }

        AsyncStorage.setItem(ADDED_CREATED_ID, user.uid);

        dispatch({
          type: SAVING_PROGRAM,
          payload: {
            programs
          }
        });
      }
    });
  };
};

// Add pump name of Amber and Default programs
export const changeADProgramPumpName = () => {
  return (dispatch) => {
    AsyncStorage.getItem(STORAGE_PROGRAMS).then((val) => {
      if (val) {
        const programs = JSON.parse(val);

        if (programs[C.DEFAULT_PROGRAM_ID]) {
          programs[C.DEFAULT_PROGRAM_ID].pumpName = program1Default.pumpName;
        }

        if (programs[C.AMBER_PROGRAM_ID]) {
          programs[C.AMBER_PROGRAM_ID].pumpName = amberProgram.pumpName;
        }

        AsyncStorage.setItem(STORAGE_PROGRAMS, JSON.stringify(programs));

        const user = firebase.auth().currentUser;

        if (user) {
          if (programs[C.DEFAULT_PROGRAM_ID]) {
            saveProgramUser(C.DEFAULT_PROGRAM_ID, programs[C.DEFAULT_PROGRAM_ID]);
          }

          if (programs[C.AMBER_PROGRAM_ID]) {
            saveProgramUser(C.AMBER_PROGRAM_ID, programs[C.AMBER_PROGRAM_ID]);
          }
        }

        AsyncStorage.setItem(CHANGED_AD_PROGRAMS_PUMP_NAME, "true");

        dispatch({
          type: SAVING_PROGRAM,
          payload: {
            programs
          }
        });
      }
    });
  };
};

export const shareProgramWithFriends = (programId, item, pauseObj) => {
  return (dispatch) => {
    let pName = C.PUMP_DEVICE.SUPERGENIE;

    C.PUMP_TYPE.forEach((x) => {
      if (x.key === item.pumpName) {
        pName = x.name;
      }
    });

    const message = `Hey! Try out my ${pName} program ${item.name}`;

    const user = firebase.auth().currentUser;
    const uuid = uuidv4();
    console.log(user, uuid);
    const path = `${RNFS.DocumentDirectoryPath}/${uuid}.txt`;
    const firebasePath = `/Genie/${user.uid}/${uuid}.txt`;

    const uploadAndShare = () => {
      // Add pause steps
      const newItem = { ...item };
      if (pauseObj) {
        newItem.pauses = pauseObj;
      }

      // Write file
      RNFS.writeFile(path, JSON.stringify(newItem), "utf8")
        .then((success) => {
          console.log("FILE WRITTEN!", success);

          firebase
            .storage()
            .ref(firebasePath)
            .putFile(
              path
            )
            .then((succezz) => {
              console.log(succezz);

              // Save program
              newItem.uuid = uuid;
              delete newItem.pauses;
              dispatch(saveProgram(programId, { ...newItem }, true));

              // Delete saved file
              RNFS.unlink(path)
                .then(() => {
                  console.log("FILE DELETED");

                  const ref = firebase.storage().ref(firebasePath);
                  ref.getDownloadURL()
                    .then((url) => {
                      console.log(url);

                      branch.createBranchUniversalObject(uuid, {
                        title: message,
                        contentDescription: "A Pumpables pumping program has been shared with you",
                        contentImageUrl: "https://firebasestorage.googleapis.com/v0/b/pumpables-co.appspot.com/o/Pumpables%2FApp-Icon%2FItunesArtwork%402x.png?alt=media&token=c0629d3d-7e64-4b25-b80a-17e3c2796837",
                        contentMetadata: {
                          customMetadata: {
                            link: `https://pumpables.co/pages/app?value=${url.slice(0, url.lastIndexOf(".txt") + 4)}`
                          }
                        }
                      }).then((buo) => {
                        const linkProperties = {
                          feature: "sharing"
                        };

                        const controlParams = {};

                        buo.generateShortUrl(linkProperties, controlParams)
                          .then(({ url }) => {
                            console.log("branch link:", url);

                            firebase.database()
                              .ref(`userdata/${user.uid}/sharedLinks`)
                              .update({
                                [uuid]: url,
                              })
                              .then(() => {
                                console.log("Share link updated");

                                // Share file
                                const options = {
                                  message,
                                  url
                                };

                                Share.open(options)
                                  .then((res) => {
                                    console.log(res);
                                    firebase.analytics().logEvent("Share_program_success_new");
                                  })
                                  .catch((err) => { err && console.log(err); });
                              });
                          }).catch((error) => {
                            console.error("generateShortUrl error:", error);
                          });
                      }).catch((error) => {
                        console.error("createBranchUniversalObject error:", error);
                      });
                    });
                })
                // `unlink` will throw an error, if the item to unlink does not exist
                .catch((err) => {
                  console.log(err.message);
                });
            })
            .catch((failure) => {
              console.log(failure);
              dispatch(addMessage(M.UPLOAD_SHARE_FILE_ERROR));
            });
        })
        .catch((err) => {
          console.log("Write File err: ", err.message);
          // Alert user
          dispatch(addMessage(err.message));
        });
    };

    if (Object.prototype.hasOwnProperty.call(item, "uuid")) {
      // If it already has a unique id

      if (user) {
        // User is signed in.
        // Try getting metadata
        const oldFirebasePath = `/userdata/${user.uid}/sharedLinks`;

        firebase.database()
          .ref(oldFirebasePath)
          .once("value")
          .then((snapshot) => {
            const val = snapshot.val();
            console.log(val);

            if (val && Object.prototype.hasOwnProperty.call(val, item.uuid)) {
              // Share file
              const options = {
                message,
                url: val[item.uuid]
              };

              Share.open(options)
                .then((res) => {
                  firebase.analytics().logEvent("Share_program_success_existing");
                  console.log(res);
                })
                .catch((err) => { err && console.log(err); });
            } else {
              uploadAndShare();
            }
          });
      }
    } else {
      uploadAndShare();
    }
  };
};

export const saveProgram = (id, currentProgram, overwriteName = false) => {
  return (dispatch, getState) => {
    console.log("Saving program:", JSON.stringify(currentProgram));
    const { programs } = getState().pump;

    let checkedProgram = currentProgram;

    if (!overwriteName) {
      checkedProgram = correctProgramName(programs, currentProgram);
    }

    // Add unique permanent programID if it doesn't exist
    if (!checkedProgram.createdId) {
      checkedProgram.createdId = uuidv4();
    }

    const programsNew = {
      ...programs,
      [id]: { ...normalizeProgram(checkedProgram), id, dateModified: Date.now() }
    };
    AsyncStorage.setItem(STORAGE_PROGRAMS, JSON.stringify(programsNew));

    // Send data to firebase
    saveProgramUser(id, programsNew[id]);

    dispatch({
      type: SAVING_PROGRAM,
      payload: {
        programs: programsNew
      }
    });

    // Do not sync with the pump
    // if (id === 1 || id === 2) {
    //   this.sendProgramData(this.programs[id]);
    // }
  };
};

export const duplicateProgram = (id) => {
  return (dispatch, getState) => {
    const { programs } = getState().pump;

    const program = programs[id];
    const newId = newProgramId(programs);

    if (newId === C.NO_AVAILABLE_PROGRAM_ID) {
      dispatch(addMessage(M.MAX_PROGRAM_ID_REACHED));
      return;
    }

    const newProgram = JSON.parse(JSON.stringify(program));
    newProgram.name = `Copy of ${newProgram.name}`;

    AsyncStorage.getItem(STORAGE_PROGRAM_PAUSE)
      .then((val) => {
        if (val) {
          const newVal = JSON.parse(val);
          const oldPauseObj = newVal[id];

          if (oldPauseObj) {
            newVal[newId] = oldPauseObj;

            AsyncStorage.setItem(STORAGE_PROGRAM_PAUSE, JSON.stringify(newVal));
            savePauseProgram(newId, oldPauseObj);
          }
        }
        dispatch(saveProgram(newId, newProgram));
        dispatch(addMessage(`Program ${program.name} successfully duplicated`));
      });
  };
};

export const saveFavoriteProgram = (p, isFavorite) => {
  return (dispatch, getState) => {
    const { programs } = getState().pump;
    p.favorite = !isFavorite ? JSON.stringify(Date.now()) : "";
    const programsNew = { ...programs, [p.id]: p };
    AsyncStorage.setItem(STORAGE_PROGRAMS, JSON.stringify(programsNew));

    // send data to firebase
    saveProgramUser(p.id, p);

    dispatch({
      type: SAVING_PROGRAM,
      payload: {
        programs: programsNew
      }
    });
  };
};

export const updateChangedProgram = (payload) => {
  return {
    type: UPDATE_CHANGED_PROGRAM,
    payload
  };
};

export const saveChangedProgram = (id, newProgram, message) => {
  return (dispatch, getState) => {
    console.log("saveChangedProgram:", JSON.stringify(normalizeProgram(newProgram)), id);
    // Remove unqiue program id if program has been edited
    if (Object.prototype.hasOwnProperty.call(newProgram, "uuid")) {
      delete this.newProgram.uuid; // COMBAK, check
    }
    let newPrograms = getState().pump.programs;
    newPrograms = {
      ...newPrograms,
      [id]: { ...normalizeProgram(newProgram), id, dateModified: Date.now() }
    };
    dispatch({
      type: SAVE_CHANGED_PROGRAM,
      payload: {
        programs: newPrograms
      }
    });
    // COMBAK: Does not save to Firebase, use saveProgram function,
    // function currently not being used
    AsyncStorage.setItem(STORAGE_PROGRAMS, JSON.stringify(newPrograms));
    dispatch(addMessage(`Saved ${message}`));
  };
};

const normalizeProgram = (program = {}) => {
  let duration = 0;
  program.steps = (program.steps || []).filter((s) => s).filter((s) => (s.duration || 0) > 0);
  program.steps.forEach((session) => {
    duration += session.duration;
  });
  program.name = program.name?.trim();
  program.description = program.description ? program.description.trim() : "";
  program.duration = duration;
  return program;
};

export const updatePrograms = (uprograms) => {
  return (dispatch, getState) => {
    const newPrograms = getState().pump.programs;
    Object.keys(uprograms).forEach((k) => {
      if (k > 2 && uprograms[k] && !isEmpty(uprograms[k])) {
        newPrograms[k] = uprograms[k];
      }
    });
    dispatch(updatePumpStatus({
      programs: newPrograms,
    }));
    AsyncStorage.setItem(
      STORAGE_PROGRAMS,
      JSON.stringify(newPrograms),
      () => {
        const { uid } = firebase.auth().currentUser;
        AsyncStorage.getItem(ADDED_CREATED_ID).then((val) => {
          if (!val || val !== uid) {
            dispatch(addCreatedIdToLegacy());
          }
        });
      }
    );
  };
};

export const savePauseProgram = (id, program) => {
  const user = firebase.auth().currentUser;
  user && firebase.database().ref(`userdata/${user.uid}/pausePrograms/${id}`).set(program);
};

export const updatePausePrograms = (pausePrograms) => {
  return (dispatch) => {
    if (pausePrograms && !isEmpty(pausePrograms)) {
      AsyncStorage.setItem("program-pause", JSON.stringify(pausePrograms));
    }
  };
};

export const setCurrentProgram = (program, correctIndex = true) => {
  return (dispatch) => {
    console.log("Setting program:1", JSON.stringify(program));
    if (correctIndex && !!program?.steps?.length) {
      const needCorrectIndex = program.steps.some((step) => {
        // If steps do not have index key
        return !(Object.prototype.hasOwnProperty.call(step, "index"));
      });

      if (needCorrectIndex) {
        program.steps.forEach((x, index) => {
          x.index = index;
        });
      }
    }
    console.log("Setting program:2", JSON.stringify(program));
    dispatch({
      type: SET_CURRENT_PROGRAM,
      payload: {
        currentProgram: { ...program },
      }
    });
  };
};

export const setCurrentSession = (session) => {
  return (dispatch) => {
    dispatch({
      type: SET_CURRENT_SESSION,
      payload: {
        currentSession: session,
      }
    });
  };
};

export const addEmptySession = (id) => {
  return (dispatch, getState) => {
    const newPrograms = getState().pump.programs;
    newPrograms[id].steps.push({});
    dispatch(updatePumpStatus({
      programs: newPrograms,
    }));
  };
};

export const rememberDevice = (id) => {
  return (dispatch) => {
    dispatch(updatePumpStatus({ id, showPumpAdd: true }));
    AsyncStorage.setItem(REMEMBER_DEVICE_ID, id);
  };
};

export const forgetDevice = (shouldResetTab) => {
  return (dispatch, getState) => {
    AsyncStorage.removeItem(REMEMBER_DEVICE_ID);

    const pumpState = getState().pump;

    const finishForgetDevice = () => {
      dispatch(updatePumpStatus({
        id: null,
        connectedId: null,
      }));
      // dispatch(setSuperGenieLoad(!shouldResetTab));
    };

    if (pumpState.playStatus === C.OP_START || pumpState.playStatus === C.OP_PAUSE) {
      console.log("pump is stopping...");

      sendPacket(createPacket(C.OP_STOP));

      setTimeout(() => {
        if (pumpState.connectStatus === CONNECTED) {
          dispatch(disconnect());
          setTimeout(() => {
            finishForgetDevice();
          }, 1000);
        }
      }, 2000);
    } else if (pumpState.connectStatus === CONNECTED) {
      dispatch(disconnect());
      setTimeout(() => {
        finishForgetDevice();
      }, 1000);
    } else {
      finishForgetDevice();
    }
  };
};

export const updateImageCard = (imageCard) => {
  return (dispatch) => {
    dispatch(updatePumpStatus({
      imageCard,
    }));
  };
};

export const checkForStoredProgramImages = (uid) => {
  return (dispatch) => {
    AsyncStorage.getItem(STORAGE_PROGRAM_IMAGES)
      .then((val) => {
        if (val) {
          const newVal = JSON.parse(val);

          if (newVal[uid]) {
            // eslint-disable-next-line no-restricted-syntax
            for (const key of Object.keys(newVal[uid])) {
              AsyncStorage.setItem(key, newVal[uid][key]);
            }

            dispatch(updatePumpStatus({
              imageCard: newVal[uid]
            }));
          }
        }
      });
  };
};

export const setInitialProgramState = (initialState) => {
  return (dispatch) => {
    dispatch(
      {
        type: INITIAL_PROGRAM_STATE,
        payload: initialState
      }
    );
  };
};

export const setUpProgram = (currentProgram, speed, strength) => {
  return (dispatch) => {
    const programData = JSON.parse(JSON.stringify(currentProgram.steps)); // Deep cloning

    console.log("Setup1:", JSON.stringify(programData), currentProgram.steps);

    // Add original index tag to steps
    for (let i = 0; i < programData.length; i++) {
      if (programData[i]) {
        programData[i].originalIndex = i;
      }
    }

    console.log("Setup2:", JSON.stringify(programData), currentProgram.steps);

    AsyncStorage.getItem("program-pause").then((val) => {
      const pauseSeq = {};
      let hasPauseStep;

      if (val) {
        const newVal = JSON.parse(val);
        // If pause exists in current program
        if (Object.prototype.hasOwnProperty.call(newVal, currentProgram.id)) {
          hasPauseStep = true;
          // Add to steps and setState
          Object.keys(newVal[currentProgram.id]).forEach((key) => {
            // Do same for altered steps
            programData.splice(key, 0, {
              index: key,
              duration: newVal[currentProgram.id][key].duration,
              pause: true
            });

            pauseSeq[key] = {
              index: key,
              duration: newVal[currentProgram.id][key].duration
            };
          });

          for (let i = 0; i < programData.length; i++) {
            programData[i].index = i;
          }
        }
      }

      // Set initial vacuum, cycle, mode options
      const modeId = programData[0].mode;
      const modeConfig = MODES[modeId];

      const vacuumOptions = modeConfig.vacuum[0];
      const cycleOptions = modeConfig.cycle[0];

      const obj1 = setCycleIndex(cycleOptions.findIndex((c) => c === speed), modeId, 0);
      const obj2 = setVacuumIndex(vacuumOptions.findIndex((c) => c === strength), modeId, 0);

      // Calculate program duration
      let programDuration = 0;

      programData.forEach((x) => {
        programDuration += x.duration;
      });

      dispatch({
        type: SET_UP_PROGRAM,
        payload: {
          currentTime: 0,
          modeId,
          newProgram: programData,
          programDuration,
          hasPauseStep,
          pauseSeq,
          vacuumOptions,
          cycleOptions,
          ...obj1,
          ...obj2,
          maxVacuumOptionArr: modeConfig.vacuum[0],
          maxCycleOptionArr: modeConfig.cycle[0],
          totalTime: 0
        }
      });
    });
  };
};

export const updateAppState = (stateVal) => {
  return {
    type: UPDATE_APP_STATE,
    payload: stateVal
  };
};

export const cleanProgramUnmount = (payload) => {
  return {
    type: CLEAN_PROGRAM_UNMOUNT,
    payload
  };
};

export const setVacuumIndex = (index, modeId, cycleIndex, mode = null, dispatch = null) => {
  if (index < 0) return {};
  // const { modeId, cycleIndex } = this.state;

  const SG1PumpType = thisPumpDevice === C.PUMP_DEVICE.SUPERGENIE;

  const cycleOptions = SG1PumpType ? (
    MODES[mode || modeId].cycle[index]
  ) : MODES[mode || modeId].sg2_cycle;

  const payload = {
    vacuumIndex: index,
    cycleOptions,
    ...(SG1PumpType && {
      cycleIndex: (cycleOptions.length > cycleIndex ? cycleIndex : cycleOptions.length - 1)
    }),
  };

  if (dispatch) {
    return {
      type: SET_VACUUM_INDEX,
      payload
    };
  }

  return payload;
};

export const setCycleIndex = (index, modeId, vacuumIndex, mode = null, dispatch = null) => {
  if (index < 0) return {};
  // const { modeId, vacuumIndex } = this.state;

  const SG1PumpType = thisPumpDevice === C.PUMP_DEVICE.SUPERGENIE;

  const vacuumOptions = SG1PumpType ? (
    MODES[mode || modeId].vacuum[index]
  ) : MODES[mode || modeId].sg2_vacuum;

  const payload = {
    cycleIndex: index,
    vacuumOptions,
    ...(SG1PumpType && {
      vacuumIndex: (vacuumOptions.length > vacuumIndex ? vacuumIndex : vacuumOptions.length - 1)
    })
  };

  if (dispatch) {
    return {
      type: SET_CYCLE_INDEX,
      payload
    };
  }

  return payload;
};

export const splitProgramStep = (payload) => {
  return {
    type: SPLIT_PROGRAM_STEP,
    payload
  };
};
