import React from "react";
import PropTypes from "prop-types";
import { connect } from "react-redux";

import BluetoothOff from "./BluetoothOff";
import Searching from "./Searching";
import Connecting from "./Connecting";
import Connected from "./Connected";
import { CONNECT_STATUS, OFF } from "../../../Config/constants";
import * as M from "../../../Config/messages";
import { isEmpty, checkNavigateForPlayOption } from "../../../Services/SharedFunctions";
import {
  addMessage, pumpStart, connectPump,
  sendConnectRequest, rememberDevice, updatePumpStatus,
  setPrevPlayOptionSelected, pumpNowSessionDisplay, playWantedToProgram
} from "../../../Actions";

class Pairing extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      timer: 0,
      pumpName: ""
    };
  }

  componentDidMount() {
    const { pump, pumpStart } = this.props;
    const { triggerSearch } = pump;
    // to prevent to reconnect immediately after disconnect from settings menu
    if (triggerSearch) {
      pumpStart();
    }
  }

  componentDidUpdate(prevProps) {
    const {
      pump, status, navigation,
      addMessage, pumpStart, route,
      pumpNowSessionDisplay, playWantedToProgram
    } = this.props;
    const {
      id, connectedId, programs,
      connectStatus
    } = pump;
    const { tabChangeParams, prevPlayOptionSelected } = status;

    // console.log("paring...didupdate...", connectStatus); // Don't remove console
    if (
      id
      && id === connectedId
      && connectStatus === CONNECT_STATUS.CONNECTED
      && prevProps.pump.connectStatus !== CONNECT_STATUS.CONNECTED
    ) {
      if (isEmpty(programs)) {
        addMessage(M.LAUNCH_APP_AGAIN);
      } else {
        console.log("normal home");
        const goBack = route.params && (
          route.params.from === "program"
          || route.params.from === "programDisconnect"
        );
        checkNavigateForPlayOption(
          prevPlayOptionSelected,
          setPrevPlayOptionSelected,
          navigation,
          goBack
        );

        if (route.params && route.params.openPumpNowSession) {
          setTimeout(() => {
            pumpNowSessionDisplay(true);
          }, 500);
        }

        if (
          route.params
            && (
              route.params.from === "programList"
              || route.params.from === "program"
            )
        ) {
          setTimeout(() => {
            playWantedToProgram(route.params.from);
          }, 500);
        }
      }
    }

    if (prevProps.pump.connectStatus === CONNECT_STATUS.DISCONNECTED
      && connectStatus === CONNECT_STATUS.CONNECTING) {
      this.startTimer();
    }

    if (prevProps.pump.connectStatus === CONNECT_STATUS.CONNECTING
      && (connectStatus === CONNECT_STATUS.CONNECTED
        || connectStatus === CONNECT_STATUS.DISCONNECTED)) {
      this.stopTimer();
    }

    if (prevProps.status.tabChangeParams.tabToggling !== tabChangeParams.tabToggling) {
      // if it is focused from Settings screen, then trigger search
      pumpStart();
    }
  }

  changeTimer = () => {
    const { updatePumpStatus } = this.props;
    const { timer } = this.state;

    // COMBAK: Counting should done in the scanning and connection/disconnection listeners
    // i.e. give scanning specific time etc
    if (timer > 10) {
      updatePumpStatus({ connectStatus: CONNECT_STATUS.DISCONNECTED, peripherals: {} });
      this.stopTimer();
    } else {
      this.setState({ timer: timer + 1 });
    }
  }

  stopTimer = () => {
    this.setState({ timer: 0 });
    clearInterval(this.intervalID);
  }

  startTimer = () => {
    this.intervalID = setInterval(this.changeTimer, 1000);
  }

  render() {
    const { pump } = this.props;
    const { pumpName } = this.state;
    // console.log(pump.connectResponse, "pairing render...", pump.name); // don't remove console
    if (pump.bleState === OFF) {
      return <BluetoothOff />;
    }
    if (pump.connectStatus === CONNECT_STATUS.CONNECTING) {
      return <Connecting pumpName={pumpName} />;
    }
    if (pump.connectStatus === CONNECT_STATUS.CONNECTED) {
      return <Connected sendConnectRequest={sendConnectRequest} {...this.props} />;
    }
    return <Searching updatePumpName={(pumpName) => this.setState({ pumpName })} {...this.props} />;
  }
}

Pairing.propTypes = {
  navigation: PropTypes.object,
  pump: PropTypes.object,
  route: PropTypes.object,
  status: PropTypes.object,
  addMessage: PropTypes.func,
  pumpStart: PropTypes.func,
  updatePumpStatus: PropTypes.func,
  pumpNowSessionDisplay: PropTypes.func,
  playWantedToProgram: PropTypes.func
};

const mapStateToProps = ({ pump, status }) => ({
  pump, status,
});

const mapDispatchToProps = {
  addMessage,
  pumpStart,
  connectPump,
  rememberDevice,
  updatePumpStatus,
  pumpNowSessionDisplay,
  playWantedToProgram
};

export default connect(mapStateToProps, mapDispatchToProps)(Pairing);
