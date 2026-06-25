import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { Card, StatusPill } from './components/ui';
import { PlatformIcon } from './components/ui/PlatformIcon';

const COLUMNS = [
  { id: 'draft',     label: 'Draft' },
  { id: 'scheduled', label: 'Scheduled' },
  { id: 'published', label: 'Published' },
];

const formatDate = (value) => {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
};

/** Individual post card — draggable */
const PostCard = ({ post, campaignName }) => {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: String(post.post_id),
  });

  const dateStr = formatDate(post.scheduled_at);

  return (
    <Card
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`p-3 cursor-grab active:cursor-grabbing touch-none ${
        isDragging ? 'opacity-30' : ''
      }`}
    >
      <p className="text-sm text-ds-fg leading-snug line-clamp-2 mb-3">
        {post.content || 'Untitled post'}
      </p>

      <div className="flex items-center justify-between gap-2 flex-wrap">
        <PlatformIcon platform={post.platform} size={22} />
        <div className="flex items-center gap-2 text-xs text-ds-fg-muted">
          {campaignName && <span className="truncate max-w-[100px]">{campaignName}</span>}
          {dateStr && <span>{dateStr}</span>}
        </div>
      </div>
    </Card>
  );
};

/** Floating clone rendered while dragging */
const DragCard = ({ post }) => (
  <Card className="p-3 shadow-xl rotate-1 cursor-grabbing w-64">
    <p className="text-sm text-ds-fg line-clamp-2 mb-2">{post.content || 'Untitled post'}</p>
    <PlatformIcon platform={post.platform} size={22} />
  </Card>
);

/** Kanban column — droppable */
const KanbanColumn = ({ column, posts, campaigns }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const campaignMap = {};
  (campaigns || []).forEach((c) => { campaignMap[c.campaign_id] = c.title; });

  return (
    <div className="flex-1 min-w-[240px]">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <StatusPill status={column.id} label={column.label} />
        </div>
        <span className="text-xs font-semibold text-ds-fg-muted bg-ds-bg-subtle rounded-full px-2 py-0.5">
          {posts.length}
        </span>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className={`space-y-2.5 min-h-[200px] p-2 rounded-lg transition-colors duration-150 ${
          isOver ? 'bg-ds-accent-subtle ring-1 ring-ds-accent/30' : 'bg-ds-bg-subtle/60'
        }`}
      >
        {posts.map((post) => (
          <PostCard
            key={post.post_id}
            post={post}
            campaignName={campaignMap[post.campaign_id] || null}
          />
        ))}

        {posts.length === 0 && (
          <div className="border-2 border-dashed border-ds-border rounded-lg h-20 flex items-center justify-center">
            <span className="text-xs text-ds-fg-subtle">No posts</span>
          </div>
        )}
      </div>
    </div>
  );
};

const PostsKanbanView = ({ posts = [], campaigns = [], onPatchPost }) => {
  const [activePost, setActivePost] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  );

  const postsById = {};
  posts.forEach((p) => { postsById[p.post_id] = p; });

  const handleDragStart = ({ active }) => {
    setActivePost(postsById[Number(active.id)] || null);
  };

  const handleDragEnd = ({ active, over }) => {
    setActivePost(null);
    if (!over) return;

    const postId = Number(active.id);
    const newStatus = over.id;

    const post = postsById[postId];
    if (!post || post.status === newStatus) return;

    onPatchPost(postId, { status: newStatus });
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((col) => (
          <KanbanColumn
            key={col.id}
            column={col}
            posts={posts.filter((p) => (p.status || 'draft') === col.id)}
            campaigns={campaigns}
          />
        ))}
      </div>

      <DragOverlay>
        {activePost ? <DragCard post={activePost} /> : null}
      </DragOverlay>
    </DndContext>
  );
};

export default PostsKanbanView;
