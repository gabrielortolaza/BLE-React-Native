import React, { Component } from "react";
import {
  View,
  Modal,
  Platform
} from "react-native";
import PropTypes from "prop-types";

import { Colors } from "../../../Themes";
import ButtonRound from "../../Shared/ButtonRound";
import Label from "../../Shared/Label";

export default class SaveConfirmation extends Component {
  constructor(props) {
    super(props);

    this.state = {
      selectedChoice: 3, // 1, 2 or 3
      visible: true
    };
  }

  onPressConfirm = (selectedChoice = 3) => {
    this.setState({
      selectedChoice,
      visible: false
    });

    if (Platform.OS === "android") {
      setTimeout(this.onDismiss, 200);
    }
  }

  onDismiss = () => {
    const { onPressConfirm } = this.props;
    const { selectedChoice } = this.state;

    onPressConfirm(selectedChoice);
  }

  onRequestClose = () => {
    this.onPressConfirm();
  }

  render() {
    const {
      title,
    } = this.props;
    const { visible } = this.state;

    return (
      <Modal onRequestClose={this.onRequestClose} onDismiss={this.onDismiss} visible={visible} transparent animationType="slide">
        <View style={styles.container}>
          <View style={styles.texts}>
            {!!title && <Label font18 white>{title}</Label>}
          </View>
          <View style={styles.buttons}>
            <View style={{ paddingLeft: 50 }}>
              <ButtonRound style={styles.pButton} white onPress={() => this.onPressConfirm(1)}>
                <Label font12 blue>Overwrite current programs</Label>
              </ButtonRound>
            </View>
            <View style={styles.subButtons}>
              <ButtonRound style={styles.pButton} white onPress={() => this.onPressConfirm(2)}>
                <Label font12 blue>Save as new</Label>
              </ButtonRound>
              <ButtonRound style={styles.pButton} white onPress={() => this.onPressConfirm(3)}>
                <Label font12 blue>Discard changes</Label>
              </ButtonRound>
            </View>
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = {
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.windowsBlue,
    flexDirection: "column",
    paddingHorizontal: 15,
    paddingVertical: 30
  },
  texts: {
    marginBottom: 10,
  },
  buttons: {
  },
  subButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-around",
    marginTop: 8,
  },
  pButton: {
    paddingHorizontal: 20,
  }
};

SaveConfirmation.propTypes = {
  title: PropTypes.string,
  onPressConfirm: PropTypes.func.isRequired
};
