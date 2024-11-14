import React from "react";
import PropTypes from "prop-types";
import {
  View, StyleSheet, FlatList,
  TouchableOpacity
} from "react-native";
import Modal from "react-native-modal";

import { Colors } from "../../Themes";
import Label from "./Label";
import Icon from "./Icon";

const BottomSelectModal = (props) => {
  const {
    onClose, data, title, selectedItem
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
            {title}
          </Label>
          <Icon
            name="close"
            style={styles.closeIcon}
            onPress={onClose}
          />
        </View>
        <FlatList
          data={data}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() => selectedItem(item.key)}
              style={styles.listView}
            >
              <View style={styles.leftListView}>
                <Icon
                  name={item.icon}
                  type={item.iconType}
                  style={styles.iconInfo}
                />
                <Label>
                  {item.name}
                </Label>
              </View>
              <Icon
                name="chevron-forward"
                style={styles.iconRight}
              />
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.key}
        />
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
    marginTop: 20,
    marginBottom: 30
  },
  closeIcon: {
    fontSize: 20,
    color: Colors.lightGrey2
  },
  listView: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignContent: "center",
    marginBottom: 25
  },
  leftListView: {
    flexDirection: "row",
    alignItems: "center"
  },
  iconInfo: {
    color: Colors.blue,
    fontSize: 18,
    marginRight: 15
  },
  iconRight: {
    color: Colors.lightGrey2,
    fontSize: 18
  }
});

BottomSelectModal.propTypes = {
  title: PropTypes.string,
  data: PropTypes.array,
  onClose: PropTypes.func,
  selectedItem: PropTypes.func
};

export default BottomSelectModal;
