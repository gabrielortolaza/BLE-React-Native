/** Page appears to no longer be used */
/* eslint-disable */
import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import { Animated, Modal, View, TouchableOpacity, Dimensions } from "react-native";
import Firebase from "@react-native-firebase/app";

import StyleSheet from "../../Proportional";
import ActionButton from "../Shared/ActionButton";
import Colors from "../../Themes/Colors";

import MilkStash from "../../Assets/Images/Icons/milkbag.png";
import Manual from "../../Assets/Images/Icons/manual.png";
import Record from "../../Assets/Images/Icons/record.png";
import Close from "../../Assets/Images/Icons/close.png";

export default class ActionMenu extends PureComponent {
  state = {
    showing: false,
    showAnimation: false,
    hideAnimation: false,
    overlayAnimation: new Animated.Value(0),
    buttonsAnimation: new Animated.Value(0)
  };

  showButtons = () => {
    this.setState({ showAnimation: true }, () => {
      Animated.timing(this.state.overlayAnimation, {
        toValue: 1,
        duration: 100,
        useNativeDriver: false
      }).start(() => this.setState({ showing: true, showAnimation: false }));
      Animated.timing(this.state.buttonsAnimation, {
        toValue: 1,
        delay: 50,
        duration: 200,
        useNativeDriver: false
      }).start();
      Firebase.analytics().logEvent(`action_menu_open`);
    });
  };

  hideButtons = () => {
    this.setState({ hideAnimation: true }, () => {
      Animated.timing(this.state.overlayAnimation, {
        toValue: 0,
        delay: 150,
        duration: 100,
        useNativeDriver: false
      }).start(() => this.setState({ showing: false, hideAnimation: false }));
      Animated.timing(this.state.buttonsAnimation, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false
      }).start();
      Firebase.analytics().logEvent(`action_menu_close`);
    });
  };

  toggleOverlay = () => {
    const { showing, showAnimation, hideAnimation } = this.state;
    if (showAnimation || hideAnimation) {
      return;
    }
    showing ? this.hideButtons() : this.showButtons();
  };

  go = actionType => {
    this.hideButtons();
    setTimeout(() => {
      if (actionType === "stash") {
        this.props.navGo("Stash");
      } else {
        this.props.navGo("Session", { actionType }); // actionType is manual or record
      }
    }, 70);
  };

  animatedStyle = outputMax => ({
    opacity: this.state.buttonsAnimation,
    transform: [
      {
        translateY: this.state.buttonsAnimation.interpolate({
          inputRange: [0, 1],
          outputRange: [0, outputMax * -1]
        })
      }
    ]
  });

  render() {
    const { showing, showAnimation, hideAnimation } = this.state;
    const visible = showing || showAnimation || hideAnimation;
    return (
      <Modal
        transparent
        animationType="none"
        onShow={this.showButtons}
        visible={visible}
        onRequestClose={this.hideButtons}
      >
        <TouchableOpacity
          style={styles.overlayWrapper}
          activeOpacity={1}
          onPress={this.hideButtons}
        >
          <Animated.View
            style={[styles.overlay, { opacity: this.state.buttonsAnimation }]}
          />
        </TouchableOpacity>

        <View pointerEvents="box-none" style={styles.container}>
          <ActionButton
            positionStyle={[styles.positionStyle, this.animatedStyle(240)]}
            source={MilkStash}
            onPress={() => this.go("stash")}
            label="Milk Stash"
          />
          <ActionButton
            positionStyle={[styles.positionStyle, this.animatedStyle(160)]}
            source={Manual}
            onPress={() => this.go("manual")}
            label="Manual"
          />
          <ActionButton
            positionStyle={[styles.positionStyle, this.animatedStyle(80)]}
            buttonStyle={styles.aquamarineButton}
            source={Record}
            onPress={() => this.go("record")}
            label="Record"
          />
          <ActionButton
            positionStyle={[
              styles.positionStyle,
              { opacity: this.state.buttonsAnimation },
              styles.closeButton
            ]}
            source={Close}
            small
            onPress={this.toggleOverlay}
          />
        </View>
      </Modal>
    );
  }
}

/*
           */

const styles = StyleSheet.createProportional({
  container: {
    zIndex: 30,
    flex: 1,
    backgroundColor: "transparent"
  },
  overlayWrapper: {
    ...StyleSheet.absoluteFillObject
  },
  overlay: {
    flex: 1,
    backgroundColor: Colors.windowsBlue95P
  },
  positionStyle: {
    position: "absolute",
    right: (parseInt(Dimensions.get('window').width / 2)) - 30,
    bottom: 22,
    zIndex: 31
  },
  closeButton: {
    right: (parseInt(Dimensions.get('window').width / 2)) - 25,
    bottom: 27,
    zIndex: 32
  },
  mainButton: {
    backgroundColor: Colors.windowsBlue
  },
  mainOpen: {
    backgroundColor: "#646464"
  }
});

ActionMenu.propTypes = {
  navGo: PropTypes.func.isRequired
};
