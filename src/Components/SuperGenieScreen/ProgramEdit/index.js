import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View, ScrollView, BackHandler, Switch,
  Platform, Image, TouchableOpacity
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import firebase from "@react-native-firebase/app";
import { connect } from "react-redux";
import Carousel from "react-native-reanimated-carousel";

import {
  addMessage, setCurrentProgram, setCurrentSession,
  deleteProgram, updateImageCard,
} from "../../../Actions";
import PumpStatusHeader from "../../Shared/AppHeader/PumpStatusHeader";
import ProgramCard from "../../Shared/ProgramCard";
import ConfirmationToast from "../../Shared/ConfirmationToast";
import PumpingCategoryModal from "../../Shared/PumpingCategoryModal";
import Label from "../../Shared/Label";
import SegmentInfo from "../../Shared/SegmentInfo";
import InputField from "../../Shared/InputField";
import ButtonRound from "../../Shared/ButtonRound";
import { Colors } from "../../../Themes";
import {
  EMPTY_PROGRAM, EMPTY_SESSION, PUMPING_TAGS, PUMP_TYPE,
} from "../../../Config/constants";
import * as M from "../../../Config/messages";
import PumpingTag from "../../Shared/PumpingTag";
import Header from "../../Shared/AppHeader/Header";
import { SelectPhoto } from "../../Shared";
import RequiredLabel from "../../Shared/RequiredLabel";
import styles from "./styles";
import { addOriginalIndex, appWidth } from "../../../Services/SharedFunctions";
import Container from "../../Shared/Container";
import Icon from "../../Shared/Icon";
import MultilineInput from "../../Shared/MultilineInput";

const maxProgramDescriptionLength = 255;
const maxProgramNameLength = 50;

class ProgramEdit extends Component {
  constructor(props) {
    super(props);
    const { pump } = props;
    const { currentProgram, imageCard } = pump;

    const {
      name, duration, tags, pumpName, description
    } = currentProgram;

    const selectedTags = PUMPING_TAGS.map((item) => ({
      ...item,
      isSelected: tags?.includes(item.id),
    }));

    // if it is from manual run, need to remove empty steps
    currentProgram.steps = (currentProgram.steps || []).filter((s) => s?.duration > 0);
    const currentProgramSteps = addOriginalIndex(currentProgram);
    console.log(JSON.stringify(currentProgramSteps), "Initial programSteps:", currentProgram);

    const programTitle = name;
    const pumpTypeSelected = pumpName || PUMP_TYPE[0].key;
    const isProgramPrivate = true;
    const imageData = imageCard[`programRunImage${currentProgram.id}`];

    this.state = {
      originalData: {
        programTitle,
        description,
        pumpTypeSelected,
        selectedTags,
        isProgramPrivate,
        imageData,
        steps: currentProgram.steps,
      },
      description,
      programTitle,
      shouldDelete: false,
      shouldBack: false,
      isNewProgram: duration === 0,
      currentProgramSteps,
      didFocus: false,
      isProgramPrivate,
      showCategoryModal: false,
      showPublicAlert: false,
      pumpTypeSelected,
      selectedTags,
      imageData,
    };
  }

  componentDidMount() {
    const { navigation, pump } = this.props;
    const { currentProgram } = pump;

    this.setState({
      description: currentProgram.description
    });

    this.addEmptySession();

    // Detect back button
    BackHandler.addEventListener("hardwareBackPress", () => {
      return true;
    });

    this.didFocusSubscription = navigation.addListener(
      "focus",
      () => {
        const { didFocus, openedEdit } = this.state;
        console.debug("didFocus ProgramEdit");
        if (didFocus) {
          // Refresh to look for pause program
          setTimeout(() => {
            const { pump } = this.props;
            const { currentProgram } = pump;

            this.refreshSteps();

            setTimeout(() => {
              if (this._carousel) {
                if (!openedEdit) {
                  this._carousel.scrollTo({
                    index: currentProgram.steps.length >= 2
                      ? currentProgram.steps.length - 2
                      : currentProgram.steps.length - 1
                  });
                } else { this.setState({ openedEdit: false }); }
              }
            }, 1000);
          }, 100);
        } else {
          this.setState({ didFocus: true });
        }
      }
    );
  }

  componentWillUnmount() {
    this.didFocusSubscription();
  }

