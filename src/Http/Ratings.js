import { publicAxios } from "./Auth";
import {
  PLAPI_CREATE_RATING, PLAPI_DELETE_RATING, PLAPI_RETRIEVE_RATINGS
} from "../Config/api";
import { EMPTY_NAME_PL_RATINGS, SOMETHING_WRONG } from "../Config/messages";

class ApiRatings {
  createOrUpdateRating(params) {
    return new Promise((resolve, reject) => {
      if (params && !params.reviewerName) {
        reject(new Error(EMPTY_NAME_PL_RATINGS));
        return;
      }

      publicAxios.post(PLAPI_CREATE_RATING, params).then((data) => {
        resolve(data);
      }).catch((error) => {
        reject(error.response?.data?.message || SOMETHING_WRONG);
      });
    });
  }

  deleteRating(params) {
    return new Promise((resolve, reject) => {
      publicAxios.post(PLAPI_DELETE_RATING, params).then((data) => {
        resolve(data);
      }).catch((error) => {
        reject(error.response?.data?.message || SOMETHING_WRONG);
      });
    });
  }

  retrieveRatings(params) {
    return new Promise((resolve, reject) => {
      publicAxios.get(`${PLAPI_RETRIEVE_RATINGS}${params}`).then((data) => {
        // console.log("retrieve ratings:", data.data);
        const {
          results, previous, next, totalRatings, totalReviews
        } = data.data;
        resolve({
          results, next, previous, totalRatings, totalReviews
        });
      }).catch((error) => {
        reject(error.response?.data?.message || SOMETHING_WRONG);
      });
    });
  }
}

export default new ApiRatings();
