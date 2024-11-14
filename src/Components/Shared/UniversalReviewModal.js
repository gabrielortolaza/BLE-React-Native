import React from "react";
import { View } from "react-native";
import { useSelector, useDispatch } from "react-redux";
import { showReviewModal } from "../../Actions";

import ReviewModal from "./ReviewModal";

const UniversalReviewModal = () => {
  const dispatch = useDispatch();
  const currentProgram = useSelector((state) => state.pump.currentProgram);
  const reviewModalVisible = useSelector((state) => state.status.reviewModalVisible);

  return (
    <View>
      {reviewModalVisible && (
        <ReviewModal
          programId={currentProgram?.programLibraryId}
          isVisible={reviewModalVisible}
          existingReview={{ score: null, review: null }}
          onPressConfirm={() => dispatch(showReviewModal(false))}
          onPressDeny={() => dispatch(showReviewModal(false))}
        />
      )}
    </View>
  );
};

export default UniversalReviewModal;
