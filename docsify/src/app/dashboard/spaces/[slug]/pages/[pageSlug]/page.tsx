'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import MarkdownEditor from '@/components/MarkdownEditor';

type Space = Database['public']['Tables']['spaces']['Row'];
type Page = Database['public']['Tables']['pages']['Row'];

export default function EditPagePage() {
  const { user } = useAuth();
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const pageSlug = params.pageSlug as string;

  const [space, setSpace] = useState<Space | null>(null);
  const [page, setPage] = useState<Page | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [slug, pageSlug]);

  const loadData = async () => {
    setLoading(true);

    const { data: spaceData } = await supabase
      .from('spaces')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (spaceData) {
      setSpace(spaceData);

      const { data: pageData } = await supabase
        .from('pages')
        .select('*')
        .eq('space_id', spaceData.id)
        .eq('slug', pageSlug)
        .maybeSingle();

      if (pageData) {
        setPage(pageData);
        setTitle(pageData.title);
        setContent(pageData.content);
        setIsPublished(pageData.is_published);
      }
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!page) return;

    setError('');
    setSaving(true);

    try {
      const { error } = await supabase
        .from('pages')
        .update({
          title,
          content,
          is_published: isPublished,
        })
        .eq('id', page.id);

      if (error) throw error;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!page || !confirm('Are you sure you want to delete this page?')) return;

    try {
      const { error } = await supabase
        .from('pages')
        .delete()
        .eq('id', page.id);

      if (error) throw error;
      router.push(`/dashboard/spaces/${slug}`);
    } catch (err: any) {
      setError(err.message);
    }
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  if (!space || !page) {
    return (
      <div className="p-8">
        <div className="text-center">Page not found</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              Page Title
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
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
                  Published
                </label>
              </div>
              <button
                onClick={handleDelete}
                className="text-sm text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Delete Page
              </button>
            </div>

            <div className="flex gap-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium text-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? 'Saving...' : 'Save Changes'}
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
        <MarkdownEditor value={content} onChange={setContent} />
      </div>
    </div>
  );
}
