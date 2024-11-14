import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View, ScrollView, BackHandler, StyleSheet,
  ImageBackground, TouchableOpacity,
} from "react-native";
import firebase from "@react-native-firebase/app";
import { connect } from "react-redux";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Carousel from "react-native-reanimated-carousel";
import { isIphoneX } from "react-native-iphone-screen-helper";

import ApiProgram from "../../../Http/Program";
import ApiRatings from "../../../Http/Ratings";
import {
  addMessage, savePauseProgram, saveProgram,
  setCurrentProgram, deleteProgram, shareProgramWithFriends,
  duplicateProgram, updateImageCard
} from "../../../Actions";
import PumpingTag from "../../Shared/PumpingTag";
import ProgramCard from "../../Shared/ProgramCard";
import Label from "../../Shared/Label";
import ButtonRound from "../../Shared/ButtonRound";
import StarRatingDisplay from "../../Shared/StarRatingDisplay";
import { Colors, Images } from "../../../Themes";
import {
  addIndexToStepsIfMissing, appWidth, formatProgramSelectionData,
  formatToAPIPauseSteps, getPauseObj, shareToPlBody,
  checkUniqueProgramName
} from "../../../Services/SharedFunctions";
import {
  EMPTY_PROGRAM, OP_STOP, programMoreSelectionData, PROGRAM_LIBRARY_BODY,
  PUMP_DEVICE, PUMP_TYPE
} from "../../../Config/constants";
import { STOP_PLAY_PROGRAM } from "../../../Config/messages";
import SelectionModal from "../../Shared/SelectionModal";
import { ConfirmationToast } from "../../Shared";
import TextMoreBox from "../../Shared/TextMoreBox";
import PlShareModal from "../../Shared/PlShareModal";
import Icon from "../../Shared/Icon";
import Container from "../../Shared/Container";
import ReviewModal from "../../Shared/ReviewModal";
import { REFRESH_PL_LIST } from "../../../Config/LocalStorage";
import * as M from "../../../Config/messages";
import InfoModal from "../../Shared/InfoModal";

class ProgramReview extends Component {
  constructor(props) {
    super(props);
    const { pump, route } = props;
    const { currentProgram } = pump;
    const { plProgram, programDescription } = route.params;
    let { currentProgramSteps } = route.params;

    currentProgramSteps = plProgram ? this.formatPLSteps(plProgram) : currentProgramSteps;

    const lastIndex = currentProgramSteps.length - 1;
    if (currentProgramSteps[lastIndex].duration === 0) {
      currentProgramSteps.splice(lastIndex, 1);
    }

    this.state = {
      programTitle: plProgram ? plProgram.name : currentProgram.name,
      description: plProgram ? plProgram.description : programDescription,
      currentProgramSteps,
      moreModalVisible: false,
      deletingProgram: false,
      showShareToPl: false,
      reviewModalVisible: false,
      reviews: [],
      libProgram: null,
      disableSaveBtn: false,
      showMoreProgDesc: false
    };
  }

  componentDidMount() {
    const { navigation, route } = this.props;
    const { plProgram, isGAPrivateProgram } = route.params;

    this.focusListener = navigation.addListener(
      "focus",
      () => {
        if (plProgram && !isGAPrivateProgram) {
          this.retrieveRatingAndProgram(plProgram.id);
        }
      }
    );

    // Detect back button
    BackHandler.addEventListener("hardwareBackPress", () => {
      return true;
    });
  }

  retrieveRatingAndProgram = async (programId) => {
    const { addMessage } = this.props;
    const { uid } = firebase.auth().currentUser;

    await ApiRatings.retrieveRatings(`?programId=${programId}&userUUID=${uid}`).then(({ results }) => {
      this.setState({
        reviews: results ?? [],
      });
    }).catch(() => addMessage(M.SOMETHING_WRONG));

    // to refresh average rating
    await ApiProgram.filterPrograms(`programID=${programId}`).then(({ results }) => {
      this.setState({ libProgram: results?.[0] });
    }).catch(() => addMessage(M.SOMETHING_WRONG));
  };

