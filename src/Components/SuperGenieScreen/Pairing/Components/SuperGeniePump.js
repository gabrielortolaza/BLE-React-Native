import React from "react";
import PropTypes from "prop-types";
import {
  StyleSheet, View, Image, TouchableOpacity
} from "react-native";

import { Label } from "../../../Shared";
import { appWidth } from "../../../../Services/SharedFunctions";
import { Colors } from "../../../../Themes";

const SuperGeniePump = ({ name, image, onPress }) => {
  return (
    <View style={styles.container}>
      <Image
        source={image}
        style={styles.image}
      />
      <TouchableOpacity style={styles.button} onPress={onPress}>
        <Label maxFontSizeMultiplier={1} font12 white center weightSemiBold>{name}</Label>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: appWidth / 2,
    alignItems: "center",
    marginBottom: 20,
  },
  image: {
    width: 100,
    height: 70,
    resizeMode: "contain",
  },
  button: {
    backgroundColor: Colors.blue,
    width: "75%",
    marginTop: 10,
    borderRadius: 25,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignItems: "center",
    justifyContent: "center",
  },
});

SuperGeniePump.propTypes = {
  name: PropTypes.string,
  image: PropTypes.number,
  onPress: PropTypes.func,
};

export default SuperGeniePump;
