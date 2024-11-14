import React, { Component } from "react";
import { Text } from "react-native";
import PropTypes from "prop-types";

import { Colors, Fonts } from "../../Themes";
import StyleSheet from "../../Proportional";
import {
  SESSION_BEGIN, SESSION_RUNNING, SESSION_PAUSED, SESSION_STOPPED
} from "../../Config/constants";

export default class TimeTicker extends Component {
  constructor(props) {
    super(props);

    this.state = {
      played: false
    };
  }

  componentDidMount() {
    const { status } = this.props;
    status === SESSION_RUNNING && this.ticTac();
  }

  componentDidUpdate(prevProps) {
    const { status } = this.props;
    const { played } = this.state;

    if (status === SESSION_RUNNING && prevProps.status !== status && !played) {
      this.setState({ played: true });
      this.ticTac();
    }
  }

  ticTac = () => {
    const { status } = this.props;

    this.setState({
      now: parseInt(Date.now() / 1000, 10) * 1000,
      ticTac: Date.now() % 1000 > 500
    });

    status !== SESSION_BEGIN && setTimeout(this.ticTac, 100);
  };

  render() {
    const {
      status, duration, resumedAt,
      textStyle
    } = this.props;

    const { now, ticTac } = this.state;

    const isIdle = status === SESSION_BEGIN;
    const isRunning = status === SESSION_RUNNING;
    const isPaused = status === SESSION_PAUSED;
    const isStopped = status === SESSION_STOPPED;

    const runningDuration = isRunning ? (now - resumedAt) / 1000 : 0;
    const currentDuration = duration + runningDuration;

    let currentDurationMinutes = `${parseInt(currentDuration / 60, 10)}`;

    if (isNaN(currentDurationMinutes)) currentDurationMinutes = 0;
    currentDurationMinutes = (`0${currentDurationMinutes}`).substr(-2, 2);

    let currentDurationSeconds = `${(currentDuration % 60)}`;
    if (isNaN(currentDurationSeconds)) currentDurationSeconds = 0;
    currentDurationSeconds = (`0${currentDurationSeconds}`).substr(-2, 2);

    const tickerOpacity = ticTac || !isPaused || isStopped ? 1 : 0.5;
    const colonOpacity = isIdle ? 1 : (ticTac || isPaused || isStopped ? 1 : 0);

    return (
      <Text
        maxFontSizeMultiplier={1.2}
        style={[styles.labelTimer, { opacity: tickerOpacity, color: Colors.grey }, textStyle]}
      >
        {currentDurationMinutes}
        <Text style={[{ opacity: colonOpacity, color: Colors.grey }, textStyle]}>:</Text>
        {currentDurationSeconds}
      </Text>
    );
  }
}

TimeTicker.propTypes = {
  resumedAt: PropTypes.number,
  duration: PropTypes.number,
  status: PropTypes.number,
  textStyle: PropTypes.object
};

const styles = StyleSheet.createProportional({
  labelTimer: {
    ...Fonts.SemiBold,
    fontSize: 30,
    textAlign: "center",
    color: Colors.greyishBrown,
    margin: 3
  }
});
