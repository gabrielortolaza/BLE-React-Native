import React, { Component } from "react";
import PropTypes from "prop-types";
import { View } from "react-native";
import { connect } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { forgotPassword, signWithEmail } from "../../Actions/Auth";
import { addMessage, setRequesting } from "../../Actions/Status";
import StyleSheet from "../../Proportional";
import { Colors, Fonts } from "../../Themes";
import {
  ButtonRound, InputField, Checkable,
  Label as Text, Loading
} from "../Shared";
import Container from "../Shared/Container";

class TourAuthScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      displayName: "",
      email: "",
      password: "",
      termsAccepted: false,
      receiveNewsletters: false,
      routeName: props.route.params.routeName,
      rememberMeSelected: false
    };
  }

  componentDidMount() {
    this.getRememberMe();
  }

  getRememberMe = () => {
    const { routeName } = this.state;

    if (routeName === "SignIn") {
      AsyncStorage.getItem("rememberMeAuth").then((val) => {
        if (val) {
          this.setState({
            rememberMeSelected: true,
            email: val
          });
        }
      });
    } else {
      this.setState({
        email: ""
      });
    }
  };

  // Makes first letter in words capital
  toTitleCase = (string) => {
    return string
      .toLowerCase()
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  signWithEmail = () => {
    const { isRequesting, setRequesting, signWithEmail } = this.props;
    const {
      displayName, email, password,
      termsAccepted, routeName, rememberMeSelected, receiveNewsletters
    } = this.state;
    console.log("isRequesting:", isRequesting);

    if (!isRequesting) {
      this.refInputDisplayName && this.refInputDisplayName.blur();
      this.refInputEmail && this.refInputEmail.blur();
      this.refInputPassword && this.refInputPassword.blur();

      const { navigation } = this.props;
      const displayName1 = this.toTitleCase(displayName);
      setRequesting("emailAuth");

      signWithEmail(
        {
          email,
          password,
          displayName: displayName1,
          termsAccepted,
          receiveNewsletters,
          routeName
        },
        navigation
      );

      this.setState({ password: "" });

      if (rememberMeSelected) {
        AsyncStorage.setItem("rememberMeAuth", email);
      } else {
        AsyncStorage.removeItem("rememberMeAuth");
      }
    }
  };

  forgotPassword = () => {
    const { isRequesting, forgotPassword, setRequesting } = this.props;

    if (!isRequesting) {
      this.refInputEmail && this.refInputEmail.blur();
      const { email } = this.state;

      setRequesting("emailAuth");

      forgotPassword({ email });
    }
  };

  goBack = () => {
    const { navigation, setRequesting } = this.props;
    setRequesting("");
    navigation.goBack();
  };

  handleOnPressRadio = () => {
    const { termsAccepted } = this.state;
    this.setState({ termsAccepted: !termsAccepted });
  };

  onInputDisplayNameRef = (refInputDisplayName) => {
    this.refInputDisplayName = refInputDisplayName;
  };

  onInputEmailRef = (refInputEmail) => {
    this.refInputEmail = refInputEmail;
  };

  onInputPasswordRef = (refInputPassword) => {
    this.refInputPassword = refInputPassword;
  };

  focusEmail = () => {
    this.refInputEmail.focus();
  };

  focusPassword = () => {
    this.refInputPassword.focus();
  };

  setDisplayName = (displayName) => this.setState({ displayName });

  setEmail = (email) => this.setState({ email: email.trim() });

  setPassword = (password) => this.setState({ password });

  emptyFn = () => {};

  renderIndicator = () => null;

  render() {
    const { navigation, isRequesting } = this.props;
    const {
      termsAccepted, routeName, rememberMeSelected,
      email, password, receiveNewsletters
    } = this.state;

    const isSignIn = routeName === "SignIn";
    const isSignUp = !isSignIn;

    return (
      <Container edges={["top"]} testID="TourAuthScreen" style={styles.container}>
        <>
          <View testID="TourAuth_Welcome" style={styles.header}>
            <View style={styles.headerTextView}>
              <Text grey font16 weightSemiBold style={styles.headerText}>
                {isSignIn ? "Log in" : "Sign up"}
              </Text>
            </View>
          </View>
          <View style={styles.introText}>
            <Text font16 grey>
              {
                isSignIn ? "Good to see you again!" : "Let's get started!"
              }
            </Text>
          </View>
          <View style={styles.content} testID="TourAuth_Inputs">
            {isSignUp && (
              <InputField
                testID="TourAuth_Name_TextInput"
                autoCapitalize="words"
                autoCorrect={false}
                onChangeText={this.setDisplayName}
                onSubmitEditing={this.focusEmail}
                placeholder="Name"
                ref={this.onInputDisplayNameRef}
                returnKeyType="next"
                style={styles.input}
              />
            )}
            <InputField
              testID="TourAuth_Email_TextInput"
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              onChangeText={this.setEmail}
              value={email}
              onSubmitEditing={this.focusPassword}
              placeholder="Email"
              ref={this.onInputEmailRef}
              returnKeyType="next"
              style={styles.input}
            />
            <InputField
              testID="TourAuth_Password_TextInput"
              value={password}
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={this.setPassword}
              onSubmitEditing={this.sign}
              placeholder="Password"
              returnKeyType="done"
              ref={this.onInputPasswordRef}
              secureTextEntry
              style={styles.input}
            />
            {isSignUp && (
              <View style={styles.radioButtonView}>
                <Checkable
                  testID="TourAuth_Terms"
                  onPress={this.handleOnPressRadio}
                  selected={termsAccepted}
                  style={styles.checkable}
                >
                  <Text onPress={() => navigation.navigate("Terms")} style={styles.terms}>
                    <Text>I agree to the Pumpables</Text>
                    <Text style={styles.termsBold}> Terms of Service </Text>
                    <Text>and</Text>
                    <Text style={styles.termsBold}> Privacy Policy</Text>
                  </Text>
                </Checkable>
                <Checkable
                  testID="TourAuth_Newsletters"
                  onPress={() => this.setState({ receiveNewsletters: !receiveNewsletters })}
                  selected={receiveNewsletters}
                >
                  <Text style={styles.terms}>
                    Receive marketing info
                  </Text>
                </Checkable>
              </View>
            )}
            {isSignIn && (
              <View>
                <Checkable
                  testID="remember-me-auth"
                  onPress={() => { this.setState({ rememberMeSelected: !rememberMeSelected }); }}
                  selected={rememberMeSelected}
                  style={styles.checkable}
                >
                  <Text font12>Remember me</Text>
                </Checkable>
                <ButtonRound
                  onPress={this.forgotPassword}
                  style={styles.forgotPassword}
                  transparent
                  testID="TourAuthSelection_Forgot"
                >
                  <Text lightGrey2 style={styles.forgotPasswordText}>I forgot my password</Text>
                </ButtonRound>
              </View>
            )}
            <ButtonRound
              testID="TourAuth_Start"
              onPress={this.signWithEmail}
              blue
              style={[styles.button, { marginTop: 50 }]}
            >
              <Text white weightSemiBold font20>{isSignUp ? "Start Now" : "Log in"}</Text>
            </ButtonRound>
            <ButtonRound
              onPress={() => {
                this.setState({ routeName: isSignIn ? "SignUp" : "SignIn" });
                setTimeout(() => { this.getRememberMe(); }, 250);
              }}
              style={styles.button}
              transparent
              testID="TourAuthSelection_Already_Have_Account?"
            >
              <Text lightGrey2 font14>
                <Text>
                  {isSignIn ? "Don't " : "Already "}
                  have an account?
                </Text>
                <Text weightBold>
                  {isSignIn ? " Sign up" : " Log in"}
                </Text>
              </Text>
            </ButtonRound>
          </View>
        </>
        <Loading isLoading={isRequesting} />
      </Container>
    );
  }
}

