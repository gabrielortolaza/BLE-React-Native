import * as C from "../Config/constants";
import {
  LETDOWN, EXPRESSION
} from "../Config/Modes";
import { dec2bin4, dec2bin8, pumpToAppCycle } from "./SharedFunctions";

export const createPacket = (type, data) => {
  let input;

  if (data && data.length > 0) {
    input = [data.length + 2, type].concat(data);
  } else {
    input = [2, type];
  }
  return input;
};

const parseStatusResponse = (data) => ({
  length: data[0],
  type: data[1],
  status: data[2] === 255 ? 0 : data[2], // if turn off pump, status should return 0 instead of 255
  cycle: data[3],
  vacuum: data[4],
  mode: data[5],
  light: data[6],
  programId: data[7],
  battery: data[8],
  seq: data[9],
  minutes: data[10],
  seconds: data[11]
});

const parseProgramShowResponse = (data) => ({
  length: data[0],
  type: data[1],
  programId: data[2],
  sessionCount: data[3]
});

const parseProgramShowResponseBody = (data) => ({
  length: data[0],
  type: data[1],
  programId: data[2],
  seq: data[3],
  cycle: data[4],
  vacuum: data[5],
  mode: data[6],
  minutes: data[7],
  seconds: data[8],
});

const parseConnectResponse = (data) => ({
  length: data[0],
  type: data[1],
  connectResponse: data[2]
});

const parseVersionResponse = (data) => ({
  length: data[0],
  type: data[1],
  boardVersion: data[2],
  firmwareVersion: `${data[3]}:${data[4]}:${data[5]}`
});

export const parsePacket = (data) => {
  switch (data[1]) {
    case C.OP_CONNECT_RESPONSE:
      return parseConnectResponse(data);
    case C.OP_VERSION_RESPONSE:
      return parseVersionResponse(data);
    case C.OP_STATUS_RESPONSE:
      return parseStatusResponse(data);
    case C.OP_PROGRAM_SHOW_RESPONSE:
      return parseProgramShowResponse(data);
    case C.OP_PROGRAM_SHOW_RESPONSE_BODY:
      return parseProgramShowResponseBody(data);
    default:
      return {};
  }
};

export const parsePumpStatusChar1 = (data) => {
  console.log("Parse char1:", data);
  const programId = data[1];
  const stepNumber = data[2];
  const isPause = data[3] === 1;
  const mode = data[3] === 5 ? LETDOWN : EXPRESSION;
  const vacuum = data[4];
  const cycle = pumpToAppCycle(data[5]);
  const minutes = data[6];
  const seconds = data[7];

  return {
    programId,
    index: stepNumber,
    pause: isPause,
    mode: isPause ? null : mode,
    vacuum,
    cycle,
    minutes,
    seconds,
  };
};

export const parsePumpStatusChar2 = (data) => {
  // console.log("parsePumpStatus2:", data);
  const programSeq = data[2];
  const programValue = dec2bin8(data[0]);
  const programPlaying = parseInt(programValue.substring(4, 8), 2) !== 0;
  const programPaused = parseInt(programValue.substring(0, 1), 2) === 1;
  // console.log("programPlaying:", programPlaying, programPaused);
  const statusValue = dec2bin4(data[7]);
  const mode = statusValue.substring(2, 3) === "1" ? 1 : 2;
  const pumpingStatus = programPlaying ? (
    programPaused ? C.OP_PAUSE : C.OP_START
  ) : statusValue.substring(3, 4) === "1" ? C.OP_START : C.OP_STOP;
  let light = C.LIGHT_OFF;

  switch (statusValue.substring(0, 2)) {
    case "00":
      light = C.LIGHT_OFF;
      break;
    case "01":
      light = C.LIGHT_LOW;
      break;
    case "10":
      light = C.LIGHT_HIGH;
      break;
    default:
      break;
  }

  return {
    programPlaying,
    programPaused,
    programSeq: programSeq === 0 ? 0 : programSeq - 1,
    speed: data[5],
    strength: data[6],
    pumpingStatus,
    pumpingMinutes: data[3],
    pumpingSeconds: data[4],
    mode,
    light,
  };
};

export const parsePumpStatusChar3 = (data) => {
  // console.log("parsePumpStatusChar3:", data);

  return {
    battery: data[0]
  };
};

export const parsePumpStatusChar6 = (data) => {
  console.log("parsePumpStatusChar6:", data);

  let connectResponse = 0;
  if (data[3] === 100) {
    connectResponse = C.OP_ACCEPT;
  } else if (data[3] === 50) {
    connectResponse = C.OP_REJECT;
  }
  return {
    connectResponse,
    firmwareVersion: data[0]
  };
};

export const parseProgramStatus = (data) => {
  return {
    programId: data[1],
    vacuum: data[4],
    cycle: data[5],
    minutes: data[6],
    seconds: data[7]
  };
};
