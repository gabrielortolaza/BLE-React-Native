import React, { PureComponent } from "react";
import PropTypes from "prop-types";
import {
  TouchableOpacity, View, Image,
  TextInput, Platform
} from "react-native";

import { unit, fluidFrom, fluidTo } from "../../Services/Convert";
import StyleSheet from "../../Proportional";
import { Fonts, Colors } from "../../Themes";
import { Label as Text } from "../Shared";
import Icon from "../Shared/Icon";

export default class Card extends PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      editValue: "",
      changed: false
    };
  }

  onChange = (val) => {
    const { value } = this.props;

    this.setState({
      editValue: val,
      changed: val !== value // Will always be true?
    });
  }

  removeGoal = () => {
    const { id, save } = this.props;

    save(id, 0);
  }

  onSave = () => {
    const { id, save, measureUnit } = this.props;
    const { changed, editValue } = this.state;

    this.textInput.blur();
    if (changed) {
      const editConvertedValue = fluidFrom({ measureUnit, value: editValue });

      save(id, Number(editConvertedValue) || 0);
      this.setState({ editValue: "", changed: false });
    }
  }

  render() {
    const { editValue, changed } = this.state;
    const {
      image, isEditing, value,
      measureUnit, onInputBlur, onInputFocus
    } = this.props;

    const goalValue = (isEditing || changed)
      ? (editValue || 0)
      : fluidTo(
        {
          measureUnit,
          value
        }
      );

    return (
      <View
        style={styles.milestones}
      >
        <Image style={styles.milestoneImage} source={image} />
        <View style={styles.overlay} />
        {
          value.length > 0 && (
            <TouchableOpacity
              style={styles.removeGoalView}
              onPress={this.removeGoal}
            >
              <Text white font11 style={styles.removeGoal}>
                Remove goal
              </Text>
            </TouchableOpacity>
          )
        }
        <View style={styles.infoView}>
          <View style={styles.inputView}>
            <DynamicInput
              measureUnit={measureUnit}
              onBlur={onInputBlur}
              onChangeText={this.onChange}
              onFocus={onInputFocus}
              onRef={(ref) => { this.textInput = ref; }}
              onSubmit={this.onSave}
              placeholder={value}
              value={
                typeof goalValue === "string" ? goalValue : `${goalValue}`
              }
            />
            {(!!editValue || !!value) && (
              <View style={styles.buttonView}>
                <Button
                  small
                  isEditing={isEditing || !!editValue}
                  blurAndSave={this.onSave}
                  focusAndEdit={() => this.textInput.focus()}
                />
              </View>
            )}
          </View>
          <View>
            <Text style={[styles.texts, styles.milestonesPeriod]}>
              per day
            </Text>
          </View>
        </View>
      </View>
    );
  }
}

const DynamicInput = (
  {
    onRef, onChangeText, onFocus,
    onBlur, onSubmit, value,
    placeholder, measureUnit
  }
) => (
  <View style={styles.milestoneInputView}>
    <View>
      <TextInput
        ref={onRef}
        onChangeText={onChangeText}
        onFocus={onFocus}
        onBlur={onBlur}
        onSubmitEditing={onSubmit}
        underlineColorAndroid="transparent"
        value={value}
        placeholder={`${placeholder}`}
        placeholderTextColor={Colors.white20p}
        style={styles.milestoneInput}
        selectionColor={Colors.white}
        returnKeyType="done"
        keyboardType="numeric"
      />
      <Text style={styles.milestoneInputHelper}>{value}</Text>
    </View>
    <Text style={[styles.texts, styles.milestonesMeasure]}>{unit(measureUnit)}</Text>
  </View>
);

const Button = ({ isEditing, blurAndSave, focusAndEdit }) => (
  <TouchableOpacity
    white
    activeOpacity={0.9}
    style={[styles.editButton, isEditing && styles.saveButton]}
    onPress={isEditing ? blurAndSave : focusAndEdit}
  >
    {!isEditing && (
      <Icon type="FontAwesome" name="pencil" style={styles.editIcon} />
    )}
    {isEditing && (
      <Text style={[styles.texts, styles.saveLabel]}>Save</Text>
    )}
  </TouchableOpacity>
);

const styles = StyleSheet.create({
  texts: {
    backgroundColor: "transparent",
  },
  inputView: {
    flexDirection: "row"
  },
  infoView: {
    position: "absolute",
    bottom: 0,
    left: 0,
    paddingLeft: 10,
    paddingBottom: 10
  },
  removeGoalView: {
    position: "absolute",
    top: 0,
    right: 0,
    marginTop: 10,
    marginRight: 10
  },
  removeGoal: {
    textDecorationLine: "underline"
  },
  buttonView: {
    marginLeft: 10
  },
  editIcon: {
    color: Colors.white,
    fontSize: 20,
    marginTop: 5,
    marginLeft: 7
  },
  milestones: {
    borderRadius: 4,
    width: "100%",
    height: 190,
    marginTop: 17
  },
  milestoneInputView: {
    flexDirection: "row",
    alignItems: "center",
    // width: 200
  },
  milestoneInput: {
    fontSize: 40,
    lineHeight: Platform.OS === "android" ? 60 : undefined,
    height: 55,
    ...Fonts.SemiBold,
    color: Colors.white,
    textAlign: "left",
    ...StyleSheet.absoluteFillObject,
    bottom: null,
    zIndex: 10,
    minWidth: 65,
    backgroundColor: "transparent",
    padding: 0
  },
  milestoneInputHelper: {
    fontSize: 40,
    ...Fonts.SemiBold,
    color: Colors.black,
    height: 50,
    minWidth: 65,
    backgroundColor: "transparent",
    opacity: 0,
    padding: 0
  },
  milestonesMeasure: {
    fontSize: 30,
    height: 40,
    color: Colors.white,
    fontWeight: "bold",
    paddingLeft: 0
  },
  milestonesPeriod: {
    color: Colors.white,
    fontWeight: "bold"
  },
  milestoneImage: {
    width: "100%",
    height: "100%",
    borderRadius: 16,
    top: 0,
    position: "absolute",
    right: 0,
    bottom: 0
  },
  overlay: {
    borderRadius: 16,
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.1)",
  },
  button: {
    marginVertical: 9
  },
  editButton: {
    width: 70,
    height: 44,
    justifyContent: "center"
  },
  saveButton: {
    borderRadius: 30,
    backgroundColor: Colors.white,
    alignItems: "center"
  },
  saveLabel: {
    color: Colors.grey
  }
});

Card.propTypes = {
  id: PropTypes.string.isRequired,
  isEditing: PropTypes.bool,
  image: PropTypes.number.isRequired,
  onInputFocus: PropTypes.func.isRequired,
  onInputBlur: PropTypes.func.isRequired,
  save: PropTypes.func,
  value: PropTypes.string,
  measureUnit: PropTypes.string
};

DynamicInput.propTypes = {
  onRef: PropTypes.func.isRequired,
  onChangeText: PropTypes.func.isRequired,
  onFocus: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  value: PropTypes.string,
  placeholder: PropTypes.string,
  measureUnit: PropTypes.string
};

Button.propTypes = {
  isEditing: PropTypes.bool,
  blurAndSave: PropTypes.func.isRequired,
  focusAndEdit: PropTypes.func.isRequired
};
