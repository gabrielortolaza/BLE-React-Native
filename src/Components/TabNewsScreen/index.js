import React, { Component } from "react";
import {
  View, TouchableOpacity, BackHandler, ScrollView
} from "react-native";
import { connect } from "react-redux";
import { VictoryChart, VictoryPie, VictoryAxis } from "victory-native";
import firebase from "@react-native-firebase/app";
import PropTypes from "prop-types";
import moment from "moment";
import sortBy from "sort-by";
import ReactTimeout from "react-timeout";
import AsyncStorage from "@react-native-async-storage/async-storage";

import {
  measureUnitModalDataArr, LAST_PLAY_MODE, CONNECT_STATUS,
  STASH_TAB
} from "../../Config/constants";
import * as M from "../../Config/messages";
import { fluidTo } from "../../Services/Convert";
import {
  appHeight, filterLogs, findTitle, getHourMinSec,
  getSetStashAlertStatus,
} from "../../Services/SharedFunctions";
import {
  getChartData, resetLogSubscription, resetGoalSubscription,
  logsUpdatedAt, logWrite, logDelete, summaryUpdated,
  subscribeToGoals, initReturnNextSession, initStash,
  setCurrentProgram, addMessage, start
} from "../../Actions";

import StyleSheet from "../../Proportional";
import {
  Colors, Images, Fonts,
  Styles
} from "../../Themes";
import { Label as Text, TimeTicker } from "../Shared";

import ModalTutorialAlert from "../ModalTutorialAlert";
import Chart from "../TabOutputScreen/Chart";
import Card from "./Card";
import CardSimple from "./CardSimple";
import { LAST_PLAY_MODE_STORED } from "../../Config/LocalStorage";
import Container from "../Shared/Container";
import Icon from "../Shared/Icon";
import Alert from "../Shared/Alert";
import NewsletterModal from "../Shared/NewsletterModal";

const maxLogNum = 5000;

const trackedTypes = ["", "session", "stash", "goalMotivator", "reminder"];

const TimeTickerWithTimeout = ReactTimeout(TimeTicker);

class TabNewsScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      page: 1,
      hasMounted: false,
      viewActive: true
    };
  }

  componentDidMount() {
    const {
      navigation, resetLogSubscription, resetGoalSubscription,
      initReturnNextSession, initStash
    } = this.props;

    const user = firebase.auth().currentUser;
    console.log("User", user);

    if (!user) {
      // User not signed in, may have been overriden by views in BaseNavigator
      resetLogSubscription();
      resetGoalSubscription();
      navigation.pop();
      navigation.navigate("TourStart");
    } else {
      console.log("Activating logs");
      this.activateLogs();
      initStash();
      initReturnNextSession();
    }

    setTimeout(() => {
      this.setState({ hasMounted: true });
    }, 5000);

    // Detect back button
    BackHandler.addEventListener("hardwareBackPress", () => {
      const { viewActive } = this.state;

      console.log("Back button pressed, viewActive?", viewActive);

      if (viewActive) {
        return true;
      }

      return false;
    });

    this.focusListener = navigation.addListener(
      "focus",
      () => {
        this.setState({ viewActive: true });
      }
    );

    this.focusListener = navigation.addListener(
      "blur",
      () => {
        this.setState({ viewActive: false });
      }
    );
  }

  componentDidUpdate(prevProps) {
    const user = firebase.auth().currentUser;
    const { lastUid } = this.props;
    const { hasMounted } = this.state;

    if (user && hasMounted && lastUid && prevProps.lastUid !== lastUid) {
      // If user just signs in/signs up
      this.activateLogs();
      console.log("Activating logs 2");
    }
  }

  componentWillUnmount() {
    this.focusListener();
  }

  getUserdataRef = (uid, path = "") => firebase.database().ref(`userdata/${uid}/${path}`);

  getLogsRef = (uid, path = "") => this.getUserdataRef(uid, `logs/${path}`);

  getSummariesRef = (uid, path = "") => this.getUserdataRef(uid, `logs/${path}`);

  activateLogs = () => {
    const {
      logsUpdatedAt, logWrite, logDelete,
      summaryUpdated, subscribeToGoals
    } = this.props;
    const user = firebase.auth().currentUser;

    subscribeToGoals(user.uid);
    this.getUserdataRef(user.uid).once("value", (snapshot) => {
      const now = Date.now();
      const userdata = snapshot.val() || {};
      const logs = Object.values(userdata.logs || {}).sort(
        sortBy("-startedAt")
      );

      // console.log("Logs gotten from Firebase:", logs);

      // Reduce number of logs to maxLogNum number
      if (logs.length > maxLogNum) {
        logs.splice(maxLogNum, logs.length - maxLogNum);
      }

      const logsMap = new Map();
      logs.forEach((log) => {
        if (!log.deletedAt && trackedTypes.indexOf(log.type) > 0) {
          log.key && logsMap.set(log.key, log);
        }
      });

      // console.log("Logs filtered:", logs, logsMap);

      const logsRef = this.getLogsRef(user.uid);
      logsRef
        .orderByChild("updatedAt")
        .startAt(now)
        .on("child_added", (x) => {
          const { logsMap } = this.props;
          logWrite(x, logsMap, "Add");
        });
      logsRef
        .orderByChild("updatedAt")
        .startAt(now)
        .on("child_changed", (x) => {
          const { logsMap } = this.props;
          logWrite(x, logsMap, "Changed");
        });
      logsRef
        .on("child_removed", (x) => {
          const { logsMap } = this.props;
          logDelete(x, logsMap);
        });

      const summariesRef = this.getSummariesRef(user.uid);
      summariesRef
        .limitToLast(maxLogNum)
        .once("value", summaryUpdated);

      logsUpdatedAt(logsMap, now);
    });
  };

  _keyExtractor = (item, index) => `${item.id}${index}`;

  _renderItem = ({ item }) => (
    <Card
      id={item.id}
      image={item.media}
      link={item.link}
      title={item.title}
      author={item.author}
    />
  );

  loadMore = () => {
    setTimeout(() => {
      this.setState((prevSate) => ({ page: prevSate.page + 1 }));
    }, 500);
  };

  // _renderTabNewsHeader = () => {
  //   return (
  //     <View>
  //       <TabNewsDashboard {...this.props} />
  //     </View>
  //   );
  // }

  render() {
    return (
      <Container noScroll testID="dashboard-view-test">
        <TabNewsDashboard {...this.props} />
      </Container>

    /** News list * */
    // <View testID="TabNewsScreen" style={S.internalNavigatorContainer}>
    //   <FlatList
    //     testID="TabNews_List"
    //     style={styles.flex1}
    //     data={(this.props.newsList || []).slice(0, this.state.page * 2)}
    //     renderItem={this._renderItem}
    //     keyExtractor={this._keyExtractor}
    //     ListHeaderComponent={this._renderTabNewsHeader()}
    //     ListEmptyComponent={<TabNewsEmptyList />}
    //     onEndReached={this.loadMore}
    //     onEndReachedThreshold={0.9}
    //     refreshing={this.state.loading}
    //   />
    // </View>
    );
  }
}

export class TabNewsDashboard extends Component {
  constructor(props) {
    super(props);

    this.state = {
      chartMaxVolume: 0,
      chartDow: moment(Date.now(), "x").day(),
      chartData: [],
      chartType: "WEEK",
      showTutorialAlert: false,
      showStashAlert: false,
      showStashAlertToday: false,
    };
  }

  componentDidMount() {
    const { navigation } = this.props;
    setTimeout(() => { // Wait for store values to initialise
      this.updateChartData();
    }, 1000);

    this.focusListener = navigation.addListener(
      "focus",
      () => {
        getSetStashAlertStatus(false).then((val) => {
          this.setState({ showStashAlertToday: !!val });
        });
      }
    );

    // Do not show PL tutorial due to stash feature tutorial
    // getUserFinishedTutorial().then((val) => {
    //   if (!val) {
    //     setTimeout(() => this.setState({ showTutorialAlert: true }), 600);
    //   }
    // });
  }

