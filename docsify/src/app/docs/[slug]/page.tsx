'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Space = Database['public']['Tables']['spaces']['Row'];
type Page = Database['public']['Tables']['pages']['Row'];

export default function DocsHomePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [space, setSpace] = useState<Space | null>(null);
  const [firstPage, setFirstPage] = useState<Page | null>(null);

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
        .order('order_index', { ascending: true })
        .limit(1);

      if (pagesData && pagesData.length > 0) {
        setFirstPage(pagesData[0]);
        router.push(`/docs/${slug}/${pagesData[0].slug}`);
      }
    }
  };

  if (!space) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Documentation Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This documentation space does not exist or is not public.
        </p>
      </div>
    );
  }

  if (!firstPage) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          {space.name}
        </h1>
        {space.description && (
          <p className="text-gray-600 dark:text-gray-400 mb-8">
            {space.description}
          </p>
        )}
        <p className="text-gray-500 dark:text-gray-500">
          No pages have been published yet.
        </p>
      </div>
    );
  }

  return (
    <div className="text-center py-12">
      <div className="animate-pulse">Loading...</div>
    </div>
  );
}
