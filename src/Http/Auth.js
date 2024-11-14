import axios from "axios";
import { KLAVIYO_API_KEY, PLAPI_BASE_URL } from "react-native-dotenv";

export const publicAxios = axios.create({
  baseURL: PLAPI_BASE_URL
});

export const klaviyoAxios = axios.create({
  baseURL: "https://a.klaviyo.com/api",
  headers: {
    accept: "application/json",
    Authorization: `Klaviyo-API-Key ${KLAVIYO_API_KEY}`,
    "content-type": "application/json",
    revision: "2024-06-15"
  }
});
