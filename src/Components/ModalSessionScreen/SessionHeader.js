import React, { PureComponent } from "react";
import { View, TouchableOpacity, Image } from "react-native";
import PropTypes from "prop-types";

import { Colors, Images } from "../../Themes";
import { Label } from "../Shared";

export default class SessionHeader extends PureComponent {
  render() {
    const { sessionType, onChange } = this.props;

    return (
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 25,
          alignItems: "center"
        }}
      >
        <TouchableOpacity
          onPress={() => onChange("sessionType", "pump")}
          style={[styles.tab, sessionType === "pump" && styles.activeTab]}
        >
          <Image
            source={sessionType === "pump" ? Images.pumpedActive : Images.pumpedInactive}
            style={styles.pumpImg}
          />
          <Label
            center
            weightBold
            font14
            style={{
              color: sessionType === "pump" ? Colors.blue : Colors.lightGrey2
            }}
          >
            Pumped
          </Label>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => onChange("sessionType", "feed")}
          style={[styles.tab, sessionType === "feed" && styles.activeTab]}
        >
          <Image
            source={sessionType === "feed" ? Images.fedActive : Images.fedInactive}
            style={styles.fedImg}
          />
          <Label
            center
            weightBold
            font14
            style={{
              color: sessionType === "feed" ? Colors.blue : Colors.lightGrey2
            }}
          >
            Nursed
          </Label>
        </TouchableOpacity>
      </View>
    );
  }
}

SessionHeader.propTypes = {
  sessionType: PropTypes.string,
  onChange: PropTypes.func
};

const styles = {
  activeTab: {
    borderBottomWidth: 4,
    borderBottomColor: Colors.blue
  },
  tab: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    width: "50%",
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGrey2
  },
  pumpImg: {
    width: 20,
    height: 20,
    marginRight: 5
  },
  fedImg: {
    width: 13,
    height: 20,
    marginRight: 5
  }
};
