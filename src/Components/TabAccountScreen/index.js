import React, { Component } from "react";
import {
  Platform, Switch, View, TouchableOpacity,
} from "react-native";
import PropTypes from "prop-types";
import { connect } from "react-redux";
import Firebase from "@react-native-firebase/app";
import VersionNumber from "react-native-version-number";
import { getApplicationName } from "react-native-device-info";
import { BluetoothStatus } from "react-native-bluetooth-status";

import StyleSheet from "../../Proportional";
import {
  Colors, Images, Fonts
} from "../../Themes";
import {
  RowItem, ConfirmationToast, Label, Avatar
} from "../Shared";
import SelectionModal from "../Shared/SelectionModal";
import PumpStatusHeader from "../Shared/AppHeader/PumpStatusHeader";
import {
  CONNECT_STATUS, measureUnitModalDataArr, PUMP_DEVICE,
  BREAST_TYPE
} from "../../Config/constants";
import {
  LETDOWN_VACUUM, LETDOWN_CYCLE, EXPRESSION_VACUUM, EXPRESSION_CYCLE
} from "../../Config/Modes";
import * as M from "../../Config/messages";
import { isEmpty, findTitle } from "../../Services/SharedFunctions";

import {
  setNotificationsAllowed, setDefaultSessionType, setMeasureUnit,
  signOut, deleteAccount, requestUserNotifPermission, setDefaultManualSettings
} from "../../Actions/Auth";
import {
  connectPump, disconnect, forgetDevice,
  pumpStart, checkForPumpUpdate, updatePumpFirmware,
  toggleLocation,
} from "../../Actions/Pump";
import { addMessage, setTabChanged } from "../../Actions/Status";
import { setBreastType } from "../../Actions/Logs";
import { handleAndroidBlePermissions } from "../../Services/BLE";
import Container from "../Shared/Container";
import Icon from "../Shared/Icon";

const sessionTypeModalDataArr = [
  {
    titl: "Pump", type: "radio", image: Images.pump, key: "pump"
  },
  {
    titl: "Nursed", type: "radio", image: Images.feed, key: "feed"
  }
];

const breastTypeModalDataArr = [
  {
    titl: "Right", type: "radio", key: BREAST_TYPE.right
  },
  {
    titl: "Left", type: "radio", key: BREAST_TYPE.left
  },
  {
    titl: "Both", type: "radio", key: BREAST_TYPE.both
  }
];

const modeDataArr = [
  {
    titl: "Letdown", type: "radio", key: "letdown"
  },
  {
    titl: "Expression", type: "radio", key: "expression"
  },
];

const deviceMenuArray = [
  {
    titl: "Connect", key: "connect"
  },
  {
    titl: "Control", key: "control"
  },
  {
    titl: "Forget", key: "forget"
  },
  // {
  //   titl: "Rename", key: "rename"
  // }
];

class AccountScreen extends Component {
  constructor(props) {
    super(props);
    this.state = {
      shouldDelete: false,
      sessionTypeModal: false,
      measureUnitModal: false,
      breastTypeModal: false,
      manualSettingsModal: false,
      manualSettingsDetailModal: false,
      manualSettingsModalDataArr: [
        {
          titl: "Mode", key: "mode"
        },
        {
          titl: "Letdown Vacuum level", key: "letVacuum"
        },
        {
          titl: "Letdown Cycle level", key: "letCycle"
        },
        {
          titl: "Expression Vacuum level", key: "expVacuum"
        },
        {
          titl: "Expression Cycle level", key: "expCycle"
        },
      ],
      manualSettingsDetailModalDataArr: [],
      selManualSettingsValue: "",
      manualSettingsTitle: "",
      deviceList: [],
      deviceMenuModal: false,
      subMenu: false,
      currentPumpSelected: true,
      newPumpId: "",
      shouldUpdate: false,
      scanning: false,
    };
  }

  componentDidMount() {
    this.updateDeviceList();
    Firebase.analytics().logEvent("accountscreen_enter");
    const { profile: { manualSettings } } = this.props;
    this.updateManualModalConfiguration(manualSettings);
  }

