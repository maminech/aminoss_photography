'use client';

/**
 * Client Testimonials Page
 * Beautiful form for clients to submit testimonials with images
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { 
  Heart, 
  Image as ImageIcon,
  MessageSquare,
  Upload,
  Send,
  CheckCircle,
  Star
} from 'lucide-react';

export default function TestimonialsPage() {
  const router = useRouter();
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
                onClick={() => setSubmitted(false)}
                className="btn-secondary"
              >
                Envoyer un autre
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
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center gap-3 mb-4">
            <Heart className="w-8 h-8 text-primary" />
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white">
              Partagez Votre Expérience
            </h1>
            <Heart className="w-8 h-8 text-primary" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Votre témoignage nous aide à grandir et inspire d'autres couples. Partagez vos moments précieux avec nous! ✨
          </p>
        </motion.div>

        {/* Form */}
        <motion.form
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          onSubmit={handleSubmit}
          className="glass-card p-8 space-y-6"
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

        {/* Info Card */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mt-8 glass-card p-6 bg-primary/5 dark:bg-primary/10 border-2 border-primary/20"
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
      </div>
    </div>
  );
}
