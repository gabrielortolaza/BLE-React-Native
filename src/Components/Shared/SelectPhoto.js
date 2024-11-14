import React, { useState } from "react";
import {
  TouchableOpacity, StyleSheet
} from "react-native";
import firebase from "@react-native-firebase/app";
import PropTypes from "prop-types";
import ImagePicker from "react-native-image-crop-picker";

import { Colors } from "../../Themes";
import SelectionModal from "./SelectionModal";
import Label from "./Label";
import Icon from "./Icon";

const PickerOptions = [
  { titl: "Gallery", key: 1 },
  { titl: "Camera", key: 2 },
];

function SelectPhoto(props) {
  const {
    positionStyle, event, label, isPhoto
  } = props;
  const [pickerVisible, setPickerVisible] = useState(false);
  // const dispatch = useDispatch();
  // const imageCard = useSelector((state) => state.pump.imageCard);

  const openPicker = () => {
    ImagePicker.openPicker({
      cropping: true
    }).then((image) => {
      setPickerVisible(false);
      saveImage(image.path);
    });
  };

  const openCamera = () => {
    ImagePicker.openCamera({
      cropping: true
    }).then((image) => {
      setPickerVisible(false);
      saveImage(image.path);
    });
  };

  const onPickerSelected = (selection) => {
    if (selection === 1) {
      openPicker();
    } else if (selection === 2) {
      openCamera();
    } else {
      setPickerVisible(false);
    }
  };

  const saveImage = (uri) => {
    const { updateImageUrl } = props;
    try {
      // await AsyncStorage.setItem(type, uri);
      // imageCard[type] = uri;
      // dispatch(updateImageCard(imageCard));
      updateImageUrl(uri);
    } catch (error) {
      console.log("photo save error:", error);
    }
  };

  const usedStyles = [
    styles.container,
    positionStyle,
    isPhoto ? { backgroundColor: Colors.lightBlue } : { backgroundColor: "transparent" },
    label && !isPhoto && styles.containLabelStyle,
  ];

  return (
    <TouchableOpacity
      style={usedStyles}
      onPress={() => {
        setPickerVisible(true);
        firebase.analytics().logEvent(event);
      }}
    >
      <Icon type="MaterialIcons" name="add-a-photo" style={styles.cameraIcon} />
      {
        label && !isPhoto && <Label font14 white weightSemiBold mt10>{label}</Label>
      }
      <SelectionModal
        isVisible={pickerVisible}
        title="Select a photo"
        onPressConfirm={onPickerSelected}
        dataArr={PickerOptions}
      />
    </TouchableOpacity>
  );
}

SelectPhoto.propTypes = {
  positionStyle: PropTypes.object,
  event: PropTypes.string,
  label: PropTypes.string,
  isPhoto: PropTypes.bool,
  updateImageUrl: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.blue,
    width: 46,
    height: 46,
    borderRadius: 23,
    alignItems: "center",
    justifyContent: "center"
  },
  containLabelStyle: {
    width: 130,
    backgroundColor: "transparent"
  },
  cameraIcon: {
    color: Colors.white,
    fontSize: 25
  },
});

export default SelectPhoto;
