import { Platform } from "react-native";
import { Images, Colors } from "../Themes";
import { LOG_LIST_PREFS } from "./Firebase";

const isIOS = Platform.OS === "ios";

export const FOREGROUND_SERVICE_PLAY_PROGRAM = "foreground_service_play_program";

export const MILILITRE = "mililitre";

export const ANDROID_BUNDLE_ID = "co.pumpables.supergenie.android";
export const IOS_BUNDLE_ID = "co.pumpables.super-genie.ios";
export const IOS_APP_STORE_ID = "1455198957";

export const BLE_SERVICE_COMMUNICATION = isIOS
  ? "FFB0"
  : "0000FFB0-0000-1000-8000-00805F9B34FB";
export const SG2_SHORT_BLE_SERVICE_COMMUNICATION = "ffa0";
export const SG2_BLE_SERVICE_COMMUNICATION = isIOS
  ? "FFA0"
  : "0000FFA0-0000-1000-8000-00805F9B34FB";
export const BLE_CHARACTERISTIC_WRITE = isIOS
  ? "FFB1"
  : "0000FFB1-0000-1000-8000-00805F9B34FB";
export const BLE_CHARACTERISTIC_READ = isIOS
  ? "FFB2"
  : "0000FFB2-0000-1000-8000-00805F9B34FB";
export const SG2_BLE_CHAR_READ_WRITE = isIOS
  ? "FFA1"
  : "0000FFA1-0000-1000-8000-00805F9B34FB";

export const SG2_SERVICE_COMMUNICATION = "2A8A1200-2D00-4E67-8161-BE5F5BE4AB10";
export const SG2_CHARACTERISTIC1 = "2A8A1201-2D00-4E67-8161-BE5F5BE4AB10";
export const SG2_CHARACTERISTIC2 = "2A8A1202-2D00-4E67-8161-BE5F5BE4AB10";
export const SG2_CHARACTERISTIC3 = "2A8A1203-2D00-4E67-8161-BE5F5BE4AB10";
export const SG2_CHARACTERISTIC5 = "2A8A1205-2D00-4E67-8161-BE5F5BE4AB10";
export const SG2_CHARACTERISTIC6 = "2A8A1206-2D00-4E67-8161-BE5F5BE4AB10";

export const CONNECT_STATUS = {
  DISCONNECTED: 0,
  CONNECTING: 1,
  CONNECTED: 2
};
export const ON = true;
export const OFF = false;
export const DEVICE_NAME = "SG";

export const PUMP_DEVICE = {
  SUPERGENIE: "SuperGenie",
  SUPERGENIE2: "SuperGenie2",
  SG2: "SG2",
  GG2: "GG2",
  SG_DFU: "SG2_DFU",
  WEARABLE: "Wearable",
};

export const WEARABLE_PAIR_NAME = "WEARABLE PUMP NAME1 & NAME2";

export const OP_STOP = 0x00;
export const OP_START = 0x01;
export const OP_PAUSE = 0x02;
export const OP_UPDATE = 0x10;
export const OP_STATUS = 0x11;
export const OP_STATUS_RESPONSE = 0x12;
export const OP_LIGHT = 0x20;
export const OP_PROGRAM_SHOW = 0x30;
export const OP_PROGRAM_SHOW_RESPONSE = 0x31;
export const OP_PROGRAM_SHOW_RESPONSE_BODY = 0x32;
export const OP_PROGRAM_START = 0x33;
export const OP_PROGRAM_START_BODY = 0x34;
export const OP_PROGRAM_SAVE = 0x35;
export const OP_PROGRAM_SAVE_BODY = 0x36;
export const OP_PROGRAM_DELETE = 0x37;
export const OP_TURN_OFF = 0xff;
export const OP_CONNECT_REQUEST = 0x3C;
export const OP_CONNECT_RESPONSE = 0x3D;
export const OP_VERSION = 0x13;
export const OP_VERSION_RESPONSE = 0x14;
export const OP_ACCEPT = 0x3E;
export const OP_REJECT = 0X3F;

export const CONNECT_STATUS_DICT = {
  [CONNECT_STATUS.DISCONNECTED]: "DISCONNECTED",
  [CONNECT_STATUS.CONNECTING]: "CONNECTING",
  [CONNECT_STATUS.CONNECTED]: "CONNECTED",
};

