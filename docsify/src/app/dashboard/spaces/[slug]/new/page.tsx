'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import MarkdownEditor from '@/components/MarkdownEditor';

type Space = Database['public']['Tables']['spaces']['Row'];

export default function NewPagePage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [space, setSpace] = useState<Space | null>(null);
  const [title, setTitle] = useState('');
  const [pageSlug, setPageSlug] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadSpace();
  }, [slug]);

  const loadSpace = async () => {
    const { data } = await supabase
      .from('spaces')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (data) {
      setSpace(data);
    }
  };

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  };

  const handleTitleChange = (value: string) => {
    setTitle(value);
    if (!pageSlug || pageSlug === generateSlug(title)) {
      setPageSlug(generateSlug(value));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !space) return;

    setError('');
    setLoading(true);

    try {
      const { data, error } = await supabase
        .from('pages')
        .insert({
          space_id: space.id,
          title,
          slug: pageSlug,
          content,
          is_published: isPublished,
          created_by: user.id,
        })
        .select()
        .maybeSingle();

      if (error) throw error;

      if (data) {
        router.push(`/dashboard/spaces/${slug}/pages/${data.slug}`);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!space) {
    return (
      <div className="p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            New Page in {space.name}
          </h1>

          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <label
                htmlFor="title"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                Page Title
              </label>
              <input
                id="title"
                type="text"
                required
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Getting Started"
              />
            </div>

            <div>
              <label
                htmlFor="slug"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                URL Slug
              </label>
              <input
                id="slug"
                type="text"
                required
                value={pageSlug}
                onChange={(e) => setPageSlug(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="getting-started"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="isPublished"
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
              />
              <label
                htmlFor="isPublished"
                className="ml-2 block text-sm text-gray-700 dark:text-gray-300"
              >
                Publish this page
              </label>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => router.back()}
                className="px-4 py-2 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 font-medium text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={loading || !title || !pageSlug}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Saving...' : 'Save Page'}
              </button>
            </div>
          </div>

          {error && (
            <div className="mt-4 rounded-md bg-red-50 dark:bg-red-900/20 p-4">
              <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        <MarkdownEditor
          value={content}
          onChange={setContent}
          placeholder="Start writing your documentation..."
        />
      </div>
    </div>
  );
}
