import React, { useState } from 'react';
import { Send, CheckCircle, User, Building2 } from 'lucide-react';
import OrbitLogo from './OrbitLogo';

const PublicRequestView = () => {
    const urlParams = new URLSearchParams(window.location.search);
    const teamId = urlParams.get('team');

    const [formData, setFormData] = useState({
        title: '',
        description: '',
        platform: 'instagram',
        content_type: 'feed_post',
        priority: 'normal',
        deadline_at: '',
        requester_name: '',
        requester_email: '',
        department_name: '',
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState(null);

    const getContentTypesForPlatform = (platform) => {
        const types = {
            instagram: ['feed_post', 'reel', 'story', 'carousel'],
            tiktok: ['reel'],
            email: ['email_blast'],
            website: ['web_update'],
            flyer: ['print'],
            other: ['other'],
        };
        return types[platform] || ['other'];
    };

    const contentTypes = getContentTypesForPlatform(formData.platform);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        const submitData = {
            title: formData.title,
            description: formData.description || null,
            platform: formData.platform,
            content_type: formData.content_type,
            priority: formData.priority,
            deadline_at: formData.deadline_at ? new Date(formData.deadline_at).toISOString() : null,
            requester_name: formData.requester_name,
            requester_email: formData.requester_email,
            department_name: formData.department_name,
            workspace_id: teamId,
        };

        try {
            const response = await fetch('/api/requests/public', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(submitData),
            });

            if (!response.ok) {
                const err = await response.json().catch(() => ({}));
                throw new Error(err.error || 'Failed to submit request.');
            }

            setIsSuccess(true);
        } catch (err) {
            console.error(err);
            setError(err.message || 'An unexpected error occurred.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const resetForm = () => {
        setIsSuccess(false);
        setFormData({
            title: '',
            description: '',
            platform: 'instagram',
            content_type: 'feed_post',
            priority: 'normal',
            deadline_at: '',
            requester_name: '',
            requester_email: '',
            department_name: '',
        });
    };

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-bg dark:bg-bg-dark flex items-center justify-center p-4">
                <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark p-8 rounded-card max-w-md w-full text-center animate-fadeIn shadow-xl">
                    <div className="w-16 h-16 bg-success/10 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="text-success" size={32} />
                    </div>
                    <h2 className="text-h2 font-bold text-text dark:text-white mb-2">Request Submitted!</h2>
                    <p className="text-mutedText mb-2">
                        Your request has been sent to the comms team. We'll review it shortly.
                    </p>
                    <p className="text-small text-mutedText mb-8">
                        Submitted by <strong className="text-text">{formData.requester_name}</strong> from <strong className="text-text">{formData.department_name}</strong>
                    </p>
                    <button onClick={resetForm} className="btn-secondary w-full">
                        Submit Another Request
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-bg dark:bg-bg-dark flex flex-col items-center justify-center p-4 py-12">
            <div className="mb-8 flex flex-col items-center">
                <div className="bg-surface dark:bg-surface-dark p-4 rounded-xl shadow-sm border border-border dark:border-border-dark mb-4">
                    <OrbitLogo size={48} />
                </div>
                <h1 className="text-h1 font-bold text-text dark:text-white text-center">Orbit PR Request Portal</h1>
                <p className="text-mutedText text-center max-w-lg mt-2">
                    Submit media, graphic, and communication requests directly to our team. Please provide as much detail as possible to avoid delays.
                </p>
            </div>

            <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-card p-6 md:p-8 max-w-2xl w-full shadow-xl animate-fadeIn">
                {error && (
                    <div className="mb-6 p-4 bg-danger/10 border border-danger/20 text-danger rounded-control text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Requester Info Section */}
                    <div>
                        <h3 className="text-body font-semibold text-text mb-3 flex items-center gap-2">
                            <User size={16} className="text-primary" />
                            Your Information
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-small font-medium text-text mb-1.5">Your Name *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.requester_name}
                                    onChange={(e) => setFormData({ ...formData, requester_name: e.target.value })}
                                    className="w-full bg-surface2 dark:bg-surface2-dark border border-border dark:border-border-dark rounded-control px-4 py-2.5 text-text placeholder-mutedText focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                    placeholder="Jane Smith"
                                />
                            </div>
                            <div>
                                <label className="block text-small font-medium text-text mb-1.5">Your Email *</label>
                                <input
                                    type="email"
                                    required
                                    value={formData.requester_email}
                                    onChange={(e) => setFormData({ ...formData, requester_email: e.target.value })}
                                    className="w-full bg-surface2 dark:bg-surface2-dark border border-border dark:border-border-dark rounded-control px-4 py-2.5 text-text placeholder-mutedText focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                    placeholder="jane@yourorg.com"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-small font-medium text-text mb-1.5 flex items-center gap-1">
                                    <Building2 size={13} />
                                    Department / Team *
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={formData.department_name}
                                    onChange={(e) => setFormData({ ...formData, department_name: e.target.value })}
                                    className="w-full bg-surface2 dark:bg-surface2-dark border border-border dark:border-border-dark rounded-control px-4 py-2.5 text-text placeholder-mutedText focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                    placeholder="e.g., Marketing, HR, Student Affairs"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="border-t border-border" />

                    {/* Request Details */}
                    <div>
                        <h3 className="text-body font-semibold text-text mb-3">Request Details</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-small font-medium text-text mb-1.5">What do you need? *</label>
                                <input
                                    type="text"
                                    required
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full bg-surface2 dark:bg-surface2-dark border border-border dark:border-border-dark rounded-control px-4 py-2.5 text-text placeholder-mutedText focus:outline-none focus:ring-2 focus:ring-primary transition-all"
                                    placeholder="e.g., Spring Update Instagram Graphic"
                                />
                            </div>

                            <div>
                                <label className="block text-small font-medium text-text mb-1.5">Specific Details / Copy Text</label>
                                <textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    rows={4}
                                    className="w-full bg-surface2 dark:bg-surface2-dark border border-border dark:border-border-dark rounded-control px-4 py-2.5 text-text placeholder-mutedText focus:outline-none focus:ring-2 focus:ring-primary resize-none transition-all"
                                    placeholder="Include any required text, brand guidelines, or inspirational notes..."
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-small font-medium text-text mb-1.5">Platform / Channel *</label>
                                    <select
                                        required
                                        value={formData.platform}
                                        onChange={(e) => {
                                            const newPlatform = e.target.value;
                                            const newTypes = getContentTypesForPlatform(newPlatform);
                                            setFormData({ ...formData, platform: newPlatform, content_type: newTypes[0] });
                                        }}
                                        className="w-full bg-surface2 dark:bg-surface2-dark border border-border dark:border-border-dark rounded-control px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="instagram">Instagram</option>
                                        <option value="tiktok">TikTok</option>
                                        <option value="email">Email</option>
                                        <option value="website">Website</option>
                                        <option value="flyer">Flyer / Print</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-small font-medium text-text mb-1.5">Content Format *</label>
                                    <select
                                        required
                                        value={formData.content_type}
                                        onChange={(e) => setFormData({ ...formData, content_type: e.target.value })}
                                        className="w-full bg-surface2 dark:bg-surface2-dark border border-border dark:border-border-dark rounded-control px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        {contentTypes.map((type) => (
                                            <option key={type} value={type}>
                                                {type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-small font-medium text-text mb-1.5">Priority</label>
                                    <select
                                        value={formData.priority}
                                        onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                                        className="w-full bg-surface2 dark:bg-surface2-dark border border-border dark:border-border-dark rounded-control px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                                    >
                                        <option value="low">Low — whenever possible</option>
                                        <option value="normal">Normal — standard queue</option>
                                        <option value="high">High — elevated importance</option>
                                        <option value="urgent">Urgent — ASAP</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-small font-medium text-text mb-1.5">Required By (Deadline)</label>
                                    <input
                                        type="datetime-local"
                                        value={formData.deadline_at}
                                        onChange={(e) => setFormData({ ...formData, deadline_at: e.target.value })}
                                        className="w-full bg-surface2 dark:bg-surface2-dark border border-border dark:border-border-dark rounded-control px-4 py-2.5 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={isSubmitting || !formData.title || !formData.requester_name || !formData.requester_email || !formData.department_name}
                        className="w-full btn-primary py-3 flex items-center justify-center gap-2 mt-2 text-base shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isSubmitting ? 'Submitting...' : (
                            <>
                                <Send size={18} />
                                Submit Request
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default PublicRequestView;
