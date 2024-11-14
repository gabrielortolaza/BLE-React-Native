import React, { useState, useEffect } from "react";
import { View, StyleSheet, Platform } from "react-native";
import { connect } from "react-redux";
import PropTypes from "prop-types";
import Modal from "react-native-modal";
import TutorialBallon from "../Shared/TutorialBallon";
import { viewedPlTutorial } from "../../Actions";

const offset = Platform.OS === "android" ? 30 : 0;

const tutorialSteps = [
  {
    step: 0,
    program: "FIND",
    direction: "top",
    position: "25%",
    marginVertical: 200 - offset,
  },
  {
    step: 1,
    program: "CREATE",
    direction: "top",
    position: "75%",
    marginVertical: 200 - offset,
  },
  {
    step: 2,
    program: "PLAY",
    direction: "top",
    position: "10%",
    marginVertical: 110 - offset,
  },
  {
    step: 3,
    program: "PIN",
    direction: "top",
    position: "81%",
    marginVertical: 310 - offset,
  },
  {
    step: 4,
    program: "DOWNLOAD",
    direction: "bottom",
    position: "10%",
    marginVertical: 300 - offset,
  },
];

function ModalTutorialSteps({ measurements, handleScrollFunction, viewedPlTutorial }) {
  const [isModalVisible, setModalVisible] = useState(true);
  const [displayIndex, setDisplayIndex] = useState(0);
  const [itemToShow, setItemToShow] = useState(tutorialSteps[displayIndex]);

  useEffect(() => {
    tutorialSteps[0].marginVertical = measurements.findPosition;
    tutorialSteps[1].marginVertical = measurements.findPosition;
    tutorialSteps[2].marginVertical = measurements.playPosition;
    tutorialSteps[3].marginVertical = measurements.pinPosition;
    tutorialSteps[4].marginVertical = measurements.downloadPosition;
    setItemToShow(tutorialSteps[displayIndex]);
  }, [measurements]);

  useEffect(() => {
    setItemToShow(tutorialSteps[displayIndex]);
    viewedPlTutorial(true);
  }, [displayIndex]);

  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  const handleButtonAction = () => {
    if (itemToShow.step < tutorialSteps.length - 1) {
      if (displayIndex + 1 === tutorialSteps.length - 1) {
        if (handleScrollFunction) {
          handleScrollFunction();
        }
      }
      setDisplayIndex(displayIndex + 1);
    } else {
      toggleModal();
    }
  };

  return (
    <>
      <Modal
        hideModalContentWhileAnimating
        backdropTransitionOutTiming={0}
        backdropOpacity={0}
        isVisible={isModalVisible}
        style={{
          flex: 1,
          marginTop: isModalVisible ? itemToShow.marginVertical : 0,
        }}
      >
        <View style={styles.conteiner}>
          <TutorialBallon
            position={itemToShow.position}
            direction={itemToShow.direction}
            program={itemToShow.program}
            modalIsShowing={isModalVisible}
            btnAction={handleButtonAction}
            closeAction={toggleModal}
          />
        </View>
      </Modal>
    </>
  );
}

const mapDispatchToProps = {
  viewedPlTutorial,
};

export default connect(null, mapDispatchToProps)(ModalTutorialSteps);

ModalTutorialSteps.propTypes = {
  measurements: PropTypes.object,
  handleScrollFunction: PropTypes.func,
  viewedPlTutorial: PropTypes.func,
};

const styles = StyleSheet.create({
  conteiner: {
    flex: 1,
    paddingHorizontal: 10,
  },
});
