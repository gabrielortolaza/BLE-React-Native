import React, { PureComponent } from "react";
import { View } from "react-native";
import PropTypes from "prop-types";
import Modal from "react-native-modal";

import { Colors, Fonts } from "../../Themes";
import StyleSheet from "../../Proportional";
import ButtonRound from "./ButtonRound";
import Label from "./Label";

export default class ConfirmationToast extends PureComponent {
  render() {
    const {
      onPressConfirm, onPressDeny, isOneOptionModal,
      title, subtitle, option1, option2, isSyncProgramModal,
    } = this.props;

    return (
      <Modal onBackdropPress={onPressDeny} isVisible style={styles.bottomHalfModal}>
        <View style={styles.container}>
          <View style={styles.texts}>
            {!!title && <Label style={styles.title}>{title}</Label>}
            {!!subtitle && <Label style={styles.subtitle}>{subtitle}</Label>}
          </View>
          <View style={styles.buttons}>
            {isSyncProgramModal ? (
              <>
                <ButtonRound style={{ width: "30%" }} bordered light onPress={onPressDeny}>
                  <Label>Cancel</Label>
                </ButtonRound>
                <ButtonRound style={{ width: "30%" }} blue onPress={() => onPressConfirm(1)}>
                  <Label white>P1</Label>
                </ButtonRound>
                <ButtonRound style={{ width: "30%" }} blue onPress={() => onPressConfirm(2)}>
                  <Label white>P2</Label>
                </ButtonRound>
              </>
            ) : isOneOptionModal ? (
              <ButtonRound style={styles.fullButton} blue onPress={onPressConfirm}>
                <Label white>
                  {option1 || "OK"}
                </Label>
              </ButtonRound>
            ) : (
              <>
                <ButtonRound style={styles.optionButton} blue onPress={onPressDeny}>
                  <Label white>
                    {option1 || "No"}
                  </Label>
                </ButtonRound>
                <ButtonRound style={styles.optionButton} bordered light onPress={onPressConfirm}>
                  <Label>
                    {option2 || "Yes"}
                  </Label>
                </ButtonRound>
              </>
            )}
          </View>
        </View>
      </Modal>
    );
  }
}

const styles = StyleSheet.createProportional({
  bottomHalfModal: {
    justifyContent: "flex-end",
    margin: 0
  },
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.white,
    paddingHorizontal: 25,
    paddingVertical: 30,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  title: {
    ...Fonts.Bold,
    fontSize: 16,
    lineHeight: 24,
  },
  subtitle: {
    ...Fonts.Regular,
    fontSize: 16,
    lineHeight: 20,
    marginTop: 10,
  },
  buttons: {
    marginTop: 38,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  optionButton: {
    width: "45%",
  },
  fullButton: {
    width: "100%",
  },
});

ConfirmationToast.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  onPressDeny: PropTypes.func.isRequired,
  onPressConfirm: PropTypes.func.isRequired,
  option1: PropTypes.string,
  option2: PropTypes.string,
  isOneOptionModal: PropTypes.bool,
  isSyncProgramModal: PropTypes.bool,
};
