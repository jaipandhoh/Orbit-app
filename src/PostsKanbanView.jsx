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
import { getPlatformColor, getPlatformAccentColor } from './utils';

// Column droppable IDs match the posts.status enum values exactly.
// The over.id → status mapping depends on this — do not use display labels here.
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
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      className={`card border-l-4 ${getPlatformAccentColor(post.platform)} cursor-grab active:cursor-grabbing touch-none transition-shadow ${
        isDragging ? 'opacity-30' : 'hover:shadow-md'
      }`}
    >
      {/* Content preview */}
      <p className="text-sm text-text leading-snug line-clamp-2 mb-2">
        {post.content || 'Untitled post'}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <span
          className={`text-xs px-2 py-0.5 rounded-full font-medium ${getPlatformColor(post.platform)}`}
        >
          {post.platform}
        </span>
        <div className="flex items-center gap-2 text-xs text-mutedText">
          {campaignName && <span className="truncate max-w-[100px]">{campaignName}</span>}
          {dateStr && <span>{dateStr}</span>}
        </div>
      </div>
    </div>
  );
};

/** Floating clone rendered while dragging */
const DragCard = ({ post }) => (
  <div
    className={`card border-l-4 ${getPlatformAccentColor(post.platform)} shadow-xl rotate-1 cursor-grabbing w-64`}
  >
    <p className="text-sm text-text line-clamp-2">{post.content || 'Untitled post'}</p>
    <span className={`text-xs px-2 py-0.5 rounded-full font-medium mt-2 inline-block ${getPlatformColor(post.platform)}`}>
      {post.platform}
    </span>
  </div>
);

/** Kanban column — droppable */
const Column = ({ column, posts, campaigns }) => {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });

  const campaignMap = {};
  (campaigns || []).forEach((c) => { campaignMap[c.campaign_id] = c.title; });

  return (
    <div className="flex-shrink-0 w-72">
      {/* Column header */}
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-semibold text-text">{column.label}</h3>
        <span className="text-xs font-semibold text-mutedText bg-surface2 rounded-full px-2 py-0.5">
          {posts.length}
        </span>
      </div>

      {/* Cards */}
      <div
        ref={setNodeRef}
        className={`space-y-2.5 min-h-[200px] p-2 rounded-lg transition-colors ${
          isOver ? 'bg-primary/5 ring-1 ring-primary/30' : 'bg-surface2/40'
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
          <div className="border-2 border-dashed border-border rounded-control h-20 flex items-center justify-center">
            <span className="text-xs text-mutedText/50">Empty</span>
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
    const newStatus = over.id; // droppable id === status enum value ('draft' | 'scheduled' | 'published')

    const post = postsById[postId];
    if (!post || post.status === newStatus) return;

    // Kanban drag updates status only. Transition side-effects (e.g. setting
    // published_at when moving to 'published') are intentionally deferred to Feature 2.
    onPatchPost(postId, { status: newStatus });
  };

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-5 overflow-x-auto pb-6">
        {COLUMNS.map((col) => (
          <Column
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
