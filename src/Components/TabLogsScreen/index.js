/* eslint-disable react/destructuring-assignment */
import React, { Component, PureComponent } from "react";
import { connect } from "react-redux";
import firebase from "@react-native-firebase/app";
import PropTypes from "prop-types";
import {
  Image, View, TouchableOpacity, ScrollView,
  ImageBackground, SectionList, Platform
} from "react-native";
import moment from "moment";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { navigate, onAddSession } from "../../App/RootNavigation";
import {
  resetLogSubscription, getChartData, logsUpdatedAt,
  resetGoalSubscription, showTimerButton, viewedStashTutorial,
  exportLogsStash, updateLogListPrefs
} from "../../Actions";
import { reset, start } from "../../Actions/Session";
import StyleSheet from "../../Proportional";
import {
  Colors, Fonts, Images, Styles as S
} from "../../Themes";
import { fluidTo } from "../../Services/Convert";
import {
  Label, SearchInput, SegmentInfo
} from "../Shared";
import SelectionModal from "../Shared/SelectionModal";
import Chart from "../TabOutputScreen/Chart";
import TodayHeader from "./todayHeader";
import ConfirmationToast from "../Shared/ConfirmationToast";
import Container from "../Shared/Container";
import Icon from "../Shared/Icon";
import {
  addSessionDataArr, appWidth, filterLogs,
  findTitle, getSetStashAlertStatus
} from "../../Services/SharedFunctions";
import {
  LOGS_TAB, STASH_TAB,
  measureUnitModalDataArr, NURSE_CHART_TYPE, PUMP_CHART_TYPE,
  STASH_ADDED_CHART_TYPE, STASH_REMOVED_CHART_TYPE, STASH_TUTORIAL
} from "../../Config/constants";
import * as M from "../../Config/messages";
import InfoBalloon from "../Shared/InfoBalloon";
import ExportLogsStash from "../Shared/ExportLogsStash";
import { LOGS_STASH_LIST_VIEW_OPTIONS } from "../../Config/LocalStorage";
import LogsStashListModal from "../Shared/LogsStashListModal";
import Alert from "../Shared/Alert";

const Renderables = ["", "session", "stash", "goalMotivator", "reminder"];

const DAY = "DAY";
const WEEK = "WEEK";
const MONTH = "MONTH";

const logsObjRef = {
  stash: "Stash",
  added: "Added",
  removed: "Removed",
  pump: "Pumped",
  feed: "Nursed"
};

const dateTypeArr = [
  { name: "Daily", key: "DAY" },
  { name: "Weekly", key: "WEEK" },
  { name: "Monthly", key: "MONTH" }
];

const tabArr = [
  { name: "Logs", key: LOGS_TAB },
  { name: "Stash", key: STASH_TAB },
];

export const STASH_ACTION_ADD = "stash_action_add";
export const STASH_ACTION_EDIT = "stash_action_edit";
export const STASH_ACTION_REMOVE = "stash_action_remove";

let segmentPos = {};
let headerPos = {};
let addedTextPos = {};
let viewTextPos = {};

