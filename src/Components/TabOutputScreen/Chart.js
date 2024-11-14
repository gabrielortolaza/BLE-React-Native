import React, { Component } from "react";
import {
  View, Platform, Dimensions, StyleSheet
} from "react-native";
import {
  VictoryBar, VictoryChart, VictoryAxis,
  VictoryLabel
} from "victory-native";
import moment from "moment";
import PropTypes from "prop-types";

import { Colors, Fonts } from "../../Themes/index";
import { ButtonRound, Label } from "../Shared";

const AMOUNT = "amount";
const DURATION = "duration";
const VOLUME = "volume";
const ACTUAL_DURATION = "actualDuration";
const index = {
  [AMOUNT]: 0,
  [DURATION]: 1
};

export default class Chart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      theme: buildTheme(
        Dimensions.get("window").width,
        Dimensions.get("window").height / 2.75,
        props.barColor,
        props.labelColor
      ),
      activeBtn: props.yAxisValue === VOLUME ? AMOUNT : DURATION,
      yAxisValue: props.yAxisValue
    };
  }

  _updateTheme = ({ nativeEvent }) => {
    const { barColor, labelColor } = this.props;

    this.setState({
      theme: buildTheme(nativeEvent.layout.width, nativeEvent.layout.height, barColor, labelColor)
    });
  }

  formatMainAxisTicks = (tick) => {
    let label = " ";
    const { dateType, dow } = this.props;
    if (tick) {
      const isDay = dateType === "DAY";
      const tickMoment = moment(tick, isDay ? "YYYYMMDDHH" : "YYYYMMDD");
      if (isDay) {
        const h = tickMoment.format("h");
        if (!(h % 2)) {
          if (h === "12") {
            label = tickMoment.format("h a").replace(" ", "\n-\n");
            // } else if (h === "6") {
            //   label = tickMoment.format("DD MMM").replace(" ", "\n-\n");
          } else {
            label = tickMoment.format("h");
          }
        }
      } else if (
        dateType === "WEEK" || tickMoment.day() === dow
      ) {
        label = tickMoment.format("DD MMM").replace(" ", "\n-\n");
      }
    }

    return label;
  };

  getDependentTicks = (type) => {
    // eslint-disable-next-line react/destructuring-assignment
    const maxValue = this.props.maxValue[type] || 10;
    const pow = parseInt(maxValue, 10).toString().length - 1;
    // eslint-disable-next-line no-restricted-properties
    const pieceTick = (Math.ceil(maxValue / Math.pow(10, pow)) * Math.pow(10, pow)) / 4;
    const ticks = [0, pieceTick, pieceTick * 2, pieceTick * 3, pieceTick * 4];
    return ticks;
  };

  dependentAxisStyle = () => {
    const { labelColor } = this.props;

    return {
      axis: {
        stroke: Colors.grey97
      },
      ticks: {
        size: 5,
        stroke: labelColor || Colors.lightGrey2
      },
      tickLabels: {
        fontSize: 9,
        color: Colors.grey
      },
      axisLabel: {
        fontSize: 10,
        color: Colors.grey
      }
    };
  };

  mainAxisStyle = () => {
    const { labelColor } = this.props;

    return {
      axis: {
        stroke: Colors.grey97 // X axis line
      },
      ticks: {
        size: 5,
        stroke: labelColor || Colors.lightGrey2
      }
    };
  };

  onSwipePerformed = (action) => {
    const { swipePerformed } = this.props;

    if (!swipePerformed) return;

    switch (action) {
      case "left": {
        console.log("Left swipe");
        swipePerformed("left");
        break;
      }
      case "right": {
        console.log("Right swipe");
        swipePerformed("right");
        break;
      }
      default: {
        console.log(`${action} swipe`);
      }
    }
  }

  setActiveButton = (type) => {
    this.setState({
      activeBtn: type,
      yAxisValue: type === AMOUNT ? VOLUME : ACTUAL_DURATION
    });
  }

  render() {
    const {
      measureUnit, containerStyle, labelColor,
      widthOffset, title, swapEnabled
    } = this.props;
    let { data } = this.props;
    const { theme, yAxisValue, activeBtn } = this.state;

    data = data || [];

    return (
      <View
        style={[
          styles.container,
          { opacity: data.length },
          containerStyle,
          title && styles.titleBackground
        ]}
        onLayout={this._updateTheme}
      >
        {title && (
          <Label
            font14
            maxFontSizeMultiplier={1.2}
            style={styles.titleText}
          >
            {title}
          </Label>
        )}
        {swapEnabled && (
          <View style={styles.btnView}>
            <ButtonRound
              onPress={() => this.setActiveButton(AMOUNT)}
              style={[styles.button, activeBtn === AMOUNT ? styles.activeBtn : styles.disabledBtn]}
            >
              <Label
                style={activeBtn === AMOUNT ? styles.activeBtnText : {}}
                maxFontSizeMultiplier={1.1}
                font14
              >
                Amount
              </Label>
            </ButtonRound>
            <ButtonRound
              onPress={() => this.setActiveButton(DURATION)}
              style={
                [styles.button, activeBtn === DURATION ? styles.activeBtn : styles.disabledBtn]
              }
            >
              <Label
                style={activeBtn === DURATION ? styles.activeBtnText : {}}
                maxFontSizeMultiplier={1.1}
                font14
              >
                Duration
              </Label>
            </ButtonRound>
          </View>
        )}
        <VictoryChart
          width={Dimensions.get("window").width - (widthOffset || 25)}
          theme={theme}
          domainPadding={{ x: 15, y: [0, 45] }}
        >
          <VictoryAxis
            tickLabelComponent={(
              <VictoryLabel
                style={[
                  {
                    fontSize: 12,
                    fill: labelColor || Colors.grey, // X axis label main
                    ...Fonts.SemiBold
                  },
                  {
                    fontSize: 2
                  },
                  {
                    fontSize: 10,
                    fill: labelColor || Colors.grey, // X axis label sub
                    ...Fonts.Light,
                    y: 20
                  }
                ]}
              />
            )}
            tickFormat={this.formatMainAxisTicks}
            style={this.mainAxisStyle()}
          />
          <VictoryAxis
            // label={`Volume ${measureUnit}`}
            tickValues={this.getDependentTicks(index[activeBtn])}
            dependentAxis
            tickFormat={(tick) => `${tick}${measureUnit[index[activeBtn]]}`}
            style={this.dependentAxisStyle()}
          />
          <VictoryBar data={data} x="timestamp" y={yAxisValue} />
        </VictoryChart>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    height: "75%"
  },
  titleBackground: {},
  titleText: {
    fontWeight: Platform.OS === "ios" ? "600" : "700",
    alignSelf: "center",
    marginTop: 15
  },
  btnView: {
    flexDirection: "row",
    marginVertical: 15
  },
  button: {
    borderRadius: 12,
    height: 32,
    marginLeft: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    minWidth: 50
  },
  activeBtn: {
    backgroundColor: Colors.blue
  },
  activeBtnText: {
    color: Colors.white
  },
  disabledBtn: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.lightGrey300
  }
});

