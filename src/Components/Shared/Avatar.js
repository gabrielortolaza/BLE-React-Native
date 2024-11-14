import React, { useEffect, useState } from "react";
import {
  TouchableOpacity, StyleSheet,
  ActivityIndicator, Image
} from "react-native";
import PropTypes from "prop-types";
import ImagePicker from "react-native-image-crop-picker";
import storage from "@react-native-firebase/storage";
import firebase from "@react-native-firebase/app";
import { useSelector, useDispatch } from "react-redux";

import { Colors } from "../../Themes";
import SelectionModal from "./SelectionModal";
import { setPictureUrl } from "../../Actions/Auth";
import Label from "./Label";

// const FireBaseStorage = storage();
const PickerOptions = [
  { titl: "Gallery", key: 1 },
  { titl: "Camera", key: 2 },
];

function Avatar(props) {
  const { onPress } = props;
  const [pickerVisible, setPickerVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatarName, setAvatarName] = useState("");
  const dispatch = useDispatch();
  const pictureUrl = useSelector((state) => state.auth.profile.pictureUrl);
  const displayName = useSelector((state) => state.auth.profile.displayName);

  useEffect(() => {
    const name = displayName.split(" ").map((item) => item.charAt(0)?.toUpperCase()).join("");
    setAvatarName(name);
  }, [displayName]);

  const uploadFileToFireBase = (response) => {
    // let { filename } = response;
    const { path } = response;
    // if (Platform.OS === "android") { // no filename in android
    //   filename = path.substring(path.lastIndexOf("/") + 1, path.length);
    // }
    const user = firebase.auth().currentUser;
    const filename = user.uid;
    const firebasePath = `/PumpBuddy/${user.uid}/${filename}`;

    return storage()
      .ref(firebasePath)
      .putFile(path);
  };

  const monitorFileUpload = (uploadTask) => {
    uploadTask.on("state_changed", (snapshot) => {
      switch (snapshot.state) {
        case "running":
          setLoading(true);
          break;
        case "success":
          snapshot.ref.getDownloadURL().then((downloadURL) => {
            setLoading(false);
            console.log("download url", downloadURL);
            dispatch(setPictureUrl(downloadURL));
          });
          break;
        default:
          break;
      }
    });
  };

  const openPicker = () => {
    ImagePicker.openPicker({
      width: 300,
      height: 400,
      compressImageQuality: 0.2,
      cropping: true
    }).then((image) => {
      console.log("sel image:", image);
      setPickerVisible(false);
      const uploadTask = uploadFileToFireBase(image);
      monitorFileUpload(uploadTask);
    });
  };

  const openCamera = () => {
    ImagePicker.openCamera({
      width: 300,
      height: 400,
      compressImageQuality: 0.2,
      cropping: true
    }).then((image) => {
      setPickerVisible(false);
      const uploadTask = uploadFileToFireBase(image);
      monitorFileUpload(uploadTask);
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

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={() => (onPress ? onPress() : setPickerVisible(true))}
    >
      {
        loading ? (
          <ActivityIndicator color={Colors.blue} />
        ) : pictureUrl ? (
          <Image source={{ uri: pictureUrl }} style={styles.userImage} />
        ) : (
          <Label lightGrey2 font20 weightBold>{avatarName}</Label>
        )
      }
      {pickerVisible && (
        <SelectionModal
          isVisible={pickerVisible}
          title="Select a photo"
          onPressConfirm={onPickerSelected}
          dataArr={PickerOptions}
        />
      )}
    </TouchableOpacity>
  );
}

Avatar.propTypes = {
  onPress: PropTypes.func,
};

const styles = StyleSheet.create({
  container: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.lightGrey,
  },
  userImage: {
    width: 56,
    height: 56,
    borderRadius: 28
  }
});

export default Avatar;
