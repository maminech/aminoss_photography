// Enhanced Design Tokens - Professional Photography Platform
// Ultimate color system with gradients and semantic tokens

export const designTokens = {
  // Primary Brand Palette (Warm Terracotta)
  primary: {
    50: '#fef3ee',
    100: '#fde7d9',
    200: '#fbc9a4',
    300: '#f8a96f',
    400: '#e88c55',
    500: '#c67548', // Main brand
    600: '#b15f39',
    700: '#8d4728',
    800: '#6b341e',
    900: '#4a2314',
  },

  // Secondary Palette (Deep Slate)
  secondary: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Accent Colors
  accent: {
    amber: {
      400: '#fbbf24',
      500: '#f59e0b',
      600: '#d97706',
    },
    emerald: {
      400: '#34d399',
      500: '#10b981',
      600: '#059669',
    },
    rose: {
      400: '#fb7185',
      500: '#f43f5e',
      600: '#e11d48',
    },
  },

  // Gradients
  gradients: {
    sunset: 'linear-gradient(135deg, #c67548 0%, #f8a96f 50%, #fbbf24 100%)',
    luxury: 'linear-gradient(135deg, #0f172a 0%, #1e293b 25%, #c67548 75%, #f8a96f 100%)',
    softWarm: 'linear-gradient(135deg, #fef3ee 0%, #fde7d9 100%)',
    darkOverlay: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.7) 100%)',
    heroOverlay: 'linear-gradient(135deg, rgba(198,117,72,0.9) 0%, rgba(15,23,42,0.85) 100%)',
    glassLight: 'linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)',
    shimmer: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)',
  },

  // Shadows
  shadows: {
    xs: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
    sm: '0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)',
    md: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    lg: '0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)',
    xl: '0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)',
    '2xl': '0 25px 50px -12px rgb(0 0 0 / 0.25)',
    inner: 'inset 0 2px 4px 0 rgb(0 0 0 / 0.05)',
    glow: '0 0 20px rgba(198, 117, 72, 0.4)',
    glowHover: '0 0 30px rgba(198, 117, 72, 0.6)',
  },

  // Typography Scale (Perfect Fourth - 1.333)
  fontSize: {
    xs: '0.75rem',     // 12px
    sm: '0.875rem',    // 14px
    base: '1rem',      // 16px
    lg: '1.125rem',    // 18px
    xl: '1.333rem',    // 21px
    '2xl': '1.777rem', // 28px
    '3xl': '2.369rem', // 38px
    '4xl': '3.157rem', // 51px
    '5xl': '4.209rem', // 67px
    '6xl': '5.61rem',  // 90px
  },

  // Spacing Scale
  spacing: {
    px: '1px',
    0: '0',
    0.5: '0.125rem',  // 2px
    1: '0.25rem',     // 4px
    1.5: '0.375rem',  // 6px
    2: '0.5rem',      // 8px
    2.5: '0.625rem',  // 10px
    3: '0.75rem',     // 12px
    3.5: '0.875rem',  // 14px
    4: '1rem',        // 16px
    5: '1.25rem',     // 20px
    6: '1.5rem',      // 24px
    7: '1.75rem',     // 28px
    8: '2rem',        // 32px
    9: '2.25rem',     // 36px
    10: '2.5rem',     // 40px
    12: '3rem',       // 48px
    14: '3.5rem',     // 56px
    16: '4rem',       // 64px
    20: '5rem',       // 80px
    24: '6rem',       // 96px
    28: '7rem',       // 112px
    32: '8rem',       // 128px
    36: '9rem',       // 144px
    40: '10rem',      // 160px
    44: '11rem',      // 176px
    48: '12rem',      // 192px
    52: '13rem',      // 208px
    56: '14rem',      // 224px
    60: '15rem',      // 240px
    64: '16rem',      // 256px
    72: '18rem',      // 288px
    80: '20rem',      // 320px
    96: '24rem',      // 384px
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.125rem',   // 2px
    DEFAULT: '0.25rem', // 4px
    md: '0.375rem',   // 6px
    lg: '0.5rem',     // 8px
    xl: '0.75rem',    // 12px
    '2xl': '1rem',    // 16px
    '3xl': '1.5rem',  // 24px
    full: '9999px',
  },

  // Animation Durations
  duration: {
    75: '75ms',
    100: '100ms',
    150: '150ms',
    200: '200ms',
    300: '300ms',
    500: '500ms',
    700: '700ms',
    1000: '1000ms',
  },

  // Animation Easings
  easing: {
    linear: 'linear',
    in: 'cubic-bezier(0.4, 0, 1, 1)',
    out: 'cubic-bezier(0, 0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'cubic-bezier(0.6, -0.05, 0.01, 0.99)',
    bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Z-Index Scale
  zIndex: {
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

// Semantic Tokens for specific use cases
export const semanticTokens = {
  background: {
    primary: designTokens.primary[50],
    secondary: designTokens.secondary[50],
    dark: designTokens.secondary[900],
    glass: 'rgba(255, 255, 255, 0.1)',
  },
  
  text: {
    primary: designTokens.secondary[900],
    secondary: designTokens.secondary[600],
    muted: designTokens.secondary[400],
    inverse: '#ffffff',
  },

  border: {
    light: designTokens.secondary[200],
    DEFAULT: designTokens.secondary[300],
    dark: designTokens.secondary[700],
  },

  status: {
    success: '#10b981',
    warning: '#f59e0b',
    error: '#ef4444',
    info: '#3b82f6',
  },
};

export default designTokens;
