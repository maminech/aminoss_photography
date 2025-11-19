'use client';

/**
 * Client Testimonials Page
 * Display approved testimonials and allow submission
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  Image as ImageIcon,
  MessageSquare,
  Upload,
  Send,
  CheckCircle,
  Star,
  Quote,
  Calendar,
  Sparkles
} from 'lucide-react';

interface Testimonial {
  id: string;
  clientName: string;
  rating: number;
  comment: string;
  eventType: string | null;
  eventDate: Date | null;
  photoUrl: string | null;
  featured: boolean;
  createdAt: Date;
}

export default function TestimonialsPage() {
  const router = useRouter();
  const [showForm, setShowForm] = useState(false);
  const [testimonials, setTestimonials] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    type: 'testimonial' as 'testimonial' | 'text' | 'image',
    content: '',
    author: '',
    clientEmail: '',
    image: '',
  });
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Load testimonials
  useEffect(() => {
    const loadTestimonials = async () => {
      try {
        const res = await fetch('/api/public/testimonials');
        if (res.ok) {
          const data = await res.json();
          setTestimonials(data.testimonials || []);
        }
      } catch (error) {
        console.error('Error loading testimonials:', error);
      } finally {
        setLoading(false);
      }
    };
    loadTestimonials();
  }, []);

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
        setFormData(prev => ({ ...prev, image: data.url }));
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.content || !formData.clientEmail) {
      alert('Veuillez remplir tous les champs requis');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/client/remerciements', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (res.ok) {
        setSubmitted(true);
      } else {
        alert('Erreur lors de l\'envoi. Veuillez réessayer.');
      }
    } catch (error) {
      console.error('Error submitting testimonial:', error);
      alert('Erreur lors de l\'envoi. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
        <div className="max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-12 text-center"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="w-24 h-24 mx-auto mb-6 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center"
            >
              <CheckCircle className="w-16 h-16 text-green-600 dark:text-green-400" />
            </motion.div>
            
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              Merci pour votre témoignage! 💝
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 mb-8">
              Votre témoignage a été envoyé avec succès. Il sera examiné par notre équipe et publié prochainement.
            </p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setSubmitted(false);
                  setShowForm(false);
                }}
                className="btn-secondary"
              >
                Voir les témoignages
              </button>
              <button
                onClick={() => router.push('/')}
                className="btn-primary"
              >
                Retour à l'accueil
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-12 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              {showForm ? 'Partagez Votre Expérience' : 'Témoignages de nos Clients'}
            </h1>
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {showForm 
              ? "Votre témoignage nous aide à grandir et inspire d'autres couples. Partagez vos moments précieux avec nous! ✨"
              : "Découvrez les expériences uniques de nos clients et leurs moments inoubliables ✨"
            }
          </p>
          
          {/* Toggle Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-6"
          >
            <button
              onClick={() => setShowForm(!showForm)}
              className="btn-primary inline-flex items-center gap-2"
            >
              {showForm ? (
                <>
                  <Star className="w-5 h-5" />
                  Voir les témoignages
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  Partagez votre expérience
                </>
              )}
            </button>
          </motion.div>
        </motion.div>

        {/* Testimonials Display */}
        {!showForm && (
          <div className="space-y-8">
            {loading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 dark:text-gray-400">Chargement des témoignages...</p>
              </div>
            ) : testimonials.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-card p-12 text-center"
              >
                <Sparkles className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Aucun témoignage pour le moment
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Soyez le premier à partager votre expérience!
                </p>
                <button
                  onClick={() => setShowForm(true)}
                  className="btn-primary"
                >
                  Partagez votre témoignage
                </button>
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {testimonials.map((testimonial, index) => (
                  <motion.div
                    key={testimonial.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className={`glass-card p-6 ${testimonial.featured ? 'border-2 border-primary/50 bg-primary/5' : ''}`}
                  >
                    {testimonial.featured && (
                      <div className="flex items-center gap-2 mb-3">
                        <Star className="w-5 h-5 text-primary fill-primary" />
                        <span className="text-xs font-semibold text-primary uppercase tracking-wide">
                          Témoignage vedette
                        </span>
                      </div>
                    )}

                    {/* Photo */}
                    {testimonial.photoUrl && (
                      <div className="relative w-full aspect-video rounded-lg overflow-hidden mb-4">
                        <Image
                          src={testimonial.photoUrl}
                          alt={testimonial.clientName}
                          fill
                          className="object-cover"
                        />
                      </div>
                    )}

                    {/* Rating */}
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-5 h-5 ${
                            i < testimonial.rating
                              ? 'text-yellow-500 fill-yellow-500'
                              : 'text-gray-300 dark:text-gray-600'
                          }`}
                        />
                      ))}
                    </div>

                    {/* Comment */}
                    <div className="relative mb-4">
                      <Quote className="absolute -top-2 -left-2 w-8 h-8 text-primary/20" />
                      <p className="text-gray-700 dark:text-gray-300 italic pl-6">
                        "{testimonial.comment}"
                      </p>
                    </div>

                    {/* Author */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-700">
                      <div>
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {testimonial.clientName}
                        </p>
                        {testimonial.eventType && (
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {testimonial.eventType}
                          </p>
                        )}
                      </div>
                      {testimonial.eventDate && (
                        <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                          <Calendar className="w-4 h-4" />
                          {new Date(testimonial.eventDate).toLocaleDateString('fr-FR', {
                            month: 'short',
                            year: 'numeric'
                          })}
                        </div>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Form */}
        {showForm && (
          <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="glass-card p-8 space-y-6 max-w-4xl mx-auto"
        >
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
              Type de témoignage
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {[
                { value: 'testimonial', icon: Star, label: 'Témoignage avec photo', desc: 'Partagez votre histoire avec une image' },
                { value: 'text', icon: MessageSquare, label: 'Message simple', desc: 'Un message texte seulement' },
                { value: 'image', icon: ImageIcon, label: 'Photo souvenir', desc: 'Partagez une de vos photos préférées' },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData({ ...formData, type: type.value as any })}
                  className={`p-6 rounded-xl border-2 transition-all ${
                    formData.type === type.value
                      ? 'border-primary bg-primary/10 shadow-lg scale-105'
                      : 'border-gray-200 dark:border-gray-700 hover:border-primary/50 hover:scale-102'
                  }`}
                >
                  <type.icon className={`w-8 h-8 mx-auto mb-3 ${
                    formData.type === type.value ? 'text-primary' : 'text-gray-400'
                  }`} />
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {type.label}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {type.desc}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Content */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {formData.type === 'image' ? 'Description de la photo *' : 'Votre message *'}
            </label>
            <textarea
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              rows={6}
              required
              className="input-field resize-none"
              placeholder={
                formData.type === 'image'
                  ? "Décrivez ce moment spécial..."
                  : "Partagez votre expérience, vos émotions, ce qui vous a marqué..."
              }
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {formData.content.length} / 500 caractères
            </p>
          </div>

          {/* Author Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Votre nom *
            </label>
            <input
              type="text"
              value={formData.author}
              onChange={(e) => setFormData({ ...formData, author: e.target.value })}
              required
              className="input-field"
              placeholder="Ex: Marie & Thomas"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Votre email *
            </label>
            <input
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData({ ...formData, clientEmail: e.target.value })}
              required
              className="input-field"
              placeholder="votre@email.com"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Pour vous contacter si besoin
            </p>
          </div>

          {/* Image Upload */}
          {(formData.type === 'image' || formData.type === 'testimonial') && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                {formData.type === 'image' ? 'Votre photo *' : 'Photo (optionnelle)'}
              </label>
              <div className="space-y-4">
                <label className="btn-secondary flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto">
                  <Upload className="w-5 h-5" />
                  {uploading ? 'Téléchargement...' : 'Choisir une photo'}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
                {formData.image && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="relative w-full max-w-md aspect-video rounded-xl overflow-hidden shadow-lg"
                  >
                    <Image
                      src={formData.image}
                      alt="Preview"
                      fill
                      className="object-cover"
                    />
                  </motion.div>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={submitting || uploading || !formData.content || !formData.clientEmail}
              className="btn-primary w-full py-4 text-lg flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-5 h-5" />
              {submitting ? 'Envoi en cours...' : 'Envoyer mon témoignage'}
            </button>
            <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
              Votre témoignage sera examiné avant publication
            </p>
          </div>
          </motion.form>
        )}

        {/* Info Card */}
        {showForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 glass-card p-6 bg-primary/5 dark:bg-primary/10 border-2 border-primary/20 max-w-4xl mx-auto"
          >
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center">
                <Heart className="w-6 h-6 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                  Pourquoi partager votre témoignage?
                </h3>
                <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <li>✨ Aidez d'autres couples à choisir leur photographe</li>
                  <li>💝 Partagez vos émotions et souvenirs précieux</li>
                  <li>🌟 Inspirez et rendez hommage à votre histoire</li>
                </ul>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
