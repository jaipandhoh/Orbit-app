import React, { useState } from 'react';
import { Plus, Trash2, Edit2, CheckCircle, AlertCircle, Zap } from 'lucide-react';

const ApprovalRulesSettings = ({ rules = [], onSave, onDelete }) => {
  const [editingRule, setEditingRule] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const ruleTypes = [
    { value: 'single_approver', label: 'Single Approver', icon: CheckCircle },
    { value: 'multi_stage', label: 'Multi-Stage', icon: AlertCircle },
    { value: 'auto_approve', label: 'Auto-Approve', icon: Zap },
    { value: 'emergency_bypass', label: 'Emergency Bypass', icon: Zap },
  ];

  const defaultRule = {
    name: '',
    description: '',
    rule_type: 'single_approver',
    condition_platform: '',
    condition_content_type: '',
    condition_priority: '',
    condition_campaign_id: '',
    stages_json: null,
    auto_approve_enabled: false,
    auto_approve_conditions_json: null,
    emergency_bypass_enabled: false,
    emergency_bypass_roles_json: null,
    priority_order: 100,
    is_active: true,
  };

  const handleSubmit = (ruleData) => {
    if (onSave) {
      onSave(ruleData);
    }
    setShowForm(false);
    setEditingRule(null);
  };

  const RuleForm = ({ rule, onCancel }) => {
    const [formData, setFormData] = useState(rule || defaultRule);

    return (
      <div className="card mb-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-h3 font-semibold text-text">
            {rule ? 'Edit Rule' : 'New Approval Rule'}
          </h3>
          <button onClick={onCancel} className="text-mutedText hover:text-text">
            Cancel
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-body font-medium text-text mb-2">Rule Name *</label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full bg-surface2 border border-border rounded-control px-4 py-2 text-text"
              placeholder="e.g., Editor Approval Only"
            />
          </div>

          <div>
            <label className="block text-body font-medium text-text mb-2">Description</label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={2}
              className="w-full bg-surface2 border border-border rounded-control px-4 py-2 text-text resize-none"
              placeholder="When this rule applies..."
            />
          </div>

          <div>
            <label className="block text-body font-medium text-text mb-2">Rule Type *</label>
            <select
              value={formData.rule_type}
              onChange={(e) => setFormData({ ...formData, rule_type: e.target.value })}
              className="w-full bg-surface2 border border-border rounded-control px-4 py-2 text-text"
            >
              {ruleTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Conditions */}
          <div className="border-t border-border pt-4">
            <h4 className="text-body font-semibold text-text mb-3">Apply When:</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-small text-mutedText mb-2">Platform</label>
                <select
                  value={formData.condition_platform || ''}
                  onChange={(e) => setFormData({ ...formData, condition_platform: e.target.value || null })}
                  className="w-full bg-surface2 border border-border rounded-control px-4 py-2 text-text"
                >
                  <option value="">Any Platform</option>
                  <option value="instagram">Instagram</option>
                  <option value="tiktok">TikTok</option>
                  <option value="email">Email</option>
                  <option value="website">Website</option>
                </select>
              </div>

              <div>
                <label className="block text-small text-mutedText mb-2">Priority</label>
                <select
                  value={formData.condition_priority || ''}
                  onChange={(e) => setFormData({ ...formData, condition_priority: e.target.value || null })}
                  className="w-full bg-surface2 border border-border rounded-control px-4 py-2 text-text"
                >
                  <option value="">Any Priority</option>
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>
            </div>
          </div>

          {/* Auto-approve settings */}
          {formData.rule_type === 'auto_approve' && (
            <div className="border-t border-border pt-4">
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={formData.auto_approve_enabled}
                  onChange={(e) => setFormData({ ...formData, auto_approve_enabled: e.target.checked })}
                  className="w-5 h-5 rounded border-border bg-surface2 text-primary"
                />
                <span className="text-body text-text">Enable Auto-Approve</span>
              </label>
              {formData.auto_approve_enabled && (
                <p className="text-small text-mutedText">
                  Requests matching conditions will be automatically approved
                </p>
              )}
            </div>
          )}

          {/* Emergency bypass settings */}
          {formData.rule_type === 'emergency_bypass' && (
            <div className="border-t border-border pt-4">
              <label className="flex items-center gap-2 mb-3">
                <input
                  type="checkbox"
                  checked={formData.emergency_bypass_enabled}
                  onChange={(e) => setFormData({ ...formData, emergency_bypass_enabled: e.target.checked })}
                  className="w-5 h-5 rounded border-border bg-surface2 text-primary"
                />
                <span className="text-body text-text">Enable Emergency Bypass</span>
              </label>
              {formData.emergency_bypass_enabled && (
                <p className="text-small text-mutedText">
                  Selected roles can bypass normal approval for time-sensitive content
                </p>
              )}
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
            <button onClick={onCancel} className="btn-secondary">
              Cancel
            </button>
            <button
              onClick={() => handleSubmit(formData)}
              className="btn-primary"
            >
              {rule ? 'Update Rule' : 'Create Rule'}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-h2 font-bold text-text">Approval Rules & Roles</h2>
          <p className="text-mutedText mt-1">Configure flexible approval workflows</p>
        </div>
        <button
          onClick={() => {
            setEditingRule(null);
            setShowForm(true);
          }}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} />
          New Rule
        </button>
      </div>

      {showForm && (
        <RuleForm
          rule={editingRule}
          onCancel={() => {
            setShowForm(false);
            setEditingRule(null);
          }}
        />
      )}

      {/* Rules List */}
      <div className="space-y-4">
        {rules.length === 0 ? (
          <div className="card text-center py-12">
            <p className="text-mutedText">No approval rules configured</p>
            <p className="text-small text-mutedText mt-2">
              Create your first rule to get started
            </p>
          </div>
        ) : (
          rules.map((rule) => (
            <div key={rule.rule_id} className="card">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-h3 font-semibold text-text">{rule.name}</h3>
                    <span className={`badge-status ${
                      rule.rule_type === 'auto_approve' ? 'badge-success' :
                      rule.rule_type === 'emergency_bypass' ? 'badge-warning' :
                      'badge-primary'
                    }`}>
                      {ruleTypes.find(t => t.value === rule.rule_type)?.label}
                    </span>
                    {!rule.is_active && (
                      <span className="badge-status bg-surface2 text-mutedText">Inactive</span>
                    )}
                  </div>
                  {rule.description && (
                    <p className="text-body text-mutedText mb-3">{rule.description}</p>
                  )}
                  <div className="flex items-center gap-4 text-small text-mutedText">
                    {rule.condition_platform && (
                      <span>Platform: {rule.condition_platform}</span>
                    )}
                    {rule.condition_priority && (
                      <span>Priority: {rule.condition_priority}</span>
                    )}
                    {rule.auto_approve_enabled && (
                      <span className="text-success">Auto-approve enabled</span>
                    )}
                    {rule.emergency_bypass_enabled && (
                      <span className="text-warning">Emergency bypass enabled</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setEditingRule(rule);
                      setShowForm(true);
                    }}
                    className="p-2 text-mutedText hover:text-text transition-colors"
                  >
                    <Edit2 size={18} />
                  </button>
                  {onDelete && (
                    <button
                      onClick={() => onDelete(rule.rule_id)}
                      className="p-2 text-mutedText hover:text-danger transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ApprovalRulesSettings;




