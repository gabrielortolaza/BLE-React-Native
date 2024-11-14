import React, { useState } from "react";
import {
  TouchableOpacity, View, StyleSheet, Image
} from "react-native";
import Modal from "react-native-modal";
import { Label, ButtonRound } from "../Shared";
import { Colors, Images, Fonts } from "../../Themes";
import { navigate } from "../../App/RootNavigation";
import Icon from "../Shared/Icon";

const Instruction = [
  { label: "New to pumping?", key: 1 },
  { label: "Tired of your same old programs?", key: 2 },
  {
    label: "Or looking to share some programs with fellow pumpers?",
    key: 3
  },
];

function ModalTutorialAlert() {
  const [isModalVisible, setModalVisible] = useState(true);
  const listBullet = "\u2022";

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleButtonAction = () => {
    setModalVisible(false);
    navigate("SuperGenie");
  };

  return (
    <Modal isVisible={isModalVisible} style={styles.modalView}>
      <View style={styles.container}>
        <TouchableOpacity style={styles.closeBtn} onPress={toggleModal}>
          <Icon
            name="close"
            style={styles.closeIcon}
          />
        </TouchableOpacity>

        <View style={styles.imageView}>
          <Image source={Images.tutorialImage} />
        </View>

        <Label style={styles.titleText} maxFontSizeMultiplier={1}>
          *NEW* Pumpables Library
        </Label>

        <View style={styles.containerListView}>
          {Instruction.map((item) => {
            return (
              <View
                key={item.key}
                style={styles.lineListView}
              >
                <Label style={styles.listText} maxFontSizeMultiplier={1}>{listBullet}</Label>
                <Label style={styles.listText} maxFontSizeMultiplier={1}>{item.label}</Label>
              </View>
            );
          })}
        </View>
        <Label style={styles.infoText} maxFontSizeMultiplier={1}>
          If you are looking for answers, access to “Programs” to find, create and share programs.
        </Label>

        <View style={styles.buttonView}>
          <ButtonRound
            style={styles.playManualBtn}
            onPress={handleButtonAction}
          >
            <Label white weightSemiBold font16 maxFontSizeMultiplier={1}>Take me to Programs</Label>
          </ButtonRound>
        </View>
      </View>
    </Modal>
  );
}

export default ModalTutorialAlert;

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    backgroundColor: Colors.white,
    marginVertical: 60,
    borderRadius: 8,
    paddingHorizontal: 20,
  },
  container: {
    flex: 1,
    paddingHorizontal: 10,
    flexDirection: "column",
  },
  closeBtn: {
    alignItems: "flex-end",
    top: 15,
    right: -15
  },
  imageView: {
    alignSelf: "center",
    marginTop: 20
  },
  titleText: {
    fontSize: 20,
    ...Fonts.Regular,
    fontWeight: "700",
    marginTop: 20,
  },
  listText: {
    lineHeight: 26,
    fontSize: 13,
    ...Fonts.Regular,
    marginStart: 5
  },
  infoText: {
    lineHeight: 26,
    fontSize: 13,
    ...Fonts.Regular,
    marginTop: 20,
  },
  buttonView: {
    flex: 1,
    justifyContent: "flex-end",
    marginBottom: 40
  },
  playManualBtn: {
    width: "100%",
    backgroundColor: Colors.blueCTA,
    height: 45,
  },
  actionBtn: {
    alignItems: "flex-end",
  },
  containerListView: {
    marginTop: 30,
  },
  lineListView: {
    flexDirection: "row",
  },
  closeIcon: {
    fontSize: 26,
    color: Colors.greyWarm
  },
});
