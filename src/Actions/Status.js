import Toast from "react-native-toast-message";
import {
  getUserFinishedStashTutorial, getUserFinishedTutorial, setUserFinishedStashTutorial,
  setUserFinishedTutorial
} from "../Services/SharedFunctions";
import {
  APP_STATE_CHANGED, CLEAR_MESSAGE,
  CLEAR_QUEUE, SET_REQUESTING, SET_SUPERGENIE_LOAD,
  TAB_CHANGED, PREV_PLAY_OPTION_SELECTED, VIEWED_PL_TUTORIAL,
  ENTER_MANUAL_MODE, DISPLAY_PUMP_NOW_SELECTION, PLAY_WANTED_TO_PROGRAM,
  SHOW_REVIEW_MODAL, VIEWED_STASH_TUTORIAL
} from "../Types";

export const statusInit = () => {
  return (dispatch) => {
    // Check if user viewed program library tutorial
    getUserFinishedTutorial().then((val) => {
      dispatch({
        type: VIEWED_PL_TUTORIAL,
        payload: !val ? "" : null
      });
    });

    // Check if user viewed milk stash tutorial
    getUserFinishedStashTutorial().then((val) => {
      dispatch({
        type: VIEWED_STASH_TUTORIAL,
        payload: val
      });
    });
  };
};

export function addMessage(
  messageText,
  toastProps = null,
  autoHide = true
  /* , messageType = "", returnObj = false */
) {
  return (dispatch) => {
    Toast.show({
      type: "ctaToast",
      text1: messageText,
      props: toastProps,
      autoHide
    });

    dispatch({
      type: SET_REQUESTING,
      payload: {
        requesting: {},
      },
    });
  };
  // const dispatchObj = {
  //   type: ADD_MESSAGE,
  //   payload: {
  //     current: {
  //       messageId: Date.now(),
  //       messageText,
  //       messageType,
  //     },
  //   },
  // };

  // if (returnObj) {
  //   return dispatchObj;
  // }

  // return function (dispatch) {
  //   dispatch(dispatchObj);
  // };
}

export const addError = (messageText, returnObj = false) => {
  return (dispatch) => {
    const dispatchObj = addMessage(messageText, "error", returnObj);
    dispatch(dispatchObj);
  };
};

export const addWarning = (messageText, returnObj = false) => {
  return function (dispatch) {
    const dispatchObj = addMessage(messageText, "warning", returnObj);
    dispatch(dispatchObj);
  };
};

export const clearMessage = (queue, current) => {
  let messageId = false;
  messageId = current.messageId;
  if (messageId) {
    current = {};
    queue = queue.filter((message) => message.id === messageId);
  }
  if (queue.length > 0) {
    // eslint-disable-next-line prefer-destructuring
    current = queue[0];
  }

  return {
    type: CLEAR_MESSAGE,
    payload: {
      queue,
      current,
    },
  };
};

export const hideToast = () => {
  Toast.hide();
};

export const clearQueue = () => {
  return {
    type: CLEAR_QUEUE,
    payload: {
      queue: [],
    },
  };
};

export const setRequesting = (token) => {
  return (dispatch) => {
    dispatch({
      type: SET_REQUESTING,
      payload: {
        requesting: token,
      },
    });
  };
};

export const setSuperGenieLoad = (val) => {
  return (dispatch) => {
    dispatch({
      type: SET_SUPERGENIE_LOAD,
      payload: {
        superGenieLoad: val,
      },
    });
  };
};

export const viewedPlTutorial = (val) => {
  return (dispatch) => {
    dispatch({
      type: VIEWED_PL_TUTORIAL,
      payload: val ? null : ""
    });

    if (val) {
      setUserFinishedTutorial(true);
    }
  };
};

export const viewedStashTutorial = (val) => {
  return (dispatch) => {
    dispatch({
      type: VIEWED_STASH_TUTORIAL,
      payload: val
    });

    if (val) {
      setUserFinishedStashTutorial(true);
    }
  };
};

export const setTabChanged = (val) => {
  return (dispatch, getState) => {
    const {
      tabChangeParams: { tabToggling },
    } = getState().status;
    const newParams = {
      tabToggling: !tabToggling,
      ...val,
    };

    dispatch({
      type: TAB_CHANGED,
      payload: {
        tabChangeParams: newParams,
      },
    });
  };
};

export const setPrevPlayOptionSelected = (selection) => {
  return (dispatch) => {
    dispatch({
      type: PREV_PLAY_OPTION_SELECTED,
      payload: {
        prevPlayOptionSelected: selection,
      },
    });
  };
};

export const enterManualMode = (val) => {
  return (dispatch) => {
    dispatch({
      type: ENTER_MANUAL_MODE,
      payload: val,
    });
  };
};

export const showReviewModal = (val) => {
  return (dispatch) => {
    dispatch({
      type: SHOW_REVIEW_MODAL,
      payload: val,
    });
  };
};

export const pumpNowSessionDisplay = (val) => {
  return (dispatch) => {
    dispatch({
      type: DISPLAY_PUMP_NOW_SELECTION,
      payload: val,
    });
  };
};

export const playWantedToProgram = (val) => {
  return (dispatch) => {
    dispatch({
      type: PLAY_WANTED_TO_PROGRAM,
      payload: val,
    });
  };
};

export const changeAppState = (val) => {
  return (dispatch) => {
    dispatch({
      type: APP_STATE_CHANGED,
      payload: {
        appState: val,
      },
    });
  };
};
