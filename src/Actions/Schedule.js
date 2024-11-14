import firebase from "@react-native-firebase/app";
import moment from "moment";

import * as RootNavigation from "../App/RootNavigation";
import { IN_DST, OUT_DST } from "../Config/constants";
import { addSubtractHourFromDate } from "../Services/SharedFunctions";
import { UPDATE_SCHEDULE_EVENTS, UPDATE_NEXT_SESSION } from "../Types";

export const updateScheduleEvents = (payload, returnObj = true) => {
  const dispatchObj = {
    type: UPDATE_SCHEDULE_EVENTS,
    payload
  };

  if (returnObj) {
    return dispatchObj;
  }

  return (dispatch) => {
    dispatch(dispatchObj);
  };
};

const pushNotifSchedule = (uid, initialEvents, events, oldDiff, newDiff) => {
  // First delete any old schedules
  for (let i = 0; i < oldDiff.length; i++) {
    const startedAt = new Date(initialEvents[oldDiff[i]].startsAt);
    const timeSlot = `${startedAt.getUTCDay()}_${startedAt.getUTCHours()}_${startedAt.getUTCMinutes()}`;

    firebase.database()
      .ref(`pushNotif/notifications/${timeSlot}/${uid}`)
      .remove();
  }

  // Then add new schedules
  for (let i = 0; i < newDiff.length; i++) {
    const { startsAt } = events[newDiff[i]];
    const startedAt = new Date(startsAt);
    const timeSlot = `${startedAt.getUTCDay()}_${startedAt.getUTCHours()}_${startedAt.getUTCMinutes()}`;

    firebase.database()
      .ref(`pushNotif/notifications/${timeSlot}/${uid}`)
      .update({ startsAt });
  }
};

const getRef = (uid, path = "") => firebase.database().ref(`userdata/${uid}/schedule/${path}`);

export const saveEvents = (initialEvents, events) => {
  return (dispatch, getState) => {
    const { uid } = getState().auth;

    if (Object.getPrototypeOf(events) === Object.prototype) {
      const eventsKeyList = Object.keys(events);
      eventsKeyList.map((eventKey) => {
        if (!events[eventKey].createdAt) {
          events[eventKey].createdAt = events[eventKey].startsAt;
        }
        events[eventKey].updatedAt = Date.now();
      });

      // this will trigger in retriveScheduleData()
      // dispatch(updateScheduleEvents({
      //   events,
      //   eventsUpdatedAt: Date.now(),
      // }));

      if (uid) {
        // Filter for push notifications
        const oldKeys = Object.keys(initialEvents);
        const newKeys = Object.keys(events);

        const oldDiff = oldKeys.filter((x) => !newKeys.includes(x));
        const newDiff = newKeys.filter((x) => !oldKeys.includes(x));

        console.log("Events:", initialEvents, events, oldDiff, newDiff);

        pushNotifSchedule(uid, initialEvents, events, oldDiff, newDiff);
        // Set in user tree
        getRef(uid)
          .set(events)
          .then(() => {
            dispatch(returnNextSession());
          });

        firebase
          .analytics()
          .logEvent("schedule_saved", { updatedAt: Date.now() });
        firebase
          .analytics()
          .setUserProperty("scheduleCount", String(eventsKeyList.length));
      }
    }
  };
};

export const updateDSTSchedule = (typeDST) => {
  return (dispatch, getState) => {
    const initialEvents = getState().schedule.events || {};
    const events = JSON.parse(JSON.stringify(initialEvents));

    const eventsKeyList = Object.keys(events);

    if (eventsKeyList.length === 0) {
      return;
    }

    eventsKeyList.map((eventKey) => {
      if (typeDST === IN_DST) {
        events[eventKey].startsAt = addSubtractHourFromDate(events[eventKey].startsAt, 1);
        events[eventKey].finishAt = addSubtractHourFromDate(events[eventKey].finishAt, 1);
      } else if (typeDST === OUT_DST) {
        events[eventKey].startsAt = addSubtractHourFromDate(events[eventKey].startsAt, -1);
        events[eventKey].finishAt = addSubtractHourFromDate(events[eventKey].finishAt, -1);
      }
      const newEventKey = `schedule_${events[eventKey].startsAt}`;

      events[newEventKey] = events[eventKey];
      events[newEventKey].key = newEventKey;
      delete events[eventKey];
    });

    // Delete all past events
    dispatch(saveEvents(initialEvents, {}));
    // Then send all new ones
    setTimeout(() => {
      dispatch(saveEvents({}, events));
      RootNavigation.replace("Tabs");
    }, 2500);
  };
};

const returnNextSession = () => {
  return (dispatch, getState) => {
    const events = getState().schedule.events || {};
    const now = moment(Date.now());
    const nowInMinutes = now.hour() * 60 + now.minutes();
    const eventsToday = Object.keys(events)
      .map((key) => moment(events[key].startsAt))
      .filter((m) => {
        return m.weekday() === now.weekday();
      })
      .map((m) => m.hour() * 60 + m.minutes())
      .filter((minutes) => minutes > nowInMinutes)
      .sort((a, b) => a - b);

    if (eventsToday.length < 1) {
      dispatch({
        type: UPDATE_NEXT_SESSION,
        payload: "None"
      });
      return;
    }

    const nextSession = eventsToday[0];
    let timeLeft;
    if (nextSession - nowInMinutes > 60) {
      timeLeft = `${Math.floor((nextSession - nowInMinutes) / 60)}h left`;
    } else {
      timeLeft = `${nextSession - nowInMinutes}m left`;
    }

    dispatch({
      type: UPDATE_NEXT_SESSION,
      payload: timeLeft
    });
  };
};

export const initReturnNextSession = () => {
  return (dispatch) => {
    setInterval(() => {
      dispatch(returnNextSession());
    }, 15000);
  };
};
