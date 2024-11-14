import React, { Component } from "react";
import { Platform } from "react-native";
import PropTypes from "prop-types";

import Button from "./Button";
import StyleSheet from "../../Proportional";

import { Fonts, Colors } from "../../Themes/index";

export default class RoundButton extends Component {
  getTextStyles = () => {
    const merging = [styles.textBase];
    const {
      wide,
      small,
      large,

      blueText,
      white,
      warmGreyText,

      textStyle
    } = this.props;

    if (wide) {
      merging.push(styles.textWide);
    } else if (small) {
      merging.push(styles.textSmall);
    } else if (large) {
      merging.push(styles.textLarge);
    }

    if (merging.length === 1) merging.push(styles.textDefault);

    if (blueText || white) merging.push(styles.textBlue);

    if (warmGreyText) merging.push(styles.textWarmGrey);

    if (textStyle) merging.push(textStyle);

    return merging;
  };

  getShapeStyle = () => {
    const {
      fullWidth, small, white,
      facebook, wide, transparent,
      whiteBorder, lightBlueBorder
    } = this.props;
    const s = [styles.shapeBase];

    if (small) s.push(styles.shapeSmall);
    if (facebook || wide) s.push(styles.shapeWide);

    if (fullWidth) s.push(styles.shapeFullWidth);
    if (white) s.push(styles.shapeWhite);

    if (white) s.push(styles.shapeWhite);
    if (facebook) s.push(styles.shapeFacebook);

    if (transparent) s.push(styles.transparent);
    if (whiteBorder) s.push(styles.whiteBorder);
    if (lightBlueBorder) s.push(styles.lightBlueBorder);

    return s;
  };

  getContentStyle = () => {
    const {
      minimal, small, facebook,
      wide, noPadding
    } = this.props;
    const s = [styles.contentBase];

    if (small) s.push(styles.contentSmall);
    if (facebook || wide) s.push(styles.contentWide);

    if (minimal) s.push(styles.contentMinimal);
    //    if (white) s.push(styles.contentWhite)
    //    if (facebook) s.push(styles.contentFacebook)

    if (noPadding) s.push(styles.contentNoPadding);

    return s;
  };

  getTitleStyle = () => {
    const {
      small, white, facebook,
      wide, warmGreyText, lightBlue
    } = this.props;

    const s = [styles.textBase];

    if (small) s.push(styles.textSmall);
    if (facebook || wide) s.push(styles.textWide);

    if (white) s.push(styles.textBlue); // blueText ||

    if (warmGreyText) s.push(styles.textWarmGrey);

    if (lightBlue) s.push(styles.lightBlue);

    return s;
  };

  render() {
    const {
      children,
      override,
      onPress,
      shadow,
      testID,
      positionStyle
    } = this.props;

    const shapeStyle = this.getShapeStyle();
    const contentStyle = this.getContentStyle();
    const titleStyle = this.getTitleStyle();

    return (
      <Button
        positionStyle={positionStyle}
        shapeStyle={shapeStyle}
        contentStyle={contentStyle}
        onPress={onPress}
        testID={testID}
        shadow={shadow}
        title={override ? null : children}
        titleStyle={titleStyle}
      >
        {override && children}
      </Button>
    );
  }
}

const buildTextStyle = (height, fontSize = 16) => {
  return {
    height,
    lineHeight: height,
    fontSize
  };
};

const buildButtonStyle = (minWidth, height) => {
  return {
    minWidth,
    borderRadius: height / 2,
    height
  };
};

const build = (minWidth, height) => {
  return {
    shape: {
      borderRadius: height / 2
    },
    content: {
      paddingHorizontal: height / 2,
      minWidth,
      height
    }
  };
};

