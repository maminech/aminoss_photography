'use client';

import { useState, useEffect } from 'react';
import { FiPackage, FiSave, FiUpload, FiX, FiImage, FiPlus } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

interface BookingSettings {
  packageImages?: string[];
}

export default function BookingSettingsPage() {
  const [settings, setSettings] = useState<BookingSettings>({ packageImages: [] });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState<number | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Fetch settings
  const fetchSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/settings');
      if (res.ok) {
        const data = await res.json();
        // Migrate from old format to new format
        const packageImages = [];
        if (data.packageImage1) packageImages.push(data.packageImage1);
        if (data.packageImage2) packageImages.push(data.packageImage2);
        // Also check for packageImages array (new format)
        if (data.packageImages && Array.isArray(data.packageImages)) {
          packageImages.push(...data.packageImages.filter((img: string) => 
            !packageImages.includes(img)
          ));
        }
        setSettings({ packageImages });
      } else {
        toast.error('Failed to load settings');
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  // Upload image to Cloudinary
  const handleImageUpload = async (file: File, index?: number) => {
    try {
      const uploadIndex = index ?? (settings.packageImages?.length || 0);
      setUploading(uploadIndex);
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'innov8_portfolio');
      formData.append('folder', 'packages');

      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dm22wlmpx';
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || 'Upload failed');
      }

      const data = await response.json();
      const imageUrl = data.secure_url;

      // Update settings
      const newImages = [...(settings.packageImages || [])];
      if (index !== undefined) {
        // Replace existing image
        newImages[index] = imageUrl;
      } else {
        // Add new image
        newImages.push(imageUrl);
      }
      
      setSettings({ packageImages: newImages });
      setHasChanges(true);

      toast.success('✅ Image uploaded successfully!');
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(`❌ ${error.message || 'Failed to upload image'}`);
    } finally {
      setUploading(null);
    }
  };

  // Remove image
  const removeImage = (index: number) => {
    const newImages = [...(settings.packageImages || [])];
    newImages.splice(index, 1);
    setSettings({ packageImages: newImages });
    setHasChanges(true);
    toast.success('Image removed');
  };

  // Save settings
  const saveSettings = async () => {
    try {
      setSaving(true);
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });

      if (res.ok) {
        toast.success('✅ Settings saved successfully!');
        setHasChanges(false);
        await fetchSettings();
      } else {
        const errorData = await res.json().catch(() => ({}));
        toast.error(`❌ ${errorData.error || 'Failed to save'}`);
      }
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error(`❌ ${error.message || 'Failed to save'}`);
    } finally {
      setSaving(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                <FiPackage className="w-6 h-6 text-primary-500" />
                Booking & Package Settings
              </h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                Manage package images displayed in the booking form
              </p>
            </div>

            {/* Save Button */}
            {hasChanges && (
              <motion.button
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition disabled:opacity-50 shadow-lg"
              >
                <FiSave className="w-5 h-5" />
                {saving ? 'Saving...' : 'Save Changes'}
              </motion.button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Instructions */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-700 rounded-xl p-6">
            <div className="flex items-start gap-4">
              <FiImage className="w-6 h-6 text-purple-600 dark:text-purple-400 flex-shrink-0 mt-1" />
              <div>
                <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100 mb-2">
                  Package Images for Booking Form
                </h3>
                <p className="text-sm text-purple-800 dark:text-purple-200 mb-3">
                  Upload images that show your package pricing and details. These images will be displayed to clients when they click "View Packages" in the booking form.
                </p>
                <ul className="text-sm text-purple-700 dark:text-purple-300 space-y-1 list-disc list-inside">
                  <li>Recommended size: 1200x1600px (portrait) or 1600x900px (landscape)</li>
                  <li>Format: JPG, PNG (max 10MB per image)</li>
                  <li>Include clear pricing and package details</li>
                  <li>You can upload as many images as you need</li>
                  <li>Images will be shown in a carousel for clients</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Package Images Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Existing Images */}
            {settings.packageImages?.map((imageUrl, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                      Image {index + 1}
                    </h3>
                    <button
                      onClick={() => removeImage(index)}
                      className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition"
                      title="Remove image"
                    >
                      <FiX className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="relative group">
                    <img
                      src={imageUrl}
                      alt={`Package ${index + 1}`}
                      className="w-full h-auto rounded-lg shadow-lg"
                    />
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
                      <label className="cursor-pointer px-4 py-2 bg-white text-gray-900 rounded-lg font-semibold hover:bg-gray-100 transition flex items-center gap-2">
                        <FiUpload className="w-4 h-4" />
                        Replace
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file, index);
                          }}
                          className="hidden"
                          disabled={uploading === index}
                        />
                      </label>
                    </div>
                    {uploading === index && (
                      <div className="absolute inset-0 bg-black/80 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2"></div>
                          <p className="text-sm text-white">Uploading...</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Add New Image Card */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    Add New Image
                  </h3>
                </div>

                <label className="block cursor-pointer">
                  <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-12 text-center hover:border-primary-500 hover:bg-primary-50 dark:hover:bg-primary-900/10 transition min-h-[300px] flex flex-col items-center justify-center">
                    {uploading === (settings.packageImages?.length || 0) ? (
                      <div className="flex flex-col items-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mb-4"></div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Uploading...</p>
                      </div>
                    ) : (
                      <>
                        <FiPlus className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Click to upload new image
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          JPG, PNG up to 10MB
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(file);
                    }}
                    className="hidden"
                    disabled={uploading !== null}
                  />
                </label>
              </div>
            </motion.div>
          </div>

          {/* Preview Section */}
          {settings.packageImages && settings.packageImages.length > 0 && (
            <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                Preview: How clients will see the images ({settings.packageImages.length} image{settings.packageImages.length !== 1 ? 's' : ''})
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {settings.packageImages.map((imageUrl, index) => (
                  <img
                    key={index}
                    src={imageUrl}
                    alt={`Package ${index + 1} Preview`}
                    className="w-full h-auto rounded-lg shadow-lg"
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
