import React, { useState } from 'react';
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

const CashInScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { userId, from_account_id } = route.params; // Access userId and account_id from navigation params
  const [amount, setAmount] = useState('');
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCashIn = async () => {
    const amountToCashIn = parseFloat(amount);

    if (!amount || isNaN(amountToCashIn) || amountToCashIn <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount to cash in.');
      return;
    }

    if (!bankName.trim()) {
      Alert.alert('Invalid Bank Name', 'Please enter a valid bank name.');
      return;
    }

    if (!bankAccountNumber.trim()) {
      Alert.alert('Invalid Bank Account Number', 'Please enter a valid bank account number.');
      return;
    }

    setLoading(true);

    try {

      // Fetch the current balance of the account
      const { data: accountData, error: accountError } = await supabase
        .from('Accounts')
        .select('balance')
        .eq('account_id', from_account_id)
        .single();

      if (accountError || !accountData) {
        Alert.alert('Error', 'Failed to fetch account details.');
        setLoading(false);
        return;
      }


      const { data: bankData, error: bankError } = await supabase
        .from('Banks')
        .select('balance')
        .eq('account_id', from_account_id)
        .single();

      if (bankError || !bankData) {
        Alert.alert('Error', 'Failed to fetch bank details.');
        setLoading(false);
        return;
      }

      const newBalance = accountData.balance + amountToCashIn;
      const newBankBalance = bankData.balance - amountToCashIn;

      // Update the account balance
      const { error: accountUpdateError } = await supabase
        .from('Accounts')
        .update({ balance: newBalance })
        .eq('account_id', from_account_id);

      if (accountUpdateError) {
        Alert.alert('Error', 'Failed to update account balance.');
        setLoading(false);
        return;
      }
      const { error: bankUpdateError } = await supabase
        .from('Banks')
        .update({ balance: newBankBalance })
        .eq('account_id', from_account_id);

      if (bankUpdateError) {
        Alert.alert('Error', 'Failed to update bannk balance.');
        setLoading(false);
        return;
      }

      // Record the cash-in transaction
      await supabase.from('Transactions').insert([
        {
          from_account_id,
          to_account_id: from_account_id,
          amount: amountToCashIn,
          transaction_type: 'cash_in',
          bank_name: bankName,
          bank_account_number: bankAccountNumber,
          created_at: new Date().toISOString(),
        },
      ]);

      Alert.alert('Success', `Successfully cashed in ₱${amountToCashIn.toFixed(2)}!`, [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);

      await supabase.from('Notifications').insert([
        {
          user_id: userId,
          title: 'Cash In Successful',
          message: `You have successfully cashed in ₱${amountToCashIn.toFixed(2)} from ${bankName}. Your updated balance in ${bankName} is ₱${newBankBalance.toFixed(2)}.`,
          created_at: new Date().toISOString(),
          is_read: false, // Mark the notification as unread
        },
      ]);
  
      Alert.alert(
        'Success',
        `Successfully cashed in ₱${amountToCashIn.toFixed(2)} to ${bankName}! Your updated balance is ₱${newBalance.toFixed(2)}.`,
        [{ text: 'OK', onPress: () => navigation.goBack() }]
      );

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
        <Text style={styles.title}>Cash In</Text>

        <Input
          label="Amount"
          placeholder="₱0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          inputStyle={styles.input}
          containerStyle={styles.inputContainer}
        />

        <Input
          label="Bank Name"
          placeholder="Enter bank name"
          value={bankName}
          onChangeText={setBankName}
          inputStyle={styles.input}
          containerStyle={styles.inputContainer}
        />

        <Input
          label="Bank Account Number"
          placeholder="Enter bank account number"
          value={bankAccountNumber}
          onChangeText={setBankAccountNumber}
          keyboardType="numeric"
          inputStyle={styles.input}
          containerStyle={styles.inputContainer}
        />

        <Button
          title="Cash In Now"
          onPress={handleCashIn}
          loading={loading}
          buttonStyle={styles.button}
        />
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
    marginBottom: 30,
  },
  input: {
    fontSize: 16,
    color: '#333',
  },
  inputContainer: {
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#007aff',
    borderRadius: 8,
    paddingVertical: 12,
  },
});

export default CashInScreen;