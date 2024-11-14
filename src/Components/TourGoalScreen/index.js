import React from "react";
import PropTypes from "prop-types";
import {
  View, ScrollView, Image,
  TouchableOpacity
} from "react-native";
import { connect } from "react-redux";
import { CommonActions } from "@react-navigation/native";

import StyleSheet from "../../Proportional";
import { fluidFrom } from "../../Services/Convert";
import { Colors, Images } from "../../Themes";
import {
  ButtonRound, Label as Text, Checkable,
  InputField
} from "../Shared";
import Icon from "../Shared/Icon";
import InfoModal from "../Shared/InfoModal";
import { findTitle } from "../../Services/SharedFunctions";
import { measureUnitModalDataArr } from "../../Config/constants";
import { setMeasureUnit } from "../../Actions/Auth";
import { saveGoals } from "../../Actions/Goals";

class TourGoalScreen extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      pumpSessionGoal: "",
      minStashAmount: "",
      selectedGoal: "",
      showPumpSessionGoalModal: false,
      showMinStashAmountModal: false,
    };
  }

  setMeasureMililitre = () => this.setMeasureUnit("mililitre");

  setMeasureUkOunce = () => this.setMeasureUnit("uk_ounce");

  setMeasureUsOunce = () => this.setMeasureUnit("us_ounce");

  // eslint-disable-next-line react/no-unused-state
  setMeasureUnit = (measureUnit) => this.setState({ measureUnit });

  setPumpSessionGoal = (pumpSessionGoal) => {
    if (!isNaN(pumpSessionGoal) && !isNaN(parseFloat(pumpSessionGoal))) {
      this.setState({ pumpSessionGoal: `${pumpSessionGoal}` });
    } else {
      this.setState({ pumpSessionGoal: "" });
    }
  };

  setMinStashAmount = (minStashAmount) => {
    if (!isNaN(minStashAmount) && !isNaN(parseFloat(minStashAmount))) {
      this.setState({ minStashAmount: `${minStashAmount}` });
    } else {
      this.setState({ minStashAmount: "" });
    }
  };

  findSelectedUnit = (index) => {
    const { measureUnit } = this.props;

    return (
      measureUnitModalDataArr[index].titl === findTitle(measureUnitModalDataArr, measureUnit)
    );
  };

  selectUnit = (index) => {
    const { setMeasureUnit } = this.props;

    setMeasureUnit(measureUnitModalDataArr[index].key);
  };

  onDone = () => {
    const {
      navigation, saveGoals, measureUnit
    } = this.props;
    const { pumpSessionGoal, minStashAmount } = this.state;

    const goalValue = fluidFrom({
      measureUnit,
      value: pumpSessionGoal
    });

    const minStashValue = fluidFrom({
      measureUnit,
      value: minStashAmount
    });

    saveGoals("goal_daily", goalValue);
    saveGoals("goal_stash", minStashValue);
    navigation.dispatch(
      CommonActions.reset({
        index: 1,
        routes: [
          { name: "Tabs" },
        ],
      })
    );
  };

  render() {
    const {
      pumpSessionGoal, minStashAmount, selectedGoal,
      showPumpSessionGoalModal, showMinStashAmountModal
    } = this.state;

    return (
      <View style={styles.container} forceInset={{ top: "never", bottom: "always" }}>
        <View style={styles.logoContainer}>
          <Image
            source={Images.goalSetupBg}
            style={styles.logo}
          />
        </View>
        <ScrollView contentContainerStyle={styles.infoContainer}>
          <View style={styles.goalSetupView}>
            <Text font30 weightBold>
              Goal setup
            </Text>
          </View>
          <Text>
            Please select one:
          </Text>
          <View style={styles.goalSelectView}>
            <TouchableOpacity
              onPress={() => {
                this.setState({ selectedGoal: "No", pumpSessionGoal: "", minStashAmount: "" });
              }}
              style={styles.goalSelect}
            >
              <Image
                source={Images.goalNo}
                style={styles.goalImg}
              />
              <View style={[styles.goalNo, selectedGoal === "No" && styles.selectedOne]}>
                <Text font12 weightSemiBold maxFontSizeMultiplier={1.1}>
                  I don't currently have a pumping goal
                </Text>
              </View>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => { this.setState({ selectedGoal: "Yes" }); }}
              style={styles.goalSelect}
            >
              <Image
                source={Images.goalYes}
                style={styles.goalImg}
              />
              <View style={[styles.goalNo, selectedGoal === "Yes" && styles.selectedOne]}>
                <Text font12 weightSemiBold maxFontSizeMultiplier={1.1}>
                  I'm targeting a specific pumping goal
                </Text>
              </View>
            </TouchableOpacity>
          </View>
          {
            selectedGoal === "No" && (
              <View style={styles.noGoalMessage}>
                <Text font14>
                  No problem! You can always set a goal later in your Settings
                </Text>
              </View>
            )
          }
          {
            selectedGoal === "Yes" && (
              <View>
                <View style={styles.unitText}>
                  <Text weightSemiBold>
                    CHOOSE UNIT PREFERENCE
                  </Text>
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
                      <Text font12>{measureUnitModalDataArr[0].titl}</Text>
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
                      <Text font12>{measureUnitModalDataArr[1].titl}</Text>
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
                      <Text font12>{measureUnitModalDataArr[2].titl}</Text>
                    </Checkable>
                  </View>
                </View>
                <View style={styles.infoLabelWrapper}>
                  <Text weightSemiBold>
                    SET DAILY PUMPED AMOUNT
                  </Text>
                  <TouchableOpacity
                    onPress={() => this.setState({ showPumpSessionGoalModal: true })}
                  >
                    <Icon name="information-circle-outline" type="Ionicons" style={styles.infoIcon} />
                  </TouchableOpacity>
                </View>
                <InputField
                  testID="TourAuth_Goal_DailyInput"
                  keyboardType="number-pad"
                  onChangeText={this.setPumpSessionGoal}
                  placeholder="Amount"
                  value={pumpSessionGoal}
                  style={styles.input}
                />
                <View style={styles.infoLabelWrapper}>
                  <Text weightSemiBold>
                    SET MINIMUM AMOUNT FOR STASHED MILK
                  </Text>
                  <TouchableOpacity
                    onPress={() => this.setState({ showMinStashAmountModal: true })}
                  >
                    <Icon name="information-circle-outline" type="Ionicons" style={styles.infoIcon} />
                  </TouchableOpacity>
                </View>
                <InputField
                  testID="TourAuth_Goal_StashInput"
                  keyboardType="number-pad"
                  onChangeText={this.setMinStashAmount}
                  placeholder="Amount"
                  value={minStashAmount}
                  style={styles.input}
                />
              </View>
            )
          }
          {
            selectedGoal !== "" && (
              <View style={styles.bottomOptions}>
                <ButtonRound
                  blue
                  testID="Tour_Goal_Done"
                  disabled={
                    selectedGoal === "Yes"
                    && (!pumpSessionGoal || !minStashAmount || pumpSessionGoal === "0" || minStashAmount === "0")
                  }
                  onPress={this.onDone}
                  style={styles.saveBtn}
                >
                  <Text white font18>{selectedGoal === "No" ? "Continue" : "Save"}</Text>
                </ButtonRound>
              </View>
            )
          }
        </ScrollView>
        {showPumpSessionGoalModal && (
          <InfoModal
            title="SET DAILY PUMPED AMOUNT"
            subtitle="This is your daily goal of what you aim to pump"
            onPressClose={() => this.setState({ showPumpSessionGoalModal: false })}
          />
        )}
        {showMinStashAmountModal && (
          <InfoModal
            title="SET MINIMUM AMOUNT FOR STASHED MILK"
            subtitle="This is the minimum amount of milk you aim to have stashed/stored"
            onPressClose={() => this.setState({ showMinStashAmountModal: false })}
          />
        )}
      </View>
    );
  }
}

