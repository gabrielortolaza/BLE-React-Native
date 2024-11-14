/** Page appears to no longer be used */
/* eslint-disable */
/* global fetch */
import { Linking } from "react-native";
import Firebase from "@react-native-firebase/app";
import qs from "qs";
import base64 from "base-64";
import DebugConfig from "../Config/DebugConfig";

const logEvent = (message, type = "fitbit") => {
  // eslint-disable-next-line no-console
  // console.log(type + ' >>> ' + message);
  Firebase.analytics().logEvent("Debug", {
    message,
    type
  })
}

const Config = {
  FITBIT_CLIENT_ID: '22CQ5K',
  FITBIT_CLIENT_SECRET: 'eed0fdadcdca1b3023375e7b9b8050c8',
  FITBIT_AUTH_URL: 'https://www.fitbit.com/oauth2/authorize',
  FITBIT_TOKEN_URL: 'https://api.fitbit.com/oauth2/token',
  FITBIT_CALLBACK_URL: 'ppbl://fitbit'
}

function openAuthPage() {
  logEvent('openAuthPage');
  const query = qs.stringify({
    client_id: Config.FITBIT_CLIENT_ID,
    response_type: "token",
    scope:
      "activity heartrate location nutrition profile settings sleep social weight",
    redirect_uri: Config.FITBIT_CALLBACK_URL,
    expires_in: "31536000",
    prompt: 'consent'
  });
  const oauthurl = `${Config.FITBIT_AUTH_URL}?${query}`;
  logEvent('oauthurl: ' + oauthurl);

  Linking.openURL(oauthurl).catch(error => logEvent(error.message));
}

function addSubscription(oauthPermission, subscriptionId) {
  logEvent('add Subscription');
  fetch(
    `https://api.fitbit.com/1/user/-/apiSubscriptions/${subscriptionId}.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${oauthPermission.access_token}`,
        'X-Fitbit-Subscriber-Id': DebugConfig.isDev ? 'development' : 'production'
      }
    }
  ).then(async r => {
    logEvent('add Subscription success: ' + r.json());
  }).catch(error => {
    logEvent('add Subscription fail: ' + error.message);
  });
}

function removeSubscription(oauthPermission, subscriptionId) {
  logEvent('Remove Subscription 1');
  fetch(
    `https://api.fitbit.com/1/user/-/apiSubscriptions/${subscriptionId}.json`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${oauthPermission.access_token}`,
        'X-Fitbit-Subscriber-Id': DebugConfig.isDev ? 'development' : 'production'
      }
    }
  ).catch(error => logEvent('Revoke Subscription 2: ' + error.message) );
}

function revokeAccess(oauthPermission, subscriptionId) {
  logEvent('Revoke Access 1');
  removeSubscription(oauthPermission, subscriptionId);
  logEvent('Revoke Access 2');
  fetch(`https://api.fitbit.com/oauth2/revoke`, {
    method: "DELETE",
    body: `token=${oauthPermission.access_token}`,
    headers: {
      Authorization: `Basic ${base64.encode(
        Config.FITBIT_CLIENT_ID + ":" + Config.FITBIT_CLIENT_SECRET
      )}`,
      'X-Fitbit-Subscriber-Id': DebugConfig.isDev ? 'development' : 'production'
    }
  }).catch(error => logEvent('Revoke Access 3: ' + error.message) );
}

export default {
  openAuthPage,
  addSubscription,
  removeSubscription,
  revokeAccess
};
