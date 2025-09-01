'use client';

import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from '@/contexts/ThemeContext';

export const ThemeToggle = () => {
  const { theme, setTheme, resolvedTheme } = useTheme();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
        return <Moon className="h-5 w-5" />;
      case 'system':
        return <Monitor className="h-5 w-5" />;
      default:
        return <Sun className="h-5 w-5" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Switch to dark mode';
      case 'dark':
        return 'Switch to system mode';
      case 'system':
        return 'Switch to light mode';
      default:
        return 'Switch theme';
    }
  };

  return (
    <button
      onClick={toggleTheme}
      className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
      aria-label={getLabel()}
      title={`Current: ${theme} (${resolvedTheme})`}
    >
      {getIcon()}
    </button>
  );
};

export default ThemeToggle;