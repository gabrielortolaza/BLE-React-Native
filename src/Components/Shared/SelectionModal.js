import React, { Component } from "react";
import {
  View, KeyboardAvoidingView, Platform,
  TouchableOpacity, FlatList
} from "react-native";
import PropTypes from "prop-types";
import Modal from "react-native-modal";
import * as Animatable from "react-native-animatable";

import ButtonRound from "./ButtonRound";
import InputField from "./InputField";
import Label from "./Label";
import ModalRowItem from "./ModalRowItem";
import { Colors } from "../../Themes";
import { appHeight } from "../../Services/SharedFunctions";
import Icon from "./Icon";

export default class SelectionModal extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedValue: null,
      animationType: "slideInRight",
    };
  }

  componentDidMount() {
    const { selectedValue } = this.props;
    this.setState({ selectedValue });
  }

  componentDidUpdate(prevProps) {
    const { selectedValue } = this.props;

    if (prevProps.selectedValue !== selectedValue) {
      this.setState({ selectedValue });
    }
  }

  onPressItem = (selection, close = true) => {
    const { onPressConfirm } = this.props;

    if (close) {
      onPressConfirm(selection);
    } else {
      this.setState({ selectedValue: selection });
    }
  };

  renderBackButton = () => {
    const { onPressCloseButton } = this.props;
    return (
      <TouchableOpacity
        onPress={() => onPressCloseButton()}
        style={styles.backIconContainer}
      >
        <Icon
          name="arrow-back"
          style={styles.backIcon}
        />
      </TouchableOpacity>
    );
  };

  render() {
    const {
      title, isVisible, dataArr, customSlide,
      onChangeTexz, customSlidePlaceholder, customSlideButtonText,
      customSlideSubmit, subMenuDataArr, subMenu, modalType,
      itemStyle, modalStyle
    } = this.props;
    const { animationType, selectedValue } = this.state;
    const usedModalStyle = [
      modalType !== "middle" && styles.bottomHalfModal,
      modalStyle
    ];

    return (
      <View>
        <Modal
          isVisible={isVisible}
          style={usedModalStyle}
          onBackdropPress={() => this.onPressItem(selectedValue)}
        >
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "position" : null}
          >
            <View style={styles.container}>
              {title ? (
                <View>
                  <View style={styles.titleWrapper}>
                    <Label grey font18>
                      {title}
                    </Label>
                    <TouchableOpacity
                      style={styles.closeIconContainer}
                      onPress={() => this.onPressItem(selectedValue)}
                    >
                      <Icon
                        type="Ionicons"
                        name="close-outline"
                        style={styles.closeIcon}
                      />
                    </TouchableOpacity>
                  </View>
                  <View style={styles.divider} />
                </View>
              ) : (
                <View style={styles.dividerNoTitle} />
              )}
              <View style={styles.itemsWrapper}>
                <FlatList
                  style={{ maxHeight: appHeight * 0.7 }}
                  data={dataArr}
                  keyExtractor={(item) => item.key.toString()}
                  showsVerticalScrollIndicator={false}
                  renderItem={({ item }) => {
                    const {
                      titl, subTitle, image,
                      icon, iconType, iconColor,
                      key, type, isDanger,
                      activeLevel
                    } = item;
                    return (
                      <ModalRowItem
                        key={key}
                        style={itemStyle}
                        type={type}
                        title={titl}
                        subTitle={subTitle}
                        isDanger={isDanger}
                        activeLevel={activeLevel}
                        image={image}
                        icon={icon}
                        iconType={iconType}
                        iconColor={iconColor}
                        isSelected={selectedValue === key}
                        onPress={() => this.onPressItem(key, modalType !== "middle")}
                      />
                    );
                  }}
                />
              </View>
              {customSlide && (
                <Animatable.View
                  animation={animationType}
                  duration={500}
                  style={styles.importPContainer}
                >
                  {this.renderBackButton()}
                  <InputField
                    autoCapitalize="none"
                    autoCorrect={false}
                    keyboardType="default"
                    onChangeText={(text) => { onChangeTexz(text); }}
                    placeholder={customSlidePlaceholder}
                    style={styles.customSlideInput}
                  />
                  <View style={styles.buttonContainer}>
                    <ButtonRound
                      onPress={() => customSlideSubmit()}
                      blue
                      style={styles.importButton}
                    >
                      <Label white>{customSlideButtonText}</Label>
                    </ButtonRound>
                  </View>
                </Animatable.View>
              )}
              {subMenu && (
                <Animatable.View
                  animation={animationType}
                  duration={500}
                  style={styles.importPContainer}
                >
                  {this.renderBackButton()}
                  <View style={styles.container}>
                    {subMenuDataArr.map(({
                      titl, subTitle, image,
                      icon, iconType, iconColor,
                      key, type, isDanger,
                      hide
                    }) => {
                      if (hide) return;
                      return (
                        <ModalRowItem
                          key={key}
                          type={type}
                          title={titl}
                          subTitle={subTitle}
                          isDanger={isDanger}
                          image={image}
                          icon={icon}
                          iconType={iconType}
                          iconColor={iconColor}
                          isSelected={selectedValue === key}
                          onPress={() => this.onPressItem(key)}
                        />
                      );
                    })}
                  </View>
                </Animatable.View>
              )}
            </View>
          </KeyboardAvoidingView>
        </Modal>
      </View>
    );
  }
}

const styles = {
  backIconContainer: { paddingVertical: 10 },
  backIcon: { fontSize: 20, color: Colors.blue },
  bottomHalfModal: {
    justifyContent: "flex-end",
    margin: 0
  },
  container: {
    minHeight: 200,
    backgroundColor: "white",
    borderRadius: 20,
  },
  titleWrapper: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: 25,
    paddingLeft: 25,
    paddingRight: 20,
  },
  closeIconContainer: { padding: 10 },
  closeIcon: { fontSize: 30, color: Colors.grey },
  itemsWrapper: { paddingHorizontal: 25, paddingBottom: 25 },
  divider: {
    height: 1,
    backgroundColor: Colors.whiteFive,
    marginBottom: 20
  },
  dividerNoTitle: {
    marginTop: 30
  },
  importPContainer: {
    backgroundColor: "white",
    position: "absolute",
    left: 0,
    top: 0,
    right: 0,
    bottom: 0,
    padding: 25,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  customSlideInput: {
    marginHorizontal: 20,
    marginTop: 20,
    borderColor: Colors.blue,
    borderWidth: 1,
    fontSize: 14
  },
  buttonContainer: {
    position: "absolute",
    bottom: 20,
    width: "100%",
    flexDirection: "row",
    justifyContent: "center"
  },
  importButton: {
    width: "35%",
    marginHorizontal: 10
  },
};

SelectionModal.propTypes = {
  title: PropTypes.string,
  dataArr: PropTypes.array,
  isVisible: PropTypes.bool,
  modalType: PropTypes.string,
  modalStyle: PropTypes.object,
  itemStyle: PropTypes.object,
  selectedValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  subMenuDataArr: PropTypes.array,
  subMenu: PropTypes.bool,
  customSlide: PropTypes.bool,
  onPressConfirm: PropTypes.func.isRequired,
  onChangeTexz: PropTypes.func,
  customSlidePlaceholder: PropTypes.string,
  customSlideButtonText: PropTypes.string,
  customSlideSubmit: PropTypes.func,
  onPressCloseButton: PropTypes.func
};
