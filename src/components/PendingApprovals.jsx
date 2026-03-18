import React, { useState, useEffect } from 'react';
import { Check, X, MessageSquare, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';

const PendingApprovals = ({ onClose }) => {
    const [approvals, setApprovals] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'history'

    useEffect(() => {
        fetchApprovals();
    }, []);

    const fetchApprovals = async () => {
        try {
            setLoading(true);
            const res = await fetch('/api/approvals/pending');
            if (!res.ok) throw new Error('Failed to fetch approvals');
            const data = await res.json();
            setApprovals(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (approval, action, feedback = null) => {
        try {
            const endpoint = action === 'approve' ? 'approve' : 'reject';
            const body = { type: approval.approval_type };
            if (feedback) body.feedback = feedback;

            const res = await fetch(`/api/approvals/${approval.target_id}/${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(body),
            });

            if (!res.ok) throw new Error(`Failed to ${action}`);

            // Remove from list optimistically
            setApprovals(prev => prev.filter(a => a.approval_id !== approval.approval_id));

            // TODO: Add toast notification here
            console.log(`Successfully ${action}d ${approval.approval_type}`);
        } catch (err) {
            console.error(err);
            alert(err.message);
        }
    };

    return (
        <div className="bg-surface border border-border rounded-card overflow-hidden mt-6 animate-fadeIn">
            <div className="p-6 border-b border-border flex items-center justify-between">
                <div>
                    <h2 className="text-h2 font-bold text-text flex items-center gap-2">
                        Pending Approvals
                        {approvals.length > 0 && (
                            <span className="bg-warning text-warning-contrast text-xs px-2 py-0.5 rounded-full">
                                {approvals.length}
                            </span>
                        )}
                    </h2>
                    <p className="text-mutedText mt-1">Review graphics and content before publishing</p>
                </div>
                <div className="flex gap-2">
                    <button
                        className={`px-4 py-2 rounded-control text-small font-medium transition-colors ${activeTab === 'pending' ? 'bg-primary text-primary-contrast' : 'bg-surface2 text-text hover:bg-surface3'}`}
                        onClick={() => setActiveTab('pending')}
                    >
                        Requires Action
                    </button>
                    <button
                        className={`px-4 py-2 rounded-control text-small font-medium transition-colors ${activeTab === 'history' ? 'bg-primary text-primary-contrast' : 'bg-surface2 text-text hover:bg-surface3'}`}
                        onClick={() => setActiveTab('history')}
                    >
                        History
                    </button>
                </div>
            </div>

            <div className="p-6">
                {loading ? (
                    <div className="text-center py-12 text-mutedText">Loading approvals...</div>
                ) : error ? (
                    <div className="text-center py-12 text-error flex flex-col items-center">
                        <AlertCircle className="mb-2" size={32} />
                        <p>{error}</p>
                    </div>
                ) : approvals.length === 0 ? (
                    <div className="text-center py-12 text-mutedText">
                        <div className="bg-surface2 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Check className="text-success" size={32} />
                        </div>
                        <p className="font-medium text-text">You're all caught up!</p>
                        <p className="text-small mt-1">No pending approvals require your attention.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {approvals.map((approval) => (
                            <ApprovalCard
                                key={approval.approval_id}
                                approval={approval}
                                onAction={handleAction}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const ApprovalCard = ({ approval, onAction }) => {
    const [feedback, setFeedback] = useState('');
    const [isRejecting, setIsRejecting] = useState(false);

    return (
        <div className="relative group bg-surface2 border border-border rounded-card overflow-hidden flex flex-col hover:border-primary/30 transition-all shadow-sm hover:shadow-md">
            {/* Mock Image Area - In a real app this would be the actual creative asset */}
            <div className="aspect-video bg-surface3 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-primary/10 to-transparent" />
                <span className="text-mutedText font-medium relative z-10 flex items-center gap-2">
                    No Asset Uploaded
                </span>
                <div className="absolute top-3 left-3 flex gap-2">
                    <span className="badge-primary shadow-sm capitalize">{approval.platform}</span>
                    <span className="bg-black/50 backdrop-blur-md text-white px-2 py-0.5 rounded text-xs">
                        {approval.approval_type}
                    </span>
                </div>
            </div>

            <div className="p-5 flex-1 flex flex-col">
                <div className="mb-4 flex-1">
                    <p className="text-small text-mutedText mb-1 flex items-center justify-between">
                        <span>{approval.campaign_name || 'No Campaign'}</span>
                        <span>{format(new Date(approval.created_at), 'MMM d, h:mm a')}</span>
                    </p>
                    <div className="bg-surface p-3 rounded-control border border-border text-small text-text line-clamp-4">
                        {approval.content || approval.description}
                    </div>
                </div>

                {isRejecting ? (
                    <div className="space-y-3 animate-fadeIn">
                        <textarea
                            value={feedback}
                            onChange={(e) => setFeedback(e.target.value)}
                            placeholder="What needs to be changed?"
                            className="input-field text-small min-h-[80px]"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <button
                                onClick={() => onAction(approval, 'reject', feedback)}
                                disabled={!feedback.trim()}
                                className="flex-1 btn-danger text-small py-2"
                            >
                                Send Feedback
                            </button>
                            <button
                                onClick={() => setIsRejecting(false)}
                                className="px-4 py-2 text-small font-medium text-mutedText hover:text-text bg-surface3 hover:bg-border rounded-control transition-colors"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                ) : (
                    <div className="flex gap-3">
                        <button
                            onClick={() => onAction(approval, 'approve')}
                            className="flex-1 bg-success/10 hover:bg-success/20 text-success border border-success/20 py-2.5 rounded-control font-semibold flexItems-center justify-center gap-2 transition-all"
                        >
                            <Check size={18} /> Approve
                        </button>
                        <button
                            onClick={() => setIsRejecting(true)}
                            className="flex-1 bg-error/10 hover:bg-error/20 text-error border border-error/20 py-2.5 rounded-control font-semibold flex items-center justify-center gap-2 transition-all"
                        >
                            <X size={18} /> Request Edits
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PendingApprovals;
