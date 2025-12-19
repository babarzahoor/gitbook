'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Space = Database['public']['Tables']['spaces']['Row'];
type Page = Database['public']['Tables']['pages']['Row'];

export default function SpacePage() {
  const params = useParams();
  const slug = params.slug as string;
  const [space, setSpace] = useState<Space | null>(null);
  const [pages, setPages] = useState<Page[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSpace();
  }, [slug]);

  const loadSpace = async () => {
    const { data: spaceData } = await supabase
      .from('spaces')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (spaceData) {
      setSpace(spaceData);

      const { data: pagesData } = await supabase
        .from('pages')
        .select('*')
        .eq('space_id', spaceData.id)
        .order('order_index', { ascending: true });

      if (pagesData) {
        setPages(pagesData);
      }
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

  if (!space) {
    return (
      <div className="p-8">
        <div className="text-center">Space not found</div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {space.name}
          </h1>
          {space.description && (
            <p className="text-gray-600 dark:text-gray-400">
              {space.description}
            </p>
          )}
          <div className="mt-4 flex items-center gap-4">
            <Link
              href={`/docs/${space.slug}`}
              target="_blank"
              className="text-sm text-primary-600 dark:text-primary-400 hover:underline"
            >
              View Public Site
            </Link>
            <Link
              href={`/dashboard/spaces/${space.slug}/new`}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm"
            >
              + New Page
            </Link>
          </div>
        </div>

        {pages.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <p className="text-gray-600 dark:text-gray-400 mb-4">
              No pages yet. Create your first page to get started.
            </p>
            <Link
              href={`/dashboard/spaces/${space.slug}/new`}
              className="inline-block px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              Create First Page
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {pages.map((page) => (
              <Link
                key={page.id}
                href={`/dashboard/spaces/${space.slug}/pages/${page.slug}`}
                className="block p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-500 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                    {page.title}
                  </h3>
                  <span
                    className={`px-2 py-1 text-xs rounded ${
                      page.is_published
                        ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300'
                    }`}
                  >
                    {page.is_published ? 'Published' : 'Draft'}
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
