import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  View, Text, Dimensions,
} from "react-native";
import Slider from "@react-native-community/slider";

import { Colors, Images } from "../../../Themes";

const appWidth = Dimensions.get("window").width;

export default class SliderSpeed extends Component {
  constructor(props) {
    super(props);

    this.state = {
      currentIndex: props.stepIndex ? props.stepIndex : 0
    };
  }

  componentDidMount() {
    const { currentIndex } = this.state;
    this.updatePositionReferences(currentIndex);
  }

  componentDidUpdate(prevProps) {
    const { options } = this.props;
    if (prevProps.options !== options) {
      const { currentIndex } = this.state;
      const index = options.length > currentIndex ? currentIndex : options.length - 1;
      this.updatePositionReferences(index);
    }

    const { index, stepIndex } = this.props;
    const { itemWidthDifference } = this.state;

    if (prevProps.index !== index) {
      this.fixLabelPosition(itemWidthDifference, index);
    }

    if (prevProps.stepIndex !== stepIndex && stepIndex !== -1) {
      this.updatePositionReferences(stepIndex);
    }
  }

  updatePositionReferences = (index = 0) => {
    const referenceWidth = appWidth - 12;
    const { options } = this.props;
    const { length } = options;
    const optionsWidth = (length * 32);
    let itemWidthDifference = 0;
    if (optionsWidth > referenceWidth) {
      itemWidthDifference = ((optionsWidth - referenceWidth) / (length - 1));
    }

    this.fixLabelPosition(itemWidthDifference, index);
  }

  fixLabelPosition = (itemWidthDifference, currentIndex) => {
    if (
      // eslint-disable-next-line react/destructuring-assignment
      (itemWidthDifference === this.state.itemWidthDifference)
      // eslint-disable-next-line react/destructuring-assignment
      && (currentIndex === this.state.currentIndex)
    ) {
      return null;
    }
    const transform = [
      { translateX: itemWidthDifference * currentIndex * -1 }
    ];

    this.setState({
      transform,
      itemWidthDifference,
      currentIndex
    });
  }

  onValueChange = (currentIndex) => {
    const { itemWidthDifference } = this.state;
    this.fixLabelPosition(itemWidthDifference, currentIndex);
  }

  onSlidingComplete = (currentIndex) => {
    const { onValueChange } = this.props;
    this.setState({ currentIndex }, () => {
      onValueChange && onValueChange(currentIndex);
    });
  }

  render() {
    const {
      options, white, grey,
      testID
    } = this.props;
    const { transform, currentIndex } = this.state;
    return (
      <View>
        <View testID={testID} style={Styles.row}>
          <Slider
            minimumValue={0}
            maximumValue={options.length ? options.length - 1 : 0}
            step={1}
            value={currentIndex}
            style={Styles.slider}
            minimumTrackTintColor={Colors.blue}
            maximumTrackTintColor={Colors.grey97}
            // thumbTintColor={Colors.blue}
            thumbImage={Images.sliderImage}
            onValueChange={this.onValueChange}
            onSlidingComplete={this.onSlidingComplete}
          />
        </View>
        <View style={[Styles.labels, { transform }]}>
          {options.map((value, index) => (
            <Text
              key={`cycle_${value}`}
              center
              style={[
                Styles.label,
                white && Styles.labelWhite,
                grey && Styles.labelGrey,
                index === currentIndex && Styles.labelCurrent
              ]}
            >
              {value}
            </Text>
          ))}
        </View>
      </View>
    );
  }
}

SliderSpeed.propTypes = {
  options: PropTypes.array,
  white: PropTypes.bool,
  grey: PropTypes.bool,
  onValueChange: PropTypes.func,
  index: PropTypes.number,
  stepIndex: PropTypes.number,
  testID: PropTypes.string
};

const Styles = {
  row: { flexDirection: "row" },
  slider: { height: 44, flex: 1 },
  track: { height: 2 },
  thumbAndroid: {
    borderRadius: 23,
    borderColor: Colors.grey97,
    borderWidth: 1,
    width: 33,
    height: 32,
    backgroundColor: Colors.white
  },
  thumbIOS: {
    borderRadius: 22,
    width: 31,
    height: 30,
    shadowRadius: 2,
    shadowOpacity: 0.3,
    shadowOffset: { width: 0, height: 0 },
    shadowColor: "black",
    backgroundColor: Colors.white
  },
  labels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    paddingLeft: 6,
    paddingRight: 6
  },
  label: {
    width: 32,
    textAlign: "center",
    fontSize: 14,
    lineHeight: 24
  },
  labelWhite: { color: Colors.white },
  labelGrey: { color: Colors.grey },
  labelCurrent: { fontSize: 16, fontWeight: "700" },
  thumbSize: { width: 46, height: 46 }
};
