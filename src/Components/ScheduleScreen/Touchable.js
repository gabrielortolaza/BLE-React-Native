import React from "react";
import { TouchableOpacity } from "react-native";
import PropTypes from "prop-types";

import { Colors } from "../../Themes";
import StyleSheet from "../../Proportional";
import OpacityColumn from "./OpacityColumn";

class Touchable extends React.PureComponent {
  renderOpacityColumn = (_, index) => <OpacityColumn key={`column_${index}`} index={index} />

  render() {
    const { onPress } = this.props;
    return (
      <TouchableOpacity
        activeOpacity={1}
        onPress={onPress}
        pressRetentionOffset={{
          top: 0, right: 0, bottom: 0, left: 0
        }}
        style={styles.container}
        testID="Schedule_Touchable"
      >
        {[0, 1, 2, 3, 4, 5, 6].map(this.renderOpacityColumn)}
      </TouchableOpacity>
    );
  }
}

Touchable.propTypes = {
  onPress: PropTypes.func.isRequired
};

export default Touchable;

const styles = StyleSheet.createProportional({
  container: {
    flex: 1,
    zIndex: 2,
    flexDirection: "row",
    backgroundColor: Colors.duckEggBlue10p
  }
});