const mapStateToProps = ({ auth }) => ({
  measureUnit: auth.profile.measureUnit
});

const mapDispatchToProps = {
  setMeasureUnit,
  saveGoals
};

export default connect(mapStateToProps, mapDispatchToProps)(TourGoalScreen);

const styles = StyleSheet.createProportional({
  container: {
    backgroundColor: Colors.white,
    height: "100%"
  },
  infoContainer: {
    justifyContent: "center",
    marginHorizontal: 25
  },
  goalSetupView: {
    alignItems: "center",
    marginBottom: 10
  },
  goalSelectView: {
    flexDirection: "row",
    justifyContent: "space-between"
  },
  goalSelect: {
    width: 150,
    height: 155,
  },
  goalImg: {
    width: "100%",
    height: "50%"
  },
  goalNo: {
    alignItems: "center",
    justifyContent: "center",
    textAlign: "center",
    height: "50%",
    padding: 10,
    backgroundColor: Colors.grey242
  },
  unitText: {
    marginTop: 10
  },
  unitRowView: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10
  },
  checkable: {},
  checkableCheckBox: {
    borderRadius: 50,
    marginRight: 10
  },
  logoContainer: {
    height: "33%",
    width: "100%"
  },
  logo: {
    height: "100%",
    width: "100%"
  },
  selectedOne: {
    backgroundColor: Colors.lightBlue
  },
  input: {
    marginBottom: 9,
    fontSize: 15
  },
  noGoalMessage: {
    marginVertical: 30
  },
  saveBtn: {
    width: "100%"
  },
  bottomOptions: {
    height: 46,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "center"
  },
  infoLabelWrapper: {
    marginTop: 10,
    flexDirection: "row",
    alignItems: "center"
  },
  infoIcon: {
    marginLeft: 6,
    color: Colors.lightGrey2,
    fontSize: 22,
  }
});

TourGoalScreen.propTypes = {
  navigation: PropTypes.object,
  measureUnit: PropTypes.string.isRequired,
  setMeasureUnit: PropTypes.func.isRequired,
  saveGoals: PropTypes.func.isRequired,
};
