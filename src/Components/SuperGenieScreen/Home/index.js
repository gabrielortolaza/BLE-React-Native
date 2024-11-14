import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View, Clipboard, TouchableOpacity,
  AppState, FlatList, ScrollView, Platform
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { connect } from "react-redux";
import firebase from "@react-native-firebase/app";
import * as RNFS from "react-native-fs";
import BackgroundTimer from "react-native-background-timer";

import Header from "../../Shared/AppHeader/Header";
import * as constants from "../../../Config/constants";
import StyleSheet from "../../../Proportional";
import {
  Label, ButtonRound, ConfirmationToast,
  Pagination
} from "../../Shared";
import { Colors, Fonts } from "../../../Themes";
import HomeTileItem from "./HomeTileItem";
import SelectionModal from "../../Shared/SelectionModal";
import FilterModal from "./FilterModal";
import PumpingTag from "../../Shared/PumpingTag";
import PumpStatusHeader from "../../Shared/AppHeader/PumpStatusHeader";
import ModalTutorialSteps from "../../ModalTutorialSteps";
import TutorialBallon from "../../Shared/TutorialBallon";
import {
  isEmpty, isGen2Pump, stopProgramPayload,
  getUserFinishedTutorial, formatAPIPrograms, convertPLTags,
  formatPLToProgram
} from "../../../Services/SharedFunctions";
import ApiProgram from "../../../Http/Program";
import {
  resumeProgram, startProgram, stopSession,
  pauseSession, deleteProgram, setCurrentProgram,
  sendProgramData, updateImageCard, newProgramId,
  saveProgram, requestStatus, showTimerButton,
  setInitialProgramState, setUpProgram, setSuperGenieLoad,
  saveFavoriteProgram, stopTimer, setProgramsPosition,
  setRequesting, enterManualMode, updateAppState,
  wakeUpPump, setLastPlayedMode, savePauseProgram,
  shareProgramWithFriends, addMessage, playWantedToProgram,
  duplicateProgram
} from "../../../Actions";
import * as M from "../../../Config/messages";
import {
  API_POPULARITY_SORT, API_RATE_SORT, sortHighestRatedKey,
  sortMostRecentKey, sortObject, sortPopularityKey
} from "../../../Config/api";
import Container from "../../Shared/Container";
import Icon from "../../Shared/Icon";
import { REFRESH_PL_LIST } from "../../../Config/LocalStorage";

const selectionModalDataArr = [
  // {
  //   titl: "From my programs", subTitle: "Select and upload to Pumpables library",
  //   icon: "md-download-outline", iconType: "Ionicons", iconColor: Colors.lightBlue, key: 3
  // },
  {
    titl: "Record a program", subTitle: "Record and share", icon: "video-camera", iconType: "FontAwesome", iconColor: Colors.lightBlue, key: 2
  },
  {
    titl: "Set up program", subTitle: "Create step by step and share", icon: "settings", iconColor: Colors.blue, key: 1
  }
];

const sortPLByModalDataArr = [
  {
    titl: "Popularity", key: sortPopularityKey, type: "check"
  },
  {
    titl: "Most recent", key: sortMostRecentKey, type: "check"
  },
  {
    titl: "Highest Rated", key: sortHighestRatedKey, type: "check"
  }
];
const listLengthPerPage = 5;
const NAME_SEARCH_ID = "name_search";

class Home extends Component {
  constructor(props) {
    super(props);

    this.state = {
      addingNewProgram: false,
      shouldRecord: false,
      shouldSync: false,
      shouldSyncConfirm: false,
      showFilterModal: false,
      showTutorialModal: false,
      selectedSyncProgram: 1, // 1 or 2
      activeProgram: {},
      importingProgram: false,
      stopPlayingProgram: false,
      // eslint-disable-next-line react/no-unused-state
      key: 0,
      isPumpWarned: true, // warning only on first time,
      goingTo: null,
      selectedFilters: [],
      filterPrograms: [],
      filterApiPrograms: [],
      getFilterNextPrograms: null,
      apiPrograms: [],
      seeFilterResult: false,
      seeAllMyPrograms: false,
      seeAllLibrary: false,
      sortPLByModalVisible: false,
      plSortSelected: sortPopularityKey,
      downloadedProgramsArr: [],
      getAllNextPrograms: null,
      programTypeIds: [],
      pumpTypeIds: [],
      pumpTagIds: [],
      wantedToPlay: null,
      tutorialMeasurements: { // for tutorial ballon
        findPosition: 0,
        playPosition: 0,
        pinPosition: 0,
        downloadPosition: 0,
      },
      searchWord: "",
      onListPage: 1
    };

    this.stopProgramEnter = () => {};
    this.stopProgramEnterVar = "";
  }

  componentDidMount() {
    const {
      navigation, setSuperGenieLoad, updateAppState,
      pump
    } = this.props;

    updateAppState({
      appState: AppState.currentState
    });

    setSuperGenieLoad(true);
    BackgroundTimer.runBackgroundTimer(() => {
      requestStatus(); // Request status from pump
    }, 20000);

    const programs = Object.keys(pump.programs)
      .sort().map((k) => pump.programs[k]);
    const programCount = programs.length;
    if (programCount) {
      this._retrieveData(programs, programCount);
    }

    this.focusListener = navigation.addListener(
      "focus",
      () => {
        const { seeAllLibrary, plSortSelected } = this.state;

        // eslint-disable-next-line react/no-unused-state
        // this.setState({ key: Math.random() });

        AsyncStorage.getItem(REFRESH_PL_LIST)
          .then((val) => {
            if (val) {
              this.fetchAllProgramsFromApi(sortObject[plSortSelected]);
              AsyncStorage.removeItem(REFRESH_PL_LIST);
            } else {
              !seeAllLibrary && this.fetchAllProgramsFromApi(sortObject[plSortSelected]);
            }
          });
      }
    );

    this.appStateSubscription = AppState.addEventListener("change", this._handleAppStateChange);

    // change sg2 pump to active mode from light on or charging
    wakeUpPump();

    // Fetch program library programs
    this.fetchAllProgramsFromApi(API_POPULARITY_SORT);

    this.showTutorial();

    const programTypeIds = constants.PROGRAM_TYPE.map((type) => type.id);
    const pumpTypeIds = constants.PUMP_TYPE.map((item) => item.id);
    const pumpTagIds = constants.PUMPING_TAGS.map((tag) => tag.id);

    this.setState({
      programTypeIds,
      pumpTypeIds,
      pumpTagIds,
    });
  }

  shouldComponentUpdate(nextProps, nextState) {
    return nextProps !== this.props || nextState !== this.state;
  }

