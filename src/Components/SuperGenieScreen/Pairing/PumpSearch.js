import React, { Component } from "react";
import {
  Animated, Easing, Image, StyleSheet, View
} from "react-native";
import { isIphoneX } from "react-native-iphone-screen-helper";
import { connect } from "react-redux";
import PropTypes from "prop-types";

import { Colors, Images } from "../../../Themes";
import { Label, ButtonRound } from "../../Shared";
import Container from "../../Shared/Container";
import {
  addMessage, pumpStart, connectPump,
} from "../../../Actions";
import { isEmpty } from "../../../Services/SharedFunctions";

class PumpSearch extends Component {
  constructor(props) {
    super(props);
    this.state = {
      scanning: false,
    };
    this.barPosition = new Animated.Value(0);
  }

  componentDidMount() {
    this.searchPump();
  }

  componentDidUpdate(prevProps) {
    const { pump } = this.props;
    if (prevProps.pump.connectedId !== pump.connectedId
      || JSON.stringify(prevProps.pump.peripherals) !== JSON.stringify(pump.peripherals)) {
      // this.updateDeviceList();
    }

    if (prevProps.pump.scanning && !pump.scanning) {
      if (isEmpty(pump.peripherals)) {
        // addMessage(M.NO_PUMP);
      } else {
        // addMessage("Found pump");
      }
      this.setState({ scanning: false });
      this.barPosition.stopAnimation();
    }

    if (!prevProps.pump.scanning && pump.scanning) {
      this.setState({ scanning: true });
    }
  }

  searchPump = () => {
    const { pumpStart } = this.props;
    this.moveYellowBarUp();
    pumpStart();
  };

  moveYellowBarUp = () => {
    this.barPosition.setValue(0);
    Animated.timing(
      this.barPosition,
      {
        toValue: 1,
        duration: 700,
        useNativeDriver: false,
        easing: Easing.linear
      }
    ).start((o) => {
      if (o.finished) {
        this.moveYellowBarDown();
      }
    });
  };

  moveYellowBarDown = () => {
    this.barPosition.setValue(1);
    Animated.timing(
      this.barPosition,
      {
        toValue: 0,
        duration: 700,
        useNativeDriver: false,
        easing: Easing.linear
      }
    ).start((o) => {
      if (o.finished) {
        this.moveYellowBarUp();
      }
    });
  };

  render() {
    const { navigation } = this.props;
    const { scanning } = this.state;
    const movingMargin = this.barPosition.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 120]
    });
    return (
      <Container noScroll style={Styles.container}>
        <View style={Styles.innerContainer}>
          <Label white font30 center weightSemiBold>
            Searching pump...
          </Label>
          <View style={Styles.animationContainer}>
            <Image source={Images.particles} />
            <View style={Styles.greyBar}>
              <Animated.View
                style={{
                  backgroundColor: Colors.yellow,
                  width: 2,
                  height: 120,
                  marginTop: movingMargin,
                  bottom: 0
                }}
              />
            </View>
            <Image source={Images.appIcon} />
          </View>
          <View style={Styles.buttonContainer}>
            <ButtonRound style={{ width: "45%" }} bordered light disabled={scanning} onPress={navigation.goBack}>
              <Label white>Cancel</Label>
            </ButtonRound>
            <ButtonRound style={{ width: "45%" }} blue disabled={scanning} onPress={this.searchPump}>
              <Label white>Retry</Label>
            </ButtonRound>
          </View>
        </View>
      </Container>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: isIphoneX() ? 55 : 30,
    paddingBottom: 25,
    paddingHorizontal: 25,
    backgroundColor: Colors.tertiary,
  },
  innerContainer: {
    flex: 1,
    justifyContent: "space-between",
    alignItems: "center",
  },
  animationContainer: {
    flex: 1,
    justifyContent: "space-around",
    alignItems: "center",
    marginTop: 30
  },
  greyBar: {
    backgroundColor: Colors.white30p,
    width: 2,
    height: 240,
    position: "absolute",
    top: 5,
    bottom: 2
  },
  buttonContainer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
    marginBottom: 40
  },
});

PumpSearch.propTypes = {
  pump: PropTypes.object,
  navigation: PropTypes.object,
  pumpStart: PropTypes.func,
};

const mapStateToProps = ({ pump }) => ({
  pump,
});

const mapDispatchToProps = {
  addMessage,
  pumpStart,
  connectPump,
};

export default connect(mapStateToProps, mapDispatchToProps)(PumpSearch);
