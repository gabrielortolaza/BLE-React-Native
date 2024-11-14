import React from "react";
import PropTypes from "prop-types";
import {
  View, Image, ActivityIndicator,
  TouchableOpacity
} from "react-native";
import moment from "moment";
import * as RNFS from "react-native-fs";
import AsyncStorage from "@react-native-async-storage/async-storage";

import ApiProgram from "../../../Http/Program";
import SelectionModal from "../../Shared/SelectionModal";
import { Label as Text, ConfirmationToast } from "../../Shared";
import { Colors } from "../../../Themes";
import {
  formatProgramSelectionData, formatToAPIPauseSteps, isEmpty,
  shareToPlBody
} from "../../../Services/SharedFunctions";
import {
  PUMP_DEVICE, PUMPING_TAGS, programMoreSelectionData
} from "../../../Config/constants";
import * as M from "../../../Config/messages";
import PumpTypeTag from "../../Shared/PumpTypeTag";
import PumpingTag from "../../Shared/PumpingTag";
import PlShareModal from "../../Shared/PlShareModal";
import Icon from "../../Shared/Icon";
import StarRatingDisplay from "../../Shared/StarRatingDisplay";

export default class HomeTileItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      totalPauseDur: 0,
      didFocus: false,
      modalVisible: false,
      showShareToPl: false,
      deletingProgram: false,
    };
  }

  componentDidMount() {
    const { programId, item, navigation } = this.props;

    this.programSetup(programId, item);

    this.didFocusSubscription = navigation.addListener(
      "focus",
      () => {
        const { didFocus } = this.state;
        if (didFocus) {
          // console.debug("didFocus HomeTileItem");
          const { programId, item } = this.props;
          this.programSetup(programId, item);
        } else {
          this.setState({ didFocus: true });
        }
      }
    );
  }

  shouldComponentUpdate(nextProps, nextState) {
    return JSON.stringify(nextProps) !== JSON.stringify(this.props) || nextState !== this.state;
  }

  programSetup = (programId, item) => {
    if (item) {
      if (programId === 0 || programId) {
        AsyncStorage.getItem("program-pause").then((val) => {
          // console.log("program-pause home:", val);
          let totalPauseDur = 0;
          if (val) {
            const newVal = JSON.parse(val);
            // If pause exists in current program
            if (Object.prototype.hasOwnProperty.call(newVal, programId)) {
              // Add to steps and setState
              Object.keys(newVal[programId]).forEach((key) => {
                totalPauseDur += newVal[programId][key].duration;
              });
              this.pauseObj = { [programId]: newVal[programId] };
            }
          }
          this.setState({ totalPauseDur });
        });
      }
    }
  };

  syncProgram = (totalPauseDur) => {
    const {
      addMessage, actionSync, connected,
      pumpDevice, pumpDeviceName,
    } = this.props;

    if (!connected) {
      addMessage(M.PUMP_DISCONNECT.replace("pump", (pumpDeviceName || "Pump")));
      return;
    }

    if (totalPauseDur > 0 && pumpDevice === PUMP_DEVICE.SUPERGENIE) {
      addMessage(M.SYNC_ERROR_PAUSE_STEP);
    } else {
      setTimeout(() => actionSync(), 500);
    }
  };

  shareProgram = () => {
    const {
      programId, item, shareProgramWithFriends
    } = this.props;

    if (!item) return;

    console.log("RNFS", RNFS, item);
    shareProgramWithFriends(programId, item, this.pauseObj);
  };

  shareProgramToPl = ({ selectedTags, description }) => {
    const {
      item, addMessage, refreshPL,
      userDisplayName, programId
    } = this.props;

    this.setState({ showShareToPl: false });

    // Add pause steps
    const pauseSteps = formatToAPIPauseSteps(programId, this.pauseObj);

    const programBody = shareToPlBody(item, description, selectedTags, pauseSteps, userDisplayName);

    ApiProgram.uploadNewProgram(programBody).then(() => {
      addMessage(`${item.name} shared sucessfully to Pumpables Library`);
      refreshPL();
    }).catch((errorMessage) => {
      addMessage(errorMessage);
    });
  };

  onModalSelected = (selection) => {
    const { actionEdit, programId, duplicateProgram } = this.props;
    const { totalPauseDur, showShareToPl } = this.state;

    this.setState({ modalVisible: false });

    if (selection === 1) {
      this.syncProgram(totalPauseDur);
    } else if (selection === 2) {
      setTimeout(() => { this.shareProgram(); }, 500);
    } else if (selection === 3) {
      setTimeout(() => actionEdit(), 500);
    } else if (selection === 4) {
      setTimeout(() => this.setState({ deletingProgram: true }), 500);
    } else if (selection === 5) {
      setTimeout(() => this.setState({ showShareToPl: !showShareToPl }), 500);
    } else if (selection === 6) {
      duplicateProgram(programId);
    }
  };

  onConfirmDelete = () => {
    const { programId, actionDelete } = this.props;
    this.setState({ deletingProgram: false });
    actionDelete(programId);
  };

  onDenyDelete = () => {
    this.setState({ deletingProgram: false });
  };

  renderControls = () => {
    const {
      moveProgram, item, index
    } = this.props;

    return (
      <View style={Styles.btnContainer}>
        <TouchableOpacity
          onPress={() => moveProgram("up", item, index)}
          style={Styles.upDownContainer}
        >
          <Icon
            name="caret-up"
            style={Styles.upDownButton}
          />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => moveProgram("down", item, index)}
          style={Styles.upDownContainer}
        >
          <Icon
            name="caret-down"
            style={Styles.upDownButton}
          />
        </TouchableOpacity>
      </View>
    );
  };

  renderPlayArea = () => {
    const {
      actionStart, isPlaying, isPaused,
      programLoading, actionPause, imageSource,
      programId, privateProgram, isDownloaded,
      actionDownload, isActive, actionStop,
      item, actionEnter
    } = this.props;

    return (
      privateProgram ? (
        item.pumpName === PUMP_DEVICE.GG2 ? (
          <TouchableOpacity
            onPress={() => actionEnter(formatToAPIPauseSteps(programId, this.pauseObj))}
            style={[
              Styles.imageContainer,
              Styles.gg2View
            ]}
          >
            {imageSource ? (
              <Image
                source={imageSource}
                resizeMode="cover"
                style={Styles.image}
              />
            ) : (
              // Image NOT disappearing on IOS after changing image source to null
              <View style={Styles.image} />
            )}
            <Icon
              name="eye-outline"
              style={Styles.playIcon}
            />
          </TouchableOpacity>
        ) : (
          <View>
            <TouchableOpacity
              onPress={isPlaying ? actionPause : actionStart}
              style={[
                Styles.imageContainer,
                {
                  backgroundColor: isPlaying
                    ? Colors.lightBlue : isPaused ? Colors.tertiary : Colors.blue
                }
              ]}
            >
              {imageSource ? (
                <Image
                  source={imageSource}
                  resizeMode="cover"
                  style={Styles.image}
                />
              ) : (
                <View style={Styles.image} />
              )}
              {programLoading === `program${programId}`
                ? (
                  <ActivityIndicator
                    color={Colors.white}
                    size="small"
                    style={Styles.playIcon}
                  />
                )
                : (
                  <Icon
                    name={isPlaying ? "md-pause" : "md-play"}
                    style={Styles.playIcon}
                  />
                )}
              <Text style={Styles.playLabel}>
                {isPlaying ? "in progress" : isPaused ? "paused" : "" }
              </Text>
            </TouchableOpacity>
            {isActive && (
              <TouchableOpacity
                onPress={actionStop}
                style={Styles.stopContainer}
              >
                <Icon
                  name="stop-circle-outline"
                  style={Styles.stopIcon}
                />
                <Text red font11 maxFontSizeMultiplier={1.2}>Stop</Text>
              </TouchableOpacity>
            )}
          </View>
        )
      ) : (
        <TouchableOpacity
          activeOpacity={isDownloaded ? 1 : 0.4}
          style={Styles.downloadContainer}
          onPress={!isDownloaded ? actionDownload : () => {}}
        >
          {!isDownloaded && (
            <Icon
              name="arrow-down-circle-outline"
              style={Styles.downloadIcon}
            />
          )}
        </TouchableOpacity>
      )
    );
  };

  render() {
    const {
      programId, item, index,
      containerStyles, title, moveProgram,
      actionEnter, privateProgram
    } = this.props;
    const {
      totalPauseDur, modalVisible, deletingProgram,
      showShareToPl
    } = this.state;

    const {
      imported, tags, downloadedByCount,
      creatorName, createdAt
    } = item;

    // console.log("tile item", item);
    let time = 0;
    if (item && !isEmpty(item)) {
      if (!privateProgram) {
        const minutes = (`00${Math.floor(item.totalDuration / 60)}`).slice(-2);
        const seconds = (`00${Math.floor(item.totalDuration % 60)}`).slice(-2);
        time = `${minutes}:${seconds}`;
      } else {
        const minutes = (`00${Math.floor((item.duration + totalPauseDur) / 60)}`).slice(-2);
        const seconds = (`00${Math.floor((item.duration + totalPauseDur) % 60)}`).slice(-2);
        time = `${minutes}:${seconds}`;
      }
    }

    const usedByCount = downloadedByCount + 1;

    return (
      <View
        style={[Styles.container, containerStyles]}
      >
        {this.renderPlayArea()}
        <TouchableOpacity
          style={Styles.wrapper}
          onPress={() => actionEnter(formatToAPIPauseSteps(programId, this.pauseObj))}
        >
          <View style={Styles.topContainer}>
            <View style={Styles.pumpTypeView}>
              <PumpTypeTag pumpTag={item.pumpName} />
            </View>
            {privateProgram && (
              <TouchableOpacity
                onPress={() => moveProgram("favorite", item, index)}
                style={Styles.heartContainer}
              >
                <Icon
                  name={item.favorite ? "heart" : "heart-o"}
                  type="FontAwesome"
                  style={Styles.heartIcon}
                />
              </TouchableOpacity>
            )}
            {privateProgram && (
              <TouchableOpacity
                testID={`genie_home_program_options${index}`}
                onPress={() => this.setState({ modalVisible: true })}
                style={Styles.optionsContainer}
              >
                <Icon
                  name="options-vertical"
                  type="SimpleLineIcons"
                  style={Styles.settingsIcon}
                />
              </TouchableOpacity>
            )}
          </View>
          <View style={Styles.midContainer}>
            <View style={Styles.titleView}>
              <Text numberOfLines={1} font14 grey weightSemiBold>
                {title}
              </Text>
            </View>
            <View>
              <Text font11 greyWarm weightSemiBold style={Styles.time}>
                {time}
              </Text>
            </View>
          </View>
          {!privateProgram && (
            <View>
              <Text
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
                font12
                grey
                weightLight
              >
                {`By ${creatorName.trim()} \u2022 ${moment(createdAt).format("MMM D, YYYY")}`}
              </Text>
              <Text
                numberOfLines={1}
                maxFontSizeMultiplier={1.2}
                font12
                grey
                weightLight
              >
                {`Used by ${usedByCount} pumper${usedByCount > 1 ? "s" : ""}`}
              </Text>
              <StarRatingDisplay
                program={item}
              />
            </View>
          )}
          {tags && (
            <View style={Styles.pumpingTags}>
              {tags.map((tag) => {
                const thisTag = PUMPING_TAGS.find((item) => item.id === tag);
                return (
                  <PumpingTag
                    key={tag}
                    id={tag}
                    disabled
                    label={thisTag.label}
                    viewStyle={Styles.tagView}
                  />
                );
              })}
            </View>
          )}
          {
            programId !== undefined
            && (
              <View style={Styles.bottomControlWrapper}>
                {imported && (
                  <Text font12 lightGrey2>
                    Imported
                  </Text>
                )}
              </View>
            )
          }
        </TouchableOpacity>
        {/* {this.renderControls()} */}
        {modalVisible && (
          <SelectionModal
            isVisible={modalVisible}
            title=""
            onPressConfirm={this.onModalSelected}
            dataArr={formatProgramSelectionData(item, programMoreSelectionData)}
          />
        )}
        {showShareToPl && (
          <PlShareModal
            title={item.name}
            programDescription={item.description}
            preSelectedTags={item.tags}
            isVisible={showShareToPl}
            onPressConfirm={this.shareProgramToPl}
            onPressDeny={() => this.setState({ showShareToPl: false })}
          />
        )}
        {deletingProgram && (
          <ConfirmationToast
            title=""
            subtitle={`Are you sure you want to delete ${title}?`}
            onPressConfirm={this.onConfirmDelete}
            onPressDeny={this.onDenyDelete}
          />
        )}
      </View>
    );
  }
}

