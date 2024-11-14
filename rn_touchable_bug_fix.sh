#!/bin/bash

# Stores rn version in variable
RN_VERSION=$(npm view react-native version)
# Checks if line 268 is 'undefined' to prevent multiple command runs(not fool-proof)
LINE_268=$(sed '268q;d' node_modules/react-native/Libraries/Components/Touchable/TouchableOpacity.js)
# "  undefined" accounts for leading whitespace
if [ "$LINE_268" = "        undefined" ]; then
  # Enter your rn version below
  if [ "$RN_VERSION" = "0.70.4" ]; then
    # Deletes lines
    sed -i -e '266,268d' node_modules/react-native/Libraries/Components/Touchable/TouchableOpacity.js;
    # Inserts new lines
    sed -i '' '266i\
    flattenStyle(prevProps.style)?.opacity !== flattenStyle(this.props.style)?.opacity' node_modules/react-native/Libraries/Components/Touchable/TouchableOpacity.js
  fi
fi