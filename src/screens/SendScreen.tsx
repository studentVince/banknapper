import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert } from 'react-native';
import { Input, Button } from 'react-native-elements';
import { supabase } from '../config/supabase';

const SendScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { userId, from_account_id } = route.params; // Get userId and from_account_id from route params
  const [recipientUsername, setRecipientUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMoney = async () => {
    if (!recipientUsername || !amount) {
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

      // Fetch recipient's account using the username
      const { data: recipientAccount, error: recipientError } = await supabase
        .from('Accounts')
        .select('account_id, balance, user_id')
        .eq('user_id', (await supabase.from('Users').select('user_id').eq('username', recipientUsername).single()).data?.user_id)
        .single();

      if (recipientError || !recipientAccount) {
        Alert.alert('Error', 'Recipient username not found.');
        setLoading(false);
        return;
      }

      // Perform the transfer
      const { error: deductError } = await supabase
        .from('Accounts')
        .update({ balance: senderAccount.balance - amountToSend })
        .eq('account_id', from_account_id);

      if (deductError) {
        Alert.alert('Error', 'Failed to deduct amount from sender account.');
        setLoading(false);
        return;
      }

      const { error: addError } = await supabase
        .from('Accounts')
        .update({ balance: recipientAccount.balance + amountToSend })
        .eq('account_id', recipientAccount.account_id);

      if (addError) {
        Alert.alert('Error', 'Failed to add amount to recipient account.');
        setLoading(false);
        return;
      }

      // Record the transaction in the Transactions table
      const { error: transactionError } = await supabase
        .from('Transactions')
        .insert([
          {
            from_account_id,
            to_account_id: recipientAccount.account_id,
            amount: amountToSend,
            transaction_type: 'send_money',
            created_at: new Date().toISOString(),
          },
        ]);

      if (transactionError) {
        Alert.alert('Error', 'Failed to record the transaction.');
        setLoading(false);
        return;
      }

      const currentDate = new Date().toLocaleString();

      const { error: senderNotificationError } = await supabase
      .from('Notifications')
      .insert([
        {
          user_id: userId,
          message: `You have successfully sent $${amountToSend.toFixed(2)} to ${recipientUsername} on ${currentDate}.`,
          created_at: new Date().toISOString(),
          type: 'send_money',
          is_read: false,
        },
      ]);

    if (senderNotificationError) {
      Alert.alert('Error', 'Failed to record the sender notification.');
      setLoading(false);
      return;
    }

    const { error: recipientNotificationError } = await supabase
      .from('Notifications')
      .insert([
        {
          user_id: recipientAccount.user_id,
          message: `You have received $${amountToSend.toFixed(2)} from ${userId}.`,
          created_at: new Date().toISOString(),
          type: 'receive_money',
          is_read: false,
        },
      ]);

    if (recipientNotificationError) {
      Alert.alert('Error', 'Failed to record the recipient notification.');
      setLoading(false);
      return;
    }

      Alert.alert('Success', 'Money sent successfully!', [
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
      <Text style={styles.title}>Send Money</Text>
      <Input
        label="Recipient Username"
        placeholder="Enter recipient username"
        value={recipientUsername}
        onChangeText={setRecipientUsername}
      />
      <Input
        label="Amount"
        placeholder="Enter amount to send"
        value={amount}
        onChangeText={setAmount}
        keyboardType="numeric"
      />
      <Button
        title="Send Money"
        onPress={handleSendMoney}
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

export default SendScreen;