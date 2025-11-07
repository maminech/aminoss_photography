// Theme types and configuration

export type ThemeType = 'simple' | 'professional';

export interface ThemeConfig {
  id: ThemeType;
  name: string;
  description: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    text: string;
  };
  fonts: {
    heading: string;
    body: string;
  };
  animations: {
    duration: string;
    easing: string;
  };
}

export const themes: Record<ThemeType, ThemeConfig> = {
  simple: {
    id: 'simple',
    name: 'Simple',
    description: 'Clean and minimalistic design',
    colors: {
      primary: '#3b82f6', // blue-500
      secondary: '#8b5cf6', // purple-500
      accent: '#10b981', // green-500
      background: '#ffffff',
      text: '#1f2937', // gray-800
    },
    fonts: {
      heading: 'Inter, system-ui, sans-serif',
      body: 'Inter, system-ui, sans-serif',
    },
    animations: {
      duration: '300ms',
      easing: 'ease-in-out',
    },
  },
  professional: {
    id: 'professional',
    name: 'Professional',
    description: 'Elegant and modern Novo-inspired design',
    colors: {
      primary: '#1a1a1a',
      secondary: '#d4af37', // Gold accent
      accent: '#f5f5f5',
      background: '#ffffff',
      text: '#1a1a1a',
    },
    fonts: {
      heading: '"Playfair Display", Georgia, serif',
      body: '"Lato", system-ui, sans-serif',
    },
    animations: {
      duration: '600ms',
      easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
    },
  },
};
