'use client';

import Navigation from './Navigation';
import ProtectedRoute from '../auth/ProtectedRoute';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar Navigation */}
          <Navigation />
          
          {/* Main Content */}
          <div className="flex-1 lg:ml-0 min-h-screen">
            <main className="p-4 sm:p-6 lg:p-8 pt-20 lg:pt-8">
              <div className="max-w-7xl mx-auto">
                {children}
              </div>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
