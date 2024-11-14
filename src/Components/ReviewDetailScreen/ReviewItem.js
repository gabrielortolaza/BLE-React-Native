import React, { useCallback, useMemo } from "react";
import { StyleSheet, View } from "react-native";
import PropTypes from "prop-types";
import ViewMoreText from "react-native-view-more-text";
import { StarRatingDisplay } from "react-native-star-rating-widget";

import { Label } from "../Shared";
import { Colors } from "../../Themes";

export default function ReviewItem({ item }) {
  const {
    reviewerName, score, reviewTime, review
  } = item;

  const avatarName = useMemo(
    () => reviewerName.split(" ").map((item) => item.charAt(0)?.toUpperCase()).join(""),
    [reviewerName]
  );

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

  return (
    <View style={styles.container}>
      <View style={styles.avatarContainer}>
        <Label lightGrey2 font14 weightBold>{avatarName}</Label>
      </View>
      <View>
        <Label weightSemiBold font14>{reviewerName?.trim()}</Label>
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
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 24,
    flexDirection: "row",
  },
  avatarContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: Colors.lightGrey,
    marginRight: 12,
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
};
