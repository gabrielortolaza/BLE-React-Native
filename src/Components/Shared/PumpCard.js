import React from "react";
import PropTypes from "prop-types";
import { StyleSheet, TouchableOpacity, View } from "react-native";

import ProgressPump from "./ProgressPump";
import Label from "./Label";
import Icon from "./Icon";
import { Colors } from "../../Themes";
import Button from "./ButtonRound";
import { PUMP_DEVICE } from "../../Config/constants";

const PumpCard = ({
  title, variant, statusBattery,
  hasConnection, handlePump, handleRename,
  lightText, hasLight, handleLight
}) => {
  return (
    <View style={styles.container}>
      <ProgressPump
        statusBattery={statusBattery}
        radius={50}
        strokeWidth={4}
        imageSize={40}
        variant={variant}
        showLabel
      />
      <View style={styles.titleWrapper}>
        <Label weightSemiBold>{title}</Label>
        <TouchableOpacity onPress={() => handleRename(title)}>
          <Icon name="edit" type="MaterialIcons" style={styles.editIcon} />
        </TouchableOpacity>
      </View>
      {variant === PUMP_DEVICE.SUPERGENIE && (
        <TouchableOpacity
          style={[styles.lightWrapper,
            { backgroundColor: hasLight ? Colors.backgroundBlue : Colors.grey242 }
          ]}
          onPress={handleLight}
        >
          <Icon
            type="Entypo"
            name="light-down"
            style={hasLight ? styles.enableIcon : styles.disableIcon}
          />
          <Label
            weightSemiBold
            font12
            style={hasLight ? styles.enableLabel : styles.disableLabel}
          >
            {lightText}
          </Label>
        </TouchableOpacity>
      )}
      {hasConnection ? (
        <Button style={styles.offButton} onPress={handlePump}>
          <Label font12 blue weightSemiBold>TURN OFF</Label>
        </Button>
      ) : (
        <Button style={styles.connectButton} onPress={handlePump}>
          <Label font12 white weightSemiBold>RE-CONNECT</Label>
        </Button>
      )}
    </View>
  );
};

PumpCard.propTypes = {
  title: PropTypes.string,
  variant: PropTypes.string,
  statusBattery: PropTypes.number,
  hasConnection: PropTypes.bool,
  lightText: PropTypes.string,
  hasLight: PropTypes.bool,
  handlePump: PropTypes.func,
  handleRename: PropTypes.func,
  handleLight: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    justifyContent: "center",
    width: "50%",
  },
  titleWrapper: {
    marginVertical: 8,
    maxWidth: "85%",
    flexDirection: "row",
  },
  editIcon: {
    fontSize: 20,
    color: Colors.lightGrey2,
  },
  offButton: {
    borderColor: Colors.blue,
    borderWidth: 1,
    width: "80%",
    height: 36,
  },
  connectButton: {
    backgroundColor: Colors.blue,
    width: "80%",
    height: 36,
  },
  lightWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderRadius: 12,
    paddingHorizontal: 6,
    paddingVertical: 3,
    marginTop: 8,
    marginBottom: 16,
  },
  enableIcon: {
    fontSize: 20,
    color: Colors.blue
  },
  disableIcon: {
    fontSize: 20,
    color: Colors.warmGrey
  },
  enableLabel: {
    marginLeft: 8,
    color: Colors.blue
  },
  disableLabel: {
    marginLeft: 8,
    color: Colors.warmGrey
  }
});

export default PumpCard;
