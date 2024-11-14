/* This file allows tests to run in a specific order */

import authTests from "./sign-in";
// import tourStartTests from "./allInOne";
import logsTests from "./logs";

// describe("TourStartScreen", tourStartTests);
describe("Auth", authTests);
describe("Logs", logsTests);
