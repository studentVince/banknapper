import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Button, Input } from 'react-native-elements';
import { supabase } from '../config/supabase';

export default function SignUpScreen({ navigation }: { navigation: any }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [accountType, setAccountType] = useState('');
  const [balance, setBalance] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSignUp() {
    setLoading(true);
  
    try {
      // Check if the email already exists in the `auth.users` table
      const { data: existingUser, error: checkError } = await supabase
        .from("Users")
        .select("email, username")
        .or(`email.eq.${email},username.eq.${username}`)
        .single();
  
      if (checkError && checkError.code !== "PGRST116") {
        // Handle unexpected errors (e.g., database issues)
        Alert.alert("Error", "An unexpected error occurred while checking user existence.");
        setLoading(false);
        return;
      }
  
      if (existingUser) {
        if (existingUser.email === email) {
          Alert.alert("Error", "A user with this email already exists.");
        } else if (existingUser.username === username) {
          Alert.alert("Error", "A user with this username already exists.");
        }
        setLoading(false);
        return;
      }
      // Sign up the user with email and password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
      });
  
      if (authError) {
        Alert.alert("Error", authError.message);
        setLoading(false);
        return;
      }

      const { data: subscription } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user?.email_confirmed_at) {
          const userId = session?.user?.id; // Safely access session.user.id
  
          if (!userId) {
            Alert.alert("Error", "Failed to retrieve user ID.");
            setLoading(false);
            return;
          }

      // Insert into the `users` table
      const { error: userError } = await supabase
        .from("Users")
        .insert([{ user_id: userId, username: username, email: email, password: password }]);
  
      if (userError) {
        Alert.alert("Error", userError.message);
        setLoading(false);
        return;
      }
  
      // Insert into the `accounts` table
      const { error: accountError, data: accountData } = await supabase
        .from("Accounts")
        .insert([{ user_id: userId, account_type: "Checking", balance: balance }])
        .select("account_id") // Fetch the account_id after insertion
        .single();

      if (accountError || !accountData) {
        Alert.alert("Error", accountError?.message || "Failed to create account.");
        setLoading(false);
        return;
      }

      const { account_id } = accountData; // Extract the account_id

// Insert into the `Savings` table
      const { error: savingsError } = await supabase
        .from("Savings")
        .insert([{ account_id: account_id, balance: 0 }]); // Initialize savings balance to 0

      if (savingsError) {
        Alert.alert("Error", savingsError.message || "Failed to create savings account.");
        setLoading(false);
        return;
      }
        Alert.alert(
          "Success",
          "Your account has been created, and you are now logged in.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Home"), // Navigate to the Home screen
            },
          ]
        );

        subscription?.subscription?.unsubscribe();
      } else {
        Alert.alert(
          "Check your email",
          "A confirmation link has been sent to your email. Please confirm to complete the registration.",
          [
            {
              text: "OK",
              onPress: () => navigation.navigate("Auth"), // Navigate back to the login page
            },
          ]
        );
      }
    });
  
    } catch (error) {
      console.error("Error during sign-up:", error);
      Alert.alert("Error", "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'} // Adjust for iOS and Android
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Input
          label="Username"
          leftIcon={{ type: 'material', name: 'person' }}
          onChangeText={(text) => setUsername(text)}
          value={username}
          placeholder="Enter your username"
          autoCapitalize="none"
        />
        <Input
          label="Email"
          leftIcon={{ type: 'material', name: 'email' }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="email@address.com"
          autoCapitalize="none"
        />
        <Input
          label="Password"
          leftIcon={{ type: 'material', name: 'lock' }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Password"
          autoCapitalize="none"
        />
        <Input
          label="Balance"
          leftIcon={{ type: 'material', name: 'account-balance' }}
          onChangeText={(text) => setBalance(text)}
          value={balance}
          placeholder="Enter initial balance"
          autoCapitalize="none"
          keyboardType="numeric" // Ensure numeric input for balance
        />
        <View style={styles.buttonContainer}>
          <Button
            title="Sign Up"
            disabled={loading}
            onPress={handleSignUp}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Back to Login"
            type="clear"
            onPress={() => navigation.navigate('Auth')}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  buttonContainer: {
    marginTop: 10,
  },
});