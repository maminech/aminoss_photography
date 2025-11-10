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
import { invoicesAPI } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  invoiceNumber: string;
  clientName: string;
  totalAmount: number;
  paidAmount: number;
  paymentStatus: string;
  eventType: string;
  issueDate: string;
  dueDate?: string;
}

export default function InvoicesScreen() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState('all'); // all, paid, unpaid, partial

  const loadInvoices = async () => {
    try {
      const data = await invoicesAPI.getAll();
      setInvoices(data);
    } catch (error) {
      console.error('Failed to load invoices:', error);
      Alert.alert('Error', 'Failed to load invoices');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadInvoices();
  };

  const handleMarkAsPaid = async (invoice: Invoice) => {
    Alert.alert(
      'Mark as Paid',
      `Mark invoice ${invoice.invoiceNumber} as fully paid?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Mark Paid',
          style: 'default',
          onPress: async () => {
            try {
              await invoicesAPI.markAsPaid(invoice.id);
              Alert.alert('Success', 'Invoice marked as paid');
              loadInvoices();
            } catch (error) {
              Alert.alert('Error', 'Failed to update invoice');
            }
          },
        },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return COLORS.paid;
      case 'unpaid':
        return COLORS.unpaid;
      case 'partial':
        return COLORS.partial;
      default:
        return COLORS.textSecondary;
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} TND`;
  };

  const filteredInvoices = invoices.filter((invoice) => {
    if (filter === 'all') return true;
    return invoice.paymentStatus.toLowerCase() === filter;
  });

  const renderInvoiceCard = ({ item }: { item: Invoice }) => {
    const statusColor = getStatusColor(item.paymentStatus);
    const isUnpaid = item.paymentStatus.toLowerCase() !== 'paid';

    return (
      <View style={styles.card}>
        {/* Header Row */}
        <View style={styles.cardHeader}>
          <View style={styles.invoiceInfo}>
            <Text style={styles.invoiceNumber}>{item.invoiceNumber}</Text>
            <Text style={styles.clientName}>{item.clientName}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusColor + '20' }]}>
            <Text style={[styles.statusText, { color: statusColor }]}>
              {item.paymentStatus.toUpperCase()}
            </Text>
          </View>
        </View>

        {/* Details */}
        <View style={styles.cardDetails}>
          <View style={styles.detailRow}>
            <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>
              {format(new Date(item.issueDate), 'MMM dd, yyyy')}
            </Text>
          </View>
          <View style={styles.detailRow}>
            <Ionicons name="briefcase-outline" size={16} color={COLORS.textSecondary} />
            <Text style={styles.detailText}>{item.eventType}</Text>
          </View>
        </View>

        {/* Amount Info */}
        <View style={styles.amountSection}>
          <View>
            <Text style={styles.amountLabel}>Total Amount</Text>
            <Text style={styles.amountValue}>{formatCurrency(item.totalAmount)}</Text>
          </View>
          {item.paidAmount > 0 && item.paidAmount < item.totalAmount && (
            <View>
              <Text style={styles.amountLabel}>Paid</Text>
              <Text style={[styles.amountValue, { color: COLORS.success }]}>
                {formatCurrency(item.paidAmount)}
              </Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={styles.cardActions}>
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="eye-outline" size={20} color={COLORS.info} />
            <Text style={[styles.actionButtonText, { color: COLORS.info }]}>View</Text>
          </TouchableOpacity>
          {isUnpaid && (
            <TouchableOpacity
              style={[styles.actionButton, styles.markPaidButton]}
              onPress={() => handleMarkAsPaid(item)}
            >
              <Ionicons name="checkmark-circle" size={20} color={COLORS.success} />
              <Text style={[styles.actionButtonText, { color: COLORS.success }]}>Mark Paid</Text>
            </TouchableOpacity>
          )}
        </View>
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
        {['all', 'paid', 'unpaid', 'partial'].map((status) => (
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

      {/* Invoices List */}
      <FlatList
        data={filteredInvoices}
        renderItem={renderInvoiceCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No invoices found</Text>
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
    paddingHorizontal: 12,
    borderRadius: SIZES.radiusMd,
    marginHorizontal: 4,
    alignItems: 'center',
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterText: {
    fontSize: SIZES.sm,
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
    ...SHADOWS.small,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  invoiceInfo: {
    flex: 1,
  },
  invoiceNumber: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
  },
  clientName: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: SIZES.radiusMd,
  },
  statusText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
  },
  cardDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  detailText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 8,
  },
  amountSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    marginBottom: 12,
  },
  amountLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textLight,
    marginBottom: 4,
  },
  amountValue: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  cardActions: {
    flexDirection: 'row',
    gap: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: SIZES.radiusMd,
    backgroundColor: COLORS.surface,
  },
  markPaidButton: {
    backgroundColor: COLORS.success + '15',
  },
  actionButtonText: {
    fontSize: SIZES.sm,
    fontWeight: '500',
    marginLeft: 6,
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
