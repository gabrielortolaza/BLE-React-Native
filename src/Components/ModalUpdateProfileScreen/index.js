import React, { PureComponent } from "react";
import { View, KeyboardAvoidingView } from "react-native";
import PropTypes from "prop-types";
import Firebase from "@react-native-firebase/app";
import { connect } from "react-redux";

import { Colors, Fonts } from "../../Themes";
import StyleSheet from "../../Proportional";
import {
  ModalWrapper, ButtonRound, Label, Welcome, InputField
} from "../Shared";
import { setDisplayName } from "../../Actions/Auth";

class UpdateProfileScreen extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      displayName: (props.route.params && props.route.params.displayName) || ""
    };
  }

  componentDidMount() {
    Firebase.analytics().logEvent("update_profile_open");
  }

  componentWillUnmount() {
    Firebase.analytics().logEvent("update_profile_close");
  }

  setDisplayName = async () => {
    const { displayName } = this.state;
    const { navigation, setDisplayName } = this.props;
    await setDisplayName(displayName);
    navigation.goBack();
  }

  render() {
    const { navigation } = this.props;
    const { displayName } = this.state;

    return (
      <ModalWrapper back={navigation.goBack}>
        <KeyboardAvoidingView
          style={styles.container}
          contentContainerStyle={styles.kavContainer}
          behavior="position"
        >
          <Welcome title="Change Name" subtitle="" />
          <InputField
            autoCorrect={false}
            style={styles.titleText}
            autoFocus
            onChangeText={(text) => this.setState({ displayName: text })}
            value={displayName}
            placeholder="Enter your name"
          />
          <View style={styles.buttonContainer}>
            <ButtonRound
              style={styles.button}
              onPress={this.setDisplayName}
              disabled={!displayName}
            >
              <Label white font18>Update</Label>
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
  buttonContainer: {
    paddingHorizontal: 33
  },
  button: {
    backgroundColor: Colors.blue,
    alignSelf: "center",
    width: "100%",
  },
  titleText: {
    fontSize: 16,
    ...Fonts.Regular,
    color: Colors.greyishBrown,
    marginHorizontal: 33,
    marginBottom: 30
  },
});

UpdateProfileScreen.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object,
  setDisplayName: PropTypes.func.isRequired,
};

const mapDispatchToProps = {
  setDisplayName
};

export default connect(null, mapDispatchToProps)(UpdateProfileScreen);