  formatPLSteps = (plProgram) => {
    const { steps, pauseSteps } = plProgram;

    // First sort steps by index
    steps.sort((a, b) => a.index - b.index);

    const newSteps = [...steps];

    // Then sort pauseSteps by index too
    pauseSteps.sort((a, b) => a.index - b.index);

    for (let i = 0; i < pauseSteps.length; i++) {
      newSteps.splice(pauseSteps[i].index, 0, {
        index: pauseSteps[i].index,
        duration: pauseSteps[i].duration,
        pause: true
      });
    }

    return newSteps;
  };

  saveProgram = () => {
    const {
      pump, navigation, addMessage,
      auth, route, saveProgram,
      setCurrentProgram, updateImageCard
    } = this.props;
    const { currentProgram, programs, imageCard } = pump;
    const { description } = this.state;

    const { id, pauses } = currentProgram;
    const {
      selectedTags = [], isProgramPrivate, pumpTypeSelected,
      action, imageData, isEditing
    } = route.params;

    this.setState({ disableSaveBtn: true });

    const selectedTagIds = selectedTags.map((tag) => tag.id);
    const pumpName = pumpTypeSelected || PUMP_TYPE[0].key;

    // Add pause steps to PL body
    const pauseSteps = [];
    if (pauses) {
      Object.keys(pauses).forEach((key) => {
        pauseSteps.push({
          index: JSON.parse(key),
          duration: pauses[key].duration
        });
      });
    }

    let steps = JSON.parse(JSON.stringify(currentProgram.steps));
    steps = steps.filter((x) => x.duration !== 0);

    // Create body for upload on API
    const programBody = {
      ...PROGRAM_LIBRARY_BODY,
      userUUID: firebase.auth().currentUser.uid,
      name: currentProgram.name,
      description,
      pumpName,
      tags: selectedTagIds,
      steps: addIndexToStepsIfMissing(steps),
      pauseSteps,
      creatorName: auth.profile?.displayName || "",
    };

    // Save pause and remove any pauses
    AsyncStorage.getItem("program-pause").then((val) => {
      let newVal;
      if (val) {
        newVal = JSON.parse(val);
        newVal[id] = pauses;
      } else {
        newVal = { [id]: pauses };
      }

      const finishSave = () => {
        newVal[id] && savePauseProgram(id, newVal[id]);

        AsyncStorage.setItem("program-pause", JSON.stringify(newVal)).then(async () => {
          delete currentProgram.pauses;
          currentProgram.steps.forEach((x) => {
            if (Object.prototype.hasOwnProperty.call(x, "modifiedIndex")) {
              delete x.modifiedIndex;
            }
            // COMBAK: remove if unnecessary
            if (Object.prototype.hasOwnProperty.call(x, "originalIndex")) {
              x.index = x.originalIndex;
              delete x.originalIndex;
            }
          });

          // Delete unique id because program has been modified
          delete currentProgram.uuid;

          setCurrentProgram({ ...currentProgram });

          // Save to my programs
          saveProgram(
            id,
            {
              ...currentProgram,
              tags: selectedTagIds,
              pumpName,
              description
            },
            isEditing
          );

          const programImage = `programRunImage${currentProgram.id}`;
          if (imageData) {
            imageCard[programImage] = imageData;
            updateImageCard(imageCard);
            await AsyncStorage.setItem(programImage, imageData);
          } else {
            imageCard[programImage] = null;
            updateImageCard(imageCard);
            await AsyncStorage.removeItem(programImage);
          }

          this.setState({ disableSaveBtn: false });

          this.refreshCurrentProgram();
          if (action === "record") {
            navigation.pop(3);
          } else {
            navigation.pop(2);
          }
        });
      };

      const programHasUniqueName = isEditing
        ? true : checkUniqueProgramName(programs, currentProgram);

      if (!programHasUniqueName) {
        addMessage("You have a program with this name, please rename");
        this.setState({ disableSaveBtn: false });
        return;
      }

      if (!isProgramPrivate) {
        // Save public program on API
        ApiProgram.uploadNewProgram(programBody).then(() => {
          finishSave();
          addMessage(`${currentProgram.name?.trim()} saved to My Programs and shared successfully to Pumpables Library`);
        }).catch((errorMessage) => {
          this.setState({ disableSaveBtn: false });
          addMessage(errorMessage);
        });
      } else {
        finishSave();
        addMessage(`${currentProgram.name?.trim()} saved successfully to My Programs`);
      }
    });
  };

