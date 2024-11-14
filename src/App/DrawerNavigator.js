import React from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";

import BaseNavigator from "./BaseNavigator";
import RequestScreen from "../Components/ModalRequestScreen";
import ResetPasswordScreen from "../Components/ModalResetScreen";
import ModalMilestoneScreen from "../Components/ModalMilestoneScreen";

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  return (
    <Drawer.Navigator>
      <Drawer.Screen name="Home" component={BaseNavigator} />
      <Drawer.Screen name="Reset Password" component={ResetPasswordScreen} />
      <Drawer.Screen name="Goal" component={ModalMilestoneScreen} />
      <Drawer.Screen name="Send Feedback" component={RequestScreen} />
    </Drawer.Navigator>
  );
};

export default DrawerNavigator;
