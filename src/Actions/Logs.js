import firebase from "@react-native-firebase/app";
import sortBy from "sort-by";
import moment from "moment";
import XLSX from "xlsx";
import Share from "react-native-share";

import { addMessage } from "./Status";
import { uploadProfile } from "./Auth";
import { fluidTo } from "../Services/Convert";
import {
  LOGS_UPDATED, RESET_LOGS_SUB, SUMMARY_UPDATED_DAILY,
  SUMMARY_UPDATED_LOGS, GET_PUMP_CHART_DATA, LOG_CHANGE,
  SAVED_LOG, REMOVED_LOG, GET_NURSE_CHART_DATA,
  STASH_SUMMARY, GET_ADDED_CHART_DATA, GET_REMOVED_CHART_DATA
} from "../Types";
import { DELETED_STASH, SAVED_STASH, SOMETHING_WRONG } from "../Config/messages";
import {
  NURSE_CHART_TYPE, PUMP_CHART_TYPE, STASH_ADDED_CHART_TYPE,
  STASH_REMOVED_CHART_TYPE, BREAST_TYPE, PUMP_DATA_TYPE,
  ALL_DATA_TYPE, NURSE_DATA_TYPE, STASH_DATA_TYPE,
  STASH_DATA_ADD, STASH_DATA_REMOVE, SESSION_TYPE_REMOVED,
  SESSION_TYPE_ADDED, EXPORT_DATA_TYPE, CSV,
  ALL_RANGE_START_AT, ALL_RANGE_DATE_FORMAT
} from "../Config/constants";
import { reset } from "./Session";
import {
  getCorrectDuration, getFullDate, getFullMonth,
  getHourMinSec
} from "../Services/SharedFunctions";
import { EXPORT_LOGS_STASH_SUCCESS } from "../Config/Analytics";
import { LOG_LIST_PREFS } from "../Config/Firebase";

const trackedTypes = ["", "session", "stash", "goalMotivator", "reminder"]; // COMBAK: Put in const file

const getUserdataRef = (uid, path = "") => firebase.database().ref(`userdata/${uid}/${path}`);

const getProfileRef = (uid, path = "") => getUserdataRef(uid, `profile/${path}`);

const getLogsRef = (uid, path = "") => getUserdataRef(uid, `logs/${path}`);

const getStashRef = (uid, path = "") => getUserdataRef(uid, `stash/${path}`);

export const initStash = () => {
  return (dispatch) => {
    const { uid } = firebase.auth().currentUser;

    getStashRef(uid)
      .orderByChild("startedAt")
      .on("value", (snapshot) => {
        const val = snapshot.val();
        let stashArr = [];
        let stashSummaryHourlyDaily = {};

        if (val) {
          stashArr = Object.values(val).sort((a, b) => b.startedAt - a.startedAt);
          stashSummaryHourlyDaily = JSON.parse(JSON.stringify(val));
          stashSummaryHourlyDaily = formatStashForChart(stashSummaryHourlyDaily);
        }

        const totalStash = stashArr.reduce((sum, item) => {
          if (item.sessionType === "added") {
            return sum + item.volume;
          }
          return sum - item.volume;
        }, 0);

        dispatch({
          type: STASH_SUMMARY,
          payload: {
            summariesUpdatedAt: Date.now(),
            stashArr,
            totalStash,
            stashSummaryHourlyDaily
          }
        });
      });
  };
};

const logChange = (logsMap, dispatch) => {
  const summaryHourlyDaily = {};

  logsMap.forEach((value, key) => {
    summaryHourlyDaily[key] = value;
  });

  const obj = logsUpdatedAt(logsMap, Date.now());

  dispatch({
    type: LOG_CHANGE,
    payload: {
      summaryHourlyDaily,
      summariesUpdatedAt: Date.now(),
      ...obj.payload
    }
  });
};

export const logWrite = (snapshot, logsMap, type) => {
  return function (dispatch) {
    const log = snapshot.val();
    console.log("logWrite:", log, type, snapshot);
    if (logsMap) {
      if (log.deletedAt) {
        logsMap.delete(snapshot.key);
      } else {
        logsMap.set(snapshot.key, log);
      }

      logChange(logsMap, dispatch);
    }
  };
};

