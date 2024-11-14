import React, { useState } from "react";
import {
  StyleSheet, TouchableOpacity, View
} from "react-native";
import PropTypes from "prop-types";

import { Colors } from "../../Themes";
import Icon from "./Icon";
import Label from "./Label";

export default function TextMoreBox(props) {
  const { text, openMoreText, maxLenNum } = props;

  const [updatedMaxLenNum, updateMaxLenNum] = useState(21);
  const [showMoreIcon, setShowMoreIcon] = useState(false);

  const checkIfToShowMoreIcon = (lineLength) => {
    if (lineLength > maxLenNum) {
      updateMaxLenNum(maxLenNum);
      setShowMoreIcon(true);
    }
  };

  return (
    <TouchableOpacity
      onPress={openMoreText}
      style={styles.container}
    >
      <View style={styles.textView}>
        <Label
          onTextLayout={(e) => checkIfToShowMoreIcon(e.nativeEvent.lines.length)}
          font14
          numberOfLines={updatedMaxLenNum}
          maxFontSizeMultiplier={1}
        >
          {`    ${text}` || ""}
        </Label>
      </View>
      <View style={styles.iconView}>
        {showMoreIcon && (
          <Icon
            type="MaterialCommunityIcons"
            name="chevron-double-right"
            style={styles.icon}
          />
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row"
  },
  textView: {
    width: "93%",
    alignItems: "center"
  },
  iconView: {
    width: "7%",
    justifyContent: "flex-end"
  },
  icon: {
    color: Colors.blue,
    fontSize: 20
  }
});

TextMoreBox.propTypes = {
  text: PropTypes.string,
  maxLenNum: PropTypes.number,
  openMoreText: PropTypes.func
};
