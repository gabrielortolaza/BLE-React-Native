import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import PropTypes from "prop-types";
import Modal from "react-native-modal";

import { Colors, Fonts } from "../../Themes";
import Label from "./Label";
import Icon from "./Icon";

export default function InfoModal(props) {
  const {
    onPressClose, title, subtitle
  } = props;

  return (
    <Modal isVisible onBackdropPress={onPressClose} style={styles.bottomHalfModal}>
      <View style={styles.container}>
        <View style={styles.titleWrapper}>
          {!!title && <Label style={styles.title}>{title}</Label>}
          <TouchableOpacity
            style={styles.closeIconContainer}
            onPress={onPressClose}
          >
            <Icon
              type="Ionicons"
              name="close-outline"
              style={styles.closeIcon}
            />
          </TouchableOpacity>
        </View>
        {!!subtitle && <Label style={styles.subtitle}>{subtitle}</Label>}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bottomHalfModal: {
    justifyContent: "flex-end",
    margin: 0
  },
  container: {
    backgroundColor: Colors.white,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 36,
    borderRadius: 20,
  },
  title: {
    ...Fonts.Bold,
    fontSize: 16,
    lineHeight: 24,
    width: "88%"
  },
  subtitle: {
    ...Fonts.Regular,
    fontSize: 14,
    lineHeight: 20,
    marginTop: 8,
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeIconContainer: {
    padding: 8
  },
  closeIcon: {
    fontSize: 30,
    color: Colors.grey
  },
});

InfoModal.propTypes = {
  title: PropTypes.string,
  subtitle: PropTypes.string,
  onPressClose: PropTypes.func.isRequired,
};
