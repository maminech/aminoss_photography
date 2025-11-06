# 📸 CAHIER DE CHARGE - AMINOSS PHOTOGRAPHY PLATFORM

**Plateforme Complète de Gestion de Photographie Professionnelle**

**Version:** 1.0  
**Date:** November 6, 2025  
**Technologie:** Next.js 14 + TypeScript + Prisma + MongoDB + Cloudinary

---

## 🎯 OBJECTIF DE LA PLATEFORME

Plateforme web complète pour photographe professionnel permettant la gestion de portfolio, galeries clients privées, réservations, et présentation de services avec une interface Instagram-style moderne.

---

## 📋 TABLE DES MATIÈRES

1. [Architecture Technique](#architecture-technique)
2. [Espace Public (Visiteurs)](#espace-public-visiteurs)
3. [Espace Admin (Photographe)](#espace-admin-photographe)
4. [Espace Client (Portail Privé)](#espace-client-portail-privé)
5. [Fonctionnalités Avancées](#fonctionnalités-avancées)
6. [Spécifications Techniques](#spécifications-techniques)

---

## 🏗️ ARCHITECTURE TECHNIQUE

### Stack Technologique
- **Framework:** Next.js 14.2.33 (App Router)
- **Langage:** TypeScript
- **Base de données:** MongoDB (via Prisma ORM)
- **Stockage média:** Cloudinary (images + vidéos)
- **Authentification:** NextAuth.js
- **UI/Animations:** Tailwind CSS + Framer Motion
- **Déploiement:** Vercel

### Structure de la Base de Données

**12 Modèles Principaux:**
1. `User` - Utilisateurs admin
2. `Image` - Photos du portfolio
3. `Video` - Vidéos et reels
4. `Client` - Clients avec accès portail
5. `ClientGallery` - Galeries privées par client
6. `ClientPhoto` - Photos dans galeries clients
7. `Pack` - Packages de services/tarifs
8. `Booking` - Réservations de sessions
9. `CalendarEvent` - Événements et rendez-vous
10. `BlockedDate` - Dates bloquées au calendrier
11. `ContactMessage` - Messages de contact
12. `SiteSettings` - Configuration du site

---

## 🌐 ESPACE PUBLIC (VISITEURS)

### 1. PAGE D'ACCUEIL - STYLE INSTAGRAM PROFILE

**Design:** Réplique exacte du profil Instagram

**Composants:**
- **En-tête de profil:**
  - Photo de profil circulaire (150px)
  - Nom d'utilisateur (aminoss_photography)
  - Statistiques en temps réel:
    - Nombre de posts
    - 2,847 followers (affichage)
    - 312 following (affichage)
  - Boutons d'action: "Message" + "View Gallery"
  
- **Biographie:**
  - Nom/tagline en gras
  - Description multiligne avec emojis
  - Lien cliquable vers contact
  - Exemple: "📸 Capturing life's precious moments / ✨ Weddings | Portraits | Events / 📍 Available worldwide"

- **Story Highlights (4 cercles):**
  - Gallery (icône grille)
  - Videos (icône vidéo)
  - Packages (icône bookmark)
  - Contact (icône mail)
  - **NOUVEAU:** Highlights fonctionnent comme vraies Instagram Stories
  - **Full-screen viewer** avec:
    - Barres de progression animées
    - Tap gauche/droite pour naviguer
    - Auto-advance après 5 secondes
    - Swipe down pour fermer
    - Support clavier (←/→/Esc)
    - Header avec nom du highlight
  - Dégradés colorés + images réelles
  - Navigation fluide entre highlights

- **Onglets de contenu:**
  - POSTS (grille photos)
  - VIDEOS (grille vidéos)
  - Indicateur actif (bordure supérieure)

- **Grille de contenu:**
  - 3 colonnes fixes (style Instagram)
  - Espacement 1px entre photos
  - Aspect ratio carré
  - Indicateur vidéo (icône en haut à droite)
  - Hover: overlay noir + likes/commentaires simulés
  - Clic: ouvre lightbox

**Fonctionnalités:**
- Chargement dynamique depuis Cloudinary
- Images featured uniquement
- Filtrage par type (posts/videos)
- Responsive: 3 colonnes desktop, 2 tablette, 1 mobile

---

### 2. GALERIE COMPLÈTE

**URL:** `/gallery`

**Fonctionnalités:**
- Affichage masonry (grille intelligente)
- Filtres par catégorie:
  - All
  - Weddings
  - Portraits
  - Events
  - Fashion
  - Travel
- Lightbox professionnel:
  - Navigation clavier (←/→/Esc)
  - Swipe mobile (left/right/down)
  - **Swipe down pour fermer (NOUVEAU)**
  - Compteur d'images (X/Y)
  - Informations EXIF si disponibles
  - Téléchargement (si autorisé)
  - Responsive desktop/mobile
- Lazy loading optimisé
- Animations fluides (Framer Motion)

---

### 3. VIDÉOS & REELS

**URL:** `/videos`

**Fonctionnalités:**
- Lecteur vidéo intégré
- Miniatures personnalisées
- Filtrage par catégorie
- Durée affichée
- Lecture en plein écran
- Contrôles personnalisés

---

### 4. PACKAGES / TARIFS

**URL:** `/packs`

**Affichage:**
- Cartes de packages avec:
  - Image de couverture
  - Nom du package
  - Description détaillée
  - Prix affiché
  - Durée de la session
  - Liste de fonctionnalités incluses
  - Bouton "Book Now"
- Filtrage par catégorie:
  - Wedding
  - Portrait
  - Fashion
  - Commercial

**Actions:**
- Clic → Redirection vers formulaire de réservation

---

### 5. À PROPOS

**URL:** `/about`

**Contenu:**
- Biographie du photographe
- Photos de présentation
- Équipe (si applicable)
- Philosophie de travail
- Équipement utilisé
- Récompenses/certifications

---

### 6. CONTACT

**URL:** `/contact`

**Formulaire avec:**
- Nom complet (requis)
- Email (requis, validation)
- Téléphone (optionnel)
- Sujet
- Message (textarea)
- Bouton "Envoyer"

**Fonctionnalités:**
- Validation côté client + serveur
- Sauvegarde en base de données
- Notifications admin
- Message de confirmation
- Capture IP + User Agent (sécurité)

---

### 7. RÉSERVATION

**URL:** `/booking`

**Formulaire avec:**
- Informations client:
  - Nom
  - Email
  - Téléphone
- Sélection de package (dropdown)
- Date souhaitée (calendrier)
- Date alternative (optionnel)
- Message/détails supplémentaires
- Statut: pending par défaut

**Processus:**
1. Client remplit formulaire
2. Sauvegarde en base de données
3. Notification admin
4. Admin peut confirmer/rejeter depuis dashboard

---

## 🔐 ESPACE ADMIN (PHOTOGRAPHE)

**URL:** `/admin/dashboard`  
**Authentification:** Email + Password (NextAuth)

### TABLEAU DE BORD PRINCIPAL

**Statistiques en temps réel:**
- Total photos
- Total vidéos
- Total clients
- Messages non lus
- Réservations en attente

**Graphiques:**
- Uploads par mois
- Bookings par statut
- Galeries actives

**Actions rapides:**
- Upload photo/vidéo
- Créer galerie client
- Voir nouveaux messages
- Gérer calendrier

---

### 1. GESTION DES PHOTOS

**URL:** `/admin/dashboard/photos`

**Fonctionnalités:**

**Upload Direct:**
- Widget Cloudinary intégré
- Drag & drop multiple
- Formats: JPG, PNG, WebP, HEIC
- Taille max: 50MB par fichier
- Upload automatique → Cloudinary
- Génération thumbnails: 800x800 @ 90% qualité
- Auto-refresh après upload

**Organisation:**
- Grille responsive 4 colonnes
- Vue miniature avec overlay
- Filtres par catégorie:
  - All, Weddings, Portraits, Events, Fashion, Travel
- Tri par date
- Recherche par titre/tags

**Actions par photo:**
- **Éditer** (Modal):
  - Titre
  - Description
  - Catégorie
  - Tags (multi-sélection)
  - Featured (checkbox)
  - Show on Homepage (checkbox)
  - Show in Gallery (checkbox)
  - Display Order (nombre)
- **Marquer Featured** (toggle rapide)
- **Supprimer**:
  - Option 1: Base de données seulement
  - Option 2: Base + Cloudinary
  - Confirmation double

**Sync Cloudinary:**
- Bouton "Sync from Cloudinary"
- **NOUVEAU: Bouton "Sync from Instagram"**
  - Import photos depuis compte Instagram
  - OAuth authentification
  - Sélection photos à importer
  - Upload automatique vers Cloudinary
  - Sauvegarde en base de données
  - Documentation complète (INSTAGRAM_SETUP.md)
- Sélection de dossier:
  - `portfolio/` (recommandé)
  - `featured/`
  - Root (tous)
- Import automatique nouvelles images
- Mise à jour métadonnées existantes
- Rapport: X nouvelles, Y mises à jour

**Métadonnées automatiques:**
- Dimensions (width/height)
- Format
- Taille fichier
- URL public
- Thumbnail URL
- Date création

---

### 2. GESTION DES VIDÉOS

**URL:** `/admin/dashboard/videos`

**Upload:**
- Widget Cloudinary pour vidéos
- Formats: MP4, MOV, AVI, WebM, MKV, FLV, WMV
- Taille max: 500MB
- Génération thumbnail automatique
- Durée calculée automatiquement

**Gestion:**
- Grille avec preview vidéo
- Lecture directe depuis interface
- Édition complète:
  - Titre
  - Description
  - Catégorie
  - Featured
  - Homepage display
  - Gallery display
- Badge durée sur miniature
- Icône play overlay

**Catégories vidéo:**
- Weddings
- Events
- Fashion
- Travel
- Reels
- Commercial

---

### 3. GESTION DES CLIENTS

**URL:** `/admin/dashboard/clients`

**Liste clients:**
- Tableau complet:
  - Nom
  - Email
  - Téléphone
  - Date création
  - Dernière activité
  - Nombre de galeries
  - Statut (actif/inactif)

**Actions:**
- **Créer nouveau client:**
  - Nom
  - Email (unique)
  - Mot de passe (auto-généré ou manuel)
  - Téléphone
  - Notes admin (privées)
- **Éditer client**
- **Créer galerie pour client**
- **Voir activité client**
- **Désactiver/réactiver accès**
- **Supprimer client** (cascade: supprime galeries)

**Statistiques par client:**
- Nombre de galeries
- Total photos partagées
- Photos sélectionnées pour impression
- Nombre de téléchargements
- Dernière connexion

---

### 4. GALERIES CLIENTS

**URL:** `/admin/dashboard/galleries`

**Gestion complète:**

**Créer galerie:**
- Sélection client (dropdown)
- Nom de la galerie
- Description
- Date d'expiration (optionnel)
- Autoriser téléchargement (checkbox)
- Mot de passe additionnel (optionnel)
- Image de couverture

**Upload photos dans galerie:**
- Widget Cloudinary
- Upload multiple simultané
- Numérotation automatique (#1, #2, #3...)
- Organisation par ordre
- Métadonnées conservées

**Actions par galerie:**
- **Éditer informations**
- **Ajouter photos**
- **Supprimer photos**
- **Réorganiser ordre** (drag & drop)
- **Voir sélections client**
- **Télécharger rapport** (photos sélectionnées)
- **Prolonger expiration**
- **Archiver/désarchiver**
- **Supprimer galerie**

**Statistiques galerie:**
- Nombre total photos
- Photos sélectionnées par client
- Nombre de téléchargements
- Date dernière consultation
- Statut expiration

---

### 5. CALENDRIER & ÉVÉNEMENTS

**URL:** `/admin/dashboard/calendar`

**Vue calendrier:**
- Vue mensuelle complète
- Indicateurs visuels:
  - Points colorés par type d'événement
  - Badge compteur (X événements)
  - Fond bleu pour dates avec événements
  - Dates bloquées en rouge

**Types d'événements:**
- **Wedding** (rose)
- **Portrait** (bleu)
- **Event** (violet)
- **Travel** (vert)
- **Other** (gris)

**Statuts:**
- **Pending** (jaune)
- **Confirmed** (vert)
- **Completed** (bleu)
- **Cancelled** (rouge)

**Créer événement (Modal):**
- Date sélectionnée
- Titre* (requis)
- Nom du client
- Type d'événement (dropdown)
- Heure début (time picker)
- Heure fin (time picker)
- Lieu
- Prix
- Acompte versé
- Notes (textarea)
- Statut

**Actions:**
- Clic sur date → Créer événement OU Voir événements existants
- Modal événement → Éditer/Supprimer
- Vue combinée: Événements + Réservations
- Filtrage par type
- Export calendrier (optionnel)

**État vide:**
- Message "Aucun événement"
- Bouton "Créer premier événement"

---

### 6. RÉSERVATIONS

**URL:** `/admin/dashboard/bookings`

**Liste réservations:**
- Tableau filtrable:
  - Nom client
  - Email
  - Téléphone
  - Package demandé
  - Date souhaitée
  - Date alternative
  - Statut
  - Date demande
  - Message

**Filtres:**
- Par statut: Pending, Confirmed, Rejected, Cancelled
- Par date
- Par package

**Actions par réservation:**
- **Voir détails complets** (Modal)
- **Confirmer réservation:**
  - Crée automatiquement événement calendrier
  - Envoie notification client (si configuré)
  - Change statut → Confirmed
- **Rejeter réservation:**
  - Raison du rejet
  - Change statut → Rejected
- **Ajouter notes admin** (privées)
- **Contacter client** (lien email/phone)
- **Supprimer**

**Notifications:**
- Badge nombre réservations pending
- Alerte sonore (optionnel)

---

### 7. MESSAGES DE CONTACT

**URL:** `/admin/dashboard/messages`

**Boîte de réception:**
- Liste messages:
  - Statut: Unread, Read, Replied, Archived
  - Nom expéditeur
  - Email
  - Sujet
  - Aperçu message
  - Date réception
  - IP address (sécurité)

**Actions:**
- **Ouvrir message** (Modal):
  - Contenu complet
  - Informations expéditeur
  - Date/heure réception
  - User agent (navigateur/OS)
  - Bouton "Répondre" (ouvre client email)
- **Marquer lu/non lu**
- **Archiver**
- **Supprimer**
- **Répondre** (note interne)

**Filtres:**
- Par statut
- Par date
- Recherche

---

### 8. PACKAGES / TARIFS

**URL:** `/admin/dashboard/packs`

**Gestion packages:**

**Créer package:**
- Nom du package
- Description détaillée (textarea)
- Prix (nombre)
- Durée (texte: "2 hours", "Full day")
- Catégorie:
  - Wedding
  - Portrait
  - Fashion
  - Commercial
- Liste fonctionnalités (array):
  - 200+ edited photos
  - Online gallery
  - High-resolution files
  - etc.
- Image de couverture (upload Cloudinary)
- Actif/inactif (toggle)
- Ordre d'affichage

**Actions:**
- Éditer package
- Dupliquer package
- Activer/désactiver
- Réorganiser ordre (drag & drop)
- Supprimer (vérifie réservations liées)

**Aperçu:**
- Vue comme sur site public
- Mode prévisualisation

---

### 9. ÉQUIPE

**URL:** `/admin/dashboard/team`

**Gestion membres équipe:**
- Liste membres avec photos
- Ajouter membre:
  - Nom
  - Rôle
  - Biographie
  - Photo
  - Réseaux sociaux (Instagram, Facebook)
  - Email contact
  - Ordre affichage
  - Visible/caché
- Éditer/supprimer membres
- Drag & drop réorganisation

---

### 10. PARAMÈTRES DU SITE

**URL:** `/admin/dashboard/settings`

**Configuration complète:**

**Informations générales:**
- Nom du site
- Tagline
- Description
- Localisation
- Email contact
- Téléphone

**Section Hero (accueil):**
- Titre principal
- Sous-titre
- Image de fond
- Boutons CTA (texte personnalisable)

**Section About:**
- Titre
- Contenu (rich text)
- Image principale
- Images secondaires

**Services:**
- Liste services offerts
- Description par service
- Icônes

**Réseaux sociaux:**
- Instagram URL
- Facebook URL
- Twitter URL
- LinkedIn URL
- Pinterest URL

**Design:**
- Couleur primaire (color picker)
- Couleur secondaire
- Police titres (dropdown)
- Police texte
- Thème design:
  - Modern
  - Glass (glassmorphism)
  - Minimal
  - Luxury

**SEO:**
- Meta titre
- Meta description
- Keywords
- Open Graph image

**Sauvegarde:**
- Bouton "Save Settings"
- Confirmation visuelle
- Mise à jour instantanée

---

## 👤 ESPACE CLIENT (PORTAIL PRIVÉ)

**URL:** `/client/login`

### AUTHENTIFICATION CLIENT

**Page de connexion:**
- Email
- Mot de passe
- Bouton "Se connecter"
- Design élégant avec logo

**Sécurité:**
- Session basée cookies
- Expiration automatique
- Vérification middleware
- Protection CSRF

---

### TABLEAU DE BORD CLIENT

**URL:** `/client/dashboard`

**Contenu:**
- Message de bienvenue personnalisé
- Logo photographe
- Liste galeries disponibles:
  - Nom galerie
  - Description
  - Image de couverture
  - Nombre de photos
  - Date ajout
  - Date expiration (si applicable)
  - Badge "Expiring Soon" (< 7 jours)
- Bouton déconnexion

**Cartes galeries:**
- Hover effect
- Clic → Ouvre galerie
- Statistiques visibles

---

### GALERIE CLIENT (NOUVELLE VERSION)

**URL:** `/client/gallery/[id]`

**INTERFACE COMPLÈTE:**

**En-tête:**
- Bouton retour dashboard
- Nom + description galerie
- **Compteur sélection:** "X of Y selected"
- **Bouton "Download Selected"** (si autorisé):
  - Télécharge toutes photos sélectionnées
  - Indique progression
  - Message succès
- **Bouton "Approve Selection"**:
  - Sauvegarde sélections en base
  - Confirmation visuelle
  - Animation succès

**Instructions:**
- Panneau bleu avec icône info
- Instructions claires:
  - "Click any photo to view it in full quality"
  - "Click the checkmark to select for printing"
  - "Click Approve Selection when done"
  - "Download individual or all selected photos"

**Grille photos:**
- **Images FULL QUALITY** (pas thumbnails!)
- Next.js Image optimisé (quality: 90)
- Responsive:
  - 2 colonnes mobile
  - 3 colonnes tablette
  - 4 colonnes laptop
  - 5-6 colonnes grand écran
- Espacement: 2-3px
- Aspect ratio carré

**Chaque photo:**
- **Badge numéro:** #1, #2, #3...
- **Bouton sélection:** Cercle avec checkmark
  - Gris par défaut
  - Primary color si sélectionnée
  - Animation smooth
- **Clic photo:** Ouvre lightbox
- **Hover:**
  - Overlay gradient noir
  - Boutons apparaissent:
    - Voir plein écran (icône maximize)
    - Télécharger (icône download)
- **Si sélectionnée:**
  - Ring primary 4px
  - Overlay primary/20
  - Animation scale

**LIGHTBOX PROFESSIONNEL:**

**En-tête lightbox:**
- **Gauche:** "Photo #X (Y/Z)"
- **Droite:**
  - Bouton téléchargement (si autorisé)
  - Bouton sélection (toggle)
  - Bouton fermer

**Image centrale:**
- **100% qualité** affichée
- Fond noir pur
- Image centrée
- Object-fit: contain
- Taille maximale écran

**Navigation:**
- Flèches gauche/droite (grandes, visibles)
- Navigation clavier:
  - ← → (précédent/suivant)
  - Esc (fermer)
- Mobile: Swipe left/right

**Indicateurs mobile:**
- Dots en bas (style Instagram)
- Dot actif plus large + blanc
- Dots inactifs petits + transparents

**Animations:**
- Fade in/out
- Scale smooth
- Framer Motion
- 200-300ms transitions

**Actions depuis lightbox:**
1. Naviguer photos (←/→ ou swipe)
2. Sélectionner/désélectionner (toggle checkmark)
3. Télécharger photo actuelle
4. Fermer (X ou Esc)

---

### FONCTIONNEMENT SÉLECTION:

**Workflow complet:**

1. **Consultation:**
   - Client se connecte
   - Voit ses galeries
   - Clique sur galerie

2. **Visualisation:**
   - Photos chargées en full quality
   - Clic photo → Lightbox full screen
   - Navigation fluide entre photos

3. **Sélection:**
   - Clic checkmark sur photo → Sélection toggle
   - État local (pas encore sauvegardé)
   - Compteur mis à jour en temps réel
   - Visual feedback immédiat

4. **Approbation:**
   - Clic "Approve Selection"
   - Sauvegarde BATCH en base de données
   - Chaque photo: `selectedForPrint = true/false`
   - Animation confirmation
   - Message "Selection saved successfully!"

5. **Téléchargement (si autorisé):**
   - Option 1: Download photo individuelle (hover/lightbox)
   - Option 2: "Download Selected" (toutes sélectionnées)
   - Téléchargement séquentiel
   - Délai 500ms entre chaque
   - Message succès avec nombre

**État persistant:**
- Sélections sauvegardées en DB
- Rechargement page = sélections conservées
- Admin peut voir sélections depuis dashboard
- Rapport téléchargeable pour admin

---

## ⚡ FONCTIONNALITÉS AVANCÉES

### 1. LIGHTBOX UNIVERSEL (PUBLIC + CLIENT)

**Caractéristiques:**
- Fond noir pur (OLED friendly)
- Image haute qualité (95-100%)
- Navigation clavier + swipe
- Responsive mobile/desktop
- Animations Framer Motion

**Desktop:**
- Sidebar droite (slide-in):
  - Titre photo
  - Description
  - Catégorie
  - Tags
  - Infos EXIF (si disponibles):
    - Camera
    - Lens
    - Focal length
    - Aperture
    - Shutter speed
    - ISO
  - Dimensions
  - Format
  - Boutons: Download, Share
- Fermeture: X, Esc, clic fond

**Mobile:**
- Bottom sheet (slide-up):
  - Drag handle
  - Infos photo
  - Tags
  - Actions: Like, Save
- **Swipe down pour fermer (NOUVEAU)**
- Swipe indicators (dots)
- Touch optimized
- Active states avec scale feedback

---

### 2. CLOUDINARY INTEGRATION

**Configuration:**
- Cloud name
- API key
- API secret
- Upload preset: "aminoss_preset"

**Photos:**
- Transformation automatique
- Thumbnails: 800x800 @ q_90
- Format optimisé (WebP si supporté)
- Lazy loading
- Responsive images

**Vidéos:**
- Streaming optimisé
- Thumbnails auto-générés
- Formats multiples supportés
- Limite 500MB

**Organisation dossiers:**
```
cloudinary/
├── portfolio/         (Photos publiques)
├── featured/          (Homepage)
├── videos/            (Vidéos portfolio)
├── reels/             (Short content)
├── clients/
│   ├── [client-name]/
│   │   └── [gallery-name]/
│   │       └── photos/
└── team/              (Photos équipe)
```

---

### 3. GESTION DATES & CALENDRIER

**Système complet:**
- Vue calendrier mensuelle
- Création événements rapide
- Événements multiples par jour
- Indicateurs visuels par type/statut
- Intégration réservations
- Dates bloquées
- Rappels automatiques (optionnel)

**Types événements:**
- Mariages
- Portraits
- Événements
- Voyages
- Autres

**Informations stockées:**
- Date/heure début/fin
- Client
- Lieu
- Prix
- Acompte
- Notes privées
- Statut

---

### 4. SYSTÈME DE RÉSERVATION

**Frontend:**
- Formulaire public élégant
- Validation temps réel
- Sélection package
- Date picker intégré
- Message personnalisé

**Backend:**
- Sauvegarde sécurisée
- Validation serveur
- Prévention spam
- Notifications admin
- Statut workflow

**Workflow:**
```
Client → Formulaire → Pending → Admin Review
                                      ↓
                              Confirm / Reject
                                      ↓
                              Calendar Event (si confirmé)
```

---

### 5. SEO & PERFORMANCE

**Optimisations:**
- Next.js App Router (Server Components)
- Image optimization automatique
- Lazy loading
- Code splitting
- Static generation pages publiques
- ISR (Incremental Static Regeneration)
- Meta tags dynamiques
- Sitemap.xml automatique
- Robots.txt configuré

**Lighthouse Score Target:**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 100
- SEO: 100

---

### 6. RESPONSIVE DESIGN

**Breakpoints:**
- Mobile: < 640px (sm)
- Tablet: 640-768px (md)
- Laptop: 768-1024px (lg)
- Desktop: 1024-1280px (xl)
- Large: > 1280px (2xl)

**Adaptations:**
- Grilles: colonnes variables
- Navigation: menu burger mobile
- Touch targets: 44px minimum
- Swipe gestures mobile
- Keyboard shortcuts desktop
- Font sizes responsive

---

### 7. DARK MODE

**Support complet:**
- Classe `dark:` Tailwind
- Toggle automatique système
- Couleurs adaptées:
  - `dark:bg-dark-900`
  - `dark:text-gray-100`
  - `dark:border-gray-700`
- Contraste optimisé
- Images adaptées

---

### 8. INSTAGRAM STORIES VIEWER (NOUVEAU)

**Composant:**
- `StoriesViewer.tsx` - Visualisation full-screen type Instagram

**Fonctionnalités:**
- **Full-screen modal** (fond noir)
- **Barres de progression:**
  - Une par story
  - Animation fluide
  - Indicateur position actuelle
- **Auto-advance:**
  - 5 secondes par story
  - Passage automatique au suivant
  - Passage au highlight suivant si fin
- **Navigation tactile:**
  - Tap gauche = story précédent
  - Tap droite = story suivant
  - Swipe down = fermer
- **Navigation clavier:**
  - ← = précédent
  - → = suivant
  - Esc = fermer
- **Header informations:**
  - Photo de profil du highlight
  - Nom du highlight
  - Bouton fermer (X)
- **Transitions:**
  - Fade in/out entre stories
  - Scale smooth
  - Animation fluide

**Contenu par highlight:**
1. **Gallery:** 6 meilleures photos portfolio
2. **Videos:** 4 aperçus vidéos
3. **Packages:** 4 showcases packages
4. **Contact:** 3 stories contact/info

---

### 9. MOBILE OPTIMIZATIONS (NOUVEAU)

**Touch Targets:**
- Minimum 44x44px (Apple Guidelines)
- Boutons: py-3.5 (56px height)
- Icônes: w-5 h-5 minimum
- Spacing approprié entre éléments

**Typography Mobile:**
- Texte base: 16px minimum (pas de zoom iOS)
- Titres: responsive (text-3xl sm:text-4xl md:text-5xl)
- Line-height adapté pour lisibilité

**Interactive Feedback:**
- `active:scale-95` sur tous boutons
- Transitions 200ms
- Hover states sur desktop
- Touch states sur mobile

**Spacing & Padding:**
- px-4 sm:px-6 lg:px-8 (responsive)
- py-6 sur éléments mobiles (vs py-4)
- gap-2 sm:gap-3 md:gap-4 (progressive)

**Navigation Mobile:**
- Menu burger 48px touch target
- Items menu: py-3.5 (56px)
- Icônes 20px (w-5 h-5)
- Background states pour feedback

**Grids Mobile:**
- Homepage: 3 colonnes fixes (Instagram-style)
- Gallery: 2-3-4 colonnes responsive
- Client gallery: 2-6 colonnes responsive

**Forms Mobile:**
- Inputs: min-height 44px
- Boutons: min-height 44px
- Labels: text-base (16px)
- Spacing approprié

---

### 10. INSTAGRAM INTEGRATION (NOUVEAU)

**Fonctionnalité:**
- Import direct depuis compte Instagram vers portfolio

**Configuration requise:**
- Instagram App ID (Facebook Developer)
- Instagram App Secret
- Redirect URI configuré
- Compte Instagram testé/approuvé

**Processus d'import:**
1. Admin clique "Sync from Instagram"
2. Connexion OAuth Instagram
3. Autorisation accès photos
4. Sélection photos à importer
5. Upload vers Cloudinary (dossier `instagram-imports/`)
6. Sauvegarde en base de données

**Paramètres d'import:**
- **Type**: Images uniquement (pas vidéos)
- **Catégorie par défaut**: Travel
- **Tags automatiques**: `["instagram", "import"]`
- **Visibilité**: Gallery (pas homepage par défaut)
- **Caption**: Utilisé comme titre/description

**Limitations API:**
- 200 requêtes/heure par utilisateur
- Token valide 60 jours
- Posts publics uniquement
- Pas d'accès Stories/DM

**Interface utilisateur:**
- Modal full-screen élégant
- Grille prévisualisation photos
- Sélection multiple (checkboxes)
- Compteur sélection
- Boutons "Select All" / "Deselect All"
- Progress indicator pendant import
- Messages succès/erreur détaillés
- Alerte si API non configurée
- Lien vers documentation setup

**Sécurité:**
- Tokens non stockés en base
- Fresh auth à chaque sync
- HTTPS requis pour redirect
- Variables d'environnement sécurisées

**Documentation:**
- Guide complet: `INSTAGRAM_SETUP.md`
- Instructions Facebook App
- Configuration OAuth
- Troubleshooting
- Exemples personnalisation

---

### 11. SÉCURITÉ

**Authentification:**
- NextAuth.js
- Bcrypt hashing passwords
- Sessions sécurisées
- CSRF protection
- Rate limiting (optionnel)

**Autorisations:**
- Admin: accès complet dashboard
- Client: accès portail uniquement
- Public: pages publiques seulement
- Middleware protection routes

**Données:**
- Validation Zod
- Sanitization inputs
- SQL injection prevention (Prisma)
- XSS protection
- Logs activité

---

## 📊 SPÉCIFICATIONS TECHNIQUES

### MODELS DE DONNÉES

#### 1. User (Admin)
```typescript
{
  id: string
  name: string
  email: string (unique)
  password: string (hashed)
  role: "admin"
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 2. Image
```typescript
{
  id: string
  cloudinaryId: string (unique)
  url: string
  thumbnailUrl: string
  title: string?
  description: string?
  category: string (weddings|portraits|events|fashion|travel)
  tags: string[]
  featured: boolean
  showOnHomepage: boolean
  showInGallery: boolean
  order: number
  width: number?
  height: number?
  format: string?
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 3. Video
```typescript
{
  id: string
  cloudinaryId: string (unique)
  url: string
  thumbnailUrl: string
  title: string
  description: string?
  category: string (videos|weddings|events|reels)
  tags: string[]
  duration: number? (seconds)
  width: number?
  height: number?
  format: string?
  featured: boolean
  showOnHomepage: boolean
  showInGallery: boolean
  order: number
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 4. Client
```typescript
{
  id: string
  name: string
  email: string (unique)
  password: string (hashed)
  phone: string?
  notes: string? (admin only)
  active: boolean
  lastActivity: DateTime?
  createdAt: DateTime
  updatedAt: DateTime
  galleries: ClientGallery[]
}
```

#### 5. ClientGallery
```typescript
{
  id: string
  clientId: string
  name: string
  description: string?
  coverImage: string?
  expiresAt: DateTime?
  allowDownload: boolean
  password: string? (extra security)
  downloads: number (counter)
  createdAt: DateTime
  updatedAt: DateTime
  client: Client (relation)
  photos: ClientPhoto[]
}
```

#### 6. ClientPhoto
```typescript
{
  id: string
  galleryId: string
  cloudinaryId: string
  url: string
  thumbnailUrl: string
  title: string?
  description: string?
  width: number?
  height: number?
  format: string?
  fileSize: number? (bytes)
  order: number
  photoNumber: number (display #)
  selectedForPrint: boolean ← SÉLECTION CLIENT
  createdAt: DateTime
  gallery: ClientGallery (relation)
}
```

#### 7. Pack
```typescript
{
  id: string
  name: string
  description: string
  price: number
  duration: string ("2 hours", "Full day")
  coverImage: string
  features: string[] (array)
  category: string (wedding|portrait|fashion|commercial)
  active: boolean
  order: number
  createdAt: DateTime
  updatedAt: DateTime
  bookings: Booking[]
}
```

#### 8. Booking
```typescript
{
  id: string
  clientName: string
  clientEmail: string
  clientPhone: string?
  packId: string?
  packName: string
  requestedDate: DateTime
  alternateDate: DateTime?
  status: string (pending|confirmed|rejected|cancelled)
  message: string?
  adminNotes: string? (private)
  createdAt: DateTime
  updatedAt: DateTime
  pack: Pack? (relation)
}
```

#### 9. CalendarEvent
```typescript
{
  id: string
  date: DateTime
  title: string
  clientName: string?
  eventType: string (wedding|portrait|event|travel|other)
  startTime: string?
  endTime: string?
  location: string?
  price: number?
  deposit: number?
  notes: string?
  status: string (pending|confirmed|completed|cancelled)
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 10. ContactMessage
```typescript
{
  id: string
  name: string
  email: string
  phone: string?
  subject: string?
  message: string
  status: string (unread|read|replied|archived)
  replied: boolean
  replyText: string?
  repliedAt: DateTime?
  ipAddress: string?
  userAgent: string?
  createdAt: DateTime
  updatedAt: DateTime
}
```

#### 11. SiteSettings
```typescript
{
  id: string
  siteName: string
  tagline: string
  description: string?
  location: string
  email: string?
  phone: string?
  
  // Social
  instagramUrl: string?
  facebookUrl: string?
  twitterUrl: string?
  
  // Hero
  heroTitle: string
  heroSubtitle: string
  heroImage: string?
  
  // About
  aboutTitle: string
  aboutContent: string
  aboutImage: string?
  
  // Design
  primaryColor: string
  secondaryColor: string
  fontHeading: string
  fontBody: string
  designTheme: string (modern|glass|minimal|luxury)
  
  updatedAt: DateTime
}
```

---

## 🔗 ROUTES API

### Public APIs
```
GET  /api/admin/images?featured=true      - Images homepage
GET  /api/admin/images?category=weddings  - Images par catégorie
GET  /api/videos?homepage=true            - Vidéos homepage
GET  /api/admin/settings                  - Paramètres site
POST /api/contact                         - Envoyer message
POST /api/booking                         - Créer réservation
GET  /api/packs                           - Liste packages
```

### Admin APIs
```
GET    /api/admin/images                  - Liste photos
POST   /api/admin/images (sync)           - Sync Cloudinary
PUT    /api/admin/images                  - Update photo
DELETE /api/admin/images?id=X             - Supprimer photo

GET    /api/admin/videos                  - Liste vidéos
POST   /api/admin/videos (sync)           - Sync vidéos
PUT    /api/admin/videos                  - Update vidéo
DELETE /api/admin/videos?id=X             - Supprimer vidéo

GET    /api/admin/clients                 - Liste clients
POST   /api/admin/clients                 - Créer client
PUT    /api/admin/clients                 - Update client
DELETE /api/admin/clients?id=X            - Supprimer client

GET    /api/admin/galleries               - Liste galeries
POST   /api/admin/galleries               - Créer galerie
PUT    /api/admin/galleries               - Update galerie
DELETE /api/admin/galleries?id=X          - Supprimer galerie

GET    /api/admin/calendar/events         - Liste événements
POST   /api/admin/calendar/events         - Créer événement
PUT    /api/admin/calendar/events         - Update événement
DELETE /api/admin/calendar/events?id=X    - Supprimer événement

GET    /api/admin/bookings                - Liste réservations
PUT    /api/admin/bookings                - Update réservation
DELETE /api/admin/bookings?id=X           - Supprimer réservation

GET    /api/admin/messages                - Liste messages
PUT    /api/admin/messages                - Update message
DELETE /api/admin/messages?id=X           - Supprimer message

GET    /api/admin/packs                   - Liste packages
POST   /api/admin/packs                   - Créer package
PUT    /api/admin/packs                   - Update package
DELETE /api/admin/packs?id=X              - Supprimer package

GET    /api/admin/settings                - Paramètres
PUT    /api/admin/settings                - Update paramètres
```

### Client Portal APIs
```
POST /api/client/auth/login               - Connexion client
POST /api/client/auth/logout              - Déconnexion
GET  /api/client/auth/me                  - Info client connecté
GET  /api/client/galleries                - Galeries du client
POST /api/client/photos/select            - Toggle sélection photo
```

---

## 🎨 DESIGN SYSTEM

### Couleurs
```css
Primary: #c67548 (Orange/Brown)
Secondary: #2d3748 (Dark Blue-Gray)

Light Mode:
- Background: #ffffff, #f9fafb, #f3f4f6
- Text: #111827, #374151, #6b7280
- Border: #e5e7eb, #d1d5db

Dark Mode:
- Background: #0f172a (dark-900), #1e293b (dark-800)
- Text: #f9fafb, #e2e8f0, #cbd5e1
- Border: #334155, #475569
```

### Typography
```css
Headings: 'Poppins' (sans-serif)
Body: 'Inter' (sans-serif)
Code: 'Fira Code' (monospace)

Sizes:
- xs: 0.75rem (12px)
- sm: 0.875rem (14px)
- base: 1rem (16px)
- lg: 1.125rem (18px)
- xl: 1.25rem (20px)
- 2xl: 1.5rem (24px)
- 3xl: 1.875rem (30px)
- 4xl: 2.25rem (36px)
```

### Spacing
```css
0: 0px
1: 0.25rem (4px)
2: 0.5rem (8px)
3: 0.75rem (12px)
4: 1rem (16px)
6: 1.5rem (24px)
8: 2rem (32px)
12: 3rem (48px)
```

### Animations
```css
Duration:
- Fast: 150ms
- Normal: 200-300ms
- Slow: 500ms

Easing:
- ease-in-out
- ease-out
- cubic-bezier(0.4, 0, 0.2, 1)

Framer Motion:
- initial={{ opacity: 0, y: 20 }}
- animate={{ opacity: 1, y: 0 }}
- transition={{ duration: 0.3 }}
```

---

## 📱 RESPONSIVE BREAKPOINTS

```css
Mobile First Approach:

sm: 640px   (Small devices)
md: 768px   (Tablets)
lg: 1024px  (Laptops)
xl: 1280px  (Desktops)
2xl: 1536px (Large screens)

Grid Columns:
Mobile: 1-2 columns
Tablet: 3-4 columns
Desktop: 4-6 columns
```

---

## ⚙️ VARIABLES D'ENVIRONNEMENT

```env
# Database
DATABASE_URL="mongodb+srv://..."

# NextAuth
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="[random-secret]"

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME="aminoss"
CLOUDINARY_API_KEY="[api-key]"
CLOUDINARY_API_SECRET="[api-secret]"

# Email (optionnel)
EMAIL_SERVER="smtp://..."
EMAIL_FROM="noreply@aminoss.com"
```

---

## 🚀 DÉPLOIEMENT

### Vercel (Recommandé)
```bash
# Installation
npm install -g vercel

# Premier déploiement
vercel

# Production
vercel --prod

# Variables d'environnement
vercel env add DATABASE_URL
vercel env add NEXTAUTH_SECRET
vercel env add CLOUDINARY_API_KEY
vercel env add CLOUDINARY_API_SECRET
```

### Configuration Vercel
```json
{
  "buildCommand": "prisma generate && next build",
  "outputDirectory": ".next",
  "framework": "nextjs",
  "regions": ["cdg1"]
}
```

---

## 📦 COMMANDES UTILES

```bash
# Développement
npm run dev                    # Démarrer serveur dev

# Prisma
npx prisma generate           # Générer client
npx prisma db push            # Sync schema → DB
npx prisma studio             # Interface graphique DB

# Build
npm run build                 # Build production
npm start                     # Démarrer production

# Git
git add .
git commit -m "message"
git push origin master

# Vercel
vercel                        # Preview deploy
vercel --prod                 # Production deploy
```

---

## 📈 STATISTIQUES ACTUELLES

### Base de Données
- **12 modèles** de données
- **30+ champs** configurables
- Relations complexes (1-to-many, many-to-many)

### Interface Admin
- **10 pages** de gestion
- **50+ actions** CRUD
- Upload direct Cloudinary
- Sync automatique

### Interface Client
- **3 pages** principales
- Lightbox full quality
- Système sélection
- Téléchargement batch

### Public
- **7 pages** publiques
- Design Instagram-style
- SEO optimisé
- Performance 90+

---

## 🔄 WORKFLOW COMPLET

### 1. Upload Photos Admin
```
Admin Dashboard → Photos → Upload
   ↓
Cloudinary (stockage)
   ↓
Database (métadonnées)
   ↓
Site Public (affichage)
```

### 2. Créer Galerie Client
```
Admin Dashboard → Clients → Select Client
   ↓
Create Gallery → Upload Photos
   ↓
Client receives access
   ↓
Client views & selects photos
   ↓
Admin sees selections
```

### 3. Réservation Client
```
Client (public) → Booking Form
   ↓
Submit → Database (pending)
   ↓
Admin notification
   ↓
Admin confirms → Calendar Event
   ↓
Client notified
```

---

## ✅ FONCTIONNALITÉS COMPLÉTÉES

### Phase 1 - Core (✅ Terminé)
- [x] Authentification admin
- [x] Upload photos/vidéos
- [x] Gestion portfolio
- [x] Pages publiques
- [x] Contact form
- [x] Réservations

### Phase 2 - Client Portal (✅ Terminé)
- [x] Authentification clients
- [x] Galeries privées
- [x] Upload photos galeries
- [x] Sélection photos (nouveau)
- [x] Lightbox full quality (nouveau)
- [x] Téléchargement photos (nouveau)
- [x] Système approbation (nouveau)

### Phase 3 - Advanced (✅ Terminé)
- [x] Calendrier événements
- [x] Packages/tarifs
- [x] Messages contact
- [x] Settings site
- [x] Design Instagram-style (nouveau)
- [x] Responsive complet
- [x] Dark mode

### Phase 4 - Optimizations (✅ Terminé)
- [x] Performance optimization
- [x] SEO
- [x] Image quality (800x800 @ 90%)
- [x] Video upload (500MB limit)
- [x] Lightbox redesign (mobile + desktop)
- [x] Cloudinary integration
- [x] Error handling
- [x] Swipe down to close lightbox (NOUVEAU)
- [x] Instagram Stories highlights (NOUVEAU)
- [x] Mobile optimization (NOUVEAU)
  - [x] Touch targets 44px+ minimum
  - [x] Improved spacing and padding
  - [x] Responsive buttons and forms
  - [x] Active states for touch feedback
  - [x] Better mobile navigation

### Phase 5 - Instagram Integration (✅ Terminé)
- [x] Instagram Basic Display API integration
- [x] OAuth authentication flow
- [x] Photo import from Instagram
- [x] Cloudinary upload pipeline
- [x] Batch import with selection
- [x] Error handling and validation
- [x] Setup documentation (INSTAGRAM_SETUP.md)

---

## 🎯 POINTS FORTS DE LA PLATEFORME

### Pour le Photographe (Admin)
✅ **Gestion complète en un seul endroit**
✅ **Upload direct sans FTP**
✅ **Organisation automatique**
✅ **Calendrier intégré**
✅ **Réservations gérées**
✅ **Communication clients**
✅ **Statistiques temps réel**
✅ **Personnalisation totale**

### Pour les Clients
✅ **Accès privé sécurisé**
✅ **Photos full quality**
✅ **Sélection intuitive**
✅ **Téléchargement facile**
✅ **Interface moderne**
✅ **Mobile friendly**
✅ **Expiration automatique**

### Pour les Visiteurs
✅ **Design Instagram moderne**
✅ **Navigation intuitive**
✅ **Performance rapide**
✅ **Réservation simple**
✅ **Contact direct**
✅ **SEO optimisé**

---

## 🔮 ÉVOLUTIONS POSSIBLES (FUTURES)

### Court terme
- [ ] Notifications email automatiques
- [ ] Export PDF factures
- [ ] Watermark automatique
- [ ] Partage social direct
- [ ] Wishlist publique

### Moyen terme
- [ ] Paiement en ligne (Stripe)
- [ ] Signature contrats électroniques
- [ ] App mobile (React Native)
- [ ] Blog intégré
- [ ] Multi-langue

### Long terme
- [ ] IA tri automatique photos
- [ ] Reconnaissance faciale
- [ ] Editing photos basique
- [ ] Marketplace templates
- [ ] White-label solution

---

## 📊 MÉTRIQUES DE SUCCÈS

### Performance
- Page load: < 2s
- First Contentful Paint: < 1s
- Time to Interactive: < 3s
- Lighthouse: 90+ sur tous critères

### UX
- Taux rebond: < 40%
- Temps session: > 3 min
- Pages/session: > 4
- Conversion booking: > 5%

### Technique
- Uptime: 99.9%
- Zero errors console
- API response: < 500ms
- Image load: < 1s

---

## 🏆 CONCLUSION

**AMINOSS PHOTOGRAPHY** est une plateforme complète, moderne et professionnelle qui offre:

✨ **Interface publique magnifique** (Instagram-style)
✨ **Gestion admin puissante** (tout-en-un)
✨ **Portail client innovant** (full quality + sélection)
✨ **Performance optimale** (Next.js + Cloudinary)
✨ **Sécurité robuste** (NextAuth + Prisma)
✨ **Design responsive** (mobile-first)
✨ **Expérience utilisateur** (fluide et intuitive)

**Stack technique moderne**, **code propre**, **architecture scalable**, prête pour **croissance future**.

---

**Version:** 1.0  
**Dernière mise à jour:** November 6, 2025  
**Status:** ✅ Production Ready  
**URL:** https://aminossphotography-de89ue40o-aminech990000-6355s-projects.vercel.app

---

## 📞 SUPPORT TECHNIQUE

Pour toute question ou assistance:
- Documentation code: Commentaires inline
- Architecture: Dossier `/docs`
- Issues: GitHub Issues
- Contact: aminech990000@gmail.com

---

**🎉 PLATEFORME 100% OPÉRATIONNELLE ET DÉPLOYÉE 🎉**
