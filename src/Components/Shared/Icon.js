import React from "react";
import PropTypes from "prop-types";
import AntDesign from "react-native-vector-icons/AntDesign";
import Ionicons from "react-native-vector-icons/Ionicons";
import Entypo from "react-native-vector-icons/Entypo";
import EvilIcons from "react-native-vector-icons/EvilIcons";
import Feather from "react-native-vector-icons/Feather";
import FontAwesome from "react-native-vector-icons/FontAwesome";
import FontAwesome5 from "react-native-vector-icons/FontAwesome5";
import Fontisto from "react-native-vector-icons/Fontisto";
import MaterialCommunityIcons from "react-native-vector-icons/MaterialCommunityIcons";
import MaterialIcons from "react-native-vector-icons/MaterialIcons";
import SimpleLineIcons from "react-native-vector-icons/SimpleLineIcons";

const Icon = ({
  name, type, style, onPress
}) => {
  let Wrapper;
  switch (type) {
    case "AntDesign":
      Wrapper = AntDesign;
      break;
    case "Entypo":
      Wrapper = Entypo;
      break;
    case "EvilIcons":
      Wrapper = EvilIcons;
      break;
    case "Feather":
      Wrapper = Feather;
      break;
    case "FontAwesome":
      Wrapper = FontAwesome;
      break;
    case "FontAwesome5":
      Wrapper = FontAwesome5;
      break;
    case "Fontisto":
      Wrapper = Fontisto;
      break;
    case "Ionicons":
      Wrapper = Ionicons;
      break;
    case "MaterialCommunityIcons":
      Wrapper = MaterialCommunityIcons;
      break;
    case "MaterialIcons":
      Wrapper = MaterialIcons;
      break;
    case "SimpleLineIcons":
      Wrapper = SimpleLineIcons;
      break;
    default:
      Wrapper = Ionicons;
      break;
  }

  return (
    <Wrapper
      name={name}
      style={style}
      onPress={onPress && onPress}
    />
  );
};

Icon.propTypes = {
  name: PropTypes.string,
  type: PropTypes.string,
  style: PropTypes.oneOfType([
    PropTypes.object,
    PropTypes.array,
  ]),
  onPress: PropTypes.func,
};

export default Icon;
