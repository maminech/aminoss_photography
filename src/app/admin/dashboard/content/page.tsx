'use client';

import { useState, useEffect } from 'react';
import { FiSave, FiImage, FiUpload } from 'react-icons/fi';

interface ContentData {
  siteName: string;
  tagline: string;
  location: string;
  email: string;
  phone: string;
  instagramUrl: string;
  facebookUrl: string;
  twitterUrl: string;
  linkedinUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImage: string;
  aboutTitle: string;
  aboutContent: string;
  aboutImage: string;
  services: Array<{
    title: string;
    icon: string;
    description: string;
  }>;
}

export default function AdminContentPage() {
  const [content, setContent] = useState<ContentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'hero' | 'about' | 'services' | 'contact'>('about');

  // Fetch settings
  const fetchContent = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        setContent(data);
      }
    } catch (error) {
      console.error('Error fetching content:', error);
    } finally {
      setLoading(false);
    }
  };

  // Save settings
  const saveContent = async () => {
    if (!content) return;

    try {
      setSaving(true);
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });

      if (res.ok) {
        alert('✅ Content saved successfully!');
      } else {
        alert('❌ Failed to save content');
      }
    } catch (error) {
      console.error('Error saving content:', error);
      alert('❌ Failed to save content');
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 dark:bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 dark:bg-dark-900 flex items-center justify-center">
        <p className="text-gray-900 dark:text-gray-100">Error loading content</p>
      </div>
    );
  }

  const tabs = [
    { id: 'about', label: 'About Page' },
    { id: 'hero', label: 'Homepage Hero' },
    { id: 'services', label: 'Services' },
    { id: 'contact', label: 'Contact Info' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900 dark:bg-dark-900">
      {/* Header */}
      <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 dark:border-gray-700 sticky top-0 z-30">
        <div className="px-6 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Content Management</h1>
          <button
            onClick={saveContent}
            disabled={saving}
            className="flex items-center space-x-2 px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
          >
            <FiSave className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 dark:border-gray-700">
        <div className="px-6">
          <div className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-2 border-b-2 font-medium transition ${
                  activeTab === tab.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="p-6 max-w-4xl">
        {/* About Page Tab */}
        {activeTab === 'about' && (
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 dark:border-gray-700 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">About Page Content</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                About Title
              </label>
              <input
                type="text"
                value={content.aboutTitle}
                onChange={(e) =>
                  setContent({ ...content, aboutTitle: e.target.value })
                }
                className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                placeholder="About Me"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                About Content
              </label>
              <textarea
                value={content.aboutContent}
                onChange={(e) =>
                  setContent({ ...content, aboutContent: e.target.value })
                }
                rows={12}
                className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                placeholder="Tell your story here..."
              />
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                This text appears on the About page. You can use line breaks for paragraphs.
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                About Page Image URL
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={content.aboutImage || ''}
                  onChange={(e) =>
                    setContent({ ...content, aboutImage: e.target.value })
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100"
                  placeholder="https://res.cloudinary.com/..."
                />
                <a
                  href="https://cloudinary.com/console/media_library"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-100 dark:bg-dark-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 transition flex items-center space-x-2"
                >
                  <FiUpload className="w-4 h-4" />
                  <span>Upload</span>
                </a>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Upload an image to Cloudinary and paste the URL here
              </p>
            </div>
          </div>
        )}

        {/* Hero Tab */}
        {activeTab === 'hero' && (
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Homepage Hero Section</h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hero Title
              </label>
              <input
                type="text"
                value={content.heroTitle}
                onChange={(e) =>
                  setContent({ ...content, heroTitle: e.target.value })
                }
                className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Capturing Life's Beautiful Moments"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hero Subtitle
              </label>
              <input
                type="text"
                value={content.heroSubtitle}
                onChange={(e) =>
                  setContent({ ...content, heroSubtitle: e.target.value })
                }
                className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="Professional Photography & Videography"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Hero Background Image URL
              </label>
              <div className="flex items-center space-x-3">
                <input
                  type="text"
                  value={content.heroImage || ''}
                  onChange={(e) =>
                    setContent({ ...content, heroImage: e.target.value })
                  }
                  className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://res.cloudinary.com/..."
                />
                <a
                  href="https://cloudinary.com/console/media_library"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
                >
                  <FiUpload className="w-4 h-4" />
                  <span>Upload</span>
                </a>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Optional: Leave empty to use featured photos
              </p>
            </div>
          </div>
        )}

        {/* Services Tab */}
        {activeTab === 'services' && (
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Services Offered</h2>

            {content.services?.map((service, index) => (
              <div key={index} className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">Service {index + 1}</h3>
                  <button
                    onClick={() => {
                      const newServices = content.services.filter((_, i) => i !== index);
                      setContent({ ...content, services: newServices });
                    }}
                    className="text-red-600 hover:text-red-700 text-sm"
                  >
                    Remove
                  </button>
                </div>

                <input
                  type="text"
                  value={service.title}
                  onChange={(e) => {
                    const newServices = [...content.services];
                    newServices[index].title = e.target.value;
                    setContent({ ...content, services: newServices });
                  }}
                  className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Service title"
                />

                <textarea
                  value={service.description}
                  onChange={(e) => {
                    const newServices = [...content.services];
                    newServices[index].description = e.target.value;
                    setContent({ ...content, services: newServices });
                  }}
                  rows={2}
                  className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Service description"
                />
              </div>
            ))}

            <button
              onClick={() => {
                setContent({
                  ...content,
                  services: [
                    ...(content.services || []),
                    { title: '', icon: 'camera', description: '' },
                  ],
                });
              }}
              className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-600 hover:border-primary hover:text-primary transition"
            >
              + Add Service
            </button>
          </div>
        )}

        {/* Contact Tab */}
        {activeTab === 'contact' && (
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100 mb-4">Contact Information</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Site Name
                </label>
                <input
                  type="text"
                  value={content.siteName}
                  onChange={(e) =>
                    setContent({ ...content, siteName: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Tagline
                </label>
                <input
                  type="text"
                  value={content.tagline}
                  onChange={(e) =>
                    setContent({ ...content, tagline: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Location
                </label>
                <input
                  type="text"
                  value={content.location}
                  onChange={(e) =>
                    setContent({ ...content, location: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={content.email || ''}
                  onChange={(e) =>
                    setContent({ ...content, email: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Phone
                </label>
                <input
                  type="text"
                  value={content.phone || ''}
                  onChange={(e) =>
                    setContent({ ...content, phone: e.target.value })
                  }
                  className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                />
              </div>
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-4">Social Media Links</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Instagram URL
                  </label>
                  <input
                    type="url"
                    value={content.instagramUrl || ''}
                    onChange={(e) =>
                      setContent({ ...content, instagramUrl: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://instagram.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Facebook URL
                  </label>
                  <input
                    type="url"
                    value={content.facebookUrl || ''}
                    onChange={(e) =>
                      setContent({ ...content, facebookUrl: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://facebook.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Twitter URL
                  </label>
                  <input
                    type="url"
                    value={content.twitterUrl || ''}
                    onChange={(e) =>
                      setContent({ ...content, twitterUrl: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://twitter.com/username"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    LinkedIn URL
                  </label>
                  <input
                    type="url"
                    value={content.linkedinUrl || ''}
                    onChange={(e) =>
                      setContent({ ...content, linkedinUrl: e.target.value })
                    }
                    className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