  componentDidUpdate(prevProps) {
    const {
      pump, resumeProgram, status,
      enterManualMode, playWantedToProgram
    } = this.props;
    const { wantedToPlay } = this.state;
    const {
      rezumeProgram
    } = pump.activeProgram;

    // Entering manual mode from tab icon
    if (status.enterManualMode && (status.enterManualMode !== prevProps.status.enterManualMode)) {
      enterManualMode(false);
      this.onActionManual("manual");
    }

    // Playing program after connecting
    if (
      status.canPlayWantedToProgram
        && (status.canPlayWantedToProgram !== prevProps.status.canPlayWantedToProgram)
        && status.canPlayWantedToProgram === "programList"
    ) {
      playWantedToProgram(false);
      this.initialActionStart(wantedToPlay);
      this.setState({ wantedToPlay: null });
    }

    // For pause sequence
    if (
      prevProps.pump.activeProgram.rezumeProgram !== rezumeProgram
      && rezumeProgram
    ) {
      resumeProgram(null, true);
    }
  }

  componentWillUnmount() {
    this.focusListener();
    this.appStateSubscription && this.appStateSubscription.remove();
  }

  _handleAppStateChange = (nextAppState) => {
    const { updateAppState } = this.props;

    updateAppState({ appState: nextAppState });
  };

  showTutorial = () => {
    getUserFinishedTutorial().then((val) => {
      if (!val) {
        setTimeout(() => {
          this.buttonsRef?.measure((fx, fy, width, height, px, py) => {
            this.setState((oldVal) => ({
              tutorialMeasurements: { ...oldVal.tutorialMeasurements, findPosition: py + 32 }
            }));
          });
          this.programRef?.measure((fx, fy, width, height, px, py) => {
            this.setState((oldVal) => ({
              tutorialMeasurements: {
                ...oldVal.tutorialMeasurements, playPosition: py + 95, pinPosition: py + 70
              }
            }));
          });
          this.libraryRef?.measure((fx, fy, width, height, px, py) => {
            this.setState((oldVal) => ({
              // 140 includes height of last ballon
              tutorialMeasurements: { ...oldVal.tutorialMeasurements, downloadPosition: py - 140 }
            }));
          });
        }, 250);

        setTimeout(() => this.setState({ showTutorialModal: true }), 600);
      }
    });
  };

  fetchAllProgramsFromApi = async (sort) => {
    const { addMessage } = this.props;
    await ApiProgram.getAllPrograms(sort).then(({ results, next }) => {
      const formatedPrograms = formatAPIPrograms(results);
      this.setState({
        apiPrograms: formatedPrograms,
        getAllNextPrograms: next,
        plSortSelected:
          sort === API_POPULARITY_SORT
            ? sortPopularityKey
            : sort === API_RATE_SORT
              ? sortHighestRatedKey
              : sortMostRecentKey
      });
    }).catch(() => addMessage(M.SOMETHING_WRONG));
  };

  loadMorePLPrograms = async () => {
    const { addMessage } = this.props;
    const { plSortSelected, apiPrograms, getAllNextPrograms } = this.state;

    await ApiProgram.getAllPrograms(sortObject[plSortSelected], getAllNextPrograms)
      .then(({ results, next }) => {
        const formatedPrograms = formatAPIPrograms(results);
        this.setState({
          apiPrograms: apiPrograms.concat(formatedPrograms),
          getAllNextPrograms: next
        });
      }).catch(() => addMessage(M.SOMETHING_WRONG));
  };

  handleScrollToEnd = () => {
    this.contentView.scrollToEnd({ animated: true });
  };

  _getData = (type) => {
    return new Promise((resolve) => {
      AsyncStorage.getItem(type)
        .then((value) => {
          resolve(value);
        });
    });
  };

  _retrieveData = (types, typesLength = false) => {
    const { pump } = this.props;
    const { imageCard } = pump;

    if (typesLength) {
      types.forEach((type) => {
        const imageName = `programRunImage${type.id}`;
        this._getData(imageName)
          .then((val) => {
            imageCard[imageName] = val;
          });
      });
    }
  };

  checkConnectStatus = () => {
    const {
      pump, addMessage,
    } = this.props;
    const { connectStatus, pumpDeviceName } = pump;

    if (connectStatus !== constants.CONNECT_STATUS.CONNECTED) {
      addMessage(M.PUMP_DISCONNECT.replace("pump", (pumpDeviceName || "Pump")));
      return false;
    }
    return true;
  };

  setUpProgram = () => {
    const { pump, setUpProgram } = this.props;
    const {
      currentProgram, speed, strength
    } = pump;

    console.log("setUpHome:", currentProgram.id, currentProgram.steps);

    setUpProgram(currentProgram, speed, strength);
  };

  onActionManual = (type) => {
    const {
      pump, navigation
    } = this.props;
    const { playStatus, activeProgram } = pump;
    const { playingProgram } = activeProgram;

    if (!this.checkConnectStatus()) return;

    if (
      (playStatus === constants.OP_START || playStatus === constants.OP_PAUSE)
        && playingProgram
    ) {
      this.setState(
        { stopPlayingProgram: true, goingTo: "Manual" },
        () => {
          this.stopProgramEnter = this.onActionManual;
          this.stopProgramEnterVar = type;
        }
      );
      return;
    }

    navigation.navigate("ManualRun", { type });
  };

  onActionEdit = (id, action) => {
    const {
      pump, navigation, addMessage,
      setCurrentProgram
    } = this.props;
    const { programs, playStatus, activeProgram } = pump;
    const { playingProgram } = activeProgram;

    if (playingProgram && playStatus !== constants.OP_STOP) {
      addMessage(M.STOP_PLAY_PROGRAM);
      return;
    }
    console.log("Program editing:", id, programs[id]);
    setCurrentProgram(
      programs[id]
        || {
          ...constants.EMPTY_PROGRAM,
          id,
          steps: [constants.EMPTY_SESSION],
          name: `Program ${id}`
        },
      !!programs[id]
    );
    this.setState({ addingNewProgram: false });
    navigation.navigate("ProgramEdit", { action });
  };

  onActionEnter = (id) => {
    const {
      pump, navigation, setCurrentProgram
    } = this.props;
    const {
      programs, programId, playStatus,
      currentProgram
    } = pump;

    if (programId !== id
      && (playStatus === constants.OP_START || playStatus === constants.OP_PAUSE)
    ) {
      this.setState(
        { stopPlayingProgram: true, goingTo: "Program" },
        () => {
          this.stopProgramEnter = this.onActionEnter;
          this.stopProgramEnterVar = id;
        }
      );
    } else {
      if (
        !(playStatus !== constants.OP_STOP && programId === id)
        || !currentProgram.steps // Did not just open the App and meet program on the pump
      ) {
        // Already set if program is running/active
        setCurrentProgram(programs[id], true);
      }
      // Save last play mode when entering program screen
      setLastPlayedMode({ id: constants.LAST_PLAY_MODE.PROGRAM, programId: id });
      this.setState({ addingNewProgram: false });
      navigation.navigate("ProgramRun");
    }
  };

