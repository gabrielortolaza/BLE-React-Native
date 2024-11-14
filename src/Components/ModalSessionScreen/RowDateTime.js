import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Platform, TouchableOpacity, View } from "react-native";
import moment from "moment";

import { AlternateDatePicker, FocusableLabel, Label } from "../Shared";
import Icon from "../Shared/Icon";
import Styles from "./Styles";
import { SESSION_FINISHED_AT, SESSION_STARTED_AT } from "../../Config/constants";

export default class RowDateTime extends PureComponent {
  constructor(props) {
    super(props);

    this.state = {
      pickerMode: "datetime",
      duration: "",
    };
  }

  componentDidMount() {
    const {
      startedAt, finishedAt,
    } = this.props;
    const duration = ((finishedAt - startedAt) / 60000).toFixed(2);
    if (duration !== "0.00") {
      this.setState({ duration: `${duration}` });
    }
  }

  onDatePickerConfirm = (date) => {
    const {
      focus, onChange, onFocus,
    } = this.props;

    const { duration } = this.state;

    onFocus && onFocus(focus);

    setTimeout(() => {
      // Give onFocus time to setState
      onChange(focus, date);

      // Set/change finishedAt if day or startedAt was changed
      if (focus === SESSION_STARTED_AT) {
        const newDate = moment(date).add(duration, "minutes");
        onChange(SESSION_FINISHED_AT, newDate);
      }
    }, 500);
  };

  onChangeDuration = (duration) => {
    const { startedAt, onChange } = this.props;
    this.setState({ duration });
    const momentStartedAt = startedAt ? moment(startedAt, "x") : moment();
    momentStartedAt.add(duration, "minutes");
    onChange(SESSION_FINISHED_AT, momentStartedAt);
  };

  clearFocus = () => {
    const { onFocus } = this.props;
    onFocus("");
  };

  handleFocus = (focus, pickerMode) => {
    const { onFocus } = this.props;

    onFocus(focus);
    this.setState({ pickerMode });
  };

  render() {
    const {
      startedAt, finishedAt, focus,
      editable, hideDuration
    } = this.props;
    const { pickerMode, duration } = this.state;

    const doNotEdit = editable === false;

    const momentStartedAt = startedAt ? moment(startedAt, "x") : moment();
    const momentFinishedAt = finishedAt ? moment(finishedAt, "x") : moment();

    const showPicker = [SESSION_STARTED_AT, SESSION_FINISHED_AT].indexOf(focus) > -1;

    return (
      <View style={Styles.dateTimeContainer}>
        <View style={Styles.row}>
          <TouchableOpacity
            disabled={doNotEdit}
            onPress={() => !doNotEdit && this.handleFocus(SESSION_STARTED_AT, "date")}
            style={Styles.dateTimeLabel}
          >
            <View style={Styles.dateTimeWrap}>
              <Label>{momentStartedAt.format("D MMM")}</Label>
              <Icon name="down" type="AntDesign" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity
            disabled={doNotEdit}
            onPress={() => !doNotEdit && this.handleFocus(SESSION_STARTED_AT, "time")}
            style={Styles.dateTimeLabel}
          >
            <View style={Styles.dateTimeWrap}>
              <Label>{momentStartedAt.format("h:mmA")}</Label>
              <Icon name="down" type="AntDesign" />
            </View>
          </TouchableOpacity>
        </View>
        {(!doNotEdit && !hideDuration) && (
          <>
            <Label font12 weightBold mb10>
              DURATION
            </Label>
            <FocusableLabel
              onChangeText={this.onChangeDuration}
              value={duration}
              placeholder="0"
              keyboardType={Platform.OS === "ios" ? "numbers-and-punctuation" : "numeric"}
              returnKeyType="done"
              input
              style={Styles.focusLabel}
              staticText="minutes"
            />
          </>
        )}
        {showPicker && (
          <AlternateDatePicker
            onRef={this.openAndroidDatePicker}
            date={focus === SESSION_FINISHED_AT
              ? momentFinishedAt.toDate() : momentStartedAt.toDate()}
            onConfirm={this.onDatePickerConfirm}
            isVisible={showPicker}
            mode={pickerMode}
            onCancel={this.clearFocus}
          />
        )}
      </View>
    );
  }
}

RowDateTime.propTypes = {
  startedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  finishedAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  focus: PropTypes.string,
  onFocus: PropTypes.func.isRequired,
  onChange: PropTypes.func.isRequired,
  editable: PropTypes.bool,
  hideDuration: PropTypes.bool,
};
