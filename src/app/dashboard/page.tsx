'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { postsAPI, filesAPI, healthAPI } from '@/lib/api';
import { FileText, Upload, Activity, User } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const { data: posts } = useQuery({
    queryKey: ['my-posts'],
    queryFn: () => postsAPI.getMyPosts(),
  });

  const { data: files } = useQuery({
    queryKey: ['my-files'],
    queryFn: () => filesAPI.listFiles(),
  });

  const { data: health } = useQuery({
    queryKey: ['health'],
    queryFn: () => healthAPI.basic(),
  });

  const stats = [
    {
      name: 'My Posts',
      value: posts?.data?.length || 0,
      icon: FileText,
      color: 'bg-blue-500',
    },
    {
      name: 'My Files',
      value: files?.data?.length || 0,
      icon: Upload,
      color: 'bg-green-500',
    },
    {
      name: 'System Status',
      value: health?.data?.status === 'ok' ? 'Healthy' : 'Error',
      icon: Activity,
      color: health?.data?.status === 'ok' ? 'bg-green-500' : 'bg-red-500',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white overflow-hidden shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <User className="h-8 w-8 text-gray-400" />
            </div>
            <div className="ml-5 w-0 flex-1">
              <dl>
                <dt className="text-sm font-medium text-gray-500 truncate">
                  Welcome back
                </dt>
                <dd className="text-lg font-medium text-gray-900">
                  {user?.name || user?.email}
                </dd>
                <dd className="text-sm text-gray-500">
                  Role: {user?.role} • Joined: {new Date(user?.createdAt || '').toLocaleDateString()}
                </dd>
              </dl>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`${stat.color} rounded-md p-3`}>
                    <stat.icon className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500 truncate">
                      {stat.name}
                    </dt>
                    <dd className="text-lg font-medium text-gray-900">
                      {stat.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Posts */}
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Posts
          </h3>
          <p className="mt-1 max-w-2xl text-sm text-gray-500">
            Your latest posts and activities
          </p>
        </div>
        <div className="border-t border-gray-200">
          {posts?.data?.length > 0 ? (
            <ul className="divide-y divide-gray-200">
              {posts.data.slice(0, 5).map((post: any) => (
                <li key={post.id} className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <FileText className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {post.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {post.published ? 'Published' : 'Draft'} • {new Date(post.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        post.published 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {post.published ? 'Published' : 'Draft'}
                      </span>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-4 py-12 text-center">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No posts</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first post.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;