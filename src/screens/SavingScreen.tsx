import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Input, Button } from 'react-native-elements';
import { supabase } from '../config/supabase';

const SavingScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { userId, from_account_id } = route.params; // Access userId and account_id from navigation params
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);
  const [savingsBalance, setSavingsBalance] = useState<number | null>(null); // State to store savings balance
  const [actionType, setActionType] = useState<'add_to_savings' | 'cash_in'>('add_to_savings'); // Toggle between actions

  useEffect(() => {
    const fetchAccountAndSavingsBalance = async () => {
      try {
        // Fetch the account_id from the Accounts table
        const { data: accountData, error: accountError } = await supabase
          .from('Accounts')
          .select('account_id')
          .eq('user_id', userId)
          .single();
  
        if (accountError || !accountData) {
          console.error('Error fetching account_id:', accountError);
          Alert.alert('Error', 'Failed to fetch account details.');
          return;
        }
  
        const accountId = accountData.account_id;
  
        // Fetch the savings balance using the fetched account_id
        const { data: savingsAccount, error: savingsError } = await supabase
          .from('Savings')
          .select('balance')
          .eq('account_id', accountId)
          .single();
  
        if (savingsError || !savingsAccount) {
          console.error('Error fetching savings balance:', savingsError);
          Alert.alert('Error', 'Failed to fetch savings balance.');
          return;
        }
  
        setSavingsBalance(savingsAccount.balance);
      } catch (error) {
        console.error('Unexpected error:', error);
        Alert.alert('Error', 'An unexpected error occurred.');
      }
    };
  
    fetchAccountAndSavingsBalance();
  }, [userId]);

  const handleAddToSavings = async () => {
  
    if (!amount) {
      Alert.alert('Missing Information', 'Please enter an amount.');
      return;
    }
  
    const amountToSave = parseFloat(amount);
    console.log('Parsed amountToSave:', amountToSave);
  
    if (isNaN(amountToSave) || amountToSave <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
  
    setLoading(true);
  
    try {
      console.log('Fetching main account...');
      const { data: mainAccount, error: mainAccountError } = await supabase
        .from('Accounts')
        .select('balance, account_id')
        .eq('user_id', userId)
        .single();
  
      console.log('Main account data:', mainAccount);
  
      if (mainAccountError || !mainAccount) {
        console.error('Error fetching main account:', mainAccountError);
        Alert.alert('Error', 'Could not retrieve main account.');
        setLoading(false);
        return;
      }
  
      const { balance, account_id } = mainAccount;
      console.log('Fetched balance:', balance, 'Fetched account_id:', account_id);
  
      if (balance < amountToSave) {
        Alert.alert('Insufficient Funds', 'Not enough balance to transfer to savings.');
        setLoading(false);
        return;
      }
  
      const newMainBalance = balance - amountToSave;
      const newSavingsBalance = (savingsBalance || 0) + amountToSave;
  
      console.log('Updating main account balance to:', newMainBalance);
      const { error: mainUpdateError } = await supabase
        .from('Accounts')
        .update({ balance: newMainBalance })
        .eq('account_id', account_id);
  
      if (mainUpdateError) {
        console.error('Error updating main account balance:', mainUpdateError);
        Alert.alert('Error', 'Failed to update main account balance.');
        setLoading(false);
        return;
      }
  
      console.log('Updating savings account balance to:', newSavingsBalance);
      const { error: savingsUpdateError } = await supabase
        .from('Savings')
        .update({ balance: newSavingsBalance, updated_at: new Date().toISOString() })
        .eq('account_id', account_id);
  
      if (savingsUpdateError) {
        console.error('Error updating savings account balance:', savingsUpdateError);
        Alert.alert('Error', 'Failed to update savings account balance.');
        setLoading(false);
        return;
      }
  
      console.log('Recording transaction...');
      await supabase.from('Transactions').insert([
        {
          from_account_id: account_id,
          to_account_id: account_id,
          amount: amountToSave,
          transaction_type: 'add_to_savings',
          created_at: new Date().toISOString(),
        },
      ]);
  
      console.log('Adding notification...');
      await supabase.from('Notifications').insert([
        {
          user_id: userId,
          message: `You added ₱${amountToSave.toFixed(2)} to your savings account on ${new Date().toISOString()}.`,
          created_at: new Date().toISOString(),
          type: 'add_to_savings',
          is_read: false,
        },
      ]);
  
      setSavingsBalance(newSavingsBalance);
      Alert.alert('Success', 'Money added to savings successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Unexpected Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCashIn = async () => {
    if (!amount) {
      Alert.alert('Missing Information', 'Please enter an amount.');
      return;
    }
  
    const amountToCashIn = parseFloat(amount);
    if (isNaN(amountToCashIn) || amountToCashIn <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }
  
    if ((savingsBalance || 0) < amountToCashIn) {
      Alert.alert('Insufficient Funds', 'Not enough balance in savings to cash in.');
      return;
    }
  
    setLoading(true);
  
    try {
      // Fetch the account_id dynamically
      const { data: accountData, error: accountError } = await supabase
        .from('Accounts')
        .select('account_id, balance') // Include 'balance' in the selected columns
        .eq('user_id', userId) // Use userId to fetch the account
        .single();
  
      console.log('Account data:', accountData); // Debugging the fetched data
  
      if (accountError || !accountData) {
        console.error('Error fetching account_id:', accountError);
        Alert.alert('Error', 'Could not retrieve account details.');
        setLoading(false);
        return;
      }
  
      const { balance: mainAccountBalance, account_id } = accountData;
      console.log('Fetched account_id:', account_id);
  
      const newSavingsBalance = (savingsBalance || 0) - amountToCashIn;
      const newMainAccountBalance = (mainAccountBalance || 0) + amountToCashIn;
  
      // Update the savings account balance
      const { error: savingsUpdateError } = await supabase
        .from('Savings')
        .update({ balance: newSavingsBalance, updated_at: new Date().toISOString() })
        .eq('account_id', account_id); // Use the fetched account_id
  
      if (savingsUpdateError) {
        console.error('Error updating savings balance:', savingsUpdateError);
        Alert.alert('Error', 'Failed to update savings account balance.');
        setLoading(false);
        return;
      }

      const { error: mainAccountUpdateError } = await supabase
      .from('Accounts')
      .update({ balance: newMainAccountBalance })
      .eq('account_id', account_id);

    if (mainAccountUpdateError) {
      console.error('Error updating main account balance:', mainAccountUpdateError);
      Alert.alert('Error', 'Failed to update main account balance.');
      setLoading(false);
      return;
    }
  
      // Record the transaction
      await supabase.from('Transactions').insert([
        {
          from_account_id: account_id,
          to_account_id: account_id,
          amount: amountToCashIn,
          transaction_type: 'cash_in',
          created_at: new Date().toISOString(),
        },
      ]);
  
      // Add a notification
      await supabase.from('Notifications').insert([
        {
          user_id: userId,
          message: `You cashed in ₱${amountToCashIn.toFixed(2)} from your savings account on ${new Date().toISOString()}.`,
          created_at: new Date().toISOString(),
          type: 'cash_in',
          is_read: false,
        },
      ]);
  
      setSavingsBalance(newSavingsBalance); // Update the displayed savings balance
      Alert.alert('Success', 'Money cashed in successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Unexpected Error', 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.wrapper}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Savings</Text>
        <Text style={styles.balance}>Savings Balance: ₱{savingsBalance?.toFixed(2) || '0.00'}</Text>

        <Input
          label="Amount"
          placeholder="₱0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          inputStyle={styles.input}
          containerStyle={styles.inputContainer}
        />

        <View style={styles.buttonContainer}>
          <Button
            title="Add to Savings"
            onPress={() => {
              handleAddToSavings();
            }}
            loading={loading}
            buttonStyle={styles.button}
          />
          <Button
            title="Cash In"
            onPress={() => {
              handleCashIn();
            }}
            loading={loading}
            buttonStyle={styles.button}
          />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: '#f1f6fc',
  },
  container: {
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#007aff',
    textAlign: 'center',
    marginBottom: 10,
  },
  balance: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  buttonContainer: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    backgroundColor: '#007aff',
    borderRadius: 8,
    paddingVertical: 12,
  },
});

export default SavingScreen;