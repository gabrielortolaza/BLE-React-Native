import React from "react";
import { Platform } from "react-native";
import renderer from "react-test-renderer";

const RoundButton = require("../../../src/Components/Shared/RoundButton").default;

describe("RoundButton", () => {
  it("Default", () => {
    expect(renderer.create(<RoundButton onPress={() => {}}>{ "Test " + Platform.OS}</RoundButton>).toJSON()).toMatchSnapshot();
  });
/*
  it('Wide', () => {
    expect(renderer.create(<RoundButton wide onPress={() => {}}>{ 'Test ' + Platform.OS }</RoundButton>).toJSON()).toMatchSnapshot()
  })

  it('Small', () => {
    expect(renderer.create(<RoundButton small onPress={() => {}}>{ 'Test ' + Platform.OS }</RoundButton>).toJSON()).toMatchSnapshot()
  })

  it('White', () => {
    expect(renderer.create(<RoundButton white onPress={() => {}}>{ 'Test ' + Platform.OS }</RoundButton>).toJSON()).toMatchSnapshot()
  })

  it('Facebook', () => {
    expect(renderer.create(<RoundButton facebook onPress={() => {}}>{ 'Test ' + Platform.OS }</RoundButton>).toJSON()).toMatchSnapshot()
  })

  it('Minimal', () => {
    expect(renderer.create(<RoundButton minimal onPress={() => {}}>{ 'Test ' + Platform.OS }</RoundButton>).toJSON()).toMatchSnapshot()
  })

  it('Light Blue', () => {
    expect(renderer.create(<RoundButton lightBlue onPress={() => {}}>{ 'Test ' + Platform.OS }</RoundButton>).toJSON()).toMatchSnapshot()
  })

  it('Transparent', () => {
    expect(renderer.create(<RoundButton transparentBackground onPress={() => {}}>{ 'Test ' + Platform.OS }</RoundButton>).toJSON()).toMatchSnapshot()
  })

  it('Shadow', () => {
    expect(renderer.create(<RoundButton shadow onPress={() => {}}>{ 'Test ' + Platform.OS }</RoundButton>).toJSON()).toMatchSnapshot()
  })

  it('Warm Grey Text', () => {
    expect(renderer.create(<RoundButton warmGreyText onPress={() => {}}>{ 'Test ' + Platform.OS }</RoundButton>).toJSON()).toMatchSnapshot()
  })

  it('Blue Text', () => {
    expect(renderer.create(<RoundButton blueText onPress={() => {}}>{ 'Test ' + Platform.OS }</RoundButton>).toJSON()).toMatchSnapshot()
  })

  it('OVerride', () => {
    expect(renderer.create(<RoundButton override onPress={() => {}}><Text>{ 'Test ' + Platform.OS }</Text></RoundButton>).toJSON()).toMatchSnapshot()
  })

  it('Button Style', () => {
    expect(renderer.create(<RoundButton buttonStyle={{width: 300}} onPress={() => {}}>{ 'Test ' + Platform.OS }</RoundButton>).toJSON()).toMatchSnapshot()
  })

  it('Text Style', () => {
    expect(renderer.create(<RoundButton textStyle={{fontSize: 30}} onPress={() => {}}>{ 'Test ' + Platform.OS }</RoundButton>).toJSON()).toMatchSnapshot()
  })
  */
});
