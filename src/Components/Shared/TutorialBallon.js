import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  View, TouchableOpacity, StyleSheet
} from "react-native";
import Balloon from "rn-balloon";
import { Label as Text } from ".";
import { Colors, Fonts } from "../../Themes";
import { appWidth } from "../../Services/SharedFunctions";
import Icon from "./Icon";

const TutorialBallon = ({
  position, direction, program = "FIND", btnAction, closeAction, modalIsShowing = true
}) => {
  const [tutorialText, setTutorialText] = useState(getTextForProgram(program));
  const trianglePosition = position ?? "20%";
  const triangleDirection = direction ?? "top";
  const [show, setShow] = useState(modalIsShowing);

  useEffect(() => {
    setTutorialText(getTextForProgram(program));
  }, [program]);

  useEffect(() => {
    setShow(modalIsShowing);
  }, [modalIsShowing]);

  function getTextForProgram(program) {
    switch (program) {
      case "FIND":
        return {
          titleText: "Find Programs",
          msgText: "To find the programs that are right for you, click Find Programs, filter, and then download any you like to your personal program list.",
          btnText: "Next"
        };

      case "CREATE":
        return {
          titleText: "Create & Share Programs",
          msgText: "To find the programs that are right for you, click Find Programs, filter, and then download any you like to your personal program list.",
          btnText: "Next"
        };

      case "PLAY":
        return {
          titleText: "Play Programs",
          msgText: "You are still able to play your own programs from Programs screen or from “My programs” page by tapping “See All”.",
          btnText: "Next"
        };

      case "DOWNLOAD":
        return {
          titleText: "Download Programs",
          msgText: "Download to “My Programs” from Pumpables library by tapping “download” buttom or by opening a program and download from there.",
          btnText: "Done"
        };

      case "PIN":
        return {
          titleText: "Pin to Top",
          msgText: "Pin to top you favorite programs by tapping the heart icon!",
          btnText: "Next"
        };

      case "NO_PROGRAM":
        return {
          titleText: "Grab some programs and start pumping!",
          msgText: "Filter for programs best suited to your needs on our new program library! Download those you like to your personal program list, then use, modify and share with friends!",
          btnText: "Go to Pumpables Library"
        };

      default:
        return {
          titleText: "Find Programs",
          msgText: "To find the programs that are right for you, click Find Programs, filter, and then download any you like to your personal program list.",
          btnText: "Next"
        };
    }
  }

  const handleAction = () => {
    console.log("handleAction");
    if (program === "NO_PROGRAM") {
      setShow(!show);
    }
    if (btnAction) {
      btnAction();
    }
  };

  const handleCloseAction = () => {
    console.log("handleCloseAction");
    if (closeAction) {
      closeAction();
    }
    setShow(!show);
  };

  return (
    <>
      {show && (
        <Balloon
          borderColor={Colors.lightBlue}
          backgroundColor={Colors.lightBlue}
          borderWidth={2}
          borderRadius={8}
          triangleSize={12}
          width={appWidth * 0.8}
          triangleOffset={trianglePosition}
          triangleDirection={triangleDirection} // top/bottom/left/right
        >
          <View style={styles.titleView}>
            <Text style={styles.titleText}>
              {tutorialText.titleText}
            </Text>
            <TouchableOpacity style={styles.closeBtn} onPress={handleCloseAction}>
              <Icon
                name="close"
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          </View>
          <Text style={styles.msgText}>
            {tutorialText.msgText}
          </Text>
          <TouchableOpacity style={styles.actionBtn} onPress={handleAction}>
            <Text style={styles.actionBtnText}>
              {tutorialText.btnText}
            </Text>
          </TouchableOpacity>
        </Balloon>
      )}
    </>
  );
};

export default TutorialBallon;

const styles = StyleSheet.create({
  titleView: {
    flexDirection: "row",
    marginBottom: 20,
  },
  titleText: {
    // lineHeight: 80,
    fontSize: 23,
    fontWeight: "500",
    marginHorizontal: 10,
  },
  msgText: {
    lineHeight: 20,
    marginRight: 8,
    marginStart: 10,
    marginBottom: 10,
    fontSize: 15,
  },
  closeBtn: {
    top: -3,
    right: -3,
    position: "absolute",
  },
  closeIcon: {
    fontSize: 23,
    color: Colors.black,
  },
  actionBtn: {
    alignItems: "flex-end",
  },
  actionBtnText: {
    fontSize: 16,
    ...Fonts.Regular,
    textDecorationLine: "underline",
    textAlign: "right",
    lineHeight: 24,
  },
});

TutorialBallon.propTypes = {
  position: PropTypes.string,
  direction: PropTypes.string,
  program: PropTypes.string,
  btnAction: PropTypes.func,
  closeAction: PropTypes.func,
  modalIsShowing: PropTypes.bool
};
