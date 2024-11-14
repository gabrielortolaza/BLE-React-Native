import React from "react";
import PropTypes from "prop-types";
import { shallow } from "enzyme";

import { TourAuthScreen } from "../../../src/Components/TourAuthScreen";

const USER_DISPLAY_NAME = "A Nerdy Factorer";
const USER_DISPLAY_EMAIL = "nkvdamian+ahdfbkjfn@gmail.com";
const USER_DISPLAY_PASSWORD = "123456789";

describe("TourAuthScreen", () => {
  // it("Sign Up - with empty inputs", () => {
  //   const goBack = jest.fn();
  //   const signWithEmail = jest.fn();
  //
  //   const render = shallow(
  //     <TourAuthScreen
  //       goBack={goBack}
  //       navigation={{ state: { routeName: "SignUp" } }}
  //       signWithEmail={signWithEmail}
  //     />
  //   ).dive();
  //
  //   expect(render.find({ testID: "TourAuth_Welcome" })).toHaveLength(1);
  //   expect(render.find({ testID: "TourAuth_Back" })).toHaveLength(1);
  //   expect(render.find({ testID: "TourAuth_Name_TextInput" })).toHaveLength(1);
  //   expect(render.find({ testID: "TourAuth_Email_TextInput" })).toHaveLength(1);
  //   expect(render.find({ testID: "TourAuth_Password_TextInput" })).toHaveLength(1);
  //   expect(render.find({ testID: "TourAuth_Terms" })).toHaveLength(1);
  //
  //   expect(goBack.mock.calls).toHaveLength(0);
  //   render.find({ testID: "TourAuth_Back" }).simulate("press");
  //   expect(goBack.mock.calls).toHaveLength(1);
  //
  //   expect(signWithEmail.mock.calls).toHaveLength(0);
  //   render.find({ testID: "TourAuth_Start" }).simulate("press");
  //   expect(signWithEmail.mock.calls).toHaveLength(1);
  //
  //   const args = signWithEmail.mock.calls[0][0]; // First argument is an object
  //   expect(args.displayName).toBeFalsy();
  //   expect(args.email).toBeFalsy();
  //   expect(args.password).toBeFalsy();
  //
  //   expect(render).toMatchSnapshot();
  // });
  //
  // it("Sign Up - with Name", () => {
  //   const signWithEmail = jest.fn();
  //
  //   const render = shallow(
  //     <TourAuthScreen
  //       goBack={jest.fn()}
  //       navigation={{ state: { routeName: "SignUp" } }}
  //       signWithEmail={signWithEmail}
  //     />
  //   ).dive();
  //
  //   render.find({ testID: "TourAuth_Name_TextInput" }).simulate("changeText", USER_DISPLAY_NAME);
  //
  //   render.find({ testID: "TourAuth_Start" }).simulate("press");
  //   expect(signWithEmail.mock.calls[0][0].displayName).toBe(USER_DISPLAY_NAME);
  //
  //   expect(render).toMatchSnapshot();
  // });
  //
  // it("Sign Up - with Email", () => {
  //   const signWithEmail = jest.fn();
  //
  //   const render = shallow(
  //     <TourAuthScreen
  //       goBack={jest.fn()}
  //       navigation={{ state: { routeName: "SignUp" } }}
  //       signWithEmail={signWithEmail}
  //     />
  //   ).dive();
  //
  //   render.find({ testID: "TourAuth_Email_TextInput" }).simulate("changeText", USER_DISPLAY_EMAIL);
  //
  //   render.find({ testID: "TourAuth_Start" }).simulate("press");
  //   expect(signWithEmail.mock.calls[0][0].email).toBe(USER_DISPLAY_EMAIL);
  //
  //   expect(render).toMatchSnapshot();
  // });
  //
  // it("Sign Up - with Name + Email", () => {
  //   const signWithEmail = jest.fn();
  //
  //   const render = shallow(
  //     <TourAuthScreen
  //       goBack={jest.fn()}
  //       navigation={{ state: { routeName: "SignUp" } }}
  //       signWithEmail={signWithEmail}
  //     />
  //   ).dive();
  //
  //   render.find({ testID: "TourAuth_Name_TextInput" }).simulate("changeText", USER_DISPLAY_NAME);
  //   render.find({ testID: "TourAuth_Email_TextInput" }).simulate("changeText", USER_DISPLAY_EMAIL);
  //
  //   render.find({ testID: "TourAuth_Start" }).simulate("press");
  //
  //   const args = signWithEmail.mock.calls[0][0]; // First argument is an object
  //   expect(args.displayName).toBe(USER_DISPLAY_NAME);
  //   expect(args.email).toBe(USER_DISPLAY_EMAIL);
  //
  //   expect(render).toMatchSnapshot();
  // });
  //
  // it("Sign Up - with Password", async () => {
  //   const signWithEmail = jest.fn();
  //
  //   const render = shallow(
  //     <TourAuthScreen
  //       goBack={jest.fn()}
  //       navigation={{ state: { routeName: "SignUp" } }}
  //       signWithEmail={signWithEmail}
  //     />
  //   ).dive();
  //
  //   render.find({ testID: "TourAuth_Password_TextInput" }).simulate("changeText", USER_DISPLAY_PASSWORD);
  //
  //   render.find({ testID: "TourAuth_Start" }).simulate("press");
  //   await new Promise((resolve) => resolve(), 200);
  //   expect(signWithEmail.mock.calls[0][0].password).toBe(USER_DISPLAY_PASSWORD);
  //
  //   expect(render).toMatchSnapshot();
  // });
  //
  // it("Sign Up - with Name + Email + Password", async () => {
  //   const signWithEmail = jest.fn();
  //
  //   const render = shallow(
  //     <TourAuthScreen
  //       goBack={jest.fn()}
  //       navigation={{ state: { routeName: "SignUp" } }}
  //       signWithEmail={signWithEmail}
  //     />
  //   ).dive();
  //
  //   render.find({ testID: "TourAuth_Name_TextInput" }).simulate("changeText", USER_DISPLAY_NAME);
  //   render.find({ testID: "TourAuth_Email_TextInput" }).simulate("changeText", USER_DISPLAY_EMAIL);
  //   render.find({ testID: "TourAuth_Password_TextInput" }).simulate("changeText", USER_DISPLAY_PASSWORD);
  //
  //   render.find({ testID: "TourAuth_Start" }).simulate("press");
  //   await new Promise((resolve) => resolve(), 200);
  //
  //   const args = signWithEmail.mock.calls[0][0]; // First argument is an object
  //   expect(args.displayName).toBe(USER_DISPLAY_NAME);
  //   expect(args.email).toBe(USER_DISPLAY_EMAIL);
  //   expect(args.password).toBe(USER_DISPLAY_PASSWORD);
  //
  //   expect(render).toMatchSnapshot();
  // });
  //
  // it("Sign Up - with Name + Email + Password + Terms", async () => {
  //   const signWithEmail = jest.fn();
  //
  //   const render = shallow(
  //     <TourAuthScreen
  //       goBack={jest.fn()}
  //       navigation={{ state: { routeName: "SignUp" } }}
  //       signWithEmail={signWithEmail}
  //     />
  //   ).dive();
  //
  //   render.find({ testID: "TourAuth_Name_TextInput" }).simulate("changeText", USER_DISPLAY_NAME);
  //   render.find({ testID: "TourAuth_Email_TextInput" }).simulate("changeText", USER_DISPLAY_EMAIL);
  //   render.find({ testID: "TourAuth_Password_TextInput" }).simulate("changeText", USER_DISPLAY_PASSWORD);
  //
  //   render.find({ testID: "TourAuth_Terms" }).simulate("press");
  //
  //   render.find({ testID: "TourAuth_Start" }).simulate("press");
  //   await new Promise((resolve) => resolve(), 200);
  //
  //   const args = signWithEmail.mock.calls[0][0]; // First argument is an object
  //   expect(args.displayName).toBe(USER_DISPLAY_NAME);
  //   expect(args.email).toBe(USER_DISPLAY_EMAIL);
  //   expect(args.password).toBe(USER_DISPLAY_PASSWORD);
  //   expect(args.termsAccepted).toBe(true);
  //
  //   expect(render).toMatchSnapshot();
  // });

  it("Sign In - with empty inputs", () => {
    const signWithEmail = jest.fn();

    const render = shallow(
      <TourAuthScreen
        setRequesting={jest.fn()}
        navigation={{ goBack: jest.fn() }}
        signWithEmail={signWithEmail}
      />
    ).dive();

    expect(render.find({ testID: "TourAuth_Name_TextInput" })).toHaveLength(0);
    expect(render.find({ testID: "TourAuth_Terms" })).toHaveLength(0);

    render.find({ testID: "TourAuth_Start" }).simulate("press");

    const args = signWithEmail.mock.calls[0][0]; // First argument is an object
    console.log("Args:", args);
    expect(args.displayName).toBeFalsy();
    expect(args.email).toBeFalsy();
    expect(args.password).toBeFalsy();

    expect(render).toMatchSnapshot();
  });

  it("Sign In - with email and password", () => {
    const signWithEmail = jest.fn();

    const render = shallow(
      <TourAuthScreen
        setRequesting={jest.fn()}
        navigation={{ goBack: jest.fn() }}
        signWithEmail={signWithEmail}
      />
    ).dive();

    expect(render.find({ testID: "TourAuth_Name_TextInput" })).toHaveLength(0);
    expect(render.find({ testID: "TourAuth_Terms" })).toHaveLength(0);

    render.find({ testID: "TourAuth_Email_TextInput" }).simulate("changeText", USER_DISPLAY_EMAIL);
    render.find({ testID: "TourAuth_Password_TextInput" }).simulate("changeText", USER_DISPLAY_PASSWORD);

    render.find({ testID: "TourAuth_Start" }).simulate("press");

    const args = signWithEmail.mock.calls[0][0]; // First argument is an object
    expect(args.displayName).toBeFalsy();
    expect(args.email).toBe(USER_DISPLAY_EMAIL);
    expect(args.password).toBe(USER_DISPLAY_PASSWORD);

    expect(render).toMatchSnapshot();
  });
});

TourAuthScreen.propTypes = {
  goBack: PropTypes.func.isRequired,
  navigation: PropTypes.object.isRequired,
  signWithEmail: PropTypes.func.isRequired
};
