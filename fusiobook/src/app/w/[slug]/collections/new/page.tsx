'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type Workspace = Database['public']['Tables']['workspaces']['Row'];

export default function NewCollectionPage() {
  const params = useParams();
  const router = useRouter();
  const workspaceSlug = params.slug as string;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [icon, setIcon] = useState('📁');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadWorkspace();
  }, [workspaceSlug]);

  useEffect(() => {
    if (name && !slug) {
      setSlug(generateSlug(name));
    }
  }, [name]);

  const loadWorkspace = async () => {
    const { data } = await supabase
      .from('workspaces')
      .select('*')
      .eq('slug', workspaceSlug)
      .maybeSingle();

    if (data) {
      setWorkspace(data);
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

    if (!workspace) {
      setError('Workspace not found');
      setLoading(false);
      return;
    }

    const { data: existingCollections } = await supabase
      .from('collections')
      .select('order_index')
      .eq('workspace_id', workspace.id)
      .order('order_index', { ascending: false })
      .limit(1);

    const nextOrderIndex = existingCollections && existingCollections.length > 0
      ? existingCollections[0].order_index + 1
      : 0;

    const { data, error: createError } = await supabase
      .from('collections')
      .insert({
        workspace_id: workspace.id,
        name,
        slug,
        description: description || null,
        icon,
        order_index: nextOrderIndex
      })
      .select()
      .single();

    if (createError) {
      if (createError.code === '23505') {
        setError('A collection with this slug already exists in this workspace');
      } else {
        setError(createError.message);
      }
      setLoading(false);
      return;
    }

    router.push(`/w/${workspaceSlug}`);
  };

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link
              href={`/w/${workspaceSlug}`}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Workspace
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Create Collection</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Organize your documentation into collections
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          {error && (
            <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Icon
            </label>
            <input
              type="text"
              value={icon}
              onChange={(e) => setIcon(e.target.value)}
              className="w-20 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-center text-2xl focus:ring-2 focus:ring-blue-500"
              placeholder="📁"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              Choose an emoji to represent this collection
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Getting Started"
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
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono"
              placeholder="getting-started"
            />
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              URL-friendly identifier (lowercase, numbers, and hyphens only)
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              placeholder="Essential guides to help you get started"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Link
              href={`/w/${workspaceSlug}`}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 font-medium"
            >
              {loading ? 'Creating...' : 'Create Collection'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
