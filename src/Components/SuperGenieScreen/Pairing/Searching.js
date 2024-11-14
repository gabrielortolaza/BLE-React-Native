import React, {
  useCallback, useEffect, useRef, useState
} from "react";
import {
  Image, StyleSheet, TouchableOpacity, View
} from "react-native";
import PropTypes from "prop-types";

import {
  Colors, Images, Styles as GStyles
} from "../../../Themes";
import { Label, ButtonRound } from "../../Shared";
import PumpDevices from "./PumpDevices";
import { isEmpty } from "../../../Services/SharedFunctions";
import InstructionModal from "./InstructionModal";
import BackArea from "./Components/BackArea";
import Icon from "../../Shared/Icon";
import Container from "../../Shared/Container";
import CircleAnimation from "./Components/CircleAnimation";
import PendulumAnimation from "./Components/PendulumAnimation";

export default function Searching(props) {
  const {
    pump, addMessage, pumpStart, connectPump, updatePumpName
  } = props;

  const timeRef = useRef(null);
  const [deviceList, setDeviceList] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [showPairingInstruction, setShowPairingInstruction] = useState(false);
  const [time, setTime] = useState(59);

  useEffect(() => {
    return () => {
      stopTimer();
    };
  }, []);

  useEffect(() => {
    updateDeviceList(pump);

    if (pump.scanning) {
      setScanning(true);
      startTimer();
    } else {
      setScanning(false);
      stopTimer();
    }
  }, [addMessage, pump]);

  const onSearchPump = () => {
    pumpStart();
    setScanning(true);
    setTime(59);
  };

  const updateDeviceList = (pump) => {
    const deviceList = [];
    if (isEmpty(pump.peripherals)) {
      console.log("empty list");
    } else {
      Object.keys(pump.peripherals).forEach((deviceId) => {
        deviceList.push(pump.peripherals[deviceId]);
      });
    }
    setDeviceList(deviceList);
  };

  const onPumpConnect = useCallback((id, name) => {
    console.log("pump connect...", id);
    connectPump(id);
    updatePumpName(name);
  }, [connectPump, updatePumpName]);

  const startTimer = () => {
    if (!timeRef.current) {
      timeRef.current = setInterval(() => {
        setTime((oldVal) => oldVal - 1);
      }, 1000);
    }
  };

  const stopTimer = () => {
    if (timeRef.current) {
      clearInterval(timeRef.current);
      timeRef.current = null;
    }
  };

  return (
    <Container noScroll style={Styles.container}>
      <BackArea />
      <View style={Styles.innerContainer}>
        {deviceList.length === 0 ? (
          <>
            <View style={Styles.imageContainer}>
              <View style={Styles.animationCircle}>
                {scanning ? (
                  <>
                    <CircleAnimation
                      initialValue={100}
                      targetValue={120}
                      duration={500}
                      circleStyle={{ backgroundColor: "white" }}
                    />
                    <View style={Styles.searchIconContainer}>
                      <Icon type="AntDesign" name="search1" style={Styles.searchIcon} />
                    </View>
                  </>
                ) : (
                  <>
                    <Image
                      source={Images.noFoundPumps}
                      style={Styles.superGenieImg}
                    />
                    <View style={Styles.questionIconContainer}>
                      <PendulumAnimation duration={1200} />
                    </View>
                  </>
                )}
              </View>
              <Label font22 center weightSemiBold style={Styles.label}>
                {scanning ? `00:${time}` : "Pump not found"}
              </Label>
              <Label font14 center style={Styles.label}>
                {scanning ? "Searching for pumps..." : "Please make sure your pump is powered on and in range"}
              </Label>
            </View>
            <View style={Styles.noDeviceContainer}>
              {!scanning && (
                <ButtonRound white style={GStyles.fullWidth} onPress={onSearchPump}>
                  <View style={GStyles.flexRow}>
                    <Label weightSemiBold mr10 style={Styles.buttonLabel}>Search for pump</Label>
                  </View>
                </ButtonRound>
              )}
              <View style={Styles.exclamationContainer}>
                <Label white font14 center weightSemiBold>
                  Still can't connect?
                </Label>
                <TouchableOpacity
                  onPress={() => setShowPairingInstruction(true)}
                >
                  <Icon type="FontAwesome" name="exclamation-circle" style={Styles.exclamationIcon} />
                </TouchableOpacity>
              </View>
            </View>
          </>
        ) : <PumpDevices deviceList={deviceList} onPress={onPumpConnect} />}
        <InstructionModal
          isVisible={showPairingInstruction}
          onClose={() => setShowPairingInstruction(false)}
        />
      </View>
    </Container>
  );
}

Searching.propTypes = {
  pump: PropTypes.object,
  connectPump: PropTypes.func,
  pumpStart: PropTypes.func,
  addMessage: PropTypes.func,
  updatePumpName: PropTypes.func,
};

const Styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.tertiary
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 10,
    paddingTop: 40,
    alignItems: "center"
  },
  imageContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  superGenieImg: {
    width: 120,
    height: 120,
    position: "absolute",
  },
  animationCircle: {
    alignItems: "center",
    justifyContent: "center",
    width: 150,
    height: 150,
  },
  noDeviceContainer: {
    width: "100%",
    paddingHorizontal: 25
  },
  exclamationContainer: {
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginTop: 16,
    marginBottom: 20,
  },
  exclamationIcon: {
    color: Colors.white,
    fontSize: 20,
    margin: 8,
  },
  questionIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.tertiary,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  searchIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.tertiary,
    alignItems: "center",
    justifyContent: "center",
    position: "absolute",
  },
  searchIcon: {
    color: Colors.white,
    fontSize: 40,
  },
  label: {
    color: Colors.tertiaryDarker,
    marginTop: 8
  },
  buttonLabel: {
    color: Colors.tertiaryDarker,
  },
});
