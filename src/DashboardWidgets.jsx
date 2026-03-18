import React from 'react';
import { AlertCircle, Clock, CheckCircle, Pause, ArrowRight } from 'lucide-react';

export const UrgentWidget = ({ requests = [], onViewAll }) => {
  const urgent = requests.filter(req => {
    if (!req.deadline_at) return false;
    const deadline = new Date(req.deadline_at);
    const now = new Date();
    const hoursUntil = (deadline - now) / (1000 * 60 * 60);
    return hoursUntil <= 48 &&
      !['approved', 'scheduled', 'published'].includes(req.status) &&
      ['urgent', 'high'].includes(req.priority);
  });

  return (
    <div className="relative group rounded-card overflow-hidden card-hoverable">
      <div className="absolute inset-0 bg-gradient-to-br from-danger/40 via-danger/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-danger to-danger/30" />
      <div className="h-full bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-xl p-6 relative z-10 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-danger/10 rounded-control text-danger shadow-inner">
            <AlertCircle size={24} />
          </div>
          <span className="badge-danger shadow-sm">{urgent.length}</span>
        </div>
        <h3 className="text-h3 font-bold text-text dark:text-white mb-1">What's Urgent?</h3>
        <p className="text-mutedText text-body mb-4">Deadlines within 48 hours</p>
        {urgent.length > 0 ? (
          <div className="space-y-2 mb-4 flex-1">
            {urgent.slice(0, 3).map((req) => (
              <div key={req.request_id} className="p-3 bg-white/50 dark:bg-black/20 rounded-control border border-border dark:border-border-dark group/item hover:border-danger/30 transition-colors">
                <div className="text-body font-semibold text-text dark:text-white truncate mb-0.5">{req.title}</div>
                <div className="text-[11px] font-medium text-danger/80">
                  Due {new Date(req.deadline_at).toLocaleString([], { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-small text-mutedText mb-4 flex-1 italic">No urgent items</p>
        )}
        <button
          onClick={onViewAll}
          className="text-danger font-semibold text-small flex items-center gap-1.5 hover:gap-2.5 transition-all mt-auto"
        >
          View all urgent <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export const BlockedWidget = ({ requests = [], onViewAll }) => {
  const blocked = requests.filter(req => req.status === 'blocked');

  return (
    <div className="relative group rounded-card overflow-hidden card-hoverable">
      <div className="absolute inset-0 bg-gradient-to-br from-warning/40 via-warning/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-warning to-warning/30" />
      <div className="h-full bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-xl p-6 relative z-10 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-warning/10 rounded-control text-warning shadow-inner">
            <Pause size={24} />
          </div>
          <span className="badge-warning shadow-sm">{blocked.length}</span>
        </div>
        <h3 className="text-h3 font-bold text-text dark:text-white mb-1">What's Blocked?</h3>
        <p className="text-mutedText text-body mb-4">Requires external action</p>
        {blocked.length > 0 ? (
          <div className="space-y-2 mb-4 flex-1">
            {blocked.slice(0, 3).map((req) => (
              <div key={req.request_id} className="p-3 bg-white/50 dark:bg-black/20 rounded-control border border-border dark:border-border-dark group/item hover:border-warning/30 transition-colors">
                <div className="text-body font-semibold text-text dark:text-white truncate mb-0.5">{req.title}</div>
                <div className="text-[11px] font-medium text-warning/80 capitalize px-2 py-0.5 bg-warning/10 inline-block rounded-full">{req.platform}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-small text-mutedText mb-4 flex-1 italic">No blocked items</p>
        )}
        <button
          onClick={onViewAll}
          className="text-warning font-semibold text-small flex items-center gap-1.5 hover:gap-2.5 transition-all mt-auto"
        >
          View all blocked <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export const ApprovedNotScheduledWidget = ({ requests = [], onViewAll }) => {
  const approvedNotScheduled = requests.filter(req =>
    req.status === 'approved' && !req.scheduled_at
  );

  return (
    <div className="relative group rounded-card overflow-hidden card-hoverable">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-primary to-primary/30" />
      <div className="h-full bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-xl p-6 relative z-10 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-primary/10 rounded-control text-primary shadow-inner">
            <CheckCircle size={24} />
          </div>
          <span className="badge-primary shadow-sm">{approvedNotScheduled.length}</span>
        </div>
        <h3 className="text-h3 font-bold text-text dark:text-white mb-1">Needs Scheduling</h3>
        <p className="text-mutedText text-body mb-4">Approved & ready to publish</p>
        {approvedNotScheduled.length > 0 ? (
          <div className="space-y-2 mb-4 flex-1">
            {approvedNotScheduled.slice(0, 3).map((req) => (
              <div key={req.request_id} className="p-3 bg-white/50 dark:bg-black/20 rounded-control border border-border dark:border-border-dark group/item hover:border-primary/30 transition-colors flex items-center justify-between">
                <div className="truncate pr-2">
                  <div className="text-body font-semibold text-text dark:text-white truncate mb-0.5">{req.title}</div>
                  <div className="text-[11px] font-medium text-primary/80 capitalize">{req.platform}</div>
                </div>
                <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center opacity-0 group-hover/item:opacity-100 transition-opacity flex-shrink-0">
                  <ArrowRight size={14} />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-small text-mutedText mb-4 flex-1 italic">All approved items scheduled</p>
        )}
        <button
          onClick={onViewAll}
          className="text-primary font-semibold text-small flex items-center gap-1.5 hover:gap-2.5 transition-all mt-auto"
        >
          Schedule now <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};

export const CanWaitWidget = ({ requests = [], onViewAll }) => {
  const canWait = requests.filter(req => {
    if (!req.deadline_at) return true;
    const deadline = new Date(req.deadline_at);
    const now = new Date();
    const daysUntil = (deadline - now) / (1000 * 60 * 60 * 24);
    return daysUntil > 7 &&
      req.priority === 'low' &&
      !['approved', 'scheduled', 'published'].includes(req.status);
  });

  return (
    <div className="relative group rounded-card overflow-hidden card-hoverable">
      <div className="absolute inset-0 bg-gradient-to-br from-info/40 via-info/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-info to-info/30" />
      <div className="h-full bg-surface/90 dark:bg-surface-dark/90 backdrop-blur-xl p-6 relative z-10 flex flex-col">
        <div className="flex items-start justify-between mb-4">
          <div className="p-3 bg-info/10 rounded-control text-info shadow-inner">
            <Clock size={24} />
          </div>
          <span className="badge-info shadow-sm">{canWait.length}</span>
        </div>
        <h3 className="text-h3 font-bold text-text dark:text-white mb-1">On the Horizon</h3>
        <p className="text-mutedText text-body mb-4">Low priority, future deadlines</p>
        {canWait.length > 0 ? (
          <div className="space-y-2 mb-4 flex-1">
            {canWait.slice(0, 3).map((req) => (
              <div key={req.request_id} className="p-3 bg-white/50 dark:bg-black/20 rounded-control border border-border dark:border-border-dark group/item hover:border-info/30 transition-colors">
                <div className="text-body font-semibold text-text dark:text-white truncate mb-0.5">{req.title}</div>
                <div className="text-[11px] font-medium text-info/80 capitalize px-2 py-0.5 bg-info/10 inline-block rounded-full">{req.platform}</div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-small text-mutedText mb-4 flex-1 italic">No low priority items</p>
        )}
        <button
          onClick={onViewAll}
          className="text-info font-semibold text-small flex items-center gap-1.5 hover:gap-2.5 transition-all mt-auto"
        >
          View all <ArrowRight size={16} />
        </button>
      </div>
    </div>
  );
};




