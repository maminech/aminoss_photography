// Novo-inspired design tokens for Professional theme

export const novoDesignTokens = {
  // Typography
  typography: {
    heading: {
      fontFamily: 'var(--font-playfair)',
      fontWeight: {
        light: 300,
        regular: 400,
        semibold: 600,
        bold: 700,
      },
      letterSpacing: {
        tight: '-0.02em',
        normal: '0',
        wide: '0.05em',
      },
      lineHeight: {
        tight: 1.1,
        normal: 1.3,
        relaxed: 1.5,
      },
    },
    body: {
      fontFamily: 'var(--font-lato)',
      fontWeight: {
        light: 300,
        regular: 400,
        bold: 700,
        black: 900,
      },
      letterSpacing: {
        normal: '0',
        wide: '0.025em',
      },
      lineHeight: {
        tight: 1.4,
        normal: 1.6,
        relaxed: 1.8,
      },
    },
  },

  // Colors (Novo palette)
  colors: {
    primary: '#1a1a1a',
    secondary: '#d4af37', // Gold
    accent: '#8b7355', // Bronze
    background: {
      light: '#ffffff',
      dark: '#0a0a0a',
      grey: '#f5f5f5',
      overlay: 'rgba(0, 0, 0, 0.6)',
    },
    text: {
      primary: '#1a1a1a',
      secondary: '#666666',
      light: '#999999',
      inverse: '#ffffff',
    },
    border: {
      light: '#eeeeee',
      medium: '#d4d4d4',
      dark: '#1a1a1a',
    },
  },

  // Spacing (following Novo's rhythm)
  spacing: {
    section: {
      xs: '3rem', // 48px
      sm: '4rem', // 64px
      md: '6rem', // 96px
      lg: '8rem', // 128px
      xl: '10rem', // 160px
    },
    container: {
      xs: '1rem', // 16px
      sm: '1.5rem', // 24px
      md: '2rem', // 32px
      lg: '3rem', // 48px
      xl: '4rem', // 64px
    },
    element: {
      xxs: '0.5rem', // 8px
      xs: '0.75rem', // 12px
      sm: '1rem', // 16px
      md: '1.5rem', // 24px
      lg: '2rem', // 32px
      xl: '3rem', // 48px
    },
  },

  // Animations (Novo timing)
  animations: {
    duration: {
      fast: '200ms',
      normal: '300ms',
      slow: '600ms',
      slower: '800ms',
    },
    easing: {
      standard: 'cubic-bezier(0.4, 0, 0.2, 1)',
      enter: 'cubic-bezier(0, 0, 0.2, 1)',
      exit: 'cubic-bezier(0.4, 0, 1, 1)',
      smooth: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
    },
  },

  // Effects
  effects: {
    shadow: {
      sm: '0 2px 4px rgba(0, 0, 0, 0.05)',
      md: '0 4px 12px rgba(0, 0, 0, 0.1)',
      lg: '0 8px 24px rgba(0, 0, 0, 0.12)',
      xl: '0 16px 48px rgba(0, 0, 0, 0.15)',
    },
    overlay: {
      light: 'rgba(255, 255, 255, 0.9)',
      medium: 'rgba(0, 0, 0, 0.5)',
      dark: 'rgba(0, 0, 0, 0.8)',
      gradient: 'linear-gradient(to bottom, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.7) 100%)',
    },
    blur: {
      sm: '4px',
      md: '8px',
      lg: '16px',
    },
  },

  // Breakpoints
  breakpoints: {
    xs: '475px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Z-index layers
  zIndex: {
    base: 1,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
  },
};

export default novoDesignTokens;
