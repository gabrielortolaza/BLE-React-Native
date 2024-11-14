/* eslint-disable max-len */
import {
  NativeEventEmitter, NativeModules, Platform,
  PermissionsAndroid
} from "react-native";
import BleManager from "react-native-ble-manager";

let eventHandlers = [];

const BleManagerModule = NativeModules.BleManager;
const bleManagerEmitter = new NativeEventEmitter(BleManagerModule);

export const start = () => {
  console.log("ble start...");
  return BleManager.start({ showAlert: false });
};

export const handleAndroidBlePermissions = () => {
  return new Promise((resolve, reject) => {
    if (Platform.OS === "android" && Platform.Version >= 31) {
      PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
      ]).then((result) => {
        if (Object.values(result).every((item) => item === PermissionsAndroid.RESULTS.GRANTED)) {
          console.debug(
            "[handleAndroidPermissions] User accepts runtime permissions android 12+",
          );
          resolve();
        } else {
          console.error(
            "[handleAndroidPermissions] User refuses runtime permissions android 12+",
          );
          reject();
        }
      });
    } else if (Platform.OS === "android" && Platform.Version >= 23) {
      PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ).then((checkResult) => {
        if (checkResult) {
          console.debug(
            "[handleAndroidPermissions] runtime permission Android <12 already OK",
          );
          resolve();
        } else {
          PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          ).then((requestResult) => {
            if (requestResult === PermissionsAndroid.RESULTS.GRANTED) {
              console.debug(
                "[handleAndroidPermissions] User accepts runtime permission android <12",
              );
              resolve();
            } else {
              console.error(
                "[handleAndroidPermissions] User refuses runtime permission android <12",
              );
              reject();
            }
          });
        }
      });
    } else {
      resolve();
    }
  });
};

export const addListener = (event, callback) => {
  eventHandlers.push(bleManagerEmitter.addListener(event, callback));
};

export const removeListeners = () => {
  eventHandlers.forEach((eventHandler) => {
    eventHandler.remove();
  });
  eventHandlers = [];
};

export const checkState = () => {
  BleManager.checkState();
};

export const scan = () => {
  // console.log("ble scan...");
  return BleManager.scan([], 5, false);
};

export const connect = (id) => {
  console.log("ble connect...", id);
  return BleManager.connect(id)
    .then((res) => {
      // if (Platform.OS === 'android') {
      //  return BleManager.getBondedPeripherals([])
      //    .then((list) => {
      //      if(!list.find((peripheral) => peripheral.id === id)) {
      //        return BleManager.createBond(id).then(() => res)
      //      }
      //      return res
      //    })
      // } else {
      return res;
      // }
    })
    .catch((err) => {
      console.log("ble connect error:", err);
    });
};

export const getConnectedPeripherals = () => BleManager.getConnectedPeripherals([]);

export const disconnect = (id) => BleManager.disconnect(id);

export const isPeripheralConnected = (id) => BleManager.isPeripheralConnected(id, []);

export const readRSSI = (id) => BleManager.readRSSI(id);

export const read = (
  peripheralId, serviceUUID, characteristicUUID
) => BleManager.read(peripheralId, serviceUUID, characteristicUUID);

export const writeWithoutResponse = (
  peripheralId, serviceUUID, characteristicUUID, data
) => BleManager.writeWithoutResponse(peripheralId, serviceUUID, characteristicUUID, data);

export const write = (
  peripheralId, serviceUUID, characteristicUUID, data
) => BleManager.write(peripheralId, serviceUUID, characteristicUUID, data);

export const startNotification = (
  peripheralId, serviceUUID, characteristicUUID
) => BleManager.startNotification(peripheralId, serviceUUID, characteristicUUID);

export const stopNotification = (
  peripheralId, serviceUUID, characteristicUUID
) => BleManager.stopNotification(peripheralId, serviceUUID, characteristicUUID);

export const retrieveServices = (id) => BleManager.retrieveServices(id);

export default {
  writeWithoutResponse,
  write,
  scan,
  addListener,
  start,
  removeListeners,
  checkState,
  connect,
  isPeripheralConnected,
  startNotification,
  stopNotification,
  retrieveServices,
  getConnectedPeripherals,
  disconnect
};
