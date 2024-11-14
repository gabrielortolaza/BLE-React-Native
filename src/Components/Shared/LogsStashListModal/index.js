import React from "react";
import PropTypes from "prop-types";
import {
  View, StyleSheet
} from "react-native";
import Modal from "react-native-modal";

import { Colors, Images } from "../../../Themes";
import Label from "../Label";
import Icon from "../Icon";
import DataSwitch from "../ExportLogsStash/DataSwitch";
import { LOGS_TAB } from "../../../Config/constants";

const LogsStashListModal = (props) => {
  const {
    activeTab, onClose, setCustomisedList,
    data
  } = props;

  return (
    <Modal
      isVisible
      style={styles.modal}
      onBackdropPress={onClose}
    >
      <View style={styles.container}>
        <View
          style={styles.headerView}
        >
          <Label weightSemiBold font16>
            Customise
          </Label>
          <Icon
            name="close"
            style={styles.closeIcon}
            onPress={onClose}
          />
        </View>
        <Label
          style={styles.selectDataText}
          font12
          weightSemiBold
        >
          SELECT DATA TO SHOW IN
          {`${(activeTab === LOGS_TAB) ? " LOGS " : " STASH "}`}
          LIST
        </Label>
        <View>
          {activeTab === LOGS_TAB && (
            <DataSwitch
              icon={{
                name: "ballot",
                type: "MaterialCommunityIcons"
              }}
              title="Program"
              selected={data.showProgram}
              onValueChange={(val) => setCustomisedList({ showProgram: val })}
              containerStyle={styles.listSwitch}
            />
          )}
          <DataSwitch
            imgSrc={Images.notesIconBlue}
            title="Notes"
            selected={data.showNotes}
            onValueChange={(val) => setCustomisedList({ showNotes: val })}
            containerStyle={styles.listSwitch}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modal: {
    justifyContent: "flex-end",
    margin: 0
  },
  container: {
    paddingHorizontal: 15,
    backgroundColor: Colors.white,
    borderRadius: 12
  },
  headerView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 20
  },
  closeIcon: {
    fontSize: 20,
    color: Colors.lightGrey2
  },
  selectDataText: {
    marginTop: 20,
    marginBottom: 10
  },
  listSwitch: {
    marginBottom: 20
  }
});

LogsStashListModal.propTypes = {
  activeTab: PropTypes.string,
  data: PropTypes.object,
  setCustomisedList: PropTypes.func,
  onClose: PropTypes.func
};

export default LogsStashListModal;