HomeTileItem.propTypes = {
  item: PropTypes.object,
  containerStyles: PropTypes.any,
  title: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  pumpDevice: PropTypes.string,
  pumpDeviceName: PropTypes.string,
  programId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  index: PropTypes.number,
  userDisplayName: PropTypes.string,
  actionEdit: PropTypes.func,
  actionPause: PropTypes.func,
  actionEnter: PropTypes.func,
  actionStart: PropTypes.func,
  actionStop: PropTypes.func,
  actionSync: PropTypes.func,
  actionDelete: PropTypes.func,
  isActive: PropTypes.bool,
  isPlaying: PropTypes.bool,
  isPaused: PropTypes.bool,
  shareProgramWithFriends: PropTypes.func,
  addMessage: PropTypes.func,
  navigation: PropTypes.object.isRequired,
  imageSource: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
  connected: PropTypes.bool,
  moveProgram: PropTypes.func,
  programLoading: PropTypes.any,
  privateProgram: PropTypes.bool,
  refreshPL: PropTypes.func,
  isDownloaded: PropTypes.bool,
  actionDownload: PropTypes.func,
  duplicateProgram: PropTypes.func
};

const Styles = {
  container: {
    backgroundColor: "white",
    flexDirection: "row",
    marginBottom: 20
  },
  wrapper: {
    flex: 1,
    paddingLeft: 18,
    paddingBottom: 5
  },
  topContainer: {
    flexDirection: "row",
    width: "100%"
  },
  midContainer: {
    marginTop: 5,
    flexDirection: "row",
    alignItems: "center"
  },
  bottomControlWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  pumpingTags: {
    flexDirection: "row",
    flexWrap: "wrap"
  },
  input: {
    marginBottom: 9,
    fontSize: 14
  },
  time: {
    marginLeft: 10
  },
  titleView: {
    width: "70%",
    marginBottom: 4,
  },
  tagView: {
    height: 25,
    borderRadius: 5,
  },
  downloadContainer: {
    width: 80,
    height: 80,
    backgroundColor: Colors.lightGrey2,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 6
  },
  downloadIcon: {
    color: "white",
    fontSize: 32
  },
  gg2View: {
    width: 80,
    backgroundColor: Colors.blue
  },
  imageContainer: {
    height: 80,
    borderRadius: 6
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 6,
  },
  playIcon: {
    color: "white",
    fontSize: 24,
    position: "absolute",
    left: 28,
    top: 28
  },
  playLabel: {
    color: "white",
    fontSize: 10,
    alignSelf: "center",
    position: "absolute",
    bottom: 5
  },
  editButton: {
    borderColor: Colors.lightBlue,
    width: 80,
    height: 32,
    alignSelf: "center"
  },
  btnContainer: {
  },
  upDownContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: 32
  },
  upDownButton: {
    color: Colors.blue,
    fontSize: 23
  },
  pumpTypeView: {
    width: "65%",
    alignItems: "flex-start"
  },
  heartContainer: {
    width: "20%",
    alignItems: "center"
  },
  optionsContainer: {
    width: "15%",
    alignItems: "flex-end"
  },
  heartIcon: {
    color: Colors.lightBlue,
    fontSize: 23,
  },
  stopContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "center",
    marginTop: 5
  },
  stopIcon: {
    color: Colors.red,
    fontSize: 23,
    marginRight: 3
  },
  settingsIcon: {
    color: Colors.lightGrey2,
    fontSize: 22
  }
};
