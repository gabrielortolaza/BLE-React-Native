import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  Text, TextInput, View,
  Platform, TouchableWithoutFeedback, StyleSheet
} from "react-native";

import { Fonts, Colors } from "../../Themes";

export default class FocusableLabel extends Component {
  constructor(props) {
    super(props);

    this.state = {
      isFocused: false
    };
  }

  focus = () => {
    if (this.inputRef) {
      this.inputRef.focus();
    }
  };

  onFocus = () => {
    const { focus, onFocus } = this.props;

    if (!focus) {
      onFocus
        ? onFocus()
        : this.setState({ isFocused: true });
    }
  };

  onChangeText = (text) => {
    const { onChangeText } = this.props;

    onChangeText
      ? onChangeText(text)
      : this.setState({ text });
  };

  setInputRef = (inputRef) => {
    this.inputRef = inputRef;
  };

  onBlur = () => {
    const { onFinishEditing } = this.props;
    const { text } = this.state;

    if (onFinishEditing) {
      onFinishEditing(text);
    }
  };

  render() {
    const {
      blurOnSubmit, flexGrow, fullWidth,
      multiline, focus, input,
      keyboardType, maxLength, onFocus,
      onSubmitEditing, placeholder, returnKeyType,
      staticText, style, value,
      textAlign, testID, underline,
      inputStyle,
    } = this.props;
    const { isFocused, text } = this.state;
    if (input) {
      const containerStyles = [
        styles.container,
        (flexGrow || fullWidth) && styles.containerFlex,
        (focus || isFocused || underline) && styles.containerFocused,
        styles.containerColumn,
        style
      ];

      const inputStyles = [
        styles.text,
        (flexGrow) && styles.rowFlex,
        multiline && styles.inputMultiline,
        inputStyle,
      ];
      return (
        <TouchableWithoutFeedback onPress={this.focus}>
          <View style={containerStyles}>
            <TextInput
              blurOnSubmit={
                multiline ? false : blurOnSubmit || !!onSubmitEditing
              }
              testID={testID}
              multiline={multiline}
              textAlign={textAlign}
              maxLength={maxLength || null}
              onChangeText={this.onChangeText}
              onBlur={this.onBlur}
              onFocus={this.onFocus}
              onSubmitEditing={multiline ? null : this.onSubmitEditing}
              placeholder={placeholder}
              placeholderTextColor={Colors.greyishBrown40p}
              ref={this.setInputRef}
              returnKeyType={returnKeyType || "done"}
              keyboardType={keyboardType}
              selectionColor={Colors.grey}
              style={inputStyles}
              underlineColorAndroid="transparent"
              value={value || text}
            />
            {staticText && (
              <Text
                onPress={() => this.focus()}
                style={[styles.text, styles.staticText]}
              >
                {staticText}
              </Text>
            )}
          </View>
        </TouchableWithoutFeedback>
      );
    }

    const showPlaceholder = !value && placeholder;

    return (
      <View
        style={[
          styles.container,
          flexGrow && styles.containerFlex,
          style,
          (focus || isFocused || underline) && styles.containerFocused
        ]}
      >
        <Text
          style={[
            styles.text,
            flexGrow && styles.textFlex,
            showPlaceholder && styles.textPlaceholder
          ]}
          onPress={onFocus}
        >
          {value || placeholder}
        </Text>
        {!showPlaceholder
          && staticText && (
            <Text style={[styles.text, styles.staticText]} onPress={onFocus}>
              {staticText}
            </Text>
        )}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    overflow: "hidden",
    borderRadius: 5,
    backgroundColor: Colors.white,
    paddingLeft: 10,
    paddingRight: 24,
    borderWidth: 0,
    borderColor: "transparent",
    // justifyContent: 'center',
    flexDirection: "row",
    height: 40,
    borderBottomWidth: 2,
    flex: 0
  },
  containerFocused: {
    borderColor: Colors.seafomBlue,
    borderBottomLeftRadius: 0,
    borderBottomRightRadius: 0
  },
  containerFlex: {
    flex: 1
  },
  containerColumn: {
    flexDirection: "column"
  },
  rowFlex: {
    flex: 1
  },
  inputMultiline: {
    bottom: 0,
    height: null,
    paddingTop: 10,
    paddingBottom: 10,
    textAlignVertical: "top"
  },
  text: {
    ...Fonts.Regular,
    fontSize: 14,
    color: Colors.grey,
    minWidth: 20,
    height: 40,
    paddingTop: Platform.select({ ios: 0, android: 4 }),
    paddingBottom: 0
  },
  textFlex: {
    flex: 1
  },
  textPlaceholder: {
    opacity: 0.4
  },
  staticText: {
    position: "absolute",
    right: 4,
    opacity: 0.4,
    paddingLeft: 4,
    paddingTop: 10,
    backgroundColor: "transparent"
  }
});

FocusableLabel.propTypes = {
  blurOnSubmit: PropTypes.bool,
  flexGrow: PropTypes.bool,
  textAlign: PropTypes.string,
  focus: PropTypes.oneOfType([PropTypes.string, PropTypes.bool]),
  underline: PropTypes.bool,
  multiline: PropTypes.bool,
  fullWidth: PropTypes.bool,
  input: PropTypes.bool,
  keyboardType: PropTypes.string,
  maxLength: PropTypes.number,
  onChangeText: PropTypes.func,
  onFocus: PropTypes.func,
  onFinishEditing: PropTypes.func,
  onSubmitEditing: PropTypes.func,
  placeholder: PropTypes.string,
  returnKeyType: PropTypes.string,
  staticText: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  inputStyle: PropTypes.oneOfType([PropTypes.object, PropTypes.number]),
  value: PropTypes.string,
  testID: PropTypes.string
};
