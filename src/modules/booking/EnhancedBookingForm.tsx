'use client';

/**
 * Enhanced Booking Form Component with Multi-Event Support
 * "Demande de devis" section for contact page
 * Includes WhatsApp integration and multiple events/dates support
 * TWO-STEP PROCESS: 1) Name + Phone → 2) Show Packages + Full Form
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, MessageSquare, Send, Check, AlertCircle, Package, ChevronRight, X, Edit } from 'lucide-react';

interface EventDetails {
  eventType: string;
  eventDate: string;
  timeSlot: string;
  location: string;
  packageType?: string; // 'aymen' or 'equipe'
  packageLevel?: string; // 'pack1', 'pack2', 'pack3'
}

interface BookingFormData {
  name: string;
  email: string;
  phone: string;
  message: string;
  packageName?: string;
  packagePrice?: number;
  events: EventDetails[]; // Multiple events support
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
  const [packageImages, setPackageImages] = useState<string[]>([]);
  const [showPackageImages, setShowPackageImages] = useState(false);
  const [hasViewedPackages, setHasViewedPackages] = useState(false);

  // Load packages from database
  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const response = await fetch('/api/admin/packs?active=true');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
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
      } finally {
        setLoadingPackages(false);
      }
    };

    fetchPackages();
  }, []);

  // Load package images from settings
  useEffect(() => {
    const fetchPackageImages = async () => {
      try {
        const response = await fetch('/api/admin/settings');
        if (response.ok) {
          const settings = await response.json();
          const images = [];
          
          // First, check for new packageImages array format
          if (settings.packageImages && Array.isArray(settings.packageImages) && settings.packageImages.length > 0) {
            images.push(...settings.packageImages);
          } else {
            // Fallback to old format for backward compatibility
            if (settings.packageImage1) images.push(settings.packageImage1);
            if (settings.packageImage2) images.push(settings.packageImage2);
          }
          
          if (images.length > 0) {
            setPackageImages(images);
          }
        }
      } catch (error) {
        console.error('Error loading package images:', error);
      }
    };

    fetchPackageImages();
  }, []);

  const getPackageIcon = (name: string): string => {
    const nameLower = name.toLowerCase();
    if (nameLower.includes('essentiel') || nameLower.includes('basic')) return '📸';
    if (nameLower.includes('premium')) return '⭐';
    if (nameLower.includes('luxe') || nameLower.includes('luxury')) return '👑';
    if (nameLower.includes('mesure') || nameLower.includes('custom')) return '✨';
    return '📦';
  };

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedPackage, setSelectedPackage] = useState<typeof packages[0] | null>(
    prefilledPackage ? packages.find(p => p.name === prefilledPackage) || null : null
  );

  const [formData, setFormData] = useState<BookingFormData>({
    name: '',
    email: '',
    phone: '',
    message: '',
    packageName: prefilledPackage,
    packagePrice: prefilledPrice,
    events: [],
  });

  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [isAddingEvent, setIsAddingEvent] = useState(false);
  const [currentEvent, setCurrentEvent] = useState<EventDetails>({
    eventType: '',
    eventDate: '',
    timeSlot: '',
    location: '',
    packageType: '',
    packageLevel: '',
  });

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
    { value: 'midi-apres-midi', label: 'Midi / Après-midi', icon: '☀️' },
    { value: 'soiree', label: 'Soirée', icon: '🌙' },
    { value: 'les-deux', label: 'Les deux', icon: '☀️🌙' },
  ];

  const packageTypes = [
    { value: 'aymen', label: 'Par Aymen', icon: '👤' },
    { value: 'equipe', label: 'Par Équipe', icon: '👥' },
  ];

  const [packDetails, setPackDetails] = useState<{[key: string]: PackageType}>({});
  const [selectedPackDetails, setSelectedPackDetails] = useState<PackageType | null>(null);

  const packageLevels = [
    { value: 'pack1', label: 'Pack 1', description: packDetails['pack1']?.name || 'Essentiel' },
    { value: 'pack2', label: 'Pack 2', description: packDetails['pack2']?.name || 'Premium' },
    { value: 'pack3', label: 'Pack 3', description: packDetails['pack3']?.name || 'Luxe' },
  ];

  // Load pack details
  useEffect(() => {
    const fetchPackDetails = async () => {
      try {
        const response = await fetch('/api/admin/packs?active=true');
        if (response.ok) {
          const data = await response.json();
          if (data && data.length >= 3) {
            // Map first 3 packs to pack1, pack2, pack3
            const details: {[key: string]: PackageType} = {
              pack1: {
                name: data[0].name,
                price: data[0].price,
                features: data[0].features || [],
                icon: '📦',
              },
              pack2: {
                name: data[1].name,
                price: data[1].price,
                features: data[1].features || [],
                icon: '⭐',
              },
              pack3: {
                name: data[2].name,
                price: data[2].price,
                features: data[2].features || [],
                icon: '👑',
              },
            };
            setPackDetails(details);
          }
        }
      } catch (error) {
        console.error('Error loading pack details:', error);
      }
    };

    fetchPackDetails();
  }, []);

  // Add event to the list
  const handleAddEvent = () => {
    if (!currentEvent.eventType || !currentEvent.eventDate || !currentEvent.timeSlot || !currentEvent.packageType || !currentEvent.packageLevel) {
      setStatus('error');
      setErrorMessage('Veuillez remplir tous les champs requis de l\'événement (Type, Date, Horaire, et Forfait)');
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 3000);
      return;
    }

    setFormData(prev => ({
      ...prev,
      events: [...prev.events, currentEvent],
    }));

    setCurrentEvent({
      eventType: '',
      eventDate: '',
      timeSlot: '',
      location: '',
      packageType: '',
      packageLevel: '',
    });
    setIsAddingEvent(false);
  };

  const handleRemoveEvent = (index: number) => {
    setFormData(prev => ({
      ...prev,
      events: prev.events.filter((_, i) => i !== index),
    }));
  };

  const handleEditEvent = (index: number) => {
    const eventToEdit = formData.events[index];
    setCurrentEvent(eventToEdit);
    handleRemoveEvent(index);
    setIsAddingEvent(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setErrorMessage('');

    if (formData.events.length === 0) {
      setStatus('error');
      setErrorMessage('Veuillez ajouter au moins un événement');
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 3000);
      return;
    }

    try {
      const firstEvent = formData.events[0];
      
      // Generate package name from first event
      const packageTypeLabel = packageTypes.find(t => t.value === firstEvent.packageType)?.label || firstEvent.packageType;
      const packageLevelLabel = packageLevels.find(t => t.value === firstEvent.packageLevel)?.label || firstEvent.packageLevel;
      const generatedPackageName = `${packageTypeLabel} - ${packageLevelLabel}`;

      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          clientName: formData.name,
          clientEmail: formData.email,
          clientPhone: formData.phone,
          events: formData.events, // ALL events with package info per event
          eventType: firstEvent.eventType,
          requestedDate: firstEvent.eventDate,
          timeSlot: firstEvent.timeSlot,
          location: firstEvent.location,
          message: formData.message,
          packName: formData.packageName || generatedPackageName,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit booking');
      }

      const whatsappMessage = generateWhatsAppMessage();
      setStatus('success');

      setTimeout(() => {
        window.location.href = whatsappMessage;
      }, 1500);

      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          phone: '',
          message: '',
          events: [],
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
    const eventsText = formData.events.map((event, index) => {
      const eventTypeLabel = eventTypes.find(t => t.value === event.eventType)?.label || event.eventType;
      const timeSlotLabel = timeSlots.find(t => t.value === event.timeSlot)?.label || event.timeSlot;
      const packageTypeLabel = packageTypes.find(t => t.value === event.packageType)?.label || event.packageType;
      const packageLevelLabel = packageLevels.find(t => t.value === event.packageLevel)?.label || event.packageLevel;
      
      return `
*Événement ${index + 1}:*
   📅 Type: ${eventTypeLabel}
   📆 Date: ${new Date(event.eventDate).toLocaleDateString('fr-FR')}
   🕐 Horaire: ${timeSlotLabel}
   📦 Forfait: ${packageTypeLabel} - ${packageLevelLabel}
   ${event.location ? `📍 Lieu: ${event.location}` : ''}`;
    }).join('\n');

    const message = `
📸 *Nouvelle Demande de Devis / New Quote Request*

👤 *Client:* ${formData.name}
📧 *Email:* ${formData.email || 'Non fourni'}
📱 *Téléphone:* ${formData.phone}

${formData.packageName ? `📦 *Package:* ${formData.packageName}${formData.packagePrice ? ` (${formData.packagePrice} DT)` : ''}` : ''}

📋 *Événements demandés (${formData.events.length}):*
${eventsText}

💬 *Message:*
${formData.message || 'Pas de message additionnel'}

---
Envoyé depuis innov8production.com
    `.trim();

    const phoneNumber = '21694124796';
    return `https://wa.me/${phoneNumber}?text=${encodeURIComponent(message)}`;
  };

  const handleInputChange = (field: keyof BookingFormData, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleStepOneConfirm = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.phone.trim()) {
      setStatus('error');
      setErrorMessage('Veuillez remplir votre nom et téléphone');
      setTimeout(() => {
        setStatus('idle');
        setErrorMessage('');
      }, 3000);
      return;
    }

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
    }

    setStep(2);
  };

  const handlePackageSelect = async (pkg: typeof packages[0]) => {
    setSelectedPackage(pkg);
    setFormData(prev => ({
      ...prev,
      packageName: pkg.name,
      packagePrice: pkg.price > 0 ? pkg.price : undefined,
    }));

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
            : 'Choisissez votre package et ajoutez vos événements'
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

            {/* View Packages Button */}
            <motion.button
              type="button"
              onClick={() => setShowPackageImages(true)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
            >
              <Package className="w-6 h-6" />
              <span>Voir nos Packages</span>
              <ChevronRight className="w-5 h-5" />
            </motion.button>

            {hasViewedPackages && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                type="submit"
                className="btn-primary w-full flex items-center justify-center gap-2 text-lg py-4"
              >
                <span>Continuer</span>
                <ChevronRight className="w-5 h-5" />
              </motion.button>
            )}

            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Vos informations restent confidentielles
            </p>
          </motion.form>
        ) : (
          // STEP 2: Packages + Multi-Event Form
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
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

              {/* Multi-Event Section */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                    <Calendar className="w-4 h-4 inline mr-2" />
                    Événements / Events * {formData.events.length > 0 && `(${formData.events.length})`}
                  </label>
                  {!isAddingEvent && (
                    <button
                      type="button"
                      onClick={() => setIsAddingEvent(true)}
                      className="text-sm text-primary hover:text-primary/80 font-medium flex items-center gap-1"
                    >
                      <span>+ Ajouter un événement</span>
                    </button>
                  )}
                </div>

                {/* Display added events */}
                {formData.events.length > 0 && (
                  <div className="space-y-3">
                    {formData.events.map((event, index) => {
                      const eventTypeLabel = eventTypes.find(t => t.value === event.eventType)?.label || event.eventType;
                      const timeSlotLabel = timeSlots.find(t => t.value === event.timeSlot)?.label || event.timeSlot;
                      const eventIcon = eventTypes.find(t => t.value === event.eventType)?.icon || '📅';
                      const packageTypeLabel = packageTypes.find(t => t.value === event.packageType)?.label || event.packageType;
                      const packageLevelLabel = packageLevels.find(t => t.value === event.packageLevel)?.label || event.packageLevel;

                      return (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, y: -10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 10 }}
                          className="glass-card p-4 border border-primary/20 bg-primary/5"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-2xl">{eventIcon}</span>
                                <h4 className="font-semibold text-gray-900 dark:text-white">
                                  {eventTypeLabel.split(' / ')[0]}
                                </h4>
                                <span className="px-2 py-0.5 bg-primary/20 text-primary text-xs rounded-full">
                                  #{index + 1}
                                </span>
                              </div>
                              <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                                <p>📅 {new Date(event.eventDate).toLocaleDateString('fr-FR', { 
                                  weekday: 'long', 
                                  year: 'numeric', 
                                  month: 'long', 
                                  day: 'numeric' 
                                })}</p>
                                <p>🕐 {timeSlotLabel}</p>
                                <p>📦 <strong>{packageTypeLabel}</strong> - {packageLevelLabel}</p>
                                {event.location && <p>📍 {event.location}</p>}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleEditEvent(index)}
                                className="p-2 text-primary hover:bg-primary/10 rounded-lg transition-colors"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                type="button"
                                onClick={() => handleRemoveEvent(index)}
                                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                                title="Supprimer"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                )}

                {/* Event Form (collapsible) */}
                <AnimatePresence>
                  {isAddingEvent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="glass-card p-4 border-2 border-dashed border-primary/30 space-y-4"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                          <span className="text-primary">+</span>
                          Nouvel événement
                        </h4>
                        <button
                          type="button"
                          onClick={() => setIsAddingEvent(false)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Event Type */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Type d'événement *
                        </label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                          {eventTypes.map((type) => (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => setCurrentEvent(prev => ({ ...prev, eventType: type.value }))}
                              className={`p-3 rounded-lg border-2 transition-all text-center ${
                                currentEvent.eventType === type.value
                                  ? 'border-primary bg-primary/10'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                              }`}
                            >
                              <div className="text-2xl mb-1">{type.icon}</div>
                              <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {type.label.split(' / ')[0]}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Date */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Date *
                        </label>
                        <input
                          type="date"
                          value={currentEvent.eventDate}
                          onChange={(e) => setCurrentEvent(prev => ({ ...prev, eventDate: e.target.value }))}
                          min={new Date().toISOString().split('T')[0]}
                          className="input-field"
                        />
                      </div>

                      {/* Time Slot - Radio Buttons */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Horaire *
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {timeSlots.map((slot) => (
                            <button
                              key={slot.value}
                              type="button"
                              onClick={() => setCurrentEvent(prev => ({ ...prev, timeSlot: slot.value }))}
                              className={`p-3 rounded-lg border-2 transition-all text-center ${
                                currentEvent.timeSlot === slot.value
                                  ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                              }`}
                            >
                              <div className="text-2xl mb-1">{slot.icon}</div>
                              <div className="text-xs font-medium text-gray-700 dark:text-gray-300">
                                {slot.label}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Package Type - Radio Buttons */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Type de Forfait *
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                          {packageTypes.map((type) => (
                            <button
                              key={type.value}
                              type="button"
                              onClick={() => setCurrentEvent(prev => ({ ...prev, packageType: type.value }))}
                              className={`p-4 rounded-lg border-2 transition-all text-center ${
                                currentEvent.packageType === type.value
                                  ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                              }`}
                            >
                              <div className="text-3xl mb-2">{type.icon}</div>
                              <div className="text-sm font-bold text-gray-900 dark:text-white">
                                {type.label}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Package Level - Radio Buttons */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          Niveau de Pack *
                        </label>
                        <div className="grid grid-cols-3 gap-3">
                          {packageLevels.map((level) => (
                            <button
                              key={level.value}
                              type="button"
                              onClick={() => {
                                setCurrentEvent(prev => ({ ...prev, packageLevel: level.value }));
                                setSelectedPackDetails(packDetails[level.value] || null);
                              }}
                              className={`p-4 rounded-lg border-2 transition-all text-center ${
                                currentEvent.packageLevel === level.value
                                  ? 'border-primary bg-primary/10 ring-2 ring-primary ring-offset-2'
                                  : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                              }`}
                            >
                              <div className="text-lg font-bold text-gray-900 dark:text-white mb-1">
                                {level.label}
                              </div>
                              <div className="text-xs text-gray-600 dark:text-gray-400">
                                {level.description}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Show Selected Pack Details */}
                      <AnimatePresence>
                        {selectedPackDetails && currentEvent.packageLevel && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 rounded-xl p-6 border-2 border-purple-200 dark:border-purple-700"
                          >
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h4 className="text-xl font-bold text-gray-900 dark:text-white">
                                  {selectedPackDetails.name}
                                </h4>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  Détails du package sélectionné
                                </p>
                              </div>
                              {selectedPackDetails.price > 0 && (
                                <div className="text-right">
                                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                                    {selectedPackDetails.price} DT
                                  </div>
                                  <div className="text-xs text-gray-500">Prix indicatif</div>
                                </div>
                              )}
                            </div>
                            
                            <ul className="space-y-2">
                              {selectedPackDetails.features.map((feature, idx) => (
                                <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                  <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                  <span>{feature}</span>
                                </li>
                              ))}
                            </ul>
                          </motion.div>
                        )}
                      </AnimatePresence>

                      {/* Location */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <MapPin className="w-4 h-4 inline mr-2" />
                          Lieu (optionnel)
                        </label>
                        <input
                          type="text"
                          value={currentEvent.location}
                          onChange={(e) => setCurrentEvent(prev => ({ ...prev, location: e.target.value }))}
                          className="input-field"
                          placeholder="Sousse, Tunisie"
                        />
                      </div>

                      {/* Add Event Button */}
                      <button
                        type="button"
                        onClick={handleAddEvent}
                        className="btn-primary w-full flex items-center justify-center gap-2"
                      >
                        <Check className="w-4 h-4" />
                        <span>Ajouter cet événement</span>
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
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
                  placeholder="Détails supplémentaires sur vos événements, nombre d'invités, besoins spécifiques..."
                />
              </div>

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
                disabled={status === 'loading' || status === 'success' || formData.events.length === 0}
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
                    <span>Envoyer la demande {formData.events.length > 0 && `(${formData.events.length} événement${formData.events.length > 1 ? 's' : ''})`}</span>
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

      {/* Package Images Modal */}
      <AnimatePresence>
        {showPackageImages && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => {
              setShowPackageImages(false);
              setHasViewedPackages(true);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative max-w-6xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Close Button */}
              <button
                onClick={() => {
                  setShowPackageImages(false);
                  setHasViewedPackages(true);
                }}
                className="absolute top-4 right-4 z-10 bg-white/90 dark:bg-gray-800/90 rounded-full p-3 shadow-lg hover:bg-white dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-6 h-6 text-gray-900 dark:text-white" />
              </button>

              {/* Header */}
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-t-2xl p-8 text-center text-white"
              >
                <Package className="w-16 h-16 mx-auto mb-4" />
                <h2 className="text-3xl md:text-4xl font-bold mb-2">Nos Packages</h2>
                <p className="text-lg text-white/90">Découvrez nos offres et choisissez celle qui vous convient</p>
              </motion.div>

              {/* Package Images */}
              <div className="bg-white dark:bg-gray-900 p-6 space-y-6">
                {packageImages.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {packageImages.map((image, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="relative group"
                      >
                        <img
                          src={image}
                          alt={`Package ${index + 1}`}
                          className="w-full h-auto rounded-xl shadow-lg hover:shadow-2xl transition-shadow cursor-pointer"
                          onClick={() => window.open(image, '_blank')}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                          <p className="text-white font-semibold">Cliquez pour agrandir</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-12"
                  >
                    <Package className="w-16 h-16 mx-auto mb-4 text-gray-400" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Les images des packages seront bientôt disponibles
                    </p>
                  </motion.div>
                )}

                {/* Continue Button */}
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  onClick={() => {
                    setShowPackageImages(false);
                    setHasViewedPackages(true);
                  }}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
                >
                  <Check className="w-6 h-6" />
                  <span>J'ai vu les packages, continuer</span>
                  <ChevronRight className="w-5 h-5" />
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
