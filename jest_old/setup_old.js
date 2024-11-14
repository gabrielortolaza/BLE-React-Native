/* eslint-disable no-undef */
import mockAsyncStorage from "@react-native-async-storage/async-storage/jest/async-storage-mock";

/*  AsyncStorage */
jest.mock("@react-native-async-storage/async-storage", () => mockAsyncStorage);

/*  Firebase */
jest.mock("react-native-firebase", () => ({
  messaging: jest.fn(() => ({
    hasPermission: jest.fn(() => Promise.resolve(true)),
    subscribeToTopic: jest.fn(),
    unsubscribeFromTopic: jest.fn(),
    requestPermission: jest.fn(() => Promise.resolve(true)),
    getToken: jest.fn(() => Promise.resolve("myMockToken")),
  })),
  notifications: jest.fn(() => ({
    onNotification: jest.fn(),
    onNotificationDisplayed: jest.fn(),
  })),
  analytics: jest.fn(() => ({
    logEvent: jest.fn(),
  }))
}));

jest.mock("react-native/Libraries/EventEmitter/NativeEventEmitter");
