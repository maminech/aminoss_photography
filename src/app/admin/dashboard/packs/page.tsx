'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiPackage, FiDollarSign, FiClock, FiImage } from 'react-icons/fi';

interface Pack {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  coverImage?: string;
  features: string[];
  category: string;
  packageType?: string;
  active: boolean;
  order: number;
  _count?: {
    bookings: number;
  };
}

export default function AdminPacksPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedPack, setSelectedPack] = useState<Pack | null>(null);
  const [imageUploading, setImageUploading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    coverImage: '',
    features: [''],
    category: 'Wedding',
    packageType: 'aymen',
    active: true,
    order: 0,
  });

  useEffect(() => {
    fetchPacks();
  }, []);

  const fetchPacks = async () => {
    try {
      const res = await fetch('/api/admin/packs');
      if (res.ok) {
        const data = await res.json();
        setPacks(data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (pack?: Pack) => {
    if (pack) {
      setSelectedPack(pack);
      setFormData({
        name: pack.name,
        description: pack.description,
        price: pack.price.toString(),
        duration: pack.duration,
        coverImage: pack.coverImage || '',
        features: pack.features.length > 0 ? pack.features : [''],
        category: pack.category,
        packageType: pack.packageType || 'aymen',
        active: pack.active,
        order: pack.order,
      });
    } else {
      setSelectedPack(null);
      setFormData({
        name: '',
        description: '',
        price: '',
        duration: '',
        coverImage: '',
        features: [''],
        category: 'Wedding',
        packageType: 'aymen',
        active: true,
        order: 0,
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedPack(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = selectedPack ? 'PUT' : 'POST';
      const body = selectedPack
        ? { ...formData, id: selectedPack.id, features: formData.features.filter(f => f.trim()) }
        : { ...formData, features: formData.features.filter(f => f.trim()) };

      const res = await fetch('/api/admin/packs', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        alert(`✅ Package ${selectedPack ? 'updated' : 'created'} successfully!`);
        fetchPacks();
        closeModal();
      } else {
        const data = await res.json();
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('❌ An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this package? This cannot be undone.')) return;

    try {
      const res = await fetch(`/api/admin/packs?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('✅ Package deleted');
        fetchPacks();
      }
    } catch (error) {
      alert('❌ Failed to delete package');
    }
  };

  const addFeature = () => {
    setFormData({ ...formData, features: [...formData.features, ''] });
  };

  const updateFeature = (index: number, value: string) => {
    const newFeatures = [...formData.features];
    newFeatures[index] = value;
    setFormData({ ...formData, features: newFeatures });
  };

  const removeFeature = (index: number) => {
    if (formData.features.length > 1) {
      setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file');
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      alert('Image size must be less than 10MB');
      return;
    }

    setImageUploading(true);

    try {
      const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dc67gl8fu';
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'innov8_portfolio');
      formData.append('folder', 'packages');

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setFormData((prev) => ({ ...prev, coverImage: data.secure_url }));
      alert('✅ Image uploaded successfully!');
    } catch (error) {
      console.error('Upload error:', error);
      alert('❌ Failed to upload image');
    } finally {
      setImageUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
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
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Photography Packages</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{packs.length} total packages</p>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Package</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {packs.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FiPackage className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Packages Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">Create your first photography package</p>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              <FiPlus className="w-5 h-5" />
              <span>Create Package</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {packs.map((pack) => (
              <div
                key={pack.id}
                className={`bg-white dark:bg-dark-800 rounded-lg shadow-sm border overflow-hidden ${
                  !pack.active ? 'opacity-60 border-gray-300 dark:border-gray-600' : 'border-gray-200 dark:border-gray-700'
                }`}
              >
                <div className="aspect-video bg-gray-100 dark:bg-dark-700 relative">
                  {pack.coverImage ? (
                    <img
                      src={pack.coverImage}
                      alt={pack.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiImage className="w-12 h-12 text-gray-400 dark:text-gray-600" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-white/90 dark:bg-dark-800/90 text-gray-900 dark:text-gray-100 text-xs font-semibold rounded">
                      {pack.category}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{pack.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal(pack)}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-primary hover:bg-gray-100 dark:hover:bg-dark-700 rounded transition"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pack.id)}
                        className="p-2 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded transition"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">{pack.description}</p>

                  <div className="flex items-center justify-between py-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center space-x-1 text-primary">
                      <FiDollarSign className="w-4 h-4" />
                      <span className="font-bold">{pack.price} TND</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400 text-sm">
                      <FiClock className="w-4 h-4" />
                      <span>{pack.duration}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100 dark:border-gray-700">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        {pack.features.length} features • {pack._count?.bookings || 0} bookings
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          pack.active
                            ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                            : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                        }`}
                      >
                        {pack.active ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-dark-800 rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {selectedPack ? 'Edit Package' : 'Add New Package'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Wedding Premium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="Wedding">Wedding</option>
                    <option value="Portrait">Portrait</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Studio">Studio</option>
                    <option value="Event">Event</option>
                    <option value="Product">Product</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Perfect for capturing your special day..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Price (TND) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="999.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Duration *
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="2 hours"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Package Type *
                  </label>
                  <select
                    value={formData.packageType}
                    onChange={(e) => setFormData({ ...formData, packageType: e.target.value })}
                    required
                    className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  >
                    <option value="aymen">Par Aymen</option>
                    <option value="equipe">Par Équipe</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Cover Image (Optional)
                </label>
                <div className="space-y-3">
                  {/* Current Image Preview */}
                  {formData.coverImage && (
                    <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
                      <img
                        src={formData.coverImage}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                      <button
                        type="button"
                        onClick={() => setFormData({ ...formData, coverImage: '' })}
                        className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                      >
                        <FiX className="w-4 h-4" />
                      </button>
                    </div>
                  )}

                  {/* Upload Button */}
                  <div className="flex items-center space-x-3">
                    <label className="flex-1">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={imageUploading}
                        className="hidden"
                      />
                      <div className={`flex items-center justify-center space-x-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-primary hover:bg-gray-50 dark:hover:bg-dark-700 transition ${
                        imageUploading ? 'opacity-50 cursor-not-allowed' : ''
                      }`}>
                        <FiImage className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {imageUploading ? 'Uploading...' : formData.coverImage ? 'Change Image' : 'Upload Image'}
                        </span>
                      </div>
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">
                    Optional: Upload a cover image for this package (Max 10MB)
                  </p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Features Included
                </label>
                {formData.features.map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2 mb-2">
                    <input
                      type="text"
                      value={feature}
                      onChange={(e) => updateFeature(index, e.target.value)}
                      className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                      placeholder="e.g., 200+ edited photos"
                    />
                    {formData.features.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeFeature(index)}
                        className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-sm text-primary dark:text-primary-400 hover:text-primary/80 font-medium"
                >
                  + Add Feature
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="active"
                    checked={formData.active}
                    onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                    className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Active (visible to public)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                >
                  {selectedPack ? 'Update Package' : 'Create Package'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

