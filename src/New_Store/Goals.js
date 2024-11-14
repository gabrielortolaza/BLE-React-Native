import { SUBSCRIBE_TO_GOALS, RESET_GOALS } from "../Types";

const initialState = {
  listUpdatedAt: 0,
  list: {}
};

export default function GoalsReducer(state = initialState, action) {
  switch (action.type) {
    case SUBSCRIBE_TO_GOALS || RESET_GOALS:
      return {
        ...state,
        list: action.payload.list,
        listUpdatedAt: action.payload.listUpdatedAt
      };
    default:
      return state;
  }
}
