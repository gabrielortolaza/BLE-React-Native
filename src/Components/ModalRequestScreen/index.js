import React, { PureComponent } from "react";
import {
  TextInput, View, KeyboardAvoidingView,
  Keyboard, TouchableOpacity, FlatList,
  ScrollView, Platform
} from "react-native";
import PropTypes from "prop-types";
import firebase from "@react-native-firebase/app";
import { connect } from "react-redux";
import { pick } from "react-native-document-picker";
import ImagePicker from "react-native-image-crop-picker";
import * as RNFS from "react-native-fs";

import { Colors, Fonts } from "../../Themes";
import StyleSheet from "../../Proportional";
import {
  ButtonRound, Label, ModalWrapper, Welcome
} from "../Shared";
import { addMessage } from "../../Actions";
import { submitFeedback } from "../../Actions/Auth";
import Icon from "../Shared/Icon";
import SelectedFile from "../Shared/SelectedFile";
import { ERROR_SELECTING_FILE } from "../../Config/messages";
import BottomSelectModal from "../Shared/BottomSelectModal";
import { convertImagePickerResToDocPicker } from "../../Services/SharedFunctions";

const PHOTO_KEY = "photos";
const FILE_KEY = "files";

const iosPickOptions = [
  {
    key: PHOTO_KEY,
    name: "Photos",
    icon: "filter",
    iconType: "MaterialIcons"
  },
  {
    key: FILE_KEY,
    name: "Files",
    icon: "insert-drive-file",
    iconType: "MaterialIcons"
  }
];

class RequestScreen extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      requestText: "",
      disableSendBtn: false,
      pickedFiles: [],
      openIosPickOptions: false
    };
  }

  componentDidMount() {
    firebase.analytics().logEvent("request_open");
  }

  componentWillUnmount() {
    firebase.analytics().logEvent("request_close");
  }

  pickFiles = async () => {
    const { addMessage } = this.props;
    const { pickedFiles } = this.state;
    const [pickResult] = await pick({ copyTo: "documentDirectory" });

    if (!pickResult.fileCopyUri) {
      addMessage(ERROR_SELECTING_FILE);
      return;
    }

    this.setState({ pickedFiles: [...pickedFiles, pickResult] });
  };

  deleteCopiedPickedFiles = (item) => {
    const { pickedFiles } = this.state;

    const items = item ? [item] : pickedFiles;
    for (let i = 0; i < items.length; i++) {
      RNFS.exists(items[i].fileCopyUri)
        .then(() => {
          if (Platform.OS !== "ios") {
            RNFS.unlink(items[i].fileCopyUri);
          }
        });
    }

    if (!item) {
      this.setState({ pickedFiles: [] });
    }
  };

  removePickedFile = (item) => {
    const { pickedFiles } = this.state;

    this.setState({
      pickedFiles: pickedFiles.filter((x) => x.uri !== item.uri)
    });
    this.deleteCopiedPickedFiles(item);
  };

  submit = async () => {
    const { submitFeedback, addMessage } = this.props;
    const { requestText, pickedFiles } = this.state;
    const { uid } = firebase.auth().currentUser;

    this.setState({ disableSendBtn: true });

    // First check if it exceeds file size limit
    let filesTotalSize = 0;
    for (let i = 0; i < pickedFiles.length; i++) {
      filesTotalSize += pickedFiles[i].size;
      pickedFiles[i].firebasePath = `/Pumpables/Feedback/${uid}/${pickedFiles[i].name}`;
    }

    if (filesTotalSize > 30000000) {
      addMessage("Error: Total file size exceeds 30mb");
      this.setState({ disableSendBtn: false });
      return;
    }

    // Upload files
    let filesTextToAddToFeedback = "";
    const asyncResults = [];
    for (let i = 0; i < pickedFiles.length; i++) {
      asyncResults.push(
        firebase
          .storage()
          .ref(pickedFiles[i].firebasePath)
          .putFile(
            pickedFiles[i].fileCopyUri
          )
      );

      filesTextToAddToFeedback = filesTextToAddToFeedback.concat(
        `\nFile ${i + 1} of ${pickedFiles.length} uploaded here: ${pickedFiles[i].firebasePath}.`
      );
    }

    await Promise.all(asyncResults);

    Keyboard.dismiss();
    submitFeedback(requestText.concat(filesTextToAddToFeedback));
    this.deleteCopiedPickedFiles();

    this.setState({
      requestText: "",
      disableSendBtn: false
    });
  };

  choseIosPickOption = async (key) => {
    const { pickedFiles } = this.state;

    this.setState(
      { openIosPickOptions: false },
      () => {
        setTimeout(() => {
          if (key === PHOTO_KEY) {
            ImagePicker.openPicker({
              cropping: false
            })
              .then((image) => {
                const imageRes = convertImagePickerResToDocPicker(image);

                this.setState({ pickedFiles: [...pickedFiles, imageRes] });
              });
          } else {
            this.pickFiles();
          }
        }, 1500);
      }
    );
  };

  render() {
    const { navigation } = this.props;
    const {
      requestText, pickedFiles, disableSendBtn,
      openIosPickOptions
    } = this.state;

    return (
      <ModalWrapper
        back={() => {
          this.deleteCopiedPickedFiles();
          navigation.goBack();
        }}
        bottomBorder
        backIconStyle={styles.backIconStyle}
      >
        <ScrollView style={styles.scrollView}>
          <KeyboardAvoidingView
            style={styles.container}
            contentContainerStyle={styles.kavContainer}
            behavior="position"
          >
            <Welcome
              title="Feedback"
              subtitle="We love your feedback 🙂"
              containerStyle={styles.welcomeContainerStyle}
              titleStyle={styles.titleStyle}
              subtitleStyle={styles.subtitleStyle}
              noMargin
            />
            <View style={styles.request}>
              <TextInput
                style={styles.requestInput}
                multiline
                underlineColorAndroid="transparent"
                placeholder="What would you like to tell us? (10 characters min)"
                placeholderTextColor={Colors.grey}
                value={requestText}
                onChangeText={(text) => this.setState({ requestText: text })}
              />
            </View>
          </KeyboardAvoidingView>
          <Label
            font12
            weightSemiBold
          >
            UPLOAD IMAGE/AUDIO/DOC/VIDEO (MAX 30MB)
          </Label>
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS === "ios") {
                this.setState({ openIosPickOptions: true });
              } else {
                this.pickFiles();
              }
            }}
            style={styles.plusBtn}
          >
            <Icon
              name="add"
              style={styles.plusIcon}
            />
          </TouchableOpacity>
          <FlatList
            data={pickedFiles}
            renderItem={(item) => (
              <SelectedFile
                item={item.item}
                deleteItem={() => this.removePickedFile(item.item)}
              />
            )}
            keyExtractor={(item) => item.uri}
          />
          <ButtonRound
            disabled={
              !requestText || requestText.length < 10 || disableSendBtn
            }
            style={styles.button}
            onPress={this.submit}
          >
            <Label white font18>Send</Label>
          </ButtonRound>
        </ScrollView>
        {openIosPickOptions && (
          <BottomSelectModal
            title="Select from"
            data={iosPickOptions}
            selectedItem={this.choseIosPickOption}
            onClose={() => this.setState({ openIosPickOptions: false })}
          />
        )}
      </ModalWrapper>
    );
  }
}

