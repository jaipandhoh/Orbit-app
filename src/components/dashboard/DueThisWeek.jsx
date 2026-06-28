import React from 'react';
import { ChevronRight } from 'lucide-react';
import { PlatformIcon } from '../ui/PlatformIcon';

function groupByDay(posts) {
  const groups = {};
  for (const post of posts) {
    const date = new Date(post.scheduled_at);
    const key = date.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
    if (!groups[key]) groups[key] = [];
    groups[key].push(post);
  }
  return Object.entries(groups);
}

function formatTime(dateStr) {
  const d = new Date(dateStr);
  return d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
}

const DueThisWeek = ({ posts, onPostClick }) => {
  const grouped = groupByDay(posts);

  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-ds-fg">
          Due this week
          {posts.length > 0 && (
            <span className="ml-2 text-xs font-medium text-ds-fg-muted">· {posts.length}</span>
          )}
        </h2>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-ds-fg-muted py-6">No posts due this week — nice work.</p>
      ) : (
        <div className="space-y-5">
          {grouped.map(([day, dayPosts]) => (
            <div key={day}>
              <p className="text-xs font-medium text-ds-fg-muted uppercase tracking-wide mb-2">{day}</p>
              <div className="space-y-1">
                {dayPosts.map((post) => (
                  <button
                    key={post.post_id}
                    onClick={() => onPostClick(post)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-ds-bg-subtle transition-colors duration-150 text-left cursor-pointer"
                  >
                    <PlatformIcon platform={post.platform} size={28} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-ds-fg truncate">
                        {(post.content || '').slice(0, 80)}{(post.content || '').length > 80 ? '…' : ''}
                      </p>
                      <p className="text-xs text-ds-fg-muted">{post.campaign_title || 'No campaign'}</p>
                    </div>
                    <span className="text-xs text-ds-fg-muted shrink-0">{formatTime(post.scheduled_at)}</span>
                    <ChevronRight size={14} className="text-ds-fg-subtle shrink-0" />
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default DueThisWeek;
