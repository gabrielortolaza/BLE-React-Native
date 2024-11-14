import React from "react";
import PropTypes from "prop-types";
import {
  View, Switch, Platform,
  Image, StyleSheet
} from "react-native";

import Label from "../Label";
import { Colors } from "../../../Themes";
import Icon from "../Icon";

const DataSwitch = (props) => {
  const {
    imgSrc, icon, title, selected,
    onValueChange, containerStyle
  } = props;

  return (
    <View
      style={[styles.container, containerStyle]}
    >
      <View style={styles.leftView}>
        {icon ? (
          <Icon
            name={icon.name}
            type={icon.type}
            style={styles.icon}
          />
        ) : (
          <Image
            source={imgSrc}
            style={styles.img}
          />
        )}
        <Label font14 style={styles.titleText}>
          {title}
        </Label>
      </View>
      <Switch
        trackColor={{ true: Colors.windowsBlue, false: Colors.lightGrey300 }}
        thumbColor={Platform.OS === "android" ? Colors.backgroundThree : null}
        onValueChange={onValueChange}
        value={selected}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: Colors.backgroundGrey,
    borderRadius: 20,
    paddingLeft: 15,
    paddingRight: 10
  },
  leftView: {
    flexDirection: "row",
    alignItems: "center"
  },
  img: {
    width: 24,
    height: 24
  },
  icon: {
    fontSize: 24,
    color: Colors.blue
  },
  titleText: {
    marginLeft: 15,
    marginTop: 5
  }
});

DataSwitch.propTypes = {
  icon: PropTypes.object,
  imgSrc: PropTypes.number,
  title: PropTypes.string.isRequired,
  selected: PropTypes.bool,
  onValueChange: PropTypes.func,
  containerStyle: PropTypes.object
};

export default DataSwitch;
