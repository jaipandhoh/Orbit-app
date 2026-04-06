import React, { useState } from 'react';
import {
  User, Building2, Bell, Palette, Plug, Shield, HelpCircle,
  LogOut, Sun, Moon, Check, Globe, AlertTriangle, Zap, Clock, MessageSquare,
  CheckCircle, XCircle,
} from 'lucide-react';
import { useAuth } from './context/AuthContext';
import ApprovalRulesSettings from './ApprovalRulesSettings.jsx';
import WorkspaceSettings from './pages/WorkspaceSettings.jsx';

// ── Sidebar tab definitions ────────────────────────────────────────────────
const TABS = [
  { id: 'profile',       label: 'Profile',        icon: User },
  { id: 'workspace',     label: 'Workspace',       icon: Building2 },
  { id: 'notifications', label: 'Notifications',   icon: Bell },
  { id: 'appearance',    label: 'Appearance',      icon: Palette },
  { id: 'integrations',  label: 'Integrations',    icon: Plug },
  { id: 'approvals',     label: 'Approvals',       icon: Shield },
];

// ── Shared primitives ──────────────────────────────────────────────────────
const SectionHeader = ({ title, description }) => (
  <div className="mb-6 pb-4 border-b border-border dark:border-gray-800">
    <h2 className="text-xl font-semibold text-text">{title}</h2>
    {description && <p className="mt-1 text-sm text-mutedText">{description}</p>}
  </div>
);

const SettingsRow = ({ label, description, action, danger = false }) => (
  <div className="flex items-center justify-between gap-6 py-4 border-b border-border dark:border-gray-800 last:border-b-0">
    <div className="flex-1">
      <div className={`text-sm font-medium ${danger ? 'text-danger' : 'text-text'}`}>{label}</div>
      {description && <div className="text-xs text-mutedText mt-0.5">{description}</div>}
    </div>
    <div className="shrink-0">{action}</div>
  </div>
);

