import React, { PureComponent } from "react";
import { View, StyleSheet, FlatList } from "react-native";
import PropTypes from "prop-types";

import { Colors, Images } from "../../../Themes";
import { Label } from "../../Shared";
import { PUMP_DEVICE } from "../../../Config/constants";
import SuperGeniePump from "./Components/SuperGeniePump";

export default class PumpDevices extends PureComponent {
  changeDeviceName = (name) => {
    if (name === PUMP_DEVICE.SG2) {
      name = "SuperGenie Gen2";
    } else if (name === PUMP_DEVICE.GG2) {
      name = "Genie Gen 2";
    }
    // TODO check wearable pump name
    return name;
  };

  render() {
    const { deviceList, onPress } = this.props;
    const renderItems = deviceList.map((item) => ({
      ...item,
      image: item.name === PUMP_DEVICE.SUPERGENIE ? Images.supergeniePair : Images.wearablePair
    }));

    // TODO show this only when found wearable pump
    // if (renderItems.length > 1) {
    //   // TODO check wearable pump id
    //   renderItems.push({
    //     id: "wearable_pumps",
    //     image: Images.wearableTwoPair,
    //     name: WEARABLE_PAIR_NAME
    //   });
    // }

    return (
      <View style={styles.container}>
        <Label font22 center weightSemiBold style={styles.label}>
          {`${deviceList.length} Pump${deviceList.length > 1 ? "s" : ""} found`}
        </Label>
        <Label font14 center style={styles.label}>
          Select your pump and start connecting
        </Label>
        <FlatList
          contentContainerStyle={styles.list}
          data={renderItems}
          numColumns={renderItems.length > 1 ? 2 : 1}
          key={renderItems.length > 1 ? "_" : "#"}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => {
            return (
              <SuperGeniePump
                name={this.changeDeviceName(item.name)}
                image={item.image}
                onPress={() => onPress(item.id, item.name)}
              />
            );
          }}
        />
      </View>
    );
  }
}

PumpDevices.propTypes = {
  deviceList: PropTypes.array,
  onPress: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    height: "100%",
    width: "100%",
    flexDirection: "column",
    backgroundColor: Colors.tertiary,
    marginTop: 55,
  },
  button: {
    width: "65%",
    justifyContent: "center",
    alignSelf: "center"
  },
  list: {
    marginTop: 24,
    alignItems: "center",
  },
  label: {
    color: Colors.tertiaryDarker,
    marginTop: 8
  },
});
