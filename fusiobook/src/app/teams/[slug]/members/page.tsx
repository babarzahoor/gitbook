'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Database } from '@/lib/database.types';
import { Users, UserPlus, Crown, Shield, Edit, Eye, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';

type Team = Database['public']['Tables']['teams']['Row'];
type TeamMember = Database['public']['Tables']['team_members']['Row'];

interface TeamMemberWithUser extends TeamMember {
  user_email?: string;
}

export default function TeamMembersPage() {
  const params = useParams();
  const { user } = useAuth();
  const slug = params.slug as string;

  const [team, setTeam] = useState<Team | null>(null);
  const [members, setMembers] = useState<TeamMemberWithUser[]>([]);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'Owner' | 'Admin' | 'Editor' | 'Viewer'>('Editor');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTeamAndMembers();
  }, [slug]);

  const loadTeamAndMembers = async () => {
    const { data: teamData } = await supabase
      .from('teams')
      .select('*')
      .eq('slug', slug)
      .maybeSingle();

    if (teamData) {
      setTeam(teamData);

      const { data: membersData } = await supabase
        .from('team_members')
        .select('*')
        .eq('team_id', teamData.id)
        .order('created_at', { ascending: true });

      if (membersData) {
        const membersWithEmails = await Promise.all(
          membersData.map(async (member) => {
            const { data: userData } = await supabase.auth.admin.getUserById(member.user_id);
            return {
              ...member,
              user_email: userData.user?.email || 'Unknown'
            };
          })
        );
        setMembers(membersWithEmails);

        const currentMember = membersData.find(m => m.user_id === user?.id);
        if (currentMember) {
          setCurrentUserRole(currentMember.role);
        }
      }
    }

    setLoading(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!team || !user) return;

    if (currentUserRole !== 'Owner' && currentUserRole !== 'Admin') {
      setError('You do not have permission to invite members');
      return;
    }

    const { data: invitedUser } = await supabase.auth.admin.listUsers();
    const userToInvite = invitedUser?.users.find(u => u.email === inviteEmail);

    if (!userToInvite) {
      setError('User not found. They must sign up first.');
      return;
    }

    const { error: inviteError } = await supabase
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: userToInvite.id,
        role: inviteRole
      });

    if (inviteError) {
      if (inviteError.code === '23505') {
        setError('This user is already a member of the team');
      } else {
        setError(inviteError.message);
      }
      return;
    }

    setSuccess(`Successfully invited ${inviteEmail} as ${inviteRole}`);
    setInviteEmail('');
    await loadTeamAndMembers();
  };

  const handleRoleChange = async (memberId: string, newRole: string) => {
    if (currentUserRole !== 'Owner' && currentUserRole !== 'Admin') {
      setError('You do not have permission to change roles');
      return;
    }

    const { error: updateError } = await supabase
      .from('team_members')
      .update({ role: newRole })
      .eq('id', memberId);

    if (!updateError) {
      await loadTeamAndMembers();
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (currentUserRole !== 'Owner' && currentUserRole !== 'Admin') {
      setError('You do not have permission to remove members');
      return;
    }

    if (confirm('Are you sure you want to remove this member?')) {
      const { error: deleteError } = await supabase
        .from('team_members')
        .delete()
        .eq('id', memberId);

      if (!deleteError) {
        await loadTeamAndMembers();
      }
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Owner':
        return <Crown className="w-4 h-4 text-yellow-500" />;
      case 'Admin':
        return <Shield className="w-4 h-4 text-blue-500" />;
      case 'Editor':
        return <Edit className="w-4 h-4 text-green-500" />;
      case 'Viewer':
        return <Eye className="w-4 h-4 text-gray-500" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-lg text-gray-600 dark:text-gray-400">Loading...</div>
      </div>
    );
  }

  if (!team) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Team not found</h1>
          <Link href="/dashboard" className="text-blue-600 hover:underline">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const canManageMembers = currentUserRole === 'Owner' || currentUserRole === 'Admin';

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-4">
              <Link href={`/teams/${slug}`} className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white">
                ← Back to Team
              </Link>
              <div className="flex items-center gap-2">
                <Users className="w-6 h-6 text-blue-600" />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">{team.name} Members</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {canManageMembers && (
          <div className="mb-8 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <UserPlus className="w-5 h-5" />
              Invite Member
            </h2>

            {error && (
              <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-red-800 dark:text-red-200">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg text-green-800 dark:text-green-200">
                {success}
              </div>
            )}

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                  placeholder="colleague@example.com"
                />
                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  User must already have an account
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Role
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as any)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Viewer">Viewer - Can view content</option>
                  <option value="Editor">Editor - Can edit content</option>
                  <option value="Admin">Admin - Can manage team</option>
                  {currentUserRole === 'Owner' && <option value="Owner">Owner - Full control</option>}
                </select>
              </div>

              <button
                type="submit"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Send Invite
              </button>
            </form>
          </div>
        )}

        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
              Team Members ({members.length})
            </h2>
          </div>

          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {members.map((member) => (
              <div key={member.id} className="px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-300 font-semibold">
                      {member.user_email?.[0]?.toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {member.user_email}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                      {getRoleIcon(member.role)}
                      <span>{member.role}</span>
                    </div>
                  </div>
                </div>

                {canManageMembers && member.user_id !== user?.id && (
                  <div className="flex items-center gap-2">
                    <select
                      value={member.role}
                      onChange={(e) => handleRoleChange(member.id, e.target.value)}
                      className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white text-sm focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="Viewer">Viewer</option>
                      <option value="Editor">Editor</option>
                      <option value="Admin">Admin</option>
                      {currentUserRole === 'Owner' && <option value="Owner">Owner</option>}
                    </select>
                    <button
                      onClick={() => handleRemoveMember(member.id)}
                      className="p-2 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
