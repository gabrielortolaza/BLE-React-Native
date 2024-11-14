/* eslint-env detox/detox, jest */
/* globals element by */
import {
  SIGN_ERROR_MAIL, SIGN_ERROR_PASS, androidConfig,
  USER_EMAIL, USER_PASS
} from "./constants";
import { signOutFromTab } from "./sharedFunctions";

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
    await element(by.id("tour-already-have-account-test")).tap();
  };

  const finishAuth = async () => {
    console.log("configName:", configurationName);
    androidConfig.indexOf(configurationName) > -1 && await element(by.id("TourAuthScreen")).tap(); // Close keyboard on Android
    await waitFor(element(by.id("TourAuth_Start"))).toBeVisible().withTimeout(10000);
    await element(by.id("TourAuth_Start")).tap();
  };

  it("Should request email", async () => {
    await initialAuth();
    await element(by.id("TourAuth_Password_TextInput_TextInput")).typeText(USER_PASS);
    await finishAuth();
    await expect(element(by.text(SIGN_ERROR_MAIL))).toExist();
  });

  it("Should request password", async () => {
    await initialAuth();
    await element(by.id("TourAuth_Email_TextInput_TextInput")).typeText(USER_EMAIL);
    await finishAuth();
    await expect(element(by.text(SIGN_ERROR_PASS))).toExist();
  });

  it("Should sign in", async () => {
    await initialAuth();
    await element(by.id("TourAuth_Email_TextInput_TextInput")).typeText(USER_EMAIL);
    await element(by.id("TourAuth_Password_TextInput_TextInput")).typeText(USER_PASS);
    await finishAuth();

    await waitFor(element(by.id("dashboard-view-test"))).toExist().withTimeout(5000);
    await expect(element(by.id("dashboard-view-test"))).toExist();

    await signOutFromTab();
  });

  it("Should Remember me at Sign in", async () => {
    await initialAuth();
    await element(by.id("TourAuth_Email_TextInput_TextInput")).typeText(USER_EMAIL);
    await element(by.id("TourAuth_Password_TextInput_TextInput")).typeText(USER_PASS);
    await element(by.id("remember-me-auth")).tap();
    await finishAuth();

    await waitFor(element(by.id("dashboard-view-test"))).toExist().withTimeout(5000);
    await expect(element(by.id("dashboard-view-test"))).toExist();

    await signOutFromTab();

    await device.launchApp({ permissions: { notifications: "YES" } });

    await initialAuth();
    await expect(element(by.id("TourAuth_Email_TextInput_TextInput"))).toHaveText(USER_EMAIL);
  });
});