  componentDidUpdate(prevProps) {
    const {
      logList, goalStash, totalStash, profile: { measureUnit }
    } = this.props;

    if (prevProps.logList !== logList || prevProps.profile.measureUnit !== measureUnit) {
      this.updateChartData();
      console.log("Update Dashboard Chart Data");
    }

    if (prevProps.goalStash !== goalStash || prevProps.totalStash !== totalStash) {
      this.checkStashAlert();
    }
  }

  getTotalVolumeOutput = (logData) => {
    return logData.reduce((a, b) => a + (b.sessionType === "pump" ? b.volume : 0), 0);
  };

  getTotalDurationOutput = (logData) => {
    return logData.reduce((a, b) => a + (b.sessionType === "pump" ? b.duration || b.totalDuration : 0), 0);
  };

  getMilkStash = (logData, volumeTotalOutput) => {
    let x = 0;
    for (let i = 0; i < logData.length; i++) {
      if (logData[i].sessionType === "feed") {
        x += logData[i].volume;
      }
    }

    return (volumeTotalOutput - x);
  };

  updateChartData = (value = 0) => {
    const {
      summaryHourlyDaily, profile: { measureUnit }
    } = this.props;
    const { chartType } = this.state;

    let chartDateMoment = moment(Date.now(), "x");
    const period = "day";

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

    const chartObj = getChartData({
      chartDate,
      chartType,
      summaryHourlyDaily
    },
    true,
    measureUnit);

    const {
      chartMaxVolume, chartData
    } = chartObj;

    this.setState({
      chartType,
      chartDow: chartDateMoment.day(),
      chartMaxVolume,
      chartData
    });
  };

  handleOnPressStartPumping = async () => {
    const {
      navigation, programs, setCurrentProgram, addMessage,
      connectStatus, pumpDeviceName
    } = this.props;

    if (connectStatus !== CONNECT_STATUS.CONNECTED) {
      // if app has not connected with the pump, pumpDevice is empty
      addMessage(M.PUMP_DISCONNECT.replace("pump", (pumpDeviceName || "Pump")));
      navigation.navigate("SuperGenie");
      return;
    }

    await AsyncStorage.getItem(LAST_PLAY_MODE_STORED).then((lastPlayModeRun) => {
      if (lastPlayModeRun) {
        const lastManualOrProgramRun = JSON.parse(lastPlayModeRun);
        if (lastManualOrProgramRun.playModeId === LAST_PLAY_MODE.PROGRAM) {
          const storedProgram = programs[lastManualOrProgramRun.programId];
          setCurrentProgram(storedProgram);
          navigation.navigate("ProgramRun");
        } else if (lastManualOrProgramRun.playModeId === LAST_PLAY_MODE.MANUAL) {
          navigation.navigate("ManualRun");
        } else {
          navigation.navigate("SuperGenie");
        }
      }
    });
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
      milestones, profile: { measureUnit, defaultSessionType }, newsletter,
      logList, manualSessionDuration, manualSessionResumedAt,
      manualSessionStatus, navigation, nextSession,
      sessionStart, summaryHourlyDaily, totalStash
    } = this.props;
    const {
      chartMaxVolume, chartDow, chartData,
      chartType, showTutorialAlert, showStashAlert,
      showStashAlertToday,
    } = this.state;

    const logData = filterLogs(logList);
    // console.log("logData:", logData, manualSessionDuration);

    const volumeTotalOutput = this.getTotalVolumeOutput(logData);

    const data = getChartData;

    const goalDaily = milestones.goal_daily || {};
    const milestone = goalDaily.volume || 0;

    const chartDate = moment(Date.now(), "x")
      .startOf("hour");

    const pumped = data(
      {
        chartDate,
        chartType: "DAY",
        summaryHourlyDaily
      },
      true,
      measureUnit
    ).chartVolume;

    const mUnit = findTitle(measureUnitModalDataArr, measureUnit, true);

    // const monthTotal = data(
    //   {
    //     chartDate,
    //     chartType: "MONTH",
    //     summaryHourlyDaily
    //   },
    //   true
    // ).chartVolume;

    const pumpedAmount = fluidTo({ measureUnit, value: pumped, showUnit: false });
    const goalAmount = fluidTo({ measureUnit, value: milestone, showUnit: false });

    let goalChartVal = 0;
    let pumpedChartVal = 0;

