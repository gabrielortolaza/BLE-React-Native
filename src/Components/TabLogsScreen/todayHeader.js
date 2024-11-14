import React, { PureComponent } from "react";
import { View, TouchableOpacity } from "react-native";
import PropTypes from "prop-types";
import { Label } from "../Shared";
import { Colors, Fonts } from "../../Themes";
import StyleSheet from "../../Proportional";
import Icon from "../Shared/Icon";
import { STASH_TAB } from "../../Config/constants";

export default class TodayHeader extends PureComponent {
  render() {
    const {
      iconPress, activeTab, containerStyle,
      getbtnsViewMeasurements, showExportModal
    } = this.props;

    return (
      <View style={[styles.view, containerStyle || {}]}>
        <View style={[styles.row, styles.rowHeader]}>
          <Label maxFontSizeMultiplier={1.1} style={styles.header}>
            Logs & Stash
          </Label>
          <View
            style={styles.icons}
            onLayout={(event) => {
              if (getbtnsViewMeasurements) {
                event.target.measure(
                  (fx, fy, width, height, pageX, pageY) => {
                    getbtnsViewMeasurements({
                      x: fx + pageX,
                      y: fy + pageY,
                      width,
                      height
                    });
                  },
                );
              }
            }}
          >
            <TouchableOpacity
              onPress={showExportModal}
            >
              <Icon
                style={styles.exportIcon}
                type="MaterialIcons"
                name="file-upload"
              />
            </TouchableOpacity>
            {activeTab === STASH_TAB && (
              <TouchableOpacity
                style={[styles.iconContainer, styles.minusIconContainer]}
                onPress={() => iconPress("minus")}
              >
                <Icon
                  style={styles.icon}
                  type="AntDesign"
                  name="minus"
                />
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.iconContainer}
              onPress={() => iconPress("plus")}
            >
              <Icon
                style={styles.icon}
                type="AntDesign"
                name="plus"
              />
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }
}

TodayHeader.propTypes = {
  iconPress: PropTypes.func,
  activeTab: PropTypes.string,
  containerStyle: PropTypes.object,
  getbtnsViewMeasurements: PropTypes.func,
  showExportModal: PropTypes.func
};

const styles = StyleSheet.createProportional({
  view: {
    marginHorizontal: 25,
    paddingVertical: 1,
    justifyContent: "space-between",
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
  },
  rowHeader: {
    justifyContent: "space-between"
  },
  rowViews: {
    marginTop: 20
  },
  header: {
    fontSize: 30,
    ...Fonts.SemiBold,
    color: Colors.grey
  },
  icons: {
    flexDirection: "row",
    alignItems: "center"
  },
  iconContainer: {
    backgroundColor: Colors.blue,
    height: 21,
    width: 21,
    borderRadius: 10.5,
    alignItems: "center",
    justifyContent: "center"
  },
  minusIconContainer: {
    backgroundColor: Colors.lightBlue,
    marginRight: 12,
  },
  icon: {
    fontSize: 12,
    color: Colors.white,
  },
  exportIcon: {
    fontSize: 21,
    color: Colors.blue,
    marginRight: 12
  }
});
