'use client';

import Navigation from './Navigation';
import ProtectedRoute from '../auth/ProtectedRoute';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="flex flex-col lg:flex-row">
          {/* Sidebar Navigation */}
          <Navigation />
          
          {/* Main Content */}
          <div className="flex-1 lg:ml-64 min-h-screen">
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

// Enhanced dashboard layout functionality
export interface EnhancedDashboardLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  actions?: React.ReactNode;
  sidebar?: React.ReactNode;
  className?: string;
}

export const EnhancedDashboardLayout: React.FC<EnhancedDashboardLayoutProps> = ({
  children,
  title,
  subtitle,
  actions,
  sidebar,
  className = ''
}) => {
  return (
    <div className={`min-h-screen bg-background ${className}`}>
      {/* Header */}
      {(title || actions) && (
        <header className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div>
                {title && (
                  <h1 className="text-2xl font-bold text-foreground">{title}</h1>
                )}
                {subtitle && (
                  <p className="text-muted-foreground mt-1">{subtitle}</p>
                )}
              </div>
              {actions && (
                <div className="flex items-center gap-2">
                  {actions}
                </div>
              )}
            </div>
          </div>
        </header>
      )}
      
      {/* Main content */}
      <div className="flex flex-1">
        {sidebar && (
          <aside className="w-64 border-r border-border bg-card/30 hidden lg:block">
            <div className="sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto p-4">
              {sidebar}
            </div>
          </aside>
        )}
        
        <main className="flex-1 overflow-hidden">
          <div className="h-full overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};