    if (goalAmount === 0) {
      // If no goal amount is set, goal dominates
      goalChartVal = 1;
      pumpedChartVal = 0;
    } else {
      const goalFraction = pumpedAmount / goalAmount;
      if (Math.floor(goalFraction) === 0) {
        // If pumped amount is less than goal

        pumpedChartVal = goalFraction * 100;
        goalChartVal = 100 - pumpedChartVal;
      } else if (Math.floor(goalFraction) >= 1) {
        // If pumped is greater than or equal to goal

        goalChartVal = 0;
        pumpedChartVal = 1;
      }
    }

    let goalDisplayText = "";

    if (!milestone) {
      goalDisplayText = "You haven't set a goal yet";
    } else if (milestone > pumped) {
      goalDisplayText = `Just ${fluidTo({ measureUnit, value: milestone - pumped, showUnit: true })} more needed today`;
    } else if (milestone === pumped) {
      goalDisplayText = "Yes! Today's goal reached!";
    } else if (milestone < pumped) {
      goalDisplayText = `Wow! You're ${fluidTo({ measureUnit, value: pumped - milestone, showUnit: true })} over your goal!`;
    }

    // let resultLabel;
    // let leftLabel;
    // let rightLabel;
    // let result;
    // let goalSet;
    // let leftAmount;
    // let rightAmount;

    // if (!milestone) {
    //   // Goal 0, pumped val, needed 0
    //   leftLabel = "Goal";
    //   rightLabel = "Pumped";
    //   resultLabel = "Needed";
    //   leftAmount = fluidTo({ measureUnit, value: 0, showUnit: false });
    //   rightAmount = fluidTo({ measureUnit, value: pumped, showUnit: false });
    //   result = fluidTo({ measureUnit, value: 0, showUnit: false });
    //   goalSet = false;
    // } else if (milestone >= pumped) {
    //   // Goal val, pumped val, needed val
    //   leftLabel = "Goal";
    //   rightLabel = "Pumped";
    //   resultLabel = "Needed";
    //   leftAmount = fluidTo({ measureUnit, value: milestone, showUnit: false });
    //   rightAmount = fluidTo({ measureUnit, value: pumped, showUnit: false });
    //   result = fluidTo({ measureUnit, value: milestone - pumped, showUnit: false });
    //   goalSet = true;
    // } else if (milestone < pumped) {
    //   // Pumped val, goal val, saved val
    //   leftLabel = "Pumped";
    //   rightLabel = "Goal";
    //   resultLabel = "Saved";
    //   leftAmount = fluidTo({ measureUnit, value: pumped, showUnit: false });
    //   rightAmount = fluidTo({ measureUnit, value: milestone, showUnit: false });
    //   result = fluidTo({ measureUnit, value: pumped - milestone, showUnit: false });
    //   goalSet = true;
    // }

    const totalOutput = fluidTo({
      measureUnit,
      value: volumeTotalOutput || 0,
      showUnit: true
    });

    const totalStashConverted = fluidTo({
      measureUnit,
      value: totalStash,
      showUnit: true
    });

    // const milkStash = fluidTo({
    //   measureUnit,
    //   value: this.getMilkStash(logData, volumeTotalOutput) || 0,
    //   showUnit: true
    // });

    const outputSubtitle = (output) => output.substr(0, (output.length - 2));

    const outputSubtitleUnit = (output) => output.substr(output.length - 2);

    const outputSubtitleBig = () => getHourMinSec(this.getTotalDurationOutput(logData));

    // const scaling = appHeight > 750
    //   ? {
    //     scroll: "130%",
    //     container: "21%"
    //   } : {
    //     scroll: "140%",
    //     container: "21%"
    //   };

    const fullHeight = appHeight > 750
      ? { height: appHeight * 0.19 }
      : { height: appHeight * 0.21 };

