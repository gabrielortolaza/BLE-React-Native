import React, { PureComponent } from "react";
import {
  View,
} from "react-native";
import PropTypes from "prop-types";
import SplashScreen from "react-native-splash-screen";
import auth from "@react-native-firebase/auth";

import StyleSheet from "../../Proportional";
import { Colors } from "../../Themes";

export default class LaunchScreen extends PureComponent {
  componentDidMount() {
    const { navigation } = this.props;
    const user = auth().currentUser;
    setTimeout(() => {
      if (user) {
        navigation.navigate("Tabs");
      } else {
        navigation.navigate("TourStart");
      }
      SplashScreen.hide();
    }, 1500);
  }

  render() {
    return (
      <View
        testID="LaunchScreenContainer"
        style={styles.container}
      >
        {/* <Animatable.Image
          animation="zoomIn"
          duration={1600}
          iterationCount="infinite"
          useNativeDriver
          style={styles.logoImage}
          source={Images.splashSupergenie}
        >
        </Animatable.Image> */}
      </View>
    );
  }
}

LaunchScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
};

const styles = StyleSheet.createProportional({
  container: {
    flex: 1,
    backgroundColor: Colors.blue,
    alignItems: "center",
    justifyContent: "center"
  },
  logoImage: {
    width: "78%",
    resizeMode: "contain"
  }
});