  componentDidUpdate(prevProps) {
    const {
      pump, tabChangeParams,
    } = this.props;
    const { tabToggling, selection, value } = tabChangeParams;
    if (prevProps.pump.connectedId !== pump.connectedId
      || JSON.stringify(prevProps.pump.peripherals) !== JSON.stringify(pump.peripherals)
      || prevProps.pump.pumpDeviceName !== pump.pumpDeviceName) {
      this.updateDeviceList();
    }

    /* if (prevProps.pump.scanning && !pump.scanning) {
      if (isEmpty(pump.peripherals)) {
        addMessage(M.NO_PUMP);
        // Show pump not found screen
        // setSuperGenieLoad(false);
        // this.navGo("SuperGenie");
      } else {
        // addMessage("Found pump");
      }
      this.setState({ scanning: false });
    }

    if (!prevProps.pump.scanning && pump.scanning) {
      this.setState({ scanning: true });
    } */

    if (prevProps.tabChangeParams.tabToggling !== tabToggling) {
      // trigger manual selection when it is focused from Manual Play
      this.onSelectManualSettings(selection, value);
    }
  }

  updateManualModalConfiguration = (manualSettings) => {
    const { setDefaultManualSettings } = this.props;
    if (!manualSettings) {
      // initial case
      manualSettings = {
        mode: "letdown",
        letCycle: "72",
        letVacuum: "1",
        expCycle: "40",
        expVacuum: "1",
      };
      setDefaultManualSettings(manualSettings);
    }
    const { manualSettingsModalDataArr } = this.state;
    const {
      mode, letCycle, letVacuum, expCycle, expVacuum
    } = manualSettings;
    manualSettingsModalDataArr[0].subTitle = mode;
    manualSettingsModalDataArr[1].subTitle = letVacuum;
    manualSettingsModalDataArr[2].subTitle = letCycle;
    manualSettingsModalDataArr[3].subTitle = expVacuum;
    manualSettingsModalDataArr[4].subTitle = expCycle;
    this.setState({ manualSettingsModalDataArr });
  };

  updateDeviceList = () => {
    const { pump } = this.props;
    const deviceList = [];
    Object.keys(pump.peripherals).forEach((deviceId) => {
      const deviceName = pump.pumpDeviceName || pump.peripherals[deviceId].name;
      let titl;
      if (deviceName === PUMP_DEVICE.SG2) {
        titl = "SuperGenie Gen2";
      } else if (deviceName === PUMP_DEVICE.GG2) {
        titl = "Genie Gen 2";
      } else {
        titl = deviceName;
      }

      let activeLevel; // show whether pump is connected
      if (pump.connectedId === pump.peripherals[deviceId].id) {
        activeLevel = 2;
      } else activeLevel = 1;
      deviceList.push({ titl, key: `sg-${deviceId}`, activeLevel });
    });

    this.setState({ deviceList });
  };

  /* searchPump = () => {
    const { pumpStart, superGenieLoad, setTabChanged } = this.props;
    if (superGenieLoad) {
      // if passed through normal pairing process, then trigger pump search here
      pumpStart();
      this.setState({ scanning: true });
    } else {
      // trigger pump search from pairing screen
      setTabChanged();
      this.navGo("SuperGenie");
    }
  } */

  showPairingFlow = () => {
    this.navGo("GeniePairing");
  };

  onUpdatePumpConfirm = () => {
    const { updatePumpFirmware } = this.props;

    updatePumpFirmware();
  };

  onDeleteConfirm = () => {
    const { deleteAccount, navigation } = this.props;
    this.setState({ shouldDelete: false });
    deleteAccount(navigation);
  };

  onDeleteDeny = () => this.setState({ shouldDelete: false });

  onSelectSessionType = (sessionType) => {
    const { setDefaultSessionType } = this.props;

    setDefaultSessionType(sessionType);
    this.setState({ sessionTypeModal: false });
  };

  onSelectMeasureUnit = (measureUnit) => {
    const { setMeasureUnit } = this.props;
    this.setState({ measureUnitModal: false });
    setMeasureUnit(measureUnit);
  };

  onSelectBreastType = (breastType) => {
    this.setState({ breastTypeModal: false });

    setBreastType(breastType);
  };

