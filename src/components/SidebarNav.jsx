import React from 'react';
import {
  BarChart3,
  Calendar,
  FileText,
  Image as ImageIcon,
  Inbox,
  LayoutGrid,
  Moon,
  Settings,
  Sparkles,
  Sun,
  Target,
  Users,
} from 'lucide-react';
import DatabaseStatus from '../DatabaseStatus.jsx';
import OrbitLogo from '../OrbitLogo.jsx';

const NAV_ITEMS = [
  { id: 'dashboard', icon: BarChart3, label: 'Dashboard' },
  { id: 'inbox', icon: Inbox, label: 'Inbox' },
  { id: 'board', icon: LayoutGrid, label: 'Board' },
  { id: 'calendar', icon: Calendar, label: 'Calendar' },
  { id: 'campaigns', icon: Target, label: 'Campaigns' },
  { id: 'contacts', icon: Users, label: 'Contacts' },
  { id: 'assets', icon: ImageIcon, label: 'Assets' },
  { id: 'templates', icon: FileText, label: 'Templates' },
];

const SidebarNav = ({
  currentView,
  onNavigate,
  isDarkMode,
  onToggleTheme,
  onShowOnboarding,
  onShowSettings,
  apiBase,
}) => {
  return (
    <div
      className={`fixed left-0 top-0 h-full w-64 ${isDarkMode ? 'bg-black border-gray-800' : 'bg-white border-gray-200'
        } border-r p-6 shadow-lg`}
    >
      <div className="flex items-center gap-3 mb-8">
        <div className="w-10 h-10 flex items-center justify-center">
          <OrbitLogo size={40} className="text-blue-500 dark:text-blue-400" />
        </div>
        <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          Orbit
        </h1>
      </div>

      <nav className="space-y-2">
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${currentView === item.id
              ? 'bg-primary/20 text-primary font-semibold'
              : isDarkMode
                ? 'text-gray-300 hover:bg-gray-900'
                : 'text-gray-700 hover:bg-gray-100'
              }`}
          >
            <item.icon size={20} />
            {item.label}
          </button>
        ))}
      </nav>

      <div className="mb-4 px-2">
        <DatabaseStatus apiBase={apiBase} />
      </div>

      <div className="absolute bottom-6 left-6 right-6 space-y-2">
        <button
          onClick={onToggleTheme}
          className={`w-full flex items-center gap-3 px-4 py-3 ${isDarkMode ? 'text-gray-300 hover:bg-gray-900' : 'text-gray-600 hover:bg-gray-100'
            } rounded-xl transition-all`}
        >
          {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
          {isDarkMode ? 'Light Mode' : 'Dark Mode'}
        </button>
        <button
          onClick={onShowOnboarding}
          className={`w-full flex items-center gap-3 px-4 py-3 ${isDarkMode ? 'text-gray-300 hover:bg-gray-900' : 'text-gray-600 hover:bg-gray-100'
            } rounded-xl transition-all`}
        >
          <Sparkles size={20} />
          Setup Templates
        </button>
        <button
          onClick={onShowSettings}
          className={`w-full flex items-center gap-3 px-4 py-3 ${isDarkMode ? 'text-gray-300 hover:bg-gray-900' : 'text-gray-600 hover:bg-gray-100'
            } rounded-xl transition-all`}
        >
          <Settings size={20} />
          Settings
        </button>
      </div>
    </div>
  );
};

export default SidebarNav;
