import React from 'react';
import { ChevronRight } from 'lucide-react';
import { PlatformIcon } from '../ui/PlatformIcon';
import { StatusPill } from '../ui';

const AwaitingReview = ({ posts, onPostClick }) => {
  return (
    <section>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-base font-semibold text-ds-fg">
          Awaiting your review
          {posts.length > 0 && (
            <span className="ml-2 text-xs font-medium text-ds-fg-muted">· {posts.length}</span>
          )}
        </h2>
      </div>

      {posts.length === 0 ? (
        <p className="text-sm text-ds-fg-muted py-6">Nothing waiting on your review.</p>
      ) : (
        <div className="space-y-1">
          {posts.map((post) => (
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
              <StatusPill status="in_review" />
              <ChevronRight size={14} className="text-ds-fg-subtle shrink-0" />
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default AwaitingReview;