export const OP_DICT = {
  [OP_STOP]: "OP_STOP",
  [OP_START]: "OP_START",
  [OP_PAUSE]: "OP_PAUSE",
  [OP_UPDATE]: "OP_UPDATE",
  [OP_STATUS]: "OP_STATUS",
  [OP_STATUS_RESPONSE]: "OP_STATUS_RESPONSE",
  [OP_LIGHT]: "OP_LIGHT",
  [OP_PROGRAM_SHOW]: "OP_PROGRAM_SHOW",
  [OP_PROGRAM_SHOW_RESPONSE]: "OP_PROGRAM_SHOW_RESPONSE",
  [OP_PROGRAM_SHOW_RESPONSE_BODY]: "OP_PROGRAM_SHOW_RESPONSE_BODY",
  [OP_PROGRAM_START]: "OP_PROGRAM_START",
  [OP_PROGRAM_START_BODY]: "OP_PROGRAM_START_BODY",
  [OP_PROGRAM_SAVE]: "OP_PROGRAM_SAVE",
  [OP_PROGRAM_DELETE]: "OP_PROGRAM_DELETE",
  [OP_TURN_OFF]: "OP_TURN_OFF",
  [OP_CONNECT_REQUEST]: "OP_CONNECT_REQUEST",
  [OP_CONNECT_RESPONSE]: "OP_CONNECT_RESPONSE"
};

export const MODE_EXPRESSION = 0x01;
export const MODE_STIMULATION = 0x02;

export const LIGHT_HIGH = 0xff;
export const LIGHT_LOW = 0x7f;
export const LIGHT_OFF = 0x00;

export const PROGRAM_STEPS = {
  letdown: "letdown",
  expression: "expression",
  pause: "pause",
};

export const BREAST_TYPE = {
  left: "left",
  right: "right",
  both: "double"
};

export const SESSION_STARTED_AT = "startedAt";
export const SESSION_FINISHED_AT = "finishedAt";

export const EMPTY_SESSION = {
  duration: 0,
  mode: MODE_STIMULATION,
  vacuum: 0,
  cycle: 0
};

export const EMPTY_PROGRAM = {
  id: null,
  name: "",
  description: "",
  duration: 0,
  tags: [],
  steps: [{ ...EMPTY_SESSION }, { ...EMPTY_SESSION }],
};

export const PROGRAM_LIBRARY_BODY = {
  userUUID: "",
  name: "",
  pumpName: "",
  tags: [],
  steps: [],
};

export const hexToHuman = (hex) => `0x00${hex.toString(16)}`.substr(-2, 2);

export const SESSION_EDITING = -1;
export const SESSION_BEGIN = 0;
export const SESSION_RUNNING = 1;
export const SESSION_PAUSED = 2;
export const SESSION_STOPPED = 3;

export const SESSION_ACTION_TYPE_MANUAL = "manual";
export const SESSION_KIND_MANUAL = "manual";
export const SESSION_KIND_RECORDING = "recording";
export const SESSION_TYPE_PUMP = "pump";

export const measureUnitModalDataArr = [
  {
    titl: "ml",
    type: "radio",
    key: "mililitre",
    shortTitle: "ml"
  },
  {
    titl: "US oz.",
    type: "radio",
    key: "us_ounce",
    shortTitle: "oz"
  },
  {
    titl: "UK oz.",
    type: "radio",
    key: "uk_ounce",
    shortTitle: "oz"
  }
];

export const PROGRAM_TYPE = [
  { id: "my_program", label: "My Programs" },
  { id: "library", label: "Pumpables Library", isSelected: true },
];

export const PUMP_TYPE = [
  {
    id: "sg", name: "Super Genie", key: PUMP_DEVICE.SUPERGENIE, images: [Images.sg_green, Images.sg_white], isSelected: true
  },
  {
    id: "genie_advanced", name: "Genie Advanced", key: PUMP_DEVICE.GG2, images: [Images.ga_white, Images.ga_green],
  },
];

export const PUMPING_TAGS = [
  {
    id: "beginner",
    label: "Beginner Tutorial",
    description: "Beginner pumpers learning how to use the SuperGenie",
  },
  {
    id: "quick",
    label: "Quick Pump",
    description: "Power session under 20 minutes"
  },
  {
    id: "daily",
    label: "Daily Pump",
    description:
      "Pump program that works well for most pumpers to use regularly i.e. Amber's Program",
  },
  {
    id: "lactation",
    label: "Induce Lactation",
    description:
      "Parents who are puming exclusively, looking to induce lactation with the pump",
  },
  {
    id: "cluster",
    label: "Cluster Pump",
    description: "On / off pumping to boost supply",
  },
];

export const DEFAULT_PROGRAM_ID = 101;
export const AMBER_PROGRAM_ID = 0;
export const MANUAL_PROGRAM_ID = -1;
export const NO_AVAILABLE_PROGRAM_ID = -1;
export const HIGHEST_PROGRAM_ID = 255;
export const importProgramLink = "importProgramLink";
export const pumpFWCheckTime = "pumpFWCheckTime";
export const SHARE_DOMAIN_URI_PREFIX = "https://pumpables.page.link";
export const SHARE_DOMAIN_URI_PREFIX_SHORT = "pumpables.page.link";
export const CONTACT_URL = "https://pumpables.co/pages/contact-us";
export const FRB_USER_REQUESTS = "userRequests";