    return (
      <View
        style={[
          styles.outerView,
          Styles.globalTabHeader
        ]}
      >
        <View style={styles.titleContainer}>
          <Text grey style={styles.headerTitle}>
            Dashboard
          </Text>
        </View>
        {showStashAlert && showStashAlertToday && (
          <Alert
            title="Available stash is under your goal"
            onClose={() => {
              this.setState({ showStashAlertToday: false });
              getSetStashAlertStatus(true);
            }}
            style={{ marginBottom: 8 }}
          />
        )}

        <ScrollView
          showsVerticalScrollIndicator={false}
          // contentContainerStyle={{ height: scaling.scroll, paddingBottom: 60 }}
        >
          <View>
            <View style={styles.infoView}>
              <View style={styles.infoHeaderView}>
                <View>
                  <Text font16 white weightBold>{goalAmount > 0 ? "Today" : "This Week"}</Text>
                </View>
                {goalAmount > 0 && (
                <TouchableOpacity
                  onPress={() => navigation.navigate("Milestone")}
                  style={styles.infoGoalEdit}
                >
                  <Icon
                    type="FontAwesome"
                    name="pencil"
                    style={styles.pencil}
                  />
                  <Text style={styles.infoGoalEditText} font16 white>
                    {goalAmount}
                    {mUnit}
                  </Text>
                </TouchableOpacity>
                )}
              </View>
              {goalAmount > 0 ? (
                <View style={styles.graphView}>
                  <VictoryChart
                    height={180}
                    padding={0}
                  >
                    <VictoryPie
                      data={[
                        {
                          x: 1, y: goalChartVal, label: "Goal", fill: Colors.white
                        },
                        {
                          x: 2, y: pumpedChartVal, label: "Pumped", fill: Colors.lightBlue
                        }
                      ]}
                      innerRadius={70} // Calculate based on chart width
                      style={{
                        data: {
                          fill: ({ datum }) => datum.fill
                        },
                        labels: {
                          display: "none"
                        }
                      }}
                    />
                    <VictoryAxis
                      style={{
                        axis: { stroke: "transparent" },
                      // ticks: { stroke: "transparent" },
                      // tickLabels: { fill: "transparent" }
                      }}
                    />
                  </VictoryChart>
                  <View style={styles.pumpedContainer}>
                    <Text font26 weightBold white maxFontSizeMultiplier={1.1}>{pumpedAmount}</Text>
                    <Text font14 white maxFontSizeMultiplier={1.1}>
                      {`${mUnit} pumped`}
                      {pumpedAmount > 0 && ("!")}
                    </Text>
                  </View>
                </View>
              ) : (
                <Chart
                  data={chartData}
                  dow={chartDow}
                  maxValue={[
                    fluidTo({
                      measureUnit,
                      value: chartMaxVolume,
                      showUnit: false
                    }),
                    0
                  ]}
                  dateType={chartType}
                  measureUnit={[
                    findTitle(measureUnitModalDataArr, measureUnit, true),
                    null
                  ]}
                  containerStyle={styles.chart}
                  widthOffset={55}
                  labelColor={Colors.white}
                  yAxisValue="volume"
                />
              )}
              {goalAmount > 0 && (
                <View style={styles.goalDisplayText}>
                  <Text font14 white maxFontSizeMultiplier={1.1}>
                    {!!goalAmount && goalDisplayText}
                  </Text>
                </View>
              )}
            </View>

            <View
              style={[
                styles.containerRow,
                // { height: scaling.container }
              ]}
            >
              {/* <TouchableOpacity
                activeOpacity={0.5}
                style={styles.rowItemLeft}
                onPress={this.handleOnPressStartPumping}
              >
                <CardSimple
                  style={fullHeight}
                  title="Pump Now"
                  image={Images.superGenieIcon}
                  textColor="colorWhite"
                  source={Images.startPumpingBg}
                  subtitle=" "
                  subtitleSmall="Start pumping!"
                />
              </TouchableOpacity> */}

              <View style={styles.rowItemLeft}>
                <CardSimple
                  style={fullHeight}
                  image={Images.milkIcon}
                  title="Total Output"
                  subtitle={outputSubtitle(totalOutput)}
                  subtitleUnit={outputSubtitleUnit(totalOutput)}
                  subtitleBig={outputSubtitleBig()}
                  subtitleBigUnit=""
                  textColor="colorWhite"
                  source={Images.totalOutput}
                />
              </View>
              <TouchableOpacity
                activeOpacity={0.5}
                style={styles.rowItemRight}
                onPress={() => navigation.navigate("Logs", { activeTab: STASH_TAB })}
              >
                <CardSimple
                  style={fullHeight}
                  image={Images.stash}
                  title="Stash"
                  subtitle={outputSubtitle(totalStashConverted)}
                  subtitleUnit={outputSubtitleUnit(totalStashConverted)}
                  textColor="colorWhite"
                  source={Images.stashBg}
                  showStashAlert={showStashAlert}
                />
              </TouchableOpacity>
            </View>
            <View
              style={[
                styles.containerRow,
                // { height: scaling.container }
              ]}
            >
              <TouchableOpacity
                activeOpacity={0.5}
                style={styles.rowItemLeft}
                onPress={() => navigation.navigate("Schedule")}
              >
                <CardSimple
                  style={fullHeight}
                  title="Schedule"
                  subtitle={nextSession}
                  icon="calendar-today"
                  type="MaterialCommunityIcons"
                  subtitleSmall={nextSession !== "None" ? "Until your next session" : "Remaining today"}
                  textColor="colorWhite"
                  source={Images.scheduleBg}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.5}
                style={styles.rowItemRight}
                onPress={() => {
                  sessionStart("manual", defaultSessionType);
                  navigation.navigate("SessionModal", {
                    actionType: "manual",
                    newSession: true,
                  });
                }}
              >
                <CardSimple
                  style={fullHeight}
                  type="Feather"
                  icon="clock"
                  title="Log Session"
                  textColor="colorWhite"
                  source={Images.logSession}
                />
              </TouchableOpacity>
            </View>
            <View style={styles.containerRow}>
              <TouchableOpacity
                style={styles.rowItemFull}
                onPress={() => {
                  navigation.navigate("SessionModal", { actionType: "record" });
                }}
              >
                <CardSimple
                  style={fullHeight}
                  type="Ionicons"
                  icon="play-circle"
                  title="Run Timer"
                  subtitleBottom={(
                    <TimeTickerWithTimeout
                      resumedAt={manualSessionResumedAt}
                      status={manualSessionStatus}
                      duration={manualSessionDuration}
                      textStyle={styles.tickerTimerTile}
                    />
                  )}
                  textColor="colorWhite"
                  source={Images.runTimer}
                />
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
        {showTutorialAlert && (
          <ModalTutorialAlert />
        )}
        {newsletter !== true && (
          <NewsletterModal />
        )}
      </View>
    );
  }
}

