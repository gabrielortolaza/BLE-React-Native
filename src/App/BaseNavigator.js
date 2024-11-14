import React from "react";
import { createStackNavigator } from "@react-navigation/stack";

import LaunchScreen from "../Components/LaunchScreen";
import SessionModal from "../Components/ModalSessionScreen";
import TourStartScreen from "../Components/TourStartScreen";
import TourAuthScreen from "../Components/TourAuthScreen";
import TourTermsScreen from "../Components/TourTermsScreen";
import ScheduleScreen from "../Components/ScheduleScreen";
import TourGoalScreen from "../Components/TourGoalScreen";
import AccountScreen from "../Components/TabAccountScreen";
import UpdateProfileScreen from "../Components/ModalUpdateProfileScreen";
import ResetPasswordScreen from "../Components/ModalResetScreen";
import RequestScreen from "../Components/ModalRequestScreen";
import ReviewScreen from "../Components/ReviewScreen";
import ReviewDetailScreen from "../Components/ReviewDetailScreen";
import GeniePairingScreen from "../Components/SuperGenieScreen/Pairing";
import ProgramRun from "../Components/SuperGenieScreen/ProgramRun";
import ManualRunScreen from "../Components/SuperGenieScreen/ManualRun";
import ProgramRecord from "../Components/SuperGenieScreen/ProgramRecord";
import ProgramEdit from "../Components/SuperGenieScreen/ProgramEdit";
import ProgramReview from "../Components/SuperGenieScreen/ProgramReview";
import ProgramEditSession from "../Components/SuperGenieScreen/ProgramEditSession";
import PumpSearch from "../Components/SuperGenieScreen/Pairing/PumpSearch";
import ModalMilestoneScreen from "../Components/ModalMilestoneScreen";
import BottomTabNavigator from "./BottomTabNavigator";
import Stash from "../Components/ModalStashScreen/Stash";

const Stack = createStackNavigator();

export default function BaseNavigator() {
  return (
    <Stack.Navigator
      screenOptions={{ gestureEnabled: false, headerShown: false }}
    >
      <Stack.Screen name="Launch" component={LaunchScreen} />
      <Stack.Screen name="Tabs" component={BottomTabNavigator} />
      <Stack.Screen name="TourStart" component={TourStartScreen} />
      <Stack.Screen name="Auth" component={TourAuthScreen} />
      <Stack.Screen name="Terms" component={TourTermsScreen} />
      <Stack.Screen name="Schedule" component={ScheduleScreen} />
      <Stack.Screen name="TourGoal" component={TourGoalScreen} />
      <Stack.Screen
        name="SessionModal"
        component={SessionModal}
        options={{
          gestureEnabled: true,
          gestureDirection: "horizontal",
        }}
      />
      <Stack.Screen
        name="StashScreen"
        component={Stash}
        options={{
          gestureEnabled: true,
          gestureDirection: "horizontal",
        }}
      />
      <Stack.Screen name="GeniePairing" component={GeniePairingScreen} />
      <Stack.Screen name="ManualRun" component={ManualRunScreen} />
      <Stack.Screen name="ProgramRecord" component={ProgramRecord} />
      <Stack.Screen name="ProgramRun" component={ProgramRun} />
      <Stack.Screen name="ProgramEdit" component={ProgramEdit} />
      <Stack.Screen name="ProgramReview" component={ProgramReview} />
      <Stack.Screen name="ProgramEditSession" component={ProgramEditSession} />
      <Stack.Screen name="Account" component={AccountScreen} />
      <Stack.Screen name="UpdateProfile" component={UpdateProfileScreen} />
      <Stack.Screen name="ResetPassword" component={ResetPasswordScreen} />
      <Stack.Screen name="Request" component={RequestScreen} />
      <Stack.Screen name="Review" component={ReviewScreen} />
      <Stack.Screen name="ReviewDetail" component={ReviewDetailScreen} />
      <Stack.Screen name="Milestone" component={ModalMilestoneScreen} />
      <Stack.Screen name="PumpSearch" component={PumpSearch} />
    </Stack.Navigator>
  );
}