  onActionEnterPL = (program, pauseSteps, isGAPrivateProgram) => {
    const { navigation } = this.props;

    navigation.navigate("ProgramReview", {
      plProgram: {
        ...program,
        ...(pauseSteps && { pauseSteps })
      },
      selectedTags: convertPLTags(program.tags),
      isProgramPrivate: false,
      pumpTypeSelected: program.pumpName,
      isGAPrivateProgram
    });
  };

  initialActionStart = (program) => {
    const {
      pump, setCurrentProgram, setRequesting,
      navigation
    } = this.props;
    const {
      programs, playStatus, programId,
      currentProgram
    } = pump;

    if (!this.checkConnectStatus()) {
      this.setState({ wantedToPlay: program });
      navigation.navigate("GeniePairing", { from: "programList" });
      return;
    }

    setRequesting(`program${program.id}`);

    // save last play mode when playing program from home screen
    setLastPlayedMode({ id: constants.LAST_PLAY_MODE.PROGRAM, programId: program.id });

    const goActionStart = () => {
      setCurrentProgram(programs[program.id], true);
      setTimeout(() => {
        this.setUpProgram();
        setTimeout(() => {
          this.onActionStart(program.id);
        }, 500);
      }, 500);
    };

    if (
      playStatus === constants.OP_PAUSE
        && programId === program.id
          && currentProgram.steps // Will not exist if program was initiated from the pump
    ) {
      this.onActionStart(program.id);
    } else {
      goActionStart();
    }
  };

  onActionStart = (id) => {
    const {
      pump, resumeProgram, startProgram,
      addMessage, setRequesting, showTimerButton
    } = this.props;
    const {
      playStatus, programId, programs,
      pumpDevice, programPlaying, programPaused
    } = pump;
    const {
      timer, inPauseSeq, programAltered,
      newProgram
    } = pump.activeProgram;

    if (!this.checkConnectStatus()) {
      setRequesting({});
      return;
    }

    if (inPauseSeq) {
      setRequesting({});
      addMessage(M.IN_PAUSE_STEP);
      return;
    } // If in pause step

    if (pumpDevice === constants.PUMP_DEVICE.SUPERGENIE) {
      if (
        (playStatus === constants.OP_PAUSE && programId === id)
        || (playStatus === constants.OP_PAUSE && programAltered)
      ) {
        setRequesting({});
        resumeProgram(timer);
      } else if (programId !== id && playStatus !== constants.OP_STOP) {
        this.stopPlayingProgram();
        setTimeout(() => {
          firebase.analytics().logEvent("Program_stop_play_from_home");
          showTimerButton(constants.PROGRAM_TIMER);
          startProgram(id, timer, programs);
        }, 700);
      } else {
        firebase.analytics().logEvent("Program_play_from_home");
        showTimerButton(constants.PROGRAM_TIMER);
        startProgram(id, timer, programs);
      }
    } else if (isGen2Pump(pumpDevice)) {
      if (
        // Duplicate/unnecessary conditionals, playStatus and programPaused?
        playStatus === constants.OP_PAUSE
        && programId === id
        && programPlaying
        && programPaused
      ) {
        setRequesting({});
        resumeProgram(timer);
      } else if (programId !== id && playStatus !== constants.OP_STOP) {
        this.stopPlayingProgram();
        setTimeout(() => {
          firebase.analytics().logEvent("Program_stop_play_from_home");
          startProgram(id, timer, programs, newProgram);
        }, 700);
      } else {
        firebase.analytics().logEvent("Program_play_from_home");
        startProgram(id, timer, programs, newProgram);
      }
    }
  };

  onActionPause = () => {
    const { pauseSession } = this.props;

    stopTimer();
    pauseSession(null);

    firebase.analytics().logEvent("Program_pause_from_home");
  };

  onActionShare = (id) => () => {
    const { user, addMessage } = this.props;
    if (!user.uid) {
      addMessage(M.LOGIN_SHARE_PROGRAM);
    } else {
      const url = `supergenieapp://userdata/${user.uid}/programs/${id}`;
      Clipboard.setString(url);
      addMessage(M.SHARE_LINK_COPIED);
    }
  };

  onActionRecord = (id) => {
    const {
      pump, navigation, setCurrentProgram
    } = this.props;
    const {
      programId, playStatus
    } = pump;

    if (programId !== 0
      && (playStatus === constants.OP_START || playStatus === constants.OP_PAUSE)) {
      this.setState({ stopPlayingProgram: true });
      this.stopProgramEnter = this.onActionRecord;
      this.stopProgramEnterVar = id;
    } else {
      setCurrentProgram({
        ...constants.EMPTY_PROGRAM, steps: [], id, name: `Program ${id}`
      });
      navigation.navigate("ProgramRecord");
    }
  };

  onActionDelete = (programId) => {
    const { filterPrograms } = this.state;
    const { pump, deleteProgram } = this.props;
    const { programs } = pump;

    deleteProgram(programId, programs);

    const result = filterPrograms.filter((item) => item.id !== programId);
    this.setState({ filterPrograms: result });
    // eslint-disable-next-line react/no-unused-state
    // this.setState({ key: Math.random() });
  };

  onActionSync = (currentProgram) => () => {
    console.log("Sync program:", currentProgram);

    this.setState({
      shouldSync: true,
      activeProgram: currentProgram,
    });
  };

  onSelectSyncProgram = (selectedSyncProgram) => {
    this.setState({
      selectedSyncProgram,
      shouldSync: false,
      shouldSyncConfirm: true,
    });
  };

  onDenySync = () => this.setState({ shouldSync: false, shouldSyncConfirm: false });

  onConfirmedSync = () => {
    const { addMessage } = this.props;
    const { activeProgram, selectedSyncProgram } = this.state;

    this.setState({ shouldSyncConfirm: false });
    sendProgramData({ ...activeProgram, id: selectedSyncProgram });
    firebase.analytics().logEvent("Program_synced_with_pump");
    setTimeout(() => addMessage(M.SYNC_COMPLETED), 700); // TODO: need better approach
  };

  onAddProgram = (selection) => {
    const { pump, addMessage } = this.props;
    const { programs } = pump;
    if (selection !== 3) {
      this.setState({ addingNewProgram: false });
    }

    if (selection === 1) {
      const newPId = newProgramId(programs);
      if (newPId === constants.NO_AVAILABLE_PROGRAM_ID) {
        addMessage(M.MAX_PROGRAM_ID_REACHED);
        return;
      }
      this.onActionEdit(newPId, "create");
    } else if (selection === 2) {
      this.onActionManual("manual");
    } else if (selection === 3) {
      this.setState({ importingProgram: true });
    } else {
      this.setState({ importingProgram: false });
    }
  };

  onPLSortModalSelected = (selection) => {
    this.setState({ sortPLByModalVisible: false });

    this.fetchAllProgramsFromApi(sortObject[selection]);
  };

