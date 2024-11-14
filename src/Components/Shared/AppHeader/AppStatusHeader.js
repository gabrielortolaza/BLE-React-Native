/** Page appears to no longer be used */
import React from "react";
import PropTypes from "prop-types";
import { View } from "react-native";
import { connect } from "react-redux";

import AppHeaderButton from "./AppHeaderButton";
import AppHeaderBattery from "./AppHeaderBattery";
import * as C from "../../../Config/constants";
import { turnOff, toggleLight } from "../../../Actions";
import { Colors } from "../../../Themes";

class AppStatusHeader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      internalConnectStatus: true,
    };
  }

  onPressPower = () => {
    const { pump } = this.props;
    const { connectStatus } = pump;
    if (connectStatus === C.CONNECT_STATUS.CONNECTED) {
      this.setState({ internalConnectStatus: false });
      turnOff();
    }
  }

  render() {
    const { internalConnectStatus } = this.state;
    const { pump, toggleLight } = this.props;
    const {
      connectStatus,
      bleState,
      light,
      battery,
    } = pump;

    let connected;
    if (internalConnectStatus) {
      connected = (connectStatus === C.CONNECT_STATUS.CONNECTED);
    } else {
      connected = false;
    }
    const bleOn = bleState === C.ON;
    const lightOn = light !== C.LIGHT_OFF;
    const lightText = light === C.LIGHT_OFF
      ? "Off"
      : light === C.LIGHT_LOW ? "Low" : "High";

    return (
      <View style={Styles.row}>
        <AppHeaderButton
          icon="bluetooth"
          transparent
          title={bleOn ? "On" : "Off"}
          small
          enabled={bleOn}
        />
        <AppHeaderBattery transparent statusBattery={battery} />
        <AppHeaderButton
          icon="power"
          transparent
          title={connected ? "On" : "Off"}
          small
          enabled={connected}
          onPress={this.onPressPower}
        />
        <AppHeaderButton
          type="Entypo"
          icon="light-down"
          transparent
          title={lightText}
          small
          enabled={lightOn}
          onPress={toggleLight}
        />
      </View>
    );
  }
}

AppStatusHeader.propTypes = {
  pump: PropTypes.object,
  toggleLight: PropTypes.func,
};

const Styles = {
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.grey242,
    // elevation: 5,
    // shadowColor: "rgba(0, 0, 0, 0.5)",
    // shadowOffset: {
    //   width: 0,
    //   height: 5
    // },
    // shadowOpacity: 0.3,
  },
};

const mapStateToProps = ({ pump }) => ({ pump });

const mapDispatchToProps = {
  toggleLight,
};

export default connect(mapStateToProps, mapDispatchToProps)(AppStatusHeader);
