import {
  FORGOT_PASSWORD, LOGGED_IN, UPDATE_AUTH_STATUS,
  UPDATE_NOTIFICATIONS_ALLOWED, API_AUTH
} from "../Types";
import { DEFAULT_PROFILE } from "../Config/constants";

// COMBAK: auth store should be auth only,
// others should go into user object model

const initialState = {
  hydratation: null,
  hydratationResolve: null,
  uid: null,
  lastUid: null,
  newsletter: true,
  profile: DEFAULT_PROFILE,
  isRequesting: "",
  errorMessage: "",
  profileString: "",
  programs: {},
  pausePrograms: {},
  fcmToken: null,
  notificationsAllowed: false,
  api: {
    accessToken: null,
    authenticated: null
  }
};

export default function AuthReducer(state = initialState, action) {
  switch (action.type) {
    case LOGGED_IN || FORGOT_PASSWORD: // Don't need to call then
      return state;
    case UPDATE_AUTH_STATUS:
      console.log("update auth status:", action.payload);
      return {
        ...state,
        ...action.payload,
      };
    case UPDATE_NOTIFICATIONS_ALLOWED:
      return {
        ...state,
        notificationsAllowed: action.payload
      };
    case API_AUTH:
      return {
        ...state,
        api: {
          accessToken: action.payload.accessToken,
          authenticated: action.payload.authenticated
        }
      };
    default:
      return state;
  }
}
