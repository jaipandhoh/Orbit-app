import React, { useState } from 'react';
import { Plus, Search, Clock, CheckCircle2, RotateCcw, ExternalLink, Globe, Building2, User, AlertTriangle, Inbox, Filter } from 'lucide-react';

const PRIORITY_ORDER = { urgent: 0, high: 1, normal: 2, low: 3 };

const InboxView = ({ requests = [], users = [], onSelectRequest, onCreateRequest, onApproveRequest, onRejectRequest }) => {
  const [filters, setFilters] = useState({
    status: 'all',
    platform: 'all',
    priority: 'all',
    owner: 'all',
    source: 'all',
    search: '',
  });
  const [showFilters, setShowFilters] = useState(false);
  const [sortBy, setSortBy] = useState('deadline'); // deadline | priority | created

  const filteredRequests = requests
    .filter((req) => {
      if (filters.status !== 'all' && req.status !== filters.status) return false;
      if (filters.platform !== 'all' && req.platform !== filters.platform) return false;
      if (filters.priority !== 'all' && req.priority !== filters.priority) return false;
      if (filters.source !== 'all' && (req.source || 'internal') !== filters.source) return false;
      if (filters.owner !== 'all') {
        if (filters.owner === 'unassigned' && req.owner_user_id) return false;
        if (filters.owner !== 'unassigned' && String(req.owner_user_id) !== filters.owner) return false;
      }
      if (filters.search) {
        const q = filters.search.toLowerCase();
        const match = (
          req.title?.toLowerCase().includes(q) ||
          req.description?.toLowerCase().includes(q) ||
          req.requester_name?.toLowerCase().includes(q) ||
          req.department_name?.toLowerCase().includes(q)
        );
        if (!match) return false;
      }
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const diff = (PRIORITY_ORDER[a.priority] ?? 2) - (PRIORITY_ORDER[b.priority] ?? 2);
        if (diff !== 0) return diff;
      }
      if (sortBy === 'created') {
        return new Date(b.created_at) - new Date(a.created_at);
      }
      // deadline sort: items with deadlines first
      if (!a.deadline_at && !b.deadline_at) return new Date(b.created_at) - new Date(a.created_at);
      if (!a.deadline_at) return 1;
      if (!b.deadline_at) return -1;
      return new Date(a.deadline_at) - new Date(b.deadline_at);
    });

  // Stats
  const total = requests.length;
  const urgentCount = requests.filter(r => r.priority === 'urgent' && !['approved', 'published'].includes(r.status)).length;
  const needsReviewCount = requests.filter(r => ['new', 'needs_review', 'in_review'].includes(r.status)).length;
  const externalCount = requests.filter(r => r.source === 'external').length;

  const getStatusBadge = (status) => {
    const statusMap = {
      new: { label: 'New', cls: 'badge-info' },
      needs_review: { label: 'Needs Review', cls: 'badge-warning' },
      in_progress: { label: 'In Progress', cls: 'badge-primary' },
      in_review: { label: 'In Review', cls: 'badge-warning' },
      changes_requested: { label: 'Changes', cls: 'badge-danger' },
      approved: { label: 'Approved', cls: 'badge-success' },
      scheduled: { label: 'Scheduled', cls: 'badge-primary' },
      published: { label: 'Published', cls: 'badge-success' },
      blocked: { label: 'Blocked', cls: 'badge-danger' },
    };
    const cfg = statusMap[status] || { label: status, cls: 'badge-status' };
    return <span className={cfg.cls}>{cfg.label}</span>;
  };

  const getPriorityChip = (priority) => {
    const map = {
      urgent: 'bg-danger/15 text-danger border-danger/30',
      high: 'bg-warning/15 text-warning border-warning/30',
      normal: 'bg-surface2 text-mutedText border-border',
      low: 'bg-surface2 text-mutedText border-border',
    };
    const cls = map[priority] || map.normal;
    return (
      <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border ${cls} capitalize`}>
        {priority === 'urgent' && <AlertTriangle size={10} />}
        {priority}
      </span>
    );
  };

  const formatDeadline = (deadlineAt) => {
    if (!deadlineAt) return null;
    const deadline = new Date(deadlineAt);
    const now = new Date();
    const hoursUntil = (deadline - now) / (1000 * 60 * 60);
    if (hoursUntil < 0) return { text: 'Overdue', urgent: true };
    if (hoursUntil < 12) return { text: `${Math.floor(hoursUntil)}h left`, urgent: true };
    if (hoursUntil < 48) return { text: `${Math.floor(hoursUntil / 24)}d left`, urgent: true };
    return { text: deadline.toLocaleDateString(), urgent: false };
  };

  const activeFilterCount = [
    filters.status !== 'all',
    filters.platform !== 'all',
    filters.priority !== 'all',
    filters.owner !== 'all',
    filters.source !== 'all',
  ].filter(Boolean).length;

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-text">Inbox</h1>
          <p className="text-mutedText mt-0.5">Manage communication requests</p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="/request"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-secondary flex items-center gap-2"
            title="Share with other departments to submit requests"
          >
            <ExternalLink size={16} />
            Public Form
          </a>
          <button onClick={onCreateRequest} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            New Request
          </button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Total', value: total, icon: Inbox, color: 'text-text' },
          { label: 'Urgent', value: urgentCount, icon: AlertTriangle, color: urgentCount > 0 ? 'text-danger' : 'text-mutedText' },
          { label: 'Needs Action', value: needsReviewCount, icon: Clock, color: needsReviewCount > 0 ? 'text-warning' : 'text-mutedText' },
          { label: 'External', value: externalCount, icon: Globe, color: 'text-primary' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="card py-3 px-4 flex items-center gap-3">
            <Icon size={20} className={color} />
            <div>
              <div className={`text-h2 font-bold ${color}`}>{value}</div>
              <div className="text-xs text-mutedText">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Search + Filter Bar */}
      <div className="card space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <Search size={16} className="text-mutedText flex-shrink-0" />
            <input
              type="text"
              placeholder="Search title, requester, department..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="flex-1 bg-transparent text-text placeholder-mutedText border-none outline-none text-sm"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-control text-sm border transition-colors ${
              activeFilterCount > 0
                ? 'bg-primary/15 text-primary border-primary/30'
                : 'bg-surface2 text-mutedText border-border hover:text-text'
            }`}
          >
            <Filter size={14} />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="bg-surface2 border border-border text-text rounded-control px-2 py-1.5 text-sm"
          >
            <option value="deadline">Sort: Deadline</option>
            <option value="priority">Sort: Priority</option>
            <option value="created">Sort: Newest</option>
          </select>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 pt-2 border-t border-border">
            <div>
              <label className="block text-xs text-mutedText mb-1">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full bg-surface2 border border-border text-text rounded-control px-2 py-1.5 text-sm"
              >
                <option value="all">All</option>
                <option value="new">New</option>
                <option value="needs_review">Needs Review</option>
                <option value="in_progress">In Progress</option>
                <option value="in_review">In Review</option>
                <option value="changes_requested">Changes</option>
                <option value="blocked">Blocked</option>
                <option value="approved">Approved</option>
                <option value="scheduled">Scheduled</option>
                <option value="published">Published</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-mutedText mb-1">Platform</label>
              <select
                value={filters.platform}
                onChange={(e) => setFilters({ ...filters, platform: e.target.value })}
                className="w-full bg-surface2 border border-border text-text rounded-control px-2 py-1.5 text-sm"
              >
                <option value="all">All</option>
                <option value="instagram">Instagram</option>
                <option value="tiktok">TikTok</option>
                <option value="email">Email</option>
                <option value="website">Website</option>
                <option value="flyer">Flyer</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-mutedText mb-1">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full bg-surface2 border border-border text-text rounded-control px-2 py-1.5 text-sm"
              >
                <option value="all">All</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-mutedText mb-1">Owner</label>
              <select
                value={filters.owner}
                onChange={(e) => setFilters({ ...filters, owner: e.target.value })}
                className="w-full bg-surface2 border border-border text-text rounded-control px-2 py-1.5 text-sm"
              >
                <option value="all">All</option>
                <option value="unassigned">Unassigned</option>
                {users.map(u => (
                  <option key={u.user_id} value={String(u.user_id)}>{u.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs text-mutedText mb-1">Source</label>
              <select
                value={filters.source}
                onChange={(e) => setFilters({ ...filters, source: e.target.value })}
                className="w-full bg-surface2 border border-border text-text rounded-control px-2 py-1.5 text-sm"
              >
                <option value="all">All</option>
                <option value="internal">Internal</option>
                <option value="external">External</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-mutedText">
        <span>
          {filteredRequests.length} {filteredRequests.length === 1 ? 'request' : 'requests'}
          {filteredRequests.length !== total && ` of ${total}`}
        </span>
        {activeFilterCount > 0 && (
          <button
            onClick={() => setFilters({ status: 'all', platform: 'all', priority: 'all', owner: 'all', source: 'all', search: '' })}
            className="text-primary hover:underline text-xs"
          >
            Clear filters
          </button>
        )}
      </div>

      {/* Request Cards */}
      <div className="grid gap-3">
        {filteredRequests.length === 0 ? (
          <div className="card text-center py-12">
            <Inbox size={40} className="text-mutedText mx-auto mb-3 opacity-40" />
            <p className="text-mutedText mb-4">
              {activeFilterCount > 0 || filters.search ? 'No requests match your filters.' : 'No requests yet. Create your first request to get started.'}
            </p>
            {!activeFilterCount && !filters.search && (
              <a
                href="/request"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-primary hover:text-primary/80 transition-colors text-sm"
              >
                <ExternalLink size={14} />
                Share the public request form with your departments
              </a>
            )}
          </div>
        ) : (
          filteredRequests.map((request) => {
            const deadlineInfo = formatDeadline(request.deadline_at);
            const isApproved = request.status === 'approved';
            const isExternal = request.source === 'external';

            return (
              <div
                key={request.request_id}
                onClick={() => onSelectRequest(request)}
                className="card-hoverable"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Title row */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <h3 className="text-body font-semibold text-text leading-tight">{request.title}</h3>
                      {getStatusBadge(request.status)}
                      {getPriorityChip(request.priority)}
                      {isExternal && (
                        <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary border border-primary/20">
                          <Globe size={10} />
                          External
                        </span>
                      )}
                    </div>

                    {/* Description */}
                    {request.description && (
                      <p className="text-mutedText text-sm mb-2 line-clamp-1">{request.description}</p>
                    )}

                    {/* Meta row */}
                    <div className="flex items-center gap-3 text-xs text-mutedText flex-wrap">
                      <span className="capitalize font-medium">{request.platform}</span>
                      <span>·</span>
                      <span className="capitalize">{request.content_type?.replace(/_/g, ' ')}</span>

                      {request.requester_name && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <User size={11} />
                            {request.requester_name}
                            {request.department_name && (
                              <span className="text-mutedText/60">({request.department_name})</span>
                            )}
                          </span>
                        </>
                      )}

                      {request.department_name && !request.requester_name && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1">
                            <Building2 size={11} />
                            {request.department_name}
                          </span>
                        </>
                      )}

                      {request.owner_name && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-1 text-primary/80">
                            <User size={11} />
                            {request.owner_name}
                          </span>
                        </>
                      )}

                      {deadlineInfo && (
                        <>
                          <span>·</span>
                          <span className={`flex items-center gap-1 ${deadlineInfo.urgent ? 'text-danger font-medium' : ''}`}>
                            <Clock size={11} />
                            {deadlineInfo.text}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Quick approve toggle */}
                  <div className="flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                    {isApproved ? (
                      <button
                        onClick={() => onRejectRequest?.(request.request_id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-control text-sm font-semibold
                          bg-success/15 text-success border border-success/30
                          hover:bg-danger/10 hover:text-danger hover:border-danger/30
                          transition-all duration-200 group"
                        title="Click to revoke approval"
                      >
                        <CheckCircle2 size={14} className="group-hover:hidden" />
                        <RotateCcw size={14} className="hidden group-hover:block" />
                        <span className="group-hover:hidden">Approved</span>
                        <span className="hidden group-hover:inline">Revoke</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onApproveRequest?.(request.request_id)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-control text-sm font-semibold
                          bg-surface2 text-mutedText border border-border
                          hover:bg-success/15 hover:text-success hover:border-success/30
                          transition-all duration-200"
                        title="Approve this request"
                      >
                        <CheckCircle2 size={14} />
                        Approve
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default InboxView;
