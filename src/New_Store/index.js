import {
  combineReducers, createStore, applyMiddleware, compose
} from "redux";
import thunk from "redux-thunk";

import AuthReducer from "./Auth";
import StatusReducer from "./Status";
import LogsReducer from "./Logs";
import PumpReducer from "./Pump";
import SessionReducer from "./Session";
import ScheduleReducer from "./Schedule";
import GoalsReducer from "./Goals";

import { LOGGED_OUT } from "../Types";

const appReducer = combineReducers({
  auth: AuthReducer,
  status: StatusReducer,
  logs: LogsReducer,
  session: SessionReducer,
  pump: PumpReducer,
  schedule: ScheduleReducer,
  goals: GoalsReducer
});

const rootReducer = (state, action) => {
  if (action.type === LOGGED_OUT) {
    console.log("init redux store===");
    state = undefined;
  }

  return appReducer(state, action);
};

const enhancers = [];

enhancers.push(applyMiddleware(thunk));

// eslint-disable-next-line no-undef
const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

const store = createStore(rootReducer, composeEnhancers(...enhancers));

export default store;