  refreshSteps = () => {
    const { pump } = this.props;
    const { currentProgram } = pump;

    const currentProgramSteps = addOriginalIndex(currentProgram);
    const { pauses } = currentProgram;

    if (pauses) {
      console.log("Jello");
      // If pause exists in current program

      // Add to steps and setState
      // Sort object keys
      const newVal = {};
      Object.keys(pauses).sort().forEach((key) => {
        newVal[key] = pauses[key];
      });

      Object.keys(newVal).forEach((key) => {
        currentProgramSteps.splice(key, 0, {
          index: key,
          duration: newVal[key].duration,
          pause: true
        });
      });
      // Correct all indexes
      for (let i = 0; i < currentProgramSteps.length; i++) {
        currentProgramSteps[i].index = i;
      }
    }

    console.log("currentProgramSteps: ", currentProgramSteps);

    // Validate session
    const newCurrentProgramSteps = [];
    let foundIncorrectSession = false;
    currentProgramSteps.map((item) => {
      if (item.duration === 0 && item.index && item.index < (currentProgramSteps.length - 1)) {
        console.log("found incorrect session::");
        // this is incorrect session and so need to remove
        foundIncorrectSession = true;
        return;
      }
      if (foundIncorrectSession && item.index) {
        // if found incorrect session, need to change session index from next session
        item.index -= 1;
        newCurrentProgramSteps.push(item);
      } else {
        newCurrentProgramSteps.push(item);
      }
    });

    if (newCurrentProgramSteps.length > 0
      && newCurrentProgramSteps[newCurrentProgramSteps.length - 1].duration !== 0) {
      newCurrentProgramSteps.push(EMPTY_SESSION);
    }
    this.setState({ currentProgramSteps: newCurrentProgramSteps });
  };

  addEmptySession = () => {
    const { pump, addMessage, setCurrentProgram } = this.props;
    const { currentProgram } = pump;
    const { currentProgramSteps } = this.state;

    console.log("current program", currentProgram);
    const lastStep = currentProgram.steps[currentProgram.steps.length - 1];
    if (lastStep?.duration === 0) return;
    if (currentProgram.steps.length > 24) {
      addMessage(M.ERROR_SAVE_PROGRAM_25_STEPS);
      return;
    }
    setCurrentProgram(
      { ...currentProgram, steps: [...currentProgram.steps, EMPTY_SESSION] }
    );

    AsyncStorage.getItem("program-pause").then((val) => {
      if (val) {
        const newVal = JSON.parse(val);
        // If pause exists in current program
        if (Object.prototype.hasOwnProperty.call(newVal, currentProgram.id)) {
          setCurrentProgram({ ...currentProgram, pauses: newVal[currentProgram.id] });
          // Add to steps and setState
          Object.keys(newVal[currentProgram.id]).forEach((key) => {
            currentProgramSteps.splice(key, 0, {
              index: key,
              duration: newVal[currentProgram.id][key].duration,
              pause: true
            });
          });
          // Correct all indexes
          for (let i = 0; i < currentProgramSteps.length; i++) {
            currentProgramSteps[i].index = i;
          }
        }
      }

      // Add empty
      currentProgramSteps.push(EMPTY_SESSION);
      this.setState({ currentProgramSteps });
    });
  };

  reviewProgram = () => {
    const {
      pump, navigation, addMessage,
      setCurrentProgram, route
    } = this.props;
    const { currentProgram } = pump;
    const { action } = route.params;
    const {
      selectedTags, isProgramPrivate, pumpTypeSelected,
      programTitle, currentProgramSteps, description,
      imageData, isNewProgram
    } = this.state;

    if (currentProgram.steps.filter((p) => p.duration > 0).length === 0) {
      addMessage(M.NOTHING_SAVE);
      return;
    }

    const { pauses } = currentProgram;

    if (pauses) {
      // If pause step exists in the program
      if (pauses[0]) {
        addMessage(M.NOT_PAUSE_STEP_AS_FIRST);
        return;
      }

      let pauseKeysArr = Object.keys(pauses);
      pauseKeysArr = pauseKeysArr.map((x) => parseInt(x, 10));

      const cpSteps = currentProgram.steps;
      // If last step duration is an empty step
      const unusedStep = cpSteps[cpSteps.length - 1].duration === 0 ? 1 : 0;

      // eslint-disable-next-line no-unused-vars, no-restricted-syntax
      for (const key of Object.keys(pauses)) {
        if (parseInt(key, 10) >= (currentProgram.steps.length
          - (1 + unusedStep) + pauseKeysArr.length)) {
          addMessage(M.NOT_PAUSE_STEP_AS_LAST);
          return;
        }

        if (pauseKeysArr.indexOf(parseInt(key, 10) + 1) > -1
          || pauseKeysArr.indexOf(parseInt(key, 10) - 1) > -1) {
          addMessage(M.NOT_CONSECUTIVE_PAUSE_STEP);
          return;
        }
      }
    }

    setCurrentProgram({ ...currentProgram, name: programTitle });

    navigation.navigate("ProgramReview", {
      selectedTags: selectedTags.filter((item) => item.isSelected),
      isProgramPrivate,
      pumpTypeSelected,
      programDescription: description,
      currentProgramSteps,
      imageData,
      action,
      isEditing: !isNewProgram
    });
  };

