import StyleSheet from "../../Proportional";
import { Colors } from "../../Themes";

export default StyleSheet.createProportional({
  dateTimeContainer: {
    width: "100%",
    marginBottom: 12
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20
  },
  column: {
    flexDirection: "column",
    justifyContent: "center",
    marginVertical: 5,
    alignItems: "center"
  },
  text: {
    paddingTop: 8
  },
  flex1: {
    flex: 1
  },
  divider: {
    width: "90%",
    alignSelf: "center",
    borderWidth: 0.5,
    borderColor: "rgba(149, 161, 182, 0.5)",
    marginVertical: 5
  },
  dateTimeLabel: {
    backgroundColor: Colors.input,
    borderColor: Colors.tertiary,
    borderWidth: 1,
    borderRadius: 5,
    width: "47%",
    height: 48,
    justifyContent: "center",
    paddingHorizontal: 16,
  },
  dateTimeWrap: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  focusLabel: {
    backgroundColor: Colors.input,
    borderColor: Colors.tertiary,
    borderWidth: 1,
    borderBottomWidth: 1,
    borderBottomLeftRadius: 5,
    borderBottomRightRadius: 5,
  },
});
