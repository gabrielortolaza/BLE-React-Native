import React from "react";
import {
  TouchableOpacity, View, StyleSheet, ScrollView, Linking, Platform
} from "react-native";
import Modal from "react-native-modal";
import PropTypes from "prop-types";

import { Colors, Fonts } from "../../../Themes";
import { Label } from "../../Shared";
import { CONTACT_URL } from "../../../Config/constants";
import Icon from "../../Shared/Icon";

const Instruction = [
  { label: "Make sure SuperGenie is on and nearby", root: true, key: 1 },
  { label: "Restart your pump", root: true, key: 2 },
  {
    label: "Choose Allow when asked to allow access to location services",
    root: true,
    platform: "android",
    key: 3
  },
  {
    label:
      "Ensure location services is enabled in the App section of your phone settings",
    root: false,
    platform: "android",
    key: 4
  },
  {
    label:
      "Important: Do not select SuperGenie in the phone's bluetooth settings, click Done or Cancel instead. If you have already selected SuperGenie in the bluetooth menu, unpair with it, uninstall and reinstall the app",
    root: false,
    platform: "android",
    key: 5
  },
  {
    label:
      "Once Bluetooth is enabled in the phone settings, check the status of the Bluetooth icon on the pump",
    root: true,
    key: 6
  },
  {
    label: "If you see a double Bluetooth icon, restart your SuperGenie pump",
    root: false,
    key: 7
  },
  {
    label: "Once done, you should be able to find and pair with your pump",
    root: false,
    key: 8
  },
];

function InstructionModal(props) {
  const { isVisible, onClose } = props;
  const listBullet = "\u2022";

  return (
    <Modal isVisible={isVisible} style={styles.modalView}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
          <Icon name="close" style={styles.closeIcon} />
        </TouchableOpacity>

        <ScrollView style={styles.containerListView}>
          {Instruction.map((item) => {
            if (Platform.OS === "ios" && item.platform === "android") return null;
            return (
              <View
                key={item.key}
                style={[styles.lineListView, item.root ? {} : styles.subItem]}
              >
                <Label style={styles.listText}>{listBullet}</Label>
                <Label style={styles.listText}>{item.label}</Label>
              </View>
            );
          })}
          <View style={styles.lineListView}>
            <Label style={styles.listText}>{listBullet}</Label>
            <Label style={styles.listText}>
              If none of the above helps, please
              {" "}
              <Label
                style={styles.contactText}
                onPress={() => Linking.openURL(CONTACT_URL)}
              >
                reach out to us
              </Label>
            </Label>
          </View>
        </ScrollView>
      </View>
    </Modal>
  );
}

InstructionModal.propTypes = {
  isVisible: PropTypes.bool,
  onClose: PropTypes.func,
};

export default InstructionModal;

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    backgroundColor: Colors.white,
    marginVertical: 100,
    borderRadius: 8,
  },
  container: {
    flex: 1,
  },
  closeBtn: {
    alignItems: "flex-end",
    marginRight: 16,
    marginTop: 16,
  },
  listText: {
    lineHeight: 26,
    fontSize: 15,
    ...Fonts.Regular,
    marginStart: 5,
  },
  subItem: {
    marginLeft: 16
  },
  contactText: {
    lineHeight: 26,
    fontSize: 15,
    ...Fonts.Regular,
    color: Colors.blue,
  },
  containerListView: {
    marginTop: 30,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  lineListView: {
    flexDirection: "row",
  },
  closeIcon: {
    fontSize: 26,
    color: Colors.greyWarm,
  },
});