  refreshCurrentProgram = () => {
    const { setCurrentProgram } = this.props;
    setCurrentProgram({ ...EMPTY_PROGRAM, steps: [] });
  };

  goBack = () => {
    const { navigation } = this.props;

    navigation.goBack();
  };

  onActionEdit = (id, action) => {
    const {
      pump, navigation, addMessage,
      setCurrentProgram
    } = this.props;
    const { programs, playStatus, activeProgram } = pump;
    const { playingProgram } = activeProgram;

    if (playingProgram && playStatus !== OP_STOP) {
      addMessage(STOP_PLAY_PROGRAM);
      return;
    }

    setCurrentProgram(
      programs[id],
      !!programs[id]
    );

    navigation.pop();
    navigation.navigate("ProgramEdit", { action });
  };

  onConfirmDelete = () => {
    const {
      pump, deleteProgram, navigation,
      route
    } = this.props;
    const { plProgram } = route.params;
    const { programs } = pump;

    this.setState({ deletingProgram: false });
    navigation.pop();
    setTimeout(() => { deleteProgram(plProgram.id, programs); }, 500);
  };

  onDenyDelete = () => {
    this.setState({ deletingProgram: false });
  };

  shareProgramToPl = async ({ selectedTags, description }) => {
    const {
      addMessage, auth, route
    } = this.props;
    const { plProgram } = route.params;

    this.setState({ showShareToPl: false });

    // Add pause steps
    const pauseObj = await getPauseObj(plProgram);
    const pauseSteps = formatToAPIPauseSteps(plProgram.id, pauseObj);

    const programBody = shareToPlBody(
      plProgram,
      description,
      selectedTags,
      pauseSteps,
      auth.profile?.displayName
    );

    ApiProgram.uploadNewProgram(programBody).then(() => {
      addMessage(`${plProgram.name} shared sucessfully to Pumpables Library`);
    }).catch((errorMessage) => {
      addMessage(errorMessage);
    });
  };

  onMoreModalSelected = (selection) => {
    const { route, shareProgramWithFriends, duplicateProgram } = this.props;
    const { plProgram } = route.params;
    const { showShareToPl } = this.state;

    this.setState({ moreModalVisible: false });

    if (selection === 4) {
      setTimeout(() => this.setState({ deletingProgram: true }), 500);
    } else if (selection === 3) {
      setTimeout(() => this.onActionEdit(plProgram.id), 500);
    } else if (selection === 2) {
      getPauseObj(plProgram).then((pauseObj) => {
        shareProgramWithFriends(plProgram.id, plProgram, pauseObj);
      });
    } else if (selection === 5) {
      // Timeout needed to solve IOS display issue
      setTimeout(() => { this.setState({ showShareToPl: !showShareToPl }); }, 1000);
    } else if (selection === 6) {
      duplicateProgram(plProgram.id);
    }
  };

