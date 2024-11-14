import { StyleSheet } from "react-native";

import { Colors, Fonts } from "../../../Themes";

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
  },
  scrollContainer: {
    paddingHorizontal: 16,
  },
  sessionTitle: {
    fontSize: 16,
    ...Fonts.Regular,
    color: Colors.grey,
    marginLeft: 15,
    marginVertical: 20,
  },
  segmentInfo: {
    flex: 1,
    height: 40,
  },
  divider: {
    width: "100%",
    alignSelf: "center",
    borderWidth: 0.5,
    borderColor: Colors.warmGrey30p,
    marginVertical: 20,
  },
  descriptionView: {
    marginTop: 20
  },
  nameInput: {
    fontSize: 14
  },
  descriptionInput: {
    marginTop: 0
  },
  carousel: {
    width: "100%",
    marginTop: "10%",
  },
  switchView: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    alignItems: "center",
  },
  privacyContainer: {
    flexDirection: "row",
  },
  privacyText: {
    marginLeft: 10,
    marginRight: 40,
    color: Colors.lightGrey2,
  },
  buttonView: {
    flexDirection: "row",
    width: "100%",
    marginVertical: 20,
  },
  privacyIcon: {
    color: Colors.lightGrey2,
    fontSize: 23,
    marginHorizontal: 10,
    marginTop: 7,
  },
  tagInfo: {
    flexDirection: "row",
    marginBottom: 10,
    alignItems: "center",
  },
  tagContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  infoBtn: {
    marginLeft: 4,
    padding: 8,
  },
  infoIcon: {
    color: Colors.grey,
    fontSize: 26,
  },
  photoView: {
    marginTop: 15,
    marginBottom: 30,
    borderWidth: 1,
    borderColor: Colors.blue,
    borderStyle: "dashed",
    height: 200,
    width: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  selectPhoto: {
    marginRight: 0,
  },
  buttonsView: {
    flexDirection: "row",
    marginTop: 20,
    marginBottom: 40,
    marginHorizontal: 10,
    justifyContent: "space-between",
  },
  cancelButtons: {
    width: "47%",
  },
  createButtons: {
    width: "47%",
  },
  programImage: {
    width: "100%",
    height: "100%",
  },
  deleteProgram: {
    flexDirection: "row",
    alignItems: "center",
  },
  deleteIcon: {
    color: Colors.coral,
  },
  removeContainer: {
    position: "absolute",
    right: 8,
    top: 8,
  },
  removeWrapper: {
    backgroundColor: Colors.coolGrey,
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  removeIcon: {
    color: Colors.white,
    fontSize: 24,
  },
});

export default styles;
