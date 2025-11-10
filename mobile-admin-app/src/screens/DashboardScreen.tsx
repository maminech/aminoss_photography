import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { dashboardAPI } from '../services/api';
import { COLORS, SIZES, SHADOWS } from '../constants/theme';
import { useAuth } from '../contexts/AuthContext';

interface Stats {
  totalPhotos: number;
  totalVideos: number;
  totalClients: number;
  totalBookings: number;
  totalRevenue: number;
  unpaidInvoices: number;
  monthlyExpenses: number;
  profit: number;
  unreadMessages: number;
}

export default function DashboardScreen() {
  const navigation = useNavigation();
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadStats = async () => {
    try {
      const data = await dashboardAPI.getStats();
      setStats(data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    loadStats();
  };

  const formatCurrency = (amount: number) => {
    return `${amount.toLocaleString()} TND`;
  };

  const quickActions = [
    { icon: 'receipt-outline', label: 'Invoices', color: COLORS.info, screen: 'Invoices' },
    { icon: 'calendar-outline', label: 'Bookings', color: COLORS.success, screen: 'Bookings' },
    { icon: 'book-outline', label: 'Photobooks', color: COLORS.secondary, screen: 'Photobooks' },
    { icon: 'images-outline', label: 'Photos', color: COLORS.accent, screen: 'Photos' },
    { icon: 'people-outline', label: 'Clients', color: COLORS.primary, screen: 'Clients' },
    { icon: 'cash-outline', label: 'Expenses', color: COLORS.error, screen: 'Expenses' },
    { icon: 'mail-outline', label: 'Messages', color: COLORS.info, screen: 'Messages' },
    { icon: 'settings-outline', label: 'Settings', color: COLORS.textSecondary, screen: 'Settings' },
  ];

  if (loading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Welcome back,</Text>
          <Text style={styles.userName}>{user?.name || 'Admin'}</Text>
        </View>
        <TouchableOpacity style={styles.notificationButton}>
          <Ionicons name="notifications-outline" size={24} color={COLORS.text} />
          {stats && stats.unreadMessages > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{stats.unreadMessages}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Financial Stats Cards */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Financial Overview</Text>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: COLORS.success + '15' }]}>
            <Ionicons name="trending-up" size={32} color={COLORS.success} />
            <Text style={styles.statValue}>{formatCurrency(stats?.totalRevenue || 0)}</Text>
            <Text style={styles.statLabel}>Total Revenue</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.error + '15' }]}>
            <Ionicons name="trending-down" size={32} color={COLORS.error} />
            <Text style={styles.statValue}>{formatCurrency(stats?.monthlyExpenses || 0)}</Text>
            <Text style={styles.statLabel}>Expenses</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={[styles.statCard, { backgroundColor: COLORS.primary + '15' }]}>
            <Ionicons name="wallet-outline" size={32} color={COLORS.primary} />
            <Text style={styles.statValue}>{formatCurrency(stats?.profit || 0)}</Text>
            <Text style={styles.statLabel}>Net Profit</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: COLORS.warning + '15' }]}>
            <Ionicons name="alert-circle-outline" size={32} color={COLORS.warning} />
            <Text style={styles.statValue}>{stats?.unpaidInvoices || 0}</Text>
            <Text style={styles.statLabel}>Unpaid Invoices</Text>
          </View>
        </View>
      </View>

      {/* Business Stats */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Business Statistics</Text>
        <View style={styles.miniStatsRow}>
          <View style={styles.miniStatCard}>
            <Ionicons name="images" size={24} color={COLORS.info} />
            <Text style={styles.miniStatValue}>{stats?.totalPhotos || 0}</Text>
            <Text style={styles.miniStatLabel}>Photos</Text>
          </View>
          <View style={styles.miniStatCard}>
            <Ionicons name="videocam" size={24} color={COLORS.secondary} />
            <Text style={styles.miniStatValue}>{stats?.totalVideos || 0}</Text>
            <Text style={styles.miniStatLabel}>Videos</Text>
          </View>
          <View style={styles.miniStatCard}>
            <Ionicons name="people" size={24} color={COLORS.success} />
            <Text style={styles.miniStatValue}>{stats?.totalClients || 0}</Text>
            <Text style={styles.miniStatLabel}>Clients</Text>
          </View>
          <View style={styles.miniStatCard}>
            <Ionicons name="calendar" size={24} color={COLORS.accent} />
            <Text style={styles.miniStatValue}>{stats?.totalBookings || 0}</Text>
            <Text style={styles.miniStatLabel}>Bookings</Text>
          </View>
        </View>
      </View>

      {/* Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>
        <View style={styles.actionsGrid}>
          {quickActions.map((action, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionCard}
              onPress={() => navigation.navigate(action.screen as never)}
            >
              <View style={[styles.actionIconContainer, { backgroundColor: action.color + '15' }]}>
                <Ionicons name={action.icon as any} size={28} color={action.color} />
              </View>
              <Text style={styles.actionLabel}>{action.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  contentContainer: {
    padding: SIZES.padding,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: COLORS.textSecondary,
    fontSize: SIZES.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  greeting: {
    fontSize: SIZES.md,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: SIZES.xxl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 4,
  },
  notificationButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.background,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.small,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: COLORS.error,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: COLORS.background,
    fontSize: 10,
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: SIZES.lg,
    fontWeight: '600',
    color: COLORS.text,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    marginBottom: 12,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusLg,
    padding: 16,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  statValue: {
    fontSize: SIZES.xl,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  statLabel: {
    fontSize: SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  miniStatsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  miniStatCard: {
    flex: 1,
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusMd,
    padding: 12,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  miniStatValue: {
    fontSize: SIZES.lg,
    fontWeight: 'bold',
    color: COLORS.text,
    marginTop: 8,
  },
  miniStatLabel: {
    fontSize: SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  actionCard: {
    width: '23%',
    backgroundColor: COLORS.background,
    borderRadius: SIZES.radiusMd,
    padding: 12,
    alignItems: 'center',
    ...SHADOWS.small,
  },
  actionIconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: SIZES.xs,
    color: COLORS.text,
    textAlign: 'center',
    fontWeight: '500',
  },
});
