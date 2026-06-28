import React from 'react';
import {
  LayoutDashboard,
  Folder,
  Lightbulb,
  Calendar,
  Users,
  Send,
  Newspaper,
  BarChart3,
  ChevronDown,
  Settings,
} from 'lucide-react';
import { VIEWS } from '../routes.js';
import { Avatar } from './ui';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { id: VIEWS.DASHBOARD, icon: LayoutDashboard, label: 'Dashboard' },
  { id: VIEWS.CAMPAIGNS, icon: Folder, label: 'Campaigns' },
  { id: VIEWS.IDEAS, icon: Lightbulb, label: 'Ideas' },
  { id: VIEWS.POSTS, icon: Calendar, label: 'Posts' },
  { id: VIEWS.CONTACTS, icon: Users, label: 'Contacts' },
  { id: VIEWS.OUTREACH, icon: Send, label: 'Outreach' },
  { id: VIEWS.COVERAGE, icon: Newspaper, label: 'Coverage' },
  { id: VIEWS.REPORTS, icon: BarChart3, label: 'Reports' },
];

const SidebarNav = ({ currentView, onNavigate, onShowSettings }) => {
  const { user, currentWorkspace } = useAuth();

  const email = user?.email ?? '';
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || email || 'User';
  const workspaceName = currentWorkspace?.name || 'Personal';

  return (
    <div className="fixed left-0 top-0 h-full w-60 bg-[var(--color-sidebar)] flex flex-col z-50">
      {/* Logo */}
      <div className="px-6 py-6 flex items-center gap-2.5">
        <div className="w-7 h-7 rounded-full bg-ds-accent flex items-center justify-center">
          <div className="w-3 h-3 rounded-full bg-white" />
        </div>
        <span className="text-white text-lg font-bold tracking-tight">orbit</span>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer ${
                isActive
                  ? 'text-white border border-ds-accent bg-[rgba(34,197,94,0.15)]'
                  : 'text-[#9CA3AF] hover:text-white hover:bg-[rgba(255,255,255,0.05)] border border-transparent'
              }`}
            >
              <item.icon size={18} strokeWidth={2} />
              {item.label}
            </button>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-3 mb-2">
        <button
          onClick={onShowSettings}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-[#9CA3AF] hover:text-white hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-150 cursor-pointer"
        >
          <Settings size={18} strokeWidth={2} />
          Settings
        </button>
      </div>

      {/* User block */}
      <div className="px-3 pb-4">
        <div className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-[rgba(255,255,255,0.05)] transition-colors duration-150 cursor-pointer">
          <Avatar name={name} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-white truncate">{name}</div>
            <div className="text-xs text-[#9CA3AF] truncate">{workspaceName}</div>
          </div>
          <ChevronDown size={14} className="text-[#9CA3AF] shrink-0" />
        </div>
      </div>
    </div>
  );
};

export default SidebarNav;
