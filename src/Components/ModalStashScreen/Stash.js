import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import {
  Platform, StyleSheet, TouchableOpacity, View
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { useSelector, useDispatch } from "react-redux";
import firebase from "@react-native-firebase/app";
import moment from "moment";

import { Colors, Styles } from "../../Themes";
import {
  Label, ButtonRound, ConfirmationToast,
} from "../Shared";
import Container from "../Shared/Container";
import Radio from "../Shared/Radio";
import Header from "../Shared/AppHeader/Header";
import MultilineInput from "../Shared/MultilineInput";
import RowDateTime from "../ModalSessionScreen/RowDateTime";
import RowVolumeNotes from "../ModalSessionScreen/RowVolumeNotes";
import { fluidFrom, fluidTo } from "../../Services/Convert";
import { saveStash, deleteStashRecord } from "../../Actions";
import { STASH_ACTION_ADD, STASH_ACTION_EDIT, STASH_ACTION_REMOVE } from "../TabLogsScreen";
import Icon from "../Shared/Icon";
import * as M from "../../Config/messages";
import {
  ADD_STASH, DELETE_STASH, REMOVE_STASH,
  STASH_SESSION
} from "../../Config/Analytics";
import { SESSION_TYPE_ADDED, SESSION_TYPE_REMOVED } from "../../Config/constants";

const TITLE = {
  [STASH_ACTION_ADD]: "Add to Stash",
  [STASH_ACTION_EDIT]: "Edit Stash",
  [STASH_ACTION_REMOVE]: "Remove from Stash",
};

const Stash = (props) => {
  const [focus, setFocus] = useState("");
  const [volume, setVolume] = useState(0);
  const [notes, setNotes] = useState("");
  const [startedAt, setStartedAt] = useState(Date.now());
  const [deleteStash, setDeleteStash] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [plusAction, setPlusAction] = useState(true);
  const [originalData, setOriginalData] = useState({});
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const measureUnit = useSelector((state) => state.auth.profile.measureUnit);

  const { route } = props;
  const { action, stashRecord } = route.params;

  useEffect(() => {
    if (stashRecord) {
      const {
        notes, sessionType, volume, startedAt
      } = stashRecord;
      setNotes(notes);
      setPlusAction(sessionType === SESSION_TYPE_ADDED);
      setStartedAt(startedAt);

      const volumeConverted = fluidTo({
        measureUnit,
        value: volume || 0
      });
      setVolume(`${volumeConverted}`);

      setOriginalData({
        notes,
        startedAt,
        volume: `${volumeConverted}`,
        plusAction: sessionType === SESSION_TYPE_ADDED,
      });
    } else {
      setOriginalData({
        notes,
        startedAt,
        volume,
        plusAction,
      });
    }
  }, []);

  const onChangeVolume = (focus, value) => {
    setVolume(value);
  };

  const onChangeTime = (field, value) => {
    setStartedAt(moment(value).format("x") * 1);
  };

  const onSave = () => {
    let sessionType;
    let logType;
    if (action === STASH_ACTION_ADD) {
      sessionType = SESSION_TYPE_ADDED;
      logType = ADD_STASH;
    } else if (action === STASH_ACTION_REMOVE) {
      sessionType = SESSION_TYPE_REMOVED;
      logType = REMOVE_STASH;
    } else if (action === STASH_ACTION_EDIT) {
      if (plusAction) {
        sessionType = SESSION_TYPE_ADDED;
        logType = ADD_STASH;
      } else {
        sessionType = SESSION_TYPE_REMOVED;
        logType = REMOVE_STASH;
      }
    }

    const volumeConverted = fluidFrom({
      measureUnit,
      value: volume,
    });

    const { uid } = firebase.auth().currentUser;
    let stashData;

    if (action === STASH_ACTION_EDIT) {
      stashData = {
        ...stashRecord,
        volume: volumeConverted,
        notes,
        startedAt,
        sessionType,
      };
    } else {
      stashData = {
        key: `${startedAt}_stash`,
        type: "stash",
        volume: volumeConverted,
        notes,
        startedAt,
        sessionType,
      };
    }
    dispatch(saveStash(uid, stashData));
    firebase.analytics().logEvent(STASH_SESSION, {
      type: logType,
      newSession: action !== STASH_ACTION_EDIT
    });
    navigation.goBack();
  };

  const onDelete = useCallback(() => {
    setDeleteStash(false);
    const { uid } = firebase.auth().currentUser;
    dispatch(deleteStashRecord(uid, stashRecord.key));
    firebase.analytics().logEvent(DELETE_STASH);
    navigation.goBack();
  }, [dispatch, navigation, stashRecord]);

  const goBack = () => {
    const newData = {
      notes,
      startedAt,
      volume,
      plusAction,
    };

    if (JSON.stringify(newData) !== JSON.stringify(originalData)) {
      setShowConfirm(true);
    } else {
      navigation.goBack();
    }
  };

  return (
    <Container noScroll edges={["top"]}>
      <Header
        leftActionText={TITLE[action]}
        leftActionEvent={goBack}
        showHeaderSeparator
      />
      <KeyboardAwareScrollView style={styles.container}>
        <Label font12 weightBold mt8 mb10>
          TIME
        </Label>
        <RowDateTime
          finishedAt={Date.now()}
          startedAt={startedAt || Date.now()}
          focus={focus}
          onChange={onChangeTime}
          onFocus={(focusId) => setFocus(focus === focusId ? "" : focusId)}
          hideDuration
        />
        <Label font12 weightBold mt8 mb10>
          AMOUNT
        </Label>
        {action === STASH_ACTION_EDIT && (
          <View style={styles.radioButtons}>
            <View style={styles.radioWrapper}>
              <Radio isSelected={plusAction} label="+ PLUS" onPress={() => setPlusAction(true)} />
            </View>
            <View style={styles.radioWrapper}>
              <Radio isSelected={!plusAction} label="- MINUS" onPress={() => setPlusAction(false)} />
            </View>
          </View>
        )}
        <RowVolumeNotes
          focus={focus}
          focusRef="volume"
          measureUnit={measureUnit}
          onChange={onChangeVolume}
          onFocus={(focusId) => setFocus(focus === focusId ? "" : focusId)}
          volume={volume}
          labelStyle={Styles.fullWidth}
        />
        <View style={styles.noteView}>
          <Label font12 weightBold mb8>
            NOTES
          </Label>
          <MultilineInput
            onChangeText={(value) => setNotes(value)}
            returnKeyType="next"
            value={notes}
            style={styles.note}
            placeholder={`Example: ${action === STASH_ACTION_REMOVE ? "remove" : "add"} evening stash`}
            error={notes?.length > 500 ? "Maximum notes 500 characters" : ""}
          />
        </View>
        {action === STASH_ACTION_EDIT && (
          <TouchableOpacity
            style={styles.deleteBtn}
            onPress={() => setDeleteStash(true)}
          >
            <Icon type="MaterialIcons" name="delete" style={styles.deleteIcon} />
            <Label font14 style={styles.deleteLabel}>
              Delete
            </Label>
          </TouchableOpacity>
        )}
        <View style={styles.buttons}>
          <ButtonRound
            white
            bordered
            onPress={goBack}
            style={styles.cancelBtn}
          >
            <Label lightGrey2 weightBold>
              Cancel
            </Label>
          </ButtonRound>
          <ButtonRound
            blue
            disabled={!volume || volume === "0"}
            onPress={onSave}
            style={styles.cancelBtn}
          >
            <Label white weightBold>
              Save
            </Label>
          </ButtonRound>
        </View>
      </KeyboardAwareScrollView>
      {deleteStash && (
        <ConfirmationToast
          onPressConfirm={onDelete}
          onPressDeny={() => setDeleteStash(false)}
          subtitle={M.CONFIRM_REMOVE_STASH}
          title={M.REMOVE_STASH}
        />
      )}
      {showConfirm && (
        <ConfirmationToast
          title="Are you sure?"
          subtitle={M.CONFIRM_SAVE_CHANGES}
          option1="Cancel"
          option2="Yes, I’m sure"
          onPressConfirm={() => {
            setShowConfirm(false);
            navigation.goBack();
          }}
          onPressDeny={() => setShowConfirm(false)}
        />
      )}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 30,
    paddingTop: 15,
    backgroundColor: Colors.background
  },
  noteView: {
    marginTop: 16,
  },
  note: {
    marginTop: 0,
  },
  radioButtons: {
    flexDirection: "row",
    marginBottom: 4,
  },
  radioWrapper: {
    width: "50%",
  },
  buttons: {
    flexDirection: "row",
    marginTop: 30,
    justifyContent: "space-between",
    width: "100%"
  },
  cancelBtn: {
    width: "47%",
  },
  deleteBtn: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 15,
  },
  deleteIcon: {
    fontSize: 16,
    color: Colors.coral,
    marginRight: 8,
  },
  deleteLabel: {
    paddingTop: Platform.OS === "android" ? 3 : 0,
    color: Colors.coral,
  },
});

Stash.propTypes = {
  route: PropTypes.object,
};

export default Stash;
