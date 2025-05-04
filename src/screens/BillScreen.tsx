import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { supabase } from '../config/supabase';

const BillScreen = ({ route }: { route: any }) => {
  const { from_account_id } = route.params; // Get the sender's account ID from route params
  const [billType, setBillType] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handlePayBill = async () => {
    if (!billType || !amount) {
      Alert.alert('Error', 'Please select a bill type and enter an amount.');
      return;
    }

    const amountToPay = parseFloat(amount);
    if (isNaN(amountToPay) || amountToPay <= 0) {
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
        Alert.alert('Error', 'Failed to fetch account details.');
        setLoading(false);
        return;
      }

      if (senderAccount.balance < amountToPay) {
        Alert.alert('Error', 'Insufficient balance.');
        setLoading(false);
        return;
      }

      // Deduct the amount from the sender's account
      const { error: deductError } = await supabase
        .from('Accounts')
        .update({ balance: senderAccount.balance - amountToPay })
        .eq('account_id', from_account_id);

      if (deductError) {
        Alert.alert('Error', 'Failed to deduct amount from account.');
        setLoading(false);
        return;
      }

      // Record the transaction in the Transactions table
      const { error: transactionError } = await supabase
        .from('Transactions')
        .insert([
          {
            from_account_id,
            to_bill_type: billType,
            amount: amountToPay,
            transaction_type: 'Bill Payment',
          },
        ]);

      if (transactionError) {
        Alert.alert('Error', 'Failed to record the transaction.');
        setLoading(false);
        return;
      }

      Alert.alert('Success', `Your ${billType} bill has been paid successfully!`);
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pay Bills</Text>
      <Input
        label="Bill Type"
        placeholder="Enter 'Water' or 'Electricity'"
        value={billType}
        onChangeText={setBillType}
      />
      <Input
        label="Amount"
        placeholder="Enter amount to pay"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Button
        title="Pay Bill"
        onPress={handlePayBill}
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

export default BillScreen;