const buildTheme = (width, height, barColor, labelColor) => {
  // Layout
  const baseProps = {
    width,
    height,
    padding: {
      left: 35,
      top: 0,
      bottom: 35,
      right: Platform.OS === "ios" ? 20 : 25
    }
  };

  const centeredLabelStyles = { textAnchor: "middle" };

  // Strokes
  const strokeDasharray = "1, 0";
  const strokeLinecap = "round";
  const strokeLinejoin = "round";

  // Put it all together...
  return {
    area: {
      ...{
        style: {
          data: {
            fill: Colors.greyish
          },
          labels: centeredLabelStyles
        }
      },
      ...baseProps
    },
    axis: {
      ...{
        style: {
          axis: {
            fill: "transparent",
            stroke: Colors.greyishBrown30P,
            strokeWidth: 2,
            strokeLinecap,
            strokeLinejoin
          },
          axisLabel: {
            ...{},
            ...centeredLabelStyles,
            ...{
              padding: 22,
              stroke: "transparent"
            }
          },
          grid: {
            fill: Colors.black,
            stroke: "transparent",
            strokeDasharray,
            strokeLinecap,
            strokeLinejoin
          },
          tickLabels: {
            fill: labelColor || Colors.grey, // y axis label
            stroke: "transparent",
            padding: 5
          }
        }
      },
      ...baseProps
    },
    bar: {
      ...{
        style: {
          data: {
            fill: barColor || Colors.lightBlue
          }
        }
      },
      ...baseProps
    },
    chart: baseProps
  };
};

Chart.propTypes = {
  containerStyle: PropTypes.object,
  barColor: PropTypes.string,
  labelColor: PropTypes.string,
  yAxisValue: PropTypes.string.isRequired,
  widthOffset: PropTypes.number,
  dow: PropTypes.number.isRequired,
  maxValue: PropTypes.array.isRequired, // [volume, duration]
  dateType: PropTypes.string.isRequired,
  title: PropTypes.string,
  data: PropTypes.array.isRequired,
  swipePerformed: PropTypes.func,
  measureUnit: PropTypes.array, // [volume, duration]
  swapEnabled: PropTypes.bool
};