const styles = StyleSheet.createProportional({
  container: {
    paddingBottom: 15,
    overflow: "hidden"
  },
  scrollView: {
    paddingHorizontal: 25
  },
  welcomeContainerStyle: {
    minHeight: 170
  },
  backIconStyle: {
    color: Colors.grey
  },
  titleStyle: {
    color: Colors.grey
  },
  subtitleStyle: {
    color: Colors.lightGrey3
  },
  kavContainer: {
    overflow: "hidden"
  },
  request: {
    height: 150,
    backgroundColor: Colors.tertiaryLighter,
    borderWidth: 1,
    borderColor: Colors.tertiary,
    padding: 10,
    marginBottom: 10
  },
  requestInput: {
    flex: 1,
    color: Colors.grey,
    ...Fonts.Regular,
    fontSize: 14,
    textAlignVertical: "top"
  },
  button: {
    backgroundColor: Colors.blue,
    alignSelf: "center",
    width: "100%",
    marginVertical: 30
  },
  plusBtn: {
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.backgroundLightGreen,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: Colors.lightBlue,
    height: 40,
    marginBottom: 20,
    marginTop: 8
  },
  plusIcon: {
    color: Colors.lightBlue,
    fontSize: 20
  }
});

RequestScreen.propTypes = {
  submitFeedback: PropTypes.func.isRequired,
  navigation: PropTypes.object,
  addMessage: PropTypes.func
};

const mapDispatchToProps = {
  submitFeedback,
  addMessage
};

export default connect(null, mapDispatchToProps)(RequestScreen);
