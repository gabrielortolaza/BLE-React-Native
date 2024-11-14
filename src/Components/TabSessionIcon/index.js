import React, { PureComponent } from "react";
import {
  View, StyleSheet, TouchableOpacity
} from "react-native";
import { connect } from "react-redux";
// import ReactTimeout from "react-timeout";
import PropTypes from "prop-types";

import { Colors } from "../../Themes";
// import TimeTicker from "../Shared/TimeTicker";
import { navigate, onChangePlayMode } from "../../App/RootNavigation";
import SelectionModal from "../Shared/SelectionModal";
import { playModeDataArr } from "../../Services/SharedFunctions";
import { CONNECT_STATUS } from "../../Config/constants";
import { setPrevPlayOptionSelected, pumpNowSessionDisplay } from "../../Actions";
import Icon from "../Shared/Icon";

// const TimeTickerWithTimeout = ReactTimeout(TimeTicker);

class TabSessionIcon extends PureComponent {
  // goBackToPage = () => {
  //   const {
  //     sessionPause, status, duration,
  //     resumedAt, showTimerButton
  //   } = this.props;

  //   if (status === SESSION_RUNNING) {
  //     sessionPause(status, duration, resumedAt);
  //     navigate("SessionModal", { actionType: "record" });
  //     showTimerButton(null);
  //   }
  // }

  render() {
    const {
      setPrevPlayOptionSelected, displayPumpNowSelection,
      pumpNowSessionDisplay, connectStatus
    } = this.props;

    return (
      <View style={Styles.outerContainer}>
        { displayPumpNowSelection ? (
          <SelectionModal
            isVisible
            title="Pump using:"
            onPressConfirm={(selection) => {
              // Store selection for use after the connect success in case of no connection
              setPrevPlayOptionSelected(selection);
              pumpNowSessionDisplay(false);
              onChangePlayMode(selection);
            }}
            dataArr={playModeDataArr}
          />
        ) : (
          <TouchableOpacity
            style={Styles.container}
            onPress={() => {
              if (connectStatus === CONNECT_STATUS.CONNECTED) {
                pumpNowSessionDisplay(true);
              } else {
                navigate("GeniePairing", { openPumpNowSession: true });
              }
            }}
          >
            <View style={Styles.playContainer}>
              <Icon
                type="MaterialCommunityIcons"
                name="play"
                style={{
                  color: Colors.white,
                  fontSize: 50,
                  marginTop: 4
                }}
              />
            </View>
          </TouchableOpacity>
        )}
        {/* {showButton && (
        <TouchableOpacity
          onPress={() => this.goBackToPage()}
        >
          <Image
            source={Images.btnTimerRunning}
            style={{
              width: 60,
              height: 85
            }}
          />
          <View style={Styles.timerRunning}>
            <TimeTickerWithTimeout
              resumedAt={resumedAt}
              status={status}
              duration={duration}
              textStyle={{ fontSize: 10, color: "white" }}
            />
          </View>
        </TouchableOpacity>
        )} */}
      </View>
    );
  }
}

const Styles = StyleSheet.create({
  outerContainer: {
    marginBottom: 15
  },
  container: {
    width: 90,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  playContainer: {
    backgroundColor: Colors.blue,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: "center",
  },
  timerRunning: {
    position: "absolute",
    alignSelf: "center"
  },
});

TabSessionIcon.propTypes = {
  // duration: PropTypes.number,
  // status: PropTypes.number,
  displayPumpNowSelection: PropTypes.bool,
  pumpNowSessionDisplay: PropTypes.func,
  // resumedAt: PropTypes.number,
  // showTimerButton: PropTypes.func,
  setPrevPlayOptionSelected: PropTypes.func,
  // sessionPause: PropTypes.func.isRequired,
  connectStatus: PropTypes.number
};

const mapDispatchToProps = {
  // showTimerButton,
  setPrevPlayOptionSelected,
  // sessionPause: pause,
  pumpNowSessionDisplay
};

const mapStateToProps = (
  {
    pump, status: statusStore
  }
) => {
  // const {
  //   duration, status, resumedAt
  // } = session;
  const { connectStatus } = pump;

  return {
    // duration,
    // status,
    displayPumpNowSelection: statusStore.displayPumpNowSelection,
    // resumedAt,
    connectStatus
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TabSessionIcon);
