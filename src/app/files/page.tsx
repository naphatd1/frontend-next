'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { filesAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, File, Image, Trash2, Download, Eye, Plus } from 'lucide-react';
import toast from 'react-hot-toast';

const FilesPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [uploadType, setUploadType] = useState<'images' | 'documents'>('images');
  const [uploading, setUploading] = useState(false);

  // Helper function to get auth token
  const getAuthToken = () => {
    if (typeof document !== 'undefined') {
      return document.cookie.split('access_token=')[1]?.split(';')[0] || '';
    }
    return '';
  };

  const { data: images, isLoading: imagesLoading } = useQuery({
    queryKey: ['my-images'],
    queryFn: async () => {
      try {
        // Use simple fetch instead of axios to avoid API errors
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/upload/images/my-images`, {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return { data: data || [] };
      } catch (error) {
        console.error('Images API error:', error);
        return { data: [] };
      }
    },
  });

  const { data: documents, isLoading: documentsLoading } = useQuery({
    queryKey: ['my-documents'],
    queryFn: async () => {
      try {
        // Use simple fetch instead of axios to avoid API errors
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/upload/documents/my-documents`, {
          headers: {
            'Authorization': `Bearer ${getAuthToken()}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        
        const data = await response.json();
        return { data: data || [] };
      } catch (error) {
        console.error('Documents API error:', error);
        return { data: [] };
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async ({ id, type }: { id: string; type: 'images' | 'documents' }) => {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}/upload/${type}/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-images'] });
      queryClient.invalidateQueries({ queryKey: ['my-documents'] });
      toast.success('File deleted successfully');
      setDeleteId(null);
    },
    onError: (error: any) => {
      console.error('Delete error:', error);
      toast.error(error.message || 'Failed to delete file');
    },
  });

  const handleDelete = (id: string, type: 'images' | 'documents') => {
    deleteMutation.mutate({ id, type });
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const endpoint = uploadType === 'images' 
        ? '/upload/images/single' 
        : '/upload/documents/single';
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api'}${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${getAuthToken()}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      queryClient.invalidateQueries({ queryKey: ['my-images'] });
      queryClient.invalidateQueries({ queryKey: ['my-documents'] });
      toast.success(`${uploadType === 'images' ? 'Image' : 'Document'} uploaded successfully`);
    } catch (error: any) {
      console.error('Upload error:', error);
      toast.error(error.message || 'Failed to upload file');
    } finally {
      setUploading(false);
    }

    // Reset input
    event.target.value = '';
  };

  const getFileIcon = (filename: string) => {
    const extension = filename.split('.').pop()?.toLowerCase();
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <Image className="h-5 w-5" />;
    }
    return <File className="h-5 w-5" />;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const isLoading = imagesLoading || documentsLoading;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  const allFiles = [
    ...(images?.data || []).map((file: any) => ({ ...file, type: 'images' })),
    ...(documents?.data || []).map((file: any) => ({ ...file, type: 'documents' }))
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">My Files</h1>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">Upload and manage your files</p>
        </div>
        <div className="flex items-center space-x-4">
          <select
            value={uploadType}
            onChange={(e) => setUploadType(e.target.value as 'images' | 'documents')}
            className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-white transition-colors duration-200"
          >
            <option value="images">Images</option>
            <option value="documents">Documents</option>
          </select>
          <label className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 cursor-pointer transition-colors duration-200">
            <Upload className="h-4 w-4 mr-2" />
            Upload {uploadType === 'images' ? 'Image' : 'Document'}
            <input
              type="file"
              className="hidden"
              onChange={handleFileUpload}
              accept={uploadType === 'images' ? 'image/*' : '.pdf,.doc,.docx,.txt'}
            />
          </label>
        </div>
      </div>

      {/* Files Grid */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md transition-colors duration-200">
        {allFiles.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {allFiles.map((file: any) => (
              <li key={file.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <div className="text-gray-400 dark:text-gray-500">
                          {getFileIcon(file.filename)}
                        </div>
                      </div>
                      <div className="ml-4 min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate transition-colors duration-200">
                            {file.originalName || file.filename}
                          </h3>
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                          <span>{formatFileSize(file.size)}</span>
                          <span>•</span>
                          <span>{file.mimetype}</span>
                          <span>•</span>
                          <span>
                            Uploaded {new Date(file.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        file.type === 'images' 
                          ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400' 
                          : 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400'
                      } transition-colors duration-200`}>
                        {file.type === 'images' ? 'Image' : 'Document'}
                      </span>
                      <div className="flex items-center space-x-1">
                        {file.type === 'images' && (
                          <button
                            onClick={() => window.open(file.url, '_blank')}
                            className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 p-1 transition-colors duration-200"
                            title="View image"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                        )}
                        <a
                          href={file.url}
                          download={file.originalName || file.filename}
                          className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 p-1 transition-colors duration-200"
                          title="Download file"
                        >
                          <Download className="h-4 w-4" />
                        </a>
                        <button
                          onClick={() => setDeleteId(file.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 transition-colors duration-200"
                          title="Delete file"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="text-center py-12">
            <Upload className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">No files</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
              Get started by uploading your first file.
            </p>
            <div className="mt-6">
              <label className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 cursor-pointer transition-colors duration-200">
                <Upload className="h-4 w-4 mr-2" />
                Upload File
                <input
                  type="file"
                  className="hidden"
                  onChange={handleFileUpload}
                  accept="image/*,.pdf,.doc,.docx,.txt"
                />
              </label>
            </div>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-gray-600 dark:bg-gray-900 bg-opacity-50 dark:bg-opacity-75 overflow-y-auto h-full w-full z-50 transition-colors duration-200">
          <div className="relative top-20 mx-auto p-5 border border-gray-200 dark:border-gray-700 w-96 shadow-lg rounded-md bg-white dark:bg-gray-800 transition-colors duration-200">
            <div className="mt-3 text-center">
              <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/30">
                <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4 transition-colors duration-200">Delete File</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                  Are you sure you want to delete this file? This action cannot be undone.
                </p>
              </div>
              <div className="flex justify-center space-x-4 mt-4">
                <button
                  onClick={() => setDeleteId(null)}
                  className="px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 text-sm font-medium rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-500 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    const file = allFiles.find(f => f.id === deleteId);
                    if (file) {
                      handleDelete(deleteId, file.type);
                    }
                  }}
                  disabled={deleteMutation.isPending}
                  className="px-4 py-2 bg-red-600 dark:bg-red-500 text-white text-sm font-medium rounded-md hover:bg-red-700 dark:hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 disabled:opacity-50 transition-colors duration-200"
                >
                  {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FilesPage;