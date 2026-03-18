import React, { useMemo, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import { getPlatformColor } from './utils';

/** Return a Date set to midnight local time for a given date */
const startOfDay = (d) => {
  const copy = new Date(d);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

/** Get the Sunday that starts the week containing `date` */
const startOfWeek = (date) => {
  const d = startOfDay(date);
  d.setDate(d.getDate() - d.getDay());
  return d;
};

/** Build an array of 7 Date objects starting from a Sunday */
const getWeekDays = (refDate) => {
  const sun = startOfWeek(refDate);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(sun);
    d.setDate(sun.getDate() + i);
    return d;
  });
};

/** Build the 5- or 6-row month grid (always starts on Sunday) */
const getMonthGrid = (refDate) => {
  const year = refDate.getFullYear();
  const month = refDate.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const lastOfMonth = new Date(year, month + 1, 0);
  const gridStart = startOfWeek(firstOfMonth);
  // enough rows to cover the whole month
  const totalCells = Math.ceil((lastOfMonth.getDate() + gridStart.getDay()) / 7) * 7;
  // at least 35 to avoid tiny grids
  const cells = Math.max(totalCells, 35);
  return Array.from({ length: cells }, (_, i) => {
    const d = new Date(gridStart);
    d.setDate(gridStart.getDate() + i);
    return d;
  });
};

/** Format YYYY-MM-DD for a Date (local) */
const toKey = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

const CalendarView = ({
  posts,
  calendarView,
  onAddPost,
  onViewChange,
  isDarkMode = true,
}) => {
  const [refDate, setRefDate] = useState(() => startOfDay(new Date()));

  // Index posts by YYYY-MM-DD for O(1) lookup
  const postsByDate = useMemo(() => {
    const map = {};
    (posts || []).forEach((post) => {
      const raw = post.scheduled_at || post.published_at;
      if (!raw) return;
      const key = toKey(new Date(raw));
      (map[key] = map[key] || []).push(post);
    });
    return map;
  }, [posts]);

  const days = useMemo(
    () => (calendarView === 'week' ? getWeekDays(refDate) : getMonthGrid(refDate)),
    [calendarView, refDate],
  );

  const today = toKey(new Date());
  const refMonth = refDate.getMonth();

  const stepBack = () => {
    setRefDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() - (calendarView === 'week' ? 7 : 0));
      if (calendarView === 'month') d.setMonth(d.getMonth() - 1);
      return d;
    });
  };

  const stepForward = () => {
    setRefDate((prev) => {
      const d = new Date(prev);
      d.setDate(d.getDate() + (calendarView === 'week' ? 7 : 0));
      if (calendarView === 'month') d.setMonth(d.getMonth() + 1);
      return d;
    });
  };

  const goToday = () => setRefDate(startOfDay(new Date()));

  const headerLabel =
    calendarView === 'week'
      ? (() => {
          const first = days[0];
          const last = days[6];
          const opts = { month: 'short', day: 'numeric' };
          const yearPart = last.getFullYear();
          return `${first.toLocaleDateString(undefined, opts)} – ${last.toLocaleDateString(undefined, opts)}, ${yearPart}`;
        })()
      : refDate.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Page header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-h1 font-bold text-text">Content Calendar</h1>
          <p className="text-mutedText mt-1">Plan and schedule your posts</p>
        </div>
        <button onClick={onAddPost} className="btn-primary flex items-center gap-2">
          <Plus size={20} />
          Add Post
        </button>
      </div>

      <div className="card">
        {/* Toolbar */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={stepBack} className="p-2 rounded-lg border border-border hover:bg-surface2 transition-colors">
              <ChevronLeft size={18} />
            </button>
            <h2 className="text-xl font-bold text-text min-w-[220px] text-center">{headerLabel}</h2>
            <button onClick={stepForward} className="p-2 rounded-lg border border-border hover:bg-surface2 transition-colors">
              <ChevronRight size={18} />
            </button>
            <button onClick={goToday} className="ml-2 px-3 py-1 text-sm border border-border rounded-lg hover:bg-surface2 transition-colors text-text">
              Today
            </button>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onViewChange('week')}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                calendarView === 'week'
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-text hover:bg-surface2'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => onViewChange('month')}
              className={`px-4 py-2 border rounded-lg transition-colors ${
                calendarView === 'month'
                  ? 'bg-primary text-white border-primary'
                  : 'border-border text-text hover:bg-surface2'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {/* Day-of-week header */}
        <div className="grid grid-cols-7 gap-2 mb-2">
          {DAY_LABELS.map((label) => (
            <div key={label} className="text-center text-sm font-semibold text-mutedText py-2">
              {label}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className={`grid grid-cols-7 gap-2`}>
          {days.map((date, i) => {
            const key = toKey(date);
            const dayPosts = postsByDate[key] || [];
            const isToday = key === today;
            const isCurrentMonth = date.getMonth() === refMonth;
            const isWeekView = calendarView === 'week';

            return (
              <div
                key={i}
                className={`${isWeekView ? 'min-h-[160px]' : 'min-h-[100px]'} p-2 border rounded-lg transition-all hover:border-primary/50 hover:shadow-sm ${
                  isToday
                    ? 'border-primary bg-primary/5'
                    : isCurrentMonth || isWeekView
                      ? 'border-border bg-surface'
                      : 'border-border/50 bg-surface2/50'
                }`}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isToday
                      ? 'text-primary font-bold'
                      : isCurrentMonth || isWeekView
                        ? 'text-text'
                        : 'text-mutedText'
                  }`}
                >
                  {isWeekView
                    ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    : date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayPosts.map((post) => (
                    <div
                      key={post.post_id}
                      className={`text-xs p-1.5 rounded ${getPlatformColor(post.platform)} cursor-pointer hover:shadow-md transition-shadow`}
                    >
                      <div className="font-medium truncate">
                        {post.content?.substring(0, isWeekView ? 40 : 20) || 'Untitled post'}
                      </div>
                      {isWeekView && (
                        <div className="text-[10px] opacity-75 mt-0.5 capitalize">{post.platform}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default CalendarView;
