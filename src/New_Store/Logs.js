import {
  LOGS_UPDATED, RESET_LOGS_SUB, SUMMARY_UPDATED_DAILY,
  SUMMARY_UPDATED_LOGS, GET_PUMP_CHART_DATA, LOG_CHANGE,
  SAVED_LOG, REMOVED_LOG, GLOBAL_BREAST_TYPE,
  GET_NURSE_CHART_DATA, STASH_SUMMARY, GET_ADDED_CHART_DATA,
  GET_REMOVED_CHART_DATA
} from "../Types";
import { BREAST_TYPE } from "../Config/constants";

const initialState = {
  uid: null,
  logsUpdatedAt: 0,
  logsArray: [],
  logs: new Map(),
  store: null,
  summariesUpdatedAt: 0,
  milkStash: 0,
  stashArr: [],
  totalStash: 0,
  stashSummaryHourlyDaily: {},
  summaryDaily: {},
  summaryHourlyDaily: {},
  summaryPumped: 0,
  globalBreastType: BREAST_TYPE.left,
  pumpedChart: {
    chartMaxVolume: 0,
    chartMaxDuration: 0
  },
  nursedChart: {
    chartMaxVolume: 0,
    chartMaxDuration: 0
  },
  stashAddedChart: {
    chartMaxVolume: 0
  },
  stashRemovedChart: {
    chartMaxVolume: 0
  }
};

export default function LogsReducer(state = initialState, action) {
  switch (action.type) {
    case GLOBAL_BREAST_TYPE:
      return {
        ...state,
        globalBreastType: action.payload.breastType
      };
    case SAVED_LOG:
      return state;
    case REMOVED_LOG:
      return {
        ...state,
        logsUpdatedAt: action.payload.logsUpdatedAt
      };
    case LOGS_UPDATED:
      return {
        ...state,
        logsArray: action.payload.logsArray,
        logsUpdatedAt: action.payload.logsUpdatedAt,
        logsMap: action.payload.logsMap
      };
    case RESET_LOGS_SUB:
      return {
        ...state,
        summaryDaily: action.payload.summaryDaily,
        summaryHourlyDaily: action.payload.summaryHourlyDaily,
        summaryPumped: action.payload.summaryPumped,
        uid: action.payload.uid
      };
    case SUMMARY_UPDATED_DAILY:
      return {
        ...state,
        summaryDaily: action.payload.summaryDaily,
        summariesUpdatedAt: action.payload.summariesUpdatedAt
      };
    case SUMMARY_UPDATED_LOGS:
      return {
        ...state,
        summaryHourlyDaily: action.payload.summaryHourlyDaily,
        summariesUpdatedAt: action.payload.summariesUpdatedAt
      };
    case STASH_SUMMARY:
      return {
        ...state,
        summariesUpdatedAt: action.payload.summariesUpdatedAt,
        stashArr: action.payload.stashArr,
        totalStash: action.payload.totalStash,
        stashSummaryHourlyDaily: action.payload.stashSummaryHourlyDaily
      };
    case LOG_CHANGE:
      return {
        ...state,
        summaryHourlyDaily: action.payload.summaryHourlyDaily,
        summariesUpdatedAt: action.payload.summariesUpdatedAt,
        logsArray: action.payload.logsArray,
        logsUpdatedAt: action.payload.logsUpdatedAt,
        logsMap: action.payload.logsMap
      };
    case GET_PUMP_CHART_DATA:
      return {
        ...state,
        pumpedChart: {
          chartData: action.payload.chartData,
          chartTitle: action.payload.chartTitle,
          chartDurationString: action.payload.chartDurationString,
          chartVolume: action.payload.chartVolume,
          chartMaxVolume: action.payload.chartMaxVolume,
          chartMaxDuration: action.payload.chartMaxDuration
        }
      };
    case GET_NURSE_CHART_DATA:
      return {
        ...state,
        nursedChart: {
          chartData: action.payload.chartData,
          chartTitle: action.payload.chartTitle,
          chartDurationString: action.payload.chartDurationString,
          chartVolume: action.payload.chartVolume,
          chartMaxDuration: action.payload.chartMaxDuration
        }
      };
    case GET_ADDED_CHART_DATA:
      return {
        ...state,
        stashAddedChart: {
          chartData: action.payload.chartData,
          chartTitle: action.payload.chartTitle,
          chartVolume: action.payload.chartVolume,
          chartMaxVolume: action.payload.chartMaxVolume
        }
      };
    case GET_REMOVED_CHART_DATA:
      return {
        ...state,
        stashRemovedChart: {
          chartData: action.payload.chartData,
          chartTitle: action.payload.chartTitle,
          chartVolume: action.payload.chartVolume,
          chartMaxVolume: action.payload.chartMaxVolume
        }
      };
    default:
      return state;
  }
}