  /**
   * Sort programs
   * @param {Object} programsPosition
   */
  sortMyPrograms = () => {
    const { pump } = this.props;

    // Sort based on program id
    let programs = Object.keys(pump.programs).sort((a, b) => b - a).map((k) => pump.programs[k]);

    // if (pump.topProgramId !== null) {
    //   const firstProgram = pump.programs[pump.topProgramId];
    //   programs.sort((x, y) => (x === firstProgram ? -1 : (y === firstProgram ? 1 : 0)));
    // }

    // Sort liked programs
    const likedPrograms = [];
    const dateModifiedArr = [];
    let defaultProgram = null;

    for (let i = 0; i < programs.length; i++) {
      if (programs[i].favorite) {
        likedPrograms.push(programs[i]);
      }

      if (programs[i].dateModified && !programs[i].favorite) {
        dateModifiedArr.push(programs[i]);
      }

      if (programs[i].id === constants.DEFAULT_PROGRAM_ID) {
        defaultProgram = programs[i];
      }
    }

    likedPrograms.sort((a, b) => b.favorite - a.favorite);
    dateModifiedArr.sort((a, b) => b.dateModified - a.dateModified);

    const filteredPrograms = programs.filter(
      (el) => (
        !el.favorite && !el.dateModified && el.id !== constants.DEFAULT_PROGRAM_ID
      )
    );

    programs = likedPrograms.concat(dateModifiedArr).concat(filteredPrograms);

    // Check if default program is favorited
    const defaultProgramIndex = programs.map((e) => e.id).indexOf(constants.DEFAULT_PROGRAM_ID);
    if (defaultProgramIndex === -1) {
      defaultProgram && programs.push(defaultProgram);
    }

    return programs;

    // if (!programsPosition || isEmpty(programsPosition)) return programs;
    // const arr = [];

    // const keyz = Object.keys(programsPosition);
    // const valuez = Object.values(programsPosition);

    // for (let i = 0; i < valuez.length; i++) {
    //   arr.push({ id: keyz[i], position: valuez[i] });
    // }

    // arr.sort((a, b) => a.position - b.position);

    // for (let i = 0; i < arr.length; i++) {
    //   const oldIndex = programs.findIndex((x) => x.id === parseInt(arr[i].id, 10));
    //   const newIndex = arr[i].position;

    //   if (oldIndex > -1) {
    //     // If oldIndex is found
    //     programs = this.arrayMove(programs, oldIndex, newIndex);
    //   }
    // }
    // return programs;
  };

  moveProgram = (direction, program, index) => {
    const { seeFilterResult } = this.state;
    const {
      pump, auth, saveFavoriteProgram, setProgramsPosition
    } = this.props;
    const { programs } = pump;
    const { profile } = auth;
    let { programsPosition: val } = profile;

    console.log(`Move program ${direction}`);

    if (direction === "favorite") {
      saveFavoriteProgram(program, program.favorite);
      if (seeFilterResult) {
        this.updateFilter(null, true);
      }
      return;
    }

    const programz = Object.keys(programs).filter((x) => x < 101);
    console.log("programz", programz, index);
    if (
      (index === programz.length - 1 && direction === "down")
      || (index === 0 && direction === "up")
    ) {
      return;
    }

    // let totalFavoritePrograms = 0;
    // Object.keys(programs).forEach((key) => {
    //   if (programs[key].favorite) totalFavoritePrograms += 1;
    // });

    // if (direction === "favorite" && totalFavoritePrograms >= 3 && !program.favorite) {
    //   addMessage("To favorite this program, please deselect one first (3 max)");
    //   return;
    // }

    // if (direction === "up" && !program.favorite && index === totalFavoritePrograms) {
    //   addMessage("Oops, you can't move this program to the favroite section");
    //   return;
    // }

    // if (direction === "down" && program.favorite && index === (totalFavoritePrograms - 1)) {
    //   addMessage("Oops, you can't move this program to the unfavroite section");
    //   return;
    // }

    // AsyncStorage.getItem("programsPosition").then((val) => {
    //   if (direction === "favorite") {
    //     val = JSON.parse(val) || {};
    //     let pArray = this.reorderPrograms(pump, val);
    //     if (!program.favorite) {
    //       // each first selected favourite at the top, second below that
    //       pArray = this.arrayMove(pArray, index, totalFavoritePrograms);
    //     } else {
    //       // move unfavorite program just below to the favorite program section
    //       pArray = this.arrayMove(pArray, index, totalFavoritePrograms - 1);
    //     }
    //     pArray.forEach((item, index) => {
    //       val[item.id] = index;
    //     });
    //     saveFavoriteProgram(program, program.favorite);
    //   }
    // });

    const addVal = direction === "up" ? -1 : 1;
    if (val) {
      // val = JSON.parse(val);
      const newIndex = index + addVal;

      const keyExists = Object.keys(val).find((key) => val[key] === newIndex);
      console.log("exists:", keyExists);
      if (keyExists) {
        val[keyExists] = index;
      }
      val[program.id] = newIndex;
    } else {
      val = { [program.id]: index + addVal };
    }
    setProgramsPosition(val);
  };

  downloadPL = (plProgram) => {
    const {
      pump, saveProgram, addMessage
    } = this.props;
    const { programs } = pump;
    const { downloadedProgramsArr, plSortSelected } = this.state;

    const newId = newProgramId(programs);

    if (newId === constants.NO_AVAILABLE_PROGRAM_ID) {
      addMessage(M.MAX_PROGRAM_ID_REACHED);
      return;
    }

    const apiBody = {
      userUUID: firebase.auth().currentUser.uid,
      programId: plProgram.id
    };

    ApiProgram.downloadedProgram(apiBody).then(() => {
      const { pauseSteps } = plProgram;

      const finishDownload = () => {
        addMessage(`${plProgram.name} successfully downloaded to My Programs`);

        downloadedProgramsArr.push(plProgram.id);
        this.setState({ downloadedProgramsArr });

        this.fetchAllProgramsFromApi(sortObject[plSortSelected]);
      };

      if (pauseSteps) {
        AsyncStorage.getItem("program-pause").then((val) => {
          const pausesObj = {};
          for (let i = 0; i < pauseSteps.length; i++) {
            pausesObj[pauseSteps[i].index] = { duration: pauseSteps[i].duration };
          }
          const newPauseObj = {
            [newId]: pausesObj
          };

          const newVal = { ...JSON.parse(val), ...newPauseObj };
          console.log(newVal);
          AsyncStorage.setItem("program-pause", JSON.stringify(newVal)).then(() => {
            savePauseProgram(newId, pausesObj);
            saveProgram(newId, formatPLToProgram(newId, plProgram));
            finishDownload();
          });
        });
      } else {
        saveProgram(newId, formatPLToProgram(newId, plProgram));
        finishDownload();
      }
    }).catch((errorMessage) => {
      addMessage(errorMessage);
    });
  };