  onSelectDeviceMenu = (caption) => {
    const { currentPumpSelected, newPumpId } = this.state;
    const {
      pump, navigation, forgetDevice, superGenieLoad
    } = this.props;

    const connected = pump.connectStatus === CONNECT_STATUS.CONNECTED;
    if (caption && caption.includes("sg")) {
      // main menu
      if (pump.connectedId === caption.slice(3)) {
        // select current connected pump, prepare sub menu items
        deviceMenuArray[0] = {
          ...deviceMenuArray[0],
          titl: pump.connectedId ? "Disconnect" : "Connect"
        };
        deviceMenuArray[1] = {
          ...deviceMenuArray[1],
          hide: false,
        };
        this.setState({ currentPumpSelected: true });
      } else {
        // select new pump, prepare sub menu items
        deviceMenuArray[0] = {
          ...deviceMenuArray[0],
          titl: "Connect"
        };
        deviceMenuArray[1] = {
          ...deviceMenuArray[1],
          hide: true,
        };
        this.setState({
          currentPumpSelected: false,
          newPumpId: caption.slice(3)
        });
        console.log("new pump id:", caption.slice(3));
      }
      this.setState({ subMenu: true });
    } else {
      // sub menu
      this.setState({ deviceMenuModal: false, subMenu: false });
      switch (caption) {
        case "connect":
          if (!superGenieLoad) {
            this.navGo("SuperGenie");
            return;
          }
          if (currentPumpSelected) {
            // mostly disconnecting...
            this.handlePumpPairing(!connected);
            setTimeout(() => {
              this.navGo("SuperGenie");
            }, 1500);
          } else {
            // connecting...
            // eslint-disable-next-line no-lonely-if
            if (connected) {
              // if connected, forget current one and connect with new one
              forgetDevice(false);
              setTimeout(() => {
                this.handlePumpPairing(true, newPumpId);
              }, 1000);
            } else {
              this.handlePumpPairing(true, newPumpId);
            }
            this.navGo("SuperGenie");
          }
          break;
        case "control":
          this.navGo("SuperGenie");
          break;
        case "forget":
          forgetDevice(true);
          navigation.replace("Tabs");
          break;
        default:
          break;
      }
    }
  };

  onSelectManualSettings = (selection, value) => {
    this.setState({ manualSettingsModal: false });
    if (!selection) return;

    const { profile: { manualSettings } } = this.props;
    const mode = manualSettings ? manualSettings.mode : "letdown";

    let manualSettingsDetailModalDataArr = [];
    if (selection === "mode") {
      manualSettingsDetailModalDataArr = modeDataArr;
      this.setState({ selManualSettingsValue: mode, manualSettingsTitle: "Default mode" });
    } else {
      let baseArray = [];
      if (selection === "letVacuum") {
        baseArray = [...LETDOWN_VACUUM[0]];
        this.setState({ manualSettingsTitle: "Letdown Vacuum" });
      } else if (selection === "letCycle") {
        baseArray = [...LETDOWN_CYCLE[0]];
        this.setState({ manualSettingsTitle: "Letdown Cycle" });
      } else if (selection === "expVacuum") {
        baseArray = [...EXPRESSION_VACUUM[0]];
        this.setState({ manualSettingsTitle: "Expression Vacuum" });
      } else if (selection === "expCycle") {
        baseArray = [...EXPRESSION_CYCLE[0]];
        this.setState({ manualSettingsTitle: "Expression Cycle" });
      }

      if (manualSettings) {
        this.setState({ selManualSettingsValue: `${mode}_${selection}_${manualSettings[selection]}` });
      }
      if (value) {
        // sent from Manual Play
        this.setState({ selManualSettingsValue: `${mode}_${selection}_${value}` });
      }
      manualSettingsDetailModalDataArr = baseArray.map((item) => {
        return {
          titl: item,
          type: "radio",
          key: `${mode}_${selection}_${item}`,
        };
      });
    }

    this.setState({ manualSettingsDetailModalDataArr }, () => {
      setTimeout(() => {
        this.setState({ manualSettingsDetailModal: true });
      }, 500);
    });
  };

  onSelectManualSettingsDetail = (selection) => {
    this.setState({ manualSettingsDetailModal: false });
    setTimeout(() => this.setState({ manualSettingsModal: true }), 500);
    if (!selection) return;

    const { profile, setDefaultManualSettings } = this.props;
    let { manualSettings } = profile;

    if (selection === "letdown" || selection === "expression") {
      manualSettings = {
        ...manualSettings,
        mode: selection,
      };
    } else {
      const vals = selection.split("_");
      manualSettings = {
        ...manualSettings,
        [vals[1]]: vals[2],
      };
    }
    setDefaultManualSettings(manualSettings);
    this.updateManualModalConfiguration(manualSettings);
  };

