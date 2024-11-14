// PLAPI -> Program Library API
export const PLAPI_LOGIN = "/auth/login";
export const PLAPI_TEST_JWT = "/auth/testJwt";
export const PLAPI_GET_ALL_PROGRAMS = "/program/getAllPrograms";
export const PLAPI_UPLOAD_PROGRAM = "/program/uploadProgram";
export const PLAPI_DOWNLOADED_PROGRAM = "program/downloadedProgram";
export const PLAPI_FILTER_PROGRAMS = "program/filterPrograms";
export const PLAPI_CREATE_RATING = "ratings/createOrUpdateRating";
export const PLAPI_DELETE_RATING = "ratings/deleteRating";
export const PLAPI_RETRIEVE_RATINGS = "ratings/retrieveRatings";

export const API_POPULARITY_SORT = "popularity";
export const API_RATE_SORT = "rating";
export const sortPopularityKey = 1;
export const sortMostRecentKey = 2;
export const sortHighestRatedKey = 3;
export const sortObject = {
  [sortMostRecentKey]: "",
  [sortPopularityKey]: API_POPULARITY_SORT,
  [sortHighestRatedKey]: API_RATE_SORT
};
