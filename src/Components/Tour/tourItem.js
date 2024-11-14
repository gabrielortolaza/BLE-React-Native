import React from "react";
import PropTypes from "prop-types";
import {
  View, Image, Dimensions, TouchableOpacity
} from "react-native";
import { ifIphoneX } from "react-native-iphone-screen-helper";

import Text from "../Shared/Label";
import ButtonRound from "../Shared/ButtonRound";
import { Colors, Images } from "../../Themes";
import { size } from "../../Services/SharedFunctions";

const appWidth = Dimensions.get("window").width;
const padding = size(40);

class TourItem extends React.Component {
  renderFirstSlide = () => {
    return (
      <View style={Styles.slide}>
        <Text style={Styles.textTitle}>
          Welcome to
          {"\n"}
          Pumpables!
        </Text>
        <Text style={Styles.textDescription}>
          We’re so happy to welcome you to the Pumpables family! Use the app to control SuperGenie
          from your phone. Save the settings that work for you, and play them back with one tap.
        </Text>
        <View style={Styles.logoContainer}>
          <Image
            source={Images.tourWelcome}
            resizeMode="contain"
            style={Styles.logo}
          />
        </View>
      </View>
    );
  }

  renderSecondSlide = () => {
    return (
      <View style={[Styles.slide, { paddingHorizontal: 0, backgroundColor: Colors.orange }]}>
        <Image
          source={Images.tourModes}
          resizeMode="contain"
          style={Styles.tour2Image}
        />
        <Text
          style={[
            Styles.textTitle, { marginTop: appWidth * 1.04 + size(24), marginHorizontal: padding }
          ]}
        >
          Switch between the two modes
        </Text>
        <Text style={[Styles.textDescription, { marginHorizontal: padding }]}>
          Start in letdown mode to trigger milk flow with a light, fast pattern of suction,
          like your baby would. When you're ready, switch to expression mode for higher,
          slower suction to draw your milk out.
        </Text>
      </View>
    );
  }

  renderThirdSlide = () => {
    return (
      <View style={[Styles.slide, { paddingHorizontal: 0, backgroundColor: Colors.blue }]}>
        <Image
          source={Images.tourCyclevacuum}
          resizeMode="contain"
          style={Styles.tour3Image}
        />
        <Text style={[
          Styles.textTitle, { marginTop: appWidth * 1.04 + size(24), marginHorizontal: padding }]}
        >
          Adjust the cycle and vacuum levels
        </Text>
        <Text style={[Styles.textDescription, { marginHorizontal: padding }]}>
          Find out what works best for you. In both modes you can adjust cycle speed and suction
          strength. Remember, never adjust suction higher than your comfort level, mama.
        </Text>
      </View>
    );
  }

  renderFourthSlide = () => {
    return (
      <View style={[Styles.slide, { backgroundColor: Colors.lightGreen }]}>
        <Text style={Styles.textTitle}>
          Create your own programs
        </Text>
        <Text style={Styles.textDescription}>
          Once you’ve found the settings that work for you, save them to the app and
          play back next time at the tap of a button.
        </Text>
        <Image
          source={Images.tourProgram}
          resizeMode="cover"
          style={Styles.tour4Image}
        />
      </View>
    );
  }

  renderFifthSlide = () => {
    const { onSkip } = this.props;
    return (
      <View style={Styles.slide}>
        <Text style={Styles.textTitle}>
          Want to get some help?
        </Text>
        <Text style={Styles.textDescription}>
          We know you are working hard mama. You don't have to do it alone.
          Join the Pumpables Community on Facebook or  ask us your questions at hello@pumpables.co
        </Text>
        <View style={Styles.logoContainer}>
          <Image
            source={Images.tourHelp}
            resizeMode="contain"
            style={Styles.logo}
          />
        </View>
        <ButtonRound style={Styles.goButton} white large onPress={() => onSkip()}>
          <Text font18 blue weightSemiBold>Got it!</Text>
        </ButtonRound>
      </View>
    );
  }

  render() {
    const { index, onSkip } = this.props;
    return (
      <View style={Styles.container}>
        {
          index === 0 && this.renderFirstSlide()
        }
        {
          index === 1 && this.renderSecondSlide()
        }
        {
          index === 2 && this.renderThirdSlide()
        }
        {
          index === 3 && this.renderFourthSlide()
        }
        {
          index === 4 && this.renderFifthSlide()
        }
        <TouchableOpacity style={Styles.skipButton} onPress={onSkip}>
          <Text white font12 weightSemiBold>
            Skip
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
}

TourItem.propTypes = {
  index: PropTypes.number,
  onSkip: PropTypes.func
};

const Styles = {
  container: {
    flex: 1,
    alignItems: "center"
  },
  slide: {
    flex: 1,
    paddingHorizontal: padding,
  },
  textTitle: {
    fontSize: size(30),
    textAlign: "center",
    lineHeight: size(40),
    color: "white",
    fontWeight: "700",
    ...ifIphoneX({
      marginTop: size(120)
    }, {
      marginTop: size(90)
    }),
  },
  textDescription: {
    fontSize: size(14),
    textAlign: "center",
    lineHeight: size(22),
    color: "white",
    fontWeight: "700",
    marginTop: size(17)
  },
  logoContainer: {
    width: appWidth * 0.75,
  },
  logo: {
    width: "100%",
    resizeMode: "contain",
    alignSelf: "center",
    marginTop: size(58)
  },
  tour2Image: {
    position: "absolute",
    ...ifIphoneX({
      right: -2
    }, {
      right: -1
    }),
    top: 0,
    resizeMode: "contain",
    width: appWidth * 0.86,
    height: appWidth * 1.04,
    alignSelf: "flex-end",
  },
  tour3Image: {
    position: "absolute",
    ...ifIphoneX({
      right: -9
    }, {
      right: -1
    }),
    top: 0,
    resizeMode: "contain",
    width: appWidth * 0.79,
    height: appWidth * 1.04,
    alignSelf: "flex-end",
  },
  tour4Image: {
    position: "absolute",
    bottom: 0,
    width: appWidth * 0.67,
    height: appWidth * 0.9,
    alignSelf: "center",
  },
  skipButton: {
    padding: 8,
    position: "absolute",
    left: size(28),
    ...ifIphoneX({
      top: size(50)
    }, {
      top: size(25)
    }),
  },
  goButton: {
    alignSelf: "center",
    marginTop: size(50),
  }
};

export default TourItem;
