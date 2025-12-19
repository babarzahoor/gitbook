'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { ArrowLeft, Edit, Save, Clock, MessageCircle, Eye } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

type Workspace = Database['public']['Tables']['workspaces']['Row'];
type Document = Database['public']['Tables']['documents']['Row'];
type Collection = Database['public']['Tables']['collections']['Row'];
type Comment = Database['public']['Tables']['comments']['Row'];
type DocumentVersion = Database['public']['Tables']['document_versions']['Row'];

interface CommentWithUser extends Comment {
  user_email?: string;
}

export default function DocumentPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const workspaceSlug = params.slug as string;
  const docSlug = params.docSlug as string;

  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [collection, setCollection] = useState<Collection | null>(null);
  const [document, setDocument] = useState<Document | null>(null);
  const [comments, setComments] = useState<CommentWithUser[]>([]);
  const [versions, setVersions] = useState<DocumentVersion[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editContent, setEditContent] = useState('');
  const [editExcerpt, setEditExcerpt] = useState('');
  const [newComment, setNewComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showVersions, setShowVersions] = useState(false);
  const [showComments, setShowComments] = useState(false);

  useEffect(() => {
    loadDocument();
  }, [workspaceSlug, docSlug]);

  const loadDocument = async () => {
    const { data: workspaceData } = await supabase
      .from('workspaces')
      .select('*')
      .eq('slug', workspaceSlug)
      .maybeSingle();

    if (!workspaceData) {
      setLoading(false);
      return;
    }

    setWorkspace(workspaceData);

    const { data: docData } = await supabase
      .from('documents')
      .select('*, collections(*)')
      .eq('slug', docSlug)
      .maybeSingle();

    if (docData) {
      setDocument(docData);
      setEditTitle(docData.title);
      setEditContent(docData.content || '');
      setEditExcerpt(docData.excerpt || '');

      const collectionData = docData.collections as unknown as Collection;
      setCollection(collectionData);

      const { data: commentsData } = await supabase
        .from('comments')
        .select('*')
        .eq('document_id', docData.id)
        .order('created_at', { ascending: true });

      if (commentsData) {
        const commentsWithUsers = await Promise.all(
          commentsData.map(async (comment) => {
            const { data: userData } = await supabase.auth.admin.getUserById(comment.user_id);
            return {
              ...comment,
              user_email: userData.user?.email || 'Unknown user'
            };
          })
        );
        setComments(commentsWithUsers);
      }

      const { data: versionsData } = await supabase
        .from('document_versions')
        .select('*')
        .eq('document_id', docData.id)
        .order('version', { ascending: false });

      if (versionsData) {
        setVersions(versionsData);
      }
    }

    setLoading(false);
  };

  const handleSave = async () => {
    if (!document || !user) return;

    setSaving(true);

    const newVersion = document.version + 1;

    const { error: updateError } = await supabase
      .from('documents')
      .update({
        title: editTitle,
        content: editContent,
        excerpt: editExcerpt || null,
        version: newVersion,
        updated_by: user.id
      })
      .eq('id', document.id);

    if (!updateError) {
      await supabase.from('document_versions').insert({
        document_id: document.id,
        version: newVersion,
        title: editTitle,
        content: editContent,
        created_by: user.id,
        change_summary: `Updated to version ${newVersion}`
      });

      await loadDocument();
      setIsEditing(false);
    }

    setSaving(false);
  };

  const handleAddComment = async () => {
    if (!document || !user || !newComment.trim()) return;

    await supabase.from('comments').insert({
      document_id: document.id,
      user_id: user.id,
      content: newComment
    });

    setNewComment('');
    await loadDocument();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading document...</div>
      </div>
    );
  }

  if (!workspace || !document || !collection) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Document not found</h1>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href={`/w/${workspaceSlug}`}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">{workspace.name}</span>
              </Link>
              <span className="text-gray-400">/</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">{collection.name}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowVersions(!showVersions)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <Clock className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">v{document.version}</span>
              </button>
              <button
                onClick={() => setShowComments(!showComments)}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg"
              >
                <MessageCircle className="w-4 h-4" />
                <span className="hidden sm:inline text-sm">{comments.length}</span>
              </button>
              {isEditing ? (
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  <Save className="w-4 h-4" />
                  <span className="hidden sm:inline">{saving ? 'Saving...' : 'Save'}</span>
                </button>
              ) : (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Edit className="w-4 h-4" />
                  <span className="hidden sm:inline">Edit</span>
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-8">
              {isEditing ? (
                <div className="space-y-6">
                  <div>
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      className="w-full text-3xl font-bold border-0 border-b-2 border-gray-200 dark:border-gray-700 bg-transparent text-gray-900 dark:text-white focus:outline-none focus:border-blue-500 pb-2"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      value={editExcerpt}
                      onChange={(e) => setEditExcerpt(e.target.value)}
                      placeholder="Excerpt (optional)"
                      className="w-full text-gray-600 dark:text-gray-400 border-0 border-b border-gray-200 dark:border-gray-700 bg-transparent focus:outline-none focus:border-blue-500 pb-2"
                    />
                  </div>
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    rows={20}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  />
                </div>
              ) : (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <span className="text-4xl">{document.icon || '📄'}</span>
                    <div>
                      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                        {document.title}
                      </h1>
                      {document.excerpt && (
                        <p className="mt-1 text-gray-600 dark:text-gray-400">{document.excerpt}</p>
                      )}
                    </div>
                  </div>

                  {!document.is_published && (
                    <div className="mb-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-yellow-800 dark:text-yellow-200 text-sm">
                        This document is a draft and not published yet.
                      </p>
                    </div>
                  )}

                  <div className="prose dark:prose-invert max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-900 dark:text-white">
                      {document.content || 'No content yet.'}
                    </pre>
                  </div>

                  <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-sm text-gray-500 dark:text-gray-400">
                    Last updated: {new Date(document.updated_at).toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="space-y-6">
            {showVersions && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <Clock className="w-5 h-5" />
                  Version History
                </h3>
                <div className="space-y-3">
                  {versions.map((version) => (
                    <div key={version.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          v{version.version}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(version.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {version.change_summary}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {showComments && (
              <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Comments
                </h3>

                <div className="space-y-4 mb-4">
                  {comments.map((comment) => (
                    <div key={comment.id} className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {comment.user_email}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 dark:text-gray-300">{comment.content}</p>
                    </div>
                  ))}
                </div>

                {user && (
                  <div className="space-y-2">
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={3}
                      placeholder="Add a comment..."
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                    <button
                      onClick={handleAddComment}
                      className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      Add Comment
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
