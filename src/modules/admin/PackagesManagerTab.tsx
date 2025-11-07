'use client';

/**
 * Packages Manager Tab
 * Admin panel for CRUD operations on photography/videography packages
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Eye, 
  EyeOff,
  Camera,
  Video,
  Clock,
  DollarSign,
  CheckCircle,
  Upload,
  X
} from 'lucide-react';

interface Package {
  id: string;
  name: string;
  category: 'photography' | 'videography' | 'both';
  price: number;
  duration: string;
  description: string;
  features: string[];
  coverImage: string;
  active: boolean;
  createdAt: string;
}

export default function PackagesManagerTab() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPackage, setEditingPackage] = useState<Package | null>(null);
  const [formData, setFormData] = useState<Partial<Package>>({
    name: '',
    category: 'photography',
    price: 0,
    duration: '',
    description: '',
    features: [],
    active: true,
  });
  const [newFeature, setNewFeature] = useState('');
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPackages();
  }, []);

  const fetchPackages = async () => {
    try {
      const res = await fetch('/api/packs');
      if (res.ok) {
        const data = await res.json();
        setPackages(data);
      }
    } catch (error) {
      console.error('Error fetching packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price || !formData.duration) return;

    try {
      const url = editingPackage
        ? `/api/admin/packages/${editingPackage.id}`
        : '/api/admin/packages';
      
      const method = editingPackage ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        const data = await res.json();
        if (editingPackage) {
          setPackages(packages.map(p => p.id === data.id ? data : p));
        } else {
          setPackages([...packages, data]);
        }
        handleCloseModal();
      }
    } catch (error) {
      console.error('Error saving package:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce package ?')) return;

    try {
      const res = await fetch(`/api/admin/packages/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setPackages(packages.filter(p => p.id !== id));
      }
    } catch (error) {
      console.error('Error deleting package:', error);
    }
  };

  const handleToggleActive = async (id: string) => {
    const pkg = packages.find(p => p.id === id);
    if (!pkg) return;

    try {
      const res = await fetch(`/api/admin/packages/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !pkg.active }),
      });

      if (res.ok) {
        setPackages(packages.map(p => p.id === id ? { ...p, active: !p.active } : p));
      }
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  const handleEdit = (pkg: Package) => {
    setEditingPackage(pkg);
    setFormData(pkg);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingPackage(null);
    setFormData({
      name: '',
      category: 'photography',
      price: 0,
      duration: '',
      description: '',
      features: [],
      active: true,
    });
    setNewFeature('');
  };

  const handleAddFeature = () => {
    if (!newFeature.trim()) return;
    setFormData({
      ...formData,
      features: [...(formData.features || []), newFeature.trim()],
    });
    setNewFeature('');
  };

  const handleRemoveFeature = (index: number) => {
    setFormData({
      ...formData,
      features: formData.features?.filter((_, i) => i !== index) || [],
    });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formDataUpload = new FormData();
    formDataUpload.append('file', file);

    setUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formDataUpload,
      });

      if (res.ok) {
        const data = await res.json();
        setFormData({ ...formData, coverImage: data.url });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="glass-card p-6 animate-pulse">
            <div className="aspect-video bg-gray-200 dark:bg-gray-700 rounded-lg mb-4" />
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestion des Packages
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {packages.length} package{packages.length !== 1 && 's'} ({packages.filter(p => p.active).length} actif{packages.filter(p => p.active).length !== 1 && 's'})
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouveau Package
        </button>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {packages.length === 0 ? (
          <div className="col-span-full glass-card p-12 text-center">
            <Camera className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Aucun package créé
            </p>
            <button
              onClick={() => setShowModal(true)}
              className="btn-primary mx-auto"
            >
              Créer le premier package
            </button>
          </div>
        ) : (
          packages.map((pkg) => (
            <motion.div
              key={pkg.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`glass-card overflow-hidden ${!pkg.active && 'opacity-60'}`}
            >
              {pkg.coverImage && (
                <div className="relative aspect-video">
                  <Image
                    src={pkg.coverImage}
                    alt={pkg.name}
                    fill
                    className="object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      pkg.category === 'photography' 
                        ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        : pkg.category === 'videography'
                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                        : 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
                    }`}>
                      {pkg.category === 'both' ? '📸+🎥' : pkg.category === 'photography' ? '📸' : '🎥'}
                    </span>
                  </div>
                </div>
              )}

              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  {pkg.name}
                </h3>
                
                <div className="flex items-center gap-4 mb-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center gap-1">
                    <DollarSign className="w-4 h-4" />
                    <span className="font-semibold">{pkg.price} DT</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    <span>{pkg.duration}</span>
                  </div>
                </div>

                <p className="text-sm text-gray-700 dark:text-gray-300 mb-4 line-clamp-2">
                  {pkg.description}
                </p>

                <div className="space-y-2 mb-6">
                  {pkg.features.slice(0, 3).map((feature, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <span>{feature}</span>
                    </div>
                  ))}
                  {pkg.features.length > 3 && (
                    <p className="text-sm text-primary">
                      +{pkg.features.length - 3} autres fonctionnalités
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleEdit(pkg)}
                    className="btn-secondary flex-1 flex items-center justify-center gap-2"
                  >
                    <Edit2 className="w-4 h-4" />
                    Modifier
                  </button>
                  <button
                    onClick={() => handleToggleActive(pkg.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      pkg.active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {pkg.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(pkg.id)}
                    className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 max-w-3xl w-full my-8"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              {editingPackage ? 'Modifier' : 'Nouveau'} Package
            </h3>

            <div className="space-y-4">
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Nom du Package *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Package Mariage Premium"
                />
              </div>

              {/* Category */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Catégorie *
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['photography', 'videography', 'both'].map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setFormData({ ...formData, category: cat as any })}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        formData.category === cat
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        {cat === 'photography' ? <Camera className="w-5 h-5" /> : cat === 'videography' ? <Video className="w-5 h-5" /> : <><Camera className="w-4 h-4" /><Video className="w-4 h-4" /></>}
                        <span className="text-sm font-medium capitalize">
                          {cat === 'both' ? 'Les deux' : cat === 'photography' ? 'Photo' : 'Vidéo'}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Price & Duration */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Prix (DT) *
                  </label>
                  <input
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                    className="input-field"
                    placeholder="Ex: 1500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Durée *
                  </label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="input-field"
                    placeholder="Ex: 8 heures"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="input-field"
                  placeholder="Description du package..."
                />
              </div>

              {/* Features */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Fonctionnalités
                </label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
                    className="input-field flex-1"
                    placeholder="Ajouter une fonctionnalité..."
                  />
                  <button onClick={handleAddFeature} className="btn-secondary">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.features?.map((feature, index) => (
                    <div key={index} className="flex items-center gap-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <CheckCircle className="w-4 h-4 text-green-500" />
                      <span className="flex-1 text-sm text-gray-700 dark:text-gray-300">{feature}</span>
                      <button
                        onClick={() => handleRemoveFeature(index)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cover Image */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Image de Couverture
                </label>
                <div className="flex items-center gap-4">
                  <label className="btn-secondary flex items-center gap-2 cursor-pointer">
                    <Upload className="w-4 h-4" />
                    {uploading ? 'Téléchargement...' : 'Télécharger'}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                      disabled={uploading}
                    />
                  </label>
                  {formData.coverImage && (
                    <div className="relative w-32 h-20 rounded-lg overflow-hidden">
                      <Image src={formData.coverImage} alt="Preview" fill className="object-cover" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleSubmit}
                disabled={!formData.name || !formData.price || !formData.duration || uploading}
                className="btn-primary flex-1"
              >
                {editingPackage ? 'Modifier' : 'Créer'}
              </button>
              <button onClick={handleCloseModal} className="btn-secondary">
                Annuler
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