  render() {
    const { pump, route, navigation } = this.props;
    const {
      selectedTags = [], isProgramPrivate, plProgram,
      pumpTypeSelected, isGAPrivateProgram, imageData
    } = route.params;
    const { imageCard } = pump;
    const {
      programTitle, currentProgramSteps, description,
      moreModalVisible, deletingProgram, showShareToPl,
      reviews, reviewModalVisible, libProgram,
      disableSaveBtn, showMoreProgDesc
    } = this.state;

    const margin = appWidth < 360 ? 20 : 25;
    const itemSpacing = appWidth - ((130 + margin) * 2);

    let imageSource = null;

    if (!plProgram) {
      if (imageData) {
        imageSource = { uri: imageData };
      } else {
        imageSource = pumpTypeSelected === PUMP_DEVICE.GG2
          ? Images.defaultGAProgram : Images.defaultSGProgram;
      }
    } else {
      // eslint-disable-next-line no-lonely-if
      if (imageCard[`programRunImage${plProgram.id}`]) {
        imageSource = { uri: imageCard[`programRunImage${plProgram.id}`] };
      } else {
        imageSource = plProgram.pumpName === PUMP_DEVICE.GG2
          ? Images.defaultGAProgram : Images.defaultSGProgram;
      }
    }

    let totalDur = 0;
    currentProgramSteps.forEach((x) => {
      totalDur += x.duration;
    });

    const minutes = (`00${Math.floor(totalDur / 60)}`).slice(-2);
    const seconds = (`00${Math.floor(totalDur % 60)}`).slice(-2);
    const totalDuration = `${minutes}:${seconds}`;

    return (
      <Container
        noScroll
        edges={["bottom"]}
      >
        <View style={Styles.header}>
          <View>
            <ImageBackground
              source={imageSource}
              style={Styles.programBackground}
            />
            <View pointerEvents="none" style={Styles.overlay} />
          </View>
          <View style={Styles.btnView}>
            <TouchableOpacity
              style={Styles.backWrapper}
              onPress={this.goBack}
            >
              <Icon style={Styles.backIcon} name="chevron-back" />
            </TouchableOpacity>
            {isGAPrivateProgram && (
              <TouchableOpacity
                style={Styles.moreView}
                onPress={() => this.setState({ moreModalVisible: !moreModalVisible })}
              >
                <Icon
                  style={Styles.moreIcon}
                  type="SimpleLineIcons"
                  name="options-vertical"
                />
              </TouchableOpacity>
            )}
          </View>
        </View>
        <ScrollView
          style={{
            paddingHorizontal: margin
          }}
        >
          <View style={Styles.bodyContent}>
            <Label maxFontSizeMultiplier={1} font34 weightSemiBold>
              {programTitle}
            </Label>
            {description && (
              <TextMoreBox
                text={description}
                maxLenNum={2}
                openMoreText={() => this.setState({ showMoreProgDesc: true })}
              />
            )}
            {libProgram && !isGAPrivateProgram && (
              <StarRatingDisplay
                program={libProgram}
                showAverageRating
                showReviewBtn
                hasLeftARating={reviews?.length > 0}
                createReview={() => this.setState({ reviewModalVisible: true })}
                editReview={() => this.setState({ reviewModalVisible: true })}
                onPress={() => navigation.navigate("ReviewDetail", { program: libProgram })}
              />
            )}
            {selectedTags && (
              <View style={Styles.tagContainer}>
                {selectedTags.map((item) => (
                  <PumpingTag
                    key={item.id}
                    id={item.id}
                    label={item.label}
                    viewStyle={Styles.tagView}
                  />
                ))}
              </View>
            )}
            <Label maxFontSizeMultiplier={1} font20 greyWarm mt10>
              Total time
            </Label>
            <Label maxFontSizeMultiplier={1} font26 weightSemiBold>
              {totalDuration}
            </Label>
          </View>
          <Carousel
            loop={false}
            style={Styles.carousel}
            width={170 + itemSpacing}
            height={220}
            data={currentProgramSteps}
            ref={(c) => { this._carousel = c; }}
            renderItem={({ item, index }) => (
              <ProgramCard
                index={index}
                programLength={currentProgramSteps.length}
                programData={item}
                disableReordering
              />
            )}
          />
        </ScrollView>
        {!plProgram && (
          <View style={Styles.buttonView}>
            <ButtonRound
              onPress={this.goBack}
              white
              style={Styles.backButton}
            >
              <Label blue weightBold font16>
                Back
              </Label>
            </ButtonRound>
            <ButtonRound
              disabled={disableSaveBtn}
              onPress={() => {
                firebase.analytics().logEvent("Save_program_via_edit_session");
                this.saveProgram();
              }}
              blue
              style={Styles.saveButton}
            >
              <Label white weightBold font16>
                {isProgramPrivate ? "Save" : "Save & Share"}
              </Label>
            </ButtonRound>
          </View>
        )}
        {deletingProgram && (
          <ConfirmationToast
            title=""
            subtitle={`Are you sure you want to delete ${plProgram?.name}?`}
            onPressConfirm={this.onConfirmDelete}
            onPressDeny={this.onDenyDelete}
          />
        )}
        {showShareToPl && (
          <PlShareModal
            title={plProgram.name}
            programDescription={plProgram.description}
            preSelectedTags={plProgram.tags}
            isVisible={showShareToPl}
            onPressConfirm={this.shareProgramToPl}
            onPressDeny={() => this.setState({ showShareToPl: false })}
          />
        )}
        {moreModalVisible && (
          <SelectionModal
            isVisible={moreModalVisible}
            title=""
            onPressConfirm={this.onMoreModalSelected}
            dataArr={formatProgramSelectionData(plProgram, programMoreSelectionData)}
          />
        )}
        {showMoreProgDesc && (
          <InfoModal
            title="Decription"
            subtitle={description}
            onPressClose={() => this.setState({ showMoreProgDesc: false })}
          />
        )}
        {reviewModalVisible && (
          <ReviewModal
            programId={plProgram?.id}
            isVisible={reviewModalVisible}
            existingReview={{ score: reviews?.[0]?.score, review: reviews?.[0]?.review }}
            onPressConfirm={() => {
              this.setState({ reviewModalVisible: false });
              AsyncStorage.setItem(REFRESH_PL_LIST, "true")
                .then(() => {
                  this.goBack();
                });
            }}
            onPressDeny={() => this.setState({ reviewModalVisible: false })}
          />
        )}
      </Container>
    );
  }
}

