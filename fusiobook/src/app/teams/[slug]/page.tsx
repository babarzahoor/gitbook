'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { Plus, BookOpen, Users } from 'lucide-react';
import Link from 'next/link';

type Team = Database['public']['Tables']['teams']['Row'];
type Workspace = Database['public']['Tables']['workspaces']['Row'];

export default function TeamPage() {
  const params = useParams();
  const slug = params.slug as string;
  const [team, setTeam] = useState<Team | null>(null);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTeam();
  }, [slug]);

  const loadTeam = async () => {
    const { data: teamData } = await supabase
      .from('teams')
      .select('*')
      .eq('slug', slug)
      .single();

    if (teamData) {
      setTeam(teamData);

      const { data: workspacesData } = await supabase
        .from('workspaces')
        .select('*')
        .eq('team_id', teamData.id)
        .order('created_at', { ascending: false });

      if (workspacesData) {
        setWorkspaces(workspacesData);
      }
    }

    setLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Team not found</h1>
          <Link href="/dashboard" className="text-primary-600 hover:underline">
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
                <Users className="w-6 h-6 text-primary-600" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">{team.name}</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Workspaces</h1>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Documentation spaces for your team
            </p>
          </div>
          <Link
            href={`/teams/${slug}/workspaces/new`}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
          >
            <Plus className="w-5 h-5" />
            New Workspace
          </Link>
        </div>

        {workspaces.length === 0 ? (
          <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
            <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              No workspaces yet
            </h3>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Create your first workspace to start documenting
            </p>
            <Link
              href={`/teams/${slug}/workspaces/new`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-600 text-white rounded-lg hover:bg-primary-700 font-medium"
            >
              <Plus className="w-5 h-5" />
              Create Workspace
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {workspaces.map((workspace) => (
              <Link
                key={workspace.id}
                href={`/w/${workspace.slug}`}
                className="block p-6 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary-500 transition-colors"
              >
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl">{workspace.icon || '📚'}</span>
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                      {workspace.name}
                    </h3>
                    {workspace.description && (
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {workspace.description}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded">
                    {workspace.is_public ? 'Public' : 'Private'}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