const Toggle = ({ checked, onChange, disabled = false }) => (
  <button
    role="switch"
    aria-checked={checked}
    onClick={() => !disabled && onChange(!checked)}
    disabled={disabled}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary/50 ${
      checked ? 'bg-primary' : 'bg-gray-300 dark:bg-gray-600'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${
        checked ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

// ── PROFILE TAB ────────────────────────────────────────────────────────────
const ProfileTab = ({ onSignOut }) => {
  const { user, currentWorkspace } = useAuth();
  const [signingOut, setSigningOut] = useState(false);

  const email = user?.email ?? '';
  const name = user?.user_metadata?.full_name || user?.user_metadata?.name || '';
  const initial = (name || email)?.[0]?.toUpperCase() ?? 'U';
  const provider = user?.app_metadata?.provider ?? 'email';

  const providerLabel = {
    google: 'Google',
    azure: 'Microsoft',
    email: 'Email / Password',
  }[provider] ?? provider;

  const handleSignOut = async () => {
    setSigningOut(true);
    await onSignOut();
  };

  return (
    <div>
      <SectionHeader
        title="Profile"
        description="Your personal account information."
      />

      {/* Avatar + name block */}
      <div className="flex items-center gap-5 mb-8 p-5 rounded-2xl bg-surface2 dark:bg-surface2-dark border border-border dark:border-gray-800">
        <div className="relative group">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center text-white text-2xl font-bold select-none">
            {initial}
          </div>
          {/* Future: avatar upload */}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-base font-semibold text-text truncate">{name || 'Unnamed User'}</p>
          <p className="text-sm text-mutedText truncate">{email}</p>
          <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary font-medium">
            {currentWorkspace?.my_role ?? 'member'}
            {currentWorkspace ? ` · ${currentWorkspace.name}` : ''}
          </span>
        </div>
      </div>

      <SettingsRow
        label="Email address"
        description={email}
        action={<span className="text-xs text-mutedText">Managed via {providerLabel}</span>}
      />
      <SettingsRow
        label="Sign-in method"
        description={`You signed in with ${providerLabel}`}
        action={
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
            provider !== 'email'
              ? 'bg-primary/10 text-primary'
              : 'bg-surface2 dark:bg-surface2-dark text-mutedText border border-border dark:border-gray-700'
          }`}>
            {providerLabel}
          </span>
        }
      />

      {/* Sign out */}
      <div className="mt-8 pt-6 border-t border-border dark:border-gray-800">
        <button
          onClick={handleSignOut}
          disabled={signingOut}
          className="flex items-center gap-2 px-4 py-2 rounded-control text-sm font-medium text-danger border border-danger/30 hover:bg-danger/5 transition-colors disabled:opacity-50"
        >
          <LogOut size={16} />
          {signingOut ? 'Signing out…' : 'Sign out'}
        </button>
        <p className="mt-2 text-xs text-mutedText">You will be redirected to the login page.</p>
      </div>
    </div>
  );
};

// ── NOTIFICATIONS TAB ──────────────────────────────────────────────────────
const NOTIF_DEFAULTS = {
  urgent_requests: true,
  approval_required: true,
  content_approved: true,
  deadline_approaching: true,
  new_request: false,
  campaign_status: false,
};

const NotificationsTab = () => {
  const storageKey = 'orbit_notif_prefs';
  const saved = (() => {
    try { return JSON.parse(localStorage.getItem(storageKey)) ?? {}; } catch { return {}; }
  })();
  const [prefs, setPrefs] = useState({ ...NOTIF_DEFAULTS, ...saved });

  const update = (key, val) => {
    const next = { ...prefs, [key]: val };
    setPrefs(next);
    localStorage.setItem(storageKey, JSON.stringify(next));
  };

  const rows = [
    {
      key: 'urgent_requests',
      label: 'Urgent requests',
      description: 'Get alerted when a new request is marked urgent.',
      icon: AlertTriangle,
    },
    {
      key: 'approval_required',
      label: 'Approval required',
      description: 'Notify you when content is waiting for your approval.',
      icon: CheckCircle,
    },
    {
      key: 'content_approved',
      label: 'Content approved',
      description: 'Alert when your submitted content gets approved.',
      icon: Zap,
    },
    {
      key: 'deadline_approaching',
      label: 'Deadline reminders',
      description: 'Warn you 24 hours before a campaign or deliverable deadline.',
      icon: Clock,
    },
    {
      key: 'new_request',
      label: 'New request submitted',
      description: 'Notify when any new request enters the inbox.',
      icon: MessageSquare,
    },
    {
      key: 'campaign_status',
      label: 'Campaign status changes',
      description: 'Alert when a campaign moves to a new phase or status.',
      icon: Globe,
    },
  ];

  return (
    <div>
      <SectionHeader
        title="Notifications"
        description="Choose what you want to be notified about."
      />

      <div className="mb-4 flex items-center gap-2 px-3 py-2.5 rounded-control bg-warning/10 text-warning text-xs">
        <Bell size={14} className="shrink-0" />
        Email delivery requires server configuration. Browser alerts work immediately.
      </div>

      <div className="space-y-1">
        {rows.map(({ key, label, description, icon: Icon }) => (
          <SettingsRow
            key={key}
            label={
              <span className="flex items-center gap-2">
                <Icon size={14} className="text-mutedText shrink-0" />
                {label}
              </span>
            }
            description={description}
            action={<Toggle checked={prefs[key]} onChange={(v) => update(key, v)} />}
          />
        ))}
      </div>
    </div>
  );
};

// ── APPEARANCE TAB ─────────────────────────────────────────────────────────
const AppearanceTab = ({ isDarkMode, onToggleTheme }) => {
  const densityKey = 'orbit_density';
  const [density, setDensity] = useState(localStorage.getItem(densityKey) ?? 'comfortable');

  const handleDensity = (val) => {
    setDensity(val);
    localStorage.setItem(densityKey, val);
  };

  return (
    <div>
      <SectionHeader
        title="Appearance"
        description="Personalize how Orbit looks and feels."
      />

      {/* Theme picker */}
      <div className="mb-6">
        <p className="text-sm font-medium text-text mb-3">Theme</p>
        <div className="flex gap-3">
          {[
            { value: false, label: 'Light', icon: Sun },
            { value: true, label: 'Dark', icon: Moon },
          ].map(({ value, label, icon: Icon }) => {
            const active = isDarkMode === value;
            return (
              <button
                key={label}
                onClick={() => isDarkMode !== value && onToggleTheme()}
                className={`flex-1 flex flex-col items-center gap-2 py-4 rounded-2xl border-2 transition-all ${
                  active
                    ? 'border-primary bg-primary/10'
                    : 'border-border dark:border-gray-700 hover:border-primary/50'
                }`}
              >
                <Icon size={20} className={active ? 'text-primary' : 'text-mutedText'} />
                <span className={`text-sm font-medium ${active ? 'text-primary' : 'text-text'}`}>{label}</span>
                {active && <Check size={14} className="text-primary" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Density */}
      <div>
        <p className="text-sm font-medium text-text mb-1">Content density</p>
        <p className="text-xs text-mutedText mb-3">Controls spacing and padding across the app.</p>
        <div className="flex gap-2">
          {['compact', 'comfortable', 'spacious'].map((d) => (
            <button
              key={d}
              onClick={() => handleDensity(d)}
              className={`px-4 py-2 rounded-control text-sm border transition-colors capitalize ${
                density === d
                  ? 'border-primary bg-primary/10 text-primary font-medium'
                  : 'border-border dark:border-gray-700 text-mutedText hover:text-text'
              }`}
            >
              {d}
            </button>
          ))}
        </div>
        <p className="mt-2 text-xs text-mutedText">Density preference is saved locally. Full support coming soon.</p>
      </div>
    </div>
  );
};

// ── INTEGRATIONS TAB ───────────────────────────────────────────────────────
const IntegrationsTab = ({ geminiConfigured, apiBase }) => (
  <div>
    <SectionHeader
      title="Integrations"
      description="Manage AI and backend connectivity."
    />

    <div className="space-y-4">
      {/* Gemini AI */}
      <div className="p-4 rounded-2xl border border-border dark:border-gray-800">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text">Google Gemini AI</p>
              <p className="text-xs text-mutedText">Powers AI-assisted campaign planning and content generation.</p>
            </div>
          </div>
          <span className={`shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${
            geminiConfigured
              ? 'bg-success/15 text-success'
              : 'bg-warning/15 text-warning'
          }`}>
            {geminiConfigured ? <CheckCircle size={12} /> : <XCircle size={12} />}
            {geminiConfigured ? 'Connected' : 'Not configured'}
          </span>
        </div>
        {!geminiConfigured && (
          <div className="mt-3 p-3 rounded-xl bg-warning/5 border border-warning/20 text-xs text-warning">
            Set <code className="font-mono bg-warning/10 px-1 rounded">GEMINI_API_KEY</code> in your <code className="font-mono bg-warning/10 px-1 rounded">.env</code> file to enable AI features.
          </div>
        )}
      </div>

      {/* API Base */}
      <div className="p-4 rounded-2xl border border-border dark:border-gray-800">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center">
              <Globe size={18} className="text-white" />
            </div>
            <div>
              <p className="text-sm font-semibold text-text">Backend API</p>
              <p className="text-xs text-mutedText font-mono">{apiBase}</p>
            </div>
          </div>
          <span className="shrink-0 flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-success/15 text-success">
            <CheckCircle size={12} /> Active
          </span>
        </div>
      </div>

      {/* Future integrations */}
      <div className="p-4 rounded-2xl border border-dashed border-border dark:border-gray-700 text-center">
        <p className="text-sm text-mutedText">More integrations coming soon (Slack, HubSpot, Mailchimp).</p>
      </div>
    </div>
  </div>
);

// ── MAIN SETTINGS PAGE ─────────────────────────────────────────────────────
const SettingsPage = ({
  isDarkMode,
  onToggleTheme,
  geminiConfigured,
  approvalRules,
  onSaveApprovalRule,
  onDeleteApprovalRule,
  onRefreshData,
  loading,
  apiBase,
  onNavigateHelp,
}) => {
  const { signOut } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');

  return (
    <div className="animate-fadeIn">
      <div className="mb-6">
        <h1 className="text-h1 font-bold text-text">Settings</h1>
        <p className="text-mutedText">Manage your account, workspace, and preferences.</p>
      </div>

      <div className="flex gap-6 items-start">
        {/* ── Left Sidebar ── */}
        <nav className="w-52 shrink-0 sticky top-24 space-y-0.5">
          {TABS.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-control text-sm font-medium transition-colors text-left ${
                activeTab === id
                  ? 'bg-primary/10 text-primary'
                  : 'text-mutedText hover:text-text hover:bg-surface2 dark:hover:bg-surface2-dark'
              }`}
            >
              <Icon size={16} className="shrink-0" />
              {label}
            </button>
          ))}

          <div className="pt-4 mt-4 border-t border-border dark:border-gray-800 space-y-0.5">
            {onNavigateHelp && (
              <button
                onClick={onNavigateHelp}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-control text-sm font-medium text-mutedText hover:text-text hover:bg-surface2 dark:hover:bg-surface2-dark transition-colors"
              >
                <HelpCircle size={16} className="shrink-0" />
                Help & Tutorials
              </button>
            )}
          </div>
        </nav>

        {/* ── Content Panel ── */}
        <div className="flex-1 min-w-0 card p-6 border border-border dark:border-gray-800">
          {activeTab === 'profile' && (
            <ProfileTab onSignOut={signOut} />
          )}
          {activeTab === 'workspace' && (
            <div>
              <SectionHeader
                title="Workspace"
                description="Manage your workspace members and settings."
              />
              <WorkspaceSettings />
            </div>
          )}
          {activeTab === 'notifications' && (
            <NotificationsTab />
          )}
          {activeTab === 'appearance' && (
            <AppearanceTab isDarkMode={isDarkMode} onToggleTheme={onToggleTheme} />
          )}
          {activeTab === 'integrations' && (
            <IntegrationsTab geminiConfigured={geminiConfigured} apiBase={apiBase} />
          )}
          {activeTab === 'approvals' && (
            <div>
              <SectionHeader
                title="Approvals"
                description="Define automated approval rules for incoming requests."
              />
              <div className="flex justify-end mb-4">
                <button
                  className="btn-secondary text-sm"
                  onClick={onRefreshData}
                  disabled={loading}
                >
                  {loading ? 'Refreshing…' : 'Refresh rules'}
                </button>
              </div>
              <ApprovalRulesSettings
                rules={approvalRules}
                onSave={onSaveApprovalRule}
                onDelete={onDeleteApprovalRule}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
