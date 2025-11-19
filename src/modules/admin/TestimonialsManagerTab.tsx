'use client';

/**
 * Testimonials Manager Tab
 * Admin panel for managing client testimonials
 * Approve, feature, edit, and delete testimonials
 */

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Trash2, 
  Eye, 
  EyeOff, 
  MessageSquare,
  Mail,
  Star,
  Check,
  Clock,
  Calendar,
  Sparkles,
  X,
  Plus,
  Upload,
  User
} from 'lucide-react';

interface Testimonial {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  eventType?: string;
  eventDate?: Date | string;
  photoUrl?: string;
  featured: boolean;
  approved: boolean;
  createdAt: string;
}

export default function TestimonialsManagerTab() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved'>('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    clientName: '',
    rating: 5,
    comment: '',
    eventType: '',
    eventDate: '',
    photoUrl: '',
  });

  useEffect(() => {
    fetchTestimonials();
  }, [filter]);

  const fetchTestimonials = async () => {
    try {
      const status = filter === 'all' ? 'all' : filter;
      const res = await fetch(`/api/admin/testimonials?status=${status}`);
      if (res.ok) {
        const data = await res.json();
        setTestimonials(data.testimonials || data);
      }
    } catch (error) {
      console.error('Error fetching testimonials:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved: true }),
      });

      if (res.ok) {
        setTestimonials(testimonials.map(t => 
          t.id === id ? { ...t, approved: true } : t
        ));
      }
    } catch (error) {
      console.error('Error approving testimonial:', error);
    }
  };

  const handleReject = async (id: string) => {
    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, approved: false }),
      });

      if (res.ok) {
        setTestimonials(testimonials.map(t => 
          t.id === id ? { ...t, approved: false } : t
        ));
      }
    } catch (error) {
      console.error('Error rejecting testimonial:', error);
    }
  };

  const handleToggleFeatured = async (id: string) => {
    const testimonial = testimonials.find(t => t.id === id);
    if (!testimonial) return;

    try {
      const res = await fetch('/api/admin/testimonials', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, featured: !testimonial.featured }),
      });

      if (res.ok) {
        setTestimonials(testimonials.map(t => 
          t.id === id ? { ...t, featured: !t.featured } : t
        ));
      }
    } catch (error) {
      console.error('Error toggling featured:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce témoignage ?')) return;

    try {
      const res = await fetch(`/api/admin/testimonials?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        setTestimonials(testimonials.filter(t => t.id !== id));
      }
    } catch (error) {
      console.error('Error deleting testimonial:', error);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    setUploading(true);
    try {
      const res = await fetch('/api/upload/remerciement', {
        method: 'POST',
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setNewTestimonial({ ...newTestimonial, photoUrl: data.url });
      } else {
        alert('Erreur lors du téléchargement de l\'image');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Erreur lors du téléchargement de l\'image');
    } finally {
      setUploading(false);
    }
  };

  const handleAddTestimonial = async () => {
    if (!newTestimonial.clientName.trim() || !newTestimonial.comment.trim()) {
      alert('Veuillez remplir le nom du client et le commentaire');
      return;
    }

    setUploading(true);
    try {
      const res = await fetch('/api/admin/testimonials/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: newTestimonial.clientName.trim(),
          rating: newTestimonial.rating,
          comment: newTestimonial.comment.trim(),
          eventType: newTestimonial.eventType.trim() || null,
          eventDate: newTestimonial.eventDate || null,
          photoUrl: newTestimonial.photoUrl || null,
          approved: true, // Admin-created testimonials are auto-approved
          featured: false,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setTestimonials([data.testimonial, ...testimonials]);
        setShowAddModal(false);
        setNewTestimonial({
          clientName: '',
          rating: 5,
          comment: '',
          eventType: '',
          eventDate: '',
          photoUrl: '',
        });
      } else {
        const error = await res.json();
        alert(error.error || 'Erreur lors de l\'ajout du témoignage');
      }
    } catch (error) {
      console.error('Error adding testimonial:', error);
      alert('Erreur lors de l\'ajout du témoignage');
    } finally {
      setUploading(false);
    }
  };

  const formatDate = (date: Date | string) => {
    const d = new Date(date);
    return d.toLocaleDateString('fr-FR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  const pendingCount = testimonials.filter(t => !t.approved).length;
  const approvedCount = testimonials.filter(t => t.approved).length;
  const featuredCount = testimonials.filter(t => t.featured).length;

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
      <div className="mb-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gestion des Témoignages
            </h2>
            <div className="flex items-center gap-4 mt-2">
              <p className="text-gray-600 dark:text-gray-400">
                {testimonials.length} témoignage{testimonials.length !== 1 && 's'}
              </p>
              <span className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-sm font-medium">
                ✓ {approvedCount} approuvé{approvedCount !== 1 && 's'}
              </span>
              <span className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded-full text-sm font-medium">
                ⭐ {featuredCount} coup{featuredCount !== 1 && 's'} de cœur
              </span>
              {pendingCount > 0 && (
                <span className="px-3 py-1 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded-full text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {pendingCount} en attente
                </span>
              )}
            </div>
          </div>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors shadow-lg"
          >
            <Plus className="w-4 h-4" />
            Ajouter un témoignage
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2">
          {[
            { value: 'all', label: 'Tous', count: testimonials.length },
            { value: 'pending', label: 'En attente', count: pendingCount },
            { value: 'approved', label: 'Approuvés', count: approvedCount },
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setFilter(tab.value as any)}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                filter === tab.value
                  ? 'bg-primary text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          ))}
        </div>
      </div>

      {/* Testimonials List */}
      <div className="space-y-4">
        {testimonials.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <MessageSquare className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400 mb-2">
              {filter === 'pending' 
                ? 'Aucun témoignage en attente' 
                : filter === 'approved'
                ? 'Aucun témoignage approuvé'
                : 'Aucun témoignage soumis'}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500">
              Les clients peuvent soumettre leurs témoignages depuis la page /testimonials
            </p>
          </div>
        ) : (
          testimonials.map((testimonial) => (
            <motion.div
              key={testimonial.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`glass-card p-6 ${!testimonial.approved && 'border-2 border-amber-300 dark:border-amber-700'}`}
            >
              <div className="flex items-start gap-4">
                {/* Photo */}
                {testimonial.photoUrl && (
                  <div className="relative w-16 h-16 rounded-full overflow-hidden flex-shrink-0">
                    <Image
                      src={testimonial.photoUrl}
                      alt={testimonial.clientName}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Content */}
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-semibold text-gray-900 dark:text-white text-lg">
                          {testimonial.clientName}
                        </h3>
                        {!testimonial.approved && (
                          <span className="px-2 py-0.5 bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 rounded text-xs font-medium">
                            En attente
                          </span>
                        )}
                        {testimonial.featured && (
                          <span className="px-2 py-0.5 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400 rounded text-xs font-medium flex items-center gap-1">
                            <Sparkles className="w-3 h-3" />
                            Coup de cœur
                          </span>
                        )}
                      </div>
                      
                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <Star
                            key={star}
                            className={`w-4 h-4 ${
                              star <= testimonial.rating
                                ? 'text-yellow-500 fill-yellow-500'
                                : 'text-gray-300 dark:text-gray-600'
                            }`}
                          />
                        ))}
                      </div>

                      {/* Metadata */}
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        {testimonial.eventType && (
                          <span className="capitalize">{testimonial.eventType}</span>
                        )}
                        {testimonial.eventDate && (
                          <>
                            <span>•</span>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {formatDate(testimonial.eventDate)}
                            </div>
                          </>
                        )}
                        <span>•</span>
                        <span>{formatDate(testimonial.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Comment */}
                  <blockquote className="text-gray-700 dark:text-gray-300 italic border-l-4 border-primary pl-4 py-2">
                    "{testimonial.comment}"
                  </blockquote>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2">
                  {!testimonial.approved ? (
                    <>
                      <button
                        onClick={() => handleApprove(testimonial.id)}
                        className="p-2 rounded-lg bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/30 dark:text-green-400 transition-colors"
                        title="Approuver"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                        title="Rejeter et supprimer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => handleToggleFeatured(testimonial.id)}
                        className={`p-2 rounded-lg transition-colors ${
                          testimonial.featured
                            ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400'
                        }`}
                        title={testimonial.featured ? 'Retirer des coups de cœur' : 'Mettre en coup de cœur'}
                      >
                        <Sparkles className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleReject(testimonial.id)}
                        className="p-2 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-700 dark:text-gray-400 transition-colors"
                        title="Retirer l'approbation"
                      >
                        <EyeOff className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(testimonial.id)}
                        className="p-2 rounded-lg bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Add Testimonial Modal */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">
                      Ajouter un témoignage
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Télécharger une capture d'écran de témoignage client
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-5">
                {/* Client Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nom du client *
                  </label>
                  <input
                    type="text"
                    value={newTestimonial.clientName}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, clientName: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ex: Sarah Martin"
                  />
                </div>

                {/* Rating */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Note *
                  </label>
                  <div className="flex gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setNewTestimonial({ ...newTestimonial, rating: star })}
                        className="group"
                      >
                        <Star
                          className={`w-8 h-8 transition-all ${
                            star <= newTestimonial.rating
                              ? 'fill-yellow-400 text-yellow-400'
                              : 'text-gray-300 dark:text-gray-600 group-hover:text-yellow-200'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Comment */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Commentaire *
                  </label>
                  <textarea
                    value={newTestimonial.comment}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, comment: e.target.value })}
                    rows={4}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent resize-none"
                    placeholder="Leur retour d'expérience..."
                  />
                </div>

                {/* Event Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Type d'événement
                  </label>
                  <input
                    type="text"
                    value={newTestimonial.eventType}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, eventType: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                    placeholder="Ex: Mariage, Baptême..."
                  />
                </div>

                {/* Event Date */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Date de l'événement
                  </label>
                  <input
                    type="date"
                    value={newTestimonial.eventDate}
                    onChange={(e) => setNewTestimonial({ ...newTestimonial, eventDate: e.target.value })}
                    className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Capture d'écran
                  </label>
                  <div className="space-y-3">
                    <label className="flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg cursor-pointer hover:border-primary dark:hover:border-primary transition-colors">
                      <Upload className="w-5 h-5 text-gray-500" />
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        {uploading ? 'Téléchargement...' : 'Télécharger une image'}
                      </span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="hidden"
                      />
                    </label>
                    {newTestimonial.photoUrl && (
                      <div className="relative w-full h-40 rounded-lg overflow-hidden">
                        <Image
                          src={newTestimonial.photoUrl}
                          alt="Aperçu"
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="p-6 border-t border-gray-200 dark:border-gray-800 flex gap-3">
                <button
                  onClick={() => {
                    setShowAddModal(false);
                    setNewTestimonial({
                      clientName: '',
                      rating: 5,
                      comment: '',
                      eventType: '',
                      eventDate: '',
                      photoUrl: '',
                    });
                  }}
                  className="flex-1 px-6 py-3 rounded-lg border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleAddTestimonial}
                  disabled={uploading || !newTestimonial.clientName || !newTestimonial.comment}
                  className="flex-1 px-6 py-3 rounded-lg bg-primary text-white hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {uploading ? 'Téléchargement...' : 'Ajouter le témoignage'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
