import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { Button, Input } from "react-native-elements";
import { supabase } from "../config/supabase";

const DeleteScreen: React.FC<{ navigation: any }> = ({ navigation }) => {
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleDeleteAccount() {
    Alert.alert(
      "Confirm Deletion",
      "Are you sure you want to delete your account? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            setLoading(true);

            try {
              // Re-authenticate the user with the password
              const { data: user, error: signInError } =
                await supabase.auth.signInWithPassword({
                  email: (await supabase.auth.getUser()).data?.user?.email || "",
                  password: password,
                });

              if (signInError) {
                Alert.alert("Error", "Password is incorrect.");
                setLoading(false);
                return;
              }

              // Delete the user's account from the `auth.users` table
              const userId = user?.user?.id || "";
              const { error: deleteError } = await supabase.auth.admin.deleteUser(
                userId
              );
              const {} = await supabase
                .from("Users")
                .delete()
                .eq("user_id", userId);

              if (deleteError) {
                Alert.alert("Error", deleteError.message);
                setLoading(false);
                return;
              }

              // Sign out the user after deletion
              await supabase.auth.signOut();

              Alert.alert("Success", "Your account has been deleted.");
              navigation.navigate("Auth"); // Navigate back to the Auth screen
            } catch (error) {
              console.error("Error deleting account:", error);
              Alert.alert("Error", "An unexpected error occurred.");
            } finally {
              setLoading(false);
            }
          },
        },
      ]
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <View style={styles.content}>
        <Text style={styles.header}>Delete Your Account</Text>
        <Text style={styles.text}>
          Please confirm your password to delete your account. This action
          cannot be undone.
        </Text>
        <Input
          label="Password"
          leftIcon={{ type: "material", name: "lock" }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Enter your password"
          autoCapitalize="none"
        />
        <Button
          title="Delete Account"
          onPress={handleDeleteAccount}
          loading={loading}
          buttonStyle={styles.deleteButton}
        />
        <Button
          title="Cancel"
          type="clear"
          onPress={() => navigation.goBack()}
          buttonStyle={styles.cancelButton}
        />
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    padding: 20,
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333333",
    marginBottom: 20,
    textAlign: "center",
  },
  text: {
    fontSize: 16,
    color: "#555555",
    marginBottom: 20,
    textAlign: "center",
  },
  deleteButton: {
    backgroundColor: "red",
    marginTop: 10,
  },
  cancelButton: {
    marginTop: 10,
  },
});

export default DeleteScreen;