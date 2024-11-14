import React, { useCallback, useEffect, useState } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  FlatList, Image, StyleSheet, View
} from "react-native";
import PropTypes from "prop-types";
import firebase from "@react-native-firebase/app";
import moment from "moment";
import { useDispatch } from "react-redux";

import Header from "../Shared/AppHeader/Header";
import Container from "../Shared/Container";
import ReviewItem from "./ReviewItem";
import { Colors, Images } from "../../Themes";
import { ButtonRound, Label } from "../Shared";
import ReviewModal from "../Shared/ReviewModal";
import { isEmpty } from "../../Services/SharedFunctions";
import ApiRatings from "../../Http/Ratings";
import ApiProgram from "../../Http/Program";
import { addMessage } from "../../Actions";
import * as M from "../../Config/messages";

function ReviewDetail(props) {
  const navigation = useNavigation();
  const [programReviews, setProgramReviews] = useState([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [myReview, setMyReview] = useState({});
  const [totalRatings, setTotalRatings] = useState(0);
  const [totalReviews, setTotalReviews] = useState(0);
  const [newAverageRating, setNewAverageRating] = useState(null);
  const dispatch = useDispatch();

  const { route } = props;
  const { program } = route.params;
  const { id, averageRating } = program;
  const { uid } = firebase.auth().currentUser;
  const userHasDownloadedProgram = program.downloadedBy?.indexOf(uid) > -1;

  useEffect(() => {
    getRating();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const getRating = useCallback(() => {
    ApiRatings.retrieveRatings(`?programId=${id}`).then(({ results, totalRatings, totalReviews }) => {
      setTotalRatings(totalRatings);
      setTotalReviews(totalReviews);
      setProgramReviews(results.map((item) => {
        if (item.userUUID === uid) {
          setMyReview(item);
        }
        const { createdAt } = item;
        const reviewTime = moment(new Date(createdAt)).fromNow();
        return {
          ...item,
          reviewTime,
        };
      }));
    }).catch(() => dispatch(addMessage(M.SOMETHING_WRONG)));
  }, [dispatch, id, uid]);

  const getProgram = useCallback(() => {
    ApiProgram.filterPrograms(`programID=${id}`).then(({ results }) => {
      setNewAverageRating(results?.[0]?.averageRating);
    }).catch(() => dispatch(addMessage(M.SOMETHING_WRONG)));
  }, [dispatch, id]);

  return (
    <Container noScroll edges={["top"]}>
      <Header
        leftActionText="Reviews"
        leftActionEvent={navigation.goBack}
      />
      <View style={styles.averageRatingView}>
        <Image source={Images.star} style={styles.starImage} />
        <View style={styles.averageRating}>
          <Label weightBold font23>
            {Math.round((newAverageRating ?? averageRating) * 10) / 10}
          </Label>
          <Label> / 5.0</Label>
        </View>
        <View>
          {userHasDownloadedProgram && (
            <ButtonRound
              style={styles.reviewBtn}
              onPress={() => setReviewModalVisible(true)}
            >
              <Label weightSemiBold blue font16>{`${!isEmpty(myReview) ? "EDIT YOUR" : "WRITE A"} REVIEW`}</Label>
            </ButtonRound>
          )}
          <View style={styles.totalRatingView}>
            <Label>{`${totalRatings} Rating${totalRatings > 1 ? "s" : ""}`}</Label>
            <Label>{` • ${totalReviews} Review${totalReviews > 1 ? "s" : ""}`}</Label>
          </View>
        </View>
      </View>
      <FlatList
        data={programReviews}
        renderItem={({ item }) => (
          <ReviewItem
            item={item}
          />
        )}
        keyExtractor={(item) => item._id}
        style={styles.list}
      />
      {reviewModalVisible && (
        <ReviewModal
          programId={id}
          isVisible={reviewModalVisible}
          existingReview={{ score: myReview?.score, review: myReview?.review }}
          onPressConfirm={() => {
            getRating();
            getProgram();
            setReviewModalVisible(false);
          }}
          onPressDeny={() => setReviewModalVisible(false)}
        />
      )}
    </Container>
  );
}

const styles = StyleSheet.create({
  averageRatingView: {
    backgroundColor: Colors.backgroundGrey,
    paddingHorizontal: 20,
    paddingVertical: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  starImage: {
    width: 22,
    height: 22,
    marginRight: 8,
  },
  averageRating: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  totalRatingView: {
    flexDirection: "row",
  },
  reviewBtn: {
    paddingHorizontal: 0,
  },
  list: {
    paddingVertical: 16,
    paddingHorizontal: 22,
  },
});

ReviewDetail.propTypes = {
  route: PropTypes.object,
};

export default ReviewDetail;
