'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Space = Database['public']['Tables']['spaces']['Row'];
type Page = Database['public']['Tables']['pages']['Row'];

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const slug = params.slug as string;
  const [space, setSpace] = useState<Space | null>(null);
  const [pages, setPages] = useState<Page[]>([]);

  useEffect(() => {
    loadSpace();
  }, [slug]);

  const loadSpace = async () => {
    const { data: spaceData } = await supabase
      .from('spaces')
      .select('*')
      .eq('slug', slug)
      .eq('is_public', true)
      .maybeSingle();

    if (spaceData) {
      setSpace(spaceData);

      const { data: pagesData } = await supabase
        .from('pages')
        .select('*')
        .eq('space_id', spaceData.id)
        .eq('is_published', true)
        .order('order_index', { ascending: true });

      if (pagesData) {
        setPages(pagesData);
      }
    }
  };

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      <header className="sticky top-0 z-10 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link
              href={`/docs/${slug}`}
              className="text-xl font-bold text-gray-900 dark:text-white"
            >
              {space?.name || 'Documentation'}
            </Link>
            <Link
              href="/"
              className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Powered by Docsify
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <aside className="w-64 flex-shrink-0">
            <nav className="sticky top-24 space-y-1">
              {pages.map((page) => (
                <Link
                  key={page.id}
                  href={`/docs/${slug}/${page.slug}`}
                  className="block px-3 py-2 rounded-lg text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  {page.title}
                </Link>
              ))}
            </nav>
          </aside>

          <main className="flex-1 min-w-0">{children}</main>
        </div>
      </div>
    </div>
  );
}
