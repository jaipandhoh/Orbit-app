import React, { useState, useEffect } from 'react';
import { Target, Clock, AlertCircle, CheckCircle, TrendingUp } from 'lucide-react';

const WeeklyFocusBanner = ({ requests = [] }) => {
  const [focusData, setFocusData] = useState(null);

  useEffect(() => {
    generateWeeklyFocus();
  }, [requests]);

  const generateWeeklyFocus = () => {
    const now = new Date();
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const twelveHoursFromNow = new Date(now.getTime() + 12 * 60 * 60 * 1000);

    // Overdue items
    const overdue = requests.filter(req => {
      if (!req.deadline_at) return false;
      return new Date(req.deadline_at) < now && 
             !['approved', 'scheduled', 'published'].includes(req.status);
    });

    // Deadlines within 7 days
    const upcomingDeadlines = requests.filter(req => {
      if (!req.deadline_at) return false;
      const deadline = new Date(req.deadline_at);
      return deadline >= now && 
             deadline <= sevenDaysFromNow &&
             !['approved', 'scheduled', 'published'].includes(req.status);
    });

    // High priority items
    const highPriority = requests.filter(req => 
      ['urgent', 'high'].includes(req.priority) &&
      !['approved', 'scheduled', 'published'].includes(req.status)
    );

    // Blocked items
    const blocked = requests.filter(req => req.status === 'blocked');

    // Approved but not scheduled
    const approvedNotScheduled = requests.filter(req => 
      req.status === 'approved' && !req.scheduled_at
    );

    // Critical deadlines (within 12 hours)
    const critical = requests.filter(req => {
      if (!req.deadline_at) return false;
      const deadline = new Date(req.deadline_at);
      return deadline >= now && 
             deadline <= twelveHoursFromNow &&
             !['scheduled', 'published'].includes(req.status);
    });

    // Top 3 priorities (ranking logic)
    const topPriorities = [
      ...overdue.slice(0, 3),
      ...critical.slice(0, 3 - overdue.length),
      ...upcomingDeadlines.slice(0, 3 - overdue.length - critical.length),
      ...highPriority.slice(0, 3 - overdue.length - critical.length - upcomingDeadlines.length),
    ].slice(0, 3);

    // Quick wins (low effort, high impact)
    const quickWins = requests.filter(req =>
      req.priority === 'normal' &&
      ['in_progress', 'in_review'].includes(req.status) &&
      !req.deadline_at
    ).slice(0, 3);

    // Suggested platform focus
    const platformCounts = {};
    requests
      .filter(req => !['approved', 'scheduled', 'published'].includes(req.status))
      .forEach(req => {
        platformCounts[req.platform] = (platformCounts[req.platform] || 0) + 1;
      });
    const suggestedPlatform = Object.entries(platformCounts)
      .sort((a, b) => b[1] - a[1])[0]?.[0];

    setFocusData({
      topPriorities,
      overdue: overdue.length,
      upcomingDeadlines: upcomingDeadlines.length,
      critical: critical.length,
      blocked: blocked.length,
      approvedNotScheduled: approvedNotScheduled.length,
      quickWins,
      suggestedPlatform,
    });
  };

  if (!focusData) return null;

  return (
    <div className="card border-2 border-primary/30 bg-primary/5">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-primary/20 rounded-control">
            <Target className="text-primary" size={24} />
          </div>
          <div>
            <h2 className="text-h2 font-bold text-text">Weekly Focus</h2>
            <p className="text-small text-mutedText">
              Generated {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </p>
          </div>
        </div>
      </div>

      {/* Top 3 Priorities */}
      {focusData.topPriorities.length > 0 && (
        <div className="mb-6">
          <h3 className="text-h3 font-semibold text-text mb-3">Top 3 Priorities</h3>
          <div className="space-y-2">
            {focusData.topPriorities.map((req, idx) => (
              <div
                key={req.request_id}
                className="flex items-center gap-3 p-3 bg-surface2 rounded-control border border-border"
              >
                <div className="flex-shrink-0 w-6 h-6 bg-primary/20 text-primary rounded-full flex items-center justify-center text-small font-bold">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-body font-medium text-text truncate">{req.title}</div>
                  <div className="text-small text-mutedText">
                    {req.deadline_at 
                      ? `Due ${new Date(req.deadline_at).toLocaleDateString()}`
                      : 'No deadline'}
                  </div>
                </div>
                {req.priority === 'urgent' && (
                  <span className="badge-danger text-small">Urgent</span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {focusData.overdue > 0 && (
          <div className="p-3 bg-danger/10 border border-danger/30 rounded-control">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={16} className="text-danger" />
              <span className="text-small text-mutedText">Overdue</span>
            </div>
            <div className="text-h2 font-bold text-danger">{focusData.overdue}</div>
          </div>
        )}
        
        {focusData.critical > 0 && (
          <div className="p-3 bg-warning/10 border border-warning/30 rounded-control">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-warning" />
              <span className="text-small text-mutedText">Critical</span>
            </div>
            <div className="text-h2 font-bold text-warning">{focusData.critical}</div>
          </div>
        )}

        {focusData.upcomingDeadlines > 0 && (
          <div className="p-3 bg-info/10 border border-info/30 rounded-control">
            <div className="flex items-center gap-2 mb-1">
              <Clock size={16} className="text-info" />
              <span className="text-small text-mutedText">Due This Week</span>
            </div>
            <div className="text-h2 font-bold text-info">{focusData.upcomingDeadlines}</div>
          </div>
        )}

        {focusData.blocked > 0 && (
          <div className="p-3 bg-danger/10 border border-danger/30 rounded-control">
            <div className="flex items-center gap-2 mb-1">
              <AlertCircle size={16} className="text-danger" />
              <span className="text-small text-mutedText">Blocked</span>
            </div>
            <div className="text-h2 font-bold text-danger">{focusData.blocked}</div>
          </div>
        )}

        {focusData.approvedNotScheduled > 0 && (
          <div className="p-3 bg-primary/10 border border-primary/30 rounded-control">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle size={16} className="text-primary" />
              <span className="text-small text-mutedText">Approved, Not Scheduled</span>
            </div>
            <div className="text-h2 font-bold text-primary">{focusData.approvedNotScheduled}</div>
          </div>
        )}
      </div>

      {/* Quick Wins */}
      {focusData.quickWins.length > 0 && (
        <div className="mt-6 pt-6 border-t border-border">
          <h3 className="text-h3 font-semibold text-text mb-3 flex items-center gap-2">
            <TrendingUp size={20} className="text-success" />
            Quick Wins
          </h3>
          <div className="space-y-2">
            {focusData.quickWins.map((req) => (
              <div
                key={req.request_id}
                className="p-2 bg-success/10 border border-success/30 rounded-control"
              >
                <div className="text-body text-text">{req.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Suggested Platform Focus */}
      {focusData.suggestedPlatform && (
        <div className="mt-6 pt-6 border-t border-border">
          <p className="text-body text-mutedText">
            <span className="font-medium text-text">Suggested focus:</span>{' '}
            <span className="capitalize">{focusData.suggestedPlatform}</span> has the most pending items
          </p>
        </div>
      )}
    </div>
  );
};

export default WeeklyFocusBanner;




