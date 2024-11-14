import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import {
  Animated, Keyboard
} from "react-native";
import { connect } from "react-redux";
import { ifIphoneX } from "react-native-iphone-screen-helper";

import { clearMessage } from "../../Actions/Status";
import StyleSheet from "../../Proportional";
import { Colors, Fonts } from "../../Themes";
import Label from "./Label";

const RESET_STATUS = {
  messageText: "",
  messageType: "",
  messageId: 0,
  animating: false
};

class ToastMessage extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      ...RESET_STATUS,
      fadeAnim: new Animated.Value(-100)
    };
  }

  // eslint-disable-next-line camelcase
  UNSAFE_componentWillReceiveProps = (nextProps) => {
    const { clearMessage, current, queue } = nextProps;
    const { messageText, messageId } = current;
    const { fadeAnim, animating } = this.state;

    // eslint-disable-next-line react/destructuring-assignment
    if (this.state.messageId !== messageId && messageText && !animating) {
      Keyboard.dismiss();
      this.setState({ animating: true }, () => {
        Animated.sequence([
          Animated.timing(fadeAnim, { toValue: 0, duration: 300, useNativeDriver: false }),
          Animated.timing(fadeAnim, {
            toValue: -100, duration: 600, delay: 2500, useNativeDriver: false
          })
        ]).start(() => {
          this.setState({ animating: false });
          clearMessage(queue, current);
        });
      });
    }
  }

  render() {
    const { current } = this.props;
    const { messageText, messageType } = current;
    const { fadeAnim } = this.state;

    const containerStyles = [
      styles.container,
      { bottom: fadeAnim },
      messageType === "error" && styles.errorContainer,
      messageType === "warning" && styles.warningContainer
    ];
    const textStyles = [
      styles.text,
      messageType === "warning" && styles.warningText
    ];

    return (
      <Animated.View testID="ToastMessage" style={containerStyles}>
        <Label testID="ToastMessage_Text" style={textStyles}>{ messageText }</Label>
      </Animated.View>
    );
  }
}

ToastMessage.propTypes = {
  current: PropTypes.object,
  // messageId: PropTypes.number,
  messageText: PropTypes.string,
  messageType: PropTypes.string,
  // clearMessage: PropTypes.func
};

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: -100,
    ...ifIphoneX({
      height: 94
    }, {
      height: 69
    }),
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 50,
    backgroundColor: Colors.blue,
    zIndex: 100
  },
  errorContainer: {
    backgroundColor: Colors.blue
  },
  warningContainer: {
    backgroundColor: Colors.blue
  },
  text: {
    color: Colors.white,
    fontSize: 14,
    ...Fonts.SemiBold,
    textAlign: "center"
  },
  warningText: {
    ...Fonts.SemiBold,
    color: Colors.white
  }
});

const mapStateToProps = ({ status }) => {
  return status;
};

const mapDispatchToProps = {
  clearMessage
};

export default connect(mapStateToProps, mapDispatchToProps)(ToastMessage);
