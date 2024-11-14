import React from "react";
import {
  View, StyleSheet, TouchableOpacity
} from "react-native";
import PropTypes from "prop-types";
import firebase from "@react-native-firebase/app";
import { StarRatingDisplay as SRD } from "react-native-star-rating-widget";

import { Label } from ".";
import { Colors } from "../../Themes";

const StarRatingDisplay = (props) => {
  const {
    program, showAverageRating, showReviewBtn,
    hasLeftARating, createReview, editReview,
    size, onPress,
  } = props;

  if (!program) return <View />;

  const { totalRating, averageRating } = program;

  const { uid } = firebase.auth().currentUser;
  const userHasDownloadedProgram = program.downloadedBy?.indexOf(uid) > -1;

  const renderReviewButton = () => (
    <View>
      {showReviewBtn && userHasDownloadedProgram && (
        <TouchableOpacity
          onPress={hasLeftARating ? editReview : createReview}
        >
          <Label
            maxFontSizeMultiplier={1}
            font12
            blue
            style={styles.ratingBtnText}
          >
            {`${hasLeftARating ? "EDIT YOUR" : "WRITE A"} REVIEW`}
          </Label>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View>
      {totalRating > 0 && (
        <View style={styles.ratingView}>
          <TouchableOpacity
            disabled={!onPress}
            style={styles.ratingView}
            onPress={onPress && onPress}
          >
            {showAverageRating && (
              <Label
                maxFontSizeMultiplier={1}
                font12
                weightSemiBold
                style={styles.averageRatingText}
              >
                {averageRating.toFixed(1)}
              </Label>
            )}
            <SRD
              rating={(Math.round(averageRating * 2) / 2).toFixed(1)}
              starSize={size ?? 14}
              color={Colors.gold}
              style={{ marginBottom: 3 }}
            />
            <Label
              maxFontSizeMultiplier={1}
              font12
              style={styles.ratingText}
            >
              {`(${totalRating})`}
            </Label>
          </TouchableOpacity>
          {renderReviewButton()}
        </View>
      )}
      {totalRating === 0 && (
        <View style={styles.noRatingView}>
          <Label
            maxFontSizeMultiplier={1.2}
            font12
            grey
            weightLight
            style={styles.noRatingText}
          >
            No rating yet
          </Label>
          {renderReviewButton()}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  ratingView: {
    flexDirection: "row",
    alignItems: "center"
  },
  ratingText: {
    marginLeft: 3
  },
  noRatingView: {
    flexDirection: "row",
    alignItems: "center"
  },
  noRatingText: {
    marginBottom: 3
  },
  averageRatingText: {
    marginRight: 5
  },
  ratingBtnText: {
    marginLeft: 10
  }
});

StarRatingDisplay.propTypes = {
  program: PropTypes.object.isRequired,
  showAverageRating: PropTypes.bool,
  showReviewBtn: PropTypes.bool,
  hasLeftARating: PropTypes.bool,
  size: PropTypes.number,
  onPress: PropTypes.func,
  createReview: PropTypes.func,
  editReview: PropTypes.func
};

export default StarRatingDisplay;
