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
      navigation.navigate('Home'); // Navigate to the HomeScreen
    }
  
    setLoading(false);
    return { data, error };
  }

  return (
    <View style={styles.container}>
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
      <View style={styles.buttonContainer}>
        <Button
          title="Log In"
          disabled={loading}
          onPress={() => SignInWithEmail()}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button
          title="Sign Up"
          disabled={loading}
          onPress={() => navigation.navigate('SignUp')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
  },
  buttonContainer: {
    marginTop: 10,
  },
});