import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import HomeScreen from "../screens/HomeScreen";
import ProfileScreen from "../screens/ProfileScreen";
import Auth from "../components/Auth";
import SignUpScreen from "../screens/SignUpScreen";
import { Icon } from "react-native-elements";
import ChangePassword from "../screens/ChangePassword";
import DeleteScreen from "../screens/DeleteScreen";
import PrivacyScreen from "../screens/PrivacyScreen";
import TransactionScreen from "../screens/TransactionScreen"; // Import TransactionScreen
import TransferScreen from "../screens/TransferScreen"; // Import TransferScreen
import SendScreen from "../screens/SendScreen";
import BillScreen from "../screens/BillScreen";
import CashIn from "../screens/CashIn";

export type RootStackParamlist = {
  Auth: undefined;
  SignUp: undefined;
  Main: undefined;
  TabHome: { userId: string };
  Profile: { userId: string };
  ChangePassword: undefined;
  DeleteScreen: undefined;
  Transactions: { userId: string };
  TransferScreen: { from_account_id: string; userId: string };
  SendScreen: { from_account_id: string; userId: string };
  BillScreen: { from_account_id: string; userId: string };
  PrivacyScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamlist>();
const Tab = createBottomTabNavigator();

function TabNavigator({ user }: { user: any }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "TabHome") {
            iconName = "home";
          } else if (route.name === "Profile") {
            iconName = "person";
          } else if (route.name === "Transactions") {
            iconName = "receipt"; // Icon for Transactions
          }

          return <Icon name={iconName} type="material" color={color} size={size} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
        headerShown: true,
      })}
    >
      <Tab.Screen
      name="TabHome"
      component={HomeScreen}
      initialParams={{ userId: user?.id }} // Pass userId as initialParams
      options={{
        title: "Home",
      }}
    />
      <Tab.Screen
        name="Transactions"
        component={TransactionScreen}
        initialParams={{ userId: user?.id }}
        options={{
          title: "Transactions",
        }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        initialParams={{ userId: user?.id }}
        options={{ title: "Profile" }}
      />
    </Tab.Navigator>
  );
}

const AppNavigation: React.FC<{ user: any }> = ({ user }) => {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        {/* Auth and SignUp screens are always accessible */}
        <Stack.Screen
          name="Auth"
          component={Auth}
          options={{ title: "Login", headerShown: true }}
        />
        <Stack.Screen
          name="SignUp"
          component={SignUpScreen}
          options={{ title: "Sign Up" }}
        />
        {/* Main Tab Navigator */}
        <Stack.Screen
          name="Main"
          children={() => <TabNavigator user={user} />}
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="Profile"
          component={ProfileScreen}
          options={{ title: "Profile" }}
        />
        <Stack.Screen
          name="PrivacyScreen"
          component={PrivacyScreen}
          options={{ title: "Privacy Policy" }}
        />
        <Stack.Screen
          name="ChangePassword"
          component={ChangePassword}
          options={{ title: "Change Password" }}
        />
        <Stack.Screen
          name="DeleteScreen"
          component={DeleteScreen}
          options={{ title: "Delete your Account" }}
        />
        <Stack.Screen
          name="TransferScreen"
          component={TransferScreen}
          options={{ title: "Transfer" }}
        />
        <Stack.Screen
          name="SendScreen"
          component={SendScreen}
          options={{ title: "Send Money" }}
        />
        <Stack.Screen
          name="BillScreen"
          component={BillScreen}
          options={{ title: "Pay Bills" }}
        />
        
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;