import React, { useState, useEffect } from 'react';
import { ListTodo, CheckCircle2, Circle, AlertTriangle, Clock, Calendar, Inbox, FileText, Megaphone, RefreshCw } from 'lucide-react';
import { useAuth } from './context/AuthContext';

const API_BASE = '/api';

// ── helpers ──────────────────────────────────────────────────────────────────

const getToday = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
};

const getWeekEnd = () => {
  const d = getToday();
  d.setDate(d.getDate() + 7);
  return d;
};

const groupItems = (items) => {
  const today = getToday();
  const todayEnd = new Date(today);
  todayEnd.setHours(23, 59, 59, 999);
  const weekEnd = getWeekEnd();

  const groups = { overdue: [], today: [], week: [], upcoming: [], noduedate: [] };

  for (const item of items) {
    if (!item.due_date) {
      groups.noduedate.push(item);
      continue;
    }
    const d = new Date(item.due_date);
    if (d < today) groups.overdue.push(item);
    else if (d <= todayEnd) groups.today.push(item);
    else if (d <= weekEnd) groups.week.push(item);
    else groups.upcoming.push(item);
  }
  return groups;
};

const formatDate = (val) => {
  if (!val) return null;
  const d = new Date(val);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
};

// ── sub-components ────────────────────────────────────────────────────────────

const TypeBadge = ({ type }) => {
  const config = {
    request: { label: 'Request', cls: 'bg-violet-500/15 text-violet-400 border border-violet-500/30' },
    deliverable: { label: 'Deliverable', cls: 'bg-amber-500/15 text-amber-400 border border-amber-500/30' },
    post: { label: 'Post', cls: 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/30' },
  }[type] || { label: type, cls: 'bg-surface2 text-mutedText border border-border' };

  return (
    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${config.cls}`}>
      {config.label}
    </span>
  );
};

const PriorityDot = ({ priority }) => {
  const color = {
    urgent: 'bg-red-500',
    high: 'bg-amber-500',
    medium: 'bg-blue-400',
    low: 'bg-green-500',
    normal: 'bg-blue-400',
  }[priority] || 'bg-gray-400';
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${color} flex-shrink-0`} title={priority} />
  );
};

const TypeIcon = ({ type }) => {
  if (type === 'request') return <Inbox size={14} className="text-violet-400 flex-shrink-0" />;
  if (type === 'deliverable') return <FileText size={14} className="text-amber-400 flex-shrink-0" />;
  if (type === 'post') return <Megaphone size={14} className="text-cyan-400 flex-shrink-0" />;
  return null;
};

const TodoCard = ({ item, onToggleDone, isDone }) => {
  return (
    <div
      className={`group relative flex items-start gap-3 p-4 rounded-xl border transition-all duration-200
        ${isDone
          ? 'bg-surface/40 dark:bg-surface-dark/40 border-border/40 opacity-50'
          : 'bg-white dark:bg-surface-dark border-border hover:border-primary/40 hover:shadow-md hover:shadow-primary/5'
        }`}
    >
      {/* Custom checkbox */}
      <button
        onClick={() => onToggleDone(item.id, item.type)}
        className="mt-0.5 flex-shrink-0 w-5 h-5 rounded-full border-2 transition-all duration-200
          flex items-center justify-center
          border-border group-hover:border-primary/60
          hover:border-primary hover:bg-primary/10"
        aria-label={isDone ? 'Mark undone' : 'Mark done'}
      >
        {isDone && <CheckCircle2 size={16} className="text-primary" />}
      </button>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap mb-1">
          <TypeIcon type={item.type} />
          <TypeBadge type={item.type} />
          {item.priority && <PriorityDot priority={item.priority} />}
          {item.platform && (
            <span className="text-xs text-mutedText capitalize">{item.platform}</span>
          )}
        </div>
        <p className={`text-sm font-medium leading-snug ${isDone ? 'line-through text-mutedText' : 'text-text'}`}>
          {item.title || '(untitled)'}
        </p>
        {item.due_date && (
          <div className="flex items-center gap-1 mt-1.5 text-xs text-mutedText">
            <Calendar size={11} />
            <span>{formatDate(item.due_date)}</span>
          </div>
        )}
      </div>
    </div>
  );
};

const SectionHeader = ({ icon: Icon, label, count, accentClass, emptyMessage }) => {
  if (count === 0 && emptyMessage) return null;
  return (
    <div className={`flex items-center gap-2.5 mb-3`}>
      <div className={`p-1.5 rounded-lg ${accentClass}`}>
        <Icon size={14} className="text-white" />
      </div>
      <h2 className="text-sm font-bold text-text uppercase tracking-wider">{label}</h2>
      <span className="ml-auto text-xs font-semibold text-mutedText bg-surface2 dark:bg-surface2-dark px-2 py-0.5 rounded-full">
        {count}
      </span>
    </div>
  );
};

// ── main component ────────────────────────────────────────────────────────────