class TabLogsScreen extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pageIndex: 1,
      listLength: 10,
      deletingEntry: null,
      onSection: "list",
      routes: [
        { key: "0", title: "Daily", type: DAY },
        { key: "1", title: "Weekly", type: WEEK },
        { key: "2", title: "Monthly", type: MONTH }
      ],
      activeTimeRange: "DAY",
      addingNewSession: false,
      activeTab: LOGS_TAB,
      showMilkStashTutorial: false,
      showExportModal: false,
      msTutorialData: [],
      searchTerm: "",
      customiseList: false,
      showStashAlert: false,
      showStashAlertToday: false,
    };

    // firebase.auth().signOut();
  }

  componentDidMount() {
    const { navigation } = this.props;
    this.updateChartData();
    this.checkStashAlert();

    // For old cases
    AsyncStorage.getItem(LOGS_STASH_LIST_VIEW_OPTIONS)
      .then((val) => {
        if (val) {
          const newVal = JSON.parse(val);
          updateLogListPrefs(
            {
              showProgram: newVal.showProgram,
              showNotes: newVal.showNotes
            }
          ).then(() => {
            AsyncStorage.removeItem(LOGS_STASH_LIST_VIEW_OPTIONS);
          });
        }
      });

    this.focusListener = navigation.addListener(
      "focus",
      () => {
        const { navigation, route } = this.props;
        this.setState({
          pageIndex: 1,
          activeTab: route.params?.activeTab ?? LOGS_TAB,
        });
        navigation.setParams({ activeTab: null });
        getSetStashAlertStatus(false).then((val) => {
          this.setState({ showStashAlertToday: !!val });
        });
      }
    );

    setTimeout(this.initMilkStashTutorial, 1500);
  }

  componentDidUpdate(prevProps) {
    const {
      logList, stashArr, measureUnit, goalStash, totalStash
    } = this.props;

    if (
      prevProps.logList !== logList
      || prevProps.stashArr !== stashArr
      || prevProps.measureUnit !== measureUnit
    ) {
      this.updateChartData(0, null, true);
      console.log("Update Chart Data");
    }

    if (prevProps.goalStash !== goalStash || prevProps.totalStash !== totalStash) {
      this.checkStashAlert();
    }
  }

  componentWillUnmount() {
    this.focusListener();
  }

  initMilkStashTutorial = () => {
    const { hasViewedStashTutorial, viewedStashTutorial } = this.props;

    if (hasViewedStashTutorial) return;

    const stashPositions = [segmentPos, headerPos, addedTextPos, viewTextPos];
    for (let i = 0; i < STASH_TUTORIAL.length; i++) {
      STASH_TUTORIAL[i].xOffset = `${Math.round(
        ((stashPositions[i].x + (stashPositions[i].width / 2)) / appWidth) * 100
      )}%`;
      STASH_TUTORIAL[i].yOffset = stashPositions[i].y + stashPositions[i].height
        + (Platform.OS === "android" ? 10 : 30);
      STASH_TUTORIAL[i].action = () => {};

      if (i === 0) {
        STASH_TUTORIAL[i].xOffset = "75%";
        if (Platform.OS === "ios") { STASH_TUTORIAL[i].yOffset -= 40; }
        STASH_TUTORIAL[i].action = () => this.setState({ activeTab: STASH_TAB });
      } else if (i === 1) {
        STASH_TUTORIAL[i].xOffset = `${parseFloat(STASH_TUTORIAL[i].xOffset) - 5}%`;
        if (parseFloat(STASH_TUTORIAL[i].xOffset) > 90) STASH_TUTORIAL[i].xOffset = "85%";
      } else if (i === 2) {
        STASH_TUTORIAL[i].xOffset = "50%";
      }
    }

    this.setState({
      showMilkStashTutorial: true,
      msTutorialData: STASH_TUTORIAL
    });

    viewedStashTutorial(true);
  };

  deleteConfirm = () => {
    const { remove } = this.props;
    const { deletingEntry } = this.state;

    remove(deletingEntry);
    this.setState({ deletingEntry: null });
  };

  deleteDeny = () => {
    this.setState({ deletingEntry: null });
  };

  openActionMenu = () => this.actionMenu.showButtons();

  loadMore = () => {
    const { pageIndex } = this.state;
    this.setState({ pageIndex: pageIndex + 1 });
  };

  actionMenuRef = (actionMenu) => {
    this.actionMenu = actionMenu;
  };

  keyExtractor = ({ key }) => key;

  updateChartData = (value = 0, chartType = null, forceUpdate = false) => {
    const {
      updatedAt, getChartData, summaryHourlyDaily,
      measureUnit, stashSummaryHourlyDaily
    } = this.props;

    const updatedAt1 = updatedAt || false;

    chartType = chartType || this.state.chartType || DAY;
    this.setState({ activeTimeRange: chartType });

    let chartDateMoment = moment(this.state.chartDate || Date.now(), "x");
    const period = chartType === DAY ? "hour" : "day";

    chartDateMoment
      .add(value, chartType)
      .startOf(period);

    const maxDate = moment()
      .startOf(period)
      .add(1, period);

    if (chartDateMoment.isAfter(maxDate)) {
      chartDateMoment = maxDate;
    }

    const chartDate = chartDateMoment.format("x");

    if ((chartDate !== this.state.chartDate
      || chartType !== this.state.chartType
      || updatedAt1 !== this.state.updatedAt
      || !this.props.pumpedChart.chartData
      || forceUpdate)) {
      firebase
        .analytics()
        .logEvent("outputscreen", {
          chartDate,
          chartType,
          updatedAt: updatedAt1
        });

      getChartData({
        chartDate,
        chartType,
        summaryHourlyDaily
      },
      false,
      measureUnit,
      PUMP_CHART_TYPE);

      getChartData({
        chartDate,
        chartType,
        summaryHourlyDaily
      },
      false,
      measureUnit,
      NURSE_CHART_TYPE);

      getChartData({
        chartDate,
        chartType,
        summaryHourlyDaily: stashSummaryHourlyDaily
      },
      false,
      measureUnit,
      STASH_ADDED_CHART_TYPE);

      getChartData({
        chartDate,
        chartType,
        summaryHourlyDaily: stashSummaryHourlyDaily
      },
      false,
      measureUnit,
      STASH_REMOVED_CHART_TYPE);

      this.setState({
        updatedAt,
        chartDate,
        chartType,
        chartDow: chartDateMoment.day()
      });
    }
  };

  getBreastSide = (type) => {
    if (type === "double") {
      return "Both";
    }
    return type.charAt(0).toUpperCase() + type.slice(1);
  };

  renderItem = ({ item, index }) => {
    const { measureUnit, logListPrefs } = this.props;
    const { onSection } = this.state;
    const { showNotes, showProgram } = logListPrefs;

    if (item.deletedAt || Renderables.indexOf(item.type) <= 0) return null;

    const itemIndex = index;
    const {
      volume, type, sessionType, notes,
      totalDurationString, durationString, duration,
      startedAt, breastType, programName
    } = item;

    // Manual logs duration is always 0, recording has a value
    const durationToUse = duration === 0 ? totalDurationString : durationString;

    if (onSection === "list") {
      const logType = (type === "session" || type === "stash")
        ? logsObjRef[sessionType]
        : logsObjRef[type];
      let listIcon = Images.pumpIcon;
      let notesIcon = Images.notesIconBlue;
      switch (logType) {
        case "Pumped":
          listIcon = Images.pumpIcon;
          notesIcon = Images.notesIconBlue;
          break;
        case "Nursed":
          listIcon = Images.feedIcon;
          notesIcon = Images.notesIconGreen;
          break;
        case "Added":
          listIcon = Images.addedIcon;
          notesIcon = Images.notesIconBlue;
          break;
        case "Removed":
          listIcon = Images.removedIcon;
          notesIcon = Images.notesIconGreen;
          break;
        default:
          break;
      }

      return (
        <TouchableOpacity
          style={[
            styles.listContainer,
            // {
            //   height: (type === "session" && sessionType === "pump") ? 103 : 80
            // }
          ]}
          onPress={() => this.onPressEdit(itemIndex, programName)}
        >
          <View
            style={styles.listIconContainer}
          >
            <Image
              source={listIcon}
              style={styles.listIcon}
            />
            <View
              style={{
                flexDirection: "column",
                justifyContent: "space-between",
                paddingLeft: 7
              }}
            >
              <View style={styles.topListInfo}>
                <Label
                  testID="session_type_label"
                  font14
                  weightSemiBold
                  grey
                >
                  {logType}
                </Label>
                <View style={styles.topRightCont}>
                  {sessionType !== "feed" && (
                    <Label
                      testID="session_volume"
                      weightSemiBold
                      maxFontSizeMultiplier={1}
                      font14
                      style={[{
                        color: (logType === "Pumped" || logType === "Added") ? Colors.blue : Colors.lightBlue
                      },
                      styles.sessionVolume
                      ]}
                    >
                      {logType === "Removed" && "-"}
                      {fluidTo({
                        measureUnit,
                        value: volume,
                        showUnit: true
                      })}
                    </Label>
                  )}
                  {type === "session" && (
                    <View
                      style={[
                        styles.breastTypeView,
                        {
                          backgroundColor: sessionType === "pump" ? Colors.blue : Colors.lightBlue
                        }
                      ]}
                    >
                      <Label style={styles.breastTypeText} font12 maxFontSizeMultiplier={1} white>
                        {this.getBreastSide(breastType)}
                      </Label>
                    </View>
                  )}
                </View>
              </View>
              <View
                style={{ flexDirection: "row" }}
              >
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={Images.calendarIcon}
                    style={{ width: 12, height: 12, marginRight: 2 }}
                  />
                  <Label
                    font12
                    lightGrey3
                    style={{ paddingTop: 3 }}
                    maxFontSizeMultiplier={1}
                  >
                    {moment(startedAt).format("MMM DD")}
                  </Label>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", marginLeft: 10 }}>
                  <Icon
                    name="time"
                    style={styles.clockIcon}
                  />
                  <Label
                    font12
                    lightGrey3
                    style={{ paddingTop: 3 }}
                    maxFontSizeMultiplier={1}
                  >
                    {moment(startedAt).format("hh:mm A")}
                  </Label>
                </View>
                {type === "session" && (
                  <View style={styles.stopwatchView}>
                    <Icon
                      name="stopwatch"
                      style={styles.clockIcon}
                    />
                    <Label
                      font12
                      lightGrey3
                      style={{ paddingTop: 3 }}
                      maxFontSizeMultiplier={1}
                    >
                      {durationToUse}
                    </Label>
                  </View>
                )}
              </View>
              {type === "session" && sessionType === "pump" && showProgram && (
                <View
                  style={styles.programView}
                >
                  <Image
                    source={Images.tabSuperGenieOff}
                    style={styles.programIcon}
                  />
                  <Label
                    style={styles.flex1}
                    numberOfLines={1}
                    lightGrey3
                    font12
                    maxFontSizeMultiplier={1.1}
                  >
                    {programName || "No program"}
                  </Label>
                </View>
              )}
            </View>
          </View>
          {showNotes && notes && (
            <View style={styles.noteView}>
              <Image
                source={notesIcon}
                style={styles.noteIcon}
              />
              <Label
                blue={notesIcon === Images.notesIconBlue}
                darkGreen2={notesIcon !== Images.notesIconBlue}
                font12
              >
                {notes}
              </Label>
            </View>
          )}
        </TouchableOpacity>
      );
    }
  };

  renderLink = ({ item, section }) => {
    const { logList, stashArr } = this.props;
    const {
      activeTab, pageIndex, listLength,
      searchTerm
    } = this.state;
    const data = activeTab === LOGS_TAB
      ? (logList || [])
      : (stashArr || []);
    const { logsLen } = section;

    return (
      searchTerm
        ? (
          <Label font14 weightSemiBold blue style={styles.noSearchResText}>
            {`${logsLen === 0 ? "No search results" : ""}`}
          </Label>
        )
        : (pageIndex * listLength) < data.length && (
          <TouchableOpacity onPress={this.loadMore}>
            <Label font14 weightSemiBold blue style={styles.link}>{item}</Label>
          </TouchableOpacity>
        )
    );
  };

  onPressEdit = (itemIndex, programName) => {
    const { resetLog, logList, stashArr } = this.props;
    const { activeTab } = this.state;

    if (activeTab === LOGS_TAB) {
      const entry = logList[itemIndex];
      resetLog(entry);
      navigate("SessionModal", { programName });
    } else if (activeTab === STASH_TAB) {
      navigate("StashScreen", { action: STASH_ACTION_EDIT, stashRecord: stashArr[itemIndex] });
    }
  };

  onPressDelete = (itemIndex) => {
    const { logList } = this.props;
    const deletingEntry = logList[itemIndex];
    console.log("onPressDelete", itemIndex, deletingEntry);
    this.setState({ deletingEntry });
  };

  switchView = () => {
    const { onSection } = this.state;

    const type = onSection === "list" ? "graph" : "list";

    this.setState({
      onSection: type
    });
    if (type === "graph") {
      this.updateChartData();
    }
  };

  goBackToRecord = () => {
    const { showTimerButton } = this.props;

    navigate("SessionModal", { actionType: "record" });
    showTimerButton(null);
  };

  onNextDate = () => this.updateChartData(1, this.state.chartType);

  onPrevDate = () => this.updateChartData(-1, this.state.chartType);

  swipePerformed = (dir) => {
    if (dir === "right") {
      this.onPrevDate();
    } else if (dir === "left") {
      this.onNextDate();
    }
  };

  segmentChanged = (index) => {
    const { onSection, routes } = this.state;

    if (onSection === "list") {
      this.setState({
        onSection: "graph"
      });
    }
    this.updateChartData(0, routes[index].type);
  };

  handleTabChange = (index) => {
    this.setState({
      activeTab: index,
      searchTerm: ""
    });
  };

  setCustomisedList = (data) => {
    const { logListPrefs } = this.props;

    const newLogsStashListView = { ...logListPrefs, ...data };

    updateLogListPrefs(newLogsStashListView);
  };

  prepLogs = (logList) => {
    const { pump } = this.props;
    const { programs } = pump;

    const filteredLogs = filterLogs(logList);

    // Add program name to logs
    const createdIdArr = [];
    const programsIndexArr = [];
    // eslint-disable-next-line no-unused-vars, no-restricted-syntax
    for (const key of Object.keys(programs)) {
      createdIdArr.push(programs[key].createdId);
      programsIndexArr.push(key);
    }

    for (let i = 0; i < filteredLogs.length; i++) {
      const foundProgramIndex = createdIdArr.indexOf(filteredLogs[i].programId);
      if (foundProgramIndex > -1 && filteredLogs[i].programId) {
        filteredLogs[i].programName = programs[programsIndexArr[foundProgramIndex]].name;
      }
    }
    return filteredLogs;
  };

  checkStashAlert = () => {
    const { goalStash, totalStash } = this.props;
    if (totalStash < goalStash) {
      this.setState({ showStashAlert: true });
    } else {
      this.setState({ showStashAlert: false });
    }
  };

  render() {
    const {
      logList, measureUnit, pumpedChart, nursedChart,
      resetLog, defaultSessionType, sessionStart,
      stashArr, stashAddedChart, stashRemovedChart,
      totalStash, logListPrefs
    } = this.props;
    const {
      chartType, chartDow, onSection,
      pageIndex, listLength, activeTab,
      activeTimeRange, addingNewSession, deletingEntry,
      showMilkStashTutorial, msTutorialData, showExportModal,
      customiseList, showStashAlert, showStashAlertToday,
      searchTerm
    } = this.state;

    const hasContent = activeTab === LOGS_TAB
      ? (logList && logList.length > 0)
      : (stashArr && stashArr.length > 0);
    let data = activeTab === LOGS_TAB
      ? this.prepLogs(logList)
      : stashArr;
    const showLength = pageIndex * listLength;

    if (searchTerm) {
      // If searching for a value
      const newData = [];
      for (let i = 0; i < data.length; i++) {
        if (
          (data[i].programName && data[i].programName.indexOf(searchTerm) > -1)
            || (data[i].notes && data[i].notes.indexOf(searchTerm) > -1)
        ) {
          newData.push(data[i]);
        }
      }

      data = newData;
    }

    const totalLogs = data.length;

    return (
      <Container
        noScroll
        edges={["top"]}
        testID="logs-view-test"
      >
        {/* Can't use because of virtualized list error <Content></Content> */}
        <View style={{ flex: 1 }}>
          <TodayHeader
            iconPress={(action) => {
              if (activeTab === LOGS_TAB) {
                onAddSession("manual", resetLog, sessionStart, defaultSessionType);
              } else if (activeTab === STASH_TAB) {
                if (action === "plus") {
                  navigate("StashScreen", { action: STASH_ACTION_ADD });
                } else if (action === "minus") {
                  navigate("StashScreen", { action: STASH_ACTION_REMOVE });
                }
              }
            }}
            showExportModal={
              () => this.setState({ showExportModal: true })
            }
            activeTab={activeTab}
            getbtnsViewMeasurements={(x) => { headerPos = x; }}
          />
          <SegmentInfo
            data={tabArr}
            onChange={this.handleTabChange}
            active={activeTab}
            activeColor={Colors.blue}
            inactiveColor={Colors.lightGrey2}
            inactiveBorderColor={Colors.lightGrey}
            containerStyle={styles.tabContainer}
            style={styles.tabSegment}
            contrastMode={false}
            getContMeasurements={(x) => { segmentPos = x; }}
          />
          {activeTab === STASH_TAB && showStashAlert && showStashAlertToday && (
            <Alert
              title="Available stash is under your goal"
              onClose={() => {
                this.setState({ showStashAlertToday: false });
                getSetStashAlertStatus(true);
              }}
            />
          )}
          <View style={styles.infoHeaderView}>
            <ImageBackground
              source={activeTab === LOGS_TAB ? Images.bgImageLogs : Images.bgImageStash}
              style={styles.infoHeader}
              imageStyle={{ borderRadius: 10 }}
            >
              <View style={{ flexDirection: "row", marginTop: 10, alignSelf: "center" }}>
                <SegmentInfo
                  data={dateTypeArr}
                  onChange={(x, index) => { this.segmentChanged(index); }}
                  active={activeTimeRange}
                  activeColor={Colors.white}
                  inactiveColor={Colors.lightBlue}
                  transparent
                  style={styles.dateTypeSegment}
                  textStyle={styles.dateTypeText}
                />
              </View>
              {activeTab === LOGS_TAB && (
                <View
                  style={styles.infoView}
                >
                  <View
                    style={styles.infoCol}
                  >
                    <Label
                      font14
                      white
                      maxFontSizeMultiplier={1}
                    >
                      Pump
                    </Label>
                    <Label
                      white
                      font18
                      maxFontSizeMultiplier={1}
                      style={styles.infoText}
                      getTextMeasurements={(x) => { addedTextPos = x; }}
                    >
                      {fluidTo({
                        measureUnit,
                        value: pumpedChart.chartVolume,
                        showUnit: true
                      })}
                    </Label>
                  </View>
                  <View
                    style={styles.infoCol}
                  >
                    <Label
                      font14
                      white
                      maxFontSizeMultiplier={1}
                    >
                      Duration
                    </Label>
                    <Label
                      font18
                      white
                      maxFontSizeMultiplier={1}
                      style={styles.infoText}
                    >
                      {pumpedChart.chartDurationString || ""}
                    </Label>
                  </View>
                </View>
              )}
              {activeTab === STASH_TAB && (
                <View
                  style={styles.infoView}
                >
                  <View
                    style={styles.infoCol}
                  >
                    <Label
                      font14
                      white
                      maxFontSizeMultiplier={1}
                    >
                      Available now
                    </Label>
                    <View style={styles.availableStashContainer}>
                      {showStashAlert && (
                        <Icon
                          name="alert"
                          type="MaterialCommunityIcons"
                          style={styles.infoIcon}
                        />
                      )}
                      <Label
                        font18
                        white
                        maxFontSizeMultiplier={1}
                        style={styles.infoText}
                      >
                        {fluidTo({
                          measureUnit,
                          value: totalStash,
                          showUnit: true
                        })}
                      </Label>
                    </View>
                  </View>
                  <View
                    style={styles.infoCol}
                  >
                    <Label
                      font14
                      white
                      maxFontSizeMultiplier={1}
                    >
                      Added
                    </Label>
                    <Label
                      font18
                      white
                      maxFontSizeMultiplier={1}
                      style={styles.infoText}
                    >
                      {fluidTo({
                        measureUnit,
                        value: stashAddedChart.chartVolume,
                        showUnit: true
                      })}
                    </Label>
                  </View>
                  <View
                    style={styles.infoCol}
                  >
                    <Label
                      font14
                      white
                      maxFontSizeMultiplier={1}
                    >
                      Removed
                    </Label>
                    <Label
                      font18
                      white
                      maxFontSizeMultiplier={1}
                      style={styles.infoText}
                    >
                      {fluidTo({
                        measureUnit,
                        value: stashRemovedChart.chartVolume,
                        showUnit: true
                      })}
                    </Label>
                  </View>
                </View>
              )}
            </ImageBackground>
          </View>
          <View style={[styles.viewToggleCont, onSection === "list" && styles.toggleContList]}>
            {onSection === "list" && (
              <Label
                font16
                style={styles.logText}
              >
                {`${totalLogs} ${activeTab === LOGS_TAB ? "log" : "record"}${totalLogs === 1 ? "" : "s"}`}
              </Label>
            )}
            {onSection === "graph" && (
              <DateSelector
                chartTitle={pumpedChart.chartTitle || " "}
                nextDate={this.onNextDate}
                prevDate={this.onPrevDate}
              />
            )}
            <View style={styles.rightCustView}>
              {onSection === "list" && (
                <TouchableOpacity
                  onPress={() => this.setState({ customiseList: true })}
                  style={[styles.viewToggle, styles.customiseView]}
                >
                  <Label
                    font12
                    maxFontSizeMultiplier={1.3}
                    lightGrey2
                    style={styles.viewToggleText}
                  >
                    CUSTOMISE
                  </Label>
                  <Icon
                    name="tune"
                    type="MaterialIcons"
                    style={styles.viewIcon}
                  />
                </TouchableOpacity>
              )}
              <TouchableOpacity
                onPress={this.switchView}
                style={styles.viewToggle}
              >
                <Label
                  font12
                  maxFontSizeMultiplier={1.3}
                  lightGrey2
                  style={styles.viewToggleText}
                  getTextMeasurements={(x) => { viewTextPos = x; }}
                >
                  VIEW
                </Label>
                <Icon
                  name={onSection === "list" ? "grid-sharp" : "list-sharp"}
                  style={styles.viewIcon}
                />
              </TouchableOpacity>
            </View>
          </View>
          {onSection === "list" && (
            <View
              style={styles.searchView}
            >
              <SearchInput
                placeholder="Search by keyword here"
                searchTerm={searchTerm}
                searchFor={(term) => this.setState({ searchTerm: term })}
              />
            </View>
          )}
          {onSection === "list" ? (
            hasContent ? (
              <SectionList
                ref={(ref) => { this.sectionListRef = ref; }}
                keyExtractor={this.keyExtractor}
                sections={[
                  {
                    title: "Logs",
                    data: data.slice(0, showLength),
                    renderItem: this.renderItem
                  },
                  {
                    logsLen: data.length,
                    data: ["Show more"],
                    renderItem: this.renderLink
                  },
                ]}
                style={styles.sectionList}
              />
            ) : (
              <View
                style={styles.noLogs}
              >
                <Label font20 weightBold center blue>
                  You haven't logged
                  {"\n"}
                  any sessions yet
                </Label>
              </View>
            )
          ) : (
            <ScrollView>
              <View style={styles.chartWrapper}>
                <View style={[styles.chartView, activeTab === LOGS_TAB && styles.chartPumpView]}>
                  {activeTab === LOGS_TAB && (
                    <Chart
                      title="Pumped"
                      data={pumpedChart.chartData || []}
                      dow={chartDow || 0}
                      maxValue={[
                        fluidTo({
                          measureUnit,
                          value: pumpedChart.chartMaxVolume,
                          showUnit: false
                        }),
                        pumpedChart.chartMaxDuration
                      ]}
                      dateType={chartType || DAY}
                      swipePerformed={this.swipePerformed}
                      measureUnit={[
                        findTitle(measureUnitModalDataArr, measureUnit, true),
                        "m"
                      ]}
                      yAxisValue="volume"
                      swapEnabled
                      barColor={Colors.backgroundBlue}
                    />
                  )}
                  {activeTab === STASH_TAB && (
                    <Chart
                      title="Added"
                      data={stashAddedChart.chartData || []}
                      dow={chartDow || 0}
                      maxValue={[
                        fluidTo({
                          measureUnit,
                          value: stashAddedChart.chartMaxVolume,
                          showUnit: false
                        }),
                        0
                      ]}
                      dateType={chartType || DAY}
                      swipePerformed={this.swipePerformed}
                      measureUnit={[
                        findTitle(measureUnitModalDataArr, measureUnit, true),
                        "m"
                      ]}
                      yAxisValue="volume"
                      barColor={Colors.backgroundBlue}
                    />
                  )}
                </View>
              </View>
              <View style={styles.chartWrapper}>
                <View style={styles.chartView}>
                  {activeTab === LOGS_TAB && (
                    <Chart
                      title="Nursed"
                      data={nursedChart.chartData || []}
                      dow={chartDow || 0}
                      maxValue={[0, nursedChart.chartMaxDuration]}
                      dateType={chartType || DAY}
                      swipePerformed={this.swipePerformed}
                      measureUnit={[null, "m"]}
                      yAxisValue="actualDuration"
                      barColor={Colors.backgroundBlue}
                    />
                  )}
                  {activeTab === STASH_TAB && (
                    <Chart
                      title="Removed"
                      data={stashRemovedChart.chartData || []}
                      dow={chartDow || 0}
                      maxValue={[
                        fluidTo({
                          measureUnit,
                          value: stashRemovedChart.chartMaxVolume,
                          showUnit: false
                        }),
                        0
                      ]}
                      dateType={chartType || DAY}
                      swipePerformed={this.swipePerformed}
                      measureUnit={[
                        findTitle(measureUnitModalDataArr, measureUnit, true),
                        "m"
                      ]}
                      yAxisValue="volume"
                      barColor={Colors.backgroundBlue}
                    />
                  )}
                </View>
              </View>
            </ScrollView>
          )}
        </View>
        {addingNewSession && (
          <SelectionModal
            isVisible={addingNewSession}
            title="Add session"
            onPressConfirm={(selection) => {
              this.setState({ addingNewSession: false });
              onAddSession(selection, resetLog, sessionStart, defaultSessionType);
            }}
            dataArr={addSessionDataArr}
          />
        )}
        {!!deletingEntry && (
          <ConfirmationToast
            onPressConfirm={this.deleteConfirm}
            onPressDeny={this.deleteDeny}
            subtitle={M.CONFIRM_REMOVE_SESSION}
            title={M.REMOVE_SESSION}
          />
        )}
        {showMilkStashTutorial && (
          <InfoBalloon
            dataArr={msTutorialData}
            finishedAction={() => this.setState({ showMilkStashTutorial: false })}
            closeAction={() => this.setState({ showMilkStashTutorial: false })}
          />
        )}
        {showExportModal && (
          <ExportLogsStash
            exportData={exportLogsStash}
            onClose={() => this.setState({ showExportModal: false })}
          />
        )}
        {customiseList && (
          <LogsStashListModal
            activeTab={activeTab}
            data={logListPrefs}
            setCustomisedList={this.setCustomisedList}
            onClose={() => this.setState({ customiseList: false })}
          />
        )}
        {
          // <ActionMenu navGo={navGo} ref={this.actionMenuRef} />
        }
      </Container>
    );
  }
}

