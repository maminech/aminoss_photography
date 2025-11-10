export const COLORS = {
  primary: '#8B5CF6',        // Purple
  primaryDark: '#7C3AED',
  primaryLight: '#A78BFA',
  secondary: '#EC4899',       // Pink
  accent: '#F59E0B',          // Amber
  
  success: '#10B981',         // Green
  warning: '#F59E0B',         // Amber
  error: '#EF4444',           // Red
  info: '#3B82F6',            // Blue
  
  background: '#FFFFFF',
  backgroundDark: '#111827',
  surface: '#F9FAFB',
  surfaceDark: '#1F2937',
  
  text: '#111827',
  textSecondary: '#6B7280',
  textLight: '#9CA3AF',
  textDark: '#FFFFFF',
  
  border: '#E5E7EB',
  borderDark: '#374151',
  
  // Status colors
  paid: '#10B981',
  unpaid: '#EF4444',
  partial: '#F59E0B',
  approved: '#10B981',
  pending: '#F59E0B',
  rejected: '#EF4444',
  draft: '#9CA3AF',
};

export const SIZES = {
  // Font sizes
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  
  // Spacing
  padding: 16,
  paddingSm: 12,
  paddingLg: 20,
  margin: 16,
  marginSm: 8,
  marginLg: 24,
  
  // Border radius
  radiusSm: 4,
  radiusMd: 8,
  radiusLg: 12,
  radiusXl: 16,
  radiusFull: 9999,
  
  // Icon sizes
  iconSm: 16,
  iconMd: 20,
  iconLg: 24,
  iconXl: 32,
};

export const FONTS = {
  regular: 'System',
  medium: 'System',
  semiBold: 'System',
  bold: 'System',
};

export const SHADOWS = {
  small: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  medium: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 4,
  },
  large: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
};

export const LAYOUT = {
  screenPadding: 16,
  cardMargin: 12,
  headerHeight: 60,
  tabBarHeight: 60,
};