  onChangeNotification = (val) => {
    const { requestUserNotifPermission } = this.props;

    if (val) {
      requestUserNotifPermission(true);
    } else {
      setNotificationsAllowed(false);
    }
  };

  navGo = (screen, params) => {
    const { navigation } = this.props;
    navigation.navigate(screen, params);
  };

  handlePumpPairing = async (value, newPumpId) => {
    const isBTEnabled = await BluetoothStatus.state();
    const {
      connectPump, disconnect, pump, addMessage
    } = this.props;
    const { peripherals, connectStatus } = pump;

    if (value) {
      // connect with passed pump id
      if (!isBTEnabled) {
        addMessage(M.BLUETOOTH_OFF);
        return;
      }

      try {
        await handleAndroidBlePermissions();
      } catch (err) {
        addMessage(M.BLUETOOTH_PERMISSION_ERROR);
        return;
      }

      if (isEmpty(peripherals) && connectStatus === CONNECT_STATUS.DISCONNECTED) {
        addMessage(M.NOT_FIND_SUPERGENIE);
        return;
      }
      if ((pump.id || pump.connectedId) && newPumpId) {
        // connect with the pump that is not stored
        connectPump(newPumpId);
      } else {
        connectPump(pump.id || pump.connectedId || newPumpId);
      }
    } else {
      disconnect(false);
    }
  };

  renderSectionHeader = (title) => {
    return (
      <View style={styles.sectionHeader}>
        <Label font10 greyWarm weightSemiBold>{title}</Label>
      </View>
    );
  };