  importProgram = () => {
    const {
      saveProgram, addMessage, pump
    } = this.props;
    const { programs } = pump;

    const neewProgramId = newProgramId(programs);

    firebase.analytics().logEvent("Import_program_try");

    const goSetState = () => {
      this.setState({ importingProgram: false, addingNewProgram: false });
    };

    if (neewProgramId === constants.NO_AVAILABLE_PROGRAM_ID) {
      goSetState();
      addMessage(M.MAX_PROGRAM_ID_REACHED);
      return;
    }

    if (!this.importProgramLink) {
      // Alert user
      goSetState();
      return;
    }

    const { SHARE_DOMAIN_URI_PREFIX, SHARE_DOMAIN_URI_PREFIX_SHORT } = constants;

    if (
      this.importProgramLink.substr(0, SHARE_DOMAIN_URI_PREFIX.length) === SHARE_DOMAIN_URI_PREFIX
      || this.importProgramLink.substr(0, SHARE_DOMAIN_URI_PREFIX_SHORT.length)
        === SHARE_DOMAIN_URI_PREFIX_SHORT
    ) {
      goSetState();
      addMessage(M.LINK_SHOULD_BE_CLICKED);
      return;
    }

    // Validate link
    if (this.importProgramLink.substr(0, 5) !== "https") {
      goSetState();
      addMessage(M.PROGRAM_IMPORT_ERROR);
      return;
    }

    if (this.importProgramLink.indexOf("Genie%2F") === -1) {
      // If not decoded then decode
      this.importProgramLink = decodeURIComponent(this.importProgramLink);
    }

    // If another url has been appended
    const urlStartingFrom = this.importProgramLink.indexOf("https://firebasestorage");
    this.importProgramLink = this.importProgramLink.substr(
      urlStartingFrom, this.importProgramLink.length
    );

    console.log("Got after decode and url append:", urlStartingFrom, this.importProgramLink);

    if (this.importProgramLink.substr(0, 23) !== "https://firebasestorage") {
      goSetState();
      addMessage(M.PROGRAM_IMPORT_ERROR2);
      return;
    }

    const ref = firebase.storage().refFromURL(this.importProgramLink);
    console.log(ref);
    const endIndex = ref.path.lastIndexOf(".txt");
    const beginIndex = ref.path.lastIndexOf("%2F", endIndex);
    const uuid = ref.path.slice(beginIndex + 3, endIndex);
    const path = `${RNFS.DocumentDirectoryPath}/${uuid}.txt`;
    console.log(ref, endIndex, beginIndex, uuid);

    const finishImport = (importProgramName) => {
      RNFS.unlink(path)
        .then(() => {
          console.log("FILE DELETED");

          this.importProgramLink = false;
          // this.loading = false;
          goSetState();
          addMessage(`Successfully imported ${importProgramName}`);
          firebase.analytics().logEvent("Import_program_success");
        })
        .catch((err) => {
          console.log(err.message);
        });
    };

    if (!(uuid.length > 0)) {
      // Alert
      return;
    }

    firebase
      .storage()
      .ref(ref.path)
      .writeToFile(
        path
      )
      .then((success) => {
        console.log(success);
        RNFS.readFile(path, "utf8")
          .then((item) => {
            // Validate and save
            const newItem = JSON.parse(item);
            const { pauses } = newItem;
            newItem.id = neewProgramId;
            newItem.imported = true;
            console.log("New import item:", newItem);
            if (pauses) {
              AsyncStorage.getItem("program-pause").then((val) => {
                const pauseKey = Object.keys(pauses);
                pauses[neewProgramId] = pauses[pauseKey[0]];
                delete pauses[pauseKey[0]];
                const newVal = { ...JSON.parse(val), ...pauses };
                console.log(newVal);
                AsyncStorage.setItem("program-pause", JSON.stringify(newVal)).then(() => {
                  savePauseProgram(neewProgramId, pauses[neewProgramId]);
                  delete newItem.pauses;
                  saveProgram(neewProgramId, newItem);
                  finishImport(newItem.name);
                });
              });
            } else {
              saveProgram(neewProgramId, newItem);
              finishImport(newItem.name);
            }
          })
          .catch((error) => {
            console.log(error);
          });
      })
      .catch((failure) => {
        console.log(failure);
        addMessage(M.PROGRAM_IMPORT_ERROR3);
        goSetState();
      });
  };

  stopPlayingProgram = (avoidNavigating = true) => {
    const { pump, stopSession } = this.props;
    const { programAltered } = pump.activeProgram;

    this.setState({ stopPlayingProgram: false });

    if (!this.checkConnectStatus()) return;

    stopTimer();
    const stopProgramPload = stopProgramPayload();

    stopSession({
      ...stopProgramPload,
      ...(programAltered && { stoppedSessionRec: true })
    });

    firebase.analytics().logEvent("Program_stop_from_home");

    if (!avoidNavigating) {
      setTimeout(() => {
        this.stopProgramEnter(this.stopProgramEnterVar);
      }, 1500);
    }
  };

  addANewProgram = () => {
    const { pump, addMessage } = this.props;
    const { playStatus, activeProgram } = pump;
    const { playingProgram } = activeProgram;

    if (playingProgram && playStatus !== constants.OP_STOP) {
      addMessage(M.STOP_PLAY_PROGRAM);
    } else {
      this.setState({ addingNewProgram: true });
    }
  };

  filterProgram = async (
    selectedProgramType, selectedPumpType, selectedProgramTag, shouldReset
  ) => {
    const { addMessage } = this.props;
    const { filterApiPrograms, getFilterNextPrograms, searchWord } = this.state;

    let sum = selectedProgramType.concat(selectedPumpType, selectedProgramTag);
    if (searchWord) {
      sum.push({
        id: NAME_SEARCH_ID,
        name: `Name: ${searchWord}`,
        isSelected: true,
      });
    } else {
      sum = sum.filter((item) => item.id !== NAME_SEARCH_ID);
    }

    if (sum.length < 1) {
      // no filter
      this.setState({ seeFilterResult: false });
      return;
    }

    let apiPrograms = [];
    let params = ""; // need to filter library programs from the api

    if (selectedPumpType.length === 1) {
      params = `pumpName=${selectedPumpType[0].key}`;
    }

    if (searchWord) {
      params += params ? "&" : "";
      params += `name=${searchWord}`;
    }

    if (selectedProgramTag.length > 0) {
      params += params ? "&" : "";
      selectedProgramTag.forEach((tag) => {
        params += `tags[]=${tag.id}&`;
      });
      params = params.slice(0, -1);
    }

    if (params) {
      await ApiProgram.filterPrograms(`${params}&hasAll=true`, getFilterNextPrograms).then(({ results, next }) => {
        apiPrograms = shouldReset
          ? formatAPIPrograms(results)
          : filterApiPrograms.concat(formatAPIPrograms(results));
        this.setState({
          filterApiPrograms: apiPrograms,
          getFilterNextPrograms: next
        });
      }).catch((errorMessage) => {
        addMessage(errorMessage);
      });
    } else {
      await ApiProgram.getAllPrograms(API_POPULARITY_SORT, getFilterNextPrograms)
        .then(({ results, next }) => {
          apiPrograms = shouldReset
            ? formatAPIPrograms(results)
            : filterApiPrograms.concat(formatAPIPrograms(results));
          this.setState({
            filterApiPrograms: apiPrograms,
            getFilterNextPrograms: next
          });
        }).catch((errorMessage) => {
          addMessage(errorMessage);
        });
    }

    this.setState({
      showFilterModal: false,
      selectedFilters: sum,
      seeFilterResult: true
    });

    let programs = this.sortMyPrograms();

    if (searchWord) {
      // filter my(local) programs
      programs = programs?.filter(
        (item) => item.name.toLowerCase().includes(searchWord.toLowerCase())
      );
    }

    let filterResult = programs.concat(apiPrograms);

    // filter by program type
    if (selectedProgramType.length === 1) {
      const spType = selectedProgramType[0];
      if (spType.id === "my_program") {
        filterResult = programs;
      } else if (spType.id === "library") {
        filterResult = apiPrograms;
      }
    }

    // filter by pump type
    if (selectedPumpType.length > 0) {
      const typeIds = selectedPumpType.map((type) => type.key);
      filterResult = filterResult.filter((item) => typeIds.includes(item.pumpName));
    }

    // filter by program tag
    if (selectedProgramTag.length > 0) {
      const tagIds = selectedProgramTag.map((tag) => tag.id);
      filterResult = filterResult.filter((item) => item.tags?.some((r) => tagIds.indexOf(r) >= 0));
    }

    this.setState({ filterPrograms: filterResult });
  };

