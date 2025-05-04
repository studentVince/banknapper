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
        .select('balance, account_id')
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
      const { data: existingTransfer, error: fetchError } = await supabase
        .from('Banks')
        .select('*')
        .eq('bank_name', bankName)
        .eq('bank_account_number', bankAccountNumber)
        .single();

      if (fetchError) {
        Alert.alert('Error', 'Failed to check existing bank details.');
        setLoading(false);
        return;
      }

      if (existingTransfer) {
        // Update the existing transfer record
        const { error: updateError } = await supabase
          .from('Banks')
          .update({ amount: existingTransfer.amount + amountToSend })
          .eq('id', existingTransfer.id);

        if (updateError) {
          Alert.alert('Error', 'Failed to update the transfer record.');
          setLoading(false);
          return;
        }
      } else {
        // Insert a new transfer record
        const { error: insertError } = await supabase
          .from('Banks')
          .insert([
            {
              from_account_id: senderAccount.account_id,
              bank_name: bankName,
              bank_account_number: bankAccountNumber,
              amount: amountToSend,
              created_at: new Date().toISOString(),
            },
          ]);

        if (insertError) {
          Alert.alert('Error', 'Failed to record the transaction.');
          setLoading(false);
          return;
        }
      }

      const currentDate = new Date().toLocaleString();

      const { error: notificationError } = await supabase
        .from('Notifications')
        .insert([
          {
            user_id: userId,
            message: `You have successfully transferred $${amountToSend.toFixed(2)} to ${bankName} (Account: ${bankAccountNumber}) on ${currentDate}.`,
            created_at: new Date().toISOString(),
            type: 'bank_transfer',
            is_read: false,
          },
        ]);

      if (notificationError) {
        Alert.alert('Error', 'Failed to record the notification.');
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