  render() {
    const {
      breastType, profile, signOut,
      pump, notificationsAllowed, checkForPumpUpdate,
      toggleLocation,
    } = this.props;
    const {
      shouldDelete, sessionTypeModal, measureUnitModal,
      breastTypeModal, manualSettingsModal, manualSettingsDetailModal,
      manualSettingsDetailModalDataArr, selManualSettingsValue, deviceList,
      // eslint-disable-next-line no-unused-vars
      deviceMenuModal, subMenu, shouldUpdate, scanning,
      manualSettingsTitle, manualSettingsModalDataArr
    } = this.state;

    const {
      updateAvailable, connectedId, pumpDevice,
      locationEnabled, connectStatus,
    } = pump;

    const title = `Hi, ${
      profile.displayName ? profile.displayName.trim().split(" ").shift() : "Mama!"
    }`;

    return (
      <Container
        edges={["top"]}
        testID="settings-content"
      >
        <>
          <PumpStatusHeader />
          <View style={styles.headerContainer}>
            <Avatar />
            <View style={styles.titleContainer}>
              <Label style={styles.headerTitle}>
                {title}
              </Label>
              <TouchableOpacity
                onPress={() => this.navGo("UpdateProfile", { displayName: profile.displayName })}
              >
                <Label blue font12 weightSemiBold>EDIT PROFILE</Label>
              </TouchableOpacity>
            </View>
          </View>

          {this.renderSectionHeader("READY, SET, PUMP")}
          {/* <RowItem iconImage={Images.pairing} title="Pairing">
            <Switch
              trackColor={{ true: Colors.windowsBlue, false: null }}
              thumbColor={Platform.OS === "android" ? "#F1F1F1" : null}
              onValueChange={this.handlePumpPairing}
              value={pump.connectStatus === CONNECT_STATUS.CONNECTED}
            />
          </RowItem> */}

          <RowItem
            iconImage={Images.pumps}
            title="Available pumps"
            onPress={() => this.setState({ deviceMenuModal: true })}
          />

          {/* <RowItem
            iconImage={Images.search}
            title="Reconnect to pump"
            subTitle={scanning ? "Takes up to 15 seconds" : ""}
            onPress={this.searchPump}
          >
            {scanning ? <ActivityIndicator color={Colors.blue} /> : null}
          </RowItem> */}

          {connectStatus !== CONNECT_STATUS.CONNECTED && (
            <RowItem
              iconImage={Images.search}
              title="Connect to pump"
              onPress={this.showPairingFlow}
            />
          )}

          {/* If connected to SG2 pump only */}
          {connectedId && pumpDevice === PUMP_DEVICE.SG2 && !updateAvailable && (
            <RowItem
              iconImage={Images.search}
              title="Check for pump update"
              onPress={() => checkForPumpUpdate(connectedId, true)}
            />
          )}

          {updateAvailable && (
            <RowItem
              iconImage={Images.search}
              title="Update pump"
              onPress={() => this.setState({ shouldUpdate: true })}
            />
          )}

          <RowItem
            title="Pumping schedule"
            iconImage={Images.schedule}
            onPress={() => this.navGo("Schedule")}
          />

          <RowItem
            iconImage={Images.milestone}
            title="Goal"
            onPress={() => this.navGo("Milestone")}
          />

          <RowItem
            iconImage={Images.review}
            title="My Reviews"
            onPress={() => this.navGo("Review")}
          />

          {Platform.OS === "ios" && (
            <RowItem iconImage={Images.navigateIcon} title="Location">
              <Switch
                trackColor={{ true: Colors.windowsBlue, false: null }}
                thumbColor={null}
                onValueChange={toggleLocation}
                value={locationEnabled}
              />
            </RowItem>
          )}

          {this.renderSectionHeader("DEFAULT SETTINGS")}
          <RowItem
            iconImage={Images.measure}
            title="Measurement unit"
            onPress={() => this.setState({ measureUnitModal: true })}
          >
            <View
              style={styles.selectArea}
            >
              <Label font12 blue weightSemiBold>
                {findTitle(measureUnitModalDataArr, profile.measureUnit)}
              </Label>
              <Icon style={styles.arrow} name="chevron-forward" />
            </View>
          </RowItem>

          <RowItem
            iconImage={Images.sessionType}
            title="Session type"
            onPress={() => this.setState({ sessionTypeModal: true })}
          >
            <View
              style={styles.selectArea}
            >
              <Label font12 blue weightSemiBold>
                {findTitle(sessionTypeModalDataArr, profile.defaultSessionType)}
              </Label>
              <Icon style={styles.arrow} name="chevron-forward" />
            </View>
          </RowItem>

          <RowItem
            iconImage={Images.sessionSide}
            title="Session side"
            onPress={() => this.setState({ breastTypeModal: true })}
          >
            <View
              style={styles.selectArea}
            >
              <Label font12 blue weightSemiBold>
                {findTitle(breastTypeModalDataArr, breastType)}
              </Label>
              <Icon style={styles.arrow} name="chevron-forward" />
            </View>
          </RowItem>

          <RowItem
            iconImage={Images.manual}
            title="Manual mode settings"
            onPress={() => this.setState({ manualSettingsModal: true })}
          />

          {this.renderSectionHeader("ACCOUNT")}
          <RowItem iconImage={Images.notification} title="Notifications">
            <Switch
              trackColor={{ true: Colors.windowsBlue, false: null }}
              thumbColor={Platform.OS === "android" ? "#F1F1F1" : null}
              onValueChange={this.onChangeNotification}
              value={notificationsAllowed}
            />
          </RowItem>

          <RowItem
            iconImage={Images.request}
            title="Reset password"
            onPress={() => this.navGo("ResetPassword")}
          />

          <RowItem
            iconImage={Images.feedback}
            title="Feedback"
            onPress={() => this.navGo("Request")}
          />

          <RowItem
            testID="signout-test"
            iconImage={Images.signout}
            title="Sign out"
            onPress={() => signOut()}
          />

          <RowItem
            iconImage={Images.delete}
            title="Delete account"
            onPress={() => this.setState({ shouldDelete: true })}
          />

          <RowItem
            subTitle={`${getApplicationName()} ${VersionNumber.appVersion}(${VersionNumber.buildVersion})`}
            centerSubTitle
          >
            <View />
          </RowItem>

          {shouldUpdate && (
            <ConfirmationToast
              title={M.UPDATE_PUMP}
              subtitle={M.NOT_TOUCH_WHILE_UPGRADING}
              onPressConfirm={this.onUpdatePumpConfirm}
              onPressDeny={() => this.setState({ shouldUpdate: true })}
            />
          )}

          {shouldDelete && (
            <ConfirmationToast
              title={M.DELETE_ACCOUNT}
              subtitle={M.CONFIRM_DELETE_ACCOUNT}
              onPressConfirm={this.onDeleteConfirm}
              onPressDeny={this.onDeleteDeny}
            />
          )}
          {sessionTypeModal && (
            <SelectionModal
              isVisible={sessionTypeModal}
              selectedValue={profile.defaultSessionType}
              title="Default session type"
              dataArr={sessionTypeModalDataArr}
              onPressConfirm={this.onSelectSessionType}
            />
          )}
          {measureUnitModal && (
            <SelectionModal
              isVisible={measureUnitModal}
              selectedValue={profile.measureUnit}
              title="Measurement unit"
              dataArr={measureUnitModalDataArr}
              onPressConfirm={this.onSelectMeasureUnit}
            />
          )}
          {breastTypeModal && (
            <SelectionModal
              isVisible={breastTypeModal}
              selectedValue={breastType}
              title="Default session side"
              dataArr={breastTypeModalDataArr}
              onPressConfirm={this.onSelectBreastType}
            />
          )}
          {manualSettingsModal && (
            <SelectionModal
              isVisible={manualSettingsModal}
              title="Default manual settings"
              dataArr={manualSettingsModalDataArr}
              onPressConfirm={this.onSelectManualSettings}
            />
          )}
          {manualSettingsDetailModal && (
            <SelectionModal
              isVisible={manualSettingsDetailModal}
              selectedValue={selManualSettingsValue}
              title={manualSettingsTitle}
              modalType="middle"
              modalStyle={{ paddingHorizontal: 30 }}
              itemStyle={{
                borderBottomColor: Colors.whiteFive,
                borderBottomWidth: 0.5,
              }}
              dataArr={manualSettingsDetailModalDataArr}
              onPressConfirm={this.onSelectManualSettingsDetail}
            />
          )}
          {deviceMenuModal && (
            <SelectionModal
              isVisible={deviceMenuModal}
              title="Available pumps"
              dataArr={deviceList}
              subMenuDataArr={deviceMenuArray}
              subMenu={subMenu}
              onPressConfirm={this.onSelectDeviceMenu}
              onPressCloseButton={() => this.setState({ subMenu: false })}
            />
          )}
        </>
      </Container>
    );
  }
}

