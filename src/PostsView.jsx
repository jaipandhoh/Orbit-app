import React, { useState, useMemo } from 'react';
import { Plus } from 'lucide-react';
import CalendarView from './CalendarView';
import PostsKanbanView from './PostsKanbanView';
import PostsListView from './PostsListView';
import { Button, Tabs, Select } from './components/ui';

const VIEW_TABS = [
  { value: 'kanban', label: 'Kanban' },
  { value: 'calendar', label: 'Calendar' },
  { value: 'list', label: 'List' },
];

const VALID_VIEWS = new Set(['kanban', 'calendar', 'list']);

function getInitialView() {
  try {
    const params = new URLSearchParams(window.location.search);
    const v = params.get('view');
    if (v && VALID_VIEWS.has(v)) return v;
  } catch { /* ignore */ }
  return 'kanban';
}

function syncViewToUrl(view) {
  try {
    const url = new URL(window.location.href);
    url.searchParams.set('view', view);
    window.history.replaceState({}, '', url.toString());
  } catch { /* ignore */ }
}

const PostsView = ({ posts, campaigns, onAddPost, onPatchPost }) => {
  const [viewMode, setViewMode] = useState(getInitialView);
  const [calendarView, setCalendarView] = useState('month');
  const [campaignFilter, setCampaignFilter] = useState('');

  const handleViewChange = (v) => {
    setViewMode(v);
    syncViewToUrl(v);
  };

  // Campaign filter options
  const campaignOptions = useMemo(() => {
    return (campaigns || []).map((c) => ({
      value: String(c.campaign_id),
      label: c.title || 'Untitled',
    }));
  }, [campaigns]);

  // Filtered posts
  const filteredPosts = useMemo(() => {
    if (!campaignFilter) return posts || [];
    const id = Number(campaignFilter);
    return (posts || []).filter((p) => p.campaign_id === id);
  }, [posts, campaignFilter]);

  return (
    <div className="animate-fadeIn">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ds-fg">Posts</h1>
          <p className="text-sm text-ds-fg-muted mt-1">Plan and schedule your content across platforms.</p>
        </div>
        <Button variant="primary" onClick={onAddPost}>
          <Plus size={16} />
          Add Post
        </Button>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 border-b border-ds-border">
        <Tabs tabs={VIEW_TABS} activeTab={viewMode} onChange={handleViewChange} />
        <div className="pb-2">
          <Select
            value={campaignFilter}
            onChange={setCampaignFilter}
            options={campaignOptions}
            placeholder="All campaigns"
            className="w-48"
          />
        </div>
      </div>

      {/* View content */}
      {viewMode === 'kanban' && (
        <PostsKanbanView
          posts={filteredPosts}
          campaigns={campaigns}
          onPatchPost={onPatchPost}
        />
      )}
      {viewMode === 'calendar' && (
        <CalendarView
          posts={filteredPosts}
          calendarView={calendarView}
          onViewChange={setCalendarView}
          onPatchPost={onPatchPost}
        />
      )}
      {viewMode === 'list' && (
        <PostsListView
          posts={filteredPosts}
          campaigns={campaigns}
        />
      )}
    </div>
  );
};

export default PostsView;
