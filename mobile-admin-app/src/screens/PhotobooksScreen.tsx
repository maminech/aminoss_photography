import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SIZES, LAYOUT, SHADOWS } from '../constants/theme';
import { photobooksAPI } from '../services/api';

interface Photobook {
  id: string;
  clientName: string;
  clientEmail: string;
  phone: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  pages: number;
  price: number;
  notes?: string;
  createdAt: string;
}

type FilterStatus = 'all' | 'pending' | 'processing' | 'completed' | 'cancelled';

const PhotobooksScreen = () => {
  const [photobooks, setPhotobooks] = useState<Photobook[]>([]);
  const [filteredPhotobooks, setFilteredPhotobooks] = useState<Photobook[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeFilter, setActiveFilter] = useState<FilterStatus>('all');

  useEffect(() => {
    loadPhotobooks();
  }, []);

  useEffect(() => {
    filterPhotobooks();
  }, [photobooks, activeFilter]);

  const loadPhotobooks = async () => {
    try {
      const data = await photobooksAPI.getAll();
      setPhotobooks(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to load photobooks');
      console.error(error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPhotobooks();
  };

  const filterPhotobooks = () => {
    if (activeFilter === 'all') {
      setFilteredPhotobooks(photobooks);
    } else {
      setFilteredPhotobooks(photobooks.filter((pb) => pb.status === activeFilter));
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      await photobooksAPI.updateStatus(id, newStatus);
      Alert.alert('Success', `Photobook status updated to ${newStatus}`);
      loadPhotobooks();
    } catch (error) {
      Alert.alert('Error', 'Failed to update status');
      console.error(error);
    }
  };

  const handleStatusChange = (photobook: Photobook) => {
    const statusOptions = ['pending', 'processing', 'completed', 'cancelled'];
    Alert.alert(
      'Update Status',
      `Current status: ${photobook.status}`,
      statusOptions.map((status) => ({
        text: status.charAt(0).toUpperCase() + status.slice(1),
        onPress: () => updateStatus(photobook.id, status),
      })).concat([{ text: 'Cancel', onPress: () => {} }] as any)
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return COLORS.success;
      case 'processing': return COLORS.info;
      case 'pending': return COLORS.warning;
      case 'cancelled': return COLORS.error;
      default: return COLORS.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return 'checkmark-circle';
      case 'processing': return 'refresh-circle';
      case 'pending': return 'time';
      case 'cancelled': return 'close-circle';
      default: return 'help-circle';
    }
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} TND`;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderFilterTab = (filter: FilterStatus, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterTab,
        activeFilter === filter && styles.filterTabActive,
      ]}
      onPress={() => setActiveFilter(filter)}
    >
      <Text
        style={[
          styles.filterTabText,
          activeFilter === filter && styles.filterTabTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderPhotobookCard = ({ item }: { item: Photobook }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.cardHeaderLeft}>
          <Ionicons name="book" size={24} color={COLORS.primary} />
          <Text style={styles.clientName}>{item.clientName}</Text>
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: `${getStatusColor(item.status)}20` }]}
        >
          <Ionicons
            name={getStatusIcon(item.status) as any}
            size={14}
            color={getStatusColor(item.status)}
          />
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.cardBody}>
        <View style={styles.infoRow}>
          <Ionicons name="mail-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{item.clientEmail}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="call-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{item.phone}</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="document-text-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>{item.pages} pages</Text>
        </View>
        <View style={styles.infoRow}>
          <Ionicons name="calendar-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.infoText}>Ordered: {formatDate(item.createdAt)}</Text>
        </View>
        {item.notes && (
          <View style={styles.notesContainer}>
            <Text style={styles.notesLabel}>Notes:</Text>
            <Text style={styles.notesText}>{item.notes}</Text>
          </View>
        )}
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.priceText}>{formatCurrency(item.price)}</Text>
        <TouchableOpacity
          style={styles.updateButton}
          onPress={() => handleStatusChange(item)}
        >
          <Text style={styles.updateButtonText}>Update Status</Text>
          <Ionicons name="chevron-forward" size={16} color={COLORS.primary} />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading photobooks...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.filterContainer}>
        {renderFilterTab('all', 'All')}
        {renderFilterTab('pending', 'Pending')}
        {renderFilterTab('processing', 'Processing')}
        {renderFilterTab('completed', 'Completed')}
      </View>

      <FlatList
        data={filteredPhotobooks}
        renderItem={renderPhotobookCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[COLORS.primary]}
          />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="book-outline" size={64} color={COLORS.textLight} />
            <Text style={styles.emptyText}>No photobook orders found</Text>
            <Text style={styles.emptySubtext}>
              {activeFilter !== 'all'
                ? `No ${activeFilter} orders`
                : 'Orders will appear here'}
            </Text>
          </View>
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  loadingText: {
    marginTop: SIZES.padding,
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  filterContainer: {
    flexDirection: 'row',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.paddingSm,
    backgroundColor: COLORS.surface,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  filterTab: {
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.paddingSm,
    marginRight: SIZES.paddingSm,
    borderRadius: SIZES.radiusMd,
  },
  filterTabActive: {
    backgroundColor: COLORS.primary,
  },
  filterTabText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.textSecondary,
  },
  filterTabTextActive: {
    color: COLORS.textDark,
  },
  listContent: {
    padding: SIZES.padding,
  },
  card: {
    backgroundColor: COLORS.surface,
    borderRadius: SIZES.radiusLg,
    padding: SIZES.padding,
    marginBottom: SIZES.padding,
    ...SHADOWS.medium,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.padding,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  clientName: {
    fontSize: SIZES.lg,
    fontWeight: '700',
    color: COLORS.text,
    marginLeft: SIZES.paddingSm,
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.paddingSm,
    paddingVertical: 4,
    borderRadius: SIZES.radiusFull,
  },
  statusText: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  cardBody: {
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SIZES.paddingSm,
    marginBottom: SIZES.paddingSm,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.marginSm,
  },
  infoText: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: SIZES.paddingSm,
  },
  notesContainer: {
    marginTop: SIZES.paddingSm,
    padding: SIZES.paddingSm,
    backgroundColor: `${COLORS.primary}10`,
    borderRadius: SIZES.radiusMd,
  },
  notesLabel: {
    fontSize: SIZES.xs,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: 4,
  },
  notesText: {
    fontSize: SIZES.sm,
    color: COLORS.text,
    fontStyle: 'italic',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SIZES.paddingSm,
  },
  priceText: {
    fontSize: SIZES.xl,
    fontWeight: '700',
    color: COLORS.primary,
  },
  updateButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SIZES.padding,
    paddingVertical: SIZES.paddingSm,
    backgroundColor: `${COLORS.primary}15`,
    borderRadius: SIZES.radiusMd,
  },
  updateButtonText: {
    fontSize: SIZES.sm,
    fontWeight: '600',
    color: COLORS.primary,
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SIZES.xxxl,
  },
  emptyText: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SIZES.padding,
  },
  emptySubtext: {
    fontSize: SIZES.sm,
    color: COLORS.textLight,
    marginTop: 4,
  },
});

export default PhotobooksScreen;