TabNewsDashboard.propTypes = {
  milestones: PropTypes.object,
  profile: PropTypes.object,
  summaryHourlyDaily: PropTypes.object,
  logList: PropTypes.array,
  totalStash: PropTypes.number,
  goalStash: PropTypes.number,
  manualSessionDuration: PropTypes.number,
  manualSessionResumedAt: PropTypes.number,
  manualSessionStatus: PropTypes.number,
  navigation: PropTypes.object,
  nextSession: PropTypes.string,
  newsletter: PropTypes.bool,
  programs: PropTypes.object,
  setCurrentProgram: PropTypes.func,
  connectStatus: PropTypes.number,
  pumpDeviceName: PropTypes.string,
  addMessage: PropTypes.func,
  sessionStart: PropTypes.func
};

// export class TabNewsEmptyList extends PureComponent {
//   render() {
//     return (
//       <View testID="TabNews_EmptyList" style={styles.listEmpty}>
//         <ActivityIndicator animating size="large" />
//       </View>
//     );
//   }
// }

const styles = StyleSheet.create({
  outerView: {
    height: "100%"
  },
  subheader: {
    marginTop: 0,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center"
  },
  chartView: {
    height: "40%",
    backgroundColor: Colors.grey242,
    marginHorizontal: 25,
    borderRadius: 5,
    paddingTop: 10
  },
  chartHeader: {
    position: "absolute",
    left: 0,
    top: 0,
    marginLeft: 10,
    marginTop: 10,
    zIndex: 10000
  },
  chart: {
    marginHorizontal: 0,
    height: 180
  },
  infoView: {
    backgroundColor: Colors.blue,
    marginHorizontal: 25,
    marginBottom: 5,
    borderRadius: 5,
    padding: 10
  },
  containerRow: {
    flexDirection: "row",
    paddingHorizontal: 25,
    marginVertical: 12
  },
  rowItemRight: { width: "50%", paddingLeft: 5 },
  rowItemLeft: { width: "50%", paddingRight: 5 },
  rowItemFull: { width: "100%" },
  tickerSessionTile: {
    fontSize: 20,
    textAlign: "left",
    color: Colors.lightBlue
  },
  tickerTimerTile: {
    fontSize: 20,
    textAlign: "left",
    color: Colors.white
  },
  infoHeaderView: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 10,
  },
  graphView: {
    alignItems: "center",
    justifyContent: "center",
  },
  pumpedContainer: {
    position: "absolute",
    alignItems: "center"
  },
  hide: {
    display: "none"
  },
  pencil: {
    fontSize: 16,
    color: Colors.white
  },
  infoGoalEdit: {
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },
  infoGoalEditText: {
    marginLeft: 5
  },
  goalDisplayText: {
    marginTop: 10,
    alignSelf: "center"
  },
  // listEmpty: {
  //   padding: 100,
  //   alignItems: "center"
  // },
  flex1: {
    flex: 1
  },
  textLeft: { textAlign: "left" },
  header: {
    padding: 22,
    paddingLeft: 30,
    backgroundColor: "#ffffff"
  },
  titleContainer: {
    paddingTop: 10,
    paddingBottom: 20,
    paddingHorizontal: 25,
  },
  headerTitle: {
    fontSize: 30,
    ...Fonts.SemiBold
  },
  dsDash: {
    marginLeft: 5,
    marginRight: 5,
    textAlignVertical: "center",
    alignSelf: "center"
  },
  dsTotals: { flexDirection: "row", marginBottom: 25, alignItems: "center" },
  dsTotalsDash: { width: 1, height: 50, backgroundColor: "rgba(255,255,255,0.3)" },
  dsFooter: {
    backgroundColor: "rgb(103, 129, 218)",
    paddingBottom: 20,
    paddingTop: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    alignSelf: "center"
  }
});

