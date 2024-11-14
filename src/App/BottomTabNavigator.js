import React from "react";
import { useSelector, connect } from "react-redux";
import { Image } from "react-native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import PropTypes from "prop-types";

import { Colors, Images } from "../Themes";
import TabLogsScreen from "../Components/TabLogsScreen";
import AccountScreen from "../Components/TabAccountScreen";
import GeniePairingScreen from "../Components/SuperGenieScreen/Pairing";
import GenieHomeScreen from "../Components/SuperGenieScreen/Home";
import TabNewsScreen from "../Components/TabNewsScreen";
import TabSessionIcon from "../Components/TabSessionIcon";
import Icon from "../Components/Shared/Icon";

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const TabSession = () => {
  return null;
};

function BottomTabNavigator({ hasViewedStashTutorial }) {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarHideOnKeyboard: true,
        tabBarStyle: {
          backgroundColor: Colors.white,
          elevation: 5,
          shadowColor: "rgba(0, 0, 0, 0.5)",
          shadowOffset: {
            width: 0,
            height: -3,
          },
          shadowOpacity: 0.3,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: Colors.blue,
        tabBarActiveBackgroundColor: Colors.white,
        tabBarInactiveTintColor: Colors.lightGrey2,
        tabBarInactiveBackgroundColor: Colors.white,
        tabBarLabelStyle: {
          fontSize: 12,
        },
      }}
    >
      <Tab.Screen
        name="Dashboard"
        component={TabNewsScreen}
        options={{
          tabBarTestID: "dashboard-tab",
          tabBarIcon: ({ focused, size }) => (
            <Icon
              type="MaterialCommunityIcons"
              name="view-dashboard"
              style={{
                color: focused ? Colors.blue : Colors.lightGrey2,
                fontSize: size,
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="SuperGenie"
        component={SGScreens}
        options={{
          tabBarTestID: "genie-tab",
          // tabBarBadge: hasViewedPLTutorial,
          // tabBarBadgeStyle: {
          //   minWidth: 10,
          //   minHeight: 10,
          //   maxWidth: 10,
          //   maxHeight: 10,
          //   borderRadius: 5,
          //   marginTop: 5,
          //   marginStart: 5,
          //   backgroundColor: Colors.vividOrange
          // },
          tabBarIcon: ({ focused, size }) => (
            <Image
              source={
                focused ? Images.tabSuperGenieOn : Images.tabSuperGenieOff
              }
              style={{
                width: size,
                height: size,
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name=" "
        component={TabSession}
        options={{
          tabBarTestID: "icon-tab",
          tabBarIcon: () => <TabSessionIcon />,
        }}
      />
      <Tab.Screen
        name="Logs"
        component={TabLogsScreen}
        options={{
          tabBarTestID: "logs-tab",
          tabBarBadge: !hasViewedStashTutorial ? "" : null,
          tabBarBadgeStyle: {
            minWidth: 10,
            minHeight: 10,
            maxWidth: 10,
            maxHeight: 10,
            borderRadius: 5,
            marginTop: 8,
            marginStart: 0,
            backgroundColor: "rgba(239, 90, 90, 1)"
          },
          tabBarIcon: ({ focused, size }) => (
            <Icon
              type="MaterialCommunityIcons"
              name="clock-time-five-outline"
              style={{
                color: focused ? Colors.blue : Colors.lightGrey2,
                fontSize: size,
              }}
            />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={AccountScreen}
        options={{
          tabBarTestID: "settings-tab",
          tabBarIcon: ({ focused, size }) => (
            <Icon
              type="Ionicons"
              name="settings"
              style={{
                color: focused ? Colors.blue : Colors.lightGrey2,
                fontSize: size,
              }}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

const mapStateToProps = ({ status }) => ({
  hasViewedPLTutorial: status.hasViewedPLTutorial,
  hasViewedStashTutorial: status.hasViewedStashTutorial
});

export default connect(mapStateToProps)(BottomTabNavigator);

BottomTabNavigator.propTypes = {
  // eslint-disable-next-line react/no-unused-prop-types
  focused: PropTypes.bool,
  // eslint-disable-next-line react/no-unused-prop-types
  size: PropTypes.number,
  hasViewedStashTutorial: PropTypes.bool
  // hasViewedPLTutorial: PropTypes.string
};

function SGScreens() {
  const superGenieLoad = useSelector((state) => state.status.superGenieLoad);
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {superGenieLoad ? (
        <>
          <Stack.Screen name="GenieHome" component={GenieHomeScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="GeniePairing" component={GeniePairingScreen} />
          <Stack.Screen name="GenieHome" component={GenieHomeScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
