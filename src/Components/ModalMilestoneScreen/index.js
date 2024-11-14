/* eslint-disable react/no-unused-state */
import React, { Component } from "react";
import PropTypes from "prop-types";
import {
  ScrollView, View, KeyboardAvoidingView,
  Platform, TouchableOpacity
} from "react-native";
import { connect } from "react-redux";

import { saveGoals, setMeasureUnit } from "../../Actions";
import StyleSheet from "../../Proportional";
import { measureUnitModalDataArr } from "../../Config/constants";
import { findTitle } from "../../Services/SharedFunctions";
import { Colors, Images } from "../../Themes";

import Card from "./Card";
import { Label, Checkable } from "../Shared";
import Header from "../Shared/AppHeader/Header";
import Container from "../Shared/Container";
import Icon from "../Shared/Icon";
import InfoModal from "../Shared/InfoModal";

class ModalMilestoneScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      editing: "",
      showPumpSessionGoalModal: false,
      showMinStashGoalModal: false
    };
  }

  setWeekEditing = () => this.setState({ editing: "goal_weekly" });

  setMonthEditing = () => this.setState({ editing: "goal_monthly" });

  onInputBlur = () => this.setState({ editing: "" });

  findSelectedUnit = (index) => {
    const { measureUnit } = this.props;

    return (
      measureUnitModalDataArr[index].titl === findTitle(measureUnitModalDataArr, measureUnit)
    );
  }

  selectUnit = (index) => {
    const { setMeasureUnit } = this.props;

    setMeasureUnit(measureUnitModalDataArr[index].key);
  }

  render() {
    const {
      navigation, list, save,
      measureUnit
    } = this.props;
    const { showPumpSessionGoalModal, showMinStashGoalModal } = this.state;

    const goalDaily = list.goal_daily || {};
    const goalStash = list.goal_stash || {};

    return (
      <Container noScroll style={styles.modalView} edges={["top"]}>
        <Header
          leftActionText="Goal"
          leftActionEvent={navigation.goBack}
        />
        <KeyboardAvoidingView
          style={styles.container}
          behavior={Platform.OS === "ios" ? "padding" : null}
        >
          <ScrollView style={styles.container}>
            <View style={styles.milestones}>
              <View style={styles.subtitle}>
                <Label>
                  <Label>Set your</Label>
                  <Label weightBold> daily pumped goal</Label>
                  <Label> below.</Label>
                </Label>
                <TouchableOpacity
                  onPress={() => this.setState({ showPumpSessionGoalModal: true })}
                >
                  <Icon name="information-circle-outline" type="Ionicons" style={styles.infoIcon} />
                </TouchableOpacity>
              </View>
              <Card
                id="goal_daily"
                image={Images.goalBg}
                isEditing={false}
                measureUnit={measureUnit}
                onInputBlur={this.onInputBlur}
                onInputFocus={() => {}}
                save={save}
                value={goalDaily.volume ? `${goalDaily.volume}` : ""}
              />
              <View style={styles.subtitle}>
                <View>
                  <Label>
                    <Label>Set your</Label>
                    <Label weightBold> minimum goal for stashed milk</Label>
                  </Label>
                  <Label>below.</Label>
                </View>
                <TouchableOpacity
                  onPress={() => this.setState({ showMinStashGoalModal: true })}
                >
                  <Icon name="information-circle-outline" type="Ionicons" style={styles.infoIcon} />
                </TouchableOpacity>
              </View>
              <Card
                id="goal_stash"
                image={Images.stashGoalBg}
                isEditing={false}
                measureUnit={measureUnit}
                onInputBlur={this.onInputBlur}
                onInputFocus={() => {}}
                save={save}
                value={goalStash.volume ? `${goalStash.volume}` : ""}
              />
            </View>
            <View style={styles.unitText}>
              <Label weightSemiBold>
                Choose unit preference:
              </Label>
            </View>
            <View style={styles.unitRowView}>
              <View>
                <Checkable
                  onPress={() => { this.selectUnit(0); }}
                  selected={this.findSelectedUnit(0)}
                  textColor={Colors.grey}
                  style={styles.checkable}
                  checkBoxStyle={styles.checkableCheckBox}
                >
                  <Label font12>{measureUnitModalDataArr[0].titl}</Label>
                </Checkable>
              </View>
              <View>
                <Checkable
                  onPress={() => { this.selectUnit(1); }}
                  selected={this.findSelectedUnit(1)}
                  textColor={Colors.grey}
                  style={styles.checkable}
                  checkBoxStyle={styles.checkableCheckBox}
                >
                  <Label font12>{measureUnitModalDataArr[1].titl}</Label>
                </Checkable>
              </View>
              <View>
                <Checkable
                  onPress={() => { this.selectUnit(2); }}
                  selected={this.findSelectedUnit(2)}
                  textColor={Colors.grey}
                  style={styles.checkable}
                  checkBoxStyle={styles.checkableCheckBox}
                >
                  <Label font12>{measureUnitModalDataArr[2].titl}</Label>
                </Checkable>
              </View>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
        {showPumpSessionGoalModal && (
          <InfoModal
            title="SET DAILY PUMPED AMOUNT"
            subtitle="This is your daily goal of what you aim to pump"
            onPressClose={() => this.setState({ showPumpSessionGoalModal: false })}
          />
        )}
        {showMinStashGoalModal && (
          <InfoModal
            title="SET MINIMUM GOAL FOR STASHED MILK"
            subtitle="This is the minimum amount of milk you aim to have stashed/stored"
            onPressClose={() => this.setState({ showMinStashGoalModal: false })}
          />
        )}
      </Container>
    );
  }
}

const styles = StyleSheet.create({
  modalView: {
    backgroundColor: Colors.white,
    height: "100%"
  },
  subtitle: {
    marginTop: 25,
    flexDirection: "row",
    justifyContent: "space-between"
  },
  unitText: {
    paddingHorizontal: 25,
    marginTop: 20
  },
  unitRowView: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 25,
    marginTop: 10
  },
  checkable: {},
  checkableCheckBox: {
    borderRadius: 50,
    marginRight: 10
  },
  milestones: {
    paddingHorizontal: 25
  },
  texts: {
    letterSpacing: 1.0,
    backgroundColor: "transparent"
  },
  cancel: {
    fontSize: 12,
    fontWeight: "bold",
    lineHeight: 16.0,
    color: Colors.warmGrey,
    marginTop: 31
  },
  mainTitle: {
    fontSize: 50,
    fontWeight: "300",
    lineHeight: 60.0,
    color: Colors.greyishBrown,
    marginLeft: 18
  },
  infoIcon: {
    color: Colors.lightGrey2,
    fontSize: 22,
  }
});

ModalMilestoneScreen.propTypes = {
  navigation: PropTypes.object.isRequired,
  list: PropTypes.object,
  save: PropTypes.func.isRequired,
  measureUnit: PropTypes.string,
  setMeasureUnit: PropTypes.func
};

const mapStateToProps = ({ goals, auth }) => {
  const { list } = goals;
  const measureUnit = auth.profile.measureUnit || "mililitre";

  return { list, measureUnit };
};

const mapDispatchToProps = {
  save: saveGoals,
  setMeasureUnit
};

export default connect(mapStateToProps, mapDispatchToProps)(ModalMilestoneScreen);
