'use client';

/**
 * Enhanced Booking Form Component with Multi-Event Support
 * "Demande de devis" section for contact page
 * Includes WhatsApp integration and multiple events/dates support
 * TWO-STEP PROCESS: 1) Name + Phone → 2) Show Packages + Full Form
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Clock, MapPin, MessageSquare, Send, Check, AlertCircle, Package, ChevronRight, ChevronLeft, X, Edit } from 'lucide-react';

interface EventDetails {
  eventType: string;
  eventDate: string;
  timeSlot: string;
  location: string;
  message?: string;
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

// Country codes list
const countryCodes = [
  { code: '+216', country: 'Tunisia 🇹🇳', flag: '🇹🇳' },
  { code: '+213', country: 'Algeria 🇩🇿', flag: '🇩🇿' },
  { code: '+212', country: 'Morocco 🇲🇦', flag: '🇲🇦' },
  { code: '+33', country: 'France 🇫🇷', flag: '🇫🇷' },
  { code: '+49', country: 'Germany 🇩🇪', flag: '🇩🇪' },
  { code: '+39', country: 'Italy 🇮🇹', flag: '🇮🇹' },
  { code: '+1', country: 'USA/Canada 🇺🇸🇨🇦', flag: '🇺🇸' },
  { code: '+44', country: 'UK 🇬🇧', flag: '🇬🇧' },
  { code: '+971', country: 'UAE 🇦🇪', flag: '🇦🇪' },
  { code: '+966', country: 'Saudi Arabia 🇸🇦', flag: '🇸🇦' },
];

export default function EnhancedBookingForm({ prefilledPackage, prefilledPrice }: EnhancedBookingFormProps) {
  // Two-step state
  const [packages, setPackages] = useState<PackageType[]>(defaultPackages);
  const [loadingPackages, setLoadingPackages] = useState(true);
  const [packageImages, setPackageImages] = useState<string[]>([]);
  const [showPackageImages, setShowPackageImages] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [hasViewedPackages, setHasViewedPackages] = useState(false);
  const [countryCode, setCountryCode] = useState('+216');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImageIndex, setLightboxImageIndex] = useState(0);
  const [expandedPackageLevel, setExpandedPackageLevel] = useState<string | null>(null);

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

  const [allPackages, setAllPackages] = useState<any[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<{[key: string]: PackageType}>({});
  const [selectedPackDetails, setSelectedPackDetails] = useState<PackageType | null>(null);

  const packageLevels = [
    { value: 'pack1', label: filteredPackages['pack1']?.name || 'Package 1', description: filteredPackages['pack1']?.name || 'Package 1', tier: 'pack1' },
    { value: 'pack2', label: filteredPackages['pack2']?.name || 'Package 2', description: filteredPackages['pack2']?.name || 'Package 2', tier: 'pack2' },
    { value: 'pack3', label: filteredPackages['pack3']?.name || 'Package 3', description: filteredPackages['pack3']?.name || 'Package 3', tier: 'pack3' },
  ];

  // Load all packages from database
  useEffect(() => {
    const fetchPackDetails = async () => {
      try {
        const response = await fetch('/api/admin/packs?active=true');
        if (response.ok) {
          const data = await response.json();
          setAllPackages(data);
        }
      } catch (error) {
        console.error('Error loading pack details:', error);
      }
    };

    fetchPackDetails();
  }, []);

  // Filter packages when packageType changes
  useEffect(() => {
    if (!currentEvent.packageType || allPackages.length === 0) {
      setFilteredPackages({});
      return;
    }

    // Filter packages by selected packageType (aymen or equipe)
    const filtered = allPackages.filter(pkg => pkg.packageType === currentEvent.packageType);
    
    // Map packages to pack1, pack2, pack3 based on order or price
    const sorted = [...filtered].sort((a, b) => {
      // Sort by order first, then by price
      if (a.order !== undefined && b.order !== undefined) {
        return a.order - b.order;
      }
      return a.price - b.price;
    });

    const tierMapping: {[key: string]: PackageType} = {};
    
    if (sorted.length >= 1) {
      tierMapping['pack1'] = {
        id: sorted[0].id,
        name: sorted[0].name,
        price: sorted[0].price,
        features: sorted[0].features || [],
        icon: '📦',
      };
    }
    
    if (sorted.length >= 2) {
      tierMapping['pack2'] = {
        id: sorted[1].id,
        name: sorted[1].name,
        price: sorted[1].price,
        features: sorted[1].features || [],
        icon: '📦',
      };
    }
    
    if (sorted.length >= 3) {
      tierMapping['pack3'] = {
        id: sorted[2].id,
        name: sorted[2].name,
        price: sorted[2].price,
        features: sorted[2].features || [],
        icon: '�',
      };
    }

    setFilteredPackages(tierMapping);
  }, [currentEvent.packageType, allPackages]);

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
      const packageLevelLabel = packageLevels.find(t => t.value === event.packageLevel)?.label?.split(' ')[1] || event.packageLevel;
      
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

    // Combine country code with phone number
    const fullPhone = `${countryCode} ${formData.phone.trim()}`;
    setFormData(prev => ({ ...prev, phone: fullPhone }));

    try {
      await fetch('/api/bookings/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          phone: fullPhone,
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
              <div className="flex gap-2">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="input-field text-lg py-4 w-32 flex-shrink-0"
                >
                  {countryCodes.map((country) => (
                    <option key={country.code} value={country.code}>
                      {country.flag} {country.code}
                    </option>
                  ))}
                </select>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => {
                    // Remove any non-digit characters except spaces
                    const cleaned = e.target.value.replace(/[^\d\s]/g, '');
                    handleInputChange('phone', cleaned);
                  }}
                  className="input-field text-lg py-4 flex-1"
                  placeholder="XX XXX XXX"
                />
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Numéro complet: {countryCode} {formData.phone}
              </p>
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

            {/* Continue Button - Show when name and phone are filled */}
            {formData.name.trim() && formData.phone.trim() && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-4 px-6 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-3"
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
                    <motion.button
                      type="button"
                      onClick={() => setIsAddingEvent(true)}
                      whileHover={{ scale: 1.02, y: -2 }}
                      whileTap={{ scale: 0.98 }}
                      className="relative overflow-hidden px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-purple-600 text-white rounded-xl font-bold text-lg shadow-lg hover:shadow-2xl transition-all group"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                      <div className="relative flex items-center gap-3">
                        <span className="text-2xl">✨</span>
                        <span>Ajouter un événement</span>
                        <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </motion.button>
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

                      {/* Event Type - Text Input */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                          <span className="text-lg">📝</span>
                          Type d'événement *
                        </label>
                        <div className="relative group">
                          <input
                            type="text"
                            value={currentEvent.eventType}
                            onChange={(e) => setCurrentEvent(prev => ({ ...prev, eventType: e.target.value }))}
                            placeholder="Ex: Mariage, Anniversaire, Séance Photo..."
                            className="input-field text-base pr-12 transition-all focus:ring-2 focus:ring-purple-500"
                          />
                          {/* Beautiful animated icon on the right */}
                          <div className="absolute right-4 top-1/2 -translate-y-1/2 transition-all duration-300">
                            {currentEvent.eventType ? (
                              <motion.div
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ type: "spring", stiffness: 200 }}
                                className="text-2xl"
                              >
                                ✨
                              </motion.div>
                            ) : (
                              <div className="text-gray-300 dark:text-gray-600 text-xl">
                                ✏️
                              </div>
                            )}
                          </div>
                        </div>
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                          <span>💡</span>
                          <span>Décrivez votre événement en quelques mots</span>
                        </p>
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
                          Niveau de Pack * {currentEvent.packageType && `(${packageTypes.find(t => t.value === currentEvent.packageType)?.label})`}
                        </label>
                        
                        {!currentEvent.packageType ? (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            Veuillez d'abord sélectionner le type de forfait (Par Aymen ou Par Équipe)
                          </div>
                        ) : Object.keys(filteredPackages).length === 0 ? (
                          <div className="text-center py-8 text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            Aucun package disponible pour {packageTypes.find(t => t.value === currentEvent.packageType)?.label}
                          </div>
                        ) : (
                          <div className="grid grid-cols-1 gap-4">
                            {packageLevels.map((level) => {
                              const packageData = filteredPackages[level.tier];
                              if (!packageData) return null; // Skip if no package for this tier
                              
                              const isExpanded = expandedPackageLevel === level.value;
                              const isSelected = currentEvent.packageLevel === level.value;
                              
                              return (
                                <motion.div
                                  key={level.value}
                                  initial={false}
                                  animate={{ height: 'auto' }}
                                  className={`rounded-xl border-2 transition-all overflow-hidden ${
                                    isSelected
                                      ? 'border-primary bg-primary/10 shadow-lg'
                                      : 'border-gray-200 dark:border-gray-700 hover:border-primary/50'
                                  }`}
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      // Toggle expansion and selection
                                      if (isExpanded) {
                                        // If already expanded, select it
                                        setCurrentEvent(prev => ({ ...prev, packageLevel: level.value }));
                                        setSelectedPackDetails(packageData);
                                        setExpandedPackageLevel(null);
                                      } else {
                                        // Expand to show details
                                        setExpandedPackageLevel(level.value);
                                      }
                                    }}
                                    className="w-full p-4 flex items-center justify-between hover:bg-gray-100 dark:hover:bg-gray-800/50 transition-colors"
                                  >
                                    <div className="flex items-center gap-4">
                                      <div className="text-3xl">{packageData.icon}</div>
                                      <div className="text-left">
                                        <div className="text-lg font-bold text-gray-900 dark:text-white flex items-center gap-2">
                                          {packageData.name}
                                          {isSelected && <Check className="w-5 h-5 text-primary" />}
                                        </div>
                                      </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                      {packageData.price > 0 && (
                                        <div className="text-right">
                                          <div className="text-lg font-bold text-primary">
                                            {packageData.price} DT
                                          </div>
                                          <div className="text-xs text-gray-500">Prix</div>
                                        </div>
                                      )}
                                      <ChevronRight className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                                    </div>
                                  </button>

                                  {/* Expandable Package Details */}
                                  <AnimatePresence>
                                    {isExpanded && (
                                      <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3 }}
                                        className="border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 p-4"
                                      >
                                        <h5 className="font-semibold text-gray-900 dark:text-white mb-3">✨ Ce qui est inclus:</h5>
                                        <ul className="space-y-2 mb-4">
                                          {packageData.features.map((feature: string, idx: number) => (
                                            <li key={idx} className="flex items-start gap-2 text-sm text-gray-700 dark:text-gray-300">
                                              <Check className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
                                              <span>{feature}</span>
                                            </li>
                                          ))}
                                        </ul>
                                        <motion.button
                                          type="button"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            setCurrentEvent(prev => ({ ...prev, packageLevel: level.value }));
                                            setSelectedPackDetails(packageData);
                                            setExpandedPackageLevel(null);
                                          }}
                                          whileHover={{ scale: 1.02 }}
                                          whileTap={{ scale: 0.98 }}
                                          className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all"
                                        >
                                          <Check className="w-5 h-5" />
                                          <span>Choisir ce package</span>
                                        </motion.button>
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.div>
                              );
                            })}
                          </div>
                        )}
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

                      {/* Event Message/Notes */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <MessageSquare className="w-4 h-4 inline mr-2" />
                          Message / Notes (optionnel)
                        </label>
                        <textarea
                          value={currentEvent.message || ''}
                          onChange={(e) => setCurrentEvent(prev => ({ ...prev, message: e.target.value }))}
                          rows={3}
                          className="textarea-field"
                          placeholder="Détails supplémentaires sur cet événement, nombre d'invités, besoins spécifiques..."
                        />
                        <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                          💡 Ajoutez des détails spécifiques pour cet événement
                        </p>
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
                          className="w-full h-auto rounded-xl shadow-lg hover:shadow-2xl transition-all cursor-pointer hover:scale-105"
                          onClick={() => {
                            setLightboxImageIndex(index);
                            setLightboxOpen(true);
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-4">
                          <p className="text-white font-semibold text-lg">🔍 Cliquez pour agrandir</p>
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

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {selectedImageIndex !== null && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedImageIndex(null)}
            className="fixed inset-0 bg-black/95 z-[9999] flex items-center justify-center p-4"
          >
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedImageIndex(null);
              }}
              className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6" />
            </motion.button>

            {/* Navigation buttons */}
            {packageImages.length > 1 && (
              <>
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) => 
                      prev === null ? null : prev === 0 ? packageImages.length - 1 : prev - 1
                    );
                  }}
                  className="absolute left-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                >
                  <ChevronLeft className="w-6 h-6" />
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedImageIndex((prev) => 
                      prev === null ? null : (prev + 1) % packageImages.length
                    );
                  }}
                  className="absolute right-4 p-3 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
                >
                  <ChevronRight className="w-6 h-6" />
                </motion.button>
              </>
            )}

            {/* Image */}
            <motion.div
              key={selectedImageIndex}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="relative max-w-7xl max-h-[90vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={packageImages[selectedImageIndex]}
                alt={`Package ${selectedImageIndex + 1}`}
                className="w-full h-full object-contain rounded-lg"
              />
              
              {/* Image counter */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 px-4 py-2 bg-black/50 text-white rounded-full text-sm">
                {selectedImageIndex + 1} / {packageImages.length}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full-Size Image Lightbox */}
      <AnimatePresence>
        {lightboxOpen && packageImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            onClick={() => setLightboxOpen(false)}
          >
            {/* Close Button */}
            <button
              onClick={() => setLightboxOpen(false)}
              className="absolute top-4 right-4 z-10 bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-full p-3 transition-colors"
            >
              <X className="w-7 h-7 text-white" />
            </button>

            {/* Navigation buttons */}
            {packageImages.length > 1 && (
              <>
                <motion.button
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImageIndex((prev) => 
                      prev === 0 ? packageImages.length - 1 : prev - 1
                    );
                  }}
                  className="absolute left-4 p-4 bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white rounded-full transition-all hover:scale-110"
                >
                  <ChevronLeft className="w-8 h-8" />
                </motion.button>
                <motion.button
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxImageIndex((prev) => (prev + 1) % packageImages.length);
                  }}
                  className="absolute right-4 p-4 bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white rounded-full transition-all hover:scale-110"
                >
                  <ChevronRight className="w-8 h-8" />
                </motion.button>
              </>
            )}

            {/* Image */}
            <motion.div
              key={lightboxImageIndex}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3 }}
              className="relative max-w-7xl max-h-[95vh] w-full"
              onClick={(e) => e.stopPropagation()}
            >
              <img
                src={packageImages[lightboxImageIndex]}
                alt={`Package ${lightboxImageIndex + 1}`}
                className="w-full h-full object-contain rounded-lg shadow-2xl"
              />
              
              {/* Image counter */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-black/70 backdrop-blur-sm text-white rounded-full text-base font-semibold shadow-lg"
              >
                {lightboxImageIndex + 1} / {packageImages.length}
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
