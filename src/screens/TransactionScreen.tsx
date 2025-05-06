import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native';
import { supabase } from '../config/supabase';
import { Ionicons } from '@expo/vector-icons';

const TransactionScreen = ({ route }: { route: any }) => {
  const { userId } = route.params;
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const { data, error } = await supabase
          .from('Notifications')
          .select('*')
          .eq('user_id', userId)
          .in('type', ['send_money', 'receive_money', 'bank_transfer'])
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
    <View style={styles.notificationCard}>
      <Ionicons
        name={
          item.type === 'send_money'
            ? 'arrow-up-circle-outline'
            : item.type === 'receive_money'
            ? 'arrow-down-circle-outline'
            : 'card-outline'
        }
        size={24}
        color={item.type === 'send_money' ? '#ff4d4f' : '#52c41a'}
        style={{ marginRight: 10 }}
      />
      <View style={styles.textWrapper}>
        <Text style={styles.message}>{item.message}</Text>
        <Text style={styles.timestamp}>
          {new Date(item.created_at).toLocaleString()}
        </Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Transaction History</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007bff" style={{ marginTop: 20 }} />
      ) : notifications.length > 0 ? (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item.id.toString()}
          renderItem={renderNotification}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <Text style={styles.noNotifications}>No transactions found.</Text>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f4f6fc',
  },
  header: {
    fontSize: 24,
    fontWeight: '600',
    color: '#007aff',
    textAlign: 'center',
    marginVertical: 20,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  notificationCard: {
    backgroundColor: '#fff',
    flexDirection: 'row',
    padding: 16,
    marginVertical: 8,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
    alignItems: 'center',
  },
  textWrapper: {
    flex: 1,
  },
  message: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  timestamp: {
    fontSize: 12,
    color: '#888',
    marginTop: 4,
  },
  noNotifications: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 40,
  },
});

export default TransactionScreen;
