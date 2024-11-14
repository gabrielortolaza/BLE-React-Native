import React from "react";
import PropTypes from "prop-types";
import { ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Colors } from "../../Themes";

const Container = React.forwardRef(({
  children, noScroll, edges, style
}, ref) => {
  if (!edges) {
    edges = ["left", "right"];
  }

  const usedStyles = [
    styles.container,
    style,
  ];

  const content = noScroll ? children : (
    <ScrollView ref={ref}>
      {children}
    </ScrollView>
  );

  return (
    <SafeAreaView edges={edges} style={usedStyles}>
      {content}
    </SafeAreaView>
  );
});

const styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.background
  }
};

Container.propTypes = {
  noScroll: PropTypes.bool,
  edges: PropTypes.array,
  children: PropTypes.any,
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array
  ]),
};

export default Container;
