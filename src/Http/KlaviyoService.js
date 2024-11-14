import { klaviyoAxios } from "./Auth";

const LIST_ID = "Ypzgnk";

export const addProfileToList = async (profile) => {
  try {
    const response = await klaviyoAxios.post(`/lists/${LIST_ID}/relationships/profiles/`, profile);
    return response.data;
  } catch (error) {
    console.log("Error adding profile to list:", error);
    throw error;
  }
};

export const getLists = async () => {
  try {
    const response = await klaviyoAxios.get("/lists");
    return response.data;
  } catch (error) {
    console.log("Error getting lists:", error);
    throw error;
  }
};

export const getListProfiles = async () => {
  try {
    const response = await klaviyoAxios.get(`/lists/${LIST_ID}/profiles`);
    return response.data;
  } catch (error) {
    console.log("Error getting list profiles:", error);
    throw error;
  }
};

export const createProfile = async (profile) => {
  try {
    const response = await klaviyoAxios.post("/profiles", profile);
    return response.data;
  } catch (error) {
    console.log("Error creating profile:", error);
    throw error;
  }
};
