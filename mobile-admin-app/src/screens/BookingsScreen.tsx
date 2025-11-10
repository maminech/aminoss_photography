import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { bookingsAPI } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { format } from 'date-fns';

interface Booking {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  location: string;
  packageType?: string;
  status: string;
  message?: string;
  createdAt: string;
}

export default function BookingsScreen() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected

  const loadBookings = async () => {
    try {
      const data = await bookingsAPI.getAll();
      setBookings(data);
    } catch (error) {
      console.error('Failed to load bookings:', error);
      Alert.alert('Error', 'Failed to load bookings');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadBookings();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadBookings();
  };

  const handleApprove = async (booking: Booking) => {
    Alert.alert(
      'Approve Booking',
      `Approve booking request from ${booking.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          style: 'default',
          onPress: async () => {
            try {
              await bookingsAPI.approve(booking.id);
              Alert.alert('Success', 'Booking approved');
              loadBookings();
            } catch (error) {
              Alert.alert('Error', 'Failed to approve booking');
            }
          },
        },
      ]
    );
  };

  const handleReject = async (booking: Booking) => {
    Alert.alert(
      'Reject Booking',
      `Reject booking request from ${booking.name}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reject',
          style: 'destructive',
          onPress: async () => {
            try {
              await bookingsAPI.reject(booking.id, 'Rejected by admin');
              Alert.alert('Success', 'Booking rejected');
              loadBookings();
            } catch (error) {
              Alert.alert('Error', 'Failed to reject booking');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return COLORS.success;
      case 'rejected':
        return COLORS.error;
      case 'pending':
        return COLORS.warning;
      default:
        return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'approved':
        return 'checkmark-circle';
      case 'rejected':
        return 'close-circle';
      case 'pending':
        return 'time';
      default:
        return 'help-circle';
    }
  };

  const filteredBookings = bookings.filter((booking) => {
    if (filter === 'all') return true;
    return booking.status.toLowerCase() === filter;
  });

  const renderBookingCard = ({ item }: { item: Booking }) => {
    const statusColor = getStatusColor(item.status);
    const statusIcon = getStatusIcon(item.status);
    const isPending = item.status.toLowerCase() === 'pending';

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.clientInfo}>
            <Text style={styles.clientName}>{item.name}</Text>
            <Text style={styles.clientContact}>{item.email}</Text>
            <Text style={styles.clientContact}>{item.phone}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Ionicons name={statusIcon as any} size={16} color={statusColor} />
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.status.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Event Details */}
        <View style={styles.eventDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar" size={18} color={COLORS.primary} />
            <Text style={styles.detailLabel}>Event Date:</Text>
            <Text style={styles.detailValue}>
              {format(new Date(item.eventDate), 'MMM dd, yyyy')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="location" size={18} color={COLORS.primary} />
            <Text style={styles.detailLabel}>Location:</Text>
            <Text style={styles.detailValue}>{item.location}</Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="camera" size={18} color={COLORS.primary} />
            <Text style={styles.detailLabel}>Event Type:</Text>
            <Text style={styles.detailValue}>{item.eventType}</Text>
          </View>
          {item.packageType && (
            <View style={styles.detailRow}>
              <Ionicons name="cube" size={18} color={COLORS.primary} />
              <Text style={styles.detailLabel}>Package:</Text>
              <Text style={styles.detailValue}>{item.packageType}</Text>
            </View>
          )}
        </View>

        {/* Message */}
        {item.message && (
          <View style={styles.messageSection}>
            <Text style={styles.messageLabel}>Message:</Text>
            <Text style={styles.messageText}>{item.message}</Text>
          </View>
        )}

        {/* Request Date */}
        <View style={styles.requestDate}>
          <Text style={styles.requestDateText}>
            Requested on {format(new Date(item.createdAt), 'MMM dd, yyyy')}
          </Text>
        </View>

        {/* Actions */}
        {isPending && (
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={[styles.actionButton, styles.rejectButton]}
              onPress={() => handleReject(item)}
            >
              <Ionicons name="close-circle" size={20} color={COLORS.background} />
              <Text style={[styles.actionButtonText, { color: COLORS.background }]}>Reject</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.approveButton]}
              onPress={() => handleApprove(item)}
            >
              <Ionicons name="checkmark-circle" size={20} color={COLORS.background} />
              <Text style={[styles.actionButtonText, { color: COLORS.background }]}>Approve</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Filter Tabs */}
      <View style={styles.filterContainer}>
        {['all', 'pending', 'approved', 'rejected'].map((status) => (
          <TouchableOpacity
            key={status}
            style={[styles.filterTab, filter === status && styles.filterTabActive]}
            onPress={() => setFilter(status)}
          >
            <Text style={[styles.filterText, filter === status && styles.filterTextActive]}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Bookings List */}
      <FlatList
        data={filteredBookings}
        renderItem={renderBookingCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No bookings found</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterContainer: {
    flexDirection: 'row',
    padding: SIZES.padding,
    backgroundColor: COLORS.background,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTab: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: SIZES.radiusMd,
    marginHorizontal: 2,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: COLORS.background,
  },
  listContent: {
    padding: SIZES.padding,
  },
  card: {
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusLg,
    padding: 16,
    marginBottom: 12,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  clientInfo: {
    flex: 1,
  },
  clientName: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 4,
  },
  clientContact: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radiusMd,
    gap: 4,
  },
  statusText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
  },
  eventDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  detailLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 8,
    marginRight: 4,
  },
  detailValue: {
    fontSize: SIZES.sm,
    color: COLORS.text,
    fontWeight: '500',
    flex: 1,
  },
  messageSection: {
    backgroundColor: COLORS.surface,
    padding: 12,
    borderRadius: SIZES.radiusMd,
    marginBottom: 12,
  },
  messageLabel: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 6,
  },
  messageText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: 20,
  },
  requestDate: {
    marginBottom: 12,
  },
  requestDateText: {
    fontSize: SIZES.xs,
    color: COLORS.textLight,
    fontStyle: 'italic',
  },
  cardActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: SIZES.radiusMd,
    gap: 6,
  },
  approveButton: {
    backgroundColor: COLORS.success,
  },
  rejectButton: {
    backgroundColor: COLORS.error,
  },
  actionButtonText: {
    fontSize: SIZES.md,
    fontWeight: '600',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: SIZES.md,
    color: COLORS.textLight,
    marginTop: 12,
  },
});
