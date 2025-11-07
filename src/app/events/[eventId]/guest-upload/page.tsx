'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { FiUpload, FiHeart, FiX } from 'react-icons/fi';
import Image from 'next/image';

export default function GuestUploadPage() {
  const params = useParams();
  const router = useRouter();
  const [uploaderName, setUploaderName] = useState('');
  const [message, setMessage] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    
    if (selectedFiles.length + files.length > 10) {
      setError('Maximum 10 photos allowed');
      return;
    }
    
    const newFiles = [...files, ...selectedFiles];
    setFiles(newFiles);
    
    // Generate previews
    const newPreviews = selectedFiles.map(file => URL.createObjectURL(file));
    setPreviews([...previews, ...newPreviews]);
    setError('');
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previews.filter((_, i) => i !== index);
    setFiles(newFiles);
    setPreviews(newPreviews);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Validation
    if (!uploaderName.trim()) {
      setError('Please enter your name');
      return;
    }

    if (!message.trim()) {
      setError('Please write a message');
      return;
    }

    if (message.length > 200) {
      setError('Message must be 200 characters or less');
      return;
    }

    if (files.length === 0) {
      setError('Please select at least one photo');
      return;
    }

    setUploading(true);

    try {
      // Start upload session
      const startRes = await fetch(`/api/events/${params.eventId}/guest-upload/start`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uploaderName, message }),
      });

      if (!startRes.ok) {
        const data = await startRes.json();
        throw new Error(data.error || 'Failed to start upload session');
      }

      const { uploadGroupId } = await startRes.json();

      // Upload photos
      const formData = new FormData();
      formData.append('uploadGroupId', uploadGroupId);
      formData.append('uploaderName', uploaderName);
      formData.append('message', message);
      files.forEach(file => formData.append('files', file));

      const uploadRes = await fetch(`/api/events/${params.eventId}/guest-upload/upload`, {
        method: 'POST',
        body: formData,
      });

      if (!uploadRes.ok) {
        const data = await uploadRes.json();
        throw new Error(data.error || 'Failed to upload photos');
      }

      // Redirect to selection page
      router.push(`/events/${params.eventId}/guest-upload/select?groupId=${uploadGroupId}`);

    } catch (err: any) {
      setError(err.message);
      setUploading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900 p-4">
      <div className="max-w-2xl mx-auto pt-8 sm:pt-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 sm:p-8"
        >
          {/* Header */}
          <div className="text-center mb-6 sm:mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring' }}
            >
              <FiHeart className="w-12 h-12 sm:w-16 sm:h-16 mx-auto text-pink-500 mb-4" />
            </motion.div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Share Your Wedding Memories! ❤️
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400">
              Upload your favorite photos and leave a heartfelt message for the newlyweds
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
            {/* Name Input */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Name *
              </label>
              <input
                type="text"
                value={uploaderName}
                onChange={(e) => setUploaderName(e.target.value)}
                placeholder="Enter your name"
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white transition-all"
                required
                disabled={uploading}
              />
            </div>

            {/* Message Textarea */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Message for the Newlyweds * <span className="text-xs text-gray-500">({message.length}/200)</span>
              </label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your heartfelt message here..."
                maxLength={200}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white resize-none transition-all"
                required
                disabled={uploading}
              />
            </div>

            {/* File Upload */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Upload Photos * <span className="text-xs text-gray-500">(1-10 photos, max 10MB each)</span>
              </label>
              
              {files.length < 10 && (
                <label className="flex flex-col items-center justify-center w-full h-40 sm:h-48 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:border-pink-500 dark:hover:border-pink-500 transition-all bg-gray-50 dark:bg-gray-700/50 group">
                  <FiUpload className="w-10 h-10 sm:w-12 sm:h-12 text-gray-400 group-hover:text-pink-500 transition-colors mb-2" />
                  <span className="text-sm text-gray-600 dark:text-gray-400 text-center px-4">
                    Click to upload or drag and drop
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                    JPG, PNG, WEBP up to 10MB each
                  </span>
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                </label>
              )}

              {/* File Previews */}
              {files.length > 0 && (
                <div className="mt-4 grid grid-cols-3 sm:grid-cols-5 gap-2">
                  {previews.map((preview, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="relative aspect-square rounded-lg overflow-hidden border-2 border-pink-500 group"
                    >
                      <Image
                        src={preview}
                        alt={`Preview ${idx + 1}`}
                        fill
                        className="object-cover"
                      />
                      {!uploading && (
                        <button
                          type="button"
                          onClick={() => removeFile(idx)}
                          className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition-colors opacity-0 group-hover:opacity-100"
                        >
                          <FiX />
                        </button>
                      )}
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200 text-sm"
              >
                {error}
              </motion.div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={uploading || files.length === 0}
              className="w-full py-4 bg-gradient-to-r from-pink-500 to-purple-500 text-white font-semibold rounded-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-[1.02] active:scale-[0.98]"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Uploading...
                </span>
              ) : (
                'Upload & Continue'
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
