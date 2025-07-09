import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Pressable,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext'; // Adjust path as needed
import {
  fetchUnreadNotificationCount,
  fetchNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  clearAllNotifications,
} from '@/services/api'; // Import your API functions

interface Notification {
  _id: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  userId: string; // Assuming notifications are tied to a userId
  // Add other notification properties if they exist (e.g., type, link)
}

interface NotificationPopupProps {
  isVisible: boolean;
  onClose: () => void;
}

const NotificationPopup: React.FC<NotificationPopupProps> = ({ isVisible, onClose }) => {
  const { user, isLoading: authLoading } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch initial unread count
  const fetchInitialUnreadCount = useCallback(async () => {
    if (authLoading || !user?.id) {
      setUnreadCount(0);
      return;
    }
    try {
      const responseData = await fetchUnreadNotificationCount(user.id);
      if (responseData && typeof responseData.count === 'number') {
        setUnreadCount(responseData.count);
      } else {
        setUnreadCount(0);
      }
    } catch (err: any) {
      console.error("Error fetching initial unread count:", err.response?.data || err.message);
      setUnreadCount(0);
    }
  }, [authLoading, user]);

  // Fetch all notifications when popup opens or user changes
  const fetchAllNotifications = useCallback(async () => {
    if (authLoading || !user?.id) {
      setNotifications([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await fetchNotifications(user.id);
      if (Array.isArray(data)) {
        const sortedNotifications = data.sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        setNotifications(sortedNotifications);
      } else {
        console.error("Expected an array of notifications, but received non-array data:", data);
        setNotifications([]);
      }
    } catch (err: any) {
      console.error("Error fetching all notifications:", err.response?.data || err.message);
      setError("Failed to load notifications.");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, [authLoading, user]);

  useEffect(() => {
    if (isVisible) {
      fetchAllNotifications(); // Fetch all when modal becomes visible
      fetchInitialUnreadCount(); // Also refresh unread count
    }
  }, [isVisible, fetchAllNotifications, fetchInitialUnreadCount]);

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id);
      setNotifications((prev) =>
        prev.map((notif) => (notif._id === id ? { ...notif, isRead: true } : notif))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    } catch (err) {
      console.error(`Error marking notification ${id} as read:`, err);
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!user?.id) return;
    try {
      await markAllNotificationsAsRead(user.id);
      setNotifications((prev) => prev.map((notif) => ({ ...notif, isRead: true })));
      setUnreadCount(0);
    } catch (err) {
      console.error("Error marking all notifications as read:", err);
    }
  };

  const handleDeleteNotification = async (id: string) => {
    try {
      await deleteNotification(id);
      const deletedNotif = notifications.find(notif => notif._id === id);
      setNotifications((prev) => prev.filter((notif) => notif._id !== id));
      if (deletedNotif && !deletedNotif.isRead) {
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }
    } catch (err) {
      console.error(`Error deleting notification ${id}:`, err);
    }
  };

  const handleClearAllNotifications = async () => {
    if (!user?.id) return;
    try {
      await clearAllNotifications(user.id);
      setNotifications([]);
      setUnreadCount(0);
      onClose(); // Close the modal after clearing all
    } catch (err) {
      console.error("Error clearing all notifications:", err);
    }
  };

  const renderNotificationItem = ({ item: notif }: { item: Notification }) => (
    <View style={[styles.notificationItem, notif.isRead ? styles.readItem : styles.unreadItem]}>
      <View style={styles.notificationContent}>
        <Text style={styles.notificationMessage}>{notif.message}</Text>
        <Text style={styles.notificationTime}>{new Date(notif.createdAt).toLocaleString()}</Text>
      </View>
      <View style={styles.notificationActions}>
        {!notif.isRead && (
          <TouchableOpacity onPress={() => handleMarkAsRead(notif._id)} style={styles.actionButton}>
            <Ionicons name="checkmark-circle-outline" size={20} color="#007bff" />
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={() => handleDeleteNotification(notif._id)} style={styles.actionButton}>
          <Ionicons name="trash-outline" size={20} color="#dc3545" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <Pressable style={styles.modalOverlay} onPress={onClose}>
        <View style={styles.modalContent} onStartShouldSetResponder={(event) => true}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Notifications ({unreadCount} unread)</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
          </View>

          <View style={styles.controlButtons}>
            {notifications.length > 0 && (
              <TouchableOpacity onPress={handleClearAllNotifications} style={styles.controlButton}>
                <Text style={styles.controlButtonText}>Clear All</Text>
              </TouchableOpacity>
            )}
            {unreadCount > 0 && (
              <TouchableOpacity onPress={handleMarkAllAsRead} style={styles.controlButton}>
                <Text style={styles.controlButtonText}>Mark All as Read</Text>
              </TouchableOpacity>
            )}
          </View>

          {loading ? (
            <ActivityIndicator size="large" color="#007bff" style={styles.loadingIndicator} />
          ) : error ? (
            <Text style={styles.errorText}>{error}</Text>
          ) : notifications.length === 0 ? (
            <Text style={styles.emptyText}>No notifications to display.</Text>
          ) : (
            <FlatList
              data={notifications}
              renderItem={renderNotificationItem}
              keyExtractor={(item) => item._id}
              contentContainerStyle={styles.flatListContainer}
            />
          )}
        </View>
      </Pressable>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
  },
  modalContent: {
    width: '90%',
    maxHeight: '80%',
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 10,
    marginBottom: 10,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: 5,
  },
  controlButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
    gap: 10, // Space between buttons
  },
  controlButton: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 5,
    backgroundColor: '#e0e0e0',
  },
  controlButtonText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '500',
  },
  loadingIndicator: {
    marginTop: 20,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 20,
  },
  emptyText: {
    textAlign: 'center',
    color: '#666',
    marginTop: 20,
  },
  flatListContainer: {
    paddingBottom: 10, // Add some padding at the bottom of the list
  },
  notificationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  unreadItem: {
    backgroundColor: '#f8f8ff', // Light background for unread
  },
  readItem: {
    backgroundColor: '#fff', // White background for read
    opacity: 0.8, // Slightly dim read notifications
  },
  notificationContent: {
    flex: 1,
    marginRight: 10,
  },
  notificationMessage: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  notificationTime: {
    fontSize: 11,
    color: '#888',
    marginTop: 4,
  },
  notificationActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8, // Space between action buttons
  },
  actionButton: {
    padding: 5,
  },
});

export default NotificationPopup;