const MasterTodoView = () => {
  const { authFetch } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [doneIds, setDoneIds] = useState(new Set()); // client-side only "done" state

  const fetchTodo = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await authFetch(`${API_BASE}/todo`);
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error || `Server error: ${res.status}`);
      }
      const data = await res.json();
      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Error fetching todo:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTodo();
  }, []);

  const handleToggleDone = (id, type) => {
    const key = `${type}-${id}`;
    setDoneIds((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const isDone = (id, type) => doneIds.has(`${type}-${id}`);

  const activeItems = items.filter((i) => !isDone(i.id, i.type));
  const groups = groupItems(activeItems);
  const completedItems = items.filter((i) => isDone(i.id, i.type));
  const totalCount = items.length;
  const doneCount = doneIds.size;

  // ── loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="animate-fadeIn space-y-6">
        <div className="flex items-center gap-3">
          <ListTodo size={24} className="text-primary" />
          <h1 className="text-h1 font-bold text-text">Master To-Do</h1>
        </div>
        <div className="grid gap-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-16 rounded-xl bg-surface2 dark:bg-surface2-dark animate-pulse border border-border"
              style={{ opacity: 1 - i * 0.15 }}
            />
          ))}
        </div>
      </div>
    );
  }

  // ── error ──────────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="animate-fadeIn space-y-6">
        <div className="flex items-center gap-3">
          <ListTodo size={24} className="text-primary" />
          <h1 className="text-h1 font-bold text-text">Master To-Do</h1>
        </div>
        <div className="card flex flex-col items-center gap-4 py-16 text-center">
          <AlertTriangle size={40} className="text-warning" />
          <p className="text-text font-medium">Failed to load to-do list</p>
          <p className="text-mutedText text-sm">{error}</p>
          <button onClick={fetchTodo} className="btn-primary flex items-center gap-2">
            <RefreshCw size={16} />
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── empty ──────────────────────────────────────────────────────────────────
  if (totalCount === 0) {
    return (
      <div className="animate-fadeIn space-y-6">
        <PageHeader totalCount={totalCount} doneCount={doneCount} onRefresh={fetchTodo} />
        <div className="card flex flex-col items-center gap-4 py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
            <CheckCircle2 size={32} className="text-primary" />
          </div>
          <p className="text-text font-semibold text-lg">All clear!</p>
          <p className="text-mutedText text-sm">No pending action items right now.</p>
        </div>
      </div>
    );
  }

  const sections = [
    {
      key: 'overdue',
      label: 'Overdue',
      icon: AlertTriangle,
      accent: 'bg-red-500',
      items: groups.overdue,
    },
    {
      key: 'today',
      label: 'Due Today',
      icon: Clock,
      accent: 'bg-amber-500',
      items: groups.today,
    },
    {
      key: 'week',
      label: 'This Week',
      icon: Calendar,
      accent: 'bg-primary',
      items: groups.week,
    },
    {
      key: 'upcoming',
      label: 'Upcoming',
      icon: ListTodo,
      accent: 'bg-blue-500',
      items: groups.upcoming,
    },
    {
      key: 'noduedate',
      label: 'No Due Date',
      icon: Circle,
      accent: 'bg-gray-400',
      items: groups.noduedate,
    },
  ].filter((s) => s.items.length > 0);

  return (
    <div className="animate-fadeIn space-y-8 max-w-3xl mx-auto pb-16">
      <PageHeader totalCount={totalCount} doneCount={doneCount} onRefresh={fetchTodo} />

      {/* Progress bar */}
      {totalCount > 0 && (
        <div className="card p-4 flex items-center gap-4">
          <div className="flex-1 h-2 rounded-full bg-surface2 dark:bg-surface2-dark overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${Math.round((doneCount / totalCount) * 100)}%` }}
            />
          </div>
          <span className="text-xs font-semibold text-mutedText flex-shrink-0">
            {doneCount}/{totalCount} done
          </span>
        </div>
      )}

      {/* Sections */}
      {sections.map((section) => (
        <div key={section.key} className="space-y-2">
          <SectionHeader
            icon={section.icon}
            label={section.label}
            count={section.items.length}
            accentClass={section.accent}
          />
          <div className="space-y-2">
            {section.items.map((item) => (
              <TodoCard
                key={`${item.type}-${item.id}`}
                item={item}
                onToggleDone={handleToggleDone}
                isDone={isDone(item.id, item.type)}
              />
            ))}
          </div>
        </div>
      ))}

      {/* Completed */}
      {completedItems.length > 0 && (
        <div className="space-y-2">
          <SectionHeader
            icon={CheckCircle2}
            label="Completed"
            count={completedItems.length}
            accentClass="bg-green-500"
          />
          <div className="space-y-2">
            {completedItems.map((item) => (
              <TodoCard
                key={`${item.type}-${item.id}-done`}
                item={item}
                onToggleDone={handleToggleDone}
                isDone={true}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const PageHeader = ({ totalCount, doneCount, onRefresh }) => (
  <div className="flex items-start justify-between gap-4">
    <div>
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center shadow-lg shadow-primary/20">
          <ListTodo size={20} className="text-white" />
        </div>
        <h1 className="text-h1 font-bold text-text">Master To-Do</h1>
      </div>
      <p className="text-mutedText text-sm mt-1 ml-13 pl-1">
        Aggregated action items across requests, deliverables, and posts
      </p>
    </div>
    <button
      onClick={onRefresh}
      className="btn-secondary flex items-center gap-2 flex-shrink-0"
      title="Refresh"
    >
      <RefreshCw size={15} />
      Refresh
    </button>
  </div>
);

export default MasterTodoView;
