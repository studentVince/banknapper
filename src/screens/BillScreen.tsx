import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { Button, Icon } from 'react-native-elements';
import { supabase } from '../config/supabase';

const BillScreen = ({ route }: { route: any }) => {
  const { from_account_id, userId } = route.params; // Get the sender's account ID and userId from route params
  interface Bill {
    id: number;
    bill_type: string;
    amount: number;
    due_date: string;
    is_paid: boolean;
    paid_at?: string;
  }

  const [selectedBill, setSelectedBill] = useState<Bill | null>(null); // Store the selected bill
  const [loading, setLoading] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);

  useEffect(() => {
    const fetchBills = async () => {
      try {
        const { data: unpaidBills, error } = await supabase
          .from('bills')
          .select('*')
          .eq('user_id', userId)
          .eq('is_paid', false) // Fetch only unpaid bills
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
            to_bill_type: selectedBill.bill_type,
            amount: amountToPay,
            transaction_type: 'Bill Payment',
          },
        ]);

      if (transactionError) {
        Alert.alert('Error', 'Failed to record the transaction.');
        setLoading(false);
        return;
      }

      // Mark the bill as paid in the Bills table
      const { error: updateBillError } = await supabase
        .from('Bills')
        .update({ is_paid: true,
          paid_at: new Date().toISOString(),
         })
        .eq('id', selectedBill.id);

      if (updateBillError) {
        Alert.alert('Error', 'Failed to update the bill status.');
        setLoading(false);
        return;
      }

      const { error: notificationError } = await supabase
      .from('Notifications')
      .insert([
        {
          user_id: userId,
          message: `You have successfully paid your ${selectedBill.bill_type} bill of $${amountToPay.toFixed(
            2
          )} on ${new Date().toLocaleString()}.`,
          created_at: new Date().toISOString(),
          type: 'bill_payment',
          is_read: false,
        },
      ]);

    if (notificationError) {
      Alert.alert('Error', 'Failed to record the notification.');
      setLoading(false);
      return;
    }

      Alert.alert('Success', `Your ${selectedBill.bill_type} bill has been paid successfully!`);
      setSelectedBill(null); // Reset the selected bill
      setBills((prevBills) => prevBills.filter((bill) => bill.id !== selectedBill.id)); // Remove the paid bill from the list
    } catch (error) {
      console.error('Unexpected error:', error);
      Alert.alert('Error', 'An unexpected error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const renderBillItem = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={[
        styles.billItem,
        selectedBill?.id === item.id ? styles.selectedBillItem : null,
      ]}
      onPress={() => setSelectedBill(item)}
    >
      <Icon
        name={item.bill_type === 'Electricity' ? 'bolt' : 'water'}
        type="font-awesome-5"
        color={item.bill_type === 'Electricity' ? '#f39c12' : '#3498db'}
        size={24}
      />
      <View style={styles.billDetails}>
        <Text style={styles.billType}>{item.bill_type}</Text>
        <Text style={styles.billAmount}>Amount: ${item.amount.toFixed(2)}</Text>
        <Text style={styles.billDueDate}>Due Date: {item.due_date}</Text>
        {item.is_paid && item.paid_at && (
          <Text style={styles.billPaidAt}>Paid At: {new Date(item.paid_at).toLocaleString()}</Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Pay Bills</Text>
      <FlatList
        data={bills}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderBillItem}
        ListEmptyComponent={<Text style={styles.noBills}>No unpaid bills available.</Text>}
      />
      <Button
        title={selectedBill ? `Pay ${selectedBill.bill_type} Bill` : 'Select a Bill to Pay'}
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
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  billItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  selectedBillItem: {
    backgroundColor: '#e6f7ff',
  },
  billDetails: {
    marginLeft: 15,
  },
  billType: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  billAmount: {
    fontSize: 16,
    color: '#333',
  },
  billDueDate: {
    fontSize: 14,
    color: '#888',
  },
  noBills: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
  billPaidAt: {
  fontSize: 14,
  color: '#28a745', // Green color for paid bills
  marginTop: 5,
},
  button: {
    backgroundColor: '#007bff',
    marginTop: 20,
  },
});

export default BillScreen;