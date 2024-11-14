import React from "react";
import {
  Platform,
  StyleSheet,
  Text,
  View,
  TouchableNativeFeedback,
  TouchableHighlight,
  TouchableOpacity
} from "react-native";
import PropTypes from "prop-types";

const hasRippleEffect = Platform.OS === "android" && Platform.Version >= 21;
const useForeground = hasRippleEffect && TouchableNativeFeedback.canUseNativeForeground();

const DARK_RIPPLE = "#00000040";
const LIGHT_RIPPLE = "#ffffff40";

export default class Button extends React.PureComponent {
  onPress = () => {
    const { onPress } = this.props;

    if (onPress && Platform.OS === "android") {
      setTimeout(onPress, 25);
    } else {
      onPress();
    }
  }

  getTouchable = () => {
    const { highlight } = this.props;

    if (hasRippleEffect) {
      return TouchableNativeFeedback;
    }
    if (highlight) {
      return TouchableHighlight;
    }

    return TouchableOpacity;
  }

  getRipple = () => {
    const {
      lightRipple,
      rippleColor
    } = this.props;
    if (!hasRippleEffect) return null;
    return TouchableNativeFeedback.Ripple(rippleColor || lightRipple ? LIGHT_RIPPLE : DARK_RIPPLE);
  }

  render() {
    const Touchable = this.getTouchable();
    const {
      children, contentStyle, positionStyle,
      shapeStyle, shadow, elevation,
      title, titleStyle, testID
    } = this.props;
    const outterStyles = [
      { backgroundColor: "transparent" },
      positionStyle,
      shapeStyle,
      styles.container,
      (elevation || shadow) && styles.shadow
    ];

    const contentStyles = [styles.content].concat(contentStyle);

    return (
      <View style={outterStyles} testID={testID}>
        <Touchable
          activeOpacity={0.5}
          useForeground={!!children && useForeground}
          background={this.getRipple()}
          onPress={this.onPress}
          style={[shapeStyle, styles.touchableIOS]}
        >
          <View style={contentStyles}>
            { children || <Text style={[styles.title, titleStyle]}>{title}</Text> }
          </View>
        </Touchable>
      </View>
    );
  }
}

const STYLE_PROP_TYPE = PropTypes.oneOfType(
  [
    PropTypes.object,
    PropTypes.arrayOf(PropTypes.oneOfType([PropTypes.object, PropTypes.number])),
    PropTypes.number
  ]
);

Button.propTypes = {
  children: PropTypes.oneOfType([PropTypes.element, PropTypes.arrayOf(PropTypes.element)]),

  contentStyle: STYLE_PROP_TYPE,
  positionStyle: STYLE_PROP_TYPE,
  shapeStyle: STYLE_PROP_TYPE,
  titleStyle: STYLE_PROP_TYPE,

  elevation: PropTypes.bool,
  highlight: PropTypes.bool,
  lightRipple: PropTypes.bool,
  shadow: PropTypes.bool,

  onPress: PropTypes.func.isRequired,

  rippleColor: PropTypes.string,
  testID: PropTypes.string,
  title: PropTypes.string
};

const styles = StyleSheet.create({
  container: {
    overflow: Platform.OS === "android" ? "hidden" : null
  },
  touchableIOS: {
    overflow: "hidden"
  },
  content: {
    // flex: 1,
    justifyContent: "center"
  },
  title: {
    textAlign: "center"
    //    color: 'white'
  },
  shadow: {
    elevation: 5,
    shadowColor: "rgb(0, 0, 0)",
    shadowOffset: {
      width: 0,
      height: 3
    },
    shadowRadius: 3,
    shadowOpacity: 0.2
  }
});

/*
  borderStyle: PropTypes.shape({
    borderBottomEndRadius: PropTypes.number,
    borderBottomLeftRadius: PropTypes.number,
    borderBottomRightRadius: PropTypes.number,
    borderBottomStartRadius: PropTypes.number,
    borderRadius: PropTypes.number,
    borderTopEndRadius: PropTypes.number,
    borderTopLeftRadius: PropTypes.number,
    borderTopRightRadius: PropTypes.number,
    borderTopStartRadius: PropTypes.number
  }),
  // children: PropTypes.oneOfType(PropTypes.element, PropTypes.arrayOf(PropTypes.element)),
  /*  contentStyle: PropTypes.shape({
    alignItems: PropTypes.string,
    justifyContent: PropTypes.string,
    padding: PropTypes.number,
    paddingBottom: PropTypes.number,
    paddingEnd: PropTypes.number,
    paddingHorizontal: PropTypes.number,
    paddingLeft: PropTypes.number,
    paddingRight: PropTypes.number,
    paddingStart: PropTypes.number,
    paddingTop: PropTypes.number,
    paddingVertical: PropTypes.number
  }),
  transparent: PropTypes.bool,
  onPress: PropTypes.func.isRequired,
  /*  positionStyle: PropTypes.shape({
    alignSelf: PropTypes.string,
    bottom: PropTypes.number,
    flex: PropTypes.number,
    flexGrow: PropTypes.number,
    flexShrink: PropTypes.number,
    height: PropTypes.number,
    left: PropTypes.number,
    margin: PropTypes.number,
    marginBottom: PropTypes.number,
    marginEnd: PropTypes.number,
    marginHorizontal: PropTypes.number,
    marginLeft: PropTypes.number,
    marginRight: PropTypes.number,
    marginStart: PropTypes.number,
    marginTop: PropTypes.number,
    marginVertical: PropTypes.number,
    maxHeight: PropTypes.number,
    maxWidth: PropTypes.number,
    minHeight: PropTypes.number,
    minWidth: PropTypes.number,
    position: PropTypes.string,
    right: PropTypes.number,
    top: PropTypes.number,
    width: PropTypes.number,
    zIndex: PropTypes.number
  }),
  shapeStyle: PropTypes.shape({
    aspectRatio: PropTypes.number,
    backfaceVisibility: PropTypes.number,
    backgroundColor: PropTypes.any,
    borderBottomColor: PropTypes.string,
    borderBottomWidth: PropTypes.number,
    borderColor: PropTypes.string,
    borderEndColor: PropTypes.string,
    borderEndWidth: PropTypes.number,
    borderLeftColor: PropTypes.string,
    borderLeftWidth: PropTypes.number,
    borderRightColor: PropTypes.string,
    borderRightWidth: PropTypes.number,
    borderStartColor: PropTypes.string,
    borderStartWidth: PropTypes.number,
    borderStyle: PropTypes.any,
    borderTopColor: PropTypes.string,
    borderTopWidth: PropTypes.number,
    borderWidth: PropTypes.number,
    display: PropTypes.string,
    opacity: PropTypes.number
  }),
  title: PropTypes.string,
  titleStyle: PropTypes.oneOfType([PropTypes.string, PropTypes.number])
}
*/
