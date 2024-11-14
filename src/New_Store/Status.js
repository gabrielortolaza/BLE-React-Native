import {
  ADD_MESSAGE, APP_STATE_CHANGED, CLEAR_MESSAGE,
  CLEAR_QUEUE, SET_REQUESTING, SET_SUPERGENIE_LOAD,
  TAB_CHANGED, PREV_PLAY_OPTION_SELECTED, VIEWED_PL_TUTORIAL,
  ENTER_MANUAL_MODE, DISPLAY_PUMP_NOW_SELECTION, PLAY_WANTED_TO_PROGRAM,
  SHOW_REVIEW_MODAL, VIEWED_STASH_TUTORIAL
} from "../Types";

const initialState = {
  appState: null, // active | inactive | background
  queue: [],
  current: {},
  requesting: {},
  superGenieLoad: true, // always need to access SuperGenie page
  tabChangeParams: {
    tabToggling: false,
  },
  prevPlayOptionSelected: "",
  hasViewedPLTutorial: null,
  hasViewedStashTutorial: true,
  enterManualMode: false,
  displayPumpNowSelection: false,
  canPlayWantedToProgram: false,
  reviewModalVisible: false
};

export default function StatusReducer(state = initialState, action) {
  switch (action.type) {
    case ADD_MESSAGE:
      return { ...state, current: action.payload.current, requesting: {} };
    case CLEAR_MESSAGE:
      return {
        ...state,
        queue: action.payload.queue,
        current: action.payload.current,
        requesting: {}
      };
    case CLEAR_QUEUE:
      return { ...state, queue: action.payload.queue, requesting: {} };
    case SET_REQUESTING:
      return { ...state, requesting: action.payload.requesting };
    case SET_SUPERGENIE_LOAD:
      return { ...state, superGenieLoad: action.payload.superGenieLoad };
    case VIEWED_PL_TUTORIAL:
      return { ...state, hasViewedPLTutorial: action.payload };
    case VIEWED_STASH_TUTORIAL:
      return { ...state, hasViewedStashTutorial: action.payload };
    case ENTER_MANUAL_MODE:
      return { ...state, enterManualMode: action.payload };
    case SHOW_REVIEW_MODAL:
      return { ...state, reviewModalVisible: action.payload };
    case TAB_CHANGED:
      return { ...state, tabChangeParams: action.payload.tabChangeParams };
    case APP_STATE_CHANGED:
      return { ...state, appState: action.payload.appState };
    case PREV_PLAY_OPTION_SELECTED:
      return { ...state, prevPlayOptionSelected: action.payload.prevPlayOptionSelected };
    case DISPLAY_PUMP_NOW_SELECTION:
      return { ...state, displayPumpNowSelection: action.payload };
    case PLAY_WANTED_TO_PROGRAM:
      return { ...state, canPlayWantedToProgram: action.payload };
    default:
      return state;
  }
}
