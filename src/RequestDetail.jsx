import React, { useState, useRef, useEffect } from 'react';
import {
  ArrowLeft, CheckCircle, XCircle, Clock, User, Calendar, AlertCircle,
  Image as ImageIcon, MessageSquare, History, FileText, Globe, Building2,
  Edit3, Save, X, ChevronRight, Send, Play, Ban, RefreshCw,
} from 'lucide-react';
import InstagramQualityGuardian from './InstagramQualityGuardian';
import PreviewStudio from './PreviewStudio';

const STATUS_FLOW = [
  { id: 'new', label: 'New', color: 'badge-info' },
  { id: 'needs_review', label: 'Needs Review', color: 'badge-warning' },
  { id: 'in_progress', label: 'In Progress', color: 'badge-primary' },
  { id: 'in_review', label: 'In Review', color: 'badge-warning' },
  { id: 'changes_requested', label: 'Changes Requested', color: 'badge-danger' },
  { id: 'approved', label: 'Approved', color: 'badge-success' },
  { id: 'scheduled', label: 'Scheduled', color: 'badge-primary' },
  { id: 'published', label: 'Published', color: 'badge-success' },
  { id: 'blocked', label: 'Blocked', color: 'badge-danger' },
];

const PLATFORM_CONTENT_TYPES = {
  instagram: ['feed_post', 'reel', 'story', 'carousel'],
  tiktok: ['reel'],
  email: ['email_blast'],
  website: ['web_update'],
  flyer: ['print'],
  other: ['other'],
};

