import React from "react";
import { Image, StyleSheet, View } from "react-native";
import PropTypes from "prop-types";

import Label from "../../Shared/Label";
import Icon from "../../Shared/Icon";
import { Colors } from "../../../Themes";

const PumpAddItem = ({
  pumpImage, pumpName, status, onEdit
}) => {
  return (
    <View style={styles.container}>
      <Image source={pumpImage} style={styles.image} />
      <View style={{ width: "70%" }}>
        <Label weightSemiBold>{pumpName}</Label>
        <Label font12 mt8 style={{ color: status ? Colors.lightGrey3 : Colors.tomato }}>
          {status ? "Pump added successfully" : "Pump failed to be added"}
        </Label>
      </View>
      <Icon
        name="edit"
        type="MaterialIcons"
        style={styles.editIcon}
        onPress={onEdit}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  image: {
    resizeMode: "contain",
    width: 50,
    height: 50
  },
  editIcon: {
    fontSize: 20,
    color: Colors.blue,
  },
});

PumpAddItem.propTypes = {
  pumpImage: PropTypes.number,
  pumpName: PropTypes.string,
  status: PropTypes.bool,
  onEdit: PropTypes.func,
};

export default PumpAddItem;
