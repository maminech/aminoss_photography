'use client';

/**
 * Google Calendar Integration Component
 * OAuth setup and event creation for approved bookings
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, CheckCircle, AlertCircle, Loader, Link as LinkIcon } from 'lucide-react';

interface CalendarSettings {
  isConnected: boolean;
  email?: string;
  lastSync?: string;
}

export default function GoogleCalendarIntegration() {
  const [settings, setSettings] = useState<CalendarSettings>({ isConnected: false });
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const res = await fetch('/api/admin/google-calendar/settings');
      if (res.ok) {
        const data = await res.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching calendar settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async () => {
    setConnecting(true);
    try {
      const res = await fetch('/api/admin/google-calendar/auth');
      const data = await res.json();
      
      if (res.ok) {
        // Redirect to Google OAuth
        window.location.href = data.authUrl;
      } else {
        setStatus('error');
        console.error('Google Calendar auth error:', data);
        setMessage(data.message || data.error || 'Erreur lors de la connexion à Google Calendar');
      }
    } catch (error) {
      console.error('Error connecting to Google Calendar:', error);
      setStatus('error');
      setMessage('Erreur lors de la connexion: ' + (error instanceof Error ? error.message : 'Unknown error'));
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    if (!confirm('Êtes-vous sûr de vouloir déconnecter Google Calendar ?')) return;

    try {
      const res = await fetch('/api/admin/google-calendar/disconnect', {
        method: 'POST',
      });

      if (res.ok) {
        setSettings({ isConnected: false });
        setStatus('success');
        setMessage('Google Calendar déconnecté');
      }
    } catch (error) {
      console.error('Error disconnecting:', error);
      setStatus('error');
      setMessage('Erreur lors de la déconnexion');
    }
  };

  const handleSync = async () => {
    setConnecting(true);
    try {
      const res = await fetch('/api/admin/google-calendar/sync', {
        method: 'POST',
      });

      if (res.ok) {
        setStatus('success');
        setMessage('Calendrier synchronisé avec succès');
        fetchSettings();
      } else {
        setStatus('error');
        setMessage('Erreur lors de la synchronisation');
      }
    } catch (error) {
      console.error('Error syncing calendar:', error);
      setStatus('error');
      setMessage('Erreur lors de la synchronisation');
    } finally {
      setConnecting(false);
    }
  };

  if (loading) {
    return (
      <div className="glass-card p-6 animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
        <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Intégration Google Calendar
      </h2>

      <div className="glass-card p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${
            settings.isConnected 
              ? 'bg-green-100 dark:bg-green-900/30' 
              : 'bg-gray-100 dark:bg-gray-800'
          }`}>
            <Calendar className={`w-8 h-8 ${
              settings.isConnected 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-gray-600 dark:text-gray-400'
            }`} />
          </div>

          <div className="flex-1">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">
              Statut de la connexion
            </h3>
            
            {settings.isConnected ? (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-medium">Connecté</span>
                </div>
                
                {settings.email && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Compte: <span className="font-medium">{settings.email}</span>
                  </p>
                )}
                
                {settings.lastSync && (
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Dernière synchronisation: {new Date(settings.lastSync).toLocaleString('fr-FR')}
                  </p>
                )}

                <div className="flex gap-3 mt-4">
                  <button
                    onClick={handleSync}
                    disabled={connecting}
                    className="btn-primary flex items-center gap-2"
                  >
                    {connecting ? (
                      <Loader className="w-4 h-4 animate-spin" />
                    ) : (
                      <Calendar className="w-4 h-4" />
                    )}
                    Synchroniser
                  </button>
                  <button
                    onClick={handleDisconnect}
                    className="btn-secondary text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    Déconnecter
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
                  <AlertCircle className="w-5 h-5" />
                  <span className="font-medium">Non connecté</span>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Connectez votre compte Google pour synchroniser automatiquement les événements approuvés dans votre calendrier.
                </p>

                <button
                  onClick={handleConnect}
                  disabled={connecting}
                  className="btn-primary flex items-center gap-2 mt-4"
                >
                  {connecting ? (
                    <Loader className="w-4 h-4 animate-spin" />
                  ) : (
                    <LinkIcon className="w-4 h-4" />
                  )}
                  Connecter Google Calendar
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Features List */}
        <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
          <h4 className="font-medium text-gray-900 dark:text-white mb-3">
            Fonctionnalités
          </h4>
          <ul className="space-y-2">
            {[
              'Création automatique d\'événements lors de l\'approbation',
              'Synchronisation bidirectionnelle des modifications',
              'Notifications par email pour les nouveaux événements',
              'Gestion des conflits de calendrier',
            ].map((feature, index) => (
              <li key={index} className="flex items-start gap-2 text-sm text-gray-600 dark:text-gray-400">
                <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                <span>{feature}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Status Messages */}
        {status !== 'idle' && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`mt-4 p-4 rounded-lg flex items-center gap-2 ${
              status === 'success'
                ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
                : 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
            }`}
          >
            {status === 'success' ? (
              <CheckCircle className="w-5 h-5" />
            ) : (
              <AlertCircle className="w-5 h-5" />
            )}
            <span className="text-sm font-medium">{message}</span>
          </motion.div>
        )}

        {/* Security Note */}
        <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <div className="flex gap-2">
            <AlertCircle className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-blue-900 dark:text-blue-300 mb-1">
                Sécurité et confidentialité
              </p>
              <p className="text-sm text-blue-700 dark:text-blue-400">
                Votre compte Google est connecté de manière sécurisée via OAuth 2.0. 
                Nous n'avons accès qu'à votre calendrier et ne stockons aucun mot de passe.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
