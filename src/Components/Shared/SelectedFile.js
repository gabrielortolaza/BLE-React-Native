import React from "react";
import PropTypes from "prop-types";
import {
  View, TouchableOpacity, StyleSheet,
  Image
} from "react-native";
import { Label as Text } from ".";
import { Colors } from "../../Themes";
import Icon from "./Icon";
import { MIME_TYPES } from "../../Config/constants";

const SelectedFile = ({ item, deleteItem }) => {
  const { type } = item;
  const mimeTypeShort = type.substring(0, type.indexOf("/"));

  if (mimeTypeShort === "image") {
    item.imageUri = { uri: item.fileCopyUri };
  } else if (mimeTypeShort === "video") {
    item.imageUri = MIME_TYPES.video.uri;
  } else if (mimeTypeShort === "audio") {
    item.imageUri = MIME_TYPES.audio.uri;
  } else {
    item.imageUri = MIME_TYPES.doc.uri;
  }

  return (
    <View style={styles.container}>
      <View style={styles.imgTxtView}>
        <Image
          source={item.imageUri}
          style={styles.image}
        />
        <Text numberOfLines={1} font12>{item.name}</Text>
      </View>
      <TouchableOpacity
        onPress={deleteItem}
      >
        <Icon
          name="delete"
          type="MaterialIcons"
          style={styles.deleteIcon}
        />
      </TouchableOpacity>
    </View>
  );
};

export default SelectedFile;

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.lightGrey200,
    borderRadius: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 40,
    paddingHorizontal: 10,
    marginBottom: 15
  },
  imgTxtView: {
    flexDirection: "row",
    alignItems: "center",
    width: "80%"
  },
  image: {
    width: 24,
    height: 24,
    marginRight: 10
  },
  deleteIcon: {
    color: Colors.lightGrey2,
    fontSize: 18
  }
});

SelectedFile.propTypes = {
  item: PropTypes.object,
  deleteItem: PropTypes.func.isRequired
};