  getCorrectIndex = (selectedStep) => {
    const { currentProgramSteps } = this.state;
    const modifiedProgram = [];
    for (let i = 0; i < currentProgramSteps.length; i++) {
      if (!(currentProgramSteps[i].pause)) {
        modifiedProgram.push(currentProgramSteps[i]);
      }
    }
    return modifiedProgram.indexOf(selectedStep);
  };

  onEditStep = (index) => () => {
    const { setCurrentSession, navigation } = this.props;
    const { currentProgramSteps, pumpTypeSelected } = this.state;

    const selectedProgram = currentProgramSteps[index];
    const editingStep = selectedProgram.duration === 0 ? false : (selectedProgram.pause ? "pause" : "normal");
    console.log("Check:", currentProgramSteps, index);

    if (selectedProgram.pause) {
      // Pause step selected
      setCurrentSession({ ...selectedProgram, index, modifiedIndex: index });
      navigation.navigate("ProgramEditSession", {
        stepDuration: selectedProgram.duration,
        stepPause: true,
        currentProgramSteps,
        editingStep,
        pageIndex: index,
        pumpTypeSelected
      });
    } else {
      const newIndex = this.getCorrectIndex(selectedProgram);
      delete selectedProgram.originalIndex;
      setCurrentSession({ ...selectedProgram, index: newIndex, modifiedIndex: index });
      const { vacuum, cycle, duration } = selectedProgram;
      navigation.navigate("ProgramEditSession", {
        stepVacuum: vacuum,
        stepCycle: cycle,
        stepDuration: duration,
        currentProgramSteps,
        editingStep,
        pageIndex: index,
        pumpTypeSelected
      });
    }

    // Log for snapping carousel to correct position
    this.setState({ openedEdit: true });

    firebase.analytics().logEvent("Edit_step_via_program_edit");
  };

  onReorderStep = (index, dir) => {
    const { pump, setCurrentProgram, addMessage } = this.props;
    const { currentProgram } = pump;
    const { steps, pauses } = currentProgram;
    const { currentProgramSteps } = this.state;

    const selectedProgram = currentProgramSteps[index];

    // Validation
    if (index === 0 && dir === "left") { return; }
    if (index === (currentProgramSteps.length - 2) && dir === "right") { return; }

    const mixedRight = dir === "right" && !selectedProgram.pause && currentProgramSteps[index + 1] && currentProgramSteps[index + 1].pause;
    const mixedLeft = dir === "left" && !selectedProgram.pause && currentProgramSteps[index - 1] && currentProgramSteps[index - 1].pause;

    if (selectedProgram.pause) {
      // If pause object was selected
      const reorderPauseStep = pauses[index];

      if (dir === "right") {
        if (pauses[index + 1]) {
          addMessage(M.NOT_SWAP_PAUSE_STEP);
          return;
        }
        pauses[index + 1] = reorderPauseStep;
      } else {
        if (pauses[index - 1]) {
          addMessage(M.NOT_SWAP_PAUSE_STEP);
          return;
        }
        pauses[index - 1] = reorderPauseStep;
      }

      delete pauses[index];
    } else if (mixedLeft || mixedRight) {
      // Reordering between normal and pause step
      if (mixedRight) {
        // If pause step is at the right of normal step
        const reorderPauseStep = pauses[index + 1];
        delete pauses[index + 1];

        pauses[index] = reorderPauseStep;
      } else {
        // If pause step is at the left of normal step
        const reorderPauseStep = pauses[index - 1];
        delete pauses[index - 1];

        pauses[index] = reorderPauseStep;
      }
    } else {
      // Reordering between normal steps
      const correctIndex = this.getCorrectIndex(selectedProgram);
      const reorderedStep = steps[correctIndex];
      if (dir === "right") {
        steps.splice([correctIndex + 2], 0, reorderedStep);
        steps.splice([correctIndex], 1);
      } else {
        steps.splice([correctIndex], 1);
        steps.splice([correctIndex - 1], 0, reorderedStep);
      }
      // Correct index
      steps.forEach((x, index) => {
        x.index = index;
      });
    }

    setCurrentProgram({ ...currentProgram, steps });
    this.refreshSteps();
    // Snap carousel
    setTimeout(() => {
      const { currentProgramSteps } = this.state;
      if (this._carousel) {
        const snapIndex = index + (dir === "right" ? 1 : -1);
        currentProgramSteps[snapIndex] && this._carousel.scrollTo({ index: snapIndex });
      }
    }, 500);
    firebase.analytics().logEvent("Reorder_step_via_program_edit");
  };

