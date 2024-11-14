import React, { Component } from "react";
import PropTypes from "prop-types";
import { TextInput } from "react-native";

import { Fonts, Colors } from "../../Themes";
import StyleSheet from "../../Proportional";

export default class InputField extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasFocus: false
    };
  }

  onInputRef = (inputRef) => {
    this.inputRef = inputRef;
  };

  hasFocus = () => this.setState({ hasFocus: true });

  lostFocus = () => this.setState({ hasFocus: false });

  focus = () => this.inputRef.focus();

  blur = () => this.inputRef.blur();

  render() {
    const { returnKeyType, testID, style } = this.props;
    const { hasFocus } = this.state;
    return (
      <TextInput
        {...this.props}
        onBlur={this.lostFocus}
        onFocus={this.hasFocus}
        placeholderTextColor={Colors.tertiary}
        ref={this.onInputRef}
        returnKeyType={returnKeyType || "done"}
        selectionColor={Colors.windowsBlue}
        style={[styles.container, hasFocus ? styles.focused : {}, style]}
        testID={`${testID || "InputField"}_TextInput`}
        underlineColorAndroid="transparent"
      />
    );
  }
}

const styles = StyleSheet.createProportional({
  container: {
    ...Fonts.SemiBold,
    fontSize: 15,
    height: 50,
    // lineHeight: Platform.OS === 'ios' ? 38 : null,
    color: Colors.grey,
    backgroundColor: Colors.input,
    paddingHorizontal: 14,
    marginTop: 10,
    borderRadius: 5
  },
  focused: {
    borderColor: Colors.tertiary,
    borderWidth: 1
  }
});

InputField.propTypes = {
  returnKeyType: PropTypes.string,
  style: PropTypes.oneOfType([PropTypes.object, PropTypes.number, PropTypes.array]),
  testID: PropTypes.string
};