const styles = StyleSheet.createProportional({
  shapeBase: {
    alignSelf: "center",
    backgroundColor: Colors.blue,
    ...build(106, 44).shape
  },
  //  shapeLarge: buildButtonStyle(102, 48),
  shapeWide: build(240, 46).shape,
  shapeSmall: build(80, 34).shape,
  shapeFullWidth: { alignSelf: null },

  shapeMinimal: {
    // alignSelf: 'center'
  },

  shapeWhite: {
    backgroundColor: Colors.white
  },
  shapeFacebook: {
    backgroundColor: Colors.facebookBlue
  },
  contentNoPadding: {
    paddingHorizontal: 0
  },
  // *************** /

  contentBase: {
    height: 42,
    flex: 0,
    ...build(106, 44).content
  },
  //  contentLarge: buildButtonStyle(102, 48),
  contentWide: build(240, 46).content,
  contentSmall: build(80, 34).content,
  /* buttonFullWidth: {
    alignSelf: null
  }, */

  contentMinimal: {
    alignSelf: "center",
    minWidth: 0
  },

  // ************** /

  textBase: {
    ...Fonts.SemiBold,
    textAlign: "center",
    textAlignVertical: "center",
    color: Colors.white,
    ...buildTextStyle(44, 18),
    marginBottom: Platform.OS === "android" ? 2 : 0
  },
  //  textLarge: buildTextStyle(48),
  textWide: buildTextStyle(46, 16),
  textSmall: {
    ...buildTextStyle(34, 14),
    marginBottom: Platform.OS === "android" ? 4 : 0
  },

  textWarmGrey: { color: Colors.warmGrey },
  textBlue: { color: Colors.blue },
  // ************** /

  noBorderRadius: {
    borderRadius: 0
  },

  touchableBase: {
    //    ...StyleSheet.absoluteFillObject,
    overflow: "visible",
    borderRadius: 10,
    paddingHorizontal: 22
  },
  touchableLarge: {
    paddingHorizontal: 24
  },
  touchableWide: {
    paddingHorizontal: 23
  },
  touchableSmall: {
    paddingHorizontal: 17
  },

  buttonBase: {
    alignSelf: "center",
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
    borderWidth: 2,
    backgroundColor: Colors.blue,
    borderColor: Colors.blue
  },
  buttonLarge: buildButtonStyle(102, 48),
  buttonWide: buildButtonStyle(240, 46),
  buttonDefault: buildButtonStyle(106, 44),
  buttonSmall: buildButtonStyle(80, 34),
  buttonFullWidth: {
    alignSelf: null
  },

  shadow: {
    elevation: 5,
    shadowColor: "rgba(0, 0, 0, 1)",
    shadowOffset: {
      width: 0,
      height: 5
    },
    shadowOpacity: 0.2
  },
  minimal: {
    minWidth: 0
  },
  noPadding: {
    paddingLeft: 0,
    paddingRight: 0,
    paddingHorizontal: 0,
    backgroundColor: "red"
  },
  buttonWhite: {
    backgroundColor: Colors.white,
    borderColor: Colors.white
  },
  greyishBrown: {
    backgroundColor: Colors.greyishBrown,
    borderColor: Colors.greyishBrown
  },
  lightBlue: {
    color: Colors.lightBlue
  },
  lightBlueBorder: {
    borderWidth: 1,
    borderColor: Colors.lightBlue
  },
  peach: {
    backgroundColor: Colors.peach,
    borderColor: Colors.peach
  },
  facebook: {
    backgroundColor: Colors.facebookBlue,
    borderColor: Colors.facebookBlue
  },
  transparent: {
    backgroundColor: "transparent"
  },
  whiteBorder: {
    borderWidth: 1,
    borderColor: "white"
  }
});

RoundButton.propTypes = {
  large: PropTypes.bool,
  wide: PropTypes.bool,
  small: PropTypes.bool,
  white: PropTypes.bool,
  facebook: PropTypes.bool,
  minimal: PropTypes.bool,
  lightBlue: PropTypes.bool,
  lightBlueBorder: PropTypes.bool,
  transparent: PropTypes.bool,
  whiteBorder: PropTypes.bool,
  fullWidth: PropTypes.bool,
  noPadding: PropTypes.bool,

  blueText: PropTypes.bool,
  warmGreyText: PropTypes.bool,

  shadow: PropTypes.bool,
  override: PropTypes.bool,

  textStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  positionStyle: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),

  children: PropTypes.oneOfType([PropTypes.element, PropTypes.string])
    .isRequired,
  onPress: PropTypes.func.isRequired,

  testID: PropTypes.string
};
