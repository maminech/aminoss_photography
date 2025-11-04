'use client';

import Image from 'next/image';
import { useEffect, useState } from 'react';

interface LogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function Logo({ variant = 'light', size = 'md', className = '' }: LogoProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const sizes = {
    sm: { width: 120, height: 35 },
    md: { width: 180, height: 50 },
    lg: { width: 240, height: 65 },
  };

  const { width, height } = sizes[size];

  if (!mounted) {
    return <div style={{ width, height }} className={className} />;
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <Image
        src="/logo.svg"
        alt="Aminoss Photography"
        fill
        className={`object-contain transition-opacity hover:opacity-80 ${
          variant === 'dark' ? 'brightness-0 invert' : ''
        }`}
        priority
      />
    </div>
  );
}
