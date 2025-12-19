'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import Link from 'next/link';
import { ArrowLeft, Eye, Save } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

type Workspace = Database['public']['Tables']['workspaces']['Row'];
type Collection = Database['public']['Tables']['collections']['Row'];

export default function NewDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const workspaceSlug = params.slug as string;
  const collectionSlug = params.collectionSlug as string;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [icon, setIcon] = useState('📄');
  const [isPublished, setIsPublished] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadData();
  }, [workspaceSlug, collectionSlug]);

  useEffect(() => {
    if (title && !slug) {
      setSlug(generateSlug(title));
    }
  }, [title]);

  const loadData = async () => {
    const { data: workspaceData } = await supabase
      .from('workspaces')
      .select('*')
      .eq('slug', workspaceSlug)
      .maybeSingle();

    if (workspaceData) {
      setWorkspace(workspaceData);

      const { data: collectionData } = await supabase
        .from('collections')
        .select('*')
        .eq('workspace_id', workspaceData.id)
        .eq('slug', collectionSlug)
        .maybeSingle();

      if (collectionData) {
        setCollection(collectionData);
      }
    }
  };

  const generateSlug = (str: string) => {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!collection || !user) {
      setError('Collection or user not found');
      setLoading(false);
      return;
    }

    const { data: existingDocs } = await supabase
      .from('documents')
      .select('order_index')
      .eq('collection_id', collection.id)
      .is('parent_id', null)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrderIndex = existingDocs && existingDocs.length > 0
      ? existingDocs[0].order_index + 1
      : 0;

    const { data, error: createError } = await supabase
      .from('documents')
      .insert({
        collection_id: collection.id,
        title,
        slug,
        content,
        excerpt: excerpt || null,
        icon,
        order_index: nextOrderIndex,
        is_published: isPublished,
        created_by: user.id,
        updated_by: user.id,
        version: 1
      })
      .select()
      .single();

    if (createError) {
      if (createError.code === '23505') {
        setError('A document with this slug already exists in this collection');
      } else {
        setError(createError.message);
      }
      setLoading(false);
      return;
    }

    if (data) {
      await supabase.from('document_versions').insert({
        document_id: data.id,
        version: 1,
        title,
        content,
        created_by: user.id,
        change_summary: 'Initial version'
      });
    }

    router.push(`/w/${workspaceSlug}/docs/${slug}`);
  };

  if (!workspace || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link
              href={`/w/${workspaceSlug}`}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Workspace
            </Link>
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {collection.name}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
            <div className="flex items-start gap-4">
              <div className="w-20">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Icon
                </label>
                <input
                  type="text"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl focus:ring-2 focus:ring-blue-500"
                  placeholder="📄"
                />
              </div>

              <div className="flex-1 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Title *
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full px-3 py-2 text-2xl font-bold border-0 border-b-2 border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-blue-500"
                    placeholder="Document Title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Slug *
                  </label>
                  <input
                    type="text"
                    required
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    pattern="[a-z0-9-]+"
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                    placeholder="document-title"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Excerpt (Optional)
                  </label>
                  <input
                    type="text"
                    value={excerpt}
                    onChange={(e) => setExcerpt(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                    placeholder="A brief description of this document"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Content (Markdown supported)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={20}
              className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm"
              placeholder="# Getting Started

Start writing your documentation here...

## Features
- Feature 1
- Feature 2

```javascript
const example = 'code';
```"
            />
            <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
              Supports Markdown formatting including headings, lists, code blocks, and more
            </p>
          </div>

          <div className="flex items-center justify-between bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isPublished}
                onChange={(e) => setIsPublished(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Publish this document
              </span>
            </label>

            <div className="flex gap-3">
              <Link
                href={`/w/${workspaceSlug}`}
                className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
              >
                Cancel
              </Link>
              <button
                type="submit"
                disabled={loading}
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
              >
                <Save className="w-4 h-4" />
                {loading ? 'Creating...' : 'Create Document'}
              </button>
            </div>
          </div>
        </form>
      </main>
    </div>
  );
}
