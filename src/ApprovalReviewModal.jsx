import React, { useState } from 'react';
import { X, CheckCircle, XCircle } from 'lucide-react';

const PLATFORM_COLORS = {
  twitter: 'bg-sky-100 text-sky-700',
  instagram: 'bg-pink-100 text-pink-700',
  linkedin: 'bg-blue-100 text-blue-700',
  facebook: 'bg-indigo-100 text-indigo-700',
  tiktok: 'bg-purple-100 text-purple-700',
  youtube: 'bg-red-100 text-red-700',
  email: 'bg-gray-100 text-gray-700',
  other: 'bg-gray-100 text-gray-700',
};

const ApprovalReviewModal = ({ approval, onClose, onApprove, onReject }) => {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const platformColor = PLATFORM_COLORS[approval?.platform] || PLATFORM_COLORS.other;
  const submittedDate = approval?.created_at
    ? new Date(approval.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })
    : '—';

  const handleApprove = async () => {
    setSubmitting(true);
    try {
      await onApprove();
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const handleReject = async () => {
    if (!feedback.trim()) return;
    setSubmitting(true);
    try {
      await onReject(feedback.trim());
      onClose();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-surface-dark rounded-card shadow-card-hover w-full max-w-lg animate-slideUp">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-border-dark">
          <h2 className="text-h3 font-bold text-text">Review Post</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-control text-mutedText hover:text-text hover:bg-surface2 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          {/* Platform + Campaign */}
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-semibold capitalize ${platformColor}`}>
              {approval?.platform || 'Unknown'}
            </span>
            {approval?.campaign_name && (
              <span className="text-xs text-mutedText">{approval.campaign_name}</span>
            )}
          </div>

          {/* Content */}
          <div className="bg-surface2 dark:bg-surface2-dark rounded-control p-4 text-sm text-text leading-relaxed">
            {approval?.content || <span className="text-mutedText italic">No content</span>}
          </div>

          {/* Meta */}
          <div className="text-xs text-mutedText">
            Submitted {submittedDate}
            {approval?.submitted_by && ` by ${approval.submitted_by}`}
          </div>

          {/* Feedback textarea (shown when rejecting) */}
          {showFeedback && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-text">Feedback (required)</label>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="Describe the changes needed..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 dark:border-border-dark rounded-control text-sm text-text bg-white dark:bg-surface-dark focus:outline-none focus:border-primary resize-none"
              />
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-border-dark">
          {!showFeedback ? (
            <>
              <button
                onClick={() => setShowFeedback(true)}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 rounded-control text-sm font-medium text-danger border border-danger/40 hover:bg-danger/10 transition-colors"
              >
                <XCircle size={16} />
                Request Changes
              </button>
              <button
                onClick={handleApprove}
                disabled={submitting}
                className="flex items-center gap-2 px-4 py-2 rounded-control text-sm font-medium bg-success text-white hover:bg-success/90 transition-colors"
              >
                <CheckCircle size={16} />
                Approve
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => { setShowFeedback(false); setFeedback(''); }}
                disabled={submitting}
                className="px-4 py-2 rounded-control text-sm font-medium text-mutedText hover:text-text transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleReject}
                disabled={submitting || !feedback.trim()}
                className="flex items-center gap-2 px-4 py-2 rounded-control text-sm font-medium bg-danger text-white hover:bg-danger/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <XCircle size={16} />
                Send Feedback
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApprovalReviewModal;
