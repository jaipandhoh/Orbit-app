import React, { useMemo, useState } from 'react';
import { Plus, ChevronLeft, ChevronRight } from 'lucide-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { getPlatformColor, getPlatformAccentColor } from './utils';

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
      className={`text-xs p-1.5 rounded border-l-4 ${getPlatformColor(post.platform)} ${getPlatformAccentColor(post.platform)} cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow touch-none ${
        isDragging ? 'opacity-30' : ''
      }`}
    >
      <div className="font-medium truncate">
        {post.content?.substring(0, isWeekView ? 40 : 20) || 'Untitled post'}
      </div>
      <div className="text-[10px] opacity-75 mt-0.5 capitalize">{post.platform}</div>
    </div>
  );
};

/** Floating clone rendered while dragging */
const DragChip = ({ post }) => (
  <div
    className={`text-xs p-1.5 rounded border-l-4 ${getPlatformColor(post.platform)} ${getPlatformAccentColor(post.platform)} shadow-xl rotate-2 cursor-grabbing`}
  >
    <div className="font-medium truncate max-w-[120px]">
      {post.content?.substring(0, 30) || 'Untitled post'}
    </div>
    <div className="text-[10px] opacity-75 mt-0.5 capitalize">{post.platform}</div>
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
          ? 'border-primary bg-primary/10 shadow-sm'
          : isToday
            ? 'border-primary bg-primary/5'
            : isCurrentMonth || isWeekView
              ? 'border-border bg-surface hover:border-primary/50 hover:shadow-sm'
              : 'border-border/50 bg-surface2/50'
      }`}
    >
      {children}
    </div>
  );
};

const CalendarView = ({
  posts,
  calendarView,
  onAddPost,
  onViewChange,
  onPatchPost,
  isDarkMode = true,
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
    const targetDateKey = over.id; // YYYY-MM-DD — this is the droppable id

    const post = postsById[postId];
    if (!post) return;

    const existingRaw = post.scheduled_at || post.published_at;
    const currentKey = existingRaw ? toKey(new Date(existingRaw)) : null;
    if (currentKey === targetDateKey) return;

    // Preserve original time-of-day if available, otherwise default to noon
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
      <div className="space-y-6">
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
