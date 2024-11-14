import React, { PureComponent } from "react";
import {
  ImageBackground, View,
  TextInput, Dimensions, Platform,
  PermissionsAndroid
} from "react-native";
import PropTypes from "prop-types";
// import CameraRoll from "@react-native-community/cameraroll";

import Label from "../Label";
import ButtonRound from "../ButtonRound";
import { Colors } from "../../../Themes";
import { AppHeader } from "..";
import SelectPhoto from "../SelectPhoto";
import Icon from "../Icon";

const appWidth = Dimensions.get("window").width;

export default class CardHeader extends PureComponent {
  async getExternalStoragePermission() {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        this.getPhotos();
      } else {
        console.log("Photos permission denied");
      }
    } catch (err) {
      console.warn(err);
    }
  }

  getPhotos() {
    const { type, currentProgram } = this.props;
    let type2 = type;

    // Mobx not playing nicely with shorthand
    if (type2 === "manualRunImage") {
      type2 = "manualRunImage";
    } else {
      type2 = `programRunImage${currentProgram.id}`;
    }

    const params = {
      first: 250,
      groupTypes: "All",
      assetType: "Photos"
    };

    if (Platform.OS === "android") delete params.groupTypes;

    // CameraRoll.getPhotos(params)
    //   .then((r) => {
    //     console.log(r.edges);

    //     function uniq(arr) {
    //       return arr.filter((object, index, self) => index === self.findIndex((t) => (
    //         t.node.image.uri === object.node.image.uri
    //       )));
    //     }

    //     navigation.navigate("PhotoSelection", { type: type2, photos: uniq(r.edges) });
    //   })
    //   .catch((err) => {
    //     // Error Loading Images
    //     console.log(err);
    //   });
  }

  render() {
    const {
      id, programTitle, titleEditing,
      totalDuration, onChangeText, editingTitle,
      cancelEditingTitle, setTitle, goBack,
      imageSource, type, currentProgram, isPhoto,
      hideTittle = false
    } = this.props;

    let type2 = type;
    if (type2 === "manualRunImage") {
      type2 = "manualRunImage";
    } else {
      type2 = `programRunImage${currentProgram.id}`;
    }

    return (
      <ImageBackground
        source={imageSource}
        style={{
          width: "100%",
          height: "100%"
        }}
      >
        {!titleEditing && (
          <View>
            <AppHeader
              leftActionEvent={goBack}
              transparent
              absolute
              showBackButton
              leftButtonStyle={{ color: Colors.white, fontSize: 25 }}
              right={(
                <SelectPhoto
                  positionStyle={{ marginRight: 0 }}
                  type={type2}
                  isPhoto={isPhoto}
                  event="Program_edit_image_selection"
                />
              )}
            />
          </View>
        )}
        {!hideTittle && (
          <View
            style={Styles.cardInfo}
          >
            <View style={Styles.cardView}>
              <TextInput
                ref={(ref) => { this.inputRef = ref; }}
                placeholder={`program ${id}`}
                placeholderTextColor={Colors.white50p}
                onChangeText={(txt) => onChangeText({ programTitle: txt })}
                value={programTitle}
                style={[Styles.programText, { backgroundColor: titleEditing ? Colors.white10p : "transparent" }]}
                editable={titleEditing}
                selectTextOnFocus
              />
              <Icon
                type="FontAwesome"
                name="pencil"
                onPress={() => { editingTitle({ titleEditing: true }); }}
                style={Styles.pencilIcon}
              />
            </View>
            <View
              style={Styles.totalDuration}
            >
              <Label font16 weightBold white style={{ marginLeft: 10 }}>
                {totalDuration}
              </Label>
              {
                titleEditing
                && (
                  <View style={Styles.editButtonContainer}>
                    <ButtonRound
                      onPress={() => cancelEditingTitle()}
                      white
                      style={Styles.editName}
                    >
                      <Label font12 white>Cancel</Label>
                    </ButtonRound>
                    <ButtonRound
                      onPress={() => setTitle()}
                      white
                      style={Styles.editName}
                    >
                      <Label font12 white>Save</Label>
                    </ButtonRound>
                  </View>
                )
              }
            </View>
          </View>
        )}
      </ImageBackground>
    );
  }
}

CardHeader.propTypes = {
  id: PropTypes.number,
  programTitle: PropTypes.string,
  titleEditing: PropTypes.bool,
  totalDuration: PropTypes.string,
  onChangeText: PropTypes.func,
  editingTitle: PropTypes.func,
  cancelEditingTitle: PropTypes.func,
  setTitle: PropTypes.func,
  goBack: PropTypes.func,
  imageSource: PropTypes.any,
  type: PropTypes.string,
  isPhoto: PropTypes.bool,
  hideTittle: PropTypes.bool,
  currentProgram: PropTypes.object,
};

const Styles = {
  editButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "70%"
  },
  button: {
    width: (appWidth - 80) / 2 - 15,
    borderRadius: 4
  },
  editName: {
    backgroundColor: "transparent",
    borderWidth: 1,
    borderColor: "white",
    height: 30
  },
  cardInfo: {
    position: "absolute",
    bottom: 0,
    left: 0,
    paddingLeft: 10,
    width: "100%"
  },
  programText: {
    fontSize: 30,
    paddingVertical: 5,
    paddingHorizontal: 10,
    fontWeight: "bold",
    borderRadius: 50,
    color: Colors.white,
    marginBottom: 10,
    maxWidth: "75%"
  },
  pencilIcon: {
    fontSize: 20,
    right: 0,
    marginRight: 50,
    color: "white"
  },
  totalDuration: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 15,
    marginRight: 15
  },
  cardView: {
    flexDirection: "row",
    alignItems: "center"
  }
};
