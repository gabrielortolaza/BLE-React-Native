/** Page appears to no longer be used */
/* eslint-disable */
import React, { PureComponent }  from "react";
import PropTypes from "prop-types";
import { SafeAreaView } from "react-native-safe-area-context";
import { ActivityIndicator, View } from "react-native";

import StyleSheet from "../../Proportional";
import { Styles, Colors } from "../../Themes";
import { RoundButton, BackButton, Welcome } from "./../Shared";

const emptyFunction = () => {};

class TourAuthSelectionScreen extends PureComponent {
  render() {
    const {
      goBack, goToSignIn, goToSignUp,
      signUpWithFacebook, isWaitingFacebook
    } = this.props;

    return (
      <SafeAreaView style={styles.container}>
        <View testID="TourAuthSelectionScreen" style={styles.container}>
          <BackButton testID="TourAuthSelection_Back" onPress={goBack} />
          <Welcome
            testID="TourAuthSelection_Welcome"
            title="Nice!"
            subtitle="Time to make your account"
            alt
          />
          <RoundButton
            alt
            facebook
            onPress={isWaitingFacebook ? emptyFunction : signUpWithFacebook}
            override={isWaitingFacebook}
            positionStyle={styles.facebookPositionStyle}
            testID="TourAuthSelection_Facebook"
          >
            {isWaitingFacebook ? (
              <ActivityIndicator
                testID={"TourAuthSelection_FBActivity"}
                color="white"
              />
            ) : (
              "Continue With Facebook"
            )}
          </RoundButton>
          <RoundButton
            onPress={goToSignUp}
            positionStyle={styles.signUpPositionStyle}
            wide
            testID="TourAuthSelection_SignUp"
          >
            Sign up with email
          </RoundButton>
          <RoundButton
            onPress={goToSignIn}
            positionStyle={styles.signInPositionStyle}
            white
            wide
            testID="TourAuthSelection_SignIn"
          >
            I already have an account
          </RoundButton>
        </View>
      </SafeAreaView>
    );
  }
}

export default TourAuthSelectionScreen;

TourAuthSelectionScreen.propTypes = {
  goBack: PropTypes.func.isRequired,
  goToSignIn: PropTypes.func.isRequired,
  goToSignUp: PropTypes.func.isRequired,
  isWaitingFacebook: PropTypes.bool,
  signUpWithFacebook: PropTypes.func.isRequired
};

const styles = StyleSheet.createProportional({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: Colors.white
  },
  input: {
    marginTop: 14,
    marginHorizontal: 58
  },
  image: {
    alignSelf: "center"
  },
  tipLabel: {
    ...Styles.TipLabel1,
    color: Colors.white,
    textAlign: "center",
    marginTop: 3
  },
  backButton: {
    position: "absolute",
    top: 30,
    padding: 10,
    left: 20,
    zIndex: 10
  },
  facebookPositionStyle: {
    marginTop: 15
  },
  signUpPositionStyle: {
    marginTop: 13
  },
  signInPositionStyle: {
    marginTop: 46
  },
  indicatorWrapper: {
    height: 40,
    justifyContent: "center"
  }
});