  onDeleteStep = (index) => () => {
    const { pump, setCurrentProgram } = this.props;
    const { currentProgram } = pump;
    const { steps, pauses } = currentProgram;
    const { currentProgramSteps } = this.state;

    const selectedStep = currentProgramSteps[index];
    console.log("selected:", selectedStep, steps);

    if (selectedStep.pause) {
      // If pause object
      delete pauses[index];
    } else {
      const correctIndex = this.getCorrectIndex(selectedStep);
      steps.splice([correctIndex], 1);
      // Correct index
      steps.forEach((x, index) => {
        x.index = index;
      });
      if (pauses) {
        // Correct all pause step indexes after deleted index point
        Object.keys(pauses).forEach((key) => {
          if (index < key) {
            // If index being deleted is less than pause index,
            // shift the pause index
            // Assumes no 2 pause steps are side by side
            const newKey = key - 1;
            if (newKey !== 0 && !pauses[newKey - 1]) {
              // Pause step cannot be at index 0 or be side by side
              pauses[key - 1] = pauses[key];
            }
            delete pauses[key];
          }
        });
      }
    }

    setCurrentProgram({ ...currentProgram, steps });
    this.refreshSteps();
    firebase.analytics().logEvent("Delete_step_via_program_edit");
  };

  deleteProgram = () => {
    this.setState({ shouldDelete: true });
  };

  onConfirmDelete = () => {
    const { pump, navigation, deleteProgram } = this.props;
    const { currentProgram, programs } = pump;

    this.setState({ shouldDelete: false });

    deleteProgram(currentProgram.id, programs);
    this.removeProgramImageFromStorage();
    this.initCurrentProgram();
    navigation.goBack();
  };

  onDenyDelete = () => this.setState({ shouldDelete: false });

  goBack = () => {
    const { pump, navigation, route } = this.props;
    const { currentProgram } = pump;
    const { action } = route.params;
    const {
      originalData, programTitle, description,
      pumpTypeSelected, selectedTags, isProgramPrivate,
      imageData,
    } = this.state;

    let hasBeenEdited = false;

    const newData = {
      programTitle,
      description,
      pumpTypeSelected,
      selectedTags,
      isProgramPrivate,
      imageData,
      steps: (currentProgram.steps || []).filter((s) => s?.duration > 0),
    };

    if (JSON.stringify(newData) !== JSON.stringify(originalData)
      || ((action === "create" || action === "record") && imageData)) {
      hasBeenEdited = true;
    }

    if (!hasBeenEdited) {
      this.initCurrentProgram();
      if (action === "record") {
        navigation.pop(2);
      } else {
        navigation.goBack();
      }
    } else {
      this.setState({ shouldBack: true });
    }
  };

  onDenySave = () => {
    const { navigation, route } = this.props;
    const { action } = route.params;

    this.setState({ shouldBack: false });

    this.initCurrentProgram();

    if (action === "record") {
      navigation.pop(2);
    } else {
      navigation.goBack();
    }
  };

  initCurrentProgram = () => {
    const { setCurrentProgram } = this.props;
    setCurrentProgram({ ...EMPTY_PROGRAM, steps: [EMPTY_SESSION] });
  };