  updateFilter = (id, shouldReset) => {
    const {
      selectedFilters, programTypeIds, pumpTypeIds, pumpTagIds,
    } = this.state;

    // get 3 (program type, pump type, tag) filters from selected filters
    const nProgramTypeIds = [];
    const nPumpTypeIds = [];
    const nPumpTagIds = [];
    selectedFilters.forEach((item) => {
      if (item.id !== id) {
        if (programTypeIds.includes(item.id)) {
          nProgramTypeIds.push(item);
        }

        if (pumpTypeIds.includes(item.id)) {
          nPumpTypeIds.push(item);
        }

        if (pumpTagIds.includes(item.id)) {
          nPumpTagIds.push(item);
        }
      }
    });

    if (id === NAME_SEARCH_ID) {
      this.setState({ searchWord: "" }, () => {
        this.filterProgram(nProgramTypeIds, nPumpTypeIds, nPumpTagIds, shouldReset);
      });
    } else {
      this.filterProgram(nProgramTypeIds, nPumpTypeIds, nPumpTagIds, shouldReset);
    }
  };

  arrayMove(arr, fromIndex, toIndex) {
    const element = arr[fromIndex];
    arr.splice(fromIndex, 1);
    arr.splice(toIndex, 0, element);

    return arr;
  }