export const logDelete = (snapshot, logsMap) => {
  return function (dispatch) {
    logsMap.delete(snapshot.key);

    logChange(logsMap, dispatch);
  };
};

export const logsUpdatedAt = (logsMap, logsUpdatedTime) => {
  const tomorrow = moment()
    .add(1, "day")
    .startOf("day")
    .format("x");

  let logsArray = [];

  if (logsMap) {
    logsArray = Array.from(logsMap.values())
      .filter(
        ({
          createdAt, startedAt, deletedAt, type
        }) => (startedAt || createdAt) < tomorrow
          && !deletedAt && trackedTypes.indexOf(type) > 0
      )
      .sort(sortBy("-startedAt"));
  }

  // console.log("Logs filtered 2:", logsMap, logsArray);

  return ({
    type: LOGS_UPDATED,
    payload: {
      logsMap,
      logsArray,
      logsUpdatedAt: logsUpdatedTime
    }
  });
};

export const resetLogSubscription = () => {
  // COMBAK: ORANGE put uid in to forget correct path
  // getLogsRef().off();
  // getSummariesRef().off();
  // getSummariesRef("daily").off();
  // getSummariesRef("hourly").off();
  // getSummariesRef("pumped").off();

  if (this.store) {
    this.store.clear();
  }

  return ({
    type: RESET_LOGS_SUB,
    payload: {
      summaryDaily: 0,
      summaryHourlyDaily: 0,
      summaryPumped: 0,
      uid: null
    }
  });
};

export const summaryUpdated = (snapshot) => {
  return function (dispatch) {
    if (snapshot.key === "stashed") {
      // COMBAK: not sure if needed this.summaryStashed = parseFloat(snapshot.val() || 0);
    } else if (snapshot.key === "pumped") {
      // COMBAK: not sure if needed this.summaryStreak = parseFloat(snapshot.val() || 0);
    } else if (snapshot.key === "daily") {
      dispatch({
        type: SUMMARY_UPDATED_DAILY,
        payload: {
          summaryDaily: snapshot.val() || {},
          summariesUpdatedAt: Date.now()
        }
      });
    } else if (snapshot.ref.path.indexOf("/daily/") > 0) {
      console.error("SHOULD NOT BE");
      // this.summaryDaily[snapshot.key] = snapshot.val();
    } else if (snapshot.key === "logs") {
      dispatch({
        type: SUMMARY_UPDATED_LOGS,
        payload: {
          summaryHourlyDaily: snapshot.val() || {},
          summariesUpdatedAt: Date.now()
        }
      });
    } else if (snapshot.ref.path.indexOf("/hourly/") > 0) {
      console.error("SHOULDN'T BE");
      // this.summaryHourlyDaily[snapshot.key] = snapshot.val();
    }
  };
};

const formatStashForChart = (stashSummaryHourlyDaily) => {
  const newObj = {};

  // eslint-disable-next-line no-restricted-syntax, no-unused-vars
  for (const [key, value] of Object.entries(stashSummaryHourlyDaily)) {
    const startedAtMoment = moment(value.startedAt, "x");

    value.key = `${value.key}_stash_${value.sessionType}`;
    value.datestamp = startedAtMoment.format("YYYYMMDD");
    value.hourstamp = startedAtMoment.format("YYYYMMDDHH");

    newObj[value.key] = value;
  }

  return newObj;
};

