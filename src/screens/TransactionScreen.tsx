import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { supabase } from '../config/supabase';

const TransactionScreen = ({ route }: { route: any }) => {
  const { userId } = route.params; // Get the userId from route params
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('Notifications')
          .select('*')
          .eq('user_id', userId)
          .in('type', ['send_money', 'receive_money', 'bank_transfer']) // Filter for send_money and receive_money
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching notifications:', error);
          return;
        }

        setNotifications(data || []);
      } catch (error) {
        console.error('Unexpected error:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, [userId]);

  const renderNotification = ({ item }: { item: any }) => (
    <View style={styles.notificationItem}>
      <Text style={styles.message}>{item.message}</Text>
      <Text style={styles.timestamp}>{new Date(item.created_at).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <ActivityIndicator size="large" color="#007bff" />
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotification}
        />
      ) : (
        <Text style={styles.noNotifications}>No notifications available.</Text>
      )}
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
  notificationItem: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  message: {
    fontSize: 16,
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 5,
  },
  noNotifications: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default TransactionScreen;