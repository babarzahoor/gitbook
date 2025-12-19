'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { Plus, BookOpen, FolderOpen, FileText, Settings } from 'lucide-react';
import Link from 'next/link';

type Workspace = Database['public']['Tables']['workspaces']['Row'];
type Collection = Database['public']['Tables']['collections']['Row'];
type Document = Database['public']['Tables']['documents']['Row'];

interface CollectionWithDocuments extends Collection {
  documents: Document[];
}

export default function WorkspacePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [collections, setCollections] = useState<CollectionWithDocuments[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWorkspace();
  }, [slug]);

  const loadWorkspace = async () => {
    const { data: workspaceData } = await supabase
      .from('workspaces')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (workspaceData) {
      setWorkspace(workspaceData);

      const { data: collectionsData } = await supabase
        .from('collections')
        .select('*')
        .eq('workspace_id', workspaceData.id)
        .order('order_index', { ascending: true });

      if (collectionsData) {
        const collectionsWithDocs = await Promise.all(
          collectionsData.map(async (collection) => {
            const { data: docsData } = await supabase
              .from('documents')
              .select('*')
              .eq('collection_id', collection.id)
              .is('parent_id', null)
              .order('order_index', { ascending: true });

            return {
              ...collection,
              documents: docsData || []
            };
          })
        );

        setCollections(collectionsWithDocs);
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading workspace...</div>
      </div>
    );
  }

  if (!workspace) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Workspace not found</h1>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href="/dashboard" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                ← Dashboard
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-2xl">{workspace.icon || '📚'}</span>
                <span className="text-lg font-semibold text-gray-900 dark:text-white">{workspace.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                {workspace.is_public ? 'Public' : 'Private'}
              </span>
            </div>
          </div>
        </div>
      </nav>

      <div className="flex">
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-[calc(100vh-4rem)] p-4">
          <div className="mb-6">
            <button
              onClick={() => router.push(`/w/${slug}/collections/new`)}
              className="w-full flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium text-sm"
            >
              <Plus className="w-4 h-4" />
              New Collection
            </button>
          </div>

          <div className="space-y-2">
            {collections.map((collection) => (
              <div key={collection.id}>
                <div className="flex items-center gap-2 px-3 py-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg">
                  <FolderOpen className="w-4 h-4" />
                  <span className="text-sm font-medium flex-1">{collection.name}</span>
                  <span className="text-xs text-gray-500">{collection.documents.length}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>

        <main className="flex-1 p-8">
          {workspace.description && (
            <div className="mb-8">
              <p className="text-gray-600 dark:text-gray-400">{workspace.description}</p>
            </div>
          )}

          {collections.length === 0 ? (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
              <FolderOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                No collections yet
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Create your first collection to organize your documentation
              </p>
              <button
                onClick={() => router.push(`/w/${slug}/collections/new`)}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                <Plus className="w-5 h-5" />
                Create Collection
              </button>
            </div>
          ) : (
            <div className="space-y-8">
              {collections.map((collection) => (
                <div key={collection.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{collection.icon || '📁'}</span>
                      <div>
                        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                          {collection.name}
                        </h2>
                        {collection.description && (
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {collection.description}
                          </p>
                        )}
                      </div>
                    </div>
                    <button
                      onClick={() => router.push(`/w/${slug}/collections/${collection.slug}/documents/new`)}
                      className="flex items-center gap-2 px-4 py-2 text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg font-medium text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      New Document
                    </button>
                  </div>

                  {collection.documents.length === 0 ? (
                    <div className="text-center py-8 border-2 border-dashed border-gray-200 dark:border-gray-700 rounded-lg">
                      <FileText className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600 dark:text-gray-400">No documents yet</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {collection.documents.map((doc) => (
                        <Link
                          key={doc.id}
                          href={`/w/${slug}/docs/${doc.slug}`}
                          className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg border border-transparent hover:border-gray-200 dark:hover:border-gray-600 transition-colors"
                        >
                          <span className="text-lg">{doc.icon || '📄'}</span>
                          <div className="flex-1">
                            <h3 className="font-medium text-gray-900 dark:text-white">{doc.title}</h3>
                            {doc.excerpt && (
                              <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-1">
                                {doc.excerpt}
                              </p>
                            )}
                          </div>
                          {!doc.is_published && (
                            <span className="px-2 py-1 text-xs bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 rounded">
                              Draft
                            </span>
                          )}
                        </Link>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
