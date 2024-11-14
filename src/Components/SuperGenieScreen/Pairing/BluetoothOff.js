import React, { PureComponent } from "react";
import { Image, StyleSheet, View } from "react-native";

import {
  Colors, Images,
} from "../../../Themes";
import { Label } from "../../Shared";
import Container from "../../Shared/Container";
import BackArea from "./Components/BackArea";

export default class BluetoothOff extends PureComponent {
  render() {
    return (
      <Container noScroll style={Styles.container}>
        <BackArea />
        <View style={Styles.innerContainer}>
          <Image source={Images.phoneSleeping} style={Styles.phoneImg} />
          <Label font22 center weightSemiBold style={Styles.label}>
            Wake bluetooth up
          </Label>
          <Label font14 center style={Styles.label}>
            Please turn on Bluetooth in
            {"\n"}
            mobile device’s Settings to continue
          </Label>
        </View>
      </Container>
    );
  }
}

const Styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.tertiary,
  },
  innerContainer: {
    flex: 1,
    paddingHorizontal: 10,
    alignItems: "center",
    justifyContent: "center"
  },
  phoneImg: {
    width: 185,
    height: 304,
    marginBottom: 8
  },
  label: {
    color: Colors.tertiaryDarker,
    marginTop: 8
  }
});
