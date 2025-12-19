'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Space = Database['public']['Tables']['spaces']['Row'];

export default function DashboardPage() {
  const { user } = useAuth();
  const [spaces, setSpaces] = useState<Space[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSpaces();
    }
  }, [user]);

  const loadSpaces = async () => {
    const { data } = await supabase
      .from('spaces')
      .select('*')
      .order('created_at', { ascending: false });

    if (data) {
      setSpaces(data);
    }
    setLoading(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Your Documentation Spaces
          </h1>
          <Link
            href="/dashboard/new-space"
            className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            + New Space
          </Link>
        </div>

        {spaces.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              You haven't created any documentation spaces yet.
            </p>
            <Link
              href="/dashboard/new-space"
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              Create Your First Space
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {spaces.map((space) => (
              <Link
                key={space.id}
                href={`/dashboard/spaces/${space.slug}`}
                className="block p-6 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
              >
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                  {space.name}
                </h3>
                {space.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-4">
                    {space.description}
                  </p>
                )}
                <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                  <span
                    className={`px-2 py-1 rounded ${
                      space.is_public
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {space.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
