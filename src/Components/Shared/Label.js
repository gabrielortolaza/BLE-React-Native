import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Text } from "react-native";

import { Colors, Fonts } from "../../Themes";

export default class Label extends PureComponent {
  render() {
    const {
      white, blue, lightBlue, lightGrey3,
      tertiaryDarker, black, darkGreen, darkGreen2,
      lightGreen, grey, lightGrey2,
      greyWarm, warmGrey, tertiary, textColor,
      center, paragraph, underline,
      font38, font30, font34,
      font26, font23, font22,
      font20, font18, font16,
      font14, font12, font11,
      font10, font8, mt10, mr10,
      mb10, mb16, mt8, mb8,
      weightBold, weightSemiBold, weightLight,
      borderedActive, shadow, children,
      bordered, red, style, getTextMeasurements,
      ...props
    } = this.props;

    const labelStyles = [
      Styles.label,
      paragraph && Styles.labelParagraph,
      underline && Styles.underline,
      center && Styles.center,
      white && Styles.colorWhite,
      tertiaryDarker && Styles.colorTertiaryDarker,
      grey && Styles.colorGrey,
      greyWarm && Styles.colorGreyWarm,
      lightGrey2 && Styles.colorLightGrey2,
      lightGrey3 && Styles.colorLightGrey3,
      warmGrey && Styles.colorWarmGrey,
      blue && Styles.colorBlue,
      black && Styles.colorBlack,
      tertiary && Styles.colorTertiary,
      red && Styles.colorRed,
      lightBlue && Styles.colorLightBlue,
      lightGreen && Styles.colorLightGreen,
      darkGreen && Styles.colorDarkGreen,
      darkGreen2 && Styles.colordarkGreen2,
      textColor && Styles[textColor],
      font38 && Styles.font38,
      font34 && Styles.font34,
      font30 && Styles.font30,
      font26 && Styles.font26,
      font23 && Styles.font23,
      font22 && Styles.font22,
      font20 && Styles.font20,
      font18 && Styles.font18,
      font16 && Styles.font16,
      font14 && Styles.font14,
      font12 && Styles.font12,
      font11 && Styles.font11,
      font10 && Styles.font10,
      font8 && Styles.font8,
      mt10 && Styles.mt10,
      mr10 && Styles.mr10,
      mb10 && Styles.mb10,
      mb16 && Styles.mb16,
      mt8 && Styles.mt8,
      mb8 && Styles.mb8,
      weightLight && Styles.weightLight,
      weightBold && Styles.weightBold,
      weightSemiBold && Styles.weightSemiBold,
      (bordered || borderedActive) && Styles.bordered,
      borderedActive && Styles.borderedActive,
      shadow && Styles.shadow,
      style
    ];

    return (
      <Text
        style={labelStyles}
        onLayout={(event) => {
          if (getTextMeasurements) {
            event.target.measure(
              (fx, fy, width, height, pageX, pageY) => {
                getTextMeasurements({
                  x: fx + pageX,
                  y: fy + pageY,
                  width,
                  height
                });
              },
            );
          }
        }}
        {...props}
      >
        {children}
      </Text>
    );
  }
}

Label.propTypes = {
  white: PropTypes.bool,
  tertiaryDarker: PropTypes.bool,
  blue: PropTypes.bool,
  black: PropTypes.bool,
  tertiary: PropTypes.bool,
  red: PropTypes.bool,
  lightBlue: PropTypes.bool,
  lightGreen: PropTypes.bool,
  darkGreen: PropTypes.bool,
  darkGreen2: PropTypes.bool,
  grey: PropTypes.bool,
  greyWarm: PropTypes.bool,
  lightGrey2: PropTypes.bool,
  lightGrey3: PropTypes.bool,
  warmGrey: PropTypes.bool,
  textColor: PropTypes.string,
  center: PropTypes.bool,
  paragraph: PropTypes.bool,
  underline: PropTypes.bool,
  font38: PropTypes.bool,
  font34: PropTypes.bool,
  font30: PropTypes.bool,
  font26: PropTypes.bool,
  font22: PropTypes.bool,
  font20: PropTypes.bool,
  font18: PropTypes.bool,
  font23: PropTypes.bool,
  font16: PropTypes.bool,
  font14: PropTypes.bool,
  font12: PropTypes.bool,
  font11: PropTypes.bool,
  font10: PropTypes.bool,
  font8: PropTypes.bool,
  mt8: PropTypes.bool,
  mt10: PropTypes.bool,
  mr10: PropTypes.bool,
  mb8: PropTypes.bool,
  mb10: PropTypes.bool,
  mb16: PropTypes.bool,
  weightLight: PropTypes.bool,
  weightBold: PropTypes.bool,
  weightSemiBold: PropTypes.bool,
  bordered: PropTypes.bool,
  borderedActive: PropTypes.bool,
  shadow: PropTypes.bool,
  children: PropTypes.any,
  style: PropTypes.any,
  getTextMeasurements: PropTypes.func
};

const Styles = {
  label: {
    ...Fonts.Regular,
    textAlign: "left",
    letterSpacing: 0.75,
    color: Colors.grey
  },
  labelParagraph: { lineHeight: 23 },
  center: { textAlign: "center" },
  underline: {
    textDecorationLine: "underline"
  },
  font38: { fontSize: 38 },
  font34: { fontSize: 34 },
  font30: { fontSize: 30 },
  font26: { fontSize: 26 },
  font22: { fontSize: 22 },
  font20: { fontSize: 20 },
  font18: { fontSize: 18 },
  font23: { fontSize: 23 },
  font16: { fontSize: 16 },
  font14: { fontSize: 14 },
  font12: { fontSize: 12 },
  font11: { fontSize: 11 },
  font10: { fontSize: 10 },
  font8: { fontSize: 8 },
  colorWhite: { color: Colors.white },
  colorTertiaryDarker: { color: Colors.tertiaryDarker },
  colorGrey: { color: Colors.grey },
  colorGreyWarm: { color: Colors.greyWarm },
  colorLightGrey2: { color: Colors.lightGrey2 },
  colorLightGrey3: { color: Colors.lightGrey3 },
  colorWarmGrey: { color: Colors.warmGrey },
  colorBlue: { color: Colors.blue },
  colorBlack: { color: Colors.blackPrimary },
  colorTertiary: { color: Colors.tertiary },
  colorRed: { color: Colors.red },
  colorLightBlue: { color: Colors.lightBlue },
  colorLightGreen: { color: Colors.lightGreen },
  colorDarkGreen: { color: Colors.darkGreen },
  colordarkGreen2: { color: Colors.darkGreen2 },
  weightLight: { ...Fonts.Light },
  weightSemiBold: { ...Fonts.SemiBold },
  weightBold: { ...Fonts.Bold },
  mt8: { marginTop: 8 },
  mt10: { marginTop: 10 },
  mr10: { marginRight: 10 },
  mb8: { marginBottom: 8 },
  mb10: { marginBottom: 10 },
  mb16: { marginBottom: 16 },
  bordered: {
    borderWidth: 1,
    borderColor: Colors.black,
    borderRadius: 18,
    lineHeight: 36,
    overflow: "hidden",
    textAlign: "center"
  },
  borderedActive: {
    backgroundColor: Colors.white,
    color: Colors.blue
  },
  shadow: {
    textShadowColor: Colors.black30p,
    textShadowRadius: 1,
    textShadowOffset: {
      width: 0,
      height: 1
    }
  }
};
