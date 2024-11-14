import React from "react";
import PropTypes from "prop-types";
import { View, Dimensions } from "react-native";
import Carousel, { Pagination } from "react-native-reanimated-carousel";
import { ifIphoneX } from "react-native-iphone-screen-helper";

import { Colors } from "../../Themes";
import TourItem from "./tourItem";

const appWidth = Dimensions.get("window").width;
const slideData = [
  Colors.lightBlue,
  Colors.orange,
  Colors.blue,
  Colors.lightGreen,
  Colors.lightBlue,
];

class Tour extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      activeSlide: 0
    };
  }

  onSkip = () => {
    const { navigation } = this.props;
    navigation.navigate("TourStart");
  }

  get pagination() {
    const { activeSlide } = this.state;
    return (
      <View style={Styles.pageControl}>
        <Pagination
          dotsLength={slideData.length}
          activeDotIndex={activeSlide}
          containerStyle={{
            backgroundColor: Colors.black30p,
            borderRadius: 12,
            paddingVertical: 8
          }}
          dotStyle={{
            width: 6,
            height: 6,
            borderRadius: 3,
            marginHorizontal: 0,
            backgroundColor: Colors.white
          }}
          inactiveDotStyle={{
            backgroundColor: Colors.white30p
          }}
          inactiveDotOpacity={1}
          inactiveDotScale={0.9}
        />
      </View>
    );
  }

  render() {
    const { activeSlide } = this.state;
    return (
      <View style={[Styles.container, { backgroundColor: slideData[activeSlide] }]}>
        <Carousel
          loop={false}
          data={slideData}
          width={appWidth}
          ref={(c) => { this._carousel = c; }}
          onSnapToItem={(index) => this.setState({ activeSlide: index })}
          renderItem={({ index }) => <TourItem index={index} onSkip={this.onSkip} />}
        />
        {this.pagination}
      </View>
    );
  }
}

Tour.propTypes = {
  navigation: PropTypes.object
};

const Styles = {
  container: {
    flex: 1,
    backgroundColor: Colors.lightBlue
  },
  pageControl: {
    position: "absolute",
    ...ifIphoneX({
      bottom: 25
    }, {
      bottom: 0
    }),
    alignSelf: "center",
  }
};

export default Tour;
