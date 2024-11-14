import {
  RESET_SESSION, SET_FIELD_TIME, SET_FIELD_OTHER,
  SESSION_START, PAUSE_RECORDING, RESUME_RECORDING,
  STOP_RECORDING, SHOW_TIMER_BUTTON
} from "../Types";

const initialState = {
  key: null,
  actionType: null,
  sessionType: "pump", // COMBAK: Meant to be dynamic, Settings tab
  resumedAt: null,
  startedAt: null,
  finishedAt: null,
  duration: 0,
  durationString: "00",
  notes: null,
  breastType: "right",
  volume: null,
  volumeBreastSide: {
    left: 0,
    right: 0
  },
  status: 0, // 0 = reseted, 1 = running, 2 = paused, 3 = stopped, -1 = editing
  isPaused: false,
  showButton: null,
};

export default function SessionReducer(state = initialState, action) {
  switch (action.type) {
    case RESET_SESSION:
      return {
        ...state,
        lastTickedAt: action.payload.lastTickedAt,
        key: action.payload.key,
        sessionType: action.payload.sessionType,
        createdAt: action.payload.createdAt,
        resumedAt: action.payload.resumedAt,
        startedAt: action.payload.startedAt,
        finishedAt: action.payload.finishedAt,
        notes: action.payload.notes,
        volume: action.payload.volume,
        volumeBreastSide: action.payload.volumeBreastSide,
        duration: action.payload.duration,
        breastType: action.payload.breastType,
        durationString: action.payload.durationString,
        status: action.payload.status
      };
    case SESSION_START:
      return {
        ...state,
        actionType: action.payload.actionType,
        sessionType: action.payload.sessionType,
        startedAt: action.payload.startedAt,
        resumedAt: action.payload.resumedAt,
        ...(action.payload.finishedAt && { finishedAt: action.payload.finishedAt }),
        duration: action.payload.duration,
        status: action.payload.status
      };
    case RESUME_RECORDING:
      return {
        ...state,
        ...(action.payload.resumedAt && { resumedAt: action.payload.resumedAt }),
        ...(action.payload.status && { status: action.payload.status })
      };
    case PAUSE_RECORDING:
      return {
        ...state,
        ...(action.payload.status && { status: action.payload.status }),
        ...(action.payload.duration && { duration: action.payload.duration }),
        ...(action.payload.resumedAt && { resumedAt: action.payload.resumedAt }),
        finishedAt: Date.now()
      };
    case STOP_RECORDING:
      return {
        ...state,
        ...(action.payload.status && { status: action.payload.status }),
        ...(action.payload.duration && { duration: action.payload.duration }),
        ...(action.payload.resumedAt && { resumedAt: action.payload.resumedAt }),
        finishedAt: Date.now()
      };
    case SHOW_TIMER_BUTTON:
      return {
        ...state,
        showButton: action.payload.show
      };
    case SET_FIELD_TIME:
      return {
        ...state,
        startedAt: action.payload.startedAt,
        finishedAt: action.payload.finishedAt
      };
    case SET_FIELD_OTHER:
      return {
        ...state,
        ...(Object.prototype.hasOwnProperty.call(action.payload, "volume")
          && { volume: action.payload.volume }),
        ...(Object.prototype.hasOwnProperty.call(action.payload, "volumeBreastSide")
          && { volumeBreastSide: action.payload.volumeBreastSide }),
        ...(Object.prototype.hasOwnProperty.call(action.payload, "notes")
          && { notes: action.payload.notes }),
        ...(action.payload.breastType && { breastType: action.payload.breastType }),
        ...(action.payload.sessionType && { sessionType: action.payload.sessionType })
      };
    default:
      return state;
  }
}