  render() {
    const {
      pump, navigation, addMessage,
      saveProgram, programLoading, auth,
      shareProgramWithFriends, duplicateProgram
    } = this.props;
    const {
      connectStatus, playStatus, programId,
      imageCard, bleState, peripherals,
      pumpDevice
    } = pump;

    const {
      addingNewProgram, shouldSync, shouldSyncConfirm,
      selectedSyncProgram, importingProgram, isPumpWarned,
      stopPlayingProgram, goingTo, shouldRecord,
      showTutorialModal, seeAllMyPrograms, seeAllLibrary,
      showFilterModal, sortPLByModalVisible, plSortSelected,
      downloadedProgramsArr, seeFilterResult, getAllNextPrograms,
      tutorialMeasurements, onListPage, apiPrograms,
      selectedFilters, filterPrograms, getFilterNextPrograms
    } = this.state;

    const { MANUAL_PROGRAM_ID } = constants;

    const connected = connectStatus === constants.CONNECT_STATUS.CONNECTED;
    const programs = this.sortMyPrograms();
    let shownPrograms = [];
    const startPoint = (onListPage - 1) * listLengthPerPage;
    if (!seeAllMyPrograms) {
      shownPrograms = programs.slice(0, 2);
    } else {
      shownPrograms = programs.slice(startPoint, startPoint + listLengthPerPage);
    }

    let shownApiPrograms = [];
    if (!seeAllLibrary) {
      shownApiPrograms = apiPrograms.slice(0, 2);
    } else {
      shownApiPrograms = apiPrograms.slice(startPoint, startPoint + listLengthPerPage);
    }

    let shownFilterPrograms = [];
    if (seeFilterResult) {
      shownFilterPrograms = filterPrograms.slice(startPoint, startPoint + listLengthPerPage);
    }

    let pumpWarningMsg;
    if (bleState === false) {
      pumpWarningMsg = "Bluetooth turned off";
    } else if (isEmpty(peripherals) && !connected) {
      pumpWarningMsg = "Cannot find SuperGenie";
    }

    return (
      <Container
        testID="genie-home-view"
        edges={["top"]}
        ref={(ref) => { this.contentView = ref; }}
      >
        <PumpStatusHeader />
        <View style={styles.contentContain}>
          {(seeFilterResult || seeAllMyPrograms || seeAllLibrary) ? (
            <Header
              leftActionText={`${seeFilterResult ? "Filter programs results" : seeAllLibrary ? "Pumpables Library" : "My Programs"}`}
              leftActionEvent={() => this.setState({
                seeFilterResult: false,
                seeAllMyPrograms: false,
                seeAllLibrary: false,
                onListPage: 1,
                filterPrograms: [],
                filterApiPrograms: [],
                getFilterNextPrograms: null,
                searchWord: "",
              })}
              leftButtonStyle={{ marginLeft: 0 }}
            />
          ) : (
            <View style={styles.titleView}>
              <Label maxFontSizeMultiplier={1.2} style={styles.headerTitle}>Programs</Label>
              {!connected ? (
                <TouchableOpacity
                  onPress={() => navigation.navigate("GeniePairing")}
                  style={styles.connectPumpView}
                >
                  <Icon
                    type="MaterialIcons"
                    name="bluetooth-searching"
                    style={styles.connectPumpIcon}
                  />
                  <Label
                    font11
                    blue
                    maxFontSizeMultiplier={1}
                    style={styles.connectPumpText}
                  >
                    CLICK TO CONNECT
                  </Label>
                </TouchableOpacity>
              ) : (<View />)}
            </View>
          )}
          {pumpWarningMsg && !isPumpWarned && (
            <View style={styles.pumpWarningMsg}>
              <Label white weightSemiBold>{pumpWarningMsg}</Label>
              <TouchableOpacity
                style={styles.closeIconArea}
                onPress={() => this.setState({ isPumpWarned: true })}
              >
                <Icon
                  name="close"
                  style={{ fontSize: 25, color: Colors.white }}
                />
              </TouchableOpacity>
            </View>
          )}
          {seeFilterResult ? (
            <>
              <ScrollView
                ref={(ref) => { this.filterEleScrollRef = ref; }}
                contentContainerStyle={styles.filtersContainer}
                horizontal
              >
                {selectedFilters.map((item) => (
                  <PumpingTag
                    showClear
                    key={item.id}
                    id={item.id}
                    label={item.label || item.name}
                    isSelected={item.isSelected}
                    onPressClear={() => {
                      // set shouldReset as true because there are duplicated results
                      this.updateFilter(item.id, true);
                      if (Platform.OS === "android") {
                        this.filterEleScrollRef.scrollTo({ x: 0, animated: true });
                      }
                    }}
                  />
                ))}
              </ScrollView>
              <View style={styles.headerView}>
                <Label font18 grey weightSemiBold maxFontSizeMultiplier={1.3}>
                  {`${filterPrograms.length} program(s) found`}
                </Label>
              </View>
            </>
          ) : (
            <View
              style={styles.buttons}
              collapsable={false}
              ref={(view) => { this.buttonsRef = view; }}
            >
              <ButtonRound
                testID="Programs_find"
                greyLight
                style={styles.findButton}
                onPress={() => this.setState({
                  showFilterModal: true,
                  filterApiPrograms: [],
                  getFilterNextPrograms: null,
                })}
              >
                <Label weightBold font16>Filter</Label>
              </ButtonRound>
              <ButtonRound
                testID="Programs_create_share"
                greyLight
                style={styles.shareButton}
                onPress={this.addANewProgram}
              >
                <Label weightBold font16>Create & Share</Label>
              </ButtonRound>
            </View>
          )}
          {!seeAllLibrary && !seeFilterResult && (
            <View>
              <View
                style={styles.headerView}
                collapsable={false}
                ref={(view) => { this.programRef = view; }}
              >
                <Label font18 grey weightSemiBold maxFontSizeMultiplier={1.3}>
                  {`${seeAllMyPrograms ? programs.length : "My"} Programs`}
                </Label>
                <TouchableOpacity
                  style={styles.seeAll}
                  onPress={() => { this.setState({ seeAllMyPrograms: true }); }}
                >
                  <Label blue font14 underline weightSemiBold maxFontSizeMultiplier={1.2}>
                    {`${seeAllMyPrograms ? "" : "See All"}`}
                  </Label>
                </TouchableOpacity>
              </View>
              {(!programs || programs.length < 1) && (
                <View style={styles.noProgramView}>
                  <Label font16 grey>
                    No programs saved yet!
                  </Label>
                  <TutorialBallon
                    position="50%"
                    direction="top"
                    program="NO_PROGRAM"
                    btnAction={this.handleScrollToEnd}
                  />
                </View>
              )}
            </View>
          )}
          {(!seeAllLibrary || seeFilterResult) && (
            <FlatList
              data={seeFilterResult ? shownFilterPrograms : shownPrograms}
              renderItem={({ item: program, index }) => (
                <HomeTileItem
                  privateProgram={!program.userUUID}
                  index={index}
                  item={program}
                  programLoading={programLoading}
                  imageSource={imageCard[`programRunImage${program.id}`] ? { uri: imageCard[`programRunImage${program.id}`] } : null}
                  key={program.id}
                  shareProgramWithFriends={shareProgramWithFriends}
                  containerStyles={styles.content}
                  programId={program.id}
                  userDisplayName={auth.profile?.displayName}
                  title={program.name}
                  pumpDevice={pumpDevice}
                  isActive={programId === program.id && playStatus !== constants.OP_STOP}
                  isPlaying={programId === program.id && playStatus === constants.OP_START}
                  isPaused={programId === program.id && playStatus === constants.OP_PAUSE}
                  actionEnter={(pauseSteps) => (
                    program.userUUID
                      ? this.onActionEnterPL(program)
                      : program.pumpName === constants.PUMP_DEVICE.GG2
                        ? this.onActionEnterPL(program, pauseSteps, true)
                        : this.onActionEnter(program.id)
                  )}
                  actionStart={() => this.initialActionStart(program)}
                  actionStop={() => this.stopPlayingProgram()}
                  actionPause={this.onActionPause}
                  actionShare={this.onActionShare(program.id)}
                  actionEdit={() => this.onActionEdit(program.id)}
                  actionSync={this.onActionSync(program)}
                  actionDelete={this.onActionDelete}
                  actionDownload={() => this.downloadPL(program)}
                  isDownloaded={downloadedProgramsArr.indexOf(program.id) > -1}
                  navigation={navigation}
                  connected={connected}
                  saveProgram={saveProgram}
                  addMessage={addMessage}
                  moveProgram={this.moveProgram}
                  duplicateProgram={duplicateProgram}
                  refreshPL={() => this.fetchAllProgramsFromApi(sortObject[plSortSelected])}
                />
              )}
              ListFooterComponent={(seeAllMyPrograms || seeFilterResult) && (
                <Pagination
                  listNumber={seeFilterResult ? filterPrograms?.length : programs?.length}
                  listLengthPerPage={listLengthPerPage}
                  goPrevPage={(onPage) => this.setState({ onListPage: onPage })}
                  goNextPage={(onPage) => this.setState({ onListPage: onPage })}
                  reachedLastPage={() => {
                    seeFilterResult && getFilterNextPrograms && this.updateFilter();
                  }}
                />
              )}
              keyExtractor={(program) => program.id}
            />
          )}
          {!seeAllMyPrograms && !seeFilterResult && (
            <View>
              <View
                style={styles.headerView}
                collapsable={false}
                ref={(view) => { this.libraryRef = view; }}
              >
                <Label font18 grey weightSemiBold maxFontSizeMultiplier={1.3}>
                  {`${seeAllLibrary ? `${apiPrograms.length} Programs` : "Pumpables Library"}`}
                </Label>
                <TouchableOpacity
                  style={styles.seeAll}
                  onPress={
                    () => {
                      this.setState({
                        [seeAllLibrary ? "sortPLByModalVisible" : "seeAllLibrary"]: true
                      });
                    }
                  }
                >
                  <Label blue font14 underline weightSemiBold maxFontSizeMultiplier={1.2}>
                    {`${seeAllLibrary ? "Sort by" : "See All"}`}
                  </Label>
                </TouchableOpacity>
              </View>
              <FlatList
                data={shownApiPrograms}
                renderItem={({ item: program, index }) => (
                  <HomeTileItem
                    index={index}
                    item={program}
                    programLoading={programLoading}
                    imageSource={imageCard[`programRunImage${program.id}`] ? { uri: imageCard[`programRunImage${program.id}`] } : null}
                    key={program.id}
                    containerStyles={styles.content}
                    programId={program.id}
                    title={program.name}
                    pumpDevice={pumpDevice}
                    actionEnter={() => this.onActionEnterPL(program)}
                    actionDownload={() => this.downloadPL(program)}
                    isDownloaded={downloadedProgramsArr.indexOf(program.id) > -1}
                    navigation={navigation}
                    connected={connected}
                    addMessage={addMessage}
                  />
                )}
                ListFooterComponent={seeAllLibrary && (
                  <Pagination
                    listNumber={apiPrograms?.length}
                    listLengthPerPage={listLengthPerPage}
                    goPrevPage={(onPage) => this.setState({ onListPage: onPage })}
                    goNextPage={(onPage) => this.setState({ onListPage: onPage })}
                    reachedLastPage={() => { getAllNextPrograms && this.loadMorePLPrograms(); }}
                  />
                )}
                keyExtractor={(program) => program.id}
              />
            </View>
          )}
          {addingNewProgram && (
            <SelectionModal
              isVisible={addingNewProgram}
              title="Create Programs"
              onPressConfirm={this.onAddProgram}
              dataArr={selectionModalDataArr}
              onChangeTexz={(text) => { this.importProgramLink = text; }}
              customSlide={importingProgram}
              customSlidePlaceholder="Paste link"
              customSlideButtonText="Import"
              customSlideSubmit={() => this.importProgram()}
              onPressCloseButton={() => this.setState({ importingProgram: false })}
            />
          )}
          {sortPLByModalVisible && (
            <SelectionModal
              isVisible={sortPLByModalVisible}
              title="Sort by"
              selectedValue={plSortSelected}
              onPressConfirm={this.onPLSortModalSelected}
              onPressCloseButton={() => this.setState({ sortPLByModalVisible: false })}
              dataArr={sortPLByModalDataArr}
            />
          )}
        </View>
        {/* now we don't use it because recording will start on manual page */}
        {shouldRecord && (
          <ConfirmationToast
            title={M.PUMPING_RECORDING_START}
            option1="Cancel"
            option2="I'm Ready"
            onPressConfirm={() => {
              this.setState({ shouldRecord: false });
              this.onActionManual("record");
            }}
            onPressDeny={() => this.setState({ shouldRecord: false })}
          />
        )}
        {shouldSync && (
          <ConfirmationToast
            isSyncProgramModal
            title={M.CONFIRM_SYNC_PROGRAM_PUMP}
            onPressConfirm={this.onSelectSyncProgram}
            onPressDeny={this.onDenySync}
          />
        )}
        {stopPlayingProgram && (
          <ConfirmationToast
            title={`${programId === MANUAL_PROGRAM_ID ? "Manual mode" : "Program"} in progress`}
            subtitle={`Stop ${programId === MANUAL_PROGRAM_ID ? "Manual mode" : "Program"}${goingTo === "Manual" ? " and go into Manual Mode" : " and play program"}?`}
            // Will work for stopping both manual & program
            onPressConfirm={() => this.stopPlayingProgram(false)}
            onPressDeny={() => this.setState({ stopPlayingProgram: false, goingTo: null })}
          />
        )}
        {shouldSyncConfirm && (
          <ConfirmationToast
            title=""
            subtitle={`Are you sure you want to set this program as P${selectedSyncProgram} on SuperGenie? This will overwrite any program recorded on your pump as P${selectedSyncProgram}.`}
            onPressConfirm={this.onConfirmedSync}
            onPressDeny={this.onDenySync}
          />
        )}
        {showTutorialModal && (
          <ModalTutorialSteps
            // handleScrollFunction={this.handleScrollToEnd}
            measurements={tutorialMeasurements}
          />
        )}
        {showFilterModal && (
          <FilterModal
            isVisible={showFilterModal}
            onPressConfirm={this.filterProgram}
            onPressDeny={() => this.setState({ showFilterModal: false })}
            onSaveSearchWord={
              (searchWord, callback) => this.setState({ searchWord }, callback)
            }
          />
        )}
      </Container>
    );
  }
}

