'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';

type Page = Database['public']['Tables']['pages']['Row'];

export default function DocsPageView() {
  const params = useParams();
  const slug = params.slug as string;
  const pageSlug = params.pageSlug as string;
  const [page, setPage] = useState<Page | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPage();
  }, [slug, pageSlug]);

  const loadPage = async () => {
    const { data: spaceData } = await supabase
      .from('spaces')
      .select('id')
      .eq('slug', slug)
      .eq('is_public', true)
      .maybeSingle();

    if (spaceData) {
      const { data: pageData } = await supabase
        .from('pages')
        .select('*')
        .eq('space_id', spaceData.id)
        .eq('slug', pageSlug)
        .eq('is_published', true)
        .maybeSingle();

      setPage(pageData);
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse">Loading...</div>
      </div>
    );
  }

  if (!page) {
    return (
      <div className="text-center py-12">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Page Not Found
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          This page does not exist or has not been published.
        </p>
      </div>
    );
  }

  return (
    <article className="max-w-4xl">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">
        {page.title}
      </h1>
      <div className="prose dark:prose-invert prose-lg max-w-none">
        <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
          {page.content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
