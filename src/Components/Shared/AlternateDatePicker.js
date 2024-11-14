import React from "react";
import { DatePickerAndroid, TimePickerAndroid } from "react-native";
import DateTimePicker from "react-native-modal-datetime-picker";
import PropTypes from "prop-types";
import moment from "moment";

class AlternateDatePicker extends React.PureComponent {
  openAndroidDatePicker = async () => {
    const {
      mode, date, onConfirm,
      onCancel
    } = this.props;

    try {
      const momentDate = date ? moment(date) : moment();
      if (mode === "date" || mode === "datetime") {
        const {
          action, year, month,
          day
        } = await DatePickerAndroid.open({
          date: momentDate.toDate(),
          maxDate: Date.now()
        });
        if (action === DatePickerAndroid.dismissedAction) {
          onCancel();
          return;
        }

        momentDate.year(year).month(month).date(day);
        if (mode === "date") {
          onConfirm(momentDate.toDate());
          return;
        }
      }
      if (mode === "time" || mode === "datetime") {
        const { action, hour, minute } = await TimePickerAndroid.open({
          hour: momentDate.hour(),
          minute: momentDate.minute()
        });
        if (action !== TimePickerAndroid.dismissedAction) {
          onConfirm(momentDate.hour(hour).minute(minute).toDate());
          return;
        }
      }
    } catch ({ code, message }) {
      console.warn("Cannot open date picker", message);
    }
    onCancel();
  };
  /*
  componentDidMount () {
    if (Platform.OS === "androidx") {
      this.openAndroidDatePicker()
    }
  }
*/

  render() {
    const {
      date, mode, onConfirm,
      onCancel, isVisible
    } = this.props;
    const title = mode === "time" ? "Pick a time" : "Pick a date";

    return (
      <DateTimePicker
        date={date}
        is24Hour={false}
        isVisible={isVisible}
        onConfirm={onConfirm}
        mode={mode}
        display="spinner"
        onCancel={onCancel}
        titleIOS={title}
      />
    );
  }
}

export default AlternateDatePicker;

AlternateDatePicker.propTypes = {
  isVisible: PropTypes.bool,
  date: PropTypes.object.isRequired,
  mode: PropTypes.string.isRequired,
  onConfirm: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired
};