Home.propTypes = {
  navigation: PropTypes.object,
  pump: PropTypes.object,
  status: PropTypes.object,
  auth: PropTypes.object,
  user: PropTypes.object,
  enterManualMode: PropTypes.func,
  addMessage: PropTypes.func,
  resumeProgram: PropTypes.func,
  startProgram: PropTypes.func,
  pauseSession: PropTypes.func,
  deleteProgram: PropTypes.func,
  setCurrentProgram: PropTypes.func,
  saveFavoriteProgram: PropTypes.func,
  setProgramsPosition: PropTypes.func,
  saveProgram: PropTypes.func,
  setSuperGenieLoad: PropTypes.func,
  setUpProgram: PropTypes.func,
  stopSession: PropTypes.func,
  programLoading: PropTypes.any,
  setRequesting: PropTypes.func,
  updateAppState: PropTypes.func,
  shareProgramWithFriends: PropTypes.func,
  playWantedToProgram: PropTypes.func,
  duplicateProgram: PropTypes.func,
  showTimerButton: PropTypes.func
};

const styles = StyleSheet.createProportional({
  contentContain: {
    marginHorizontal: 25,
    marginTop: 8,
  },
  headerTitle: {
    fontSize: 22,
    ...Fonts.SemiBold,
    color: Colors.grey
  },
  headerView: {
    flexDirection: "row",
    marginTop: 34,
    marginBottom: 20,
    justifyContent: "space-between",
  },
  content: {
    // flexDirection: "row",
  },
  titleView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  connectPumpView: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
    borderRadius: 15,
    backgroundColor: Colors.backgroundBlue
  },
  connectPumpIcon: {
    fontSize: 14,
    color: Colors.blue
  },
  connectPumpText: {
    marginLeft: 5
  },
  seeAll: {
    flexDirection: "row",
    alignItems: "center"
  },
  buttons: {
    flexDirection: "row",
    marginTop: 20,
    justifyContent: "space-between"
  },
  findButton: {
    width: "39%"
  },
  shareButton: {
    width: "59%"
  },
  pumpWarningMsg: {
    backgroundColor: Colors.coral,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 5,
    marginTop: 4,
    borderRadius: 2,
    flexDirection: "row"
  },
  closeIconArea: {
    position: "absolute",
    right: 0,
    width: 30,
    alignItems: "center"
  },
  filtersContainer: {
    marginTop: 16,
  },
  noProgramView: {
    alignItems: "center",
    marginTop: 8,
  },
});

const mapStateToProps = ({ pump, auth, status }) => ({
  pump, auth, programLoading: status.requesting, status
});

const mapDispatchToProps = {
  addMessage,
  resumeProgram,
  pauseSession,
  startProgram,
  deleteProgram,
  setCurrentProgram,
  updateImageCard,
  saveFavoriteProgram,
  saveProgram,
  setInitialProgramState,
  setUpProgram,
  setSuperGenieLoad,
  stopSession,
  setProgramsPosition,
  setRequesting,
  updateAppState,
  enterManualMode,
  shareProgramWithFriends,
  playWantedToProgram,
  duplicateProgram,
  showTimerButton
};

export default connect(mapStateToProps, mapDispatchToProps)(Home);
