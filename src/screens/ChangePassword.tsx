import React, { useState } from 'react';
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

export default function ChangePassword({ navigation }: { navigation: any }) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); // New state for confirm password
  const [loading, setLoading] = useState(false);

  async function handleChangePassword() {
  if (newPassword !== confirmPassword) {
    Alert.alert('Error', 'New password and confirmation do not match.');
    return;
  }

  setLoading(true);

  try {
    // Fetch the user's session to get the current user
    const {
      data: { user },
      error: sessionError,
    } = await supabase.auth.getUser();

    if (sessionError || !user) {
      Alert.alert('Error', 'Unable to fetch user session. Please log in again.');
      setLoading(false);
      return;
    }

    // Update the password in Supabase's authentication system
    const { error: authError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (authError) {
      Alert.alert('Error', authError.message || 'Failed to update password in authentication system.');
      setLoading(false);
      return;
    }

    // Update the password in the Users table
    const { error: updateError } = await supabase
      .from('Users')
      .update({ password: newPassword }) // Update the password in your Users table
      .eq('user_id', user.id);

    if (updateError) {
      Alert.alert('Error', updateError.message || 'Failed to update password in the database.');
    } else {
      Alert.alert('Success', 'Your password has been updated.');
      navigation.navigate('Profile'); // Navigate back to the Profile page
    }
  } catch (error) {
    console.error('Unexpected error:', error);
    Alert.alert('Error', 'An unexpected error occurred.');
  } finally {
    setLoading(false);
  }
}

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Input
          label="Current Password"
          leftIcon={{ type: 'material', name: 'lock' }}
          onChangeText={(text) => setCurrentPassword(text)}
          value={currentPassword}
          secureTextEntry={true}
          placeholder="Enter your current password"
          autoCapitalize="none"
        />
        <Input
          label="New Password"
          leftIcon={{ type: 'material', name: 'lock' }}
          onChangeText={(text) => setNewPassword(text)}
          value={newPassword}
          secureTextEntry={true}
          placeholder="Enter your new password"
          autoCapitalize="none"
        />
        <Input
          label="Confirm New Password"
          leftIcon={{ type: 'material', name: 'lock' }}
          onChangeText={(text) => setConfirmPassword(text)}
          value={confirmPassword}
          secureTextEntry={true}
          placeholder="Re-enter your new password"
          autoCapitalize="none"
        />
        <View style={styles.buttonContainer}>
          <Button
            title="Change Password"
            disabled={loading}
            onPress={handleChangePassword}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Back to Profile"
            type="clear"
            onPress={() => navigation.navigate('Profile')}
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