/** Page appears to no longer be used */

import React from "react";
import PropTypes from "prop-types";
import { shallow } from "enzyme";
import sinon from "sinon";

import TourAuthSelectionScreen from "../../../src/Components/TourAuthSelectionScreen";

describe("TourAuthSelectionScreen", () => {
  it("Default", () => {
    const goBack = sinon.spy(jest.fn());
    const goToSignIn = sinon.spy(jest.fn());
    const goToSignUp = sinon.spy(jest.fn());
    // const signUpWithFacebook = sinon.spy(jest.fn());

    const wrapper = shallow(
      <TourAuthSelectionScreen
        goBack={goBack}
        goToSignIn={goToSignIn}
        goToSignUp={goToSignUp}
      />
    );

    const render = wrapper.dive();

    expect(render.find({ testID: "TourAuthSelection_Welcome" })).toHaveLength(1);

    render.find({ testID: "TourAuthSelection_Back" }).simulate("press");
    expect(goBack.calledOnce).toBe(true);
    expect(goBack.callCount).toBe(1);

    expect(render.find({ testID: "TourAuthSelection_FBActivity" })).toHaveLength(0);

    render.find({ testID: "TourAuthSelection_SignUp" }).simulate("press");
    expect(goToSignUp.calledOnce).toBe(true);

    render.find({ testID: "TourAuthSelection_SignIn" }).simulate("press");
    expect(goToSignIn.calledOnce).toBe(true);

    render.find({ testID: "TourAuthSelection_SignUp" }).simulate("press");
    render.find({ testID: "TourAuthSelection_SignUp" }).simulate("press");

    render.find({ testID: "TourAuthSelection_SignIn" }).simulate("press");
    render.find({ testID: "TourAuthSelection_SignIn" }).simulate("press");
    render.find({ testID: "TourAuthSelection_SignIn" }).simulate("press");

    expect(goToSignIn.callCount).toBe(4);
    expect(goToSignUp.callCount).toBe(3);

    expect(render).toMatchSnapshot();
  });

  //   it('Facebook Waiting', () => {
  //     const goBack = sinon.spy(jest.fn())
  //     const goToSignIn = sinon.spy(jest.fn())
  //     const goToSignUp = sinon.spy(jest.fn())
  //     const signUpWithFacebook = sinon.spy(jest.fn())

  //     const wrapper = shallow(
  //       <TourAuthSelectionScreen
  //         goBack={goBack}
  //         goToSignIn={goToSignIn}
  //         goToSignUp={goToSignUp}
  //         isWaitingFacebook
  //         signUpWithFacebook={signUpWithFacebook}
  //       />
  //     )

  //     const render = wrapper.dive()

  //     expect(render.find({ testID: 'TourAuthSelection_FBActivity' })).toHaveLength(1)

  //     render.find({ testID: 'TourAuthSelection_Facebook' }).simulate('press')
  //     expect(signUpWithFacebook.calledOnce).toBe(false)

  //     expect(render).toMatchSnapshot()
  //   });
});

TourAuthSelectionScreen.propTypes = {
  goBack: PropTypes.func.isRequired,
  goToSignIn: PropTypes.func.isRequired,
  goToSignUp: PropTypes.func.isRequired,
  isWaitingFacebook: PropTypes.bool
};
