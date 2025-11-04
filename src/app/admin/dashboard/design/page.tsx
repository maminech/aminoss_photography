'use client';

import { useState, useEffect } from 'react';
import { FiSave } from 'react-icons/fi';

interface DesignSettings {
  primaryColor: string;
  secondaryColor: string;
  fontHeading: string;
  fontBody: string;
}

export default function AdminDesignPage() {
  const [design, setDesign] = useState<DesignSettings>({
    primaryColor: '#c67548',
    secondaryColor: '#2d3748',
    fontHeading: 'Poppins',
    fontBody: 'Inter',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch settings
  const fetchDesign = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setDesign({
          primaryColor: data.primaryColor || '#c67548',
          secondaryColor: data.secondaryColor || '#2d3748',
          fontHeading: data.fontHeading || 'Poppins',
          fontBody: data.fontBody || 'Inter',
        });
      }
    } catch (error) {
      console.error('Error fetching design:', error);
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
        alert('✅ Design saved! Refresh the page to see changes.');
      } else {
        alert('❌ Failed to save design');
      }
    } catch (error) {
      console.error('Error saving design:', error);
      alert('❌ Failed to save design');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchDesign();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  const colorPresets = [
    { name: 'Warm Orange', primary: '#c67548', secondary: '#2d3748' },
    { name: 'Royal Blue', primary: '#3b82f6', secondary: '#1e293b' },
    { name: 'Forest Green', primary: '#10b981', secondary: '#064e3b' },
    { name: 'Deep Purple', primary: '#8b5cf6', secondary: '#1e1b4b' },
    { name: 'Rose Pink', primary: '#f43f5e', secondary: '#881337' },
    { name: 'Golden Yellow', primary: '#f59e0b', secondary: '#78350f' },
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
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Design Customization</h1>
          <button
            onClick={saveDesign}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </header>

      <main className="p-6 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Color Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Colors</h2>

            {/* Primary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Primary Color
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={design.primaryColor}
                  onChange={(e) =>
                    setDesign({ ...design, primaryColor: e.target.value })
                  }
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={design.primaryColor}
                    onChange={(e) =>
                      setDesign({ ...design, primaryColor: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                    placeholder="#c67548"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used for buttons, links, and accents
                  </p>
                </div>
              </div>
            </div>

            {/* Secondary Color */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Secondary Color
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="color"
                  value={design.secondaryColor}
                  onChange={(e) =>
                    setDesign({ ...design, secondaryColor: e.target.value })
                  }
                  className="w-16 h-16 rounded-lg border-2 border-gray-300 cursor-pointer"
                />
                <div className="flex-1">
                  <input
                    type="text"
                    value={design.secondaryColor}
                    onChange={(e) =>
                      setDesign({ ...design, secondaryColor: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent font-mono"
                    placeholder="#2d3748"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Used for text and dark backgrounds
                  </p>
                </div>
              </div>
            </div>

            {/* Color Presets */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Color Presets
              </label>
              <div className="grid grid-cols-2 gap-3">
                {colorPresets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() =>
                      setDesign({
                        ...design,
                        primaryColor: preset.primary,
                        secondaryColor: preset.secondary,
                      })
                    }
                    className="flex items-center space-x-3 p-3 border-2 border-gray-200 rounded-lg hover:border-primary transition"
                  >
                    <div className="flex space-x-1">
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: preset.primary }}
                      />
                      <div
                        className="w-6 h-6 rounded"
                        style={{ backgroundColor: preset.secondary }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Typography Settings */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900">Typography</h2>

            {/* Heading Font */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Heading Font
              </label>
              <select
                value={design.fontHeading}
                onChange={(e) =>
                  setDesign({ ...design, fontHeading: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {fontOptions.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Used for titles and headings
              </p>
              <div
                className="mt-3 p-4 bg-gray-50 rounded-lg"
                style={{ fontFamily: design.fontHeading }}
              >
                <h3 className="text-2xl font-bold">Sample Heading</h3>
                <p className="text-gray-600">This is how your headings will look</p>
              </div>
            </div>

            {/* Body Font */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Body Font
              </label>
              <select
                value={design.fontBody}
                onChange={(e) =>
                  setDesign({ ...design, fontBody: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              >
                {fontOptions.map((font) => (
                  <option key={font} value={font}>
                    {font}
                  </option>
                ))}
              </select>
              <p className="text-xs text-gray-500 mt-1">
                Used for body text and paragraphs
              </p>
              <div
                className="mt-3 p-4 bg-gray-50 rounded-lg"
                style={{ fontFamily: design.fontBody }}
              >
                <p>
                  This is sample body text. Lorem ipsum dolor sit amet,
                  consectetur adipiscing elit. Sed do eiusmod tempor incididunt
                  ut labore et dolore magna aliqua.
                </p>
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Live Preview</h2>
            <div className="border-2 border-gray-200 rounded-lg p-8 space-y-6">
              <div style={{ fontFamily: design.fontHeading }}>
                <h1 className="text-4xl font-bold mb-2">Your Portfolio</h1>
                <h2 className="text-2xl font-semibold mb-4">
                  Capturing Beautiful Moments
                </h2>
              </div>

              <div style={{ fontFamily: design.fontBody }}>
                <p className="text-gray-600 mb-4">
                  This is how your body text will appear throughout the site.
                  Professional photography services with attention to detail and
                  artistic vision.
                </p>
              </div>

              <div className="flex space-x-4">
                <button
                  style={{ backgroundColor: design.primaryColor }}
                  className="px-6 py-3 text-white rounded-lg font-semibold"
                >
                  Primary Button
                </button>
                <button
                  style={{ backgroundColor: design.secondaryColor }}
                  className="px-6 py-3 text-white rounded-lg font-semibold"
                >
                  Secondary Button
                </button>
              </div>

              <div className="flex items-center space-x-4">
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
              </div>
            </div>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-900">
            💡 <strong>Tip:</strong> After saving, refresh your website to see the
            design changes applied. Changes will be visible across all pages.
          </p>
        </div>
      </main>
    </div>
  );
}
