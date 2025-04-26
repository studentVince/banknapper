import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Alert,
  Text,
} from 'react-native';
import { Button } from 'react-native-elements';
import { supabase } from '../config/supabase';
import { User } from '@supabase/supabase-js';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamlist } from '../navigation/AppNavigation';

type HomeScreenRouteProp = RouteProp<RootStackParamlist, 'TabHome'>;

type Props = {
  route: HomeScreenRouteProp;
  navigation: any;
};

const HomeScreen: React.FC<Props> = ({ route, navigation }) => {
  const userId = route?.params?.userId || null; // Get userId from route params
  const [balance, setBalance] = useState<number | null>(null); // State to store the user's balance
  const [loading, setLoading] = useState(false); // State to manage loading

  // Fetch the user's balance from the `Accounts` table
  useEffect(() => {
    if (!userId) {
      Alert.alert('Error', 'Invalid user ID. Please log in again.');
      navigation.navigate('Auth'); // Redirect to the Auth screen
      return;
    }

    const fetchBalance = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('Accounts')
          .select('balance')
          .eq('user_id', userId)
          .single();

        if (error) {
          console.error('Error fetching balance:', error);
          Alert.alert('Error', 'Failed to fetch balance.');
        } else {
          setBalance(data?.balance || 0); // Set balance or default to 0
        }
      } catch (error) {
        console.error('Unexpected error:', error);
        Alert.alert('Error', 'An unexpected error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, [userId, navigation]);


  return (
    <View style={styles.container}>

      <View style={styles.balanceContainer}>
        <Text style={styles.balanceText}>
          {loading ? 'Loading...' : `Balance: $${balance?.toFixed(2)}`}
        </Text>
      </View>
    </View>
  );
};

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
  balanceContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  balanceText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
});

export default HomeScreen;