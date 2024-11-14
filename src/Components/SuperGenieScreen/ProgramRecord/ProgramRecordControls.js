import React, { PureComponent } from "react";
import PropTypes from "prop-types";

import * as C from "../../../Config/constants";

export default class ProgramRecordControls extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      status: "waiting",
      time: 0,
      totalTime: 0,
    };
  }

  componentDidMount() {
    const { playStatus, type, initialTime } = this.props;
    if (type === "draggable") {
      this.setState({ time: initialTime }, () => {
        if (playStatus === C.OP_START) {
          this.play();
        }
      });
    }
  }

  componentDidUpdate(prevProps) {
    const { playStatus } = this.props;
    if (prevProps.playStatus !== C.OP_START && playStatus === C.OP_START) {
      this.play();
    } else if ((prevProps.playStatus !== C.OP_PAUSE && playStatus === C.OP_PAUSE)
      || (prevProps.playStatus !== C.OP_STOP && playStatus === C.OP_STOP)) {
      this.pause();
    }
  }

  componentWillUnmount() {
    this.stopTimer();
  }

  ticTac = () => {
    let {
      time, totalTime
    } = this.state;
    time += 1;
    totalTime += 1;
    this.setState({
      time, totalTime
    });
  };

  getTime = () => {
    const { time } = this.state;
    return time;
  };

  resetTime = () => {
    this.setState({
      time: 0
    });
  };

  stopTimer = () => {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  };

  cancel = () => {
    const { onCancel } = this.props;
    onCancel && onCancel();
  };

  save = () => {
    const { status } = this.state;
    const { onSave } = this.props;
    if (status === "waiting") return;
    this.stopTimer();
    onSave().then(() => {
      this.setState({ status: "waiting", time: 0 });
    });
  };

  play = () => {
    const { onRecord, playStatus } = this.props;
    if (playStatus !== C.OP_START) return;
    this.setState({ status: "playing" });
    this.timer = setInterval(this.ticTac, 1000);
    onRecord && onRecord();
  };

  pause = () => {
    this.stopTimer();
    this.setState({ status: "paused" });
    const { onPause } = this.props;
    onPause && onPause();
  };

  render() {
    return (
      <></>
    );
  }
}

ProgramRecordControls.propTypes = {
  onSave: PropTypes.func,
  onRecord: PropTypes.func,
  onPause: PropTypes.func,
  onCancel: PropTypes.func,
  playStatus: PropTypes.number,
  type: PropTypes.string,
  initialTime: PropTypes.number,
};
