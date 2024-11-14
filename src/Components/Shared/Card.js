import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import {
  View, StyleSheet, ImageBackground, TouchableOpacity
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { isIphoneX } from "react-native-iphone-screen-helper";

import Text from "./Label";
import { Colors } from "../../Themes";
import ButtonRound from "./ButtonRound";
import Icon from "./Icon";
// import SelectPhoto from "./SelectPhoto";

export default class Card extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      totalPrograms: []
    };
  }

  componentDidMount() {
    const { programs } = this.props;
    const totalPrograms = Object.keys(programs).sort().map((k) => programs[k]);
    totalPrograms.splice(0, 0, {
      name: "Manual"
    });
    this.setState({ totalPrograms });
  }

  render() {
    const {
      width, height, imageSource, onCancel,
      type, titleText, textStyle, buttonStyle,
      currentProgram, backButtonContrast, leftButtonStyle,
      showMoreButton, moreActionEvent
    } = this.props;
    const { totalPrograms } = this.state;

    let type2 = type;
    if (type2 === "manualRunImage") {
      type2 = "manualRunImage";
    } else {
      type2 = `programRunImage${currentProgram.id}`;
    }

    return (
      <View
        style={{
          width,
          height,
          backgroundColor: type === "programRunImage" ? Colors.white : Colors.lighterBlue
        }}
      >
        {
          imageSource && (
          <View>
            <ImageBackground
              style={{
                width,
                height: "100%"
              }}
              source={imageSource}
            />
            <View pointerEvents="none" style={Styles.overlay} />
          </View>
          )
        }
        <SubHeader
          leftActionEvent={onCancel}
          showMoreButton={showMoreButton}
          moreActionEvent={moreActionEvent}
          backButtonContrast={backButtonContrast}
          titleText={titleText}
          textStyle={textStyle}
          leftButtonStyle={leftButtonStyle || Styles.leftButtonStyle}
          buttonStyle={buttonStyle}
        />
        {
          totalPrograms.length > 1 && (
            <Carousel
              loop={false}
              style={Styles.carousel}
              width={130 + 10}
              data={totalPrograms}
              ref={(c) => { this._carousel = c; }}
              renderItem={({ item }) => (
                <ButtonRound
                  onPress={() => {}}
                  style={Styles.editButton}
                  white
                  bordered
                >
                  <Text weightBold font11 blue>{item.name}</Text>
                </ButtonRound>
              )}
            />
          )
        }
        {/* <SelectPhoto
          positionStyle={{
            position: "absolute",
            alignItems: "center",
            alignSelf: "center",
            justifyContent: "center",
            ...positionStyle,
          }}
          isPhoto={imageSource !== null}
          label={label}
          type={type2}
          event={event}
        /> */}
      </View>
    );
  }
}

Card.propTypes = {
  programs: PropTypes.object,
  imageSource: PropTypes.any,
  type: PropTypes.string,
  // label: PropTypes.string,
  // event: PropTypes.string,
  height: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  width: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  currentProgram: PropTypes.object,
  onCancel: PropTypes.func,
  titleText: PropTypes.string,
  textStyle: PropTypes.object,
  buttonStyle: PropTypes.object,
  backButtonContrast: PropTypes.bool,
  showMoreButton: PropTypes.bool,
  moreActionEvent: PropTypes.func,
  leftButtonStyle: PropTypes.object
};

const Styles = StyleSheet.create({
  carousel: {
    position: "absolute",
    top: isIphoneX() ? 120 : 90,
    marginHorizontal: 10,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)"
  },
  leftButtonStyle: {
    color: Colors.white
  },
  editButton: {
    width: 130,
    height: 35,
    borderColor: Colors.white,
    alignSelf: "center",
  },
  subHeaderWrapper: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    left: 10,
    right: 10,
    top: 8,
    zIndex: 10
  },
  titleWrapper: {
    padding: 8,
    borderRadius: 12,
  },
  backButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    width: 40,
    height: 40,
    borderRadius: 20
  },
  backButtonContrast: {
    borderRadius: 40 / 2,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.white,
    backgroundColor: Colors.white,
    opacity: 0.7
  },
  moreIcon: {
    fontSize: 20,
    color: Colors.white
  },
});

class SubHeader extends PureComponent {
  render() {
    const {
      titleText, backButtonContrast, leftActionEvent,
      moreActionEvent, textStyle, buttonStyle,
      showMoreButton
    } = this.props;
    return (
      <View style={Styles.subHeaderWrapper}>
        <TouchableOpacity
          activeOpacity={0.5}
          style={[
            Styles.backButtonContainer,
            backButtonContrast && Styles.backButtonContrast,
          ]}
          onPress={leftActionEvent}
        >
          <Icon style={Styles.moreIcon} name="chevron-back" />
        </TouchableOpacity>
        <View style={[Styles.titleWrapper, buttonStyle]}>
          <Text font12 style={textStyle}>{titleText}</Text>
        </View>
        {showMoreButton && (
          <TouchableOpacity
            activeOpacity={0.5}
            style={[
              Styles.backButtonContainer,
              backButtonContrast && Styles.backButtonContrast,
            ]}
            onPress={moreActionEvent}
          >
            <Icon
              name="options-vertical"
              type="SimpleLineIcons"
              style={Styles.moreIcon}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  }
}

SubHeader.propTypes = {
  titleText: PropTypes.string,
  leftActionEvent: PropTypes.func,
  moreActionEvent: PropTypes.func,
  backButtonContrast: PropTypes.bool,
  showMoreButton: PropTypes.bool,
  textStyle: PropTypes.object,
  buttonStyle: PropTypes.object,
};
