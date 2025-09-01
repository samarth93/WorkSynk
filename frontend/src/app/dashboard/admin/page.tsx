'use client';

import { useState, useEffect } from 'react';
import { User, Plus, Mail, Clock, CheckCircle, XCircle, RotateCcw, Trash2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { adminAPI } from '@/lib/api';

interface Invite {
  id: string;
  email: string;
  workspaceId: string;
  workspaceName?: string;
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  used: boolean;
  expired: boolean;
  valid: boolean;
}

export default function AdminPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [invites, setInvites] = useState<Invite[]>([]);
  const [newEmail, setNewEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Load invites on component mount
  useEffect(() => {
    if (isAuthenticated && !isLoading) {
      loadInvites();
    } else if (!isLoading && !isAuthenticated) {
      // Redirect to login if not authenticated
      window.location.href = '/auth/login';
    }
  }, [isAuthenticated, isLoading]);

  const loadInvites = async () => {
    if (!isAuthenticated) {
      setMessage({ type: 'error', text: 'You must be logged in to view invites' });
      return;
    }
    
    try {
      setLoading(true);
      const response = await adminAPI.getInvites();
      setInvites(response);
    } catch (error: unknown) {
      setMessage({ type: 'error', text: (error instanceof Error ? error.message : 'Failed to load invites') });
    } finally {
      setLoading(false);
    }
  };

  const handleSendInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEmail.trim()) return;

    try {
      setSubmitting(true);
      await adminAPI.inviteUser({ email: newEmail.trim() });
      setMessage({ type: 'success', text: 'Invite sent successfully!' });
      setNewEmail('');
      loadInvites(); // Refresh the list
    } catch (error: unknown) {
      setMessage({ type: 'error', text: (error instanceof Error ? error.message : 'Failed to send invite') });
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelInvite = async (inviteId: string) => {
    try {
      await adminAPI.cancelInvite(inviteId);
      setMessage({ type: 'success', text: 'Invite cancelled successfully' });
      loadInvites(); // Refresh the list
    } catch (error: unknown) {
      setMessage({ type: 'error', text: (error instanceof Error ? error.message : 'Failed to cancel invite') });
    }
  };

  const handleResendInvite = async (inviteId: string) => {
    try {
      await adminAPI.resendInvite(inviteId);
      setMessage({ type: 'success', text: 'Invite resent successfully' });
      loadInvites(); // Refresh the list
    } catch (error: unknown) {
      setMessage({ type: 'error', text: (error instanceof Error ? error.message : 'Failed to resend invite') });
    }
  };

  const getStatusIcon = (invite: Invite) => {
    if (invite.used) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (invite.expired) return <XCircle className="w-5 h-5 text-red-500" />;
    return <Clock className="w-5 h-5 text-yellow-500" />;
  };

  const getStatusText = (invite: Invite) => {
    if (invite.used) return 'Joined';
    if (invite.expired) return 'Expired';
    return 'Pending';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  // Show message if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 dark:text-gray-300">Redirecting to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4 sm:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-6 sm:mb-8">
          <div className="flex items-center gap-3 mb-2">
            <User className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">Admin Settings</h1>
          </div>
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            Manage workspace invitations and user access
          </p>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.type === 'success' 
              ? 'bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700/50 text-green-800 dark:text-green-200' 
              : 'bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700/50 text-red-800 dark:text-red-200'
          }`}>
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Send Invite Section */}
          <div className="lg:col-span-1">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                Invite New User
              </h2>
              
              <form onSubmit={handleSendInvite} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500" />
                    <input
                      type="email"
                      id="email"
                      value={newEmail}
                      onChange={(e) => setNewEmail(e.target.value)}
                      placeholder="Enter email address"
                      className="w-full pl-10 pr-4 py-2 sm:py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white bg-white dark:bg-gray-700 placeholder-gray-500 dark:placeholder-gray-400 text-sm sm:text-base"
                      required
                    />
                  </div>
                </div>
                
                <button
                  type="submit"
                  disabled={submitting || !newEmail.trim()}
                  className="w-full bg-blue-600 dark:bg-blue-600 text-white py-2 sm:py-3 px-4 rounded-lg hover:bg-blue-700 dark:hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium"
                >
                  {submitting ? 'Sending...' : 'Send Invite'}
                </button>
              </form>
              
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                <h3 className="text-sm font-medium text-blue-900 dark:text-blue-200 mb-2">How it works:</h3>
                <ul className="text-sm text-blue-800 dark:text-blue-300 space-y-1">
                  <li>• Enter the email address of the person you want to invite</li>
                  <li>• They&apos;ll receive instructions to join your workspace</li>
                  <li>• Invites expire after 7 days</li>
                  <li>• You can resend or cancel invites at any time</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Invites List Section */}
          <div className="lg:col-span-2">
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
              <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-gray-700">
                <h2 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  Workspace Invitations
                </h2>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                  Manage pending and completed invitations
                </p>
              </div>

              <div className="p-4 sm:p-6">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 dark:border-blue-400 mx-auto"></div>
                    <p className="text-gray-600 dark:text-gray-300 mt-2 text-sm sm:text-base">Loading invitations...</p>
                  </div>
                ) : invites.length === 0 ? (
                  <div className="text-center py-12">
                    <Mail className="w-12 h-12 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 text-sm sm:text-base">No invitations found</p>
                    <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                      Send your first invitation to get started
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 sm:space-y-4">
                    {invites.map((invite) => (
                      <div key={invite.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2">
                              {getStatusIcon(invite)}
                              <span className="font-medium text-gray-900 dark:text-white truncate">{invite.email}</span>
                              <span className={`px-2 py-1 text-xs rounded-full flex-shrink-0 ${
                                invite.used 
                                  ? 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200'
                                  : invite.expired
                                  ? 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
                                  : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200'
                              }`}>
                                {getStatusText(invite)}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                              <p>Invited: {formatDate(invite.invitedAt)}</p>
                              <p>Expires: {formatDate(invite.expiresAt)}</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-2 sm:ml-4">
                            {invite.valid && !invite.used && (
                              <>
                                <button
                                  onClick={() => handleResendInvite(invite.id)}
                                  className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded-lg transition-colors"
                                  title="Resend invite"
                                >
                                  <RotateCcw className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleCancelInvite(invite.id)}
                                  className="p-2 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors"
                                  title="Cancel invite"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