TabNewsScreen.propTypes = {
  newsList: PropTypes.array,
  navigation: PropTypes.object,
  resetLogSubscription: PropTypes.func,
  resetGoalSubscription: PropTypes.func,
  initStash: PropTypes.func,
  logsUpdatedAt: PropTypes.func,
  logWrite: PropTypes.func,
  logDelete: PropTypes.func,
  summaryUpdated: PropTypes.func,
  subscribeToGoals: PropTypes.func,
  logsMap: PropTypes.object,
  lastUid: PropTypes.string,
  profile: PropTypes.object,
  initReturnNextSession: PropTypes.func
};

const mapStateToProps = ({
  schedule, goals, auth,
  logs, session, pump
}) => {
  const { profile, lastUid, newsletter } = auth;
  const {
    summaryHourlyDaily, logsMap, logsArray,
    totalStash
  } = logs;
  const {
    duration, resumedAt, status
  } = session;
  const { programs, connectStatus, pumpDeviceName } = pump;
  const { totalTime, playingProgram } = pump.activeProgram;
  const { nextSession } = schedule;
  const goalStash = goals.list.goal_stash?.volume;

  return {
    profile,
    milestones: goals.list,
    summaryHourlyDaily,
    logsMap,
    logList: logsArray,
    totalStash,
    goalStash,
    lastUid,
    manualSessionDuration: duration,
    manualSessionStatus: status,
    manualSessionResumedAt: resumedAt,
    newsletter,
    programTotalTime: totalTime,
    nextSession,
    playingProgram,
    programs,
    connectStatus,
    pumpDeviceName
  };
};

const mapDispatchToProps = {
  resetGoalSubscription,
  resetLogSubscription,
  subscribeToGoals,
  logsUpdatedAt,
  initStash,
  logWrite,
  logDelete,
  summaryUpdated,
  initReturnNextSession,
  setCurrentProgram,
  addMessage,
  sessionStart: start,
};

export default connect(mapStateToProps, mapDispatchToProps)(TabNewsScreen);