const styles = StyleSheet.createProportional({
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 10,
    marginTop: 10,
    padding: 12,
    borderRadius: 12,
    backgroundColor: Colors.backgroundThree,
  },
  titleContainer: {
    marginLeft: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    ...Fonts.SemiBold,
    color: Colors.grey
  },
  editIcon: {
    color: Colors.lightBlue,
    fontSize: 20,
    margin: 8,
  },
  arrow: {
    color: Colors.blue,
    fontSize: 15,
    marginLeft: 5
  },
  selectArea: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
    paddingHorizontal: 10
  },
  sectionHeader: {
    marginTop: 15,
    paddingLeft: 25,
    paddingTop: 30,
    paddingBottom: 3,
    backgroundColor: "white"
  }
});

AccountScreen.propTypes = {
  breastType: PropTypes.string,
  profile: PropTypes.object.isRequired,
  pump: PropTypes.object,
  // pumpStart: PropTypes.func,
  setDefaultSessionType: PropTypes.func.isRequired,
  setMeasureUnit: PropTypes.func.isRequired,
  setDefaultManualSettings: PropTypes.func.isRequired,
  requestUserNotifPermission: PropTypes.func,
  notificationsAllowed: PropTypes.bool,
  superGenieLoad: PropTypes.bool,
  tabChangeParams: PropTypes.object,
  forgetDevice: PropTypes.func,
  signOut: PropTypes.func.isRequired,
  deleteAccount: PropTypes.func.isRequired,
  navigation: PropTypes.object,
  connectPump: PropTypes.func,
  disconnect: PropTypes.func,
  addMessage: PropTypes.func,
  // setTabChanged: PropTypes.func,
  checkForPumpUpdate: PropTypes.func,
  updatePumpFirmware: PropTypes.func,
  toggleLocation: PropTypes.func,
};

const mapStateToProps = ({
  auth, pump,
  status, logs
}) => ({
  pump,
  profile: auth.profile,
  notificationsAllowed: auth.notificationsAllowed,
  breastType: logs.globalBreastType,
  superGenieLoad: status.superGenieLoad,
  tabChangeParams: status.tabChangeParams,
});

const mapDispatchToProps = {
  setDefaultSessionType,
  setMeasureUnit,
  pumpStart,
  setDefaultManualSettings,
  requestUserNotifPermission,
  forgetDevice,
  signOut,
  deleteAccount,
  connectPump,
  disconnect,
  addMessage,
  setTabChanged,
  checkForPumpUpdate,
  updatePumpFirmware,
  toggleLocation,
};

export default connect(mapStateToProps, mapDispatchToProps)(AccountScreen);
