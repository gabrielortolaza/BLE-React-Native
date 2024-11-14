import React, { useCallback, useState } from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import PropTypes from "prop-types";
import ViewMoreText from "react-native-view-more-text";
import { StarRatingDisplay } from "react-native-star-rating-widget";
import firebase from "@react-native-firebase/app";
import { useDispatch } from "react-redux";

import { Label } from "../Shared";
import Icon from "../Shared/Icon";
import { Colors } from "../../Themes";
import SelectionModal from "../Shared/SelectionModal";
import ReviewModal from "../Shared/ReviewModal";
import { addMessage } from "../../Actions";
import * as M from "../../Config/messages";
import ApiRatings from "../../Http/Ratings";

const EDIT_KEY = 1;
const DELETE_KEY = 2;

const reviewModalDataArr = [
  {
    titl: "Edit", icon: "edit", iconColor: Colors.blue, key: EDIT_KEY
  },
  {
    titl: "Delete", icon: "delete", iconColor: Colors.coral, key: DELETE_KEY
  }
];

export default function ReviewItem({ item, onReviewUpdated }) {
  const [modalVisible, setModalVisible] = useState(false);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const dispatch = useDispatch();
  const {
    _id, programId, programName, score, reviewTime, review
  } = item;

  const renderViewMore = useCallback((onPress) => {
    return (
      <Label blue onPress={onPress}>View All</Label>
    );
  }, []);

  const renderViewLess = useCallback((onPress) => {
    return (
      <Label blue onPress={onPress}>View Less</Label>
    );
  }, []);

  const onModalSelected = (selection) => {
    setModalVisible(false);

    if (selection === EDIT_KEY) {
      setTimeout(() => {
        setReviewModalVisible(true);
      }, 500);
    } else if (selection === DELETE_KEY) {
      deleteRating();
    }
  };

  const deleteRating = useCallback(() => {
    const { uid } = firebase.auth().currentUser;
    const params = {
      ratingId: _id,
      userUUID: uid,
    };

    ApiRatings.deleteRating(params)
      .then(() => onReviewUpdated())
      .catch(() => dispatch(addMessage(M.SOMETHING_WRONG)));
  }, [_id, dispatch, onReviewUpdated]);

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.menuPosition} onPress={() => setModalVisible(true)}>
        <Icon
          type="SimpleLineIcons"
          name="options-vertical"
          style={styles.menuIcon}
        />
      </TouchableOpacity>
      <Label weightSemiBold font14 style={styles.programNameLabel}>{programName}</Label>
      <View style={styles.ratingWrapper}>
        <StarRatingDisplay
          rating={score}
          starSize={18}
          color={Colors.gold}
        />
        <Label style={styles.timeLabel}>{reviewTime}</Label>
      </View>
      <ViewMoreText
        numberOfLines={3}
        renderViewMore={renderViewMore}
        renderViewLess={renderViewLess}
      >
        <Label>{review}</Label>
      </ViewMoreText>
      {modalVisible && (
        <SelectionModal
          isVisible={modalVisible}
          title="More"
          onPressConfirm={onModalSelected}
          dataArr={reviewModalDataArr}
        />
      )}
      {reviewModalVisible && (
        <ReviewModal
          programId={programId}
          isVisible={reviewModalVisible}
          existingReview={{ score, review }}
          onPressConfirm={() => {
            setReviewModalVisible(false);
            onReviewUpdated();
          }}
          onPressDeny={() => setReviewModalVisible(false)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
  },
  menuPosition: {
    padding: 8,
    zIndex: 1,
    position: "absolute",
    top: 0,
    right: 0,
  },
  menuIcon: {
    fontSize: 18,
    color: Colors.grey,
  },
  programNameLabel: {
    marginRight: 24,
  },
  timeLabel: {
    marginLeft: 8,
  },
  ratingWrapper: {
    alignItems: "center",
    flexDirection: "row",
    paddingVertical: 4,
  },
});

ReviewItem.propTypes = {
  item: PropTypes.object,
  onReviewUpdated: PropTypes.func,
};
