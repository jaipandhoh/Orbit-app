import React, { useState } from 'react';
import { Plus, Clock, Globe, AlertTriangle } from 'lucide-react';

const BoardView = ({ requests = [], onSelectRequest, onCreateRequest }) => {
  const [hiddenCols, setHiddenCols] = useState(new Set(['published']));

  const columns = [
    { id: 'new', label: 'New', color: 'border-info' },
    { id: 'needs_review', label: 'Needs Review', color: 'border-warning' },
    { id: 'in_progress', label: 'In Progress', color: 'border-primary' },
    { id: 'in_review', label: 'In Review', color: 'border-warning' },
    { id: 'changes_requested', label: 'Changes', color: 'border-danger' },
    { id: 'blocked', label: 'Blocked', color: 'border-danger' },
    { id: 'approved', label: 'Approved', color: 'border-success' },
    { id: 'scheduled', label: 'Scheduled', color: 'border-primary' },
    { id: 'published', label: 'Published', color: 'border-success' },
  ];

  const visibleColumns = columns.filter(c => !hiddenCols.has(c.id));

  const getRequestsForColumn = (colId) => requests.filter(r => r.status === colId);

  const getCardAccent = (status) => {
    const map = {
      new: 'border-l-info',
      needs_review: 'border-l-warning',
      in_progress: 'border-l-primary',
      in_review: 'border-l-warning',
      changes_requested: 'border-l-danger',
      blocked: 'border-l-danger',
      approved: 'border-l-success',
      scheduled: 'border-l-primary',
      published: 'border-l-success',
    };
    return map[status] || 'border-l-border';
  };

  const formatDeadline = (deadlineAt) => {
    if (!deadlineAt) return null;
    const deadline = new Date(deadlineAt);
    const now = new Date();
    const hoursUntil = (deadline - now) / (1000 * 60 * 60);
    if (hoursUntil < 0) return { text: 'Overdue', urgent: true };
    if (hoursUntil < 24) return { text: `${Math.floor(hoursUntil)}h`, urgent: true };
    if (hoursUntil < 72) return { text: `${Math.floor(hoursUntil / 24)}d`, urgent: true };
    return { text: deadline.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }), urgent: false };
  };

  const getInitials = (name) => {
    if (!name) return null;
    return name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  };

  const toggleCol = (colId) => {
    const next = new Set(hiddenCols);
    if (next.has(colId)) next.delete(colId);
    else next.add(colId);
    setHiddenCols(next);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-h1 font-bold text-text">Board</h1>
          <p className="text-mutedText mt-0.5">Kanban workflow view</p>
        </div>
        <div className="flex items-center gap-3">
          {/* Column visibility toggles */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {columns.map(col => {
              const count = getRequestsForColumn(col.id).length;
              const hidden = hiddenCols.has(col.id);
              return (
                <button
                  key={col.id}
                  onClick={() => toggleCol(col.id)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    hidden
                      ? 'bg-surface2 text-mutedText border-border opacity-50'
                      : 'bg-surface2 text-text border-border hover:border-primary/50'
                  }`}
                  title={hidden ? `Show ${col.label}` : `Hide ${col.label}`}
                >
                  {col.label} {count > 0 && <span className="font-semibold">{count}</span>}
                </button>
              );
            })}
          </div>
          <button onClick={onCreateRequest} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            New Request
          </button>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6">
        {visibleColumns.map((column) => {
          const columnRequests = getRequestsForColumn(column.id);
          return (
            <div key={column.id} className="flex-shrink-0 w-68" style={{ minWidth: '260px' }}>
              {/* Column header */}
              <div className={`card mb-3 border-t-2 ${column.color}`}>
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-text">{column.label}</h3>
                  <span className="text-xs font-semibold text-mutedText bg-surface2 rounded-full px-2 py-0.5">
                    {columnRequests.length}
                  </span>
                </div>
              </div>

              {/* Cards */}
              <div className="space-y-2.5 min-h-[200px]">
                {columnRequests.map((request) => {
                  const deadlineInfo = formatDeadline(request.deadline_at);
                  const initials = getInitials(request.owner_name);
                  const isExternal = request.source === 'external';

                  return (
                    <div
                      key={request.request_id}
                      onClick={() => onSelectRequest(request)}
                      className={`card-hoverable border-l-4 ${getCardAccent(request.status)} cursor-pointer`}
                    >
                      {/* Title + external badge */}
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <h4 className="text-sm font-semibold text-text leading-snug line-clamp-2 flex-1">
                          {request.title}
                        </h4>
                        {isExternal && (
                          <Globe size={12} className="text-primary flex-shrink-0 mt-0.5" title="External submission" />
                        )}
                      </div>

                      {/* Description */}
                      {request.description && (
                        <p className="text-xs text-mutedText line-clamp-2 mb-2">{request.description}</p>
                      )}

                      {/* Footer meta */}
                      <div className="flex items-center justify-between gap-2 mt-2">
                        <div className="flex items-center gap-2 text-xs text-mutedText">
                          <span className="capitalize">{request.platform}</span>
                          {request.priority === 'urgent' && (
                            <span className="flex items-center gap-0.5 text-danger font-medium">
                              <AlertTriangle size={10} />
                              Urgent
                            </span>
                          )}
                          {request.priority === 'high' && (
                            <span className="text-warning font-medium">High</span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {deadlineInfo && (
                            <span className={`flex items-center gap-0.5 text-xs ${deadlineInfo.urgent ? 'text-danger font-medium' : 'text-mutedText'}`}>
                              <Clock size={10} />
                              {deadlineInfo.text}
                            </span>
                          )}
                          {initials && (
                            <div
                              className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0"
                              title={request.owner_name}
                            >
                              {initials}
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Requester info for external */}
                      {isExternal && request.requester_name && (
                        <div className="mt-2 pt-2 border-t border-border text-xs text-mutedText">
                          From: {request.requester_name}
                          {request.department_name && ` · ${request.department_name}`}
                        </div>
                      )}
                    </div>
                  );
                })}

                {columnRequests.length === 0 && (
                  <div className="border-2 border-dashed border-border rounded-control h-20 flex items-center justify-center">
                    <span className="text-xs text-mutedText/50">Empty</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BoardView;
