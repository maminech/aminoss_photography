'use client';

/**
 * Enhanced Booking Form Component
 * "Demande de devis" section for contact page
 * Includes WhatsApp integration and event type selection
 * TWO-STEP PROCESS: 1) Name + Phone → 2) Show Packages + Full Form
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, MessageSquare, Send, Check, AlertCircle, Package, ChevronRight } from 'lucide-react';

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

interface PackageType {
  id?: string;
  name: string;
  price: number;
  features: string[];
  icon: string;
  active?: boolean;
  order?: number;
}

// Default fallback packages (if DB is empty)
const defaultPackages: PackageType[] = [
  { 
    name: 'Essentiel', 
    price: 299, 
    features: ['2h de couverture', '100 photos retouchées', '1 photographe'],
    icon: '📸'
  },
  { 
    name: 'Premium', 
    price: 499, 
    features: ['4h de couverture', '200 photos retouchées', '1 photographe', 'Album digital'],
    icon: '⭐'
  },
  { 
    name: 'Luxe', 
    price: 799, 
    features: ['Journée complète', '400+ photos', '2 photographes', 'Album premium', 'Vidéo highlights'],
    icon: '👑'
  },
  { 
    name: 'Sur mesure', 
    price: 0, 
    features: ['Package personnalisé selon vos besoins'],
    icon: '✨'
  },
];

export default function EnhancedBookingForm({ prefilledPackage, prefilledPrice }: EnhancedBookingFormProps) {
  // Two-step state
  const [packages, setPackages] = useState<PackageType[]>(defaultPackages);
  const [loadingPackages, setLoadingPackages] = useState(true);

  // Load packages from database
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/admin/packs?active=true');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            // Transform database packs to package format
            const transformedPackages = data.map((pack: any) => ({
              id: pack.id,
              name: pack.name,
              price: pack.price,
              features: pack.features || [],
              icon: getPackageIcon(pack.name),
              active: pack.active,
              order: pack.order,
            }));
            setPackages(transformedPackages);
          }
        }
      } catch (error) {
        console.error('Error loading packages:', error);
        // Keep default packages on error
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchPackages();
  }, []);

  // Helper function to get icon based on package name
  const getPackageIcon = (name: string): string => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('essentiel') || nameLower.includes('basic')) return '📸';
    if (nameLower.includes('premium')) return '⭐';
    if (nameLower.includes('luxe') || nameLower.includes('luxury')) return '👑';
    if (nameLower.includes('mesure') || nameLower.includes('custom')) return '✨';
    return '📦';
  };

  // Two-step state
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPackage, setSelectedPackage] = useState<typeof packages[0] | null>(
    prefilledPackage ? packages.find(p => p.name === prefilledPackage) || null : null
  );

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

      // Redirect to WhatsApp (works better on mobile than window.open)
      setTimeout(() => {
        // Use window.location.href for better mobile compatibility
        window.location.href = whatsappMessage;
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
    const phoneNumber = '21694124796'; // Your WhatsApp number
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleInputChange = (field: keyof BookingFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Handle Step 1 confirmation (name + phone)
  const handleStepOneConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate name and phone
    if (!formData.name.trim() || !formData.phone.trim()) {
      setStatus('error');
      setErrorMessage('Veuillez remplir votre nom et téléphone');
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 3000);
      return;
    }

    // Track that user is viewing packages (Step 2)
    try {
      await fetch('/api/bookings/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          action: 'view-packages',
        }),
      });
    } catch (error) {
      console.error('Tracking error:', error);
      // Don't block user experience if tracking fails
    }

    // Move to step 2
    setStep(2);
  };

  // Handle package selection
  const handlePackageSelect = async (pkg: typeof packages[0]) => {
    setSelectedPackage(pkg);
    setFormData(prev => ({
      ...prev,
      packageName: pkg.name,
      packagePrice: pkg.price > 0 ? pkg.price : undefined,
    }));

    // Track package selection
    try {
      await fetch('/api/bookings/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: formData.phone,
          action: 'select-package',
          packageName: pkg.name,
          packagePrice: pkg.price,
        }),
      });
    } catch (error) {
      console.error('Tracking error:', error);
    }
  };

  return (
    <div className="glass-card p-6 md:p-8">
      <div className="mb-8">
        <h2 className="text-3xl md:text-4xl font-bold mb-3 bg-gradient-to-r from-gray-900 via-primary to-gray-900 dark:from-white dark:via-primary dark:to-white bg-clip-text text-transparent">
          Demande de Devis
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          {step === 1 
            ? 'Commencez par nous laisser vos coordonnées'
            : 'Choisissez votre package et complétez votre demande'
          }
        </p>

        {/* Step Indicator */}
        <div className="flex items-center gap-4 mt-6">
          <div className={`flex items-center gap-2 ${step === 1 ? 'text-primary' : 'text-green-500'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              step === 1 ? 'bg-primary text-white' : 'bg-green-500 text-white'
            }`}>
              {step === 1 ? '1' : <Check className="w-5 h-5" />}
            </div>
            <span className="text-sm font-medium">Contact</span>
          </div>
          
          <div className="flex-1 h-0.5 bg-gray-300 dark:bg-gray-600" />
          
          <div className={`flex items-center gap-2 ${step === 2 ? 'text-primary' : 'text-gray-400'}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${
              step === 2 ? 'bg-primary text-white' : 'bg-gray-300 dark:bg-gray-600'
            }`}>
              2
            </div>
            <span className="text-sm font-medium">Détails</span>
          </div>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {step === 1 ? (
          // STEP 1: Name + Phone only
          <motion.form
            key="step1"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            onSubmit={handleStepOneConfirm}
            className="space-y-6"
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom complet / Full Name *
              </label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="input-field text-lg py-4"
                placeholder="Jean Dupont"
                autoFocus
              />
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
                className="input-field text-lg py-4"
                placeholder="+216 XX XXX XXX"
              />
            </div>

            {/* Status Messages */}
            <AnimatePresence>
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

            <button
              type="submit"
              className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
            >
              <span>Confirmer</span>
              <ChevronRight className="w-5 h-5" />
            </button>

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Vos informations restent confidentielles
            </p>
          </motion.form>
        ) : (
          // STEP 2: Packages + Full Form
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            {/* Package Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
                <Package className="w-4 h-4 inline mr-2" />
                Choisissez votre package *
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {packages.map((pkg) => (
                  <motion.button
                    key={pkg.name}
                    type="button"
                    onClick={() => handlePackageSelect(pkg)}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className={`p-6 rounded-xl border-2 transition-all duration-300 text-left ${
                      selectedPackage?.name === pkg.name
                        ? 'border-primary bg-primary/10 shadow-lg shadow-primary/20 ring-2 ring-primary ring-offset-2 dark:ring-offset-gray-900'
                        : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="text-3xl mb-2">{pkg.icon}</div>
                        <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                          {pkg.name}
                        </h3>
                      </div>
                      {pkg.price > 0 && (
                        <div className="text-right">
                          <div className="text-2xl font-bold text-primary">
                            {pkg.price} DT
                          </div>
                        </div>
                      )}
                    </div>
                    <ul className="space-y-2">
                      {pkg.features.map((feature, idx) => (
                        <li key={idx} className="text-sm text-gray-600 dark:text-gray-400 flex items-center gap-2">
                          <Check className="w-4 h-4 text-primary flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </motion.button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email <span className="text-gray-400">(optionnel)</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="input-field"
            placeholder="jean@example.com"
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
            </motion.div>
          )}
        </AnimatePresence>
    </div>
  );
}
