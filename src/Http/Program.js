import { publicAxios } from "./Auth";
import {
  PLAPI_DOWNLOADED_PROGRAM, PLAPI_FILTER_PROGRAMS, PLAPI_GET_ALL_PROGRAMS, PLAPI_UPLOAD_PROGRAM
} from "../Config/api";
import { SOMETHING_WRONG } from "../Config/messages";

class ApiProgram {
  getAllPrograms(sort, page) {
    return new Promise((resolve, reject) => {
      const url = `${page || PLAPI_GET_ALL_PROGRAMS}${page ? "&" : "?"}${sort ? `sort=${sort}` : ""}`;
      publicAxios.get(url).then((data) => {
        // console.log("getAllPrograms:", data.data, data);

        const { results, previous, next } = data.data;

        resolve({ results, next, previous });
      }).catch((error) => {
        console.log("Error on getAllPrograms from API: ", JSON.stringify(error));
        reject(error.response?.data?.message || SOMETHING_WRONG);
      });
    });
  }

  uploadNewProgram(programBody) {
    return new Promise((resolve, reject) => {
      publicAxios.post(
        PLAPI_UPLOAD_PROGRAM,
        programBody
      ).then((data) => {
        console.log("uploadNewProgram:", data);
        resolve(data);
      }).catch((error) => {
        console.log("Error on upload new program to API: ", JSON.stringify(error));
        reject(error.response?.data?.message || SOMETHING_WRONG);
      });
    });
  }

  downloadedProgram(body) {
    return new Promise((resolve, reject) => {
      publicAxios.post(
        PLAPI_DOWNLOADED_PROGRAM,
        body
      ).then((data) => {
        // console.log("downloadedProgram:", data);
        resolve(data);
      }).catch((error) => {
        console.log("Error on downloadedProgram to API: ", JSON.stringify(error));
        reject(error.response?.data?.message || SOMETHING_WRONG);
      });
    });
  }

  filterPrograms(params, page) {
    return new Promise((resolve, reject) => {
      const url = `${page || PLAPI_FILTER_PROGRAMS}${page ? "&" : "?"}${params}`;
      publicAxios.get(url).then((data) => {
        // console.log("filter program:", data.data);
        const { results, previous, next } = data.data;
        resolve({ results, next, previous });
      }).catch((error) => {
        // console.log("Error on filter program to API: ", JSON.stringify(error));
        reject(error.response?.data?.message || SOMETHING_WRONG);
      });
    });
  }
}

export default new ApiProgram();
