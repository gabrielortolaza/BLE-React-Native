import React, { useRef } from "react";
import PropTypes from "prop-types";
import {
  View, StyleSheet, TextInput,
  TouchableOpacity
} from "react-native";
import Icon from "./Icon";
import { Colors } from "../../Themes";

const SearchInput = ({ placeholder, searchTerm, searchFor }) => {
  const textInputRef = useRef();

  return (
    <TouchableOpacity
      onPress={() => textInputRef.current.focus()}
      style={styles.container}
    >
      <Icon
        name="search"
        type="MaterialIcons"
        style={styles.searchIcon}
      />
      <TextInput
        ref={textInputRef}
        autoCorrect={false}
        numberOfLines={1}
        textAlign="left"
        onChangeText={(text) => searchFor(text)}
        value={searchTerm}
        placeholder={placeholder}
        placeholderTextColor={Colors.lightGrey2}
        style={styles.textInput}
      />
      {searchTerm ? (
        <TouchableOpacity
          onPress={() => searchFor("")}
        >
          <Icon
            name="close-circle"
            style={styles.closeIcon}
          />
        </TouchableOpacity>
      ) : (
        <View
          style={styles.emptyView}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: Colors.backgroundGrey,
    justifyContent: "space-between",
    alignItems: "center",
    height: 46,
    paddingHorizontal: 12,
    borderRadius: 12
  },
  textInput: {
    color: Colors.grey,
    maxWidth: "80%",
    fontSize: 14
  },
  searchIcon: {
    fontSize: 20,
    color: Colors.lightGrey2
  },
  closeIcon: {
    fontSize: 20,
    color: Colors.lightGrey2
  },
  emptyView: {
    width: 20
  }
});

SearchInput.propTypes = {
  placeholder: PropTypes.string,
  searchTerm: PropTypes.string,
  searchFor: PropTypes.func
};

export default SearchInput;
