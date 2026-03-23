import React from 'react';
import { LayoutDashboard, Megaphone, Inbox, Trello, Calendar, Users, Sun, Moon, Settings, ListTodo } from 'lucide-react';
import { VIEWS } from '../routes.js';
import OrbitLogo from '../OrbitLogo';
import WorkspaceSwitcher from './WorkspaceSwitcher';

const NAV_LINKS = [
  { view: VIEWS.DASHBOARD, label: 'Dashboard', icon: LayoutDashboard },
  { view: VIEWS.CAMPAIGNS, label: 'Campaigns', icon: Megaphone },
  { view: VIEWS.INBOX, label: 'Inbox', icon: Inbox },
  { view: VIEWS.BOARD, label: 'Board', icon: Trello },
  { view: VIEWS.CALENDAR, label: 'Calendar', icon: Calendar },
  { view: VIEWS.CONTACTS, label: 'Contacts', icon: Users },
  { view: VIEWS.TODO, label: 'To-Do', icon: ListTodo },
];

const TopNav = ({ currentView, onNavigate, isDarkMode, onToggleTheme, onShowSettings }) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 z-40 bg-white dark:bg-surface-dark border-b border-gray-100 dark:border-border-dark flex items-center px-6 gap-6 shadow-sm">
      {/* Logo */}
      <button
        onClick={() => onNavigate(VIEWS.DASHBOARD)}
        className="flex items-center gap-2 flex-shrink-0 mr-4 group"
      >
        <OrbitLogo size={32} className="text-primary transition-transform group-hover:scale-110" />
        <span className="font-bold text-lg bg-gradient-to-r from-primary to-purple-500 bg-clip-text text-transparent">
          Orbit
        </span>
      </button>

      <div className="mr-6 border-l border-gray-200 dark:border-border-dark pl-6">
        <WorkspaceSwitcher />
      </div>

      {/* Nav links */}
      <nav className="flex items-center gap-1 flex-1">
        {NAV_LINKS.map(({ view, label, icon: Icon }) => {
          const isActive = currentView === view;
          return (
            <button
              key={view}
              onClick={() => onNavigate(view)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-control text-sm font-medium transition-colors ${isActive
                  ? 'text-primary bg-primary/10'
                  : 'text-mutedText hover:text-text hover:bg-surface2 dark:hover:bg-surface2-dark'
                }`}
            >
              <Icon size={15} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Right controls */}
      <div className="flex items-center gap-2 flex-shrink-0">
        <button
          onClick={onToggleTheme}
          className="p-2 rounded-control text-mutedText hover:text-text hover:bg-surface2 dark:hover:bg-surface2-dark transition-colors"
          title={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <button
          onClick={onShowSettings}
          className="p-2 rounded-control text-mutedText hover:text-text hover:bg-surface2 dark:hover:bg-surface2-dark transition-colors"
          title="Settings"
        >
          <Settings size={18} />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-sm font-bold ml-1">
          U
        </div>
      </div>
    </header>
  );
};

export default TopNav;
