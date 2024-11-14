import iconLetdown from "../Assets/Images/SuperGenie/iconModeLetdown.png";
import iconExpression from "../Assets/Images/SuperGenie/iconModeExpression.png";
import { DEFAULT_PROGRAM_ID, AMBER_PROGRAM_ID } from "./constants";

export const forbiddenIds = [0, 101];
export const EXPRESSION = 1;
export const GG2_EXPRESSION_VACUUM = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
];
export const SG2_EXPRESSION_VACUUM = [
  1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12
];
export const EXPRESSION_VACUUM = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
];
export const GG2_EXPRESSION_CYCLE = [
  [1, 2, 3],
  [1, 2, 3],
  [1, 2, 3],
  [1, 2, 3],
  [1, 2, 3],
  [1, 2, 3],
  [1, 2, 3],
  [1, 2, 3],
  [1, 2, 3],
  [1, 2, 3]
];
export const SG2_EXPRESSION_CYCLE = [
  40, 42, 44, 46, 48, 50, 52, 54, 56, 58,
  60, 62, 64, 66, 68, 70
];
export const EXPRESSION_CYCLE = [
  [40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70],
  [40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70],
  [40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70],
  [40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70],
  [40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70],
  [40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70],
  [40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70],
  [40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70],
  [40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70],
  [40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70],
  [40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62, 64, 66, 68, 70],
  [40, 42, 44, 46, 48, 50, 52, 54, 56, 58, 60, 62],
  [40, 42, 44, 46, 48, 50, 52, 54, 56, 58],
  [40, 42, 44, 46, 48, 50, 52, 54, 56, 58],
  [40, 42, 44, 46, 48, 50, 52, 54],
  [40, 42, 44, 46, 48, 50, 52, 54],
];
export const EXPRESSION_HEADER_BG = { backgroundColor: "rgb(82, 175, 205)" };
export const EXPRESSION_BODY_BG = { backgroundColor: "rgb(246, 250, 251)" };
export const EXPRESSION_ICON = iconExpression;

