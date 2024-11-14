import React, { useEffect, useState } from "react";
import {
  FlatList, StyleSheet, TouchableOpacity, View
} from "react-native";
import Modal from "react-native-modal";
import PropTypes from "prop-types";

import { ButtonRound, InputField, Label } from "../../Shared";
import { Colors } from "../../../Themes";
import PumpingTag from "../../Shared/PumpingTag";
import { PROGRAM_TYPE, PUMPING_TAGS, PUMP_TYPE } from "../../../Config/constants";
import Icon from "../../Shared/Icon";

function FilterModal(props) {
  const {
    isVisible, onPressConfirm, onPressDeny, onSaveSearchWord
  } = props;
  const [programType, setProgramType] = useState(PROGRAM_TYPE);

  const [searchWord, setSearchWord] = useState("");

  const [pumpType, setPumpType] = useState(PUMP_TYPE);

  const [programTag, setProgramTag] = useState(PUMPING_TAGS);

  const [applyBtnDisable, setApplyBtnDisable] = useState(false);

  useEffect(() => {
    const selectedProgramType = programType.filter((item) => item.isSelected);
    const selectedPumpType = pumpType.filter((item) => item.isSelected);
    const selectedProgramTag = programTag.filter((item) => item.isSelected);

    if (
      selectedProgramType.length < 1
      && selectedPumpType.length < 1
      && selectedProgramTag.length < 1
      && !searchWord) {
      setApplyBtnDisable(true);
    } else {
      setApplyBtnDisable(false);
    }
  }, [programType, pumpType, programTag, searchWord]);

  const handleChange = (source, id, callback) => {
    const temp = source.map((item) => {
      if (id === item.id) {
        return { ...item, isSelected: !item.isSelected };
      }
      return item;
    });
    callback(temp);
  };

  const clearSelection = (source, callback) => {
    const temp = source.map((item) => ({ ...item, isSelected: false }));
    callback(temp);
  };

  const handleClear = () => {
    clearSelection(programType, setProgramType);
    clearSelection(pumpType, setPumpType);
    clearSelection(programTag, setProgramTag);
    setSearchWord("");
  };

  const handleConfirm = () => {
    const selectedProgramType = programType.filter((item) => item.isSelected);
    const selectedPumpType = pumpType.filter((item) => item.isSelected);
    const selectedProgramTag = programTag.filter((item) => item.isSelected);
    onSaveSearchWord(
      searchWord,
      () => onPressConfirm(selectedProgramType, selectedPumpType, selectedProgramTag)
    );
  };

  return (
    <Modal
      isVisible={isVisible}
      onBackdropPress={() => onPressDeny()}
    >
      <View style={styles.container}>
        <View style={styles.titleWrapper}>
          <Label grey font18>
            Filter Programs
          </Label>
          <TouchableOpacity
            style={styles.closeIconContainer}
            onPress={() => onPressDeny()}
          >
            <Icon
              type="Ionicons"
              name="close-outline"
              style={styles.closeIcon}
            />
          </TouchableOpacity>
        </View>
        <View style={styles.divider} />
        <Label grey font16 style={[styles.categoryLabel, { marginBottom: 0 }]}>
          By name
        </Label>
        <InputField
          autoCapitalize="none"
          onChangeText={setSearchWord}
          value={searchWord}
          placeholder="Enter keyword"
          style={styles.searchInput}
        />
        <Label grey font16 style={styles.categoryLabel}>
          By location
        </Label>
        <FlatList
          data={programType}
          numColumns={2}
          renderItem={({ item }) => (
            <PumpingTag
              id={item.id}
              label={item.label}
              isSelected={item.isSelected}
              onPress={(id) => handleChange(programType, id, setProgramType)}
            />
          )}
          keyExtractor={(item) => item.id}
        />
        <Label grey font16 style={styles.categoryLabel}>
          By pump
        </Label>
        <FlatList
          data={pumpType}
          numColumns={2}
          renderItem={({ item }) => (
            <PumpingTag
              id={item.id}
              label={item.name}
              isSelected={item.isSelected}
              onPress={(id) => handleChange(pumpType, id, setPumpType)}
            />
          )}
          keyExtractor={(item) => item.id}
        />
        <Label grey font16 style={styles.categoryLabel}>
          By type of program
        </Label>
        <FlatList
          data={programTag}
          numColumns={2}
          renderItem={({ item }) => (
            <PumpingTag
              id={item.id}
              label={item.label}
              isSelected={item.isSelected}
              onPress={(id) => handleChange(programTag, id, setProgramTag)}
            />
          )}
          keyExtractor={(item) => item.id}
        />
        <View style={styles.buttonContainer}>
          <ButtonRound
            style={styles.optionButton}
            bordered
            light
            onPress={handleClear}
          >
            <Label>Clear</Label>
          </ButtonRound>
          <ButtonRound
            style={styles.optionButton}
            disabled={applyBtnDisable}
            blue
            onPress={handleConfirm}
          >
            <Label white>Apply</Label>
          </ButtonRound>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    minHeight: 200,
    paddingHorizontal: 25,
    paddingVertical: 30,
    backgroundColor: "white",
    borderRadius: 20,
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  divider: {
    height: 1,
    backgroundColor: Colors.whiteFive,
    marginVertical: 20,
  },
  categoryLabel: {
    marginTop: 8,
    marginBottom: 16,
  },
  searchInput: {
    height: 50,
    marginBottom: 10,
    fontSize: 14
  },
  buttonContainer: {
    marginTop: 16,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  optionButton: {
    width: "45%",
  },
  closeIcon: {
    fontSize: 24,
  },
});

FilterModal.propTypes = {
  isVisible: PropTypes.bool,
  onPressConfirm: PropTypes.func,
  onPressDeny: PropTypes.func,
  onSaveSearchWord: PropTypes.func,
};

export default FilterModal;
