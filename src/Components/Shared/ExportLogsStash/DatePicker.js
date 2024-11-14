import React, { useState } from "react";
import { View, StyleSheet, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import moment from "moment";

import Label from "../Label";
import Icon from "../Icon";
import AlternateDatePicker from "../AlternateDatePicker";
import { Colors } from "../../../Themes";

const DatePicker = (props) => {
  const { dateAt } = props;
  const [showPicker, setShowPicker] = useState(false);

  const momentDateAt = moment(dateAt, "x");

  const onDatePickerConfirm = (date) => {
    const { onChange } = props;

    setShowPicker(false);
    onChange(date);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity
        onPress={() => setShowPicker(true)}
        style={styles.dateLabel}
      >
        <View style={styles.dateWrap}>
          <Label
            font14
            maxFontSizeMultiplier={1}
            style={styles.textLabel}
          >
            {momentDateAt.format("MMM DD, YYYY")}
          </Label>
          <Icon
            name="down"
            type="AntDesign"
            style={styles.downIcon}
          />
        </View>
      </TouchableOpacity>
      {showPicker && (
        <AlternateDatePicker
          date={momentDateAt.toDate()}
          onConfirm={onDatePickerConfirm}
          isVisible={showPicker}
          mode="date"
          onCancel={() => setShowPicker(false)}
        />
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {},
  dateLabel: {
    backgroundColor: Colors.input,
    borderColor: Colors.tertiary,
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 14
  },
  dateWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 5
  },
  textLabel: {
    marginTop: 3
  },
  downIcon: {
    marginLeft: 10,
    color: Colors.lightGrey2,
    fontWeight: "bold"
  }
});

DatePicker.propTypes = {
  dateAt: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
  onChange: PropTypes.func.isRequired
};

export default DatePicker;
