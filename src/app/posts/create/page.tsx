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
  title: yup.string().required('Title is required'),
  content: yup.string(),
  published: yup.boolean(),
});

type FormData = yup.InferType<typeof schema>;

const CreatePostPage: React.FC = () => {
  const router = useRouter();
  const [preview, setPreview] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: yupResolver(schema),
    defaultValues: {
      published: false,
    },
  });

  const watchedValues = watch();

  const createMutation = useMutation({
    mutationFn: (data: FormData) => postsAPI.create(data),
    onSuccess: () => {
      toast.success('Post created successfully');
      router.push('/posts');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create post');
    },
  });

  const onSubmit = (data: FormData) => {
    createMutation.mutate(data);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            href="/posts"
            className="inline-flex items-center text-sm text-gray-500 hover:text-gray-700"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Posts
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Create New Post</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button
            type="button"
            onClick={() => setPreview(!preview)}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
          >
            <Eye className="h-4 w-4 mr-1" />
            {preview ? 'Edit' : 'Preview'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className={`${preview ? 'hidden lg:block' : ''}`}>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            <div className="bg-white shadow rounded-lg p-6">
              <div className="space-y-4">
                <div>
                  <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                    Title
                  </label>
                  <input
                    {...register('title')}
                    type="text"
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Enter post title..."
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="content" className="block text-sm font-medium text-gray-700">
                    Content
                  </label>
                  <textarea
                    {...register('content')}
                    rows={12}
                    className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
                    placeholder="Write your post content here..."
                  />
                  {errors.content && (
                    <p className="mt-1 text-sm text-red-600">{errors.content.message}</p>
                  )}
                </div>

                <div className="flex items-center">
                  <input
                    {...register('published')}
                    type="checkbox"
                    className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                  />
                  <label htmlFor="published" className="ml-2 block text-sm text-gray-900">
                    Publish immediately
                  </label>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <Link
                href="/posts"
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={createMutation.isPending}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {createMutation.isPending ? 'Creating...' : 'Create Post'}
              </button>
            </div>
          </form>
        </div>

        {/* Preview */}
        <div className={`${!preview ? 'hidden lg:block' : ''}`}>
          <div className="bg-white shadow rounded-lg p-6">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-lg font-medium text-gray-900">Preview</h2>
            </div>
            
            <article className="prose max-w-none">
              <h1 className="text-2xl font-bold text-gray-900 mb-4">
                {watchedValues.title || 'Untitled Post'}
              </h1>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500 mb-6">
                <span>
                  Status: {watchedValues.published ? 'Published' : 'Draft'}
                </span>
                <span>•</span>
                <span>
                  {new Date().toLocaleDateString()}
                </span>
              </div>

              <div className="text-gray-700 whitespace-pre-wrap">
                {watchedValues.content || 'No content yet...'}
              </div>
            </article>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreatePostPage;