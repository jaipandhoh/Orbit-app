import React, { useState } from 'react';
import { Plus, Calendar, LayoutGrid } from 'lucide-react';
import CalendarView from './CalendarView';
import PostsKanbanView from './PostsKanbanView';

const PostsView = ({ posts, campaigns, onAddPost, onPatchPost, isDarkMode }) => {
  const [mode, setMode] = useState('calendar'); // 'calendar' | 'kanban'
  const [calendarView, setCalendarView] = useState('month'); // 'week' | 'month'

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Page header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-h1 font-bold text-text">Posts</h1>
          <p className="text-mutedText mt-0.5">Plan and schedule your content</p>
        </div>

        <div className="flex items-center gap-3">
          {/* View switcher */}
          <div className="flex items-center bg-surface2 rounded-lg p-0.5 border border-border">
            <button
              onClick={() => setMode('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'calendar'
                  ? 'bg-white dark:bg-surface text-text shadow-sm'
                  : 'text-mutedText hover:text-text'
              }`}
            >
              <Calendar size={14} />
              Calendar
            </button>
            <button
              onClick={() => setMode('kanban')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                mode === 'kanban'
                  ? 'bg-white dark:bg-surface text-text shadow-sm'
                  : 'text-mutedText hover:text-text'
              }`}
            >
              <LayoutGrid size={14} />
              Board
            </button>
          </div>

          <button onClick={onAddPost} className="btn-primary flex items-center gap-2">
            <Plus size={18} />
            Add Post
          </button>
        </div>
      </div>

      {/* Content */}
      {mode === 'calendar' ? (
        <div className="card">
          <CalendarView
            posts={posts}
            calendarView={calendarView}
            onAddPost={onAddPost}
            onViewChange={setCalendarView}
            onPatchPost={onPatchPost}
            isDarkMode={isDarkMode}
          />
        </div>
      ) : (
        <PostsKanbanView
          posts={posts}
          campaigns={campaigns}
          onPatchPost={onPatchPost}
        />
      )}
    </div>
  );
};

export default PostsView;
