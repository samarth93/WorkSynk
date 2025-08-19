'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Building, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import JoinWorkspaceFlow from '@/components/auth/JoinWorkspaceFlow';
import { InviteResponse } from '@/lib/api';

export default function SignupOptionsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [showJoinFlow, setShowJoinFlow] = useState(false);
  // const [verifiedInvite, setVerifiedInvite] = useState<{ invite: InviteResponse; email: string } | null>(null);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
  }, [isAuthenticated, router]);

  const handleWorkspaceVerified = (invite: InviteResponse, email: string) => {
    // setVerifiedInvite({ invite, email });
    // Redirect to register page with invite data
    const params = new URLSearchParams({
      email: email,
      inviteId: invite.id,
      workspaceName: invite.workspaceName || 'Unknown Workspace'
    });
    router.push(`/auth/register?${params.toString()}`);
  };

  if (showJoinFlow) {
    return (
      <JoinWorkspaceFlow
        onWorkspaceVerified={handleWorkspaceVerified}
        onBack={() => setShowJoinFlow(false)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 w-full max-w-lg p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Get Started
          </h1>
          <p className="text-gray-600">
            Choose how you&apos;d like to create your account
          </p>
        </div>

        {/* Options */}
        <div className="space-y-4">
          {/* Create New Account */}
          <Link
            href="/auth/register"
            className="block w-full p-6 border-2 border-gray-200 rounded-xl hover:border-blue-300 hover:bg-blue-50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-blue-100 rounded-full group-hover:bg-blue-200 transition-colors">
                  <UserPlus className="w-6 h-6 text-blue-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Create New Account
                  </h3>
                  <p className="text-sm text-gray-600">
                    Start fresh with a new workspace account
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
            </div>
          </Link>

          {/* Join Existing Workspace */}
          <button
            onClick={() => setShowJoinFlow(true)}
            className="block w-full p-6 border-2 border-gray-200 rounded-xl hover:border-green-300 hover:bg-green-50 transition-all group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-green-100 rounded-full group-hover:bg-green-200 transition-colors">
                  <Building className="w-6 h-6 text-green-600" />
                </div>
                <div className="text-left">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    Join Existing Workspace
                  </h3>
                  <p className="text-sm text-gray-600">
                    Use an invitation to join a workspace
                  </p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-green-600 transition-colors" />
            </div>
          </button>
        </div>

        {/* Sign In Link */}
        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-sm text-gray-600">
            Already have an account?{' '}
            <Link 
              href="/auth/login" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign in
            </Link>
          </p>
        </div>

        {/* Help Text */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Need help?</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Choose &quot;Create New Account&quot; if you&apos;re starting a new workspace</li>
            <li>• Choose &quot;Join Existing Workspace&quot; if you received an invitation email</li>
            <li>• Contact your administrator if you need workspace access</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