export const LAST_PLAY_MODE = {
  MANUAL: "manual",
  PROGRAM: "program",
};

export const programMoreSelectionData = [
  {
    titl: "Edit program", icon: "edit", iconColor: Colors.tertiary, key: 3
  },
  {
    titl: "Duplicate program", icon: "content-copy", iconColor: Colors.windowsBlue, key: 6
  },
  {
    titl: "Share program to Pumpables Library", subTitle: "Share your program to the community", icon: "share-square-o", iconType: "FontAwesome", iconColor: Colors.lightBlue, key: 5
  },
  {
    titl: "Share program to friends", icon: "share", iconColor: Colors.lightGrey2, key: 2
  },
  {
    titl: "Sync program", icon: "sync", key: 1
  },
  {
    titl: "Delete program", icon: "delete", iconColor: Colors.coral, key: 4
  },
];

export const LOG_TIMER = "log_timer";
export const MANUAL_TIMER = "manual_timer";
export const PROGRAM_TIMER = "program_timer";

export const IN_DST = "in_dst";
export const OUT_DST = "out_dst";

export const PUMP_CHART_TYPE = "_session_pump";
export const NURSE_CHART_TYPE = "_session_feed";
export const STASH_ADDED_CHART_TYPE = "_stash_added";
export const STASH_REMOVED_CHART_TYPE = "_stash_removed";
export const SESSION_TYPE_ADDED = "added";
export const SESSION_TYPE_REMOVED = "removed";

export const STASH_TUTORIAL = [
  {
    titleText: "Switch to Stash module",
    msgText: "To switch to Stash module, tap Logs icon on the navbar, then tap Stash",
    btnText: "NEXT",
    direction: "top",
    xOffset: "30%",
    yOffset: "10%"
  },
  {
    titleText: "Add or Remove",
    msgText: "To add breast milk to your stash, tap +, input amount, then save it. To remove breast milk from your stash, tap -, input amount, then save it.",
    btnText: "NEXT",
    direction: "top",
    xOffset: "30%",
    yOffset: "10%"
  },
  {
    titleText: "Stash data",
    msgText: "'Available now' is available stash amount in your fridge. 'Added'/'Removed' is total added/removed stash amount within today/this week/this month respectively.",
    btnText: "NEXT",
    direction: "top",
    xOffset: "30%",
    yOffset: "10%"
  },
  {
    titleText: "Switch to graph view",
    msgText: "To switch to graph view, tap VIEW button to check both Added and Removed charts",
    btnText: "DONE",
    direction: "top",
    xOffset: "30%",
    yOffset: "10%"
  }
];

export const LOGS_TAB = "logs_tab";
export const STASH_TAB = "stash_tab";
export const NO_PROGRAM_VALUE = "noProgram";

export const PUMP_DATA_TYPE = "Pumped";
export const NURSE_DATA_TYPE = "Nursed";
export const ALL_DATA_TYPE = "All";
export const STASH_DATA_TYPE = "Stash";
export const STASH_DATA_ADD = "Stash_Add";
export const STASH_DATA_REMOVE = "Stash_Remove";

export const ALL_RANGE_START_AT = "01-01-2010";
export const ALL_RANGE_DATE_FORMAT = "DD-MM-YYYY";

export const EXPORT_DATA_TYPE = {
  [PUMP_DATA_TYPE]: {
    title: "Pumped Statistics"
  },
  [NURSE_DATA_TYPE]: {
    title: "Nursed Statistics"
  },
  [STASH_DATA_ADD]: {
    title: "Stash-Added Statistics"
  },
  [STASH_DATA_REMOVE]: {
    title: "Stash-Removed Statistics"
  }
};

export const CSV = "csv";
export const XLSX = "xlsx";
export const MIME_TYPES = {
  audio: {
    uri: Images.audioFile
  },
  video: {
    uri: Images.videoFile
  },
  doc: {
    uri: Images.docFile
  }
};

export const DEFAULT_PROFILE = {
  babyBirthday: 0,
  breastType: BREAST_TYPE.right,
  createdAt: 0,
  displayName: "",
  pictureUrl: "",
  email: "",
  isFacebook: false,
  measureUnit: "mililitre",
  defaultSessionType: "pump",
  pumpSessionGoal: 0,
  uid: null,
  utcOffset: 0,
  [LOG_LIST_PREFS]: {
    showProgram: false,
    showNotes: false
  }
};
