'use client';

import { useEffect, useState } from 'react';

export default function DynamicStyles() {
  const [styles, setStyles] = useState('');

  useEffect(() => {
    // Function to load and apply design settings
    const loadDesignSettings = async () => {
      try {
        const res = await fetch('/api/admin/settings');
        if (res.ok) {
          const settings = await res.json();
          
          // Apply CSS variables to the root element
          const root = document.documentElement;
          
          if (settings.primaryColor) {
            root.style.setProperty('--color-primary', settings.primaryColor);
            root.style.setProperty('--color-primary-hover', adjustColor(settings.primaryColor, -10));
            root.style.setProperty('--color-primary-light', adjustColor(settings.primaryColor, 20));
          }
          
          if (settings.secondaryColor) {
            root.style.setProperty('--color-secondary', settings.secondaryColor);
          }
          
          if (settings.fontHeading) {
            root.style.setProperty('--font-heading', `'${settings.fontHeading}', sans-serif`);
          }
          
          if (settings.fontBody) {
            root.style.setProperty('--font-body', `'${settings.fontBody}', sans-serif`);
          }
          
          // Apply theme class
          if (settings.designTheme) {
            root.setAttribute('data-theme', settings.designTheme);
          }

          // Generate inline styles for Tailwind classes
          const primaryColor = settings.primaryColor || '#c67548';
          const secondaryColor = settings.secondaryColor || '#2d3748';
          
          const customStyles = `
            /* Dynamic Primary Colors */
            .text-primary-600 { color: ${primaryColor} !important; }
            .text-primary-500 { color: ${primaryColor} !important; }
            .text-primary-400 { color: ${adjustColor(primaryColor, 20)} !important; }
            .bg-primary-600 { background-color: ${primaryColor} !important; }
            .bg-primary-500 { background-color: ${primaryColor} !important; }
            .bg-primary-700 { background-color: ${adjustColor(primaryColor, -10)} !important; }
            .border-primary-600 { border-color: ${primaryColor} !important; }
            .border-primary-500 { border-color: ${primaryColor} !important; }
            .border-primary-400 { border-color: ${adjustColor(primaryColor, 20)} !important; }
            .from-primary-500 { --tw-gradient-from: ${primaryColor} !important; }
            .to-primary-600 { --tw-gradient-to: ${adjustColor(primaryColor, -5)} !important; }
            
            /* Hover states */
            .hover\\:bg-primary-700:hover { background-color: ${adjustColor(primaryColor, -10)} !important; }
            .hover\\:bg-primary-600:hover { background-color: ${primaryColor} !important; }
            .hover\\:text-primary-600:hover { color: ${primaryColor} !important; }
            .hover\\:text-primary-400:hover { color: ${adjustColor(primaryColor, 20)} !important; }
            
            /* Dark mode variants */
            .dark .dark\\:text-primary-400 { color: ${adjustColor(primaryColor, 20)} !important; }
            .dark .dark\\:text-primary-500 { color: ${primaryColor} !important; }
            .dark .dark\\:border-primary-400 { border-color: ${adjustColor(primaryColor, 20)} !important; }
            .dark .dark\\:bg-primary-700 { background-color: ${adjustColor(primaryColor, -10)} !important; }
            
            /* Focus states */
            .focus\\:ring-primary-400:focus { --tw-ring-color: ${adjustColor(primaryColor, 20)} !important; }
            .focus\\:ring-primary-500:focus { --tw-ring-color: ${primaryColor} !important; }
            
            /* Additional primary variants */
            .bg-primary-50 { background-color: ${adjustColor(primaryColor, 80)} !important; }
            .bg-primary-100 { background-color: ${adjustColor(primaryColor, 60)} !important; }
            .text-primary-100 { color: ${adjustColor(primaryColor, 60)} !important; }
            .text-primary-200 { color: ${adjustColor(primaryColor, 50)} !important; }
            
            .dark .dark\\:bg-primary-900\\/20 { background-color: ${hexToRgba(adjustColor(primaryColor, -30), 0.2)} !important; }
          `;
          
          setStyles(customStyles);
        }
      } catch (error) {
        console.error('Failed to load design settings:', error);
      }
    };

    loadDesignSettings();
  }, []);

  return styles ? <style dangerouslySetInnerHTML={{ __html: styles }} /> : null;
}

// Helper function to adjust color brightness
function adjustColor(color: string, percent: number): string {
  const hex = color.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  
  const adjust = (val: number) => {
    const adjusted = val + (val * percent / 100);
    return Math.max(0, Math.min(255, Math.round(adjusted)));
  };
  
  const toHex = (val: number) => {
    const hex = val.toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(adjust(r))}${toHex(adjust(g))}${toHex(adjust(b))}`;
}

// Helper to convert hex to rgba
function hexToRgba(hex: string, alpha: number): string {
  const h = hex.replace('#', '');
  const r = parseInt(h.substring(0, 2), 16);
  const g = parseInt(h.substring(2, 4), 16);
  const b = parseInt(h.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
