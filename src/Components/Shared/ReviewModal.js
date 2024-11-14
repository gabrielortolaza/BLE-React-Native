import React, { useState } from "react";
import {
  StyleSheet, Keyboard, TouchableWithoutFeedback,
  View, KeyboardAvoidingView, Platform,
} from "react-native";
import Modal from "react-native-modal";
import PropTypes from "prop-types";
import StarRating from "react-native-star-rating-widget";
import firebase from "@react-native-firebase/app";
import { useSelector, useDispatch } from "react-redux";

import { ButtonRound, Label } from ".";
import MultilineInput from "./MultilineInput";
import { Colors, Styles } from "../../Themes";
import { addMessage } from "../../Actions";
import * as M from "../../Config/messages";
import ApiRatings from "../../Http/Ratings";

function ReviewModal(props) {
  const {
    isVisible, onPressConfirm, onPressDeny,
    programId, existingReview,
  } = props;
  const displayName = useSelector((state) => state.auth.profile.displayName);
  const [reviewText, setReviewText] = useState(existingReview?.review || "");
  const [rating, setRating] = useState(existingReview?.score || 0);
  const dispatch = useDispatch();

  const submitReview = () => {
    const { uid } = firebase.auth().currentUser;
    const params = {
      programId,
      userUUID: uid,
      reviewerName: displayName,
      score: rating,
      review: reviewText,
    };

    ApiRatings.createOrUpdateRating(params)
      .then(() => {
        dispatch(addMessage(M.THANK_YOU_FEEDBACK));
        onPressConfirm();
      })
      .catch((err) => {
        console.log(err);

        if (err.message === M.EMPTY_NAME_PL_RATINGS) {
          dispatch(addMessage(err.message));
        } else {
          dispatch(addMessage(M.SOMETHING_WRONG));
        }

        onPressDeny();
      });
  };

  return (
    <Modal
      isVisible={isVisible}
      style={styles.bottomHalfModal}
      onBackdropPress={() => onPressDeny()}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "position" : null}
      >
        <TouchableWithoutFeedback
          onPress={Keyboard.dismiss}
        >
          <View style={styles.container}>
            <Label weightSemiBold font16>How was the program?</Label>
            <Label weightSemiBold font16 mb16>(1 is disappointing, 5 is Awesome)</Label>
            <Label font14 mb16>Please rate this program for fellow pumpers!</Label>
            <StarRating
              rating={rating}
              starSize={40}
              enableHalfStar={false}
              color={Colors.gold}
              onChange={setRating}
            />
            <MultilineInput
              onChangeText={setReviewText}
              style={{ marginBottom: 40 }}
              value={reviewText}
              error={reviewText?.length > 500 ? "Maximum review 500 characters" : ""}
            />
            <ButtonRound
              blue
              style={Styles.fullWidth}
              disabled={rating === 0}
              onPress={submitReview}
            >
              <Label white>Submit Review</Label>
            </ButtonRound>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  bottomHalfModal: {
    justifyContent: "flex-end",
    margin: 0,
  },
  container: {
    minHeight: 200,
    backgroundColor: "white",
    borderRadius: 20,
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 25,
  },
});

ReviewModal.propTypes = {
  isVisible: PropTypes.bool,
  onPressConfirm: PropTypes.func,
  onPressDeny: PropTypes.func,
  programId: PropTypes.string,
  existingReview: PropTypes.object,
};

export default ReviewModal;
