'use client';

/**
 * Remerciements Manager Tab
 * Admin panel for managing thank-you messages and images
 * Upload, reorder, activate/deactivate items
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { 
  Plus, 
  Trash2, 
  Eye, 
  EyeOff, 
  Image as ImageIcon,
  Type,
  MessageSquare,
  GripVertical,
  Upload
} from 'lucide-react';

interface RemerciementItem {
  id: string;
  type: 'image' | 'text' | 'testimonial';
  content: string;
  author?: string;
  image?: string;
  active: boolean;
  order: number;
}

export default function RemerciementsManagerTab() {
  const [items, setItems] = useState<RemerciementItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState<Partial<RemerciementItem>>({
    type: 'text',
    content: '',
    active: true,
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const res = await fetch('/api/admin/remerciements');
      if (res.ok) {
        const data = await res.json();
        setItems(data.sort((a: RemerciementItem, b: RemerciementItem) => a.order - b.order));
      }
    } catch (error) {
      console.error('Error fetching remerciements:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = async () => {
    if (!newItem.content) return;

    setUploading(true);
    try {
      const res = await fetch('/api/admin/remerciements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...newItem,
          order: items.length,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setItems([...items, data]);
        setShowAddModal(false);
        setNewItem({ type: 'text', content: '', active: true });
      }
    } catch (error) {
      console.error('Error adding remerciement:', error);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;

    try {
      const res = await fetch(`/api/admin/remerciements/${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setItems(items.filter(item => item.id !== id));
      }
    } catch (error) {
      console.error('Error deleting remerciement:', error);
    }
  };

  const handleToggleActive = async (id: string) => {
    const item = items.find(i => i.id === id);
    if (!item) return;

    try {
      const res = await fetch(`/api/admin/remerciements/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: !item.active }),
      });

      if (res.ok) {
        setItems(items.map(i => i.id === id ? { ...i, active: !i.active } : i));
      }
    } catch (error) {
      console.error('Error toggling active:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setNewItem({ ...newItem, image: data.url });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setUploading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon className="w-5 h-5" />;
      case 'text': return <Type className="w-5 h-5" />;
      case 'testimonial': return <MessageSquare className="w-5 h-5" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="glass-card p-6 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
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
            Gestion des Remerciements
          </h2>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {items.length} élément{items.length !== 1 && 's'} ({items.filter(i => i.active).length} actif{items.filter(i => i.active).length !== 1 && 's'})
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Ajouter
        </button>
      </div>

      {/* Items List */}
      <div className="space-y-4">
        {items.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              Aucun remerciement créé
            </p>
            <button
              onClick={() => setShowAddModal(true)}
              className="btn-primary mx-auto"
            >
              Créer le premier
            </button>
          </div>
        ) : (
          items.map((item) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`glass-card p-6 ${!item.active && 'opacity-60'}`}
            >
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <GripVertical className="w-5 h-5 text-gray-400 cursor-move" />
                </div>

                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      {getTypeIcon(item.type)}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 dark:text-white capitalize">
                        {item.type}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Ordre: {item.order + 1}
                      </p>
                    </div>
                  </div>

                  {item.type === 'image' && item.image && (
                    <div className="relative w-full max-w-md aspect-video rounded-lg overflow-hidden mb-3">
                      <Image
                        src={item.image}
                        alt={item.content}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <p className="text-gray-700 dark:text-gray-300 mb-2">
                    {item.content}
                  </p>

                  {item.author && (
                    <p className="text-sm text-primary font-medium">
                      - {item.author}
                    </p>
                  )}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => handleToggleActive(item.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      item.active
                        ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400'
                        : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                    }`}
                  >
                    {item.active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => handleDelete(item.id)}
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

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
          >
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
              Ajouter un Remerciement
            </h3>

            <div className="space-y-4">
              {/* Type Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {['text', 'image', 'testimonial'].map((type) => (
                    <button
                      key={type}
                      onClick={() => setNewItem({ ...newItem, type: type as any })}
                      className={`p-4 rounded-lg border-2 transition-colors ${
                        newItem.type === type
                          ? 'border-primary bg-primary/10'
                          : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                      }`}
                    >
                      <div className="flex flex-col items-center gap-2">
                        {getTypeIcon(type)}
                        <span className="text-sm font-medium capitalize">{type}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contenu *
                </label>
                <textarea
                  value={newItem.content}
                  onChange={(e) => setNewItem({ ...newItem, content: e.target.value })}
                  rows={4}
                  className="input-field"
                  placeholder={newItem.type === 'image' ? 'Description de l\'image' : 'Votre message...'}
                />
              </div>

              {/* Author (for text and testimonial) */}
              {(newItem.type === 'text' || newItem.type === 'testimonial') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Auteur (optionnel)
                  </label>
                  <input
                    type="text"
                    value={newItem.author || ''}
                    onChange={(e) => setNewItem({ ...newItem, author: e.target.value })}
                    className="input-field"
                    placeholder="Nom du client"
                  />
                </div>
              )}

              {/* Image Upload */}
              {(newItem.type === 'image' || newItem.type === 'testimonial') && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Image {newItem.type === 'image' && '*'}
                  </label>
                  <div className="flex items-center gap-4">
                    <label className="btn-secondary flex items-center gap-2 cursor-pointer">
                      <Upload className="w-4 h-4" />
                      Télécharger
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                    </label>
                    {newItem.image && (
                      <div className="relative w-20 h-20 rounded-lg overflow-hidden">
                        <Image src={newItem.image} alt="Preview" fill className="object-cover" />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleAdd}
                disabled={!newItem.content || uploading || (newItem.type === 'image' && !newItem.image)}
                className="btn-primary flex-1"
              >
                {uploading ? 'Chargement...' : 'Ajouter'}
              </button>
              <button
                onClick={() => {
                  setShowAddModal(false);
                  setNewItem({ type: 'text', content: '', active: true });
                }}
                className="btn-secondary"
              >
                Annuler
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
}
