import React, { useState } from "react";
import {
  Image, StyleSheet, TouchableOpacity, View
} from "react-native";
import Modal from "react-native-modal";
import { useDispatch, useSelector } from "react-redux";

import Label from "./Label";
import ButtonRound from "./ButtonRound";
import { Colors, Images, Styles } from "../../Themes";
import Icon from "./Icon";
import { createKlaviyoProfile, saveNewsletterValue } from "../../Actions";

const NewsletterModal = () => {
  const [isVisible, setVisible] = useState(true);
  const displayName = useSelector((state) => state.auth.profile.displayName);
  const email = useSelector((state) => state.auth.profile.email);
  const dispatch = useDispatch();

  const handleSubscribe = () => {
    dispatch(createKlaviyoProfile(email, displayName, true));
    saveNewsletterValue(true);
  };

  return (
    <Modal
      isVisible={isVisible}
      style={styles.bottomHalfModal}
      onBackdropPress={() => {
        setVisible(false);
        saveNewsletterValue(false);
      }}
    >
      <View style={{ backgroundColor: "white" }}>
        <Image
          style={styles.image}
          source={Images.union}
        />
        <View style={styles.container}>
          <View style={styles.titleWrapper}>
            <Label weightBold font20>Enjoying Pumpables?</Label>
            <TouchableOpacity
              style={styles.closeIconContainer}
              onPress={() => {
                setVisible(false);
                saveNewsletterValue(false);
              }}
            >
              <Icon
                type="Ionicons"
                name="close-outline"
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          </View>
          <Label mb16>
            Subscribe if you'd like to hear about our next sale
          </Label>
          <ButtonRound
            blue
            style={Styles.fullWidth}
            onPress={() => {
              setVisible(false);
              handleSubscribe();
            }}
          >
            <Label white weightSemiBold>Subscribe</Label>
          </ButtonRound>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  bottomHalfModal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  container: {
    borderRadius: 20,
    paddingVertical: 30,
    paddingHorizontal: 25,
  },
  image: {
    width: "100%",
    height: 60,
    position: "absolute",
    top: 0
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

export default NewsletterModal;
