import React from "react";
import { StyleSheet, TouchableOpacity } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { isIphoneX } from "react-native-iphone-x-helper";

import { Colors } from "../../../../Themes";
import Icon from "../../../Shared/Icon";

const BackArea = () => {
  const navigation = useNavigation();

  return (
    <TouchableOpacity
      onPress={navigation.goBack}
      style={styles.backBtnView}
    >
      <Icon style={styles.backIcon} name="chevron-back" />
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  backBtnView: {
    position: "absolute",
    top: isIphoneX() ? 40 : 10,
    left: 0,
    width: 60,
    height: 60,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10000
  },
  backIcon: {
    fontSize: 24,
    color: Colors.grey,
  },
});

BackArea.propTypes = {
};

export default BackArea;