  removeProgramImageFromStorage = () => {
    const { pump, updateImageCard } = this.props;
    const { imageCard, currentProgram } = pump;

    imageCard[`programRunImage${currentProgram.id}`] = null;
    updateImageCard(imageCard);
    AsyncStorage.removeItem(`programRunImage${currentProgram.id}`);
  };

  handleTagChange = (id) => {
    const { selectedTags } = this.state;
    const temp = selectedTags.map((item) => {
      if (id === item.id) {
        return { ...item, isSelected: !item.isSelected };
      }
      return item;
    });
    const st = temp.filter((item) => item.isSelected);
    if (st.length < 4) {
      this.setState({ selectedTags: temp });
    }
  };

  render() {
    const { pump, route } = this.props;
    const { currentProgram } = pump;
    const {
      currentProgramSteps, isProgramPrivate,
      selectedTags, programTitle, shouldDelete,
      pumpTypeSelected, shouldBack, showPublicAlert,
      showCategoryModal, isNewProgram, description,
      imageData,
    } = this.state;
    const { action } = route.params;

    const margin = appWidth < 360 ? 20 : 25;
    const itemSpacing = appWidth - ((130 + margin) * 2);

    return (
      <Container noScroll edges={["top", "bottom"]}>
        <PumpStatusHeader />
        <Header
          leftActionText={(action === "create" || action === "record") ? "Setup a program" : "Edit program"}
          leftActionEvent={() => this.goBack()}
        />
        <ScrollView style={styles.scrollContainer}>
          <RequiredLabel text="Choose Pump" />
          <SegmentInfo
            data={PUMP_TYPE}
            onChange={(val) => {
              if (!isNewProgram) return; // Pumps have different vac/cyc ranges
              this.setState({ pumpTypeSelected: val });
            }}
            active={pumpTypeSelected}
            activeColor={Colors.lightBlue}
            inactiveColor={Colors.white}
            style={styles.segmentInfo}
          />

          <View style={styles.divider} />
          <RequiredLabel text="Add Steps" />
          <Label font14 weightSemiBold lightGrey2>
            Customize your pump program to what works best for you by adding,
            removing or editing steps.
          </Label>

          <Carousel
            loop={false}
            style={styles.carousel}
            width={170 + itemSpacing}
            height={220}
            data={currentProgramSteps}
            ref={(c) => { this._carousel = c; }}
            renderItem={({ item, index }) => (
              <ProgramCard
                editStep={this.onEditStep(index)}
                deleteStep={this.onDeleteStep(index)}
                reorderStep={(dir) => this.onReorderStep(index, dir)}
                index={index}
                programLength={currentProgramSteps.length}
                programData={item}
              />
            )}
          />

          <View style={styles.divider} />
          <View style={styles.switchView}>
            <Label font16>Private</Label>
            <Switch
              trackColor={{ true: Colors.windowsBlue, false: null }}
              thumbColor={Platform.OS === "android" ? "#F1F1F1" : null}
              onValueChange={(val) => {
                if (!val) {
                  this.setState({ showPublicAlert: true });
                }
                this.setState({ isProgramPrivate: val });
              }}
              value={isProgramPrivate}
            />
          </View>
          <Label font14 weightSemiBold lightGrey2>
            If deselected, the program will be shared in public
            library as well as in your own list.
          </Label>

          <View style={styles.divider} />
          <RequiredLabel text="Name" />
          <InputField
            testID="name-input"
            onChangeText={(value) => this.setState({ programTitle: value })}
            returnKeyType="next"
            value={programTitle}
            maxLength={maxProgramNameLength}
            style={styles.nameInput}
            placeholder="New Program #1"
          />
          <View style={styles.descriptionView}>
            <Label font16>Short description</Label>
            <MultilineInput
              onChangeText={(value) => this.setState({ description: value })}
              returnKeyType="next"
              value={description}
              maxLength={maxProgramDescriptionLength}
              style={styles.descriptionInput}
              placeholder="Example: evening pump"
              error={
                description?.length > maxProgramDescriptionLength
                  ? `Maximum short desc ${maxProgramDescriptionLength} characters`
                  : ""
              }
            />
          </View>
          <View style={styles.divider} />
          <View style={styles.tagInfo}>
            <Label font16>
              Add Tags
            </Label>
            <TouchableOpacity
              style={styles.infoBtn}
              onPress={() => this.setState({ showCategoryModal: true })}
            >
              <Icon name="information-circle-outline" style={styles.infoIcon} />
            </TouchableOpacity>
          </View>
          {selectedTags && (
            <View style={styles.tagContainer}>
              {selectedTags.map((item) => (
                <PumpingTag
                  key={item.id}
                  id={item.id}
                  label={item.label}
                  isSelected={item.isSelected}
                  onPress={(id) => this.handleTagChange(id)}
                />
              ))}
            </View>
          )}

          <View style={styles.divider} />
          <Label font16 mb10>
            Upload picture
          </Label>
          <View style={styles.privacyContainer}>
            <Icon
              name="eye-off"
              type="Feather"
              style={styles.privacyIcon}
            />
            <Label font14 weightSemiBold style={styles.privacyText}>
              For privacy reasons, all programs pics will be
              replaced with default images upon upload to
              Pumpables Library.
            </Label>
          </View>
          <View style={styles.photoView}>
            {imageData ? (
              <Image source={{ uri: imageData }} style={styles.programImage} />
            ) : (
              <SelectPhoto
                positionStyle={styles.selectPhoto}
                // type={`programRunImage${currentProgram.id}`}
                isPhoto
                event="Program_edit_image_selection"
                updateImageUrl={(v) => this.setState({ imageData: v })}
              />
            )}
            <View style={styles.removeContainer}>
              {imageData && (
                <TouchableOpacity
                  style={styles.removeWrapper}
                  onPress={() => {
                    this.setState({ imageData: null });
                  }}
                >
                  <Icon type="Ionicons" name="close" style={styles.removeIcon} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          {(action !== "create" && action !== "record") ? (
            <TouchableOpacity style={styles.deleteProgram} onPress={this.deleteProgram}>
              <Icon type="MaterialIcons" name="delete" style={styles.deleteIcon} />
              <Label red font14 underline>
                Delete Program
              </Label>
            </TouchableOpacity>
          ) : <View />}

          <View style={styles.buttonsView}>
            <ButtonRound
              testID="createProgram_cancel"
              bordered
              style={styles.cancelButtons}
              onPress={this.goBack}
            >
              <Label weightBold lightGrey2 font16>Cancel</Label>
            </ButtonRound>
            <ButtonRound
              testID="createProgram_create"
              blue
              style={styles.createButtons}
              disabled={currentProgram.steps.filter((p) => p.duration > 0).length === 0}
              onPress={this.reviewProgram}
            >
              <Label weightBold white font16>Next</Label>
            </ButtonRound>
          </View>

          {shouldDelete && (
            <ConfirmationToast
              title={M.CONFIRM_DELETE_PROGRAM}
              subtitle=""
              onPressConfirm={this.onConfirmDelete}
              onPressDeny={this.onDenyDelete}
            />
          )}
          {shouldBack && (
            <ConfirmationToast
              title="Are you sure?"
              subtitle={M.CONFIRM_SAVE_CHANGES}
              option1="Yes, I’m sure"
              option2="Cancel"
              onPressDeny={this.onDenySave}
              onPressConfirm={() => { this.setState({ shouldBack: false }); }}
            />
          )}
          {showPublicAlert && (
            <ConfirmationToast
              isOneOptionModal
              title="Sharing program to Pumpables Library"
              subtitle="Once this program is shared to Pumpables Library, out of consideration for the community, it cannot be changed or removed!"
              option1="OK"
              onPressConfirm={() => this.setState({ showPublicAlert: false })}
            />
          )}
          {showCategoryModal && (
            <PumpingCategoryModal
              isVisible={showCategoryModal}
              onClose={() => this.setState({ showCategoryModal: false })}
            />
          )}
        </ScrollView>
      </Container>
    );
  }
}

const mapStateToProps = ({ pump }) => {
  return { pump };
};

const mapDispatchToProps = {
  setCurrentProgram,
  setCurrentSession,
  deleteProgram,
  addMessage,
  updateImageCard,
};

export default connect(mapStateToProps, mapDispatchToProps)(ProgramEdit);

ProgramEdit.propTypes = {
  pump: PropTypes.object,
  navigation: PropTypes.object,
  setCurrentProgram: PropTypes.func,
  setCurrentSession: PropTypes.func,
  deleteProgram: PropTypes.func,
  addMessage: PropTypes.func,
  updateImageCard: PropTypes.func,
  route: PropTypes.object,
};
