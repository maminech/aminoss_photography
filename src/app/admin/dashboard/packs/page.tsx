'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiPackage, FiDollarSign, FiClock, FiImage } from 'react-icons/fi';

interface Pack {
  id: string;
  name: string;
  description: string;
  price: number;
  duration: string;
  coverImage: string;
  features: string[];
  category: string;
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

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    duration: '',
    coverImage: '',
    features: [''],
    category: 'Wedding',
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
        coverImage: pack.coverImage,
        features: pack.features.length > 0 ? pack.features : [''],
        category: pack.category,
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Photography Packages</h1>
              <p className="text-sm text-gray-600 mt-1">{packs.length} total packages</p>
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
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FiPackage className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Packages Yet</h3>
            <p className="text-gray-600 mb-6">Create your first photography package</p>
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
                className={`bg-white rounded-lg shadow-sm border overflow-hidden ${
                  !pack.active ? 'opacity-60 border-gray-300' : 'border-gray-200'
                }`}
              >
                <div className="aspect-video bg-gray-100 relative">
                  {pack.coverImage ? (
                    <img
                      src={pack.coverImage}
                      alt={pack.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FiImage className="w-12 h-12 text-gray-400" />
                    </div>
                  )}
                  <div className="absolute top-2 left-2">
                    <span className="px-2 py-1 bg-white/90 text-xs font-semibold rounded">
                      {pack.category}
                    </span>
                  </div>
                </div>

                <div className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">{pack.name}</h3>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => openModal(pack)}
                        className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded transition"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(pack.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">{pack.description}</p>

                  <div className="flex items-center justify-between py-3 border-t border-gray-100">
                    <div className="flex items-center space-x-1 text-primary">
                      <FiDollarSign className="w-4 h-4" />
                      <span className="font-bold">{pack.price} TND</span>
                    </div>
                    <div className="flex items-center space-x-1 text-gray-600 text-sm">
                      <FiClock className="w-4 h-4" />
                      <span>{pack.duration}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {pack.features.length} features • {pack._count?.bookings || 0} bookings
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          pack.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
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
          <div className="bg-white rounded-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {selectedPack ? 'Edit Package' : 'Add New Package'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Package Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Wedding Premium"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category *
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
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
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Perfect for capturing your special day..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Price (TND) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="999.00"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Duration *
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    required
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="2 hours"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cover Image URL *
                </label>
                <input
                  type="url"
                  value={formData.coverImage}
                  onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="https://images.unsplash.com/..."
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use Unsplash, Cloudinary, or any image URL
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
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
                        className="p-2 text-red-600 hover:bg-red-50 rounded"
                      >
                        <FiX className="w-5 h-5" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addFeature}
                  className="text-sm text-primary hover:text-primary/80 font-medium"
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
                    className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                  />
                  <label htmlFor="active" className="text-sm font-medium text-gray-700">
                    Active (visible to public)
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Display Order
                  </label>
                  <input
                    type="number"
                    value={formData.order}
                    onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="0"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
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