const formatChartData = (type, summaryHourlyDaily, dataType) => {
  const initialProp = summaryHourlyDaily;

  // First capture only dataType sessions
  const almostPropArr = Object.keys(initialProp)
    // eslint-disable-next-line no-bitwise
    .filter((key) => key.indexOf(dataType) > -1 & !(Object.prototype.hasOwnProperty.call(initialProp[key], "deletedAt")));

  const prop = Object.keys(initialProp)
    .filter((key) => almostPropArr.includes(key))
    .reduce((obj, key) => {
      obj[key] = initialProp[key];
      return obj;
    }, {});

  const obj = {};
  // Put needed values in object
  for (let i = 0; i < almostPropArr.length; i++) {
    const { duration, volume, totalDuration } = prop[almostPropArr[i]];
    const timestamp = type === "hourly" ? prop[almostPropArr[i]].hourstamp : prop[almostPropArr[i]].datestamp;

    if (obj[timestamp]) {
      const durOrTotal = duration || totalDuration || 0;
      let newDur = obj[timestamp].duration ? obj[timestamp].duration + durOrTotal : 0;
      let newTotalDur = obj[timestamp].totalDuration
        ? obj[timestamp].totalDuration + durOrTotal : 0;

      if (newDur === 0 && newTotalDur === 0 && durOrTotal) {
        if (duration) {
          newDur = duration;
        } else if (totalDuration) {
          newTotalDur = totalDuration;
        }
      }

      obj[timestamp] = {
        duration: newDur,
        totalDuration: newTotalDur,
        volume: obj[timestamp].volume + volume,
        timestamp
      };
    } else {
      obj[timestamp] = {
        // Give preference to duration(to be backward compatible, duration
        // and totalDuration are both logged for timer sessions)
        // Previous logs by previous dev didn't differentiate between manual and timer sessions
        duration: duration || 0,
        totalDuration: duration ? 0 : (totalDuration || 0),
        volume,
        timestamp
      };
    }
  }

  return obj;
};

export const getChartData = (
  { chartDate, chartType, summaryHourlyDaily },
  dontUpdateStore,
  measureUnit,
  dataType = PUMP_CHART_TYPE
) => {
  let chartVolume = 0;
  let chartDuration = 0;
  const chartData = [];
  let chartTitle = "";
  let chartMaxVolume = 0;
  let chartMaxDuration = 0;

  const isDay = chartType === "DAY";

  const stampFormat = isDay ? "YYYYMMDDHH" : "YYYYMMDD";
  const timeUnit = isDay ? "hour" : "day";

  const chartDateMoment = moment(chartDate, "x");
  const referenceMoment = moment(chartDate, "x");
  let referenceStamp = referenceMoment.format(stampFormat);

  // End of day/week/month
  const endOfTimeRef = referenceMoment;
  const endOfTime = moment(chartDate, "x").endOf(chartType); // Changeable
  const timeToAdd = endOfTime.diff(endOfTimeRef, chartType === "DAY" ? "hours" : "days");
  endOfTimeRef.add(timeToAdd, chartType === "DAY" ? "hour" : "day").startOf(timeUnit);
  referenceStamp = endOfTimeRef.format(stampFormat);

  // Start of day/week/month
  const startOfTime = moment(chartDate, "x").startOf(chartType);
  const timeToSubtract = referenceMoment.diff(startOfTime, chartType === "DAY" ? "hours" : "days");
  referenceMoment.subtract(timeToSubtract, chartType === "DAY" ? "hour" : "day").startOf(timeUnit);

  let timestamp = referenceMoment.format(stampFormat);

  const source = isDay ? formatChartData("hourly", summaryHourlyDaily, dataType) : formatChartData("daily", summaryHourlyDaily, dataType);

  if (isDay) {
    chartTitle = chartDateMoment.format("MMM D YYYY");
  } else if (chartType === "WEEK") {
    const weekEndDateMoment = referenceMoment.clone().add(6, "day").startOf(timeUnit);

    chartTitle = `${referenceMoment.format("MMM D")} - ${weekEndDateMoment.format("MMM D YYYY")}`;
  } else {
    chartTitle = chartDateMoment.format("MMMM YYYY");
  }

  while (timestamp <= referenceStamp) {
    const summary = source[timestamp] || {
      duration: 0,
      totalDuration: 0,
      volume: 0,
      timestamp
    };

    const dataItem = {
      ...summary,
      volume: fluidTo({
        measureUnit,
        value: summary.volume,
        timestamp: String(summary.timestamp),
        showUnit: false
      })
    };

    const logDuration = summary.duration || summary.totalDuration || 0;

    dataItem.timestamp = String(summary.timestamp);
    dataItem.actualDuration = logDuration / 60; // Seconds to minutes
    chartData.push(dataItem);

    chartDuration += logDuration;
    chartVolume += summary.volume;

    if (summary.volume > chartMaxVolume) {
      chartMaxVolume = summary.volume;
    }

    if ((logDuration / 60) > chartMaxDuration) {
      chartMaxDuration = logDuration / 60;
    }

    referenceMoment.add(1, timeUnit);
    timestamp = referenceMoment.format(stampFormat);
  }

  const chartDurationString = getHourMinSec(chartDuration);

  const payload = {
    chartData,
    chartTitle,
    chartDurationString,
    chartVolume,
    chartMaxVolume,
    chartMaxDuration
  };

  if (dontUpdateStore) {
    return payload;
  }

  let payloadType = null;
  switch (dataType) {
    case PUMP_CHART_TYPE:
      payloadType = GET_PUMP_CHART_DATA;
      break;
    case NURSE_CHART_TYPE:
      payloadType = GET_NURSE_CHART_DATA;
      break;
    case STASH_ADDED_CHART_TYPE:
      payloadType = GET_ADDED_CHART_DATA;
      break;
    case STASH_REMOVED_CHART_TYPE:
      payloadType = GET_REMOVED_CHART_DATA;
      break;
    default:
      break;
  }

  return ({
    type: payloadType,
    payload
  });
};

