import { UPDATE_SCHEDULE_EVENTS, UPDATE_NEXT_SESSION } from "../Types";

const initialState = {
  uid: null,
  eventsUpdatedAt: 0,
  events: {},
  nextSession: "None"
};

export default function ScheduleReducer(state = initialState, action = {}) {
  switch (action.type) {
    case UPDATE_SCHEDULE_EVENTS:
      console.log("updating schedule events:", action.payload);
      return {
        ...state,
        events: action.payload.events,
        eventsUpdatedAt: action.payload.eventsUpdatedAt
      };
    case UPDATE_NEXT_SESSION:
      return {
        ...state,
        nextSession: action.payload
      };
    default:
      return state;
  }
}
