'use client';

/**
 * Enhanced Booking Form Component
 * "Demande de devis" section for contact page
 * Includes WhatsApp integration and event type selection
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, MessageSquare, Send, Check, AlertCircle } from 'lucide-react';

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  timeSlot: string;
  location: string;
  message: string;
  packageName?: string;
  packagePrice?: number;
}

interface EnhancedBookingFormProps {
  prefilledPackage?: string;
  prefilledPrice?: number;
}

export default function EnhancedBookingForm({ prefilledPackage, prefilledPrice }: EnhancedBookingFormProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    eventType: '',
    eventDate: '',
    timeSlot: '',
    location: '',
    message: '',
    packageName: prefilledPackage,
    packagePrice: prefilledPrice,
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const eventTypes = [
    { value: 'wedding', label: 'Mariage / Wedding', icon: '💒' },
    { value: 'engagement', label: 'Fiançailles / Engagement', icon: '💍' },
    { value: 'studio', label: 'Séance Studio / Studio Session', icon: '📸' },
    { value: 'portrait', label: 'Portrait', icon: '👤' },
    { value: 'fashion', label: 'Mode / Fashion', icon: '👗' },
    { value: 'event', label: 'Événement / Event', icon: '🎉' },
    { value: 'commercial', label: 'Commercial', icon: '🏢' },
    { value: 'other', label: 'Autre / Other', icon: '✨' },
  ];

  const timeSlots = [
    { value: 'morning', label: 'Matin / Morning (8h-12h)' },
    { value: 'afternoon', label: 'Après-midi / Afternoon (14h-18h)' },
    { value: 'evening', label: 'Soirée / Evening (18h-22h)' },
    { value: 'all-day', label: 'Toute la journée / All Day' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    try {
      // Submit to API
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.name,
          clientEmail: formData.email,
          clientPhone: formData.phone,
          eventType: formData.eventType,
          requestedDate: formData.eventDate,
          timeSlot: formData.timeSlot,
          location: formData.location,
          message: `Event Type: ${formData.eventType}\nTime: ${formData.timeSlot}\nLocation: ${formData.location}\n\n${formData.message}`,
          packName: formData.packageName || `Custom ${formData.eventType}`,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit booking');
      }

      // Generate WhatsApp message
      const whatsappMessage = generateWhatsAppMessage();
      
      setStatus('success');

      // Open WhatsApp after short delay
      setTimeout(() => {
        window.open(whatsappMessage, '_blank');
      }, 1500);

      // Reset form after successful submission
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          eventType: '',
          eventDate: '',
          timeSlot: '',
          location: '',
          message: '',
        });
        setStatus('idle');
      }, 3000);

    } catch (error) {
      console.error('Booking error:', error);
      setStatus('error');
      setErrorMessage('Une erreur est survenue. Veuillez réessayer.');
    }
  };

  const generateWhatsAppMessage = () => {
    const eventTypeLabel = eventTypes.find(t => t.value === formData.eventType)?.label || formData.eventType;
    const timeSlotLabel = timeSlots.find(t => t.value === formData.timeSlot)?.label || formData.timeSlot;

    const message = `
📸 *Nouvelle Demande de Devis / New Quote Request*

👤 *Client:* ${formData.name}
📧 *Email:* ${formData.email}
📱 *Téléphone:* ${formData.phone}

📅 *Type d'événement:* ${eventTypeLabel}
📅 *Date:* ${new Date(formData.eventDate).toLocaleDateString('fr-FR')}
🕐 *Horaire:* ${timeSlotLabel}
📍 *Lieu:* ${formData.location}

${formData.packageName ? `📦 *Package:* ${formData.packageName}${formData.packagePrice ? ` (${formData.packagePrice} DT)` : ''}` : ''}

💬 *Message:*
${formData.message || 'Pas de message additionnel'}

---
Envoyé depuis aminossphotography.com
    `.trim();

    // Replace with your WhatsApp number
    const phoneNumber = '21612345678'; // Update with actual number
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleInputChange = (field: keyof BookingFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="glass-card p-6 md:p-8">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 via-primary to-gray-900 dark:from-white dark:via-primary dark:to-white bg-clip-text text-transparent">
          Demande de Devis
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Remplissez le formulaire ci-dessous et nous vous contacterons rapidement
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Nom complet / Full Name *
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="input-field"
              placeholder="Jean Dupont"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              className="input-field"
              placeholder="jean@example.com"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Téléphone / Phone *
          </label>
          <input
            type="tel"
            required
            value={formData.phone}
            onChange={(e) => handleInputChange('phone', e.target.value)}
            className="input-field"
            placeholder="+216 XX XXX XXX"
          />
        </div>

        {/* Event Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Type d'événement / Event Type *
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {eventTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => handleInputChange('eventType', type.value)}
                className={`p-4 rounded-xl border-2 transition-all duration-300 hover:scale-105 ${
                  formData.eventType === type.value
                    ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                }`}
              >
                <div className="text-3xl mb-2">{type.icon}</div>
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  {type.label.split(' / ')[0]}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Calendar className="w-4 h-4 inline mr-2" />
              Date *
            </label>
            <input
              type="date"
              required
              value={formData.eventDate}
              onChange={(e) => handleInputChange('eventDate', e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Clock className="w-4 h-4 inline mr-2" />
              Horaire / Time Slot *
            </label>
            <select
              required
              value={formData.timeSlot}
              onChange={(e) => handleInputChange('timeSlot', e.target.value)}
              className="select-field"
            >
              <option value="">Sélectionner...</option>
              {timeSlots.map((slot) => (
                <option key={slot.value} value={slot.value}>
                  {slot.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Location */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MapPin className="w-4 h-4 inline mr-2" />
            Lieu / Location *
          </label>
          <input
            type="text"
            required
            value={formData.location}
            onChange={(e) => handleInputChange('location', e.target.value)}
            className="input-field"
            placeholder="Sousse, Tunisie"
          />
        </div>

        {/* Message */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            <MessageSquare className="w-4 h-4 inline mr-2" />
            Message (optionnel)
          </label>
          <textarea
            value={formData.message}
            onChange={(e) => handleInputChange('message', e.target.value)}
            rows={4}
            className="textarea-field"
            placeholder="Détails supplémentaires sur votre événement, nombre d'invités, besoins spécifiques..."
          />
        </div>

        {/* Prefilled Package Info */}
        {formData.packageName && (
          <div className="glass-card p-4 border border-primary/30">
            <div className="flex items-center gap-2 text-primary">
              <Check className="w-5 h-5" />
              <span className="font-medium">
                Package sélectionné: {formData.packageName}
                {formData.packagePrice && ` - ${formData.packagePrice} DT`}
              </span>
            </div>
          </div>
        )}

        {/* Status Messages */}
        <AnimatePresence>
          {status === 'success' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-card bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 p-4"
            >
              <div className="flex items-center gap-3 text-green-800 dark:text-green-200">
                <Check className="w-6 h-6" />
                <div>
                  <p className="font-medium">Demande envoyée avec succès!</p>
                  <p className="text-sm">Redirection vers WhatsApp...</p>
                </div>
              </div>
            </motion.div>
          )}

          {status === 'error' && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="glass-card bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 p-4"
            >
              <div className="flex items-center gap-3 text-red-800 dark:text-red-200">
                <AlertCircle className="w-6 h-6" />
                <div>
                  <p className="font-medium">Erreur</p>
                  <p className="text-sm">{errorMessage}</p>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={status === 'loading' || status === 'success'}
          className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {status === 'loading' ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white" />
              <span>Envoi en cours...</span>
            </>
          ) : status === 'success' ? (
            <>
              <Check className="w-5 h-5" />
              <span>Envoyé!</span>
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              <span>Envoyer la demande</span>
            </>
          )}
        </button>

        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          En soumettant ce formulaire, vous acceptez d'être contacté par WhatsApp et email
        </p>
      </form>
    </div>
  );
}
