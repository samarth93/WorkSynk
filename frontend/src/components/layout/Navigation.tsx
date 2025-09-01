'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import Image from 'next/image';
import { 
  Home, 
  MessageSquare, 
  Settings, 
  User, 
  LogOut, 
  Plus, 
  Video,
  Shield,
  Menu,
  X,
  Search
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { ThemeToggle } from '@/components/ui/ThemeToggle';

const Navigation = () => {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  // Check if user is global admin
  const isAdmin = user?.isGlobalAdmin || user?.email === 'palsamarth9@gmail.com';

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  // Close mobile menu when route changes
  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

  const navigationItems = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: Home,
      isActive: pathname === '/dashboard'
    },
    {
      name: 'Rooms',
      href: '/dashboard/rooms',
      icon: MessageSquare,
      isActive: pathname.startsWith('/dashboard/rooms')
    },
    {
      name: 'Browse',
      href: '/dashboard/browse',
      icon: Search,
      isActive: pathname === '/dashboard/browse'
    },
    {
      name: 'Create Room',
      href: '/dashboard/create-room',
      icon: Plus,
      isActive: pathname === '/dashboard/create-room'
    },
    {
      name: 'Video',
      href: '/dashboard/video',
      icon: Video,
      isActive: pathname.startsWith('/dashboard/video')
    }
  ];

  return (
    <>
      {/* Mobile Header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
            <Link href="/dashboard" className="flex items-center">
              {!logoError ? (
                <Image 
                  src="/logo.png" 
                  alt="WorkSynk" 
                  width={120}
                  height={32}
                  className="h-8 w-auto"
                  onError={() => setLogoError(true)}
                />
              ) : (
                <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                  WorkSynk
                </span>
              )}
            </Link>
          </div>
          
          <div className="flex items-center space-x-2">
            <ThemeToggle />
            
            {/* Mobile User Info (Non-clickable) */}
            <div className="flex items-center space-x-2 p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
                {user?.firstName?.[0] || user?.username?.[0] || 'U'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-gray-900 dark:text-white truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                {isAdmin && (
                  <span className="inline-flex items-center px-1 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300">
                    <Shield className="w-2 h-2 mr-1" />
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden fixed inset-0 z-40 bg-black bg-opacity-50"
          onClick={closeMobileMenu}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed inset-y-0 left-0 z-40 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-700 transform transition-transform duration-300 ease-in-out lg:translate-x-0 navigation-container
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Sidebar Header */}
        <div className="navigation-header flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <Link href="/dashboard" className="flex items-center">
            {!logoError ? (
              <Image 
                src="/logo.png" 
                alt="WorkSynk" 
                width={120}
                height={32}
                className="h-8 w-auto"
                onError={() => setLogoError(true)}
              />
            ) : (
              <span className="text-xl font-bold text-blue-600 dark:text-blue-400">
                WorkSynk
              </span>
            )}
          </Link>
          <div className="hidden lg:block">
            <ThemeToggle />
          </div>
        </div>

        {/* Navigation Menu */}
        <nav className="navigation-content px-4 py-6 space-y-2">
          {navigationItems.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={`
                flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                ${item.isActive 
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }
              `}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
            </Link>
          ))}
        </nav>

        {/* Mobile User Section */}
        <div className="lg:hidden navigation-footer border-t border-gray-200 dark:border-gray-700 p-4">
          {/* Mobile User Info */}
          <div className="flex items-center space-x-3 w-full p-3 mb-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user?.firstName?.[0] || user?.username?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              {isAdmin && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 mt-1">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </span>
              )}
            </div>
          </div>

          {/* Mobile Profile Actions - Always Visible */}
          <div className="space-y-1">
            <Link
              href="/dashboard/profile"
              onClick={closeMobileMenu}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/dashboard/profile'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            
            <Link
              href="/dashboard/settings"
              onClick={closeMobileMenu}
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/dashboard/settings'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>

            {isAdmin && (
              <Link
                href="/dashboard/admin"
                onClick={closeMobileMenu}
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/dashboard/admin'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Admin Settings</span>
              </Link>
            )}

            {/* Mobile Sign Out Button */}
            <button
              onClick={() => {
                handleLogout();
                closeMobileMenu();
              }}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors mt-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>

        {/* User Section (Desktop) */}
        <div className="hidden lg:block navigation-footer border-t border-gray-200 dark:border-gray-700 p-4">
          {/* User Info Display (Non-clickable) */}
          <div className="flex items-center space-x-3 w-full p-3 mb-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
              {user?.firstName?.[0] || user?.username?.[0] || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user?.email}</p>
              {isAdmin && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300 mt-1">
                  <Shield className="w-3 h-3 mr-1" />
                  Admin
                </span>
              )}
            </div>
          </div>

          {/* Profile Actions - Always Visible */}
          <div className="space-y-1">
            <Link
              href="/dashboard/profile"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/dashboard/profile'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Link>
            
            <Link
              href="/dashboard/settings"
              className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === '/dashboard/settings'
                  ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span>Settings</span>
            </Link>

            {isAdmin && (
              <Link
                href="/dashboard/admin"
                className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  pathname === '/dashboard/admin'
                    ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300' 
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <Shield className="h-4 w-4" />
                <span>Admin Settings</span>
              </Link>
            )}

            {/* Sign Out Button */}
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 w-full text-left transition-colors mt-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default Navigation;