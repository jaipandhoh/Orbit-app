import React from 'react';
import ApprovalRulesSettings from './ApprovalRulesSettings.jsx';

const SettingsSection = ({ title, description, children }) => {
  return (
    <section className="card p-6 border border-border dark:border-gray-800">
      <div className="mb-4">
        <h2 className="text-h3 font-semibold text-text">{title}</h2>
        {description && <p className="text-mutedText">{description}</p>}
      </div>
      {children}
    </section>
  );
};

const SettingsRow = ({ label, description, action }) => {
  return (
    <div className="flex items-start justify-between gap-6 py-3 border-b border-border last:border-b-0">
      <div>
        <div className="text-text font-medium">{label}</div>
        {description && <div className="text-sm text-mutedText">{description}</div>}
      </div>
      <div className="shrink-0">{action}</div>
    </div>
  );
};

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
}) => {
  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-h1 font-bold text-text">Settings</h1>
          <p className="text-mutedText">Manage appearance, automation, and integrations.</p>
        </div>
        <button
          className="btn-secondary"
          onClick={onRefreshData}
          disabled={loading}
        >
          {loading ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>

      <SettingsSection
        title="Appearance"
        description="Personalize how Orbit looks and feels."
      >
        <SettingsRow
          label="Theme"
          description={isDarkMode ? 'Dark mode is enabled.' : 'Light mode is enabled.'}
          action={
            <button className="btn-secondary" onClick={onToggleTheme}>
              {isDarkMode ? 'Switch to Light' : 'Switch to Dark'}
            </button>
          }
        />
      </SettingsSection>

      <SettingsSection
        title="Integrations"
        description="Configure AI and backend connectivity."
      >
        <SettingsRow
          label="Gemini AI"
          description={
            geminiConfigured
              ? 'Gemini is configured and ready to use.'
              : 'Gemini is not configured. Set VITE_GEMINI_API_KEY to enable AI.'
          }
          action={
            <span className={`px-3 py-1 rounded-full text-sm ${geminiConfigured ? 'bg-success/20 text-success' : 'bg-warning/20 text-warning'}`}>
              {geminiConfigured ? 'Connected' : 'Needs setup'}
            </span>
          }
        />
        <SettingsRow
          label="API Base"
          description={`Using ${apiBase} for backend requests.`}
          action={<span className="text-sm text-mutedText">Configured</span>}
        />
      </SettingsSection>

      <SettingsSection
        title="Approvals"
        description="Define automated approval rules for requests."
      >
        <ApprovalRulesSettings
          rules={approvalRules}
          onSave={onSaveApprovalRule}
          onDelete={onDeleteApprovalRule}
        />
      </SettingsSection>
    </div>
  );
};

export default SettingsPage;