class DateSelector extends PureComponent {
  render() {
    const { chartTitle, prevDate, nextDate } = this.props;

    return (
      <View style={styles.periodSelector}>
        <TouchableOpacity
          style={styles.periodSelectorButton}
          activeOpacity={0.8}
          onPress={prevDate}
        >
          <Icon style={styles.arrow} name="chevron-back-outline" />
        </TouchableOpacity>
        <View style={styles.chartTitleView}>
          <Label
            maxFontSizeMultiplier={1}
            weightBold
            style={styles.periodSelectorDescription}
          >
            {chartTitle}
          </Label>
        </View>
        <TouchableOpacity
          style={styles.periodSelectorButton}
          activeOpacity={0.8}
          onPress={nextDate}
        >
          <Icon style={[styles.arrow, { alignSelf: "flex-end" }]} name="chevron-forward-outline" />
        </TouchableOpacity>
      </View>
    );
  }
}

DateSelector.propTypes = {
  chartTitle: PropTypes.string,
  prevDate: PropTypes.func,
  nextDate: PropTypes.func
};

const styles = StyleSheet.create({
  item: {
    flexDirection: "row",
    paddingTop: 28
  },
  chartTitleView: {
    flexDirection: "row",
    alignItems: "center"
  },
  infoHeaderView: {
    height: "26%",
    minHeight: 160,
    marginLeft: 25,
    marginRight: 25,
    marginTop: 5,
    marginBottom: 10
  },
  infoHeader: {
    height: "100%",
    width: "100%",
    justifyContent: "flex-start",
    resizeMode: "cover"
  },
  infoDaily: {
    height: 25,
    width: 80,
    borderTopLeftRadius: 3,
    borderBottomLeftRadius: 3,
    borderWidth: 1,
    borderColor: Colors.white,
    justifyContent: "center",
    margin: 15,
    marginRight: 0
  },
  infoWeekly: {
    height: 25,
    width: 80,
    borderWidth: 1,
    borderColor: Colors.white,
    justifyContent: "center",
    marginTop: 15,
    marginBottom: 15
  },
  infoMonthly: {
    height: 25,
    width: 80,
    borderTopRightRadius: 3,
    borderBottomRightRadius: 3,
    borderWidth: 1,
    borderColor: Colors.white,
    justifyContent: "center",
    margin: 15,
    marginLeft: 0
  },
  infoView: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    marginTop: "9%"
  },
  infoCol: {
    flexDirection: "column",
    alignItems: "center"
  },
  availableStashContainer: {
    flexDirection: "row",
    alignItems: "center"
  },
  infoIcon: {
    fontSize: 20,
    marginRight: 5,
    color: Colors.blue
  },
  infoText: {
    fontWeight: "700"
  },
  sectionList: {
    ...S.internalContainer,
    paddingTop: 0,
  },
  listContainer: {
    marginHorizontal: 25,
    backgroundColor: Colors.white,
    padding: 0,
    marginBottom: 12
  },
  stopwatchView: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 10
  },
  topListInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: appWidth - 97
  },
  topRightCont: {
    flexDirection: "row",
    marginTop: 6
  },
  breastTypeView: {
    borderRadius: 4,
    paddingHorizontal: 7,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 7,
    height: 22
  },
  breastTypeText: {
    marginTop: 2
  },
  sessionVolume: {
    fontWeight: "600",
    marginTop: 1
  },
  viewToggleCont: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 25,
    justifyContent: "space-between"
  },
  toggleContList: {
    marginTop: 10,
    marginBottom: 15
  },
  rightCustView: {
    flexDirection: "row",
    alignItems: "center"
  },
  logText: {
    fontWeight: Platform.OS === "ios" ? "600" : "700"
  },
  clockIcon: {
    fontSize: 13,
    color: Colors.lightGrey2,
    marginRight: 2
  },
  viewToggle: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.backgroundGrey,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  customiseView: {
    marginRight: 5
  },
  viewToggleText: {
    fontWeight: Platform.OS === "ios" ? "600" : "700",
    marginRight: 5
  },
  viewIcon: {
    fontSize: 18,
    color: Colors.lightGrey2
  },
  searchView: {
    marginHorizontal: 25,
    marginBottom: 10
  },
  listIconContainer: {
    flexDirection: "row"
  },
  listIcon: {
    width: 40,
    height: 40,
    alignSelf: "center"
  },
  programView: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Platform.OS === "android" ? 2 : 4,
    width: appWidth - 97,
    overflow: "hidden"
  },
  programIcon: {
    width: 13,
    height: 13,
    marginRight: 4,
    marginBottom: 2,
    marginLeft: -1
  },
  flex1: {
    flex: 1
  },
  chartWrapper: {
    backgroundColor: Colors.backgroundGrey,
    marginBottom: 20,
    marginHorizontal: 25,
    borderRadius: 10
  },
  chartView: {
    height: 340
  },
  chartPumpView: {
    marginBottom: 50
  },
  separatorItem: {
    position: "absolute",
    left: 80,
    right: 35,
    top: 0,
    height: 1,
    backgroundColor: Colors.whiteFive
  },
  periodSelector: {
    marginTop: 4,
    height: 48,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: Colors.white,
    // shadowColor: "rgba(38, 75, 78, 0.2)",
    // shadowOffset: {
    //   width: 0,
    //   height: 1
    // },
    // shadowRadius: 5,
    // shadowOpacity: 1,
    zIndex: 10
  },
  periodSelectorDescription: {
    letterSpacing: 1,
    fontSize: 15,
    fontWeight: "600"
  },
  periodSelectorButton: {
    height: 48,
    width: 25,
    justifyContent: "center"
  },
  separatorDate: {
    left: 0,
    right: 0,
    borderColor: Colors.whiteFive
  },
  itemFirst: {
    paddingTop: 0
  },
  itemCircle: {
    width: 8,
    height: 8,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.greyishBrown,
    backgroundColor: "transparent",
    marginTop: 12,
    zIndex: 20
  },
  itemCircleSmall: {
    width: 4,
    height: 4,
    borderRadius: 2,
    borderWidth: 1,
    marginTop: 14,
    marginLeft: 2
  },
  itemDate: {
    width: 38,
    paddingLeft: 12,
    textAlign: "center",
    fontSize: 12,
    ...Fonts.SemiBold,
    color: Colors.greyishBrown
  },
  itemDateHidden: {
    opacity: 0
  },
  itemMonth: {
    fontSize: 8,
    color: Colors.greyish
  },
  itemDash: {
    width: 4,
    backgroundColor: Colors.whiteSix,
    position: "absolute",
    bottom: 0,
    left: 40,
    zIndex: 10,
    top: 0
  },
  itemDashFirst: {
    top: 14
  },
  noChanges: {},
  modalRow: {
    minHeight: 38,
    marginVertical: 5,
    flexDirection: "row"
  },
  actionButtonPosition: {
    position: "absolute",
    right: (parseInt(appWidth / 2, 10)) - 30,
    bottom: 22,
    zIndex: 31
  },
  actionButtonIconStyle: {
    marginBottom: 2
  },
  actionButtonContent: {
    backgroundColor: Colors.windowsBlue
  },
  arrow: {
    color: Colors.lightGrey2,
    fontSize: 15
  },
  link: {
    alignSelf: "center",
    textDecorationLine: "underline",
    marginTop: 15,
    marginBottom: 60,
  },
  noSearchResText: {
    alignSelf: "center",
    marginTop: 15,
    marginBottom: 60,
  },
  noLogs: {
    height: 80,
    width: "80%",
    marginLeft: "10%",
    marginTop: "5%"
  },
  tabContainer: {
    marginBottom: 10,
  },
  tabSegment: {
    borderTopWidth: 0,
    borderLeftWidth: 0,
    borderRightWidth: 0,
    backgroundColor: "transparent",
    width: "50%",
    height: 46,
  },
  dateTypeSegment: {
    width: 90,
    height: 35
  },
  dateTypeText: {
    fontWeight: "400"
  },
  noteView: {
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.backgroundGrey,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginTop: 8
  },
  noteIcon: {
    width: 14,
    height: 14,
    marginRight: 10
  }
});

