import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  StyleSheet, View, TouchableOpacity,
  KeyboardAvoidingView, Platform
} from "react-native";
import Modal from "react-native-modal";
import { useDispatch, useSelector } from "react-redux";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import BluetoothStateManager from "react-native-bluetooth-state-manager";
import { isIphoneX } from "react-native-iphone-screen-helper";

import { Colors, Images } from "../../../Themes";
import AppHeaderButton from "./AppHeaderButton";
import ProgressPump from "../ProgressPump";
import PumpCard from "../PumpCard";
import Label from "../Label";
import ConfirmationToast from "../ConfirmationToast";
import InputField from "../InputField";
import ButtonRound from "../ButtonRound";
import ModalHeader from "./ModalHeader";
import {
  disconnect, toggleLight, turnOff, updatePumpName
} from "../../../Actions";
import * as C from "../../../Config/constants";
import * as M from "../../../Config/messages";
import { PUMP_NAME } from "../../../Config/LocalStorage";

const PumpStatusHeader = ({ showHeaderSeparator = true, showTopEdge }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [pumpName, setPumpName] = useState("");
  const [showDisconnectConfirm, setShowDisconnectConfirm] = useState(false);
  const [btStatus, setBtStatus] = useState(false);

  const navigation = useNavigation();
  const dispatch = useDispatch();
  const connectStatus = useSelector((state) => state.pump.connectStatus);
  const light = useSelector((state) => state.pump.light);
  const battery = useSelector((state) => state.pump.battery);
  const pumpDevice = useSelector((state) => state.pump.pumpDevice) || C.PUMP_DEVICE.SUPERGENIE;
  const pumpDeviceName = useSelector((state) => state.pump.pumpDeviceName);

  useEffect(() => {
    BluetoothStateManager.onStateChange((bluetoothState) => {
      setBtStatus(bluetoothState === "PoweredOn");
    }, true);

    AsyncStorage.getItem(PUMP_NAME).then((val) => {
      // TODO update default name based on pump device
      const pumpName = val || C.PUMP_DEVICE.SUPERGENIE;
      setPumpName(pumpName);
      dispatch(updatePumpName(pumpName));
    });
  }, [dispatch, pumpDeviceName]);

  const connected = connectStatus === C.CONNECT_STATUS.CONNECTED;
  const lightOn = light !== C.LIGHT_OFF;
  const lightText = light === C.LIGHT_OFF
    ? "OFF"
    : light === C.LIGHT_LOW ? "LOW" : "HIGH";

  const usedContainerStyle = [
    styles.container,
    showHeaderSeparator && styles.separator,
    showTopEdge && styles.topEdge,
  ];

  const handleRename = () => {
    setModalVisible(false);
    setTimeout(() => setRenameModalVisible(true), 500);
  };

  const handlePump = () => {
    setModalVisible(false);
    if (connected) {
      turnOff();
    } else {
      navigation.navigate("GeniePairing");
    }
  };

  const changePumpName = () => {
    AsyncStorage.setItem(PUMP_NAME, pumpName);
    dispatch(updatePumpName(pumpName));
    setRenameModalVisible(false);
  };

  return (
    <View style={usedContainerStyle}>
      <AppHeaderButton
        icon={btStatus ? "bluetooth" : "bluetooth-disabled"}
        type="MaterialIcons"
        enabled={btStatus}
        transparent
      />
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <ProgressPump
          statusBattery={battery}
          radius={20}
          strokeWidth={2}
          imageSize={20}
          variant={pumpDevice}
        />
      </TouchableOpacity>
      <AppHeaderButton
        image={connected ? Images.connect : Images.disconnect}
        enabled={connected}
        transparent
        onPress={() => {
          if (!connected) {
            navigation.navigate("GeniePairing");
          } else {
            setShowDisconnectConfirm(true);
          }
        }}
      />
      {showDisconnectConfirm && (
        <ConfirmationToast
          onPressConfirm={() => {
            setShowDisconnectConfirm(false);
            // disabled auto-connnection after disconnecting manually in pump action
            // so no need to use false for 'triggerSearch' here
            dispatch(disconnect());
          }}
          onPressDeny={() => setShowDisconnectConfirm(false)}
          title={M.DISCONNECT_PUMP}
          option1="Cancel"
          option2="Yes, I'm sure"
        />
      )}
      <Modal
        isVisible={modalVisible}
        style={styles.bottomHalfModal}
        onBackdropPress={() => setModalVisible(false)}
      >
        <View style={styles.innerModal}>
          <ModalHeader
            title="All pumps"
            onClose={() => setModalVisible(false)}
            style={styles.titleWrapper}
          />
          <View style={styles.pumpWrapper}>
            <PumpCard
              title={pumpName}
              variant={pumpDevice}
              statusBattery={battery}
              hasConnection={connected}
              hasLight={lightOn}
              lightText={lightText}
              handleRename={handleRename}
              handleLight={() => dispatch(toggleLight())}
              handlePump={handlePump}
            />
          </View>
        </View>
      </Modal>
      <Modal
        isVisible={renameModalVisible}
        style={styles.bottomHalfModal}
        onBackdropPress={() => setRenameModalVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "position" : null}
        >
          <View style={[styles.innerModal, { minHeight: 270 }]}>
            <ModalHeader
              title="Rename pump"
              onClose={() => setRenameModalVisible(false)}
              style={styles.titleWrapper}
            />
            <View>
              <Label font12 weightSemiBold>PUMP NAME</Label>
              <InputField
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
                value={pumpName}
                onChangeText={(text) => setPumpName(text)}
                placeholder="Pump Name"
                style={styles.nameInput}
              />
              <View style={styles.buttonContainer}>
                <ButtonRound
                  onPress={changePumpName}
                  blue
                  disabled={!pumpName}
                >
                  <Label white weightSemiBold>Rename</Label>
                </ButtonRound>
              </View>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 8,
  },
  separator: {
    borderBottomColor: Colors.grey242,
    borderBottomWidth: 1,
  },
  topEdge: {
    marginTop: isIphoneX() ? 44 : 14,
  },
  bottomHalfModal: {
    justifyContent: "flex-end",
    margin: 0
  },
  innerModal: {
    minHeight: 340,
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 16,
  },
  titleWrapper: {
    marginBottom: 12,
  },
  pumpWrapper: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  nameInput: {
    marginTop: 8,
    marginBottom: 32,
    fontSize: 14
  },
});

PumpStatusHeader.propTypes = {
  showHeaderSeparator: PropTypes.bool,
  showTopEdge: PropTypes.bool,
};

export default PumpStatusHeader;
