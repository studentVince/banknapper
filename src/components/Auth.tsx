import React, { useState } from 'react';
import { StyleSheet, View, Alert } from 'react-native';
import { Button, Input } from 'react-native-elements';
import { supabase } from '../config/supabase';

export default function Auth({ navigation }: { navigation: any }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function SignInWithEmail() {
    setLoading(true);
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email,
      password: password,
    });

    if (error) {
      Alert.alert('Error', error.message);
    } else {
      Alert.alert('Success', 'You are now logged in!');
      navigation.navigate('Main'); // Navigate to the HomeScreen
    }

    setLoading(false);
    return { data, error };
  }

  return (
    <View style={styles.container}>
      {/* Box around all input and buttons */}
      <View style={styles.boxContainer}>
        {/* Email input box */}
        <Input
          label="Email"
          leftIcon={{ type: 'material', name: 'email' }}
          onChangeText={(text) => setEmail(text)}
          value={email}
          placeholder="Enter your email"
          autoCapitalize="none"
          containerStyle={styles.inputContainer}
          inputStyle={styles.inputField}
        />

        {/* Password input box */}
        <Input
          label="Password"
          leftIcon={{ type: 'material', name: 'lock' }}
          onChangeText={(text) => setPassword(text)}
          value={password}
          secureTextEntry={true}
          placeholder="Enter your password"
          autoCapitalize="none"
          containerStyle={styles.inputContainer}
          inputStyle={styles.inputField}
        />

        {/* Log In button */}
        <View style={styles.buttonContainer}>
          <Button
            title={loading ? "Logging In..." : "Log In"}
            disabled={loading}
            onPress={() => SignInWithEmail()}
            buttonStyle={styles.buttonBox}
          />
        </View>

        {/* Sign Up button */}
        <View style={styles.buttonContainer}>
          <Button
            title="Sign Up"
            disabled={loading}
            onPress={() => navigation.navigate('SignUp')}
            buttonStyle={styles.buttonBox}
          />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    flex: 1,
    justifyContent: 'center',
  },
  boxContainer: {
    borderWidth: 4, 
    borderColor: '#007bff',  
    borderRadius: 20, 
    padding: 40,  
    backgroundColor: '#fff',  
  },
  inputContainer: {
    marginBottom: 15, 
  },
  inputField: {
    fontSize: 16, 
  },
  buttonContainer: {
    marginTop: 10, 
  },
  buttonBox: {
    borderWidth: 1, 
    borderColor: '#007bff',
    borderRadius: 5, 
    backgroundColor: '#007bff', 
  },
});
