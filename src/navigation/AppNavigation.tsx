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

export type RootStackParamlist = {
  Auth: undefined;
  SignUp: undefined;
  Home: undefined; // For the bottom tab navigator
  Profile: { userId: string };
  ChangePassword: undefined;
  DeleteScreen: undefined;
};

const Stack = createStackNavigator<RootStackParamlist>();
const Tab = createBottomTabNavigator();

function TabNavigator({ user }: { user: any }) {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName;

          if (route.name === "Home") {
            iconName = "home";
          } else if (route.name === "Profile") {
            iconName = "person";
          }

          return <Icon name={iconName} type="material" color={color} size={size} />;
        },
        tabBarActiveTintColor: "tomato",
        tabBarInactiveTintColor: "gray",
        headerShown: true,
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          title: "Home",
          headerLeft: () => null, // Remove the back button
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
        {/* Always include the Home route */}
        <Stack.Screen
          name="Home"
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
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigation;