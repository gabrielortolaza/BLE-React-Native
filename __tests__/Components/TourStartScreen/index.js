import React from "react";
import renderer from "react-test-renderer";

const TourStartScreen = require("../../../src/Components/TourStartScreen").default;

describe("TourStartScreen", () => {
  it("Render TourStartScreen", () => {
    expect(renderer.create(<TourStartScreen />).toJSON()).toMatchSnapshot();
  });
});
