import React, { useCallback, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import { FlatList, StyleSheet } from "react-native";
import firebase from "@react-native-firebase/app";
import moment from "moment";
import { useDispatch } from "react-redux";

import Header from "../Shared/AppHeader/Header";
import Container from "../Shared/Container";
import ReviewItem from "./ReviewItem";
import { addMessage } from "../../Actions";
import * as M from "../../Config/messages";

import ApiRatings from "../../Http/Ratings";

function Review() {
  const navigation = useNavigation();
  const [reviews, setReviews] = useState([]);
  const dispatch = useDispatch();

  useEffect(() => {
    getRating();
  }, []);

  const getRating = useCallback(() => {
    const { uid } = firebase.auth().currentUser;

    ApiRatings.retrieveRatings(`?userUUID=${uid}`).then(({ results }) => {
      if (results?.length < 1) {
        setReviews([]);
        dispatch(addMessage(M.NO_REVIEW));
      } else {
        setReviews(results.map((item) => {
          const { createdAt } = item;
          const reviewTime = moment(new Date(createdAt)).fromNow();
          return {
            ...item,
            reviewTime,
          };
        }));
      }
    }).catch(() => dispatch(addMessage(M.SOMETHING_WRONG)));
  }, [dispatch]);

  return (
    <Container noScroll edges={["top"]}>
      <Header
        leftActionText="My Reviews"
        leftActionEvent={navigation.goBack}
        showHeaderSeparator
      />
      <FlatList
        data={reviews}
        renderItem={({ item }) => (
          <ReviewItem
            item={item}
            onReviewUpdated={getRating}
          />
        )}
        keyExtractor={(item) => item._id}
        style={styles.list}
      />
    </Container>
  );
}

const styles = StyleSheet.create({
  list: {
    paddingVertical: 16,
    paddingHorizontal: 22,
  },
});

export default Review;
