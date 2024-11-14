/* eslint-env detox/detox, jest */
/* globals element by */
import {
  SIGN_ERROR_MAIL, SIGN_ERROR_PASS, androidConfig,
  USER_EMAIL, USER_PASS, USER_NAME,
  SIGN_ERROR_NAME, SIGN_ERROR_TERMS
} from "./constants";

const randomVolume = String(Math.round(Math.random() * 1000));
const argparse = require("detox/src/utils/argparse");

const configurationName = argparse.getArgValue("configuration"); // Unofficial, could stop working in the future

describe("Auth tests", () => {
  // beforeAll(async () => {
  //   await device.launchApp();
  // });

  beforeEach(async () => {
    await device.launchApp({ permissions: { notifications: "YES" } });
  });

  const initialAuth = async () => {
    await element(by.id("tour-start-now")).tap();
  };

  const finishAuth = async () => {
    console.log("configName:", configurationName);
    androidConfig.indexOf(configurationName) > -1 && await element(by.id("TourAuthScreen")).tap(); // Close keyboard on Android
    await waitFor(element(by.id("TourAuth_Start"))).toBeVisible().withTimeout(10000);
    await element(by.id("TourAuth_Start")).tap();
  };

  it("Should request Name", async () => {
    await initialAuth();
    await finishAuth();
    await expect(element(by.text(SIGN_ERROR_NAME))).toExist();
  });

  it("Should request email", async () => {
    await initialAuth();
    await element(by.id("TourAuth_Name_TextInput_TextInput")).typeText(USER_NAME);
    await finishAuth();
    await expect(element(by.text(SIGN_ERROR_MAIL))).toExist();
  });

  it("Should request password", async () => {
    await initialAuth();
    await element(by.id("TourAuth_Name_TextInput_TextInput")).typeText(USER_NAME);
    await element(by.id("TourAuth_Email_TextInput_TextInput")).typeText(USER_EMAIL);
    await finishAuth();
    await expect(element(by.text(SIGN_ERROR_PASS))).toExist();
  });

  it("Should request to agree to T&C's", async () => {
    await initialAuth();
    await element(by.id("TourAuth_Name_TextInput_TextInput")).typeText(USER_NAME);
    await element(by.id("TourAuth_Email_TextInput_TextInput")).typeText(USER_EMAIL);
    await element(by.id("TourAuth_Password_TextInput_TextInput")).typeText(USER_PASS);
    await finishAuth();
    await expect(element(by.text(SIGN_ERROR_TERMS))).toExist();
  });

  it("Should sign up", async () => {
    await initialAuth();
    await element(by.id("TourAuth_Name_TextInput_TextInput")).typeText(USER_NAME);
    await element(by.id("TourAuth_Email_TextInput_TextInput")).typeText(`${randomVolume}${USER_EMAIL}`);
    await element(by.id("TourAuth_Password_TextInput_TextInput")).typeText(USER_PASS);
    await element(by.id("TourAuth_Terms")).tap();
    await finishAuth();

    await waitFor(element(by.id("Schedule_TutorialSkip"))).toExist().withTimeout(5000);
    await element(by.id("Schedule_TutorialSkip")).tap();

    await element(by.id("Tour_Goal_Input")).typeText(randomVolume);
    await element(by.id("Tour_Goal_Done")).tap();

    await waitFor(element(by.id("Dashboard_Info_Left_Label"))).toBeVisible().withTimeout(10000);
    await expect(element(by.id("Dashboard_Info_Left_Label"))).toHaveText(`Goal\n${randomVolume}ml`);
  });
});
