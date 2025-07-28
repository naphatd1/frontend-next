'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsAPI } from '@/lib/api';
import { useAuth } from '@/contexts/AuthContext';
import { FileText, Plus, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';

const PostsPage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data: posts, isLoading, error } = useQuery({
    queryKey: ['my-posts'],
    queryFn: async () => {
      try {
        const response = await postsAPI.getMyPosts();
        return response;
      } catch (error: any) {
        console.error('Posts API error:', error);
        // Return empty data if API fails
        return { data: [] };
      }
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => postsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-posts'] });
      toast.success('Post deleted successfully');
      setDeleteId(null);
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete post');
    },
  });

  const handleDelete = (id: string) => {
    deleteMutation.mutate(id);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 dark:border-primary-400"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white transition-colors duration-200">My Posts</h1>
          <p className="text-gray-600 dark:text-gray-300 transition-colors duration-200">Manage your posts and content</p>
        </div>
        <Link
          href="/posts/create"
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-900 transition-colors duration-200"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Post
        </Link>
      </div>

      {/* Posts List */}
      <div className="bg-white dark:bg-gray-800 shadow overflow-hidden sm:rounded-md transition-colors duration-200">
        {posts?.data?.length > 0 ? (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {posts.data.map((post: any) => (
              <li key={post.id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="h-5 w-5 text-gray-400 dark:text-gray-500" />
                      </div>
                      <div className="ml-4 min-w-0 flex-1">
                        <div className="flex items-center space-x-2">
                          <h3 className="text-sm font-medium text-gray-900 dark:text-white truncate transition-colors duration-200">
                            {post.title}
                          </h3>
                          <div className="flex items-center">
                            {post.published ? (
                              <Eye className="h-4 w-4 text-green-500 dark:text-green-400" />
                            ) : (
                              <EyeOff className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            )}
                          </div>
                        </div>
                        <div className="mt-1 flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                          <span>
                            {post.published ? 'Published' : 'Draft'}
                          </span>
                          <span>•</span>
                          <span>
                            Created {new Date(post.createdAt).toLocaleDateString()}
                          </span>
                          {post.content && (
                            <>
                              <span>•</span>
                              <span>
                                {post.content.length > 100 
                                  ? `${post.content.substring(0, 100)}...` 
                                  : post.content}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        post.published 
                          ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400' 
                          : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-400'
                      } transition-colors duration-200`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                      <div className="flex items-center space-x-1">
                        <Link
                          href={`/posts/${post.id}/edit`}
                          className="text-primary-600 dark:text-primary-400 hover:text-primary-900 dark:hover:text-primary-300 p-1 transition-colors duration-200"
                        >
                          <Edit className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => setDeleteId(post.id)}
                          className="text-red-600 dark:text-red-400 hover:text-red-900 dark:hover:text-red-300 p-1 transition-colors duration-200"
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
            <FileText className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" />
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white transition-colors duration-200">No posts</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
              Get started by creating your first post.
            </p>
            <div className="mt-6">
              <Link
                href="/posts/create"
                className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
              >
                <Plus className="h-4 w-4 mr-2" />
                Create Post
              </Link>
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
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mt-4 transition-colors duration-200">Delete Post</h3>
              <div className="mt-2 px-7 py-3">
                <p className="text-sm text-gray-500 dark:text-gray-400 transition-colors duration-200">
                  Are you sure you want to delete this post? This action cannot be undone.
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
                  onClick={() => handleDelete(deleteId)}
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

export default PostsPage;