export const save = (uid, log, prepareLogPage = false) => {
  return function (dispatch) {
    if (!log.createdAt) {
      log.createdAt = Date.now();
    }
    log.updatedAt = Date.now();

    console.log("Got log:", log);

    // Prepares log editing page
    if (prepareLogPage) {
      dispatch(reset(log));
    }

    getLogsRef(uid, log.key)
      .update(log)
      .then(() => {
        dispatch({
          type: SAVED_LOG
        });
      });
  };
};

export const setBreastType = (type) => {
  const { uid } = firebase.auth().currentUser;

  uploadProfile(uid, { breastType: type });
};

// eslint-disable-next-line no-unused-vars
export const remove = (key, logsMap = null) => {
  return (dispatch) => {
    // logsMap.delete(key);

    const { uid } = firebase.auth().currentUser;
    getLogsRef(uid, key).remove()
      .then(() => {
        console.log(`${key} removed successfully!`);

        dispatch({
          type: REMOVED_LOG,
          payload: {
            logsUpdatedAt: Date.now()
          }
        });
      })
      .catch((error) => {
        console.log(error);
        addMessage(error.message);
      });
  };
};

export const saveStash = (uid, stash) => {
  return (dispatch) => {
    if (!stash.createdAt) {
      stash.createdAt = Date.now();
    }
    stash.updatedAt = Date.now();

    getStashRef(uid, stash.key)
      .update(stash)
      .then(() => {
        dispatch(addMessage(SAVED_STASH));
      }).catch(() => {
        dispatch(addMessage(SOMETHING_WRONG));
      });
  };
};

export const deleteStashRecord = (uid, key) => {
  return (dispatch) => {
    getStashRef(uid, key).remove()
      .then(() => {
        dispatch(addMessage(DELETED_STASH));
      }).catch(() => {
        dispatch(addMessage(SOMETHING_WRONG));
      });
  };
};

const downloadLogsStash = (dataType, startAt, endAt) => {
  return new Promise((resolve) => {
    const { uid } = firebase.auth().currentUser;
    const data = [];

    switch (dataType) {
      case PUMP_DATA_TYPE:
      case NURSE_DATA_TYPE:
        getLogsRef(uid)
          .orderByChild("startedAt")
          .startAt(startAt)
          .endAt(endAt)
          .once("value", (snapshot) => {
            const logsVal = snapshot.val();

            if (logsVal) {
              // eslint-disable-next-line no-unused-vars, no-restricted-syntax
              for (const key of Object.keys(logsVal)) {
                if (dataType === PUMP_DATA_TYPE && key.indexOf(PUMP_CHART_TYPE) > -1) {
                  data.push(logsVal[key]);
                }

                if (dataType === NURSE_DATA_TYPE && key.indexOf(NURSE_CHART_TYPE) > -1) {
                  data.push(logsVal[key]);
                }
              }
            }
            resolve(data.sort((a, b) => a.startedAt - b.startedAt));
          });
        break;
      case STASH_DATA_ADD:
      case STASH_DATA_REMOVE:
        getStashRef(uid)
          .orderByChild("startedAt")
          .startAt(startAt)
          .endAt(endAt)
          .once("value", (snapshot) => {
            const logsVal = snapshot.val();

            if (logsVal) {
              // eslint-disable-next-line no-unused-vars, no-restricted-syntax
              for (const key of Object.keys(logsVal)) {
                if (
                  dataType === STASH_DATA_ADD && logsVal[key].sessionType === SESSION_TYPE_ADDED
                ) {
                  data.push(logsVal[key]);
                }

                if (
                  dataType === STASH_DATA_REMOVE
                    && logsVal[key].sessionType === SESSION_TYPE_REMOVED
                ) {
                  data.push(logsVal[key]);
                }
              }
            }
            resolve(data);
          });
        break;
      default:
        break;
    }
  });
};

