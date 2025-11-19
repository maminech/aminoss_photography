'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'fr';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('fr'); // Default to French
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load saved language preference
    const savedLang = localStorage.getItem('language') as Language;
    if (savedLang) {
      setLanguageState(savedLang);
    } else {
      // Auto-detect browser language
      const browserLang = navigator.language.toLowerCase();
      if (browserLang.startsWith('fr')) {
        setLanguageState('fr');
      } else {
        setLanguageState('en');
      }
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('language', lang);
  };

  const t = (key: string): string => {
    return getTranslation(key, language);
  };

  if (!mounted) {
    return null;
  }

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

// Translation function
function getTranslation(key: string, lang: Language): string {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
}

// Complete translations
const translations = {
  en: {
    // Navigation
    nav: {
      home: 'Home',
      gallery: 'Gallery',
      videos: 'Videos',
      about: 'About',
      contact: 'Contact',
      booking: 'Booking',
      packs: 'Packages',
      testimonials: 'Testimonials',
      clientPortal: 'Client Portal',
      adminDashboard: 'Admin Dashboard',
      menu: 'Menu',
      close: 'Close',
    },
    
    // Homepage
    home: {
      welcome: 'Welcome to Innov8 Production',
      tagline: 'Capturing Your Precious Moments',
      heroHeading: "Capturing Life's Beautiful Moments",
      heroDescription: 'Professional photography that tells your unique story with elegance and authenticity',
      exploreGallery: 'Explore Gallery',
      watchVideos: 'Watch Videos',
      bookSession: 'Book a Session',
      ourStory: 'Our Story & Mission',
      getInTouch: 'Get in Touch',
      followUs: 'Follow us',
      posts: 'Posts',
      followers: 'Followers',
      following: 'Following',
      seeMore: 'See more',
      highlights: 'Highlights',
      recentWork: 'Recent Work',
      switchTheme: 'Switch Theme',
      simpleProfessional: 'Simple ⇄ Professional',
    },
    
    // Gallery
    gallery: {
      title: 'Our Gallery',
      subtitle: 'Browse our stunning collection of moments',
      allCategories: 'All Categories',
      loading: 'Loading gallery...',
      noImages: 'No images yet',
      viewFullscreen: 'View fullscreen',
      download: 'Download',
      share: 'Share',
      close: 'Close',
      all: 'All',
      portraits: 'Portraits',
      weddings: 'Weddings',
      events: 'Events',
      nature: 'Nature',
      fashion: 'Fashion',
      item: 'item',
      items: 'items',
      noContent: 'No content found in this category.',
      date: 'Date',
      sortTitle: 'Title',
    },
    
    // Videos
    videos: {
      title: 'Our Videos',
      subtitle: 'Watch our latest work',
      loading: 'Loading videos...',
      noVideos: 'No videos yet',
      play: 'Play',
      watch: 'Watch Now',
      videoNotSupported: 'Your browser does not support the video tag.',
    },
    
    // Booking
    booking: {
      title: 'Book Your Session',
      subtitle: 'Reserve your date with us',
      name: 'Full Name',
      email: 'Email Address',
      phone: 'Phone Number',
      eventType: 'Event Type',
      eventDate: 'Event Date',
      selectDate: 'Select a date',
      selectFutureDate: '📅 Select a future date',
      message: 'Your Message',
      tellUs: 'Tell us about your event...',
      selectPackage: 'Select Package',
      addEvent: 'Add Event',
      submit: 'Submit Booking',
      submitting: 'Submitting...',
      success: 'Booking request submitted successfully!',
      error: 'Failed to submit booking',
      pastDateError: 'Event date cannot be in the past',
      required: 'This field is required',
      invalidEmail: 'Invalid email address',
      yourEvents: 'Your Events',
      removeEvent: 'Remove event',
      wedding: 'Wedding',
      birthday: 'Birthday',
      corporate: 'Corporate Event',
      portrait: 'Portrait Session',
      other: 'Other',
    },
    
    // Packages
    packs: {
      title: 'Our Packages',
      subtitle: 'Choose the perfect package for your event',
      from: 'From',
      selectPackage: 'Select Package',
      popular: 'Popular',
      features: 'Features',
      contactUs: 'Contact Us',
      loading: 'Loading packages...',
      noPackages: 'No packages available',
    },
    
    // Testimonials
    testimonials: {
      title: 'What Our Clients Say',
      subtitle: 'Real experiences from real people',
      loading: 'Loading testimonials...',
      noTestimonials: 'No testimonials yet',
      readMore: 'Read more',
      readLess: 'Read less',
    },
    
    // Contact
    contact: {
      title: 'Get in Touch',
      subtitle: 'We\'d love to hear from you',
      name: 'Your Name',
      email: 'Your Email',
      subject: 'Subject',
      message: 'Your Message',
      send: 'Send Message',
      sending: 'Sending...',
      success: 'Message sent successfully!',
      error: 'Failed to send message',
      phone: 'Phone',
      email_label: 'Email',
      address: 'Address',
      followUs: 'Follow Us',
      getInTouch: 'Get In Touch',
      contactDescription: 'Whether you\'re planning a wedding, need professional portraits, or have a creative project in mind, I\'d love to hear from you. Fill out the form and I\'ll get back to you within 24 hours.',
      location: 'Location',
      availableWorldwide: 'Available Worldwide',
      followMe: 'Follow Me',
    },
    
    // About
    about: {
      title: 'About Us',
      subtitle: 'Our Story & Mission',
      loading: 'Loading...',
      mission: 'Our Mission',
      vision: 'Our Vision',
      team: 'Meet Our Team',
      yearsExperience: 'Years Experience',
      whatIDo: 'What I Do',
      weddingPhotography: 'Wedding Photography',
      weddingDesc: 'Capturing your special day with elegance and emotion',
      portraitSessions: 'Portrait Sessions',
      portraitDesc: 'Professional portraits that showcase your unique personality',
      fashionEditorial: 'Fashion & Editorial',
      fashionDesc: 'Creative and artistic fashion photography',
    },
    
    // Client Portal
    client: {
      login: 'Client Login',
      email: 'Email Address',
      password: 'Password',
      loginButton: 'Sign In',
      loggingIn: 'Signing in...',
      logout: 'Logout',
      sessionExpired: 'Your session has expired. Please log in again.',
      dashboard: 'Dashboard',
      galleries: 'My Galleries',
      photobooks: 'My Photobooks',
      guestUploads: 'Guest Uploads',
      photobooths: 'Photo Booth Prints',
      noGalleries: 'No galleries available',
      noPhotobooks: 'No photobooks yet',
      viewGallery: 'View Gallery',
      viewPhotobook: 'View Photobook',
      download: 'Download',
      selectPhotos: 'Select Photos',
      selected: 'selected',
      submitSelection: 'Submit Selection',
      uploadPhotos: 'Upload Photos',
      dragDrop: 'Drag & drop photos or click to browse',
      uploading: 'Uploading...',
      uploadSuccess: 'Photos uploaded successfully',
      createTestimonial: 'Leave a Testimonial',
      yourTestimonial: 'Your Testimonial',
      rating: 'Rating',
      submit: 'Submit',
    },
    
    // Admin
    admin: {
      dashboard: 'Admin Dashboard',
      panel: 'Admin Panel',
      overview: 'Overview',
      leadsQuoteRequests: 'Leads & Quote Requests',
      allBookingsGrouped: 'All Bookings (Grouped)',
      calendarConfirmed: 'Calendar & Confirmed',
      factures: 'Invoices',
      selectedForPrint: 'Selected for Print',
      photosAndReels: 'Videos & Reels',
      packagesDevis: 'Packages (Devis)',
      bookingSettings: 'Booking Settings',
      design: 'Design',
      content: 'Content',
      remerciements: 'Remerciements',
      calendarIntegration: 'Calendar Integration',
      viewSite: 'View Site',
      photos: 'Photos',
      videos: 'Videos',
      albums: 'Albums',
      clients: 'Clients',
      bookings: 'Bookings',
      messages: 'Messages',
      settings: 'Settings',
      calendar: 'Calendar',
      finances: 'Finances',
      team: 'Team',
      packages: 'Packages',
      testimonials: 'Testimonials',
      highlights: 'Highlights',
      instagram: 'Instagram',
      photobooks: 'Photobooks',
      logout: 'Logout',
      welcome: 'Welcome back',
      stats: 'Statistics',
      recentActivity: 'Recent Activity',
      quickActions: 'Quick Actions',
    },
    
    // Common
    common: {
      loading: 'Loading...',
      error: 'An error occurred',
      success: 'Success',
      cancel: 'Cancel',
      save: 'Save',
      delete: 'Delete',
      edit: 'Edit',
      view: 'View',
      download: 'Download',
      upload: 'Upload',
      search: 'Search',
      filter: 'Filter',
      sort: 'Sort',
      next: 'Next',
      previous: 'Previous',
      confirm: 'Confirm',
      yes: 'Yes',
      no: 'No',
      back: 'Back',
      home: 'Home',
      more: 'More',
      less: 'Less',
      all: 'All',
      none: 'None',
      select: 'Select',
      selected: 'Selected',
      language: 'Language',
      english: 'English',
      french: 'French',
      checkBackSoon: 'Check back soon for amazing content!',
    },
    
    // Footer
    footer: {
      allRightsReserved: 'All rights reserved',
      privacyPolicy: 'Privacy Policy',
      terms: 'Terms of Service',
      followUs: 'Follow us on social media',
    },
    
    // PWA
    pwa: {
      installTitle: 'Install Our App',
      installMessage: 'Install Innov8 Production app for a better experience',
      install: 'Install',
      later: 'Maybe Later',
      updateAvailable: 'Update Available',
      updateMessage: 'A new version is available',
      update: 'Update Now',
    },
  },
  
  fr: {
    // Navigation
    nav: {
      home: 'Accueil',
      gallery: 'Galerie',
      videos: 'Vidéos',
      about: 'À Propos',
      contact: 'Contact',
      booking: 'Réservation',
      packs: 'Forfaits',
      testimonials: 'Témoignages',
      clientPortal: 'Espace Client',
      adminDashboard: 'Tableau de Bord',
      menu: 'Menu',
      close: 'Fermer',
    },
    
    // Homepage
    home: {
      welcome: 'Bienvenue chez Innov8 Production',
      tagline: 'Capturer Vos Moments Précieux',
      heroHeading: 'Capturer les Beaux Moments de la Vie',
      heroDescription: 'Photographie professionnelle qui raconte votre histoire unique avec élégance et authenticité',
      exploreGallery: 'Explorer la Galerie',
      watchVideos: 'Regarder les Vidéos',
      bookSession: 'Réserver une Séance',
      ourStory: 'Notre Histoire & Mission',
      getInTouch: 'Nous Contacter',
      followUs: 'Suivez-nous',
      posts: 'Publications',
      followers: 'Abonnés',
      following: 'Abonnements',
      seeMore: 'Voir plus',
      highlights: 'À la Une',
      recentWork: 'Travaux Récents',
      switchTheme: 'Changer de Thème',
      simpleProfessional: 'Simple ⇄ Professionnel',
    },
    
    // Gallery
    gallery: {
      title: 'Notre Galerie',
      subtitle: 'Découvrez notre superbe collection de moments',
      allCategories: 'Toutes Catégories',
      loading: 'Chargement de la galerie...',
      noImages: 'Aucune image pour le moment',
      viewFullscreen: 'Voir en plein écran',
      download: 'Télécharger',
      share: 'Partager',
      close: 'Fermer',
      all: 'Tout',
      portraits: 'Portraits',
      weddings: 'Mariages',
      events: 'Événements',
      nature: 'Nature',
      fashion: 'Mode',
      item: 'élément',
      items: 'éléments',
      noContent: 'Aucun contenu trouvé dans cette catégorie.',
      date: 'Date',
      sortTitle: 'Titre',
    },
    
    // Videos
    videos: {
      title: 'Nos Vidéos',
      subtitle: 'Regardez nos derniers travaux',
      loading: 'Chargement des vidéos...',
      noVideos: 'Aucune vidéo pour le moment',
      play: 'Lire',
      watch: 'Regarder maintenant',
      videoNotSupported: 'Votre navigateur ne prend pas en charge la balise vidéo.',
    },
    
    // Booking
    booking: {
      title: 'Réservez Votre Séance',
      subtitle: 'Réservez votre date avec nous',
      name: 'Nom Complet',
      email: 'Adresse Email',
      phone: 'Numéro de Téléphone',
      eventType: 'Type d\'Événement',
      eventDate: 'Date de l\'Événement',
      selectDate: 'Sélectionner une date',
      selectFutureDate: '📅 Sélectionnez une date future',
      message: 'Votre Message',
      tellUs: 'Parlez-nous de votre événement...',
      selectPackage: 'Sélectionner un Forfait',
      addEvent: 'Ajouter un Événement',
      submit: 'Soumettre la Réservation',
      submitting: 'Envoi en cours...',
      success: 'Demande de réservation envoyée avec succès!',
      error: 'Échec de l\'envoi de la réservation',
      pastDateError: 'La date de l\'événement ne peut pas être dans le passé',
      required: 'Ce champ est requis',
      invalidEmail: 'Adresse email invalide',
      yourEvents: 'Vos Événements',
      removeEvent: 'Supprimer l\'événement',
      wedding: 'Mariage',
      birthday: 'Anniversaire',
      corporate: 'Événement d\'Entreprise',
      portrait: 'Séance Portrait',
      other: 'Autre',
    },
    
    // Packages
    packs: {
      title: 'Nos Forfaits',
      subtitle: 'Choisissez le forfait parfait pour votre événement',
      from: 'À partir de',
      selectPackage: 'Sélectionner le Forfait',
      popular: 'Populaire',
      features: 'Caractéristiques',
      contactUs: 'Nous Contacter',
      loading: 'Chargement des forfaits...',
      noPackages: 'Aucun forfait disponible',
    },
    
    // Testimonials
    testimonials: {
      title: 'Ce Que Disent Nos Clients',
      subtitle: 'Expériences réelles de vraies personnes',
      loading: 'Chargement des témoignages...',
      noTestimonials: 'Aucun témoignage pour le moment',
      readMore: 'Lire la suite',
      readLess: 'Réduire',
    },
    
    // Contact
    contact: {
      title: 'Nous Contacter',
      subtitle: 'Nous serions ravis de vous entendre',
      name: 'Votre Nom',
      email: 'Votre Email',
      subject: 'Sujet',
      message: 'Votre Message',
      send: 'Envoyer le Message',
      sending: 'Envoi en cours...',
      success: 'Message envoyé avec succès !',
      error: 'Échec de l\'envoi du message',
      phone: 'Téléphone',
      email_label: 'Email',
      address: 'Adresse',
      followUs: 'Suivez-nous',
      getInTouch: 'Contactez-nous',
      contactDescription: 'Que vous planifiez un mariage, ayez besoin de portraits professionnels ou ayez un projet créatif en tête, j\'aimerais avoir de vos nouvelles. Remplissez le formulaire et je vous répondrai dans les 24 heures.',
      location: 'Lieu',
      availableWorldwide: 'Disponible dans le monde entier',
      followMe: 'Suivez-moi',
    },
    
    // About
    about: {
      title: 'À Propos de Nous',
      subtitle: 'Notre Histoire & Mission',
      loading: 'Chargement...',
      mission: 'Notre Mission',
      vision: 'Notre Vision',
      team: 'Rencontrez Notre Équipe',
      yearsExperience: 'Années d\'Expérience',
      whatIDo: 'Ce Que Je Fais',
      weddingPhotography: 'Photographie de Mariage',
      weddingDesc: 'Capturer votre jour spécial avec élégance et émotion',
      portraitSessions: 'Séances Portrait',
      portraitDesc: 'Portraits professionnels qui mettent en valeur votre personnalité unique',
      fashionEditorial: 'Mode & Éditorial',
      fashionDesc: 'Photographie de mode créative et artistique',
    },
    
    // Client Portal
    client: {
      login: 'Connexion Client',
      email: 'Adresse Email',
      password: 'Mot de Passe',
      loginButton: 'Se Connecter',
      loggingIn: 'Connexion en cours...',
      logout: 'Déconnexion',
      sessionExpired: 'Votre session a expiré. Veuillez vous reconnecter.',
      dashboard: 'Tableau de Bord',
      galleries: 'Mes Galeries',
      photobooks: 'Mes Albums Photo',
      guestUploads: 'Téléchargements Invités',
      photobooths: 'Impressions Photomaton',
      noGalleries: 'Aucune galerie disponible',
      noPhotobooks: 'Aucun album photo pour le moment',
      viewGallery: 'Voir la Galerie',
      viewPhotobook: 'Voir l\'Album',
      download: 'Télécharger',
      selectPhotos: 'Sélectionner des Photos',
      selected: 'sélectionné(s)',
      submitSelection: 'Soumettre la Sélection',
      uploadPhotos: 'Télécharger des Photos',
      dragDrop: 'Glissez-déposez des photos ou cliquez pour parcourir',
      uploading: 'Téléchargement...',
      uploadSuccess: 'Photos téléchargées avec succès',
      createTestimonial: 'Laisser un Témoignage',
      yourTestimonial: 'Votre Témoignage',
      rating: 'Note',
      submit: 'Soumettre',
    },
    
    // Admin
    admin: {
      dashboard: 'Tableau de Bord Admin',
      panel: 'Panneau Admin',
      overview: 'Aperçu',
      leadsQuoteRequests: 'Prospects & Demandes de Devis',
      allBookingsGrouped: 'Toutes les Réservations (Groupées)',
      calendarConfirmed: 'Calendrier & Confirmé',
      factures: 'Factures',
      selectedForPrint: 'Sélectionné pour Impression',
      photosAndReels: 'Vidéos & Reels',
      packagesDevis: 'Forfaits (Devis)',
      bookingSettings: 'Paramètres de Réservation',
      design: 'Design',
      content: 'Contenu',
      remerciements: 'Remerciements',
      calendarIntegration: 'Intégration Calendrier',
      viewSite: 'Voir le Site',
      photos: 'Photos',
      videos: 'Vidéos',
      albums: 'Albums',
      clients: 'Clients',
      bookings: 'Réservations',
      messages: 'Messages',
      settings: 'Paramètres',
      calendar: 'Calendrier',
      finances: 'Finances',
      team: 'Équipe',
      packages: 'Forfaits',
      testimonials: 'Témoignages',
      highlights: 'À la Une',
      instagram: 'Instagram',
      photobooks: 'Albums Photo',
      logout: 'Déconnexion',
      welcome: 'Bon retour',
      stats: 'Statistiques',
      recentActivity: 'Activité Récente',
      quickActions: 'Actions Rapides',
    },
    
    // Common
    common: {
      loading: 'Chargement...',
      error: 'Une erreur s\'est produite',
      success: 'Succès',
      cancel: 'Annuler',
      save: 'Enregistrer',
      delete: 'Supprimer',
      edit: 'Modifier',
      view: 'Voir',
      download: 'Télécharger',
      upload: 'Télécharger',
      search: 'Rechercher',
      filter: 'Filtrer',
      sort: 'Trier',
      next: 'Suivant',
      previous: 'Précédent',
      confirm: 'Confirmer',
      yes: 'Oui',
      no: 'Non',
      back: 'Retour',
      home: 'Accueil',
      more: 'Plus',
      less: 'Moins',
      all: 'Tout',
      none: 'Aucun',
      select: 'Sélectionner',
      selected: 'Sélectionné',
      language: 'Langue',
      english: 'Anglais',
      french: 'Français',
      checkBackSoon: 'Revenez bientôt pour du contenu incroyable !',
    },
    
    // Footer
    footer: {
      allRightsReserved: 'Tous droits réservés',
      privacyPolicy: 'Politique de Confidentialité',
      terms: 'Conditions d\'Utilisation',
      followUs: 'Suivez-nous sur les réseaux sociaux',
    },
    
    // PWA
    pwa: {
      installTitle: 'Installer Notre Application',
      installMessage: 'Installez l\'application Innov8 Production pour une meilleure expérience',
      install: 'Installer',
      later: 'Plus Tard',
      updateAvailable: 'Mise à Jour Disponible',
      updateMessage: 'Une nouvelle version est disponible',
      update: 'Mettre à Jour',
    },
  },
};
