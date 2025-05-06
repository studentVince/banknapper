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

const SendScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { userId, from_account_id } = route.params;
  const [recipientUsername, setRecipientUsername] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSendMoney = async () => {
    if (!recipientUsername || !amount) {
      Alert.alert('Missing Information', 'Please fill in all fields.');
      return;
    }

    const amountToSend = parseFloat(amount);
    if (isNaN(amountToSend) || amountToSend <= 0) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount.');
      return;
    }

    setLoading(true);

    try {
      const { data: senderAccount, error: senderError } = await supabase
        .from('Accounts')
        .select('balance')
        .eq('account_id', from_account_id)
        .single();

      if (senderError || !senderAccount) {
        Alert.alert('Error', 'Could not retrieve sender account.');
        setLoading(false);
        return;
      }

      if (senderAccount.balance < amountToSend) {
        Alert.alert('Insufficient Funds', 'Not enough balance to complete this transfer.');
        setLoading(false);
        return;
      }

      const { data: userData, error: userError } = await supabase
        .from('Users')
        .select('user_id')
        .eq('username', recipientUsername)
        .single();

      if (userError || !userData) {
        Alert.alert('User Not Found', 'Recipient username does not exist.');
        setLoading(false);
        return;
      }

      const { data: recipientAccount, error: recipientError } = await supabase
        .from('Accounts')
        .select('account_id, balance, user_id')
        .eq('user_id', userData.user_id)
        .single();

      if (recipientError || !recipientAccount) {
        Alert.alert('Error', 'Recipient account not found.');
        setLoading(false);
        return;
      }

      // Transfer funds
      await supabase
        .from('Accounts')
        .update({ balance: senderAccount.balance - amountToSend })
        .eq('account_id', from_account_id);

      await supabase
        .from('Accounts')
        .update({ balance: recipientAccount.balance + amountToSend })
        .eq('account_id', recipientAccount.account_id);

      // Record transaction
      await supabase.from('Transactions').insert([
        {
          from_account_id,
          to_account_id: recipientAccount.account_id,
          amount: amountToSend,
          transaction_type: 'send_money',
          created_at: new Date().toISOString(),
        },
      ]);

      const timestamp = new Date().toLocaleString();

      // Notifications
      await supabase.from('Notifications').insert([
        {
          user_id: userId,
          message: `You sent ₱${amountToSend.toFixed(2)} to ${recipientUsername} on ${timestamp}.`,
          created_at: new Date().toISOString(),
          type: 'send_money',
          is_read: false,
        },
        {
          user_id: recipientAccount.user_id,
          message: `You received ₱${amountToSend.toFixed(2)} from ${userId}.`,
          created_at: new Date().toISOString(),
          type: 'receive_money',
          is_read: false,
        },
      ]);

      Alert.alert('Success', 'Money sent successfully!', [
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
        <Text style={styles.title}>Send Money</Text>

        <Input
          label="Recipient Username"
          placeholder="e.g. juan123"
          value={recipientUsername}
          onChangeText={setRecipientUsername}
          inputStyle={styles.input}
          containerStyle={styles.inputContainer}
        />
        <Input
          label="Amount"
          placeholder="₱0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="numeric"
          inputStyle={styles.input}
          containerStyle={styles.inputContainer}
        />

        <Button
          title="Send Now"
          onPress={handleSendMoney}
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

export default SendScreen;
