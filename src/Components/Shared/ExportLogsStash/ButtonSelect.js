import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, TouchableOpacity } from "react-native";
import Label from "../Label";
import { Colors } from "../../../Themes";

const ButtonSelect = (props) => {
  const {
    text, active, onSelect,
    style
  } = props;

  return (
    <TouchableOpacity
      style={[
        style,
        styles.container,
        active ? styles.active : styles.inactive
      ]}
      onPress={() => { onSelect && onSelect(text); }}
    >
      <Label
        blue={active}
        lightGrey3={!active}
        font14
      >
        {text}
      </Label>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 7,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 15,
    alignSelf: "flex-start"
  },
  active: {
    backgroundColor: Colors.backgroundBlue
  },
  inactive: {
    backgroundColor: Colors.lightGrey200,
    borderWidth: 1,
    borderColor: Colors.lightGrey300
  }
});

ButtonSelect.propTypes = {
  text: PropTypes.string.isRequired,
  active: PropTypes.bool,
  onSelect: PropTypes.func,
  style: PropTypes.object
};

export default ButtonSelect;