TourAuthScreen.propTypes = {
  forgotPassword: PropTypes.func.isRequired,
  isRequesting: PropTypes.bool,
  route: PropTypes.object,
  navigation: PropTypes.object.isRequired,
  signWithEmail: PropTypes.func.isRequired,
  setRequesting: PropTypes.func
};

const styles = StyleSheet.createProportional({
  container: {
    flex: 1,
    backgroundColor: Colors.white
  },
  content: {
    marginHorizontal: 25,
    marginTop: 20,
    flex: 5
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 30
  },
  headerTextView: {
    marginLeft: 25
  },
  headerText: {
    fontSize: 40
  },
  goBack: {
    marginLeft: 19
  },
  goBackIcon: {
    color: Colors.black
  },
  introText: {
    marginLeft: 25,
    marginTop: 30
  },
  input: {
    marginBottom: 9,
    fontSize: 15
  },
  backButton: {
    position: "absolute",
    top: 30,
    padding: 10,
    left: 20,
    zIndex: 10
  },
  button: {
    alignSelf: "center",
    width: "100%",
    marginTop: 15
  },
  radioButtonView: {
    marginTop: 15
  },
  radioBackground: {
    width: 20,
    height: 20,
    // borderRadius: 10,
    padding: 6,
    borderWidth: 1,
    borderColor: Colors.lightBlue,
    backgroundColor: Colors.backgroundTwo,
    justifyContent: "center",
    alignItems: "center"
  },
  radioDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "transparent"
  },
  radioDotSelected: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.windowsBlue
  },
  terms: {
    color: Colors.grey,
    fontSize: 13,
    lineHeight: 20
  },
  indicatorWrapper: {
    height: 36
  },
  termsBold: {
    ...Fonts.SemiBold
  },
  errorMessage: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 69,
    backgroundColor: Colors.coral,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 50
  },
  errorText: {
    color: Colors.white,
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center"
  },
  checkable: {
    marginVertical: 15,
    paddingRight: 25
  },
  forgotPassword: {
    width: 220,
    justifyContent: "flex-end",
    alignSelf: "flex-end",
    paddingRight: 0,
    marginTop: 15
  },
  forgotPasswordText: {
    fontSize: 13,
    textDecorationLine: "underline"
  }
});

const mapStateToProps = ({ status }) => ({
  isRequesting: status.requesting === "emailAuth"
});

const mapDispatchToProps = {
  forgotPassword,
  addMessage,
  signWithEmail,
  setRequesting
};

export default connect(mapStateToProps, mapDispatchToProps)(TourAuthScreen);
