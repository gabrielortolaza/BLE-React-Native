/** Page appears to no longer be used */
/* eslint-disable */
import React, { Component } from "react";
import PropTypes from "prop-types";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  Text, View, Platform, DatePickerAndroid
} from "react-native";
import moment from "moment";

import { Fonts, Colors } from "../../Themes";
import StyleSheet from "../../Proportional";
import { RoundButton, PickerRoll } from "../Shared";

const MONTHS = Array.apply(0, Array(12)).map((_, i) => {
  return {
    label: moment()
      .month(i)
      .format("MMM"),
    value: i
  };
});

const YEARS = Array.apply(0, Array(3)).map(function(_, i) {
  var year = moment()
    .year(moment().year() - i)
    .format("YYYY");
  return { label: year, value: year };
});

export default class TourBabyAgeScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      babyBirthday: props.babyBirthday || Date.now()
    };
  }

  openAndroidDatePicker = async () => {
    try {
      const { action, year, month, day } = await DatePickerAndroid.open({
        date: this.state.babyBirthday,
        maxDate: Date.now(),
        minDate: moment()
          .subtract(3, "year")
          .toDate()
      });
      if (action !== DatePickerAndroid.dismissedAction) {
        this.setState({
          babyBirthday:
            moment()
              .year(year)
              .month(month)
              .date(day)
              .format("x") * 1
        });
      }
    } catch ({ code, message }) {
      console.warn("Cannot open date picker", message);
    }
  };

  onDateChange = (field, value) =>
    this.setState({
      babyBirthday:
        moment(this.state.babyBirthday, "x")
          .set(field, value)
          .format("x") * 1
    });

  onDone = () => {
    const { setBabyBirthday, navigation } = this.props;
    setBabyBirthday(this.state.babyBirthday);
    navigation.navigate("Schedule");
  };

  getItems = (field) => {
    if (field === "year") {
      return YEARS;
    }
    if (field === "month") {
      return MONTHS;
    }
    let days = moment(this.state.babyBirthday, "x").daysInMonth();
    days = new Array(days);
    for (let i = 0; i < days.length; i++) {
      days[i] = {
        label: (i + 1).toString(),
        value: (i + 1).toString()
      };
    }
    return days;
  };

  render() {
    const { displayName, navigation } = this.props;
    const { babyBirthday } = this.state;

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.container}>
          <View style={styles.spacer1} />
          <Text style={styles.mainLabel}>
            Hi {displayName || "Mama"}
            !
          </Text>
          <Text style={styles.subLabel1}>
            Now we{"'"}re going to ask you a couple of questions and set up your
            pump schedule.
          </Text>
          <Text style={styles.subLabel2}>
            Your baby{"'"}s birth date:
          </Text>
          <View style={styles.pickerView}>
            <View
              style={[
                StyleSheet.absoluteFillObject,
                { justifyContent: "center" }
              ]}
            >
              <View style={{ height: 36, backgroundColor: Colors.black20p }} />
            </View>
            {Platform.OS === "ios" ? (
              <DatePickerIOS
                babyBirthday={babyBirthday}
                onDateChange={this.onDateChange}
                getItems={this.getItems}
              />
            ) : (
              <DatePickerANDROID
                babyBirthday={babyBirthday}
                onPress={this.openAndroidDatePicker}
              />
            )}
          </View>
          <View style={styles.bottomOptions}>
            <RoundButton onPress={() => navigation.navigate("Schedule")}>
              Skip
            </RoundButton>
            <RoundButton white onPress={this.onDone}>
              Done
            </RoundButton>
          </View>
        </View>
      </SafeAreaView>
    );
  }
}

const DatePickerIOS = ({ babyBirthday, onDateChange, getItems }) => (
  <View style={{ flexDirection: "row" }}>
    <PickerRoll
      items={getItems("month")}
      itemStyle={styles.pickerItemStyle}
      selectedItemStyle={styles.selectedPickerStyle}
      onValueChange={(value) => onDateChange("month", value)}
      selectedValue={moment(babyBirthday, "x").month()}
    />
    <PickerRoll
      items={getItems("date")}
      itemStyle={styles.pickerItemStyle}
      selectedItemStyle={styles.selectedPickerStyle}
      onValueChange={(value) => onDateChange("date", value)}
      selectedValue={moment(babyBirthday, "x").date()}
    />
    <PickerRoll
      items={getItems("year")}
      itemStyle={styles.pickerItemStyle}
      selectedItemStyle={styles.selectedPickerStyle}
      onValueChange={(value) => onDateChange("year", value)}
      selectedValue={moment(babyBirthday, "x").year()}
    />
  </View>
);

const DatePickerANDROID = ({ babyBirthday, onPress }) => (
  <View style={{ flexDirection: "row" }}>
    <Text
      onPress={onPress}
      style={[
        styles.pickerItemStyle,
        styles.pickerItemStyleAndroid,
        styles.androidPickerInputLeft
      ]}
    >
      {moment(babyBirthday, "x").format("MMM")}
    </Text>
    <Text
      onPress={onPress}
      style={[
        styles.pickerItemStyle,
        styles.pickerItemStyleAndroid,
        styles.androidPickerInputMiddle
      ]}
    >
      {moment(babyBirthday, "x").format("DD")}
    </Text>
    <Text
      onPress={onPress}
      style={[
        styles.pickerItemStyle,
        styles.pickerItemStyleAndroid,
        styles.androidPickerInputRight
      ]}
    >
      {moment(babyBirthday, "x").format("YYYY")}
    </Text>
  </View>
);

TourBabyAgeScreen.propTypes = {
  displayName: PropTypes.string,
  babyBirthday: PropTypes.number.isRequired,
  navigation: PropTypes.object,
  setBabyBirthday: PropTypes.func.isRequired
};

DatePickerIOS.propTypes = {
  babyBirthday: PropTypes.number.isRequired,
  getItems: PropTypes.func.isRequired,
  onDateChange: PropTypes.func.isRequired
};

DatePickerANDROID.propTypes = {
  babyBirthday: PropTypes.number.isRequired,
  onPress: PropTypes.func.isRequired
};

const styles = StyleSheet.createProportional({
  container: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: Colors.windowsBlue
  },
  spacer1: {
    flex: 1
  },
  mainLabel: {
    ...Fonts.Light,
    fontSize: 50,
    lineHeight: 60,
    color: Colors.white,
    marginLeft: 48,
    marginRight: 37
  },
  subLabel1: {
    ...Fonts.SemiBold,
    fontSize: 18,
    lineHeight: 24,
    color: Colors.white,
    marginLeft: 48,
    marginRight: 37,
  },
  subLabel2: {
    ...Fonts.SemiBold,
    fontSize: 20,
    lineHeight: 30,
    color: Colors.white,
    marginLeft: 48,
    marginRight: 37,
    marginTop: 30
  },
  pickerView: {
    flex: 2,
    justifyContent: "center"
  },
  pickerItemStyle: {
    ...Fonts.SemiBold,
    fontSize: 18,
    lineHeight: 24,
    textAlign: "center",
    color: Colors.white
  },
  pickerItemStyleAndroid: {
    paddingVertical: 20
  },
  selectedPickerStyle: {
    //    backgroundColor: Colors.black20p,
    borderWidth: 1
  },
  androidPickerInputLeft: {
    paddingLeft: 68,
    width: 140,
    textAlign: "left"
  },
  androidPickerInputMiddle: {
    flex: 1
  },
  androidPickerInputRight: {
    paddingRight: 49,
    width: 120,
    textAlign: "right"
  },
  bottomOptions: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    marginHorizontal: 40
  }
});
