'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUsers, FiMail, FiPhone, FiLock } from 'react-icons/fi';

// Add animations
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInUp {
      from {
        opacity: 0;
        transform: translateY(20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    @keyframes slideUp {
      from {
        opacity: 0;
        transform: translateY(20px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }
    .animate-fadeIn {
      animation: fadeIn 0.2s ease-out;
    }
    .animate-slideUp {
      animation: slideUp 0.3s ease-out;
    }
  `;
  document.head.appendChild(style);
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  notes?: string;
  active: boolean;
  createdAt: string;
  _count: {
    galleries: number;
  };
}

export default function AdminClientsPage() {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    notes: '',
    active: true,
  });

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    try {
      const res = await fetch('/api/admin/clients');
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const method = selectedClient ? 'PUT' : 'POST';
      const body = selectedClient
        ? { ...formData, id: selectedClient.id }
        : formData;

      const res = await fetch('/api/admin/clients', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        alert(`✅ Client ${selectedClient ? 'updated' : 'created'} successfully!`);
        fetchClients();
        closeModal();
      } else {
        const data = await res.json();
        alert(`❌ ${data.error}`);
      }
    } catch (error) {
      alert('❌ An error occurred');
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this client? All their galleries will also be deleted.')) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/clients?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        alert('✅ Client deleted');
        fetchClients();
      }
    } catch (error) {
      alert('❌ Failed to delete client');
    }
  };

  const openModal = (client?: Client) => {
    if (client) {
      setSelectedClient(client);
      setFormData({
        name: client.name,
        email: client.email,
        password: '',
        phone: client.phone || '',
        notes: client.notes || '',
        active: client.active,
      });
    } else {
      setSelectedClient(null);
      setFormData({
        name: '',
        email: '',
        password: '',
        phone: '',
        notes: '',
        active: true,
      });
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setSelectedClient(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-dark-700 sticky top-0 z-30 shadow-sm">
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center space-x-3 mb-2">
                <div className="p-2 bg-primary/10 dark:bg-primary/20 rounded-lg">
                  <FiUsers className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Client Management
                </h1>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 ml-14">
                <span className="font-semibold text-primary">{clients.length}</span> total clients • 
                <span className="font-semibold text-green-600 dark:text-green-500 ml-1">{clients.filter(c => c.active).length}</span> active
              </p>
            </div>
            <button
              onClick={() => openModal()}
              className="group relative flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
            >
              <FiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-medium">Add Client</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 max-w-7xl mx-auto">
        {clients.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-xl border border-gray-200 dark:border-dark-700 p-16 text-center transform hover:scale-[1.02] transition-transform duration-300">
            <div className="relative inline-block mb-6">
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary/10 blur-2xl"></div>
              <FiUsers className="relative w-20 h-20 text-primary mx-auto" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">No Clients Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-8 max-w-md mx-auto">
              Create your first client account to start sharing beautiful photos and galleries
            </p>
            <button
              onClick={() => openModal()}
              className="group inline-flex items-center space-x-2 px-8 py-4 bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl hover:shadow-xl hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105"
            >
              <FiPlus className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
              <span className="font-semibold">Add First Client</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {clients.map((client, index) => (
              <div
                key={client.id}
                className={`relative bg-white dark:bg-dark-800 rounded-2xl shadow-lg border overflow-hidden group transform hover:scale-[1.02] transition-all duration-300 ${
                  !client.active 
                    ? 'opacity-60 border-gray-300 dark:border-dark-600' 
                    : 'border-gray-200 dark:border-dark-700 hover:border-primary/30 dark:hover:border-primary/50 hover:shadow-2xl hover:shadow-primary/10'
                }`}
                style={{
                  animationDelay: `${index * 50}ms`,
                  animation: 'fadeInUp 0.5s ease-out forwards'
                }}
              >
                {/* Gradient overlay on hover */}
                <div className="absolute inset-0 bg-gradient-to-br from-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:to-primary/10 transition-all duration-300 pointer-events-none"></div>
                
                <a href={`/admin/dashboard/clients/${client.id}`} className="relative block p-6 cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 dark:bg-primary/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <span className="text-primary font-bold text-lg">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white group-hover:text-primary transition-colors duration-300 truncate">
                          {client.name}
                        </h3>
                      </div>
                      <div className="space-y-2 ml-12">
                        <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                          <FiMail className="w-4 h-4 mr-2 flex-shrink-0" />
                          <span className="truncate">{client.email}</span>
                        </div>
                        {client.phone && (
                          <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                            <FiPhone className="w-4 h-4 mr-2 flex-shrink-0" />
                            <span>{client.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex space-x-1" onClick={(e) => e.preventDefault()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(client);
                        }}
                        className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-primary dark:hover:text-primary hover:bg-primary/10 dark:hover:bg-primary/20 rounded-lg transition-all duration-200 transform hover:scale-110"
                        title="Edit client"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(client.id);
                        }}
                        className="p-2.5 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-all duration-200 transform hover:scale-110"
                        title="Delete client"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {client.notes && (
                    <div className="mb-4 p-3 bg-gray-50 dark:bg-dark-700/50 rounded-lg border border-gray-100 dark:border-dark-600">
                      <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 italic">
                        "{client.notes}"
                      </p>
                    </div>
                  )}

                  <div className="pt-4 mt-4 border-t border-gray-200 dark:border-dark-700">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                          <span className="text-primary font-bold text-sm">{client._count.galleries}</span>
                        </div>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {client._count.galleries === 1 ? 'Gallery' : 'Galleries'}
                        </span>
                      </div>
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-sm ${
                          client.active
                            ? 'bg-gradient-to-r from-green-500 to-green-600 text-white'
                            : 'bg-gray-200 dark:bg-dark-700 text-gray-700 dark:text-gray-400'
                        }`}
                      >
                        {client.active ? '● Active' : '○ Inactive'}
                      </span>
                    </div>
                  </div>
                </a>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white dark:bg-dark-800 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-dark-700 transform animate-slideUp">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-dark-700 bg-gray-50 dark:bg-dark-700/50">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 dark:bg-primary/20 flex items-center justify-center">
                  {selectedClient ? (
                    <FiEdit2 className="w-5 h-5 text-primary" />
                  ) : (
                    <FiPlus className="w-5 h-5 text-primary" />
                  )}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                  {selectedClient ? 'Edit Client' : 'Add New Client'}
                </h2>
              </div>
              <button 
                onClick={closeModal} 
                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-dark-600 p-2 rounded-lg transition-all duration-200 transform hover:scale-110"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto max-h-[calc(90vh-88px)]">
              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <FiUsers className="w-4 h-4 text-primary" />
                  <span>Full Name *</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-dark-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  placeholder="John Doe"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <FiMail className="w-4 h-4 text-primary" />
                  <span>Email Address *</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-dark-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  placeholder="john@example.com"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <FiLock className="w-4 h-4 text-primary" />
                  <span>Password {selectedClient && '(leave blank to keep current)'}{!selectedClient && ' *'}</span>
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!selectedClient}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-dark-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <FiPhone className="w-4 h-4 text-primary" />
                  <span>Phone Number</span>
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-dark-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm font-semibold text-gray-700 dark:text-gray-300">
                  <span>📝</span>
                  <span>Notes (Internal)</span>
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 dark:bg-dark-700 dark:text-gray-100 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all duration-200 resize-none"
                  placeholder="Wedding shoot - June 2025"
                />
              </div>

              <div className="flex items-center p-4 bg-gray-50 dark:bg-dark-700/50 rounded-xl border border-gray-200 dark:border-dark-600">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-5 h-5 text-primary border-gray-300 dark:border-dark-600 rounded focus:ring-primary cursor-pointer"
                />
                <label htmlFor="active" className="ml-3 text-sm font-medium text-gray-700 dark:text-gray-300 cursor-pointer">
                  Active (client can log in and access galleries)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-dark-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-3 border border-gray-300 dark:border-dark-600 text-gray-700 dark:text-gray-300 bg-white dark:bg-dark-700 rounded-xl hover:bg-gray-50 dark:hover:bg-dark-600 transition-all duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-8 py-3 bg-gradient-to-r from-primary to-primary/90 text-white rounded-xl hover:shadow-lg hover:shadow-primary/25 transition-all duration-300 transform hover:scale-105 font-semibold"
                >
                  {selectedClient ? '✓ Update Client' : '+ Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

