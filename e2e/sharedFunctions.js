/* eslint-env detox/detox, jest */
/* globals element by */

const signOutFromTab = async () => {
  await waitFor(element(by.id("settings-tab"))).toExist().withTimeout(10000);
  await element(by.id("settings-tab")).tap();

  await waitFor(element(by.id("signout-test"))).toBeVisible().whileElement(by.id("settings-content")).scroll(100, "down");
  await element(by.id("signout-test")).tap();
  await waitFor(element(by.id("tour-already-have-account-test"))).toExist().withTimeout(3000);
};

export { signOutFromTab };