const mapStateToProps = ({ pump, auth }) => {
  return { pump, auth };
};

const mapDispatchToProps = {
  addMessage,
  saveProgram,
  setCurrentProgram,
  deleteProgram,
  shareProgramWithFriends,
  duplicateProgram,
  updateImageCard
};

export default connect(mapStateToProps, mapDispatchToProps)(ProgramReview);

ProgramReview.propTypes = {
  pump: PropTypes.object,
  auth: PropTypes.object,
  navigation: PropTypes.object,
  addMessage: PropTypes.func,
  saveProgram: PropTypes.func,
  route: PropTypes.object,
  params: PropTypes.any,
  selectedTags: PropTypes.array,
  setCurrentProgram: PropTypes.func,
  shareProgramWithFriends: PropTypes.func,
  deleteProgram: PropTypes.func,
  duplicateProgram: PropTypes.func,
  updateImageCard: PropTypes.func
};

const Styles = {
  container: {
    paddingTop: 0,
    paddingBottom: 16,
    backgroundColor: Colors.white
  },
  header: {
    height: "30%",
  },
  carousel: {
    width: "100%",
    marginTop: "10%",
  },
  programBackground: {
    width: "100%",
    height: "100%"
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.black20p
  },
  btnView: {
    flexDirection: "row",
    marginTop: isIphoneX() ? 50 : 22,
    justifyContent: "space-between",
    position: "absolute",
    width: "100%"
  },
  backWrapper: {
    width: 40,
    height: 40,
    overflow: "hidden",
    marginLeft: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  backIcon: {
    fontSize: 29,
    color: Colors.white
  },
  moreView: {
    width: 40,
    height: 40,
    overflow: "hidden",
    marginRight: 16,
    alignItems: "center",
    justifyContent: "center"
  },
  moreIcon: {
    fontSize: 20,
    color: Colors.white
  },
  bodyContent: {
    alignItems: "center",
    marginVertical: 10
  },
  tagContainer: {
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  tagView: {
    height: 25,
    borderRadius: 5,
  },
  buttonView: {
    justifyContent: "space-between",
    flexDirection: "row",
    width: "100%",
    paddingHorizontal: 22,
    marginVertical: 20
  },
  saveButton: {
    width: "58%",
    height: 50
  },
  backButton: {
    width: "38%",
    height: 50,
    borderWidth: 2,
    borderColor: Colors.blue
  }
};
