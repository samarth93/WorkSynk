'use client';

import { useState } from 'react';
import DashboardLayout from '@/components/layout/DashboardLayout';
import { useTheme } from '@/contexts/ThemeContext';
import { useAuth } from '@/contexts/AuthContext';

export default function SettingsPage() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    notifications: true,
    emailUpdates: false,
    autoJoinRooms: true,
    showPresence: true,
    analytics: false,
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const tabs = [
    { id: 'general', name: 'General', icon: '⚙️' },
    { id: 'appearance', name: 'Appearance', icon: '🎨' },
    { id: 'notifications', name: 'Notifications', icon: '🔔' },
    { id: 'privacy', name: 'Privacy', icon: '🔒' },
    { id: 'account', name: 'Account', icon: '👤' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-2">
            Customize your workspace experience
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200 dark:border-gray-700 mb-8">
          <nav className="flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400 dark:border-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600'
                } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm transition-colors duration-200 flex items-center gap-2`}
              >
                <span>{tab.icon}</span>
                {tab.name}
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          {activeTab === 'general' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  General Settings
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Auto-join rooms
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Automatically join rooms when invited
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.autoJoinRooms}
                        onChange={(e) => handleSettingChange('autoJoinRooms', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Show presence status
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Show online/offline status to other users
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.showPresence}
                        onChange={(e) => handleSettingChange('showPresence', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Appearance
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-4">
                      Theme
                    </label>
                    <div className="grid grid-cols-3 gap-4">
                      {(['light', 'dark', 'system'] as const).map((themeOption) => (
                        <button
                          key={themeOption}
                          onClick={() => setTheme(themeOption)}
                          className={`${
                            theme === themeOption
                              ? 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-900/20'
                              : 'ring-1 ring-gray-200 dark:ring-gray-600 hover:ring-gray-300 dark:hover:ring-gray-500'
                          } p-4 rounded-lg transition-all duration-200 flex flex-col items-center space-y-2 bg-white dark:bg-gray-700`}
                        >
                          <div className="text-2xl">
                            {themeOption === 'light' && '☀️'}
                            {themeOption === 'dark' && '🌙'}
                            {themeOption === 'system' && '💻'}
                          </div>
                          <span className="text-sm font-medium capitalize text-gray-900 dark:text-white">
                            {themeOption}
                          </span>
                          {theme === themeOption && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </button>
                      ))}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      Current theme: <span className="font-medium">{resolvedTheme}</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Notifications
                </h2>
                
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Push notifications
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive notifications for messages and calls
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.notifications}
                        onChange={(e) => handleSettingChange('notifications', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Email updates
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Receive weekly email updates about your activity
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.emailUpdates}
                        onChange={(e) => handleSettingChange('emailUpdates', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Privacy & Security
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Profile visibility
                    </label>
                    <select className="mt-1 block w-full px-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 text-gray-900 dark:text-white">
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="friends">Friends only</option>
                    </select>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <label className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        Analytics
                      </label>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        Help improve the app by sharing anonymous usage data
                      </p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.analytics}
                        onChange={(e) => handleSettingChange('analytics', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                  Account Settings
                </h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Email
                    </label>
                    <input
                      type="email"
                      value={user?.email || ''}
                      disabled
                      className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-900 dark:text-white mb-2">
                      Username
                    </label>
                    <input
                      type="text"
                      value={user?.username || ''}
                      disabled
                      className="mt-1 block w-full px-3 py-2 bg-gray-50 dark:bg-gray-600 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-gray-500 dark:text-gray-400 cursor-not-allowed"
                    />
                  </div>

                  <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                    <h3 className="text-lg font-medium text-red-600 dark:text-red-400 mb-2">
                      Danger Zone
                    </h3>
                    <button className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors duration-200">
                      Delete Account
                    </button>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                      This action cannot be undone
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