TabLogsScreen.propTypes = {
  navigation: PropTypes.object,
  route: PropTypes.object,
  params: PropTypes.any,
  resetLog: PropTypes.func.isRequired,
  logList: PropTypes.array,
  stashArr: PropTypes.array,
  totalStash: PropTypes.number,
  measureUnit: PropTypes.string,
  updatedAt: PropTypes.number,
  getChartData: PropTypes.func,
  summaryHourlyDaily: PropTypes.object,
  stashSummaryHourlyDaily: PropTypes.object,
  sessionStart: PropTypes.func,
  pumpedChart: PropTypes.object,
  nursedChart: PropTypes.object,
  stashAddedChart: PropTypes.object,
  stashRemovedChart: PropTypes.object,
  defaultSessionType: PropTypes.string,
  remove: PropTypes.func,
  showTimerButton: PropTypes.func,
  viewedStashTutorial: PropTypes.func,
  hasViewedStashTutorial: PropTypes.bool,
  pump: PropTypes.object,
  goalStash: PropTypes.number,
  logListPrefs: PropTypes.object
};

const mapStateToProps = ({
  logs, auth, status, pump, goals
}) => {
  const {
    logsArray, summariesUpdatedAt, summaryHourlyDaily,
    nursedChart, logsMap, pumpedChart, stashArr,
    stashAddedChart, stashRemovedChart, stashSummaryHourlyDaily,
    totalStash
  } = logs;
  const { defaultSessionType, measureUnit, logListPrefs } = auth.profile;
  const { hasViewedStashTutorial } = status;
  const goalStash = goals.list.goal_stash?.volume;

  return {
    pump,
    defaultSessionType,
    stashArr,
    totalStash,
    logsMap,
    logList: logsArray,
    updatedAt: summariesUpdatedAt,
    measureUnit: measureUnit || "mililitre",
    summaryHourlyDaily,
    stashSummaryHourlyDaily,
    pumpedChart,
    nursedChart,
    stashAddedChart,
    stashRemovedChart,
    hasViewedStashTutorial,
    goalStash,
    logListPrefs
  };
};

const mapDispatchToProps = {
  resetLogSubscription,
  resetGoalSubscription,
  getChartData,
  logsUpdatedAt,
  resetLog: reset,
  sessionStart: start,
  showTimerButton,
  viewedStashTutorial
};

export default connect(mapStateToProps, mapDispatchToProps)(TabLogsScreen);
