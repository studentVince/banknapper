import React from 'react';
import {
  StyleSheet,
  View,
  Alert,
} from 'react-native';
import { Button } from 'react-native-elements';
import { supabase } from '../config/supabase'; 
import { User } from '@supabase/supabase-js';



export default function Home({ user, navigation }: { user: User; navigation: any }) {
  interface User {
    id: string;
  }
  
  async function signOut() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error signing out:', error);
      Alert.alert('Error signing out');
    } else {
      Alert.alert('Signed out successfully!');
      navigation.navigate('Auth');
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button title="Sign Out" onPress={signOut} type="clear" />
      </View>
      
      <View style={styles.inputContainer}>
    
      </View>
      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  task: {
    fontSize: 16,
  },
  completedTask: {
    fontSize: 16,
    textDecorationLine: 'line-through',
    color: 'gray',
  },
});