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

    // Re-authenticate the user with the current password
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: (await supabase.auth.getUser()).data?.user?.email || '',
      password: currentPassword,
    });

    if (signInError) {
      Alert.alert('Error', 'Current password is incorrect.');
      setLoading(false);
      return;
    }

    // Update the user's password
    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      Alert.alert('Error', updateError.message);
    } else {
      Alert.alert('Success', 'Your password has been updated.');
      navigation.navigate('Profile'); // Navigate back to the Profile page
    }

    setLoading(false);
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