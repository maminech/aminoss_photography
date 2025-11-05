'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUsers, FiMail, FiPhone, FiLock } from 'react-icons/fi';

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
      <header className="bg-white dark:bg-dark-800 border-b border-gray-200 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Client Management</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                {clients.length} total clients • {clients.filter(c => c.active).length} active
              </p>
            </div>
            <button
              onClick={() => openModal()}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Client</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {clients.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FiUsers className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">No Clients Yet</h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first client account to start sharing photos
            </p>
            <button
              onClick={() => openModal()}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              <FiPlus className="w-5 h-5" />
              <span>Add First Client</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {clients.map((client) => (
              <div
                key={client.id}
                className={`bg-white rounded-lg shadow-sm border overflow-hidden group ${
                  !client.active ? 'opacity-60 border-gray-300' : 'border-gray-200 hover:border-primary hover:shadow-md'
                } transition-all duration-200`}
              >
                <a href={`/admin/dashboard/clients/${client.id}`} className="block p-6 cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-1 group-hover:text-primary transition">
                        {client.name}
                      </h3>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <FiMail className="w-4 h-4 mr-1" />
                        {client.email}
                      </div>
                      {client.phone && (
                        <div className="flex items-center text-sm text-gray-600">
                          <FiPhone className="w-4 h-4 mr-1" />
                          {client.phone}
                        </div>
                      )}
                    </div>
                    <div className="flex space-x-2" onClick={(e) => e.preventDefault()}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          openModal(client);
                        }}
                        className="p-2 text-gray-400 hover:text-primary-600 hover:bg-gray-100 rounded transition"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(client.id);
                        }}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {client.notes && (
                    <p className="text-sm text-gray-600 mb-3 line-clamp-2">{client.notes}</p>
                  )}

                  <div className="pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">
                        {client._count.galleries} {client._count.galleries === 1 ? 'gallery' : 'galleries'}
                      </span>
                      <span
                        className={`px-2 py-1 rounded text-xs font-semibold ${
                          client.active
                            ? 'bg-green-100 text-green-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {client.active ? 'Active' : 'Inactive'}
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
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                {selectedClient ? 'Edit Client' : 'Add New Client'}
              </h2>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Full Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Password {selectedClient && '(leave blank to keep current)'}
                  {!selectedClient && ' *'}
                </label>
                <input
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required={!selectedClient}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="••••••••"
                  minLength={6}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="+1 (555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Internal)
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                  placeholder="Wedding shoot - June 2025"
                />
              </div>

              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="active"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                />
                <label htmlFor="active" className="text-sm font-medium text-gray-700">
                  Active (client can log in)
                </label>
              </div>

              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
                >
                  {selectedClient ? 'Update Client' : 'Create Client'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