const RequestDetail = ({ request: initialRequest, onBack, onEdit, onUpdate, onApproveRequest, onRejectRequest, users = [] }) => {
  const [request, setRequest] = useState(initialRequest);
  const [activeTab, setActiveTab] = useState('overview');
  const [assets, setAssets] = useState([]);
  const [comments, setComments] = useState([]);
  const [qualityChecklist, setQualityChecklist] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [isSaving, setIsSaving] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [commentAuthor, setCommentAuthor] = useState('Comms Team');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const fileInputRef = useRef(null);

  // Sync if parent passes new request data
  useEffect(() => { setRequest(initialRequest); }, [initialRequest]);

  // Load comments when comments tab is active
  useEffect(() => {
    if (activeTab === 'comments' && request?.request_id) {
      fetch(`/api/requests/${request.request_id}/comments`)
        .then(r => r.ok ? r.json() : [])
        .then(setComments)
        .catch(() => setComments([]));
    }
  }, [activeTab, request?.request_id]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAssets(prev => [...prev, {
        asset_id: Date.now(),
        file_name: file.name,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' : 'image',
      }]);
    }
    if (e.target) e.target.value = '';
  };

  const startEditing = () => {
    setEditForm({
      title: request.title || '',
      description: request.description || '',
      platform: request.platform || 'instagram',
      content_type: request.content_type || 'feed_post',
      priority: request.priority || 'normal',
      deadline_at: request.deadline_at ? new Date(request.deadline_at).toISOString().slice(0, 16) : '',
      owner_user_id: request.owner_user_id || '',
    });
    setIsEditing(true);
  };

  const cancelEditing = () => setIsEditing(false);

  const saveEdits = async () => {
    setIsSaving(true);
    try {
      const updates = {
        ...editForm,
        deadline_at: editForm.deadline_at ? new Date(editForm.deadline_at).toISOString() : null,
        owner_user_id: editForm.owner_user_id || null,
      };
      const res = await fetch(`/api/requests/${request.request_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to save');
      const updated = await res.json();
      setRequest(updated);
      setIsEditing(false);
      if (onUpdate) onUpdate(request.request_id, updates);
    } catch (err) {
      console.error(err);
      alert('Failed to save changes. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleStatusChange = async (newStatus) => {
    try {
      const res = await fetch(`/api/requests/${request.request_id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) throw new Error('Failed to update status');
      const updated = await res.json();
      setRequest(updated);
      if (onUpdate) onUpdate(request.request_id, { status: newStatus });
    } catch (err) {
      console.error(err);
      alert('Failed to update status.');
    }
  };

  const handleApprove = async () => {
    if (onApproveRequest) {
      await onApproveRequest(request.request_id);
      setRequest(prev => ({ ...prev, status: 'approved' }));
    } else {
      await handleStatusChange('approved');
    }
  };

  const handleRequestChanges = async () => {
    if (onRejectRequest) {
      await onRejectRequest(request.request_id);
      setRequest(prev => ({ ...prev, status: 'changes_requested' }));
    } else {
      await handleStatusChange('changes_requested');
    }
  };

  const handleSubmitComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;
    setIsSubmittingComment(true);
    try {
      const res = await fetch(`/api/requests/${request.request_id}/comments`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body: newComment.trim(), author_name: commentAuthor }),
      });
      if (!res.ok) throw new Error('Failed to post comment');
      const created = await res.json();
      setComments(prev => [...prev, created]);
      setNewComment('');
    } catch (err) {
      console.error(err);
      alert('Failed to post comment.');
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const getStatusBadge = (status) => {
    const cfg = STATUS_FLOW.find(s => s.id === status) || { label: status, color: 'badge-status' };
    return <span className={cfg.color}>{cfg.label}</span>;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-danger';
      case 'high': return 'text-warning';
      default: return 'text-mutedText';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'assets', label: 'Assets', icon: ImageIcon },
    { id: 'preview', label: 'Preview & Approval', icon: CheckCircle },
    { id: 'comments', label: `Comments${comments.length > 0 ? ` (${comments.length})` : ''}`, icon: MessageSquare },
    { id: 'history', label: 'History', icon: History },
  ];

  const contentTypes = PLATFORM_CONTENT_TYPES[editForm.platform || request.platform] || ['other'];

  if (!request) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2">
          <ArrowLeft size={18} /> Back
        </button>
        <div className="card text-center py-12">
          <p className="text-mutedText">Request not found</p>
        </div>
      </div>
    );
  }

  const isExternal = request.source === 'external';

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div className="flex items-start gap-4">
          <button onClick={onBack} className="btn-secondary flex items-center gap-2 mt-1">
            <ArrowLeft size={16} />
            Back
          </button>
          <div>
            <div className="flex items-center gap-2 flex-wrap mb-1">
              {isExternal && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                  <Globe size={10} />
                  External Submission
                </span>
              )}
            </div>
            <h1 className="text-h1 font-bold text-text">{request.title}</h1>
            <div className="flex items-center gap-3 mt-1.5 flex-wrap">
              {getStatusBadge(request.status)}
              <span className={`text-sm font-medium ${getPriorityColor(request.priority)} capitalize`}>
                {request.priority}
              </span>
              <span className="text-mutedText text-sm capitalize">
                {request.platform} · {request.content_type?.replace(/_/g, ' ')}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {!isEditing ? (
            <button onClick={startEditing} className="btn-secondary flex items-center gap-1.5">
              <Edit3 size={15} />
              Edit
            </button>
          ) : (
            <>
              <button onClick={cancelEditing} className="btn-secondary flex items-center gap-1.5">
                <X size={15} />
                Cancel
              </button>
              <button onClick={saveEdits} disabled={isSaving} className="btn-primary flex items-center gap-1.5">
                <Save size={15} />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          )}

          {!isEditing && ['new', 'needs_review', 'in_review'].includes(request.status) && (
            <>
              <button onClick={handleRequestChanges} className="btn-secondary flex items-center gap-1.5 text-danger border-danger/30">
                <XCircle size={15} />
                Request Changes
              </button>
              <button onClick={handleApprove} className="btn-primary flex items-center gap-1.5">
                <CheckCircle size={15} />
                Approve
              </button>
            </>
          )}
        </div>
      </div>

      {/* Status Workflow Bar */}
      {!isEditing && (
        <div className="card">
          <div className="flex items-center gap-1 flex-wrap">
            <span className="text-xs text-mutedText mr-2 font-medium">Status:</span>
            {STATUS_FLOW.filter(s => !['published', 'blocked'].includes(s.id)).map((s, i, arr) => (
              <React.Fragment key={s.id}>
                <button
                  onClick={() => request.status !== s.id && handleStatusChange(s.id)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                    request.status === s.id
                      ? 'bg-primary text-white border-primary font-semibold'
                      : 'bg-surface2 text-mutedText border-border hover:border-primary/50 hover:text-text'
                  }`}
                >
                  {s.label}
                </button>
                {i < arr.length - 1 && <ChevronRight size={12} className="text-mutedText/40 flex-shrink-0" />}
              </React.Fragment>
            ))}
            <div className="ml-auto flex gap-1">
              <button
                onClick={() => handleStatusChange('blocked')}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  request.status === 'blocked'
                    ? 'bg-danger text-white border-danger font-semibold'
                    : 'bg-surface2 text-mutedText border-border hover:border-danger/50 hover:text-danger'
                }`}
              >
                Blocked
              </button>
              <button
                onClick={() => handleStatusChange('published')}
                className={`text-xs px-2.5 py-1 rounded-full border transition-all ${
                  request.status === 'published'
                    ? 'bg-success text-white border-success font-semibold'
                    : 'bg-surface2 text-mutedText border-border hover:border-success/50 hover:text-success'
                }`}
              >
                Published
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-5">
          {/* Tabs */}
          <div className="card">
            <div className="flex items-center gap-1 border-b border-border pb-2 overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-1.5 px-3 py-2 rounded-control transition-colors whitespace-nowrap text-sm ${
                      activeTab === tab.id
                        ? 'bg-primary/15 text-primary font-semibold'
                        : 'text-mutedText hover:text-text'
                    }`}
                  >
                    <Icon size={15} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="card">
            {/* Overview Tab */}
            {activeTab === 'overview' && (
              <div className="space-y-5">
                {isEditing ? (
                  /* Edit Form */
                  <div className="space-y-4">
                    <h3 className="text-h3 font-semibold text-text">Edit Request</h3>
                    <div>
                      <label className="block text-sm font-medium text-text mb-1.5">Title</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={e => setEditForm({ ...editForm, title: e.target.value })}
                        className="w-full bg-surface2 border border-border rounded-control px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-1.5">Description</label>
                      <textarea
                        value={editForm.description}
                        onChange={e => setEditForm({ ...editForm, description: e.target.value })}
                        rows={4}
                        className="w-full bg-surface2 border border-border rounded-control px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-text mb-1.5">Platform</label>
                        <select
                          value={editForm.platform}
                          onChange={e => {
                            const p = e.target.value;
                            const types = PLATFORM_CONTENT_TYPES[p] || ['other'];
                            setEditForm({ ...editForm, platform: p, content_type: types[0] });
                          }}
                          className="w-full bg-surface2 border border-border rounded-control px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {Object.keys(PLATFORM_CONTENT_TYPES).map(p => (
                            <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-1.5">Content Type</label>
                        <select
                          value={editForm.content_type}
                          onChange={e => setEditForm({ ...editForm, content_type: e.target.value })}
                          className="w-full bg-surface2 border border-border rounded-control px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          {contentTypes.map(t => (
                            <option key={t} value={t}>{t.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-1.5">Priority</label>
                        <select
                          value={editForm.priority}
                          onChange={e => setEditForm({ ...editForm, priority: e.target.value })}
                          className="w-full bg-surface2 border border-border rounded-control px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                        >
                          <option value="low">Low</option>
                          <option value="normal">Normal</option>
                          <option value="high">High</option>
                          <option value="urgent">Urgent</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-text mb-1.5">Deadline</label>
                        <input
                          type="datetime-local"
                          value={editForm.deadline_at}
                          onChange={e => setEditForm({ ...editForm, deadline_at: e.target.value })}
                          className="w-full bg-surface2 border border-border rounded-control px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-text mb-1.5">Assign Owner</label>
                      <select
                        value={editForm.owner_user_id}
                        onChange={e => setEditForm({ ...editForm, owner_user_id: e.target.value })}
                        className="w-full bg-surface2 border border-border rounded-control px-3 py-2 text-text focus:outline-none focus:ring-2 focus:ring-primary"
                      >
                        <option value="">— Unassigned —</option>
                        {users.map(u => (
                          <option key={u.user_id} value={u.user_id}>{u.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  /* Read View */
                  <div className="space-y-5">
                    {/* External requester info */}
                    {isExternal && (request.requester_name || request.department_name) && (
                      <div className="p-4 bg-primary/5 border border-primary/20 rounded-control">
                        <div className="text-xs font-semibold text-primary uppercase tracking-wide mb-2">External Submission</div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          {request.requester_name && (
                            <div className="flex items-center gap-2">
                              <User size={14} className="text-mutedText" />
                              <span className="text-text font-medium">{request.requester_name}</span>
                            </div>
                          )}
                          {request.requester_email && (
                            <div>
                              <a href={`mailto:${request.requester_email}`} className="text-primary hover:underline text-xs">
                                {request.requester_email}
                              </a>
                            </div>
                          )}
                          {request.department_name && (
                            <div className="flex items-center gap-2">
                              <Building2 size={14} className="text-mutedText" />
                              <span className="text-text">{request.department_name}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Description */}
                    <div>
                      <h3 className="text-h3 font-semibold text-text mb-2">Description</h3>
                      <p className="text-body text-mutedText whitespace-pre-wrap">
                        {request.description || 'No description provided'}
                      </p>
                    </div>

                    {/* Details grid */}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <div className="text-xs text-mutedText mb-1 uppercase tracking-wide">Platform</div>
                        <div className="text-body font-medium text-text capitalize">{request.platform}</div>
                      </div>
                      <div>
                        <div className="text-xs text-mutedText mb-1 uppercase tracking-wide">Content Type</div>
                        <div className="text-body font-medium text-text capitalize">{request.content_type?.replace(/_/g, ' ')}</div>
                      </div>
                      <div>
                        <div className="text-xs text-mutedText mb-1 uppercase tracking-wide">Priority</div>
                        <div className={`text-body font-medium ${getPriorityColor(request.priority)} capitalize`}>
                          {request.priority}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-mutedText mb-1 uppercase tracking-wide">Status</div>
                        {getStatusBadge(request.status)}
                      </div>
                    </div>

                    {request.deadline_at && (
                      <div className="flex items-center gap-2 p-3 bg-surface2 rounded-control border border-border">
                        <Clock size={16} className="text-warning" />
                        <span className="text-text font-medium text-sm">Deadline:</span>
                        <span className="text-mutedText text-sm">{new Date(request.deadline_at).toLocaleString()}</span>
                      </div>
                    )}

                    {request.scheduled_at && (
                      <div className="flex items-center gap-2 p-3 bg-surface2 rounded-control border border-border">
                        <Calendar size={16} className="text-primary" />
                        <span className="text-text font-medium text-sm">Scheduled:</span>
                        <span className="text-mutedText text-sm">{new Date(request.scheduled_at).toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Assets Tab */}
            {activeTab === 'assets' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-h3 font-semibold text-text">Assets</h3>
                  <div>
                    <input type="file" ref={fileInputRef} onChange={handleFileUpload} className="hidden" accept="image/*,video/*" />
                    <button onClick={handleUploadClick} className="btn-primary text-sm">Upload Asset</button>
                  </div>
                </div>
                {assets.length === 0 ? (
                  <div
                    className="text-center py-16 border-2 border-dashed border-border rounded-control cursor-pointer hover:border-primary/40 transition-colors"
                    onClick={handleUploadClick}
                  >
                    <ImageIcon size={32} className="text-mutedText mx-auto mb-2 opacity-40" />
                    <p className="text-mutedText text-sm">Click to upload images or videos</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {assets.map((asset) => (
                      <div key={asset.asset_id} className="border border-border rounded-control p-3">
                        {asset.type === 'video' ? (
                          <video src={asset.url} controls className="w-full rounded-control mb-2" />
                        ) : (
                          <img src={asset.url} alt={asset.file_name} className="w-full rounded-control mb-2 object-cover" />
                        )}
                        <div className="text-xs text-mutedText truncate">{asset.file_name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Preview Tab */}
            {activeTab === 'preview' && (
              <PreviewStudio
                request={request}
                assets={assets}
                onApprove={handleApprove}
                onRequestChanges={handleRequestChanges}
              />
            )}

            {/* Comments Tab */}
            {activeTab === 'comments' && (
              <div className="space-y-4">
                <h3 className="text-h3 font-semibold text-text">Comments</h3>

                {comments.length === 0 ? (
                  <div className="text-center py-8 border border-dashed border-border rounded-control">
                    <MessageSquare size={28} className="text-mutedText mx-auto mb-2 opacity-40" />
                    <p className="text-mutedText text-sm">No comments yet. Start the conversation below.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.id} className="border border-border rounded-control p-3">
                        <div className="flex items-center gap-2 mb-1.5">
                          <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                            {(comment.author_name || 'C')[0].toUpperCase()}
                          </div>
                          <span className="text-sm font-medium text-text">{comment.author_name || 'Comms Team'}</span>
                          <span className="text-xs text-mutedText ml-auto">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-sm text-mutedText pl-8 whitespace-pre-wrap">{comment.body}</p>
                      </div>
                    ))}
                  </div>
                )}

                {/* Add Comment Form */}
                <form onSubmit={handleSubmitComment} className="space-y-2 border-t border-border pt-4">
                  <div className="flex items-center gap-2 mb-2">
                    <label className="text-xs text-mutedText font-medium">Posting as:</label>
                    <input
                      type="text"
                      value={commentAuthor}
                      onChange={e => setCommentAuthor(e.target.value)}
                      className="bg-surface2 border border-border rounded px-2 py-1 text-xs text-text focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="Your name"
                    />
                  </div>
                  <div className="flex gap-2">
                    <textarea
                      value={newComment}
                      onChange={e => setNewComment(e.target.value)}
                      placeholder="Add a comment..."
                      rows={2}
                      className="flex-1 bg-surface2 border border-border rounded-control px-3 py-2 text-text text-sm placeholder-mutedText focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                      onKeyDown={e => {
                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSubmitComment(e);
                      }}
                    />
                    <button
                      type="submit"
                      disabled={isSubmittingComment || !newComment.trim()}
                      className="btn-primary px-3 self-end flex items-center gap-1.5 disabled:opacity-50"
                    >
                      <Send size={14} />
                      Post
                    </button>
                  </div>
                  <p className="text-xs text-mutedText">⌘+Enter to submit</p>
                </form>
              </div>
            )}

            {/* History Tab */}
            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="text-h3 font-semibold text-text">Activity History</h3>
                <div className="space-y-0">
                  {request.updated_at && request.updated_at !== request.created_at && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-border mt-1.5 flex-shrink-0" />
                        <div className="flex-1 w-px bg-border mt-1" />
                      </div>
                      <div className="pb-4">
                        <div className="text-sm font-medium text-text">Last updated</div>
                        <div className="text-xs text-mutedText">{new Date(request.updated_at).toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                  {isExternal && request.requester_name && (
                    <div className="flex gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                        <div className="flex-1 w-px bg-border mt-1" />
                      </div>
                      <div className="pb-4">
                        <div className="text-sm font-medium text-text">
                          Submitted by {request.requester_name}
                          {request.department_name && ` · ${request.department_name}`}
                        </div>
                        <div className="text-xs text-mutedText">{new Date(request.created_at).toLocaleString()}</div>
                      </div>
                    </div>
                  )}
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-primary mt-1.5 flex-shrink-0" />
                    </div>
                    <div className="pb-2">
                      <div className="text-sm font-medium text-text">Request created</div>
                      <div className="text-xs text-mutedText">{new Date(request.created_at).toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Platform Quality Guardian */}
          {request.platform === 'instagram' && (
            <InstagramQualityGuardian
              request={request}
              contentType={request.content_type}
              assets={assets}
              checklist={qualityChecklist}
              onChecklistUpdate={setQualityChecklist}
            />
          )}

          {/* Owner / Assignment */}
          <div className="card">
            <h3 className="text-h3 font-semibold text-text mb-3">Assignment</h3>
            <div className="space-y-3">
              {request.owner_name ? (
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                    {request.owner_name[0].toUpperCase()}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-text">{request.owner_name}</div>
                    <div className="text-xs text-mutedText">Owner</div>
                  </div>
                </div>
              ) : (
                <p className="text-sm text-mutedText">No owner assigned</p>
              )}
              {request.requester_name && (
                <div className="flex items-center gap-2 pt-2 border-t border-border">
                  <User size={14} className="text-mutedText flex-shrink-0" />
                  <div>
                    <div className="text-xs font-medium text-text">{request.requester_name}</div>
                    <div className="text-xs text-mutedText">Requester</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Key Dates */}
          <div className="card">
            <h3 className="text-h3 font-semibold text-text mb-3">Key Dates</h3>
            <div className="space-y-3 text-sm">
              <div>
                <div className="text-xs text-mutedText uppercase tracking-wide mb-0.5">Created</div>
                <div className="text-text font-medium">{new Date(request.created_at).toLocaleDateString()}</div>
              </div>
              {request.deadline_at && (
                <div>
                  <div className="text-xs text-mutedText uppercase tracking-wide mb-0.5">Deadline</div>
                  <div className="text-text font-medium">{new Date(request.deadline_at).toLocaleDateString()}</div>
                </div>
              )}
              {request.scheduled_at && (
                <div>
                  <div className="text-xs text-mutedText uppercase tracking-wide mb-0.5">Scheduled</div>
                  <div className="text-text font-medium">{new Date(request.scheduled_at).toLocaleDateString()}</div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          {!isEditing && (
            <div className="card">
              <h3 className="text-h3 font-semibold text-text mb-3">Quick Actions</h3>
              <div className="space-y-2">
                {request.status !== 'in_progress' && (
                  <button
                    onClick={() => handleStatusChange('in_progress')}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-control text-sm bg-surface2 hover:bg-primary/10 hover:text-primary text-text border border-border hover:border-primary/30 transition-colors"
                  >
                    <Play size={14} />
                    Mark In Progress
                  </button>
                )}
                {request.status !== 'in_review' && (
                  <button
                    onClick={() => handleStatusChange('in_review')}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-control text-sm bg-surface2 hover:bg-warning/10 hover:text-warning text-text border border-border hover:border-warning/30 transition-colors"
                  >
                    <RefreshCw size={14} />
                    Submit for Review
                  </button>
                )}
                {request.status !== 'blocked' && (
                  <button
                    onClick={() => handleStatusChange('blocked')}
                    className="w-full flex items-center gap-2 px-3 py-2 rounded-control text-sm bg-surface2 hover:bg-danger/10 hover:text-danger text-text border border-border hover:border-danger/30 transition-colors"
                  >
                    <Ban size={14} />
                    Mark Blocked
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;
