import React, { useEffect, useState } from "react";
import { Image, StyleSheet, View } from "react-native";
import { useSelector } from "react-redux";
import Modal from "react-native-modal";

import Label from "./Label";
import ButtonRound from "./ButtonRound";
import { Images, Styles } from "../../Themes";
import { CONNECT_STATUS } from "../../Config/constants";

const LowBatteryModal = () => {
  const [isVisible, setVisible] = useState(true);
  const battery = useSelector((state) => state.pump.battery);
  const pumpDeviceName = useSelector((state) => state.pump.pumpDeviceName);
  const connectStatus = useSelector((state) => state.pump.connectStatus);

  const connected = connectStatus === CONNECT_STATUS.CONNECTED;

  useEffect(() => {
    if (battery >= 20 && !isVisible) {
      // need to show popup when battery becomes below 20% again
      setVisible(true);
    }
  }, [battery]);

  return (
    <Modal
      isVisible={isVisible && connected && (battery > 0 && battery < 20)}
      // battery is 0 upon connection
      style={styles.bottomHalfModal}
      onBackdropPress={() => setVisible(false)}
    >
      <View style={styles.container}>
        <Image
          source={Images.lowBattery}
          style={styles.image}
        />
        <Label weightSemiBold font16>Low Battery!</Label>
        <Label lightGrey2 style={styles.label}>
          {`${pumpDeviceName} battery is getting low. Less than 20% remaining.`}
        </Label>
        <ButtonRound
          blue
          style={Styles.fullWidth}
          onPress={() => setVisible(false)}
        >
          <Label white weightSemiBold>OK, Got it</Label>
        </ButtonRound>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  bottomHalfModal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  container: {
    minHeight: 330,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 25,
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  label: {
    marginTop: 4,
    marginBottom: 32,
    width: "75%",
    textAlign: "center",
  },
});

export default LowBatteryModal;
