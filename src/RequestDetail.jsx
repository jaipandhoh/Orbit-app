import React, { useState, useRef } from 'react';
import { ArrowLeft, CheckCircle, XCircle, Clock, User, Calendar, AlertCircle, Image as ImageIcon, MessageSquare, History, FileText } from 'lucide-react';
import InstagramQualityGuardian from './InstagramQualityGuardian';
import PreviewStudio from './PreviewStudio';

const RequestDetail = ({ request, onBack, onEdit, onUpdate, onApproveRequest, onRejectRequest }) => {
  const [activeTab, setActiveTab] = useState('overview');
  const [assets, setAssets] = useState([]);
  const [comments, setComments] = useState([]);
  const [qualityChecklist, setQualityChecklist] = useState(null);
  const fileInputRef = useRef(null);

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app we would upload it to a server. Here we create a local object URL for preview
      const newAsset = {
        asset_id: Date.now(),
        file_name: file.name,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('video/') ? 'video' : 'image',
      };
      setAssets([...assets, newAsset]);
    }
    // Clear the input so the same file can be selected again if needed
    if (e.target) {
      e.target.value = '';
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: FileText },
    { id: 'assets', label: 'Assets', icon: ImageIcon },
    { id: 'preview', label: 'Preview & Approval', icon: CheckCircle },
    { id: 'comments', label: 'Comments', icon: MessageSquare },
    { id: 'history', label: 'History', icon: History },
  ];

  const getStatusBadge = (status) => {
    const statusMap = {
      new: { label: 'New', color: 'badge-info' },
      needs_review: { label: 'Needs Review', color: 'badge-warning' },
      in_progress: { label: 'In Progress', color: 'badge-primary' },
      in_review: { label: 'In Review', color: 'badge-warning' },
      changes_requested: { label: 'Changes', color: 'badge-danger' },
      approved: { label: 'Approved', color: 'badge-success' },
      scheduled: { label: 'Scheduled', color: 'badge-primary' },
      published: { label: 'Published', color: 'badge-success' },
      blocked: { label: 'Blocked', color: 'badge-danger' },
    };
    const config = statusMap[status] || { label: status, color: 'badge-status' };
    return <span className={config.color}>{config.label}</span>;
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'urgent': return 'text-danger';
      case 'high': return 'text-warning';
      default: return 'text-mutedText';
    }
  };

  const handleStatusChange = async (newStatus) => {
    if (onUpdate) {
      await onUpdate(request.request_id, { status: newStatus });
    }
  };

  const handleApprove = async () => {
    if (onApproveRequest) {
      await onApproveRequest(request.request_id);
    } else {
      await handleStatusChange('approved');
    }
  };

  const handleRequestChanges = async () => {
    if (onRejectRequest) {
      await onRejectRequest(request.request_id);
    } else {
      await handleStatusChange('changes_requested');
    }
  };

  if (!request) {
    return (
      <div className="space-y-6 animate-fadeIn">
        <button onClick={onBack} className="btn-secondary flex items-center gap-2">
          <ArrowLeft size={18} />
          Back
        </button>
        <div className="card text-center py-12">
          <p className="text-mutedText">Request not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="btn-secondary flex items-center gap-2">
            <ArrowLeft size={18} />
            Back
          </button>
          <div>
            <h1 className="text-h1 font-bold text-text">{request.title}</h1>
            <div className="flex items-center gap-3 mt-2">
              {getStatusBadge(request.status)}
              <span className={`text-body font-medium ${getPriorityColor(request.priority)}`}>
                {request.priority}
              </span>
              <span className="text-mutedText text-body capitalize">
                {request.platform} • {request.content_type?.replace('_', ' ')}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          {onEdit && (
            <button onClick={onEdit} className="btn-secondary flex items-center gap-2">
              Edit
            </button>
          )}
          {['new', 'needs_review', 'in_review'].includes(request.status) && (
            <>
              <button onClick={handleRequestChanges} className="btn-secondary flex items-center gap-2">
                <XCircle size={18} />
                Request Changes
              </button>
              <button onClick={handleApprove} className="btn-primary flex items-center gap-2">
                <CheckCircle size={18} />
                Approve
              </button>
            </>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="card">
            <div className="flex items-center gap-1 border-b border-border pb-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex items-center gap-2 px-4 py-2 rounded-control transition-colors ${
                      activeTab === tab.id
                        ? 'bg-primary/20 text-primary font-medium'
                        : 'text-mutedText hover:text-text'
                    }`}
                  >
                    <Icon size={18} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div className="card">
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-h3 font-semibold text-text mb-2">Description</h3>
                  <p className="text-body text-mutedText">{request.description || 'No description provided'}</p>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-small text-mutedText mb-1">Platform</div>
                    <div className="text-body font-medium text-text capitalize">{request.platform}</div>
                  </div>
                  <div>
                    <div className="text-small text-mutedText mb-1">Content Type</div>
                    <div className="text-body font-medium text-text capitalize">{request.content_type?.replace('_', ' ')}</div>
                  </div>
                  <div>
                    <div className="text-small text-mutedText mb-1">Priority</div>
                    <div className={`text-body font-medium ${getPriorityColor(request.priority)} capitalize`}>
                      {request.priority}
                    </div>
                  </div>
                  <div>
                    <div className="text-small text-mutedText mb-1">Status</div>
                    <div>{getStatusBadge(request.status)}</div>
                  </div>
                </div>

                {request.deadline_at && (
                  <div className="p-4 bg-surface2 rounded-control border border-border">
                    <div className="flex items-center gap-2 text-body">
                      <Clock size={18} className="text-warning" />
                      <span className="text-text font-medium">Deadline:</span>
                      <span className="text-mutedText">{new Date(request.deadline_at).toLocaleString()}</span>
                    </div>
                  </div>
                )}

                {request.scheduled_at && (
                  <div className="p-4 bg-surface2 rounded-control border border-border">
                    <div className="flex items-center gap-2 text-body">
                      <Calendar size={18} className="text-primary" />
                      <span className="text-text font-medium">Scheduled:</span>
                      <span className="text-mutedText">{new Date(request.scheduled_at).toLocaleString()}</span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'assets' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-h3 font-semibold text-text">Assets</h3>
                  <div>
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      onChange={handleFileUpload} 
                      className="hidden" 
                      accept="image/*,video/*"
                    />
                    <button onClick={handleUploadClick} className="btn-primary text-small">Upload Asset</button>
                  </div>
                </div>
                {assets.length === 0 ? (
                  <div className="text-center py-12 border border-border rounded-control">
                    <p className="text-mutedText">No assets uploaded yet</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 gap-4">
                    {assets.map((asset) => (
                      <div key={asset.asset_id} className="border border-border rounded-control p-4">
                        <img src={asset.url} alt={asset.file_name} className="w-full rounded-control mb-2" />
                        <div className="text-small text-mutedText">{asset.file_name}</div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'preview' && (
              <PreviewStudio
                request={request}
                assets={assets}
                onApprove={handleApprove}
                onRequestChanges={handleRequestChanges}
              />
            )}

            {activeTab === 'comments' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-h3 font-semibold text-text">Comments</h3>
                  <button className="btn-primary text-small">Add Comment</button>
                </div>
                {comments.length === 0 ? (
                  <div className="text-center py-12 border border-border rounded-control">
                    <p className="text-mutedText">No comments yet</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {comments.map((comment) => (
                      <div key={comment.comment_id} className="border border-border rounded-control p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <User size={16} className="text-mutedText" />
                          <span className="text-body font-medium text-text">User</span>
                          <span className="text-small text-mutedText">
                            {new Date(comment.created_at).toLocaleString()}
                          </span>
                        </div>
                        <p className="text-body text-mutedText">{comment.body}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'history' && (
              <div className="space-y-4">
                <h3 className="text-h3 font-semibold text-text">Activity History</h3>
                <div className="space-y-3">
                  <div className="border-l-2 border-primary pl-4 py-2">
                    <div className="text-body font-medium text-text">Request created</div>
                    <div className="text-small text-mutedText">
                      {new Date(request.created_at).toLocaleString()}
                    </div>
                  </div>
                  {request.updated_at && request.updated_at !== request.created_at && (
                    <div className="border-l-2 border-border pl-4 py-2">
                      <div className="text-body font-medium text-text">Last updated</div>
                      <div className="text-small text-mutedText">
                        {new Date(request.updated_at).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Instagram Quality Guardian */}
          {request.platform === 'instagram' && (
            <InstagramQualityGuardian
              request={request}
              contentType={request.content_type}
              assets={assets}
              checklist={qualityChecklist}
              onChecklistUpdate={setQualityChecklist}
            />
          )}

          {/* Key Dates */}
          <div className="card">
            <h3 className="text-h3 font-semibold text-text mb-4">Key Dates</h3>
            <div className="space-y-3">
              {request.deadline_at && (
                <div>
                  <div className="text-small text-mutedText mb-1">Deadline</div>
                  <div className="text-body font-medium text-text">
                    {new Date(request.deadline_at).toLocaleDateString()}
                  </div>
                </div>
              )}
              {request.scheduled_at && (
                <div>
                  <div className="text-small text-mutedText mb-1">Scheduled</div>
                  <div className="text-body font-medium text-text">
                    {new Date(request.scheduled_at).toLocaleDateString()}
                  </div>
                </div>
              )}
              <div>
                <div className="text-small text-mutedText mb-1">Created</div>
                <div className="text-body font-medium text-text">
                  {new Date(request.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>
          </div>

          {/* Assignees */}
          <div className="card">
            <h3 className="text-h3 font-semibold text-text mb-4">Assignees</h3>
            <div className="space-y-2">
              {request.owner_user_id ? (
                <div className="flex items-center gap-2">
                  <User size={18} className="text-mutedText" />
                  <span className="text-body text-text">Assigned</span>
                </div>
              ) : (
                <p className="text-small text-mutedText">No assignee</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RequestDetail;

