import React, { PureComponent } from "react";
import {
  View,
  KeyboardAvoidingView
} from "react-native";
import PropTypes from "prop-types";
import Firebase from "@react-native-firebase/app";
import { connect } from "react-redux";

import StyleSheet from "../../Proportional";
import {
  ButtonRound, Label, ModalWrapper, Welcome
} from "../Shared";
import { resetPassword } from "../../Actions/Auth";
import { Colors } from "../../Themes";

class ResetScreen extends PureComponent {
  componentDidMount() {
    Firebase.analytics().logEvent("reset_open");
  }

  componentWillUnmount() {
    Firebase.analytics().logEvent("reset_close");
  }

  resetPassword = () => {
    const { resetPassword } = this.props;
    resetPassword();
  }

  render() {
    const { navigation } = this.props;

    return (
      <ModalWrapper back={navigation.goBack}>
        <KeyboardAvoidingView
          style={styles.container}
          contentContainerStyle={styles.kavContainer}
          behavior="position"
        >
          <Welcome title="Reset password" subtitle="A reset link will be sent to your email" />
          <View style={{ paddingHorizontal: 33 }}>
            <ButtonRound style={styles.button} onPress={this.resetPassword}>
              <Label white font18>Send</Label>
            </ButtonRound>
          </View>
        </KeyboardAvoidingView>
      </ModalWrapper>
    );
  }
}

const styles = StyleSheet.createProportional({
  container: {
    paddingBottom: 15,
    overflow: "hidden"
  },
  kavContainer: {
    overflow: "hidden"
  },
  button: {
    backgroundColor: Colors.blue,
    alignSelf: "center",
    width: "100%",
  }
});

ResetScreen.propTypes = {
  resetPassword: PropTypes.func.isRequired,
  navigation: PropTypes.object
};

const mapDispatchToProps = {
  resetPassword
};

export default connect(null, mapDispatchToProps)(ResetScreen);