export const LETDOWN = 2;
export const GG2_LETDOWN_VACUUM = [
  [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
];
export const SG2_LETDOWN_VACUUM = [
  1, 2, 3, 4, 5
];
export const LETDOWN_VACUUM = [
  [1, 2, 3, 4, 5],
  [1, 2, 3, 4, 5],
  [1, 2, 3, 4, 5],
  [1, 2, 3, 4, 5],
  [1, 2, 3, 4, 5],
  [1, 2, 3, 4, 5],
  [1, 2, 3, 4, 5],
  [1, 2, 3, 4, 5],
  [1, 2, 3, 4, 5]
];
export const GG2_LETDOWN_CYCLE = [
  [1], [1], [1], [1], [1], [1], [1],
  [1], [1], [1]
];
export const SG2_LETDOWN_CYCLE = [
  72, 76, 80, 84, 88, 92, 96, 100, 104
];
export const LETDOWN_CYCLE = [
  [72, 76, 80, 84, 88, 92, 96, 100, 104],
  [72, 76, 80, 84, 88, 92, 96, 100, 104],
  [72, 76, 80, 84, 88, 92, 96, 100, 104],
  [72, 76, 80, 84, 88, 92, 96, 100, 104],
  [72, 76, 80, 84, 88, 92, 96, 100, 104]
];
export const LETDOWN_HEADER_BG = { backgroundColor: "rgb(236, 174, 63)" };
export const LETDOWN_BODY_BG = { backgroundColor: "rgb(255, 251, 249)" };
export const LETDOWN_ICON = iconLetdown;

export const MODES = {
  [EXPRESSION]: {
    title: "Expression",
    vacuum: EXPRESSION_VACUUM,
    cycle: EXPRESSION_CYCLE,
    gg2_vacuum: GG2_EXPRESSION_VACUUM,
    gg2_cycle: GG2_EXPRESSION_CYCLE,
    sg2_vacuum: SG2_EXPRESSION_VACUUM,
    sg2_cycle: SG2_EXPRESSION_CYCLE,
    headerBg: EXPRESSION_HEADER_BG,
    bodyBg: EXPRESSION_BODY_BG,
    icon: EXPRESSION_ICON,
  },
  [LETDOWN]: {
    title: "Letdown",
    vacuum: LETDOWN_VACUUM,
    cycle: LETDOWN_CYCLE,
    gg2_vacuum: GG2_LETDOWN_VACUUM,
    gg2_cycle: GG2_LETDOWN_CYCLE,
    sg2_vacuum: SG2_LETDOWN_VACUUM,
    sg2_cycle: SG2_LETDOWN_CYCLE,
    headerBg: LETDOWN_HEADER_BG,
    bodyBg: LETDOWN_BODY_BG,
    icon: LETDOWN_ICON,
  },
};

export const TIME_OPTIONS = [
  { value: undefined, label: "Custom" }
];

export const program1Default = {
  description: "First time pumpers. Get the most out of SuperGenie",
  duration: 1440,
  id: DEFAULT_PROGRAM_ID,
  name: "Default Program",
  pumpName: "SuperGenie",
  steps:
  [{
    duration: 120, mode: 2, vacuum: 2, cycle: 104, index: 0
  },
  {
    duration: 360, mode: 1, vacuum: 2, cycle: 54, index: 1
  },
  {
    duration: 120, mode: 2, vacuum: 2, cycle: 104, index: 2
  },
  {
    duration: 360, mode: 1, vacuum: 2, cycle: 54, index: 3
  },
  {
    duration: 120, mode: 2, vacuum: 2, cycle: 104, index: 4
  },
  {
    duration: 360, mode: 1, vacuum: 2, cycle: 54, index: 5
  }]
};

export const amberProgram = {
  description: "Crowd fav since 2019 by one of our early users",
  duration: 840,
  id: AMBER_PROGRAM_ID,
  name: "Amber's Program",
  pumpName: "SuperGenie",
  type: "amber",
  steps: [
    {
      duration: 120, mode: 2, vacuum: 3, cycle: 104, index: 0
    },
    {
      duration: 120, mode: 2, vacuum: 4, cycle: 104, index: 1
    },
    {
      duration: 120, mode: 1, vacuum: 8, cycle: 70, index: 2
    },
    {
      duration: 120, mode: 1, vacuum: 10, cycle: 58, index: 3
    },
    {
      duration: 120, mode: 2, vacuum: 4, cycle: 104, index: 4
    },
    {
      duration: 120, mode: 1, vacuum: 8, cycle: 70, index: 5
    },
    {
      duration: 120, mode: 1, vacuum: 10, cycle: 60, index: 6
    }
  ]
};

export const mockPrograms = {
  1:
  {
    description: "Expression  00:01",
    duration: 1,
    id: 1,
    name: "Program 1oou",
    steps: [{
      duration: 1, mode: 1, vacuum: 1, cycle: 68, index: 0
    }]
  },
  2:
  {
    description: "Letdown  13:00 + Letdown  22:00 + Letdown  01:00 + Letdown  02:00 + Letdown  21:00",
    duration: 3540,
    id: 2,
    name: "Program 2",
    steps:
    [{
      duration: 780, mode: 2, vacuum: 1, cycle: 72, index: 0
    },
    {
      duration: 1320, mode: 2, vacuum: 2, cycle: 80, index: 1
    },
    {
      duration: 60, mode: 2, vacuum: 3, cycle: 76, index: 2
    },
    {
      duration: 120, mode: 2, vacuum: 1, cycle: 76, index: 3
    },
    {
      duration: 1260, mode: 2, vacuum: 2, cycle: 88, index: 4
    }]
  },
  3:
  {
    description: "Expression  00:05 + Letdown  00:09 + Expression  00:07",
    duration: 21,
    steps:
    [{
      duration: 5, mode: 1, vacuum: 1, cycle: 70
    },
    {
      duration: 9, mode: 2, vacuum: 1, cycle: 80
    },
    {
      duration: 7, mode: 1, vacuum: 1, cycle: 54
    }],
    id: 3,
    name: "Program 3"
  }
};