const formatLogsStashForExport = (dataType, data, startAt, endAt) => {
  const dataArr = [
    [EXPORT_DATA_TYPE[dataType].title, "", "", "from", moment(startAt).format("MM-DD-YYYY")],
    ["", "", "", "to", moment(endAt).format("MM-DD-YYYY")],
    [],
    [],
    ["", "Total", "Weekly average", "Daily average", "Session average"]
  ];

  const pumpOrNurse = dataType === PUMP_DATA_TYPE || dataType === NURSE_DATA_TYPE;

  const additionalArr = [
    [],
    [
      "Date",
      "Time",
      pumpOrNurse && "Duration[min]",
      dataType !== NURSE_DATA_TYPE && "Amount[ml]",
      pumpOrNurse && "Left[ml]",
      pumpOrNurse && "Right[ml]",
      "Notes"
    ].filter((n) => n)
  ];
  let totalSessions = 0;
  let totalDuration = 0;
  let totalAmount = 0;

  for (let i = 0; i < data.length; i++) {
    totalSessions += 1;
    totalDuration += (dataType === PUMP_DATA_TYPE || dataType === NURSE_DATA_TYPE)
      ? getCorrectDuration(data[i]) / 60 : 0;
    totalAmount += data[i].volume;

    const {
      startedAt, volume, breastType,
      volumeBreastSide, notes
    } = data[i];

    const additionalData = [
      `${getFullMonth(startedAt)}-${getFullDate(startedAt)}-${new Date(startedAt).getFullYear()}`,
      moment(startedAt).format("hh:mm A"),
      pumpOrNurse ? (getCorrectDuration(data[i]) / 60) : "",
      pumpOrNurse ? (
        breastType === BREAST_TYPE.both ? volumeBreastSide.left
          : (breastType === BREAST_TYPE.left ? volume : 0)
      ) : "",
      pumpOrNurse ? (
        breastType === BREAST_TYPE.both ? volumeBreastSide.right
          : (breastType === BREAST_TYPE.right ? volume : 0)
      ) : "",
      notes || ""
    ];

    if (dataType !== NURSE_DATA_TYPE) {
      additionalData.splice(3, 0, volume);
    }

    if (dataType === STASH_DATA_ADD || dataType === STASH_DATA_REMOVE) {
      additionalData.splice(2, 1);
      additionalData.splice(3, 1);
      additionalData.splice(3, 1);
    }

    additionalArr.push(additionalData);
  }

  const totalDays = moment(endAt).diff(moment(startAt), "days");
  const totalWeeks = moment(endAt).diff(moment(startAt), "weeks");

  dataArr.push(
    [
      "Sessions",
      totalSessions,
      totalSessions / (totalWeeks || 1),
      totalDays ? totalSessions / totalDays : "",
      1
    ]
  );

  if (dataType === PUMP_DATA_TYPE || dataType === NURSE_DATA_TYPE) {
    dataArr.push(
      [
        "Duration [min]",
        totalDuration,
        totalDuration / (totalWeeks || 1),
        totalDays ? totalDuration / totalDays : "",
        totalSessions ? totalDuration / totalSessions : ""
      ]
    );
  }

  if (dataType !== NURSE_DATA_TYPE) {
    dataArr.push(
      [
        "Amount [ml]",
        totalAmount,
        totalAmount / (totalWeeks || 1),
        totalDays ? totalAmount / totalDays : "",
        totalSessions ? totalAmount / totalSessions : ""
      ]
    );
  }

  return dataArr.concat(additionalArr);
};

