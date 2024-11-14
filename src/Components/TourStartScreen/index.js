import React, { PureComponent } from "react";
import { View, Image, BackHandler } from "react-native";
import PropTypes from "prop-types";

import StyleSheet from "../../Proportional";
import { ButtonRound, Label as Text } from "../Shared";
import { Colors, Images, Fonts } from "../../Themes";

export default class TourStartScreen extends PureComponent {
  componentDidMount() {
    // Detect back button
    BackHandler.addEventListener("hardwareBackPress", () => {
      return true;
    });
  }

  render() {
    const { navigation } = this.props;
    return (
      <View testID="TourStartScreen" style={styles.container}>
        <View testID="welcome-test">
          <View style={styles.logoContainer}>
            <Image
              source={Images.welcomeImage}
              style={styles.logo}
            />
            <Text
              maxFontSizeMultiplier={1.2}
              style={styles.textWelcome}
            >
              Welcome to
              {"\n"}
              Pumpables!
            </Text>
          </View>
          <View style={styles.infoContainer}>
            <Text maxFontSizeMultiplier={1.1} style={styles.textIntro}>
              Get started with the Pumpables app to:
            </Text>
            <PointRow
              text="Track pumping & feeding sessions"
            />
            <PointRow
              text="Set pumping schedules & get reminders"
            />
            <PointRow
              text="Operate your SuperGenie"
            />
            <PointRow
              text="Personalise & share pumping programs"
            />
            <ButtonRound
              blue
              style={styles.startNowButton}
              testID="tour-start-now"
              onPress={() => navigation.push("Auth", { routeName: "SignUp" })}
            >
              <Text white font18>Start Now</Text>
            </ButtonRound>
            <ButtonRound
              transparent
              style={styles.haveAccountButton}
              onPress={() => navigation.push("Auth", { routeName: "SignIn" })}
              testID="tour-already-have-account-test"
            >
              <Text
                lightGrey2
                font16
              >
                I already have an account
              </Text>
            </ButtonRound>
          </View>
        </View>
      </View>
    );
  }
}

class PointRow extends PureComponent {
  render() {
    const { text } = this.props;

    return (
      <View style={styles.container2}>
        <View>
          <Image
            source={Images.checkmarkCircled}
            style={styles.checkmark}
          />
        </View>
        <View style={styles.pointText}>
          <Text maxFontSizeMultiplier={1.1} font16>
            {text}
          </Text>
        </View>
      </View>
    );
  }
}

TourStartScreen.propTypes = {
  navigation: PropTypes.object
};

PointRow.propTypes = {
  text: PropTypes.string
};

const styles = StyleSheet.createProportional({
  container: {
    backgroundColor: Colors.white,
    paddingBottom: 0
  },
  container2: {
    flexDirection: "row",
    marginBottom: 10
  },
  logoContainer: {
    // top: isIphoneX() ? 35 : 5,
    height: "33%",
    width: "100%",
    justifyContent: "center",
    alignItems: "center"
  },
  logo: {
    height: "100%",
    width: "100%"
  },
  checkmark: {
    height: 23,
    width: 22
  },
  infoContainer: {
    height: "67%",
    paddingLeft: 25,
    paddingRight: 25
  },
  textWelcome: {
    ...Fonts.SemiBold,
    fontSize: 35,
    lineHeight: 49,
    color: Colors.white,
    textAlign: "center",
    position: "absolute",
    marginBottom: "10%"
  },
  textIntro: {
    marginTop: 10,
    fontSize: 16,
    lineHeight: 30,
    color: Colors.grey,
    marginBottom: 10
  },
  startNowButton: {
    width: "90%",
    marginBottom: 10,
    alignSelf: "center"
  },
  haveAccountButton: {
    width: "90%",
    alignSelf: "center",
    borderWidth: 2,
    borderColor: Colors.lightGrey2
  },
  pointText: {
    marginLeft: 10
  }
});
