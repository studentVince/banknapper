import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Alert,
  TouchableOpacity,
} from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { supabase } from '../config/supabase';

const BillScreen = ({ route }: { route: any }) => {
  const { from_account_id, userId } = route.params;

  interface Bill {
    id: number;
    bill_type: string;
    amount: number;
    due_date: string;
    is_paid: boolean;
    paid_at?: string;
  }

  const [selectedBill, setSelectedBill] = useState<Bill | null>(null);
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const { data: unpaidBills, error } = await supabase
          .from('bills')
          .select('*')
          .eq('user_id', userId)
          .eq('is_paid', false)
          .order('due_date', { ascending: true });

        if (error) {
          console.error('Error fetching bills:', error);
          return;
        }

        setBills(unpaidBills || []);
      } catch (error) {
        console.error('Unexpected error:', error);
      }
    };

    fetchBills();
  }, [userId]);

  const handlePayBill = async () => {
    if (!selectedBill) {
      Alert.alert('Error', 'Please select a bill to pay.');
      return;
    }

    const amountToPay = selectedBill.amount;
    setLoading(true);

    try {
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

      const { error: deductError } = await supabase
        .from('Accounts')
        .update({ balance: senderAccount.balance - amountToPay })
        .eq('account_id', from_account_id);

      if (deductError) {
        Alert.alert('Error', 'Failed to deduct amount.');
        setLoading(false);
        return;
      }

      const { error: transactionError } = await supabase
        .from('Transactions')
        .insert([
          {
            from_account_id,
            to_bill_type: selectedBill.bill_type,
            amount: amountToPay,
            transaction_type: 'Bill Payment',
          },
        ]);

      if (transactionError) {
        Alert.alert('Error', 'Failed to record transaction.');
        setLoading(false);
        return;
      }

      const { error: updateBillError } = await supabase
        .from('Bills')
        .update({
          is_paid: true,
          paid_at: new Date().toISOString(),
        })
        .eq('id', selectedBill.id);

      if (updateBillError) {
        Alert.alert('Error', 'Failed to update bill status.');
        setLoading(false);
        return;
      }

      const { error: notificationError } = await supabase
        .from('Notifications')
        .insert([
          {
            user_id: userId,
            message: `You paid your ${selectedBill.bill_type} bill of $${amountToPay.toFixed(
              2
            )} on ${new Date().toLocaleString()}.`,
            created_at: new Date().toISOString(),
            type: 'bill_payment',
            is_read: false,
          },
        ]);

      if (notificationError) {
        Alert.alert('Error', 'Failed to notify user.');
        setLoading(false);
        return;
      }

      Alert.alert(
        'Success',
        `Your ${selectedBill.bill_type} bill was paid successfully!`
      );
      setBills((prev) => prev.filter((b) => b.id !== selectedBill.id));
      setSelectedBill(null);
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const renderBillItem = ({ item }: { item: Bill }) => (
    <TouchableOpacity
      style={[
        styles.billItem,
        selectedBill?.id === item.id && styles.selectedBillItem,
      ]}
      onPress={() => setSelectedBill(item)}
    >
      <Icon
        name={item.bill_type === 'Electricity' ? 'bolt' : 'tint'}
        type="font-awesome"
        color={item.bill_type === 'Electricity' ? '#f1c40f' : '#3498db'}
        size={24}
      />
      <View style={styles.billDetails}>
        <Text style={styles.billType}>{item.bill_type}</Text>
        <Text style={styles.billAmount}>₱{item.amount.toFixed(2)}</Text>
        <Text style={styles.billDueDate}>Due: {item.due_date}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Bills</Text>
      <FlatList
        data={bills}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBillItem}
        ListEmptyComponent={
          <Text style={styles.noBills}>🎉 No unpaid bills!</Text>
        }
      />
      <Button
        title={
          selectedBill
            ? `Pay ₱${selectedBill.amount.toFixed(2)} - ${selectedBill.bill_type}`
            : 'Select a bill to pay'
        }
        onPress={handlePayBill}
        loading={loading}
        disabled={!selectedBill}
        buttonStyle={styles.button}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f1f6fc',
    padding: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: '700',
    color: '#007aff',
    marginBottom: 20,
    textAlign: 'center',
  },
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#fff',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  selectedBillItem: {
    backgroundColor: '#dff0ff',
    borderWidth: 1,
    borderColor: '#007aff',
  },
  billDetails: {
    marginLeft: 15,
  },
  billType: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  billAmount: {
    fontSize: 16,
    color: '#007aff',
    marginTop: 2,
  },
  billDueDate: {
    fontSize: 14,
    color: '#999',
    marginTop: 2,
  },
  noBills: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginVertical: 30,
  },
  button: {
    backgroundColor: '#007aff',
    borderRadius: 10,
    paddingVertical: 14,
    marginTop: 20,
  },
});

export default BillScreen;
