import React, { Component } from "react";
import { TextInput, View } from "react-native";
import PropTypes from "prop-types";
import moment from "moment";
import DateTimePicker from "react-native-modal-datetime-picker";

import { Fonts, Colors } from "../../Themes";
import StyleSheet from "../../Proportional";
import { ButtonRound, Label } from "../Shared";

export default class MarkMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      text: "",
      startTime: new Date(),
      isDatePickerVisible: false,
    };
  }

  componentDidMount() {
    const { event } = this.props;
    console.log("focus event", event);
    const startTimeStr = moment(event.startsAt).format("HH:mm");
    this.setState({ text: startTimeStr, startTime: moment(event.startsAt).toDate() });
  }

  onPressOK = () => {
    const { startTime } = this.state;
    const { onPress, selectedEventKey } = this.props;
    const startTimeStr = moment(startTime).format("HH:mm");
    onPress(selectedEventKey, "SET", startTimeStr);
  };

  onPressCancel = () => {
    const { onPress, selectedEventKey } = this.props;
    onPress(selectedEventKey, "SET", "");
  };

  onPressRemove = () => {
    const { onPress, selectedEventKey } = this.props;
    onPress(selectedEventKey, "REMOVE");
  };

  onPressConfirm = (date) => {
    this.setState({
      startTime: date,
      isDatePickerVisible: false
    }, () => {
      this.onPressOK();
    });
  };

  renderCustom = () => {
    const { text } = this.state;
    return (
      <TextInput
        autoFocus
        keyboardType="numeric"
        maxLength={5}
        onBlur={this.onPressOK}
        value={text}
        onChangeText={(text) => this.setState({ text })}
        placeholder="HH:mm"
        returnKeyType="done"
        selectionColor={Colors.windowsBlue}
        style={styles.customInput}
        underlineColorAndroid="transparent"
        testID="Schedule_Menu_Input"
      />
    );
  };

  render() {
    const { isDatePickerVisible, text, startTime } = this.state;
    const { style } = this.props;
    return (
      <View
        testID="Schedule_Menu"
        style={[style, styles.container, { top: style.top }]}
      >
        <ButtonRound
          testID="Schedule_Menu_Custom"
          white
          shadow
          style={{ marginBottom: 3 }}
          onPress={() => this.setState({ isDatePickerVisible: true })}
        >
          <Label blue font18>{text}</Label>
        </ButtonRound>
        <ButtonRound
          testID="Schedule_Menu_Custom"
          white
          shadow
          style={{ marginBottom: 3 }}
          onPress={this.onPressOK}
        >
          <Label blue font18>OK</Label>
        </ButtonRound>
        {/* <ButtonRound
          testID="Schedule_Menu_Custom"
          white
          shadow
          style={{ marginBottom: 3 }}
          onPress={this.onPressCancel}
        >
          <Label blue font18>Cancel</Label>
        </ButtonRound> */}
        <ButtonRound
          testID="Schedule_Menu_Remove"
          white
          shadow
          onPress={this.onPressRemove}
        >
          <Label warmGrey font18>Delete</Label>
        </ButtonRound>
        <DateTimePicker
          date={startTime}
          is24Hour={false}
          isVisible={isDatePickerVisible}
          onConfirm={this.onPressConfirm}
          onCancel={() => this.setState({ isDatePickerVisible: false })}
          mode="time"
          headerTextIOS="Pick a time"
        />
      </View>
    );
  }
}

const styles = StyleSheet.createProportional({
  container: {
    width: 106,
    justifyContent: "space-between",
    overflow: "visible",
    position: "absolute"
  },
  buttonText: {
    textAlign: "center",
    width: 56,
    fontSize: 14
  },
  customInput: {
    width: 56,
    ...Fonts.Regular,
    fontSize: 14,
    textAlign: "center",
    zIndex: 10,
    color: Colors.blue
  }
});

MarkMenu.propTypes = {
  event: PropTypes.object,
  style: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  selectedEventKey: PropTypes.string,
  onPress: PropTypes.func
};
