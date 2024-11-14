/* eslint-env detox/detox, jest */
/* globals element by */

describe("Edit program tests", () => {
  beforeAll(async () => {
    await device.launchApp({ permissions: { notifications: "YES" } });
  });

  it("Should navigate to Genie home page", async () => {
    await waitFor(element(by.id("genie-tab"))).toExist().withTimeout(10000);
    await element(by.id("genie-tab")).tap();

    await expect(element(by.id("genie-home-view"))).toExist();
  });

  it("Should edit Amber's program", async () => {
    await element(by.id("genie_home_program_options1")).tap();
    await element(by.text("Edit program")).tap();

    await element(by.id("edit_program_step0")).tap();

    await element(by.id("program_edit_step_dur")).swipe("right", "slow", 0.5, 0.1, 0.5); // Only works on IOS
  });
});
