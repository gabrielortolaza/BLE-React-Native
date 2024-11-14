import React from "react";
import {
  TouchableOpacity, View, StyleSheet, ScrollView
} from "react-native";
import Modal from "react-native-modal";
import PropTypes from "prop-types";

import { Colors, Fonts } from "../../Themes";
import { Label } from ".";
import { PUMPING_TAGS } from "../../Config/constants";
import Icon from "./Icon";

function PumpingCategoryModal(props) {
  const { isVisible, onClose } = props;

  return (
    <Modal isVisible={isVisible} style={styles.modalView}>
      <View style={styles.container}>
        <View style={styles.titleContainer}>
          <Label style={styles.titleText}>Categories</Label>
          <TouchableOpacity style={styles.closeBtn} onPress={onClose}>
            <Icon name="close" style={styles.closeIcon} />
          </TouchableOpacity>
        </View>

        <ScrollView style={styles.containerListView}>
          {PUMPING_TAGS.map((item) => {
            return (
              <View key={item.id} style={styles.lineListView}>
                <Label style={styles.labelText}>{item.label}</Label>
                <Label style={styles.descriptionText}>{item.description}</Label>
              </View>
            );
          })}
        </ScrollView>
      </View>
    </Modal>
  );
}

PumpingCategoryModal.propTypes = {
  isVisible: PropTypes.bool,
  onClose: PropTypes.func,
};

export default PumpingCategoryModal;

const styles = StyleSheet.create({
  modalView: {
    flex: 1,
    backgroundColor: Colors.white,
    marginVertical: 100,
    borderRadius: 8,
  },
  container: {
    flex: 1,
  },
  titleContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 25,
    paddingHorizontal: 20,
  },
  closeBtn: {
    padding: 8,
  },
  closeIcon: {
    fontSize: 26,
    color: Colors.grey,
  },
  titleText: {
    fontSize: 20,
    ...Fonts.SemiBold,
  },
  labelText: {
    fontSize: 16,
    ...Fonts.SemiBold,
    marginVertical: 8,
  },
  descriptionText: {
    lineHeight: 26,
    fontSize: 15,
    ...Fonts.Regular,
    marginBottom: 8,
  },
  containerListView: {
    marginTop: 30,
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  lineListView: {
    flexDirection: "column",
  },
});
