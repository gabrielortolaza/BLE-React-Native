import React from "react";
import {
  StyleSheet, View,
} from "react-native";
import PropTypes from "prop-types";

import { InputField, Label } from ".";
import { Colors } from "../../Themes";

const MultilineInput = ({
  maxLength = 500,
  onChangeText,
  style,
  placeholder = "",
  value,
  error = "",
}) => {
  return (
    <View style={[styles.container, style]}>
      <InputField
        onChangeText={onChangeText}
        value={value}
        maxLength={maxLength}
        multiline
        underlineColorAndroid="transparent"
        placeholder={placeholder}
        style={[styles.input, !!error && styles.errorInput]}
      />
      <Label lightGrey2 style={styles.length}>
        {`${(value ?? "").length}/${maxLength}`}
      </Label>
      {error && (
        <Label style={styles.errorLabel}>
          {error}
        </Label>
      )}
    </View>
  );
};

MultilineInput.propTypes = {
  maxLength: PropTypes.number,
  onChangeText: PropTypes.func,
  style: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  placeholder: PropTypes.string,
  value: PropTypes.string,
  error: PropTypes.string,
};

const styles = StyleSheet.create({
  container: {
    width: "100%",
    marginTop: 20,
    marginBottom: 20,
  },
  input: {
    width: "100%",
    fontSize: 14,
    textAlignVertical: "top",
    height: 100,
  },
  errorInput: {
    borderColor: Colors.coral,
  },
  errorLabel: {
    color: Colors.coral,
    marginTop: 6,
  },
  length: {
    position: "absolute",
    right: 8,
    bottom: 2,
  }
});

export default MultilineInput;
