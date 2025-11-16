'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiDownload, FiCopy, FiRefreshCw } from 'react-icons/fi';
import toast from 'react-hot-toast';

interface DesignSettings {
  primaryColor: string;
  secondaryColor: string;
  fontHeading: string;
  fontBody: string;
  designTheme: string;
}

export default function AdminDesignPage() {
  const [design, setDesign] = useState<DesignSettings>({
    primaryColor: '#c67548',
    secondaryColor: '#2d3748',
    fontHeading: 'Poppins',
    fontBody: 'Inter',
    designTheme: 'glass',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch settings
  const fetchDesign = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        const loadedDesign = {
          primaryColor: data.primaryColor || '#c67548',
          secondaryColor: data.secondaryColor || '#2d3748',
          fontHeading: data.fontHeading || 'Poppins',
          fontBody: data.fontBody || 'Inter',
          designTheme: data.designTheme || 'glass',
        };
        setDesign(loadedDesign);
        setHasChanges(false);
      } else {
        const errorData = await res.json().catch(() => ({}));
        console.error('Fetch error:', errorData);
        toast.error('Failed to load design settings');
      }
    } catch (error: any) {
      console.error('Error fetching design:', error);
      toast.error(`Failed to load: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Save settings
  const saveDesign = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(design),
      });

      if (res.ok) {
        toast.success('✅ Design saved successfully!');
        setHasChanges(false);
        // Refresh to show the saved settings
        await fetchDesign();
        
        // Reload the page after a short delay to apply the new colors
        setTimeout(() => {
          toast.success('🎨 Refreshing to apply colors...');
          window.location.reload();
        }, 1500);
      } else {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = errorData.error || `Failed to save (Status: ${res.status})`;
        console.error('Save error:', errorData);
        toast.error(`❌ ${errorMessage}`);
      }
    } catch (error: any) {
      console.error('Error saving design:', error);
      toast.error(`❌ Error: ${error.message || 'Failed to save design'}`);
    } finally {
      setSaving(false);
    }
  };

  // Export color palette
  const exportPalette = () => {
    const paletteData = {
      name: "Innov8 Production Color Palette",
      colors: {
        primary: design.primaryColor,
        secondary: design.secondaryColor,
      },
      fonts: {
        heading: design.fontHeading,
        body: design.fontBody,
      },
      theme: design.designTheme,
    };
    
    const dataStr = JSON.stringify(paletteData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    const exportFileDefaultName = 'color-palette.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
    toast.success('Palette exported successfully!');
  };

  // Copy CSS variables
  const copyCSSVariables = () => {
    const cssVars = `:root {
  --color-primary: ${design.primaryColor};
  --color-secondary: ${design.secondaryColor};
  --font-heading: '${design.fontHeading}', sans-serif;
  --font-body: '${design.fontBody}', sans-serif;
}`;
    navigator.clipboard.writeText(cssVars);
    toast.success('CSS variables copied to clipboard!');
  };

  // Handle design changes
  const updateDesign = (updates: Partial<DesignSettings>) => {
    setDesign({ ...design, ...updates });
    setHasChanges(true);
  };

  useEffect(() => {
    fetchDesign();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading design settings...</p>
        </div>
      </div>
    );
  }

  const themeOptions = [
    { 
      id: 'glass', 
      name: 'Glassmorphism', 
      description: 'iOS-style frosted glass with backdrop blur',
      preview: 'bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl',
      recommended: true
    },
    { 
      id: 'modern', 
      name: 'Modern', 
      description: 'Clean and contemporary with subtle shadows',
      preview: 'bg-white dark:bg-dark-800 border border-gray-200 dark:border-gray-700 shadow-sm'
    },
    { 
      id: 'minimal', 
      name: 'Minimal', 
      description: 'Ultra clean with no shadows or borders',
      preview: 'bg-white dark:bg-dark-800'
    },
    { 
      id: 'luxury', 
      name: 'Luxury', 
      description: 'Premium feel with gold accents',
      preview: 'bg-gradient-to-br from-gray-900 to-gray-800 border border-amber-500/20 shadow-2xl'
    },
  ];

  const colorPresets = [
    { name: 'Warm Orange (Current)', primary: '#c67548', secondary: '#2d3748', category: 'Warm' },
    { name: 'Sunset Amber', primary: '#d97706', secondary: '#0c4a6e', category: 'Warm' },
    { name: 'Golden Hour', primary: '#f59e0b', secondary: '#78350f', category: 'Warm' },
    { name: 'Royal Blue', primary: '#3b82f6', secondary: '#1e293b', category: 'Cool' },
    { name: 'Ocean Teal', primary: '#06b6d4', secondary: '#083344', category: 'Cool' },
    { name: 'Forest Green', primary: '#10b981', secondary: '#064e3b', category: 'Nature' },
    { name: 'Emerald Mint', primary: '#059669', secondary: '#022c22', category: 'Nature' },
    { name: 'Deep Purple', primary: '#8b5cf6', secondary: '#1e1b4b', category: 'Vibrant' },
    { name: 'Rose Pink', primary: '#f43f5e', secondary: '#881337', category: 'Vibrant' },
    { name: 'Monochrome Dark', primary: '#18181b', secondary: '#71717a', category: 'Neutral' },
  ];

  const fontOptions = [
    'Inter',
    'Poppins',
    'Roboto',
    'Open Sans',
    'Montserrat',
    'Playfair Display',
    'Lora',
    'Merriweather',
    'Raleway',
    'Nunito',
    'Quicksand',
    'Josefin Sans',
    'Bebas Neue',
    'Cormorant Garamond',
    'Cinzel',
    'Great Vibes',
    'Dancing Script',
    'Pacifico',
    'Righteous',
    'Archivo Black',
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Enhanced Header with Actions */}
      <header className="glass-nav bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Design Customization</h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Customize your website's appearance and branding
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={exportPalette}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition"
            >
              <FiDownload className="w-4 h-4" />
              <span>Export</span>
            </button>
            <button
              onClick={copyCSSVariables}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition"
            >
              <FiCopy className="w-4 h-4" />
              <span>Copy CSS</span>
            </button>
            <button
              onClick={fetchDesign}
              className="flex items-center space-x-2 px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition"
            >
              <FiRefreshCw className="w-4 h-4" />
              <span>Refresh</span>
            </button>
            <button
              onClick={saveDesign}
              disabled={saving || !hasChanges}
              className={`flex items-center space-x-2 px-6 py-2 rounded-lg transition ${
                hasChanges
                  ? 'bg-primary-500 text-white hover:bg-primary-600'
                  : 'bg-gray-300 dark:bg-gray-700 text-gray-500 dark:text-gray-500 cursor-not-allowed'
              }`}
            >
              <FiSave className="w-4 h-4" />
              <span>{saving ? 'Saving...' : hasChanges ? 'Save Changes' : 'No Changes'}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Design Theme */}
          <div className="lg:col-span-2 glass-card bg-white dark:bg-dark-800 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Design Theme</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {themeOptions.map((theme) => (
                <button
                  key={theme.id}
                  onClick={() => updateDesign({ designTheme: theme.id })}
                  className={`p-4 rounded-lg border-2 transition text-left relative ${
                    design.designTheme === theme.id
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary-300 dark:hover:border-primary-700'
                  }`}
                >
                  {theme.recommended && design.designTheme !== theme.id && (
                    <span className="absolute top-2 right-2 text-xs bg-primary-500 text-white px-2 py-1 rounded-full">
                      Recommended
                    </span>
                  )}
                  <div className={`h-20 rounded-lg mb-3 ${theme.preview}`}></div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-1">{theme.name}</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-400">{theme.description}</p>
                  {design.designTheme === theme.id && (
                    <div className="mt-2 text-primary-500 text-sm font-medium flex items-center">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                      </svg>
                      Active
                    </div>
                  )}
                </button>
              ))}
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                <strong>💡 Current Theme:</strong> {themeOptions.find(t => t.id === design.designTheme)?.name} - {themeOptions.find(t => t.id === design.designTheme)?.description}
              </p>
            </div>
          </div>

          {/* Color Settings */}
          <div className="glass-card bg-white dark:bg-dark-800 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Colors</h2>

            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Primary Color
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={design.primaryColor}
                  onChange={(e) => updateDesign({ primaryColor: e.target.value })}
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={design.primaryColor}
                    onChange={(e) => updateDesign({ primaryColor: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                    placeholder="#c67548"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Used for buttons, links, and accents
                  </p>
                </div>
              </div>
            </div>

            {/* Secondary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Secondary Color
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={design.secondaryColor}
                  onChange={(e) => updateDesign({ secondaryColor: e.target.value })}
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 dark:border-gray-600 cursor-pointer"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={design.secondaryColor}
                    onChange={(e) => updateDesign({ secondaryColor: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                    placeholder="#2d3748"
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Used for text and dark backgrounds
                  </p>
                </div>
              </div>
            </div>

            {/* Color Presets - Organized by Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Color Presets
              </label>
              {['Warm', 'Cool', 'Nature', 'Vibrant', 'Neutral'].map(category => {
                const categoryPresets = colorPresets.filter(p => p.category === category);
                if (categoryPresets.length === 0) return null;
                return (
                  <div key={category} className="mb-4">
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-2">{category}</p>
                    <div className="grid grid-cols-2 gap-2">
                      {categoryPresets.map((preset) => (
                        <button
                          key={preset.name}
                          onClick={() =>
                            updateDesign({
                              primaryColor: preset.primary,
                              secondaryColor: preset.secondary,
                            })
                          }
                          className={`flex items-center space-x-2 p-2 border-2 rounded-lg hover:border-primary-400 transition ${
                            design.primaryColor === preset.primary && design.secondaryColor === preset.secondary
                              ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                              : 'border-gray-200 dark:border-gray-700'
                          }`}
                        >
                          <div className="flex space-x-1">
                            <div
                              className="w-5 h-5 rounded"
                              style={{ backgroundColor: preset.primary }}
                            />
                            <div
                              className="w-5 h-5 rounded"
                              style={{ backgroundColor: preset.secondary }}
                            />
                          </div>
                          <span className="text-xs font-medium text-gray-700 dark:text-gray-300 flex-1 text-left">
                            {preset.name}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Typography Settings */}
          <div className="glass-card bg-white dark:bg-dark-800 shadow-sm border border-gray-200 dark:border-gray-700 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Typography</h2>

            {/* Heading Font */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Heading Font
              </label>
              <select
                value={design.fontHeading}
                onChange={(e) => updateDesign({ fontHeading: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              >
                {fontOptions.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Used for titles and headings
              </p>
              <div
                className="mt-3 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg"
                style={{ fontFamily: design.fontHeading }}
              >
                <h3 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Sample Heading</h3>
                <p className="text-gray-600 dark:text-gray-400">This is how your headings will look</p>
              </div>
            </div>

            {/* Body Font */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                Body Font
              </label>
              <select
                value={design.fontBody}
                onChange={(e) => updateDesign({ fontBody: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
              >
                {fontOptions.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Used for body text and paragraphs
              </p>
              <div
                className="mt-3 p-4 bg-gray-50 dark:bg-dark-700 rounded-lg"
                style={{ fontFamily: design.fontBody }}
              >
                <p className="text-gray-900 dark:text-gray-100">
                  This is sample body text. Lorem ipsum dolor sit amet,
                  consectetur adipiscing elit. Sed do eiusmod tempor incididunt
                  ut labore et dolore magna aliqua.
                </p>
              </div>
            </div>
          </div>

          {/* Live Preview */}
          <div className="lg:col-span-2 glass-card bg-white dark:bg-dark-800 shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Live Preview - {themeOptions.find(t => t.id === design.designTheme)?.name}
              </h2>
              <span className="text-sm px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                Real-time updates
              </span>
            </div>
            <div className="border-2 border-gray-200 dark:border-gray-700 rounded-lg p-8 space-y-6 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-dark-900 dark:to-dark-800">
              <div style={{ fontFamily: design.fontHeading }}>
                <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">Your Portfolio</h1>
                <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-gray-200">
                  Capturing Beautiful Moments
                </h2>
              </div>

              <div style={{ fontFamily: design.fontBody }}>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  This is how your body text will appear throughout the site.
                  Professional photography services with attention to detail and
                  artistic vision.
                </p>
              </div>

              {/* Theme-specific preview */}
              <div className={`p-6 rounded-xl ${
                design.designTheme === 'glass' 
                  ? 'bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl' 
                  : design.designTheme === 'minimal'
                  ? 'bg-white dark:bg-dark-800'
                  : design.designTheme === 'luxury'
                  ? 'bg-gradient-to-br from-gray-900 to-gray-800 border border-amber-500/20 shadow-2xl'
                  : 'bg-white dark:bg-dark-800 border border-gray-200 dark:border-gray-700 shadow-sm'
              }`}>
                <h3 className={`text-lg font-bold mb-2 ${
                  design.designTheme === 'luxury' ? 'text-amber-400' : 'text-gray-900 dark:text-gray-100'
                }`}>
                  Card Preview
                </h3>
                <p className={`text-sm ${
                  design.designTheme === 'luxury' ? 'text-gray-300' : 'text-gray-600 dark:text-gray-400'
                }`}>
                  This shows how cards will look with the {themeOptions.find(t => t.id === design.designTheme)?.name} theme
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  style={{ backgroundColor: design.primaryColor }}
                  className="px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Primary Button
                </button>
                <button
                  style={{ backgroundColor: design.secondaryColor }}
                  className="px-6 py-3 text-white rounded-lg font-semibold hover:opacity-90 transition"
                >
                  Secondary Button
                </button>
              </div>

              <div className="flex items-center space-x-4 flex-wrap gap-3">
                <span
                  style={{ color: design.primaryColor }}
                  className="font-semibold"
                >
                  Primary Color Link
                </span>
                <span
                  style={{ color: design.secondaryColor }}
                  className="font-semibold"
                >
                  Secondary Color Text
                </span>
                <span className="text-gray-600 dark:text-gray-400">
                  Regular Text
                </span>
              </div>

              {/* Color Contrast Info */}
              <div className="grid grid-cols-2 gap-4 mt-4">
                <div className="bg-white dark:bg-dark-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Primary Color</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: design.primaryColor }}></div>
                    <span className="text-sm font-mono text-gray-900 dark:text-gray-100">{design.primaryColor}</span>
                  </div>
                </div>
                <div className="bg-white dark:bg-dark-800 p-3 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Secondary Color</p>
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded" style={{ backgroundColor: design.secondaryColor }}></div>
                    <span className="text-sm font-mono text-gray-900 dark:text-gray-100">{design.secondaryColor}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Info Box */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
            <p className="text-sm text-blue-900 dark:text-blue-100">
              💡 <strong>Tip:</strong> Changes are previewed in real-time. Click "Save Changes" and the page will refresh automatically to apply colors across your website.
            </p>
          </div>
          <div className="bg-purple-50 dark:bg-purple-900/20 border border-purple-200 dark:border-purple-800 rounded-lg p-4">
            <p className="text-sm text-purple-900 dark:text-purple-100">
              🎨 <strong>Pro Tip:</strong> Use the export button to save your color palette for future reference!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
