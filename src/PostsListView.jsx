import React from 'react';
import { StatusPill } from './components/ui';
import { PlatformIcon } from './components/ui/PlatformIcon';
import { Table, THead, TBody, TR, TH, TD } from './components/ui/Table';

const formatDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

const PostsListView = ({ posts = [], campaigns = [] }) => {
  const campaignMap = {};
  (campaigns || []).forEach((c) => { campaignMap[c.campaign_id] = c.title; });

  if (posts.length === 0) {
    return (
      <div className="text-center py-16 text-ds-fg-muted text-sm">
        No posts yet. Create your first post to get started.
      </div>
    );
  }

  return (
    <div className="border border-ds-border rounded-xl overflow-hidden">
      <Table>
        <THead>
          <TR>
            <TH>Post</TH>
            <TH>Platform</TH>
            <TH>Status</TH>
            <TH>Campaign</TH>
            <TH>Scheduled</TH>
            <TH>Published</TH>
          </TR>
        </THead>
        <TBody>
          {posts.map((post) => (
            <TR key={post.post_id}>
              <TD>
                <p className="text-sm text-ds-fg line-clamp-2 max-w-[300px]">
                  {post.content || 'Untitled post'}
                </p>
              </TD>
              <TD>
                <div className="flex items-center gap-2">
                  <PlatformIcon platform={post.platform} size={22} />
                  <span className="text-sm text-ds-fg capitalize">{post.platform}</span>
                </div>
              </TD>
              <TD>
                <StatusPill status={post.status || 'draft'} />
              </TD>
              <TD>
                <span className="text-sm text-ds-fg-muted truncate max-w-[140px] block">
                  {campaignMap[post.campaign_id] || '--'}
                </span>
              </TD>
              <TD>
                {formatDate(post.scheduled_at) || <span className="text-ds-fg-subtle">--</span>}
              </TD>
              <TD>
                {formatDate(post.published_at) || <span className="text-ds-fg-subtle">--</span>}
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </div>
  );
};

export default PostsListView;
