import React, { useState, useEffect } from "react";
import { View, StyleSheet, Alert, Button, Text } from "react-native";
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
  const [email, setEmail] = useState<string | null>(null); // State to store the user's email
  const [username, setUsername] = useState<string | null>(null); // State to store the user's username

  // Fetch the user's email from the `Users` table
  useEffect(() => {
    if (!userId) {
      Alert.alert("Error", "Invalid user ID. Please log in again.");
      navigation.navigate("Auth");
      return;
    }
    
    const fetchUserDetails = async () => {
      const { data, error } = await supabase
        .from("Users")
        .select("username, email")
        .eq("user_id", userId)
        .single();

      if (error) {
        console.error("Error fetching user email:", error);
        Alert.alert("Error", "Failed to fetch user email.");
      } else {
        setUsername(data?.username || "No username found");
        setEmail(data?.email || "No email found");
      }
    };

    fetchUserDetails();
  }, [userId]);

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

    <View style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.header}>Welcome, {username}</Text>
        <Text style={styles.email}>{email}</Text>
      </View>
    
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
    width: "100%", // Ensure buttons take full width
    marginTop: 10,
  },
  headerContainer: {
    flex: 1,
    justifyContent: "flex-start",
    alignItems: "center",
    marginTop: 20,
    paddingHorizontal: 20,
  },
  email: {
    fontSize: 18,
    color: "#555555",
  },
});

export default ProfileScreen;