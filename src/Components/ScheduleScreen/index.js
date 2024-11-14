import React, { Component } from "react";
import PropTypes from "prop-types";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  View,
  ScrollView,
  StyleSheet
} from "react-native";
import { connect } from "react-redux";
import moment from "moment";

import { Colors } from "../../Themes";
import {
  ConfirmationToast, ButtonRound, Label
} from "../Shared";
import Header from "../Shared/AppHeader/Header";
import WeekDays from "./WeekDays";
import HoursColumn from "./HoursColumn";
import Event from "./Event";
import PopupMenu from "./PopupMenu";
import Touchable from "./Touchable";
import { appHeight, isEmpty } from "../../Services/SharedFunctions";

import {
  dayColumnWidth,
  hourRowHeight,
  hoursColumnWidth,
  hourSubRowDuration,
  hourSubRowHeight,
  markMenuHeight,
  markMenuMarkItemWidthDifference,
  markMenuOffset,
  markMenuWidth,
  screenHeight,
  screenWidth,
  weekHeaderHeight
} from "./Constants";

import { saveEvents } from "../../Actions/Schedule";
import { addMessage } from "../../Actions/Status";
import * as M from "../../Config/messages";

const scrollOffsetDefault = { x: 0, y: 0 };

class ScheduleScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fromSignup: props.route.params && props.route.params.fromSignup,
      popupMenuStyle: null,
      initialEvents: {},
      events: {},
      showTutorial: Object.values(props.events || {}).length === 0,
      contentOffset: scrollOffsetDefault,
      selectedEventKey: ""
    };
    this.momentStartsAt = moment().hours(0).minutes(0).seconds(0)
      .milliseconds(0)
      .day(-7);
    this.scrollViewRef = React.createRef();
  }

  componentDidMount() {
    const { events } = this.props;
    const newEvents = { ...events } || {};

    this.setState({ initialEvents: JSON.parse(JSON.stringify(newEvents)), events: newEvents });

    setTimeout(() => {
      this.scrollViewRef?.current?.scrollTo({ x: 0, y: appHeight * 0.5, animated: true });
    }, 800);
  }

  hideTutorial = () => this.setState({ showTutorial: false })

  onScrollEnd = ({ nativeEvent: { contentOffset } }) => this.setState({ contentOffset })

  addEvent = ({ nativeEvent }) => {
    const {
      events,
      showTutorial,
      popupMenuStyle
    } = this.state;
    if (popupMenuStyle || showTutorial) {
      this.setState({ popupMenuStyle: null, showTutorial: false });
      return;
    }

    const marksArray = Object.values(events);

    const { locationY, locationX } = nativeEvent;

    const hour = Math.floor(locationY / hourRowHeight); // which hour
    const hourY = (hour * hourRowHeight);
    const remainingY = locationY - hourY;
    const minutesInPx = Math.floor(remainingY / hourSubRowHeight);
    const minutes = minutesInPx * hourSubRowDuration;
    const dayOfWeek = Math.floor(locationX / dayColumnWidth); // which hour
    const duration = hourSubRowDuration;

    const startsAt = this.momentStartsAt.day(dayOfWeek).hour(hour).minute(minutes).format("x") * 1;
    const finishAt = this.momentStartsAt.add(duration, "minutes").format("x") * 1;

    let event = {
      key: `schedule_${startsAt}`,
      location: { x: locationX, y: locationY },
      startsAt,
      finishAt,
      duration,
      recurrenceUnit: "1",
      recurrencePeriod: "week"
    };

    const previousMark = marksArray.filter(({ finishAt }) => finishAt === startsAt).pop();
    const nextMark = marksArray.filter(({ startsAt }) => startsAt === finishAt).pop();

    if (previousMark) {
      event = {
        ...previousMark,
        duration: previousMark.duration + event.duration,
        finishAt: moment(previousMark.startsAt, "x").add(previousMark.duration + event.duration, "minutes").format("x") * 1
      };
    }

    if (nextMark) {
      event = {
        ...event,
        duration: event.duration + nextMark.duration,
        finishAt: moment(event.startsAt, "x").add(event.duration + nextMark.duration, "minutes").format("x") * 1
      };
      delete events[nextMark.key];
    }

    event.updatedAt = Date.now();
    events[event.key] = event;
    this.setState({
      events
    });

    const momentStartsAt = moment(startsAt, "x");
    const style = {
      top: (momentStartsAt.hours() * hourRowHeight) + (momentStartsAt.minutes() / hourSubRowDuration) * hourSubRowHeight,
      height: (duration / hourSubRowDuration) * hourSubRowHeight,
      left: (momentStartsAt.day() * dayColumnWidth) + hoursColumnWidth,
      width: dayColumnWidth
    };
    this.onEventPress(nativeEvent, style, event.key);
  }

  onEventPress = (nativeEvent, style, selectedEventKey) => {
    const { contentOffset } = this.state;

    // eslint-disable-next-line react/destructuring-assignment
    if (this.state.popupMenuStyle) {
      this.setState({
        popupMenuStyle: null,
        selectedEventKey: ""
      });
      return;
    }

    const popupMenuStyle = {
      flexDirection: "column"
    };

    const relativeTop = (style.top - contentOffset.y) + weekHeaderHeight;
    popupMenuStyle.top = relativeTop + style.height + markMenuOffset;
    if (popupMenuStyle.top > (screenHeight - (markMenuHeight + markMenuOffset))) {
      // if slot is close to the bottom, show the menu on the slot
      popupMenuStyle.top = relativeTop - markMenuHeight;
    }

    popupMenuStyle.left = style.left - markMenuMarkItemWidthDifference;
    if (style.left > (screenWidth - markMenuWidth)) {
      popupMenuStyle.left = screenWidth - markMenuWidth;
    }

    this.setState({
      selectedEventKey,
      popupMenuStyle
    });
  }

  onPopupMenuPress = (selectedEventKey, action, endTimeStr) => {
    const { events } = this.state;

    if (action === "SET") {
      if (endTimeStr) {
        const event = events[selectedEventKey];
        // event.duration = duration;
        // event.finishAt = moment(event.startsAt, "x").add(duration, "minutes").format("x") * 1;
        const startTimeStr = moment(event.startsAt).format("HH:mm");
        const startTime = moment(startTimeStr, "HH:mm");
        const endTime = moment(endTimeStr, "HH:mm");
        const duration = moment.duration(endTime.diff(startTime));
        event.startsAt += duration;
        events[selectedEventKey] = event;
      }
    } else if (action === "REMOVE") {
      delete events[selectedEventKey];
    }

    this.setState({
      selectedEventKey: "",
      popupMenuStyle: null,
      events
    });
  }

  renderEvent = (event) => <Event {...event} eventKey={event.key} onPress={this.onEventPress} />

  onDone = () => {
    const { events, initialEvents } = this.state;
    const {
      save, addMessage, notificationsAllowed
    } = this.props;

    save(initialEvents, events);

    if (!isEmpty(events)) {
      if (!notificationsAllowed) {
        addMessage(M.ENABLE_NOTIFICATION);
      }
    }

    this.navigateToBack();
  }

  navigateToBack = () => {
    const { fromSignup } = this.state;
    const { navigation } = this.props;

    if (fromSignup) navigation.navigate("TourGoal");
    else navigation.goBack();
  }

  render() {
    const {
      fromSignup, selectedEventKey, popupMenuStyle,
      events, showTutorial
    } = this.state;
    const { navigation } = this.props;

    return (
      <SafeAreaView style={styles.container} forceInset={{ top: "always" }}>
        <View
          testID="ScheduleScreen"
          style={styles.container}
        >
          {
            !fromSignup && (
              <View style={styles.appHeaderView}>
                <Header
                  leftActionText="Schedule"
                  leftActionEvent={navigation.goBack}
                  testID="Schedule_Back"
                />
              </View>
            )
          }
          <WeekDays />
          <ScrollView
            ref={this.scrollViewRef}
            contentContainerStyle={styles.row}
            onMomentumScrollEnd={this.onScrollEnd}
            onScrollEndDrag={this.onScrollEnd}
            scrollEnabled={!popupMenuStyle}
            style={styles.hourScrollview}
            testID="Schedule_ScrollView"
          >
            <HoursColumn />
            <Touchable onPress={this.addEvent} />
            { Object.values(events).map(this.renderEvent) }
          </ScrollView>
          <View style={styles.shadowView}>
            <ButtonRound
              onPress={this.onDone}
              style={styles.donePosition}
              testID="Schedule_Done"
            >
              <Label white font20>Save</Label>
            </ButtonRound>
          </View>
          { showTutorial && (
            <ConfirmationToast
              onPressConfirm={() => {
                this.hideTutorial();
              }}
              onPressDeny={() => {
                this.hideTutorial();
                if (fromSignup) {
                  navigation.navigate("TourGoal");
                } else {
                  navigation.goBack();
                }
              }}
              subtitle={M.TAP_SCREEN_TO_ADD_SESSION}
              title={M.SETUP_SCHEDULE}
              option1="Skip"
              option2="OK"
            />
          )}
          { popupMenuStyle && (
            <PopupMenu
              event={events[selectedEventKey]}
              selectedEventKey={selectedEventKey}
              onPress={this.onPopupMenuPress}
              style={popupMenuStyle}
            />
          ) }
        </View>
      </SafeAreaView>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.white
  },
  appHeaderView: {
    paddingLeft: 10
  },
  row: { flexDirection: "row" },
  backButton: {
    position: "absolute",
    top: 30,
    padding: 10,
    left: 20,
    zIndex: 10
  },
  hourScrollview: {
    flex: 1
  },
  shadowView: {
    // elevation: 5, // it is hiding popup menu in android
    shadowColor: "rgba(0, 0, 0, 0.5)",
    shadowOffset: {
      width: 0,
      height: -3
    },
    shadowOpacity: 0.3,
    backgroundColor: "white",
    paddingHorizontal: 25,
    paddingVertical: 18,
  },
  donePosition: {
    width: "100%",
    backgroundColor: Colors.blue,
  }
});

ScheduleScreen.propTypes = {
  displayName: PropTypes.string,
  events: PropTypes.object.isRequired,
  navigation: PropTypes.object,
  route: PropTypes.object,
  notificationsAllowed: PropTypes.bool,
  addMessage: PropTypes.func.isRequired,
  save: PropTypes.func.isRequired
};

const mapStateToProps = ({ schedule, auth }) => ({
  displayName: auth.profile.displayName,
  events: schedule.events || {},
  notificationsAllowed: auth.notificationsAllowed,
});

const mapDispatchToProps = {
  addMessage,
  save: saveEvents
};

export default connect(mapStateToProps, mapDispatchToProps)(ScheduleScreen);
