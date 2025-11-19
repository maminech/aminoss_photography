'use client';

import { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiX, FiUpload, FiEye, FiEyeOff, FiSearch, FiMove } from 'react-icons/fi';
import Image from 'next/image';
import { toast } from 'react-hot-toast';

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

// Cloudinary widget declaration
declare global {
  interface Window {
    cloudinary: any;
  }
}

export default function AdminTeamPage() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [draggedItem, setDraggedItem] = useState<TeamMember | null>(null);

  // Filter team members by search
  const filteredTeam = team.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.role.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
    const loadingToast = toast.loading(member.id ? 'Updating team member...' : 'Adding team member...');
    
    try {
      const method = member.id ? 'PUT' : 'POST';
      const res = await fetch('/api/admin/team', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(member),
      });

      if (res.ok) {
        await fetchTeam();
        setEditModalOpen(false);
        setSelectedMember(null);
        toast.success(member.id ? '✅ Team member updated!' : '✅ Team member added!', { id: loadingToast });
      } else {
        const error = await res.json();
        toast.error(error.error || '❌ Failed to save team member', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error saving member:', error);
      toast.error('❌ Failed to save team member', { id: loadingToast });
    }
  };

  // Delete team member
  const deleteMember = async (id: string) => {
    if (!confirm('Are you sure you want to remove this team member?')) return;

    const loadingToast = toast.loading('Deleting team member...');
    
    try {
      const res = await fetch(`/api/admin/team?id=${id}`, {
        method: 'DELETE',
      });

      if (res.ok) {
        await fetchTeam();
        toast.success('✅ Team member removed', { id: loadingToast });
      } else {
        toast.error('❌ Failed to delete team member', { id: loadingToast });
      }
    } catch (error) {
      console.error('Error deleting member:', error);
      toast.error('❌ Failed to delete team member', { id: loadingToast });
    }
  };

  // Toggle visibility
  const toggleVisibility = async (member: TeamMember) => {
    await saveMember({ ...member, visible: !member.visible });
  };

  // Drag and drop reordering
  const handleDragStart = (member: TeamMember) => {
    setDraggedItem(member);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (targetMember: TeamMember) => {
    if (!draggedItem || draggedItem.id === targetMember.id) return;

    const updatedTeam = [...team];
    const draggedIndex = updatedTeam.findIndex(m => m.id === draggedItem.id);
    const targetIndex = updatedTeam.findIndex(m => m.id === targetMember.id);

    // Swap order values
    const tempOrder = updatedTeam[draggedIndex].order;
    updatedTeam[draggedIndex].order = updatedTeam[targetIndex].order;
    updatedTeam[targetIndex].order = tempOrder;

    // Sort by new order
    updatedTeam.sort((a, b) => a.order - b.order);
    setTeam(updatedTeam);
    setDraggedItem(null);

    // Update both members in database
    try {
      await Promise.all([
        fetch('/api/admin/team', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: draggedItem.id, order: updatedTeam[targetIndex].order }),
        }),
        fetch('/api/admin/team', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: targetMember.id, order: updatedTeam[draggedIndex].order }),
        }),
      ]);
      toast.success('✅ Order updated');
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error('❌ Failed to update order');
      fetchTeam(); // Reload on error
    }
  };

  useEffect(() => {
    fetchTeam();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-dark-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-dark-900">
      {/* Header */}
      <header className="bg-white dark:bg-dark-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-30">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Team Management</h1>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
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

          {/* Search Bar */}
          {team.length > 0 && (
            <div className="mt-4 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search team members..."
                className="w-full pl-10 pr-4 py-2 bg-gray-50 dark:bg-dark-700 border border-gray-200 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              />
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {team.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FiPlus className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Team Members Yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
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
        ) : filteredTeam.length === 0 ? (
          <div className="bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-12 text-center">
            <FiSearch className="w-16 h-16 text-gray-400 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">
              No Results Found
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Try adjusting your search query
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 flex items-center">
              <FiMove className="w-4 h-4 mr-2" />
              Drag and drop to reorder team members
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredTeam.map((member) => (
                <div
                  key={member.id}
                  draggable
                  onDragStart={() => handleDragStart(member)}
                  onDragOver={handleDragOver}
                  onDrop={() => handleDrop(member)}
                  className={`bg-white dark:bg-dark-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden group cursor-move hover:shadow-md transition ${
                    !member.visible ? 'opacity-60' : ''
                  } ${draggedItem?.id === member.id ? 'opacity-50' : ''}`}
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
                        className="p-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition"
                      >
                        <FiEdit2 className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => toggleVisibility(member)}
                        className="p-2 bg-white dark:bg-dark-700 text-gray-900 dark:text-gray-100 rounded-lg hover:bg-gray-100 dark:hover:bg-dark-600 transition"
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
                    <h4 className="font-semibold text-gray-900 dark:text-gray-100 mb-1 truncate">
                      {member.name}
                    </h4>
                    <p className="text-sm text-primary mb-2 truncate">
                      {member.role}
                    </p>
                    {member.bio && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                        {member.bio}
                      </p>
                    )}
                    {(member.instagram || member.email) && (
                      <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-500">
                        {member.instagram && (
                          <span className="truncate">{member.instagram}</span>
                        )}
                        {member.instagram && member.email && <span>•</span>}
                        {member.email && (
                          <span className="truncate">{member.email}</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
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
  const [uploading, setUploading] = useState(false);

  // Cloudinary upload widget
  const openUploadWidget = () => {
    if (typeof window === 'undefined' || !window.cloudinary) {
      toast.error('Cloudinary not loaded');
      return;
    }

    setUploading(true);
    
    const widget = window.cloudinary.createUploadWidget(
      {
        cloudName: 'dm22wlmpx',
        uploadPreset: 'ml_default',
        sources: ['local', 'url', 'camera'],
        multiple: false,
        resourceType: 'image',
        clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp'],
        maxImageFileSize: 10000000, // 10MB
        maxImageWidth: 2000,
        maxImageHeight: 2000,
      },
      (error: any, result: any) => {
        setUploading(false);
        
        if (error) {
          console.error('Upload error:', error);
          toast.error('Upload failed');
          return;
        }

        if (result.event === 'success') {
          const imageUrl = result.info.secure_url;
          setFormData({ ...formData, image: imageUrl });
          toast.success('✅ Image uploaded!');
        }
      }
    );

    widget.open();
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.role || !formData.image) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Validate image URL
    if (!formData.image.startsWith('http')) {
      toast.error('Please provide a valid image URL');
      return;
    }

    onSave({
      ...(member?.id && { id: member.id }),
      ...formData,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-dark-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700 sticky top-0 bg-white dark:bg-dark-800 z-10">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
            {member ? 'Edit Team Member' : 'Add Team Member'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition"
          >
            <FiX className="w-6 h-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Preview */}
          {formData.image && (
            <div className="relative aspect-square w-48 mx-auto rounded-lg overflow-hidden border-2 border-gray-200 dark:border-gray-700">
              <Image
                src={formData.image}
                alt="Preview"
                fill
                className="object-cover"
              />
            </div>
          )}

          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Profile Image *
            </label>
            <div className="flex items-center space-x-3">
              <input
                type="url"
                value={formData.image}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                required
                className="flex-1 px-4 py-2 bg-white dark:bg-dark-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="https://res.cloudinary.com/..."
              />
              <button
                type="button"
                onClick={openUploadWidget}
                disabled={uploading}
                className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiUpload className="w-4 h-4" />
                <span>{uploading ? 'Uploading...' : 'Upload'}</span>
              </button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Upload an image or paste a Cloudinary URL
            </p>
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              required
              className="w-full px-4 py-2 bg-white dark:bg-dark-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="John Doe"
            />
          </div>

          {/* Role */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Role/Position *
            </label>
            <input
              type="text"
              value={formData.role}
              onChange={(e) =>
                setFormData({ ...formData, role: e.target.value })
              }
              required
              className="w-full px-4 py-2 bg-white dark:bg-dark-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Lead Photographer"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Bio
            </label>
            <textarea
              value={formData.bio}
              onChange={(e) =>
                setFormData({ ...formData, bio: e.target.value })
              }
              rows={3}
              className="w-full px-4 py-2 bg-white dark:bg-dark-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Brief description..."
            />
          </div>

          {/* Social Media */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Instagram Handle
              </label>
              <input
                type="text"
                value={formData.instagram}
                onChange={(e) =>
                  setFormData({ ...formData, instagram: e.target.value })
                }
                className="w-full px-4 py-2 bg-white dark:bg-dark-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-4 py-2 bg-white dark:bg-dark-700 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
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
              className="w-4 h-4 text-primary border-gray-300 dark:border-gray-600 rounded focus:ring-primary"
            />
            <label htmlFor="visible" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Show on website
            </label>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-700 transition"
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
