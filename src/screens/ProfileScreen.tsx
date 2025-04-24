import React, { useState } from "react";
import { View, StyleSheet, Alert, Button } from "react-native";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamlist } from "../navigation/AppNavigation";
import { supabase } from "../config/supabase";

type ProfileScreenRouteProp = RouteProp<RootStackParamlist, "Profile">;

type Props = {
  route: ProfileScreenRouteProp;
  navigation: any;
};

const ProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const userId = route?.params?.userId || "Unknown User"; // Fallback to "Unknown User" if userId is undefined
  const [loading, setLoading] = useState(false); // State to manage loading

  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
      Alert.alert("Error signing out");
    } else {
      Alert.alert("Signed out successfully!");
      navigation.navigate("Auth"); // Navigate to the Auth screen
    }
  }

  return (
    
    <View style={styles.buttonContainer}>
        <Button
          title="Privacy Policy"
          onPress={() => {
            setLoading(true);
            navigation.navigate("PrivacyScreen");
          }}
        />
        <Button
          title="Change Password"
          onPress={() => {
            setLoading(true);
            navigation.navigate("ChangePassword");
          }}
        />
        <Button
          title="Delete Account"
          onPress={() => {
            setLoading(true);
            navigation.navigate("DeleteScreen");
          }}
        />
        <Button
          title="Log out"
          onPress={() => {
            setLoading(true);
            signOut().finally(() => setLoading(false));
          }}
        />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f5f5", // Light background for a clean look
  },
  header: {
    fontSize: 36,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 20,
  },
  text: {
    fontSize: 18,
    color: "#555555",
    marginBottom: 30,
  },
  buttonContainer: {
    marginTop: 10,

  },
});

export default ProfileScreen;