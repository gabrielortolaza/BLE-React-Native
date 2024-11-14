/* eslint-env detox/detox, jest */
/* globals element by */

describe("Logs tests", () => {
  beforeAll(async () => {
    await device.launchApp({ permissions: { notifications: "YES" } });
  });

  it("Should navigate to logs page", async () => {
    await waitFor(element(by.id("logs-tab"))).toExist().withTimeout(10000);
    await element(by.id("logs-tab")).tap();

    await expect(element(by.id("logs-view-test"))).toExist();
  });

  it("Should create log", async () => {
    await element(by.id("icon-tab")).tap();
    await element(by.text("Enter manually")).tap();

    const randomVolume = String(Math.round(Math.random() * 1000));
    await element(by.id("volume-input")).typeText(randomVolume);
    await element(by.id("notes-input")).typeText("Random");

    await waitFor(element(by.id("save-session"))).toBeVisible().withTimeout(10000); // Instabug
    await element(by.id("save-session")).tap();
    await element(by.id("save-session")).tap(); // COMBAK: Bug, need to tap twice for now

    /* Validate log was properly created */
    // atIndex only works properly when it's the only log created because
    // of the presence of other UI elements in-between that make the index
    // unpredictable
    await waitFor(element(by.id("session_volume")).atIndex(0)).toBeVisible().withTimeout(3000);
    await expect(element(by.id("session_volume")).atIndex(0)).toHaveText(`${randomVolume} mL`);
  });
});

// export { logsTests as default };
