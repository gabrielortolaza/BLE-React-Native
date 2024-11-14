import React, { useState, useEffect } from "react";
import {
  FlatList, StyleSheet, TouchableOpacity,
  View, KeyboardAvoidingView, Platform,
  Keyboard, TouchableWithoutFeedback
} from "react-native";
import Modal from "react-native-modal";
import PropTypes from "prop-types";

import { ButtonRound, Label } from ".";
import { Colors } from "../../Themes";
import PumpingTag from "./PumpingTag";
import { PUMPING_TAGS } from "../../Config/constants";
import PumpingCategoryModal from "./PumpingCategoryModal";
import FocusableLabel from "./FocusableLabel";
import Icon from "./Icon";

const minTags = 1;
const maxTags = 3;

function PlShareModal(props) {
  const {
    isVisible, onPressConfirm, onPressDeny,
    title, preSelectedTags = [], programDescription
  } = props;
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const initProgramTags = JSON.parse(JSON.stringify(PUMPING_TAGS));

  const [programTags, setProgramTag] = useState(initProgramTags);
  const [description, setDescription] = useState(programDescription);
  const descriptionTooLong = description && (typeof description === "string") && description.length > 50;

  const preSelectedTagsCount = preSelectedTags.length;
  const [selectedAdequate, setSelectedAdequate] = useState(
    !!(preSelectedTagsCount >= minTags && preSelectedTagsCount <= maxTags)
  );

  useEffect(() => {
    for (let i = 0; i < programTags.length; i++) {
      if (preSelectedTags.indexOf(programTags[i].id) > -1) {
        programTags[i].isSelected = true;
      }
    }

    setProgramTag([...programTags]);
  }, []);

  const handleChange = (id, callback) => {
    let tagCount = 0;

    const temp = programTags.map((item) => {
      if (id === item.id) {
        if (!item.isSelected) {
          tagCount += 1;
        }

        return { ...item, isSelected: !item.isSelected };
      }

      if (item.isSelected) {
        tagCount += 1;
      }

      return item;
    });

    if (tagCount > maxTags) { return; }

    callback(temp);

    setSelectedAdequate(!!(tagCount >= minTags && tagCount <= maxTags));
  };

  const share = () => {
    if (!selectedAdequate || descriptionTooLong) return;

    const selectedTags = [];

    for (let i = 0; i < programTags.length; i++) {
      if (programTags[i].isSelected) {
        selectedTags.push(programTags[i].id);
      }
    }

    onPressConfirm({ selectedTags, description });
  };

  return (
    <Modal
      isVisible={isVisible}
      style={styles.bottomHalfModal}
      onBackdropPress={() => onPressDeny()}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "android" ? "height" : undefined}
      >
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
        >
          <View
            style={styles.container}
          >
            <View style={styles.titleWrapper}>
              <Label grey font18>
                Share
                {` ${title}`}
              </Label>
              <TouchableOpacity
                onPress={() => onPressDeny()}
              >
                <Icon
                  type="Ionicons"
                  name="close-outline"
                  style={styles.closeIcon}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.descriptionView}>
              <Label font16 weightBold>Short description</Label>
              {descriptionTooLong ? (
                <View style={styles.warningDescription}>
                  <Label red font12 maxFontSizeMultiplier={1}>Description is too long</Label>
                  <Icon name="information-circle-outline" style={styles.warningIcon} />
                </View>
              ) : <View />}
              <FocusableLabel
                onChangeText={(value) => setDescription(value)}
                returnKeyType="next"
                value={description}
                input
                multiline
                maxLength={50}
                style={styles.descriptionInput}
                blurOnSubmit
              />
            </View>
            <Label grey font16 weightBold style={styles.categoryLabel}>
              Tags
            </Label>
            <View style={styles.programTags}>
              <Label font14 maxFontSizeMultiplier={1.1}>
                By type of program
              </Label>
              <TouchableOpacity
                onPress={() => setShowCategoryModal(true)}
                styles={styles.infoView}
              >
                <Icon
                  name="information-circle-outline"
                  style={styles.infoIcon}
                />
              </TouchableOpacity>
              <View
                style={styles.requiredCont}
              >
                <Label
                  weightBold
                  font13
                  numberOfLines={1}
                  maxFontSizeMultiplier={1}
                  style={styles.requiredText}
                >
                  required
                </Label>
              </View>
            </View>
            <Label font14 lightGrey2 style={styles.typeDescription} maxFontSizeMultiplier={1.1}>
              Choose at least 1 and a maximum of 3 options
            </Label>
            <FlatList
              data={programTags}
              numColumns={2}
              renderItem={({ item }) => (
                <PumpingTag
                  id={item.id}
                  label={item.label}
                  isSelected={item.isSelected}
                  onPress={(id) => handleChange(id, setProgramTag)}
                />
              )}
              keyExtractor={(item) => item.id}
            />
            <View style={styles.buttonContainer}>
              <ButtonRound
                style={styles.cancelButton}
                bordered
                light
                onPress={onPressDeny}
              >
                <Label lightGrey2>Cancel</Label>
              </ButtonRound>
              <ButtonRound
                style={styles.shareButton}
                blue={!!selectedAdequate && !descriptionTooLong}
                lightGrey2={!selectedAdequate || !!descriptionTooLong}
                onPress={share}
              >
                <Label white>Add Tags & Share</Label>
              </ButtonRound>
            </View>
          </View>
        </TouchableWithoutFeedback>
        <PumpingCategoryModal
          isVisible={showCategoryModal}
          onClose={() => setShowCategoryModal(false)}
        />
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bottomHalfModal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  container: {
    minHeight: 200,
    paddingHorizontal: 25,
    paddingVertical: 30,
    backgroundColor: "white",
    borderRadius: 20,
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  closeIcon: {
    color: Colors.lightGrey2,
    fontSize: 24,
  },
  descriptionView: {
    marginTop: 15
  },
  descriptionInput: {
    width: 280,
    height: 100,
    marginTop: 10
  },
  typeDescription: {
    marginVertical: 10
  },
  programTags: {
    flexDirection: "row",
    alignItems: "center"
  },
  warningDescription: {
    flexDirection: "row",
    alignItems: "center"
  },
  warningIcon: {
    color: Colors.red,
    fontSize: 15,
    marginLeft: 5
  },
  requiredCont: {
    backgroundColor: Colors.lightBlue,
    borderRadius: 8,
    maxWidth: 120,
    marginLeft: 5
  },
  requiredText: {
    paddingHorizontal: 10,
    paddingVertical: 4
  },
  infoView: {
    padding: 8
  },
  infoIcon: {
    fontSize: 25,
    marginLeft: 5
  },
  categoryLabel: {
    marginTop: 10,
    marginBottom: 16,
  },
  buttonContainer: {
    marginTop: 16,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  cancelButton: {
    width: "35%",
  },
  shareButton: {
    width: "60%"
  }
});

PlShareModal.propTypes = {
  title: PropTypes.string,
  programDescription: PropTypes.string,
  preSelectedTags: PropTypes.array,
  isVisible: PropTypes.bool,
  onPressConfirm: PropTypes.func,
  onPressDeny: PropTypes.func,
};

export default PlShareModal;