export const exportLogsStash = async ({
  dataTypeArr, startAt, endAt, exportType,
  profileName
}) => {
  let dataArr = [];

  const continueExport = (dataTypeChosen, index) => {
    return new Promise((resolve) => {
      let logsStashData = null;

      // Download and format required data
      downloadLogsStash(dataTypeChosen, startAt, endAt)
        .then((val) => {
          logsStashData = val;
          let newStartAt = startAt;

          if (logsStashData.length > 0 && startAt === (moment(ALL_RANGE_START_AT, ALL_RANGE_DATE_FORMAT).format("x") * 1)) {
            // If ALL date range was selected
            newStartAt = logsStashData[0].startedAt;
            fileNames.splice(
              index,
              1,
              fileNames[index].replace(ALL_RANGE_START_AT, moment(newStartAt).format("MM-DD-YYYY"))
            );
          }

          logsStashData = formatLogsStashForExport(
            dataTypeChosen, logsStashData, newStartAt, endAt
          );
          resolve(logsStashData);
        });
    });
  };

  const getFileName = (dataType) => {
    return (
      (
        `${
          profileName
        }_${
          EXPORT_DATA_TYPE[dataType].title.split(" ").shift().toLowerCase()
        }_${moment(startAt).format("MM-DD-YYYY")
        }_${moment(endAt).format("MM-DD-YYYY")}`
      )
    );
  };

  const fileNames = [];

  for (let i = 0; i < dataTypeArr.length; i++) {
    (
      dataTypeArr[i] !== STASH_DATA_TYPE
        && dataTypeArr[i] !== ALL_DATA_TYPE
    )
      && fileNames.push(`${getFileName(dataTypeArr[i])}.${exportType}`);
  }

  const exportStashIndex = dataTypeArr.indexOf(STASH_DATA_TYPE);
  if (exportStashIndex > -1) {
    dataTypeArr.splice(exportStashIndex, 1);
    dataTypeArr.push(STASH_DATA_ADD);
    fileNames.push(`${getFileName(STASH_DATA_ADD)}.${exportType}`);
    dataTypeArr.push(STASH_DATA_REMOVE);
    fileNames.push(`${getFileName(STASH_DATA_REMOVE)}.${exportType}`);
  }

  let indexOffset = 0;
  for (let i = 0; i < dataTypeArr.length; i++) {
    if (dataTypeArr[i] === ALL_DATA_TYPE) {
      indexOffset += 1;
    } else {
      dataArr.push(continueExport(dataTypeArr[i], i - indexOffset));
    }
  }

  dataArr = await Promise.all(dataArr);

  // Export data
  shareLogsStash(exportType, dataArr, fileNames);
};

export const shareLogsStash = async (exportType, dataArr, fileNames) => {
  console.log("el finale export:", dataArr);

  const filePaths = [];

  for (let i = 0; i < dataArr.length; i++) {
    const wb = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(
      wb,
      XLSX.utils.aoa_to_sheet(dataArr[i]),
      `${dataArr[i][0][0].split(" ").shift()}`
    );

    const wbout = XLSX.write(wb, { type: "base64", bookType: exportType });

    filePaths.push(
      `data:${
        exportType === CSV ? "text/csv" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
      };base64,${wbout}`
    );
  }

  // Share file
  const options = {
    urls: filePaths,
    filenames: fileNames
  };

  Share.open(options)
    .then((res) => {
      console.log(res);
      firebase.analytics().logEvent(EXPORT_LOGS_STASH_SUCCESS);
    })
    .catch((err) => {
      err && console.log(err);
    });
};

export const updateLogListPrefs = (logListPrefs) => {
  return new Promise((resolve) => {
    const { uid } = firebase.auth().currentUser;

    getProfileRef(uid, LOG_LIST_PREFS)
      .update(logListPrefs)
      .then(() => { resolve(); });
  });
};
