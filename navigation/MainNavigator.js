import * as React from "react";
import { createDrawerNavigator } from "react-navigation-drawer";
import { createAppContainer, createSwitchNavigator } from "react-navigation";
import { AppStack, AuthStack } from "./Stack";
import Loader from "../Screens/Loader";

import CustomDrawer from "./CustomDrawer";
import { Dimensions } from "react-native";

const { width, height } = Dimensions.get("window");

export const MainNavigator = createDrawerNavigator(
  {
    Home: {
      screen: AppStack,
    },
  },
  {
    contentComponent: CustomDrawer,
    drawerWidth: width - 50,
    overlayColor: "rgba(0, 0, 0, 0.5)",
  }
);

export default createAppContainer(
  createSwitchNavigator(
    {
      Load: Loader,
      App: MainNavigator,
      Auth: AuthStack,
    },
    {
      initialRouteName: "Load",
    }
  )
);
