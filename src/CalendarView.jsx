import React, { useMemo, useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { PlatformIcon } from './components/ui/PlatformIcon';

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
  const totalCells = Math.ceil((lastOfMonth.getDate() + gridStart.getDay()) / 7) * 7;
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

/** Individual post chip — draggable */
const PostChip = ({ post, isWeekView }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: String(post.post_id),
  });

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-1.5 text-xs p-1.5 rounded-md bg-white border border-ds-border cursor-grab active:cursor-grabbing hover:shadow-sm transition-shadow touch-none ${
        isDragging ? 'opacity-30' : ''
      }`}
    >
      <PlatformIcon platform={post.platform} size={18} className="shrink-0" />
      <span className="font-medium text-ds-fg truncate">
        {post.content?.substring(0, isWeekView ? 40 : 20) || 'Untitled post'}
      </span>
    </div>
  );
};

/** Floating clone rendered while dragging */
const DragChip = ({ post }) => (
  <div className="flex items-center gap-1.5 text-xs p-1.5 rounded-md bg-white border border-ds-border shadow-xl rotate-2 cursor-grabbing">
    <PlatformIcon platform={post.platform} size={18} className="shrink-0" />
    <span className="font-medium text-ds-fg truncate max-w-[120px]">
      {post.content?.substring(0, 30) || 'Untitled post'}
    </span>
  </div>
);

/** Day cell — droppable */
const DayCell = ({ dateKey, isToday, isCurrentMonth, isWeekView, children }) => {
  const { setNodeRef, isOver } = useDroppable({ id: dateKey });

  return (
    <div
      ref={setNodeRef}
      className={`${isWeekView ? 'min-h-[160px]' : 'min-h-[100px]'} p-2 border rounded-lg transition-all ${
        isOver
          ? 'border-ds-accent bg-ds-accent-subtle shadow-sm'
          : isToday
            ? 'border-ds-accent bg-ds-accent-subtle/30'
            : isCurrentMonth || isWeekView
              ? 'border-ds-border bg-white hover:border-ds-border-strong hover:shadow-sm'
              : 'border-ds-border/50 bg-ds-bg-subtle/50'
      }`}
    >
      {children}
    </div>
  );
};

const CalendarView = ({
  posts,
  calendarView,
  onViewChange,
  onPatchPost,
}) => {
  const [refDate, setRefDate] = useState(() => startOfDay(new Date()));
  const [activePost, setActivePost] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

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

  // Flat post lookup by id for drag overlay
  const postsById = useMemo(() => {
    const map = {};
    (posts || []).forEach((p) => { map[p.post_id] = p; });
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

  const handleDragStart = ({ active }) => {
    setActivePost(postsById[Number(active.id)] || null);
  };

  const handleDragEnd = ({ active, over }) => {
    setActivePost(null);
    if (!over) return;

    const postId = Number(active.id);
    const targetDateKey = over.id;

    const post = postsById[postId];
    if (!post) return;

    const existingRaw = post.scheduled_at || post.published_at;
    const currentKey = existingRaw ? toKey(new Date(existingRaw)) : null;
    if (currentKey === targetDateKey) return;

    const [y, m, d] = targetDateKey.split('-').map(Number);
    const existing = post.scheduled_at ? new Date(post.scheduled_at) : null;
    const newDate = new Date(
      y,
      m - 1,
      d,
      existing ? existing.getHours() : 12,
      existing ? existing.getMinutes() : 0,
      0,
    );

    onPatchPost(postId, { scheduled_at: newDate.toISOString() });
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Calendar toolbar — nav + week/month toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={stepBack} className="p-2 rounded-lg border border-ds-border hover:bg-ds-bg-subtle transition-colors duration-150">
              <ChevronLeft size={18} className="text-ds-fg-muted" />
            </button>
            <h2 className="text-lg font-semibold text-ds-fg min-w-[220px] text-center">{headerLabel}</h2>
            <button onClick={stepForward} className="p-2 rounded-lg border border-ds-border hover:bg-ds-bg-subtle transition-colors duration-150">
              <ChevronRight size={18} className="text-ds-fg-muted" />
            </button>
            <button onClick={goToday} className="ml-2 px-3 py-1.5 text-sm font-medium border border-ds-border rounded-lg hover:bg-ds-bg-subtle transition-colors duration-150 text-ds-fg">
              Today
            </button>
          </div>

          <div className="flex gap-1 border border-ds-border rounded-lg p-0.5">
            <button
              onClick={() => onViewChange('week')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 ${
                calendarView === 'week'
                  ? 'bg-ds-accent text-white'
                  : 'text-ds-fg-muted hover:text-ds-fg hover:bg-ds-bg-subtle'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => onViewChange('month')}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors duration-150 ${
                calendarView === 'month'
                  ? 'bg-ds-accent text-white'
                  : 'text-ds-fg-muted hover:text-ds-fg hover:bg-ds-bg-subtle'
              }`}
            >
              Month
            </button>
          </div>
        </div>

        {/* Day-of-week header */}
        <div className="grid grid-cols-7 gap-2">
          {DAY_LABELS.map((label) => (
            <div key={label} className="text-center text-xs font-semibold uppercase tracking-wider text-ds-fg-muted py-2">
              {label}
            </div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((date, i) => {
            const key = toKey(date);
            const dayPosts = postsByDate[key] || [];
            const isToday = key === today;
            const isCurrentMonth = date.getMonth() === refMonth;
            const isWeekView = calendarView === 'week';

            return (
              <DayCell
                key={i}
                dateKey={key}
                isToday={isToday}
                isCurrentMonth={isCurrentMonth}
                isWeekView={isWeekView}
              >
                <div
                  className={`text-sm font-medium mb-1 ${
                    isToday
                      ? 'text-ds-accent font-bold'
                      : isCurrentMonth || isWeekView
                        ? 'text-ds-fg'
                        : 'text-ds-fg-subtle'
                  }`}
                >
                  {isWeekView
                    ? date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
                    : date.getDate()}
                </div>
                <div className="space-y-1">
                  {dayPosts.map((post) => (
                    <PostChip key={post.post_id} post={post} isWeekView={isWeekView} />
                  ))}
                </div>
              </DayCell>
            );
          })}
        </div>
      </div>

      <DragOverlay>
        {activePost ? <DragChip post={activePost} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default CalendarView;
