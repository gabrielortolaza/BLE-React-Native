import { StyleSheet } from "react-native";

import { Colors } from "../../../Themes";

const styles = StyleSheet.create({
  viewDemarcation: {
    borderTopWidth: 1,
    marginHorizontal: 25,
    borderTopColor: "rgba(149, 161, 182, 0.5)"
  },
  durationBox: {
    alignItems: "center"
  },
  p5: {
    paddingLeft: 5,
    paddingRight: 5
  },
  p15: {
    paddingLeft: 15,
    paddingRight: 15
  },
  rowCentered: {
    justifyContent: "center",
  },
  doneButtonView: {
    paddingHorizontal: 25,
    marginTop: 10
  },
  doneButton: {
    alignSelf: "center",
    width: "100%"
  },
  segment: {
    backgroundColor: "transparent",
    alignSelf: "auto",
  },
  segmentButtonInactive: {
    borderColor: Colors.lightBlue,
    backgroundColor: Colors.white,
    borderWidth: 3,
  },
  segmentButtonActive: {
    borderColor: Colors.lightBlue,
    backgroundColor: Colors.lightBlue,
    borderWidth: 3,
  },
  colorWhite: {
    color: Colors.white
  },
  footer: {
    backgroundColor: Colors.windowsBlue,
    justifyContent: "flex-start",
    alignItems: "center",
    padding: 5
  },
  footerLabel: {
    paddingBottom: 4,
    flex: 1
  },
  textInput: {
    backgroundColor: "rgba(156, 221, 202, 0.2)",
    fontSize: 18,
    paddingVertical: 3,
    paddingHorizontal: 5,
    fontWeight: "600",
    borderRadius: 6,
    color: Colors.grey,
    marginVertical: 5,
    marginHorizontal: 10,
    textAlign: "center",
    width: 50,
    height: 40
  },
  headerTitle: {
    fontSize: 22,
    flex: 1,
    color: Colors.black,
    textAlign: "center"
  },
  headerText: {
    fontSize: 20,
  }
});

export default styles;
