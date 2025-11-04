'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiEye, FiEyeOff } from 'react-icons/fi';
import Image from 'next/image';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  bio?: string;
  image: string;
  instagram?: string;
  facebook?: string;
  email?: string;
  order: number;
  visible: boolean;
}

export default function AdminTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Fetch team members
  const fetchTeam = async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/admin/team');
      if (res.ok) {
        const data = await res.json();
        setTeam(data);
      }
    } catch (error) {
      console.error('Error fetching team:', error);
    } finally {
      setLoading(false);
    }
  };

  // Create or update team member
  const saveMember = async (member: Partial<TeamMember>) => {
    try {
      const method = member.id ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/team', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
      });

      if (res.ok) {
        fetchTeam();
        setEditModalOpen(false);
        setSelectedMember(null);
        alert('✅ Team member saved!');
      } else {
        alert('❌ Failed to save team member');
      }
    } catch (error) {
      console.error('Error saving member:', error);
      alert('❌ Failed to save team member');
    }
  };

  // Delete team member
  const deleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    try {
      const res = await fetch(`/api/admin/team?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        fetchTeam();
        alert('✅ Team member removed');
      }
    } catch (error) {
      console.error('Error deleting member:', error);
    }
  };

  // Toggle visibility
  const toggleVisibility = async (member: TeamMember) => {
    await saveMember({ ...member, visible: !member.visible });
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Team Management</h1>
              <p className="text-sm text-gray-600 mt-1">
                {team.length} team members • {team.filter(m => m.visible).length} visible
              </p>
            </div>
            <button
              onClick={() => {
                setSelectedMember(null);
                setEditModalOpen(true);
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Team Member</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {team.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
            <FiPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              No Team Members Yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start building your team by adding your first member
            </p>
            <button
              onClick={() => setEditModalOpen(true)}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              <FiPlus className="w-5 h-5" />
              <span>Add First Team Member</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {team.map((member) => (
              <div
                key={member.id}
                className={`bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden group ${
                  !member.visible ? 'opacity-60' : ''
                }`}
              >
                {/* Image */}
                <div className="relative aspect-square">
                  <Image
                    src={member.image}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                  {!member.visible && (
                    <div className="absolute top-2 right-2 bg-gray-900 text-white px-2 py-1 rounded text-xs font-semibold">
                      Hidden
                    </div>
                  )}
                  
                  {/* Overlay Actions */}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center space-x-2">
                    <button
                      onClick={() => {
                        setSelectedMember(member);
                        setEditModalOpen(true);
                      }}
                      className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition"
                    >
                      <FiEdit2 className="w-5 h-5" />
                    </button>
                    <button
                      onClick={() => toggleVisibility(member)}
                      className="p-2 bg-white text-gray-900 rounded-lg hover:bg-gray-100 transition"
                    >
                      {member.visible ? (
                        <FiEyeOff className="w-5 h-5" />
                      ) : (
                        <FiEye className="w-5 h-5" />
                      )}
                    </button>
                    <button
                      onClick={() => deleteMember(member.id)}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
                    >
                      <FiTrash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>

                {/* Info */}
                <div className="p-4">
                  <h4 className="font-semibold text-gray-900 mb-1 truncate">
                    {member.name}
                  </h4>
                  <p className="text-sm text-primary-600 mb-2 truncate">
                    {member.role}
                  </p>
                  {member.bio && (
                    <p className="text-xs text-gray-600 line-clamp-2 mb-2">
                      {member.bio}
                    </p>
                  )}
                  {member.instagram && (
                    <p className="text-xs text-gray-500 truncate">
                      {member.instagram}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Edit/Add Modal */}
      {editModalOpen && (
        <EditMemberModal
          member={selectedMember}
          onClose={() => {
            setEditModalOpen(false);
            setSelectedMember(null);
          }}
          onSave={saveMember}
        />
      )}
    </div>
  );
}

function EditMemberModal({
  member,
  onClose,
  onSave,
}: {
  member: TeamMember | null;
  onClose: () => void;
  onSave: (member: Partial<TeamMember>) => void;
}) {
  const [formData, setFormData] = useState({
    name: member?.name || '',
    role: member?.role || '',
    bio: member?.bio || '',
    image: member?.image || '',
    instagram: member?.instagram || '',
    facebook: member?.facebook || '',
    email: member?.email || '',
    order: member?.order || 0,
    visible: member?.visible !== false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.role || !formData.image) {
      alert('Please fill in all required fields');
      return;
    }

    onSave({
      ...(member?.id && { id: member.id }),
      ...formData,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">
            {member ? 'Edit Team Member' : 'Add Team Member'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Preview */}
          {formData.image && (
            <div className="relative aspect-square w-48 mx-auto rounded-lg overflow-hidden">
              <Image
                src={formData.image}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Image URL */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Image URL *
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="url"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                required
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="https://res.cloudinary.com/..."
              />
              <a
                href="https://cloudinary.com/console/media_library"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center space-x-2"
              >
                <FiUpload className="w-4 h-4" />
                <span>Upload</span>
              </a>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="John Doe"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Role/Position *
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Lead Photographer"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="Brief description..."
            />
          </div>

          {/* Social Media */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Instagram Handle
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) =>
                  setFormData({ ...formData, instagram: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder="email@example.com"
              />
            </div>
          </div>

          {/* Visibility */}
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="visible"
              checked={formData.visible}
              onChange={(e) =>
                setFormData({ ...formData, visible: e.target.checked })
              }
              className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
            />
            <label htmlFor="visible" className="text-sm font-medium text-gray-700">
              Show on website
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition"
            >
              {member ? 'Update' : 'Add'} Team Member
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
