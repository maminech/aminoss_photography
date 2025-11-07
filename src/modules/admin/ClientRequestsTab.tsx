'use client';

/**
 * Client Requests Tab
 * Admin panel for viewing and approving client quote requests
 * Includes contract generation and Google Calendar integration
 */

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  CheckCircle, 
  XCircle, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  MapPin,
  FileText,
  Download,
  Eye
} from 'lucide-react';

interface ClientRequest {
  id: string;
  name: string;
  email: string;
  phone: string;
  eventType: string;
  eventDate: string;
  timeSlot: string;
  location: string;
  packageName?: string;
  packagePrice?: number;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: string;
  contractGenerated?: boolean;
  calendarEventId?: string;
}

export default function ClientRequestsTab() {
  const [requests, setRequests] = useState<ClientRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [processingId, setProcessingId] = useState<string | null>(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/client-requests');
      if (res.ok) {
        const data = await res.json();
        setRequests(data);
      }
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const res = await fetch(`/api/admin/client-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'approved' }),
      });

      if (res.ok) {
        const data = await res.json();
        setRequests(requests.map(req => 
          req.id === requestId ? { ...req, ...data } : req
        ));
      }
    } catch (error) {
      console.error('Error approving request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (requestId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir rejeter cette demande ?')) return;
    
    setProcessingId(requestId);
    try {
      const res = await fetch(`/api/admin/client-requests/${requestId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'rejected' }),
      });

      if (res.ok) {
        setRequests(requests.map(req => 
          req.id === requestId ? { ...req, status: 'rejected' } : req
        ));
      }
    } catch (error) {
      console.error('Error rejecting request:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleGenerateContract = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const res = await fetch(`/api/admin/generate-contract/${requestId}`, {
        method: 'POST',
      });

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `contract-${requestId}.pdf`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        // Update request state
        setRequests(requests.map(req => 
          req.id === requestId ? { ...req, contractGenerated: true } : req
        ));
      }
    } catch (error) {
      console.error('Error generating contract:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const handleAddToCalendar = async (requestId: string) => {
    setProcessingId(requestId);
    try {
      const res = await fetch(`/api/admin/google-calendar/add-event`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId }),
      });

      if (res.ok) {
        const data = await res.json();
        setRequests(requests.map(req => 
          req.id === requestId ? { ...req, calendarEventId: data.eventId } : req
        ));
      }
    } catch (error) {
      console.error('Error adding to calendar:', error);
    } finally {
      setProcessingId(null);
    }
  };

  const filteredRequests = requests.filter(req => 
    filter === 'all' ? true : req.status === filter
  );

  const statusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'approved': return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };

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
      {/* Filter Buttons */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {['all', 'pending', 'approved', 'rejected'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as typeof filter)}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === f
                ? 'bg-primary text-white'
                : 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
            <span className="ml-2 text-sm opacity-75">
              ({requests.filter(r => f === 'all' || r.status === f).length})
            </span>
          </button>
        ))}
      </div>

      {/* Requests List */}
      <div className="space-y-4">
        {filteredRequests.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 dark:text-gray-400">
              Aucune demande {filter !== 'all' && filter}
            </p>
          </div>
        ) : (
          filteredRequests.map((request) => (
            <motion.div
              key={request.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                      {request.name}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColor(request.status)}`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Demande créée le {new Date(request.createdAt).toLocaleDateString('fr-FR')}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Mail className="w-4 h-4 text-primary" />
                  <span className="text-sm">{request.email}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Phone className="w-4 h-4 text-primary" />
                  <span className="text-sm">{request.phone}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span className="text-sm">
                    {new Date(request.eventDate).toLocaleDateString('fr-FR')} - {request.timeSlot}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-gray-700 dark:text-gray-300">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span className="text-sm">{request.location}</span>
                </div>
              </div>

              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">
                  Type d'événement: <span className="text-primary">{request.eventType}</span>
                </p>
                {request.packageName && (
                  <p className="text-sm text-gray-700 dark:text-gray-300 mb-2">
                    Package: {request.packageName} ({request.packagePrice} DT)
                  </p>
                )}
                {request.message && (
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">Message:</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{request.message}</p>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {request.status === 'pending' && (
                  <>
                    <button
                      onClick={() => handleApprove(request.id)}
                      disabled={processingId === request.id}
                      className="btn-primary flex items-center gap-2"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Approuver
                    </button>
                    <button
                      onClick={() => handleReject(request.id)}
                      disabled={processingId === request.id}
                      className="btn-secondary flex items-center gap-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400"
                    >
                      <XCircle className="w-4 h-4" />
                      Rejeter
                    </button>
                  </>
                )}

                {request.status === 'approved' && (
                  <>
                    {!request.contractGenerated && (
                      <button
                        onClick={() => handleGenerateContract(request.id)}
                        disabled={processingId === request.id}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <FileText className="w-4 h-4" />
                        Générer Contrat
                      </button>
                    )}
                    {request.contractGenerated && (
                      <button
                        onClick={() => handleGenerateContract(request.id)}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <Download className="w-4 h-4" />
                        Télécharger Contrat
                      </button>
                    )}
                    {!request.calendarEventId && (
                      <button
                        onClick={() => handleAddToCalendar(request.id)}
                        disabled={processingId === request.id}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <Calendar className="w-4 h-4" />
                        Ajouter au Calendrier
                      </button>
                    )}
                    {request.calendarEventId && (
                      <span className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        Ajouté au calendrier
                      </span>
                    )}
                  </>
                )}
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
