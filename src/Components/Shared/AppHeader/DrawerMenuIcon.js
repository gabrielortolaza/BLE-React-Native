import React from "react";
import { TouchableOpacity, StyleSheet } from "react-native";
import PropTypes from "prop-types";

import Icon from "../Icon";

const DrawerMenuIcon = (props) => {
  const toggleDrawer = () => {
    const { navigation } = props;
    navigation.toggleDrawer();
  };

  return (
    <TouchableOpacity onPress={toggleDrawer} style={styles.wrapper}>
      <Icon name="menu" />
    </TouchableOpacity>
  );
};

DrawerMenuIcon.propTypes = {
  navigation: PropTypes.object,
};

const styles = StyleSheet.create({
  wrapper: {
    padding: 10,
    width: 50,
    height: 50
  },
});

export default DrawerMenuIcon;
