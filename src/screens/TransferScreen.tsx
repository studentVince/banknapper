import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { supabase } from '../config/supabase';

const TransferScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { userId, from_account_id } = route.params; // Get userId and from_account_id from route params
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBankTransfer = async () => {
    if (!bankName || !bankAccountNumber || !amount) {
      Alert.alert('Error', 'Please fill in all fields.');
      return;
    }

    const amountToSend = parseFloat(amount);
    if (isNaN(amountToSend) || amountToSend <= 0) {
      Alert.alert('Error', 'Please enter a valid amount.');
      return;
    }

    setLoading(true);

    try {
      // Fetch sender's account balance
      const { data: senderAccount, error: senderError } = await supabase
        .from('Accounts')
        .select('balance')
        .eq('account_id', from_account_id)
        .single();

      if (senderError || !senderAccount) {
        Alert.alert('Error', 'Failed to fetch sender account details.');
        setLoading(false);
        return;
      }

      if (senderAccount.balance < amountToSend) {
        Alert.alert('Error', 'Insufficient balance.');
        setLoading(false);
        return;
      }

      // Deduct the amount from the sender's account
      const { error: deductError } = await supabase
        .from('Accounts')
        .update({ balance: senderAccount.balance - amountToSend })
        .eq('account_id', from_account_id);

      if (deductError) {
        Alert.alert('Error', 'Failed to deduct amount from sender account.');
        setLoading(false);
        return;
      }

      // Record the transaction in the Transactions table
      const { error: transactionError } = await supabase
        .from('Transactions')
        .insert([
          {
            from_account_id,
            to_bank_name: bankName,
            to_bank_account_number: bankAccountNumber,
            amount: amountToSend,
            transaction_type: 'Bank Transfer',
          },
        ]);

      if (transactionError) {
        Alert.alert('Error', 'Failed to record the transaction.');
        setLoading(false);
        return;
      }

      Alert.alert('Success', 'Money transferred successfully!', [
        { text: 'OK', onPress: () => navigation.goBack() },
      ]);
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Transfer to Bank</Text>
      <Input
        label="Bank Name"
        placeholder="Enter recipient's bank name"
        value={bankName}
        onChangeText={setBankName}
      />
      <Input
        label="Bank Account Number"
        placeholder="Enter recipient's bank account number"
        value={bankAccountNumber}
        onChangeText={setBankAccountNumber}
        keyboardType="numeric"
      />
      <Input
        label="Amount"
        placeholder="Enter amount to transfer"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Button
        title="Transfer"
        onPress={handleBankTransfer}
        loading={loading}
        buttonStyle={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#007bff',
    marginTop: 20,
  },
});

export default TransferScreen;