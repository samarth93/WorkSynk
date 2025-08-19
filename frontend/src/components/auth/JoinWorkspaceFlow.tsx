'use client';

import { useState } from 'react';
import { Mail, Building, ArrowRight, ArrowLeft } from 'lucide-react';
import { workspaceAPI, InviteResponse } from '@/lib/api';

interface JoinWorkspaceFlowProps {
  onWorkspaceVerified: (invite: InviteResponse, email: string) => void;
  onBack: () => void;
}

export default function JoinWorkspaceFlow({ onWorkspaceVerified, onBack }: JoinWorkspaceFlowProps) {
  const [email, setEmail] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    try {
      setIsVerifying(true);
      setError('');
      
      const invite = await workspaceAPI.verifyInvite({ email: email.trim() });
      onWorkspaceVerified(invite, email.trim());
    } catch (err: unknown) {
      setError((err instanceof Error ? err.message : 'Failed to verify workspace invitation'));
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 rounded-full">
              <Building className="w-8 h-8 text-blue-600" />
            </div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Join Existing Workspace
          </h1>
          <p className="text-gray-600">
            Enter your email to verify your workspace invitation
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-800 text-sm">{error}</p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleVerifyEmail} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white placeholder-gray-500"
                required
              />
            </div>
            <p className="text-xs text-gray-500 mt-2">
              This should be the email address you received the workspace invitation
            </p>
          </div>

          <button
            type="submit"
            disabled={isVerifying || !email.trim()}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
          >
            {isVerifying ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                Verifying...
              </>
            ) : (
              <>
                Verify Invitation
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Back Button */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          <button
            onClick={onBack}
            className="w-full text-gray-600 hover:text-gray-900 py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Sign Up Options
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">Don&apos;t have an invitation?</h3>
          <p className="text-sm text-blue-800">
            Contact your workspace administrator to request access to the workspace.
          </p>
        </div>
      </div>
    </div>
  );
}
