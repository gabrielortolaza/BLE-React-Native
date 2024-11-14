import React from "react";
import PropTypes from "prop-types";
import { View } from "react-native";

import { Fonts, Colors, Styles as S } from "../../Themes";
import Label from "./Label";
import StyleSheet from "../../Proportional";

class Welcome extends React.PureComponent {
  render() {
    const {
      title, subtitle, subtitleIcon, flex, alt,
      testID, noMargin, titleStyle, subtitleStyle,
      containerStyle
    } = this.props;

    return (
      <View
        testID={`${testID}`}
        style={[
          styles.container,
          containerStyle,
          flex && styles.flexContainer,
          noMargin && styles.noMargin
        ]}
      >
        <Label
          style={[styles.title, alt && S.textBlue, titleStyle]}
          testID={`${testID}_Title`}
        >
          {title}
        </Label>
        {!!subtitle && (
          <View style={styles.subtitleView}>
            <Label
              style={[styles.subtitleText, alt && S.textBlue, subtitleStyle]}
              testID={`${testID}_Subtitle`}
            >
              {subtitle}
            </Label>
            {subtitleIcon || null}
          </View>
        )}
      </View>
    );
  }
}

export default Welcome;

const styles = StyleSheet.createProportional({
  container: {
    minHeight: 252,
    paddingHorizontal: 48,
    justifyContent: "center"
  },
  flexContainer: {
    flex: 1,
    minHeight: 0
  },
  title: {
    fontSize: 32,
    ...Fonts.Regular,
    color: Colors.greyishBrown,
    marginTop: 19
  },
  subtitleView: {
    minHeight: 30,
    flexDirection: "row",
    justifyContent: "flex-start",
    alignItems: "center",
    flexWrap: "wrap"
  },
  subtitleText: {
    fontSize: 20,
    lineHeight: 30,
    color: Colors.greyishBrown,
    paddingLeft: 3,
    justifyContent: "center"
  },
  noMargin: {
    paddingHorizontal: 0
  }
});

Welcome.propTypes = {
  alt: PropTypes.bool,
  flex: PropTypes.bool,
  subtitle: PropTypes.string,
  titleStyle: PropTypes.object,
  subtitleStyle: PropTypes.object,
  subtitleIcon: PropTypes.element,
  testID: PropTypes.string,
  title: PropTypes.string,
  noMargin: PropTypes.bool,
  containerStyle: PropTypes.object
};
