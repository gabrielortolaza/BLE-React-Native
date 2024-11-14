import { ifIphoneX } from "react-native-iphone-screen-helper";
import { Colors } from "../../../Themes";

const Styles = {
  headerContain: {
    ...ifIphoneX({
      paddingTop: 0
    }, {
      paddingTop: 0
    }),
  },
  containerFloating: {
    position: "absolute", left: 0, right: 0, zIndex: 10
  },
  header: {
    borderBottomWidth: 0,
    backgroundColor: "transparent",
    // paddingLeft: 25,
    paddingRight: 25
  },
  white10p: {
    backgroundColor: "rgba(255,255,255,0.9)"
  },
  leftText: {
    marginLeft: 5
  },
  moreIcon: {
    fontSize: 20,
    color: Colors.grey
  },
  backButtonContrast: {
    borderRadius: 40 / 2,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: Colors.white,
    backgroundColor: Colors.white,
    opacity: 0.7
  },
  backButtonContainer: {
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "row",
    width: 40,
    height: 40,
    borderRadius: 20
  },
  button: {
    marginHorizontal: 3,
  },
  buttonWhite: {
    backgroundColor: Colors.white,
    borderColor: Colors.white,
  },
  buttonTextSmall: {
    fontSize: 12,
    color: Colors.grey,
  },
  buttonIconSmall: {
    fontSize: 16
  },
  buttonIconTop: {
    flexDirection: "row"
  },
  colorWhite: {
    color: "white"
  },
  colorWhiteDisabled: {
    color: Colors.white40p,
  },
  colorDisabled: {
    color: Colors.lightGrey2,
  },
  colorEnabled: {
    color: Colors.blue,
  },
  colorRed: {
    color: Colors.red,
  },
  icon: {
    fontSize: 20,
    marginHorizontal: 8,
  },
  image: {
    width: 24,
    height: 24
  }
};
export default Styles;
