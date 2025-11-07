'use client';

import { ReactNode } from 'react';
import { useLayoutTheme } from '@/contexts/ThemeContext';
import SimpleLayout from '@/layouts/SimpleLayout';
import ProfessionalLayout from '@/layouts/ProfessionalLayout';
import ThemeSwitcher from '@/components/shared/ThemeSwitcher';

interface ThemeWrapperProps {
  children: ReactNode;
}

export default function ThemeWrapper({ children }: ThemeWrapperProps) {
  const { currentTheme } = useLayoutTheme();

  const Layout = currentTheme === 'professional' ? ProfessionalLayout : SimpleLayout;

  return (
    <Layout>
      {children}
      <ThemeSwitcher />
    </Layout>
  );
}
