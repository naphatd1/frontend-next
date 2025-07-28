'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useMutation } from '@tanstack/react-query';
import { postsAPI } from '@/lib/api';
import { ArrowLeft, Save, Eye } from 'lucide-react';
import toast from 'react-hot-toast';
import Link from 'next/link';

const schema = yup.object({
  title: yup
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title is too long')
    .required('Title is required'),
  content: yup
    .string()
    .max(10000, 'Content is too long')
    .optional(),
});

type FormData = yup.InferType<typeof schema>;

const CreatePostPage: React.FC = () => {
  const router = useRouter();
  const [published, setPublished] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({
    resolver: yupResolver(schema),
  });

  const createMutation = useMutation({
    mutationFn: (data: FormData & { published: boolean }) => 
      postsAPI.create(data),
    onSuccess: () => {
      toast.success('Post created successfully!');
      router.push('/posts');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create post');
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate({ ...data, published });
  };

  const watchedContent = watch('content', '');

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/posts"
            className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 transition-colors duration-200"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Posts
          </Link>
        </div>
        <div className="flex items-center space-x-3">
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => setPublished(e.target.checked)}
              className="rounded border-gray-300 dark:border-gray-600 text-primary-600 focus:ring-primary-500 dark:bg-gray-700"
            />
            <span className="ml-2 text-sm text-gray-700 dark:text-gray-300">
              Publish immediately
            </span>
          </label>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow rounded-lg transition-colors duration-200">
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Title
            </label>
            <input
              {...register('title')}
              type="text"
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              placeholder="Enter post title..."
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.title.message}</p>
            )}
          </div>

          {/* Content */}
          <div>
            <label htmlFor="content" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Content
            </label>
            <textarea
              {...register('content')}
              rows={12}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-primary-500 focus:border-primary-500 transition-colors duration-200"
              placeholder="Write your post content here..."
            />
            {errors.content && (
              <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.content.message}</p>
            )}
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {watchedContent.length}/10000 characters
            </p>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Link
              href="/posts"
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 transition-colors duration-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={createMutation.isPending}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-gray-800 disabled:opacity-50 transition-colors duration-200"
            >
              {createMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  {published ? 'Publish Post' : 'Save Draft'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreatePostPage;