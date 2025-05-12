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

const TransferScreen = ({ route, navigation }: { route: any; navigation: any }) => {
  const { userId, from_account_id } = route.params;
  const [bankName, setBankName] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [loading, setLoading] = useState(false);

  const handleBankTransfer = async () => {
  if (!bankName || !bankAccountNumber || !amount) {
    Alert.alert('Missing Info', 'Please fill in all fields.');
    return;
  }
  console.log("from_account_id:", from_account_id);

  // Validate bank account number length (e.g., must be 10 digits)
  if (bankAccountNumber.length !== 10) {
    Alert.alert('Invalid Bank Account Number', 'Bank account number must be exactly 10 digits.');
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
      .select('balance, account_id')
      .eq('account_id', from_account_id)
      .single();

    if (senderError || !senderAccount) {
      Alert.alert('Error', 'Unable to retrieve your account balance.');
      setLoading(false);
      return;
    }

    if (senderAccount.balance < amountToSend) {
      Alert.alert('Insufficient Funds', 'You do not have enough balance.');
      setLoading(false);
      return;
    }

    // Deduct amount
    const { error: deductError } = await supabase
      .from('Accounts')
      .update({ balance: senderAccount.balance - amountToSend })
      .eq('account_id', from_account_id);

    if (deductError) {
      Alert.alert('Error', 'Failed to deduct the amount.');
      setLoading(false);
      return;
    }

    // Insert or update transfer record
    const { data: existingTransfer, error: fetchError } = await supabase
      .from('Banks')
      .select('*')
      .eq('account_id', from_account_id)
      .eq('bank_name', bankName)
      .eq('bank_account_number', bankAccountNumber)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') {
      Alert.alert('Error', 'Problem checking bank account.');
      setLoading(false);
      return;
    }

    if (existingTransfer) {
      await supabase
        .from('Banks')
        .update({ balance: existingTransfer.amount + amountToSend })
        .eq('account_id', existingTransfer.account_id);
    } else {
      await supabase.from('Banks').insert([
        {
          account_id: senderAccount.account_id,
          bank_name: bankName,
          bank_account_number: bankAccountNumber,
          balance: amountToSend,
          created_at: new Date().toISOString(),
        },
      ]);
    }

    await supabase.from('Notifications').insert([
      {
        user_id: userId,
        message: `Transferred ₱${amountToSend.toFixed(2)} to ${bankName} (Acct: ${bankAccountNumber}).`,
        created_at: new Date().toISOString(),
        type: 'bank_transfer',
        is_read: false,
      },
    ]);

    Alert.alert('Transfer Successful', 'Your money has been sent.', [
      { text: 'OK', onPress: () => navigation.goBack() },
    ]);
  } catch (error) {
    console.error('Transfer error:', error);
    Alert.alert('Unexpected Error', 'Something went wrong.');
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
        <Text style={styles.title}>Bank Transfer</Text>

        <Input
          label="Bank Name"
          placeholder="e.g. BPI, BDO, Metrobank"
          value={bankName}
          onChangeText={setBankName}
          inputStyle={styles.input}
          containerStyle={styles.inputContainer}
        />
        <Input
          label="Bank Account Number"
          placeholder="Enter account number"
          value={bankAccountNumber}
          onChangeText={setBankAccountNumber}
          keyboardType="numeric"
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
          title="Transfer Now"
          onPress={handleBankTransfer}
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

export default TransferScreen;
