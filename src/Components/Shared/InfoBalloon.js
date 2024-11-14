import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  View, TouchableOpacity, StyleSheet,
  Platform
} from "react-native";
import Balloon from "rn-balloon";
import Icon from "./Icon";
import { Label as Text } from ".";
import { Colors, Fonts } from "../../Themes";
import { appWidth } from "../../Services/SharedFunctions";

const InfoBalloon = ({
  dataArr = [], finishedAction, closeAction
}) => {
  const [index, setIndex] = useState(0);

  const handleAction = () => {
    if (dataArr.length > (index + 1)) {
      dataArr[index].action();
      setIndex(index + 1);
    } else {
      finishedAction();
    }
  };

  const handleCloseAction = () => {
    if (closeAction) {
      closeAction();
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          marginTop: dataArr[index].yOffset,
        }
      ]}
    >
      <Balloon
        containerStyle={styles.balloon}
        borderColor="rgba(196, 235, 223, 1)"
        backgroundColor="rgba(196, 235, 223, 1)"
        borderWidth={2}
        borderRadius={8}
        triangleSize={12}
        width={appWidth * 0.86}
        triangleOffset={dataArr[index].xOffset}
        triangleDirection={dataArr[index].direction} // top/bottom/left/right
      >
        <View style={styles.titleView}>
          <Text maxFontSizeMultiplier={1} style={styles.titleText}>
            {dataArr[index].titleText}
          </Text>
          <TouchableOpacity style={styles.closeBtn} onPress={handleCloseAction}>
            <Icon
              name="close"
              style={styles.closeIcon}
            />
          </TouchableOpacity>
        </View>
        <Text maxFontSizeMultiplier={1} style={styles.msgText}>
          {dataArr[index].msgText}
        </Text>
        <View
          style={styles.btnsView}
        >
          {index !== 0 ? (
            <TouchableOpacity style={styles.backBtn} onPress={() => setIndex(index - 1)}>
              <Text blue maxFontSizeMultiplier={1} style={styles.backBtnText}>
                BACK
              </Text>
            </TouchableOpacity>
          ) : <View />}
          <TouchableOpacity style={styles.actionBtn} onPress={handleAction}>
            <Text blue maxFontSizeMultiplier={1} style={styles.actionBtnText}>
              {dataArr[index].btnText}
            </Text>
          </TouchableOpacity>
        </View>
      </Balloon>
    </View>
  );
};

export default InfoBalloon;

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "95%",
    marginLeft: "2.5%"
  },
  balloon: {
    alignSelf: "center"
  },
  titleView: {
    flexDirection: "row",
    marginBottom: 20,
  },
  titleText: {
    fontSize: 16,
    fontWeight: Platform.OS === "android" ? "700" : "600",
    marginHorizontal: 10,
    lineHeight: 24
  },
  msgText: {
    lineHeight: 22,
    marginRight: 8,
    marginStart: 10,
    marginBottom: 10,
    fontSize: 14,
    fontWeight: "400",
  },
  closeBtn: {
    top: -3,
    right: -3,
    position: "absolute",
  },
  closeIcon: {
    fontSize: 23,
    color: Colors.lightGrey2,
  },
  btnsView: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10
  },
  backBtn: {},
  backBtnText: {
    fontSize: 12,
    ...Fonts.Regular,
    fontWeight: "600",
    lineHeight: 18,
  },
  actionBtn: {},
  actionBtnText: {
    fontSize: 12,
    ...Fonts.Regular,
    fontWeight: "600",
    lineHeight: 18
  }
});

InfoBalloon.propTypes = {
  dataArr: PropTypes.array,
  finishedAction: PropTypes.func.isRequired,
  closeAction: PropTypes.func
};
