import React, { useState, useEffect } from "react";
import {
  View,
  StyleSheet,
  Alert,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { RouteProp } from "@react-navigation/native";
import { RootStackParamlist } from "../navigation/AppNavigation";
import { supabase } from "../config/supabase";
import { Ionicons } from "@expo/vector-icons";

type ProfileScreenRouteProp = RouteProp<RootStackParamlist, "Profile">;

type Props = {
  route: ProfileScreenRouteProp;
  navigation: any;
};

const ProfileScreen: React.FC<Props> = ({ route, navigation }) => {
  const userId = route?.params?.userId || "Unknown User";
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

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
        setUsername(data?.username || "No username");
        setEmail(data?.email || "No email");
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
      navigation.navigate("Auth");
    }
  }

  const MenuItem = ({
    title,
    icon,
    onPress,
  }: {
    title: string;
    icon: any;
    onPress: () => void;
  }) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress}>
      <Ionicons name={icon} size={20} color="#007aff" />
      <Text style={styles.menuText}>{title}</Text>
      <Ionicons name="chevron-forward" size={18} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>
      <View style={styles.profileCard}>
        <Ionicons name="person-circle" size={64} color="#007aff" />
        <Text style={styles.username}>
          {username || "Loading..."}
        </Text>
        <Text style={styles.email}>
          {email || "Loading..."}
        </Text>
      </View>

      {loading && <ActivityIndicator color="#007aff" style={{ marginTop: 10 }} />}

      <View style={styles.menuSection}>
        <MenuItem
          title="Privacy Policy"
          icon="document-text-outline"
          onPress={() => navigation.navigate("PrivacyScreen")}
        />
        <MenuItem
          title="Change Password"
          icon="key-outline"
          onPress={() => navigation.navigate("ChangePassword")}
        />
        <MenuItem
          title="Delete Account"
          icon="trash-outline"
          onPress={() => navigation.navigate("DeleteScreen")}
        />
        <MenuItem
          title="Log out"
          icon="log-out-outline"
          onPress={() => {
            setLoading(true);
            signOut().finally(() => setLoading(false));
          }}
        />
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f4f6fc",
  },
  profileCard: {
    alignItems: "center",
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 16,
    margin: 20,
    elevation: 3,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
  },
  username: {
    fontSize: 22,
    fontWeight: "600",
    color: "#333",
    marginTop: 10,
  },
  email: {
    fontSize: 16,
    color: "#555",
    marginTop: 4,
  },
  menuSection: {
    marginHorizontal: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    overflow: "hidden",
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  menuText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 12,
    color: "#333",
  },
});

export default ProfileScreen;
