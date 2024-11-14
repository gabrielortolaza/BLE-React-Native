import React, { useEffect, useRef, useState } from "react";
import PropTypes from "prop-types";
import moment from "moment";

import InfoLabel from "./InfoLabel";

export default function TimeControl(props) {
  const { playStatus, currentTime } = props;
  const prevProps = usePrevious({ playStatus, currentTime });
  const [totalTime, setTotalTime] = useState(0);
  // const [timer, setTimer] = useState(null);

  useEffect(() => {
    if (prevProps) {
      if (prevProps.currentTime !== currentTime) {
        setTotalTime(currentTime);
      }
    } else if (currentTime) {
      setTotalTime(currentTime);
    }
  }, [currentTime]);

  // useEffect(() => {
  //   if (prevProps) {
  //     if (prevProps.playStatus !== C.OP_START && playStatus === C.OP_START) {
  //       play();
  //     } else if (prevProps.playStatus !== C.OP_PAUSE && playStatus === C.OP_PAUSE) {
  //       pause();
  //     } else if (prevProps.playStatus !== C.OP_STOP && playStatus === C.OP_STOP) {
  //       pause();
  //     }
  //   }
  //   return () => {
  //     stopTimer();
  //   };
  // }, [playStatus]);

  // const ticTac = () => {
  //   setTotalTime((totalTime) => totalTime + 1);
  // };

  // const stopTimer = () => {
  //   if (timer) clearInterval(timer);
  //   setTimer(null);
  // };

  // const play = () => {
  //   if (!timer) {
  //     const timer = setInterval(ticTac, 1000);
  //     setTimer(timer);
  //   }
  // };

  // const pause = () => {
  //   stopTimer();
  // };

  return (
    <InfoLabel
      title="TOTAL TIME"
      value={moment.utc(totalTime * 1000).format("mm:ss")}
      style={{ alignSelf: "center" }}
    />
  );
}

function usePrevious(value) {
  const ref = useRef();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
}

TimeControl.propTypes = {
  playStatus: PropTypes.number,
  currentTime: PropTypes.number,
};
