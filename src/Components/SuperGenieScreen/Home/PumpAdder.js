import React, { useEffect, useState } from "react";
import {
  StyleSheet, View, KeyboardAvoidingView, Platform, FlatList
} from "react-native";
import Modal from "react-native-modal";
import { useDispatch, useSelector } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";

import Label from "../../Shared/Label";
import InputField from "../../Shared/InputField";
import ButtonRound from "../../Shared/ButtonRound";
import ModalHeader from "../../Shared/AppHeader/ModalHeader";
import { updatePumpName } from "../../../Actions";
import * as C from "../../../Config/constants";
import { PUMP_NAME } from "../../../Config/LocalStorage";
import PumpAddItem from "./PumpAddItem";
import { Images } from "../../../Themes";

const PumpAdder = () => {
  const [pumps, setPumps] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [renameModalVisible, setRenameModalVisible] = useState(false);
  const [pumpName, setPumpName] = useState("");

  const showPumpAdd = useSelector((state) => state.pump.showPumpAdd);
  const peripherals = useSelector((state) => state.pump.peripherals);
  const dispatch = useDispatch();

  useEffect(() => {
    if (showPumpAdd) {
      const pumpDeviceList = [];
      Object.keys(peripherals).forEach((deviceId) => {
        const pumpData = {
          ...peripherals[deviceId],
          status: true,
          // TODO change pump image based on pump device
          pumpImage: Images.supergeniePair
        };
        pumpDeviceList.push(pumpData);
      });
      setPumps(pumpDeviceList);
      setModalVisible(pumpDeviceList.length > 0);
    }
  }, [showPumpAdd]);

  useEffect(() => {
    AsyncStorage.getItem(PUMP_NAME).then((val) => {
      // TODO update default name based on pump device
      const pumpName = val || C.PUMP_DEVICE.SUPERGENIE;
      setPumpName(pumpName);
      dispatch(updatePumpName(pumpName));
    });
  }, []);

  const handleRename = () => {
    setModalVisible(false);
    setTimeout(() => setRenameModalVisible(true), 500);
  };

  const changePumpName = () => {
    AsyncStorage.setItem(PUMP_NAME, pumpName);
    dispatch(updatePumpName(pumpName));
    setRenameModalVisible(false);
  };

  return (
    <View>
      <Modal
        isVisible={modalVisible}
        style={styles.bottomHalfModal}
        onBackdropPress={() => setModalVisible(false)}
      >
        <View style={styles.innerModal}>
          <ModalHeader
            title="Added Successfully"
            onClose={() => setModalVisible(false)}
          />
          <FlatList
            data={pumps}
            contentContainerStyle={{ marginBottom: 12 }}
            keyExtractor={({ id }) => id}
            renderItem={({ item }) => (
              <PumpAddItem
                pumpName={item.name}
                pumpImage={item.pumpImage}
                status={item.status}
                onEdit={() => handleRename()}
              />
            )}
          />
          <ButtonRound
            onPress={() => setModalVisible(false)}
            blue
          >
            <Label white weightSemiBold>Done</Label>
          </ButtonRound>
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
  bottomHalfModal: {
    justifyContent: "flex-end",
    margin: 0
  },
  innerModal: {
    backgroundColor: "white",
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 30,
  },
  titleWrapper: {
    marginBottom: 12,
  },
  nameInput: {
    marginTop: 8,
    marginBottom: 32,
    fontSize: 14
  },
});

PumpAdder.propTypes = {
};

export default PumpAdder;
