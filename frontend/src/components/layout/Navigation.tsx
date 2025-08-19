'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import './navigation.css';
import { 
  Home, 
  MessageSquare, 
  Plus, 
  User, 
  LogOut, 
  Settings,
  Video,
  Users,
  Menu,
  X,
  UserCog
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { formatUserDisplayName, getUserInitials } from '@/utils/auth';

export default function Navigation() {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Map user status to styles
  const getStatusMeta = (status?: string) => {
    const normalized = (status || 'online').toLowerCase();
    switch (normalized) {
      case 'busy':
        return { label: 'Busy', dot: 'bg-red-500', text: 'text-red-700', bg: 'bg-red-50' };
      case 'away':
        return { label: 'Away', dot: 'bg-amber-500', text: 'text-amber-700', bg: 'bg-amber-50' };
      case 'offline':
        return { label: 'Offline', dot: 'bg-gray-400', text: 'text-gray-700', bg: 'bg-gray-100' };
      case 'vacation':
        return { label: 'Vacation', dot: 'bg-emerald-500', text: 'text-emerald-700', bg: 'bg-emerald-50' };
      case 'medical leave':
      case 'medical_leave':
      case 'medical':
        return { label: 'Medical Leave', dot: 'bg-fuchsia-500', text: 'text-fuchsia-700', bg: 'bg-fuchsia-50' };
      case 'online':
      default:
        return { label: 'Online', dot: 'bg-green-500', text: 'text-green-700', bg: 'bg-green-50' };
    }
  };

  // Check if user is admin (for now, check if email is the default admin)
  const isAdmin = user?.email === 'palsamarth9@gmail.com';
  
  const navigation = [
    { name: 'Home', href: '/dashboard', icon: Home },
    { name: 'My Rooms', href: '/dashboard/rooms', icon: MessageSquare },
    { name: 'Create Room', href: '/dashboard/create-room', icon: Plus },
    { name: 'Browse Rooms', href: '/dashboard/browse', icon: Users },
    ...(isAdmin ? [{ name: 'Admin Settings', href: '/dashboard/admin', icon: UserCog }] : []),
    { name: 'Video Calls', href: '/dashboard/video', icon: Video },
  ];

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const isActive = (href: string) => {
    return pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
  };

  return (
    <>
      {/* Mobile menu button - Fixed at top */}
      <div className="lg:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="bg-white rounded-lg shadow-lg p-3 border border-gray-200 hover:bg-gray-50 active:bg-gray-100 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Toggle navigation menu"
        >
          {isMobileMenuOpen ? (
            <X className="h-5 w-5 text-gray-700" />
          ) : (
            <Menu className="h-5 w-5 text-gray-700" />
          )}
        </button>
      </div>

      {/* Mobile overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-80 max-w-[85vw] bg-white shadow-2xl border-r border-gray-200 transform transition-transform duration-300 ease-in-out
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:translate-x-0 lg:static lg:inset-0 lg:h-screen lg:w-64 lg:max-w-none
     `}>
        <div className="navigation-container">
          {/* Logo and title - Fixed height */}
          <div className="navigation-header flex items-center justify-center bg-gradient-to-r from-blue-600 to-indigo-600 px-4">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                <MessageSquare className="h-5 w-5 text-blue-600" />
              </div>
              <span className="text-white font-bold text-lg navigation-text">Workspace</span>
            </div>
          </div>

          {/* Navigation Links - Scrollable area */}
          <nav className="navigation-content px-4 py-6 space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`
                    flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-all duration-200 select-none
                    ${active 
                      ? 'bg-gradient-to-r from-blue-50 to-indigo-50 text-blue-700 border border-blue-200 border-l-4 border-blue-600 shadow-sm' 
                      : 'text-gray-600 bg-white border border-gray-200 hover:bg-gray-50 hover:text-gray-900 hover:border-gray-300 active:bg-gray-100 active:border-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-200 active:scale-[0.98]'
                    }
                  `}
                >
                  <Icon className={`mr-3 h-5 w-5 flex-shrink-0 ${active ? 'text-blue-600' : 'text-gray-400'}`} />
                  <span className="truncate">{item.name}</span>
                  {item.name === 'Video Calls' && (
                    <span className="ml-auto text-xs text-green-600 bg-green-100 px-2 py-1 rounded flex-shrink-0">
                      Active
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* User Profile Section - Always at bottom */}
          <div className="navigation-footer p-4">
            {user && (
              <div>
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0">
                    {user.profilePictureUrl ? (
                      <img 
                        src={user.profilePictureUrl} 
                        alt="Profile" 
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      getUserInitials(user)
                    )}
                  </div>
                  <div className="user-info">
                    <p className="user-name">
                      {formatUserDisplayName(user)}
                    </p>
                    <p className="user-username">
                      @{user.username}
                    </p>
                    {/* Status pill */}
                    {(() => {
                      const meta = getStatusMeta(user.status as unknown as string);
                      return (
                        <span className={`status-indicator mt-1 ${meta.text} ${meta.bg}`}> 
                          <span className={`w-2 h-2 rounded-full mr-1.5 ${meta.dot}`}></span>
                          {meta.label}
                        </span>
                      );
                    })()}
                  </div>
                </div>

                {/* Profile Actions */}
                <div className="profile-actions">
                  <Link
                    href="/dashboard/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="profile-action-item text-sm text-gray-700"
                  >
                    <User className="mr-3 h-4 w-4 flex-shrink-0" />
                    <span className="navigation-text">Profile</span>
                  </Link>
                  <Link
                    href="/dashboard/settings"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="profile-action-item text-sm text-gray-700"
                  >
                    <Settings className="mr-3 h-4 w-4 flex-shrink-0" />
                    <span className="navigation-text">Settings</span>
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="profile-action-item w-full text-sm text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-200 active:bg-red-100 active:border-red-300"
                  >
                    <LogOut className="mr-3 h-4 w-4 flex-shrink-0" />
                    <span className="navigation-text">Sign out</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
