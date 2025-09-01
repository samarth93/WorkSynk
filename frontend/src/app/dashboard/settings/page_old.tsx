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
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const tabs = [
    { id: 'general', label: 'General', icon: '⚙️' },
    { id: 'appearance', label: 'Appearance', icon: '🎨' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'privacy', label: 'Privacy', icon: '🔒' },
    { id: 'account', label: 'Account', icon: '👤' },
  ];

  const themeOptions = [
    { value: 'light', label: 'Light', icon: '☀️', description: 'Clean and bright interface' },
    { value: 'dark', label: 'Dark', icon: '🌙', description: 'Easy on the eyes' },
    { value: 'system', label: 'System', icon: '💻', description: 'Follow system preference' },
  ];

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-8">
          <ThemeText as="h1" className="text-3xl font-bold">
            Settings
          </ThemeText>
          <ThemeText variant="secondary" className="mt-2">
            Manage your workspace preferences and account settings
          </ThemeText>
        </div>

        <div className="flex gap-8">
          {/* Sidebar */}
          <div className="w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    activeTab === tab.id
                      ? themeClasses.nav.itemActive
                      : themeClasses.nav.item
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span className="font-medium">{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <ThemeCard variant="elevated" className="p-6">
              {activeTab === 'general' && (
                <div>
                  <ThemeText as="h2" className="text-xl font-semibold mb-4">
                    General Settings
                  </ThemeText>
                  <div className="space-y-6">
                    <div>
                      <ThemeText as="div" className="block text-sm font-medium mb-3">
                        Auto-join rooms
                      </ThemeText>
                      <ThemeToggle
                        checked={settings.autoJoinRooms}
                        onChange={(checked) => handleSettingChange('autoJoinRooms', checked)}
                        label="Automatically join rooms when invited"
                      />
                    </div>

                    <div>
                      <ThemeText as="div" className="block text-sm font-medium mb-3">
                        Show presence status
                      </ThemeText>
                      <ThemeToggle
                        checked={settings.showPresence}
                        onChange={(checked) => handleSettingChange('showPresence', checked)}
                        label="Let others see when you're online"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'appearance' && (
                <div>
                  <ThemeText as="h2" className="text-xl font-semibold mb-4">
                    Appearance
                  </ThemeText>
                  <div className="space-y-6">
                    <div>
                      <ThemeText as="div" className="block text-sm font-medium mb-4">
                        Theme Preference
                      </ThemeText>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {themeOptions.map((option) => (
                          <button
                            key={option.value}
                            onClick={() => updateTheme(option.value as any)}
                            className={`p-4 border-2 rounded-lg text-left transition-all hover:shadow-md ${
                              theme === option.value
                                ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                                : `${themeClasses.card} border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600`
                            }`}
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-2xl">{option.icon}</span>
                              <ThemeText className="font-medium">
                                {option.label}
                              </ThemeText>
                              {theme === option.value && (
                                <ThemeBadge variant="info" size="sm">
                                  Active
                                </ThemeBadge>
                              )}
                            </div>
                            <ThemeText variant="muted" className="text-sm">
                              {option.description}
                            </ThemeText>
                          </button>
                        ))}
                      </div>
                      <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                        <ThemeText className="text-sm text-blue-800 dark:text-blue-300">
                          <strong>Current theme:</strong> {theme} 
                          {theme === 'system' && ` (resolved to ${resolvedTheme})`}
                        </ThemeText>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'notifications' && (
                <div>
                  <ThemeText as="h2" className="text-xl font-semibold mb-4">
                    Notifications
                  </ThemeText>
                  <div className="space-y-6">
                    <div>
                      <ThemeText as="div" className="block text-sm font-medium mb-3">
                        Push notifications
                      </ThemeText>
                      <ThemeToggle
                        checked={settings.notifications}
                        onChange={(checked) => handleSettingChange('notifications', checked)}
                        label="Receive push notifications for new messages"
                      />
                    </div>

                    <div>
                      <ThemeText as="div" className="block text-sm font-medium mb-3">
                        Email updates
                      </ThemeText>
                      <ThemeToggle
                        checked={settings.emailUpdates}
                        onChange={(checked) => handleSettingChange('emailUpdates', checked)}
                        label="Receive email notifications for important updates"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'privacy' && (
                <div>
                  <ThemeText as="h2" className="text-xl font-semibold mb-4">
                    Privacy
                  </ThemeText>
                  <div className="space-y-6">
                    <div className={`p-4 rounded-lg border ${themeClasses.status.warning}`}>
                      <ThemeText as="h3" className="font-medium mb-2">
                        Data Collection
                      </ThemeText>
                      <ThemeText className="text-sm">
                        We collect minimal data to improve your experience. View our privacy policy for details.
                      </ThemeText>
                    </div>
                    
                    <div>
                      <ThemeText as="div" className="block text-sm font-medium mb-3">
                        Analytics
                      </ThemeText>
                      <ThemeToggle
                        checked={settings.analytics}
                        onChange={(checked) => handleSettingChange('analytics', checked)}
                        label="Help improve WorkSynk by sharing anonymous usage data"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'account' && (
                <div>
                  <ThemeText as="h2" className="text-xl font-semibold mb-4">
                    Account Information
                  </ThemeText>
                  <div className="space-y-6">
                    <ThemeInput
                      label="Username"
                      value={user?.username || 'demo-user'}
                      readOnly
                      className="bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                    />

                    <ThemeInput
                      label="Email"
                      type="email"
                      value={user?.email || 'demo@example.com'}
                      readOnly
                      className="bg-gray-50 dark:bg-gray-700 cursor-not-allowed"
                    />

                    <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                      <ThemeText as="h3" className="text-lg font-medium mb-4">
                        Danger Zone
                      </ThemeText>
                      <div className={`p-4 rounded-lg border ${themeClasses.status.error}`}>
                        <ThemeText as="h4" className="font-medium mb-2">
                          Delete Account
                        </ThemeText>
                        <ThemeText className="text-sm mb-3">
                          This action cannot be undone. All your data will be permanently deleted.
                        </ThemeText>
                        <ThemeButton variant="outline" size="sm" className="border-red-500 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20">
                          Delete Account
                        </ThemeButton>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Save Button */}
              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="flex justify-end gap-3">
                  <ThemeButton variant="secondary">
                    Cancel
                  </ThemeButton>
                  <ThemeButton variant="primary">
                    Save Changes
                  </ThemeButton>
                </div>
              </div>
            </ThemeCard>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
