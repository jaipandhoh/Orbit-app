import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, MessageSquare, Pin, Heart, Share2, Bookmark, MoreHorizontal, RefreshCw, Send, ThumbsUp } from 'lucide-react';

const InstagramWrapper = ({ children, caption }) => (
  <div className="w-full max-w-[400px] mx-auto bg-surface border border-border rounded-xl font-sans overflow-hidden shadow-sm">
    <div className="flex items-center justify-between p-3 border-b border-border/50">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 p-[2px]">
          <div className="w-full h-full rounded-full border-2 border-surface bg-zinc-200 dark:bg-zinc-700" />
        </div>
        <span className="text-sm font-semibold text-text">orbit_pr</span>
      </div>
      <MoreHorizontal size={20} className="text-mutedText" />
    </div>
    <div className="bg-black w-full flex justify-center border-b border-border">
      {children}
    </div>
    <div className="p-3">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-4">
          <Heart size={24} className="text-text hover:text-red-500 transition-colors cursor-pointer" />
          <MessageSquare size={24} className="text-text cursor-pointer" />
          <Send size={24} className="text-text cursor-pointer" />
        </div>
        <Bookmark size={24} className="text-text cursor-pointer" />
      </div>
      <div className="text-sm font-semibold text-text mb-1">1,234 likes</div>
      <div className="text-sm text-text">
        <span className="font-semibold mr-2">orbit_pr</span>
        {caption || "Exciting things coming soon! 🚀 #PR #Orbit"}
      </div>
    </div>
  </div>
);

const TikTokWrapper = ({ children, caption }) => (
  <div className="w-full max-w-[350px] mx-auto bg-black rounded-2xl overflow-hidden relative font-sans text-white border border-border/50 shadow-sm">
    <div className="relative w-full flex justify-center items-center overflow-hidden">
      {children}
    </div>
    <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-10 pointer-events-none">
       <div className="w-12 h-12 rounded-full border-2 border-white bg-zinc-800 flex items-center justify-center font-bold text-lg mb-2 relative pointer-events-auto cursor-pointer">
         O
         <div className="absolute -bottom-2 bg-red-500 rounded-full w-5 h-5 flex items-center justify-center text-xs">+</div>
       </div>
       <div className="flex flex-col items-center gap-1 pointer-events-auto cursor-pointer group">
         <Heart size={36} className="drop-shadow-md text-white group-hover:text-red-500 transition-colors" />
         <span className="text-xs font-semibold drop-shadow-md">124K</span>
       </div>
       <div className="flex flex-col items-center gap-1 pointer-events-auto cursor-pointer">
         <MessageSquare size={36} className="drop-shadow-md fill-current text-white" />
         <span className="text-xs font-semibold drop-shadow-md">402</span>
       </div>
       <div className="flex flex-col items-center gap-1 pointer-events-auto cursor-pointer">
         <Bookmark size={36} className="drop-shadow-md fill-current text-white hover:text-yellow-400 transition-colors" />
         <span className="text-xs font-semibold drop-shadow-md">12K</span>
       </div>
       <div className="flex flex-col items-center gap-1 pointer-events-auto cursor-pointer">
         <Share2 size={36} className="drop-shadow-md fill-current text-white" />
         <span className="text-xs font-semibold drop-shadow-md">Share</span>
       </div>
    </div>
    <div className="absolute bottom-4 left-4 right-20 z-10 pointer-events-none">
       <div className="font-semibold text-base mb-2 drop-shadow-md text-white">@orbit.pr</div>
       <div className="text-sm font-medium drop-shadow-md line-clamp-2 mb-3 text-white">
         {caption || "Sneak peek at the new campaign! 👀 #behindthescenes"}
       </div>
       <div className="flex items-center gap-2 text-sm drop-shadow-md font-semibold text-white">
          <span className="animate-spin duration-3000 inline-block">🎵</span> Original Audio - Orbit
       </div>
    </div>
    <div className="absolute top-6 left-0 right-0 flex justify-center gap-4 z-10 text-lg font-semibold drop-shadow-md text-white/80 pointer-events-none">
      <span className="pointer-events-auto cursor-pointer hover:text-white transition-colors">Following</span>
      <span className="text-white border-b-2 border-white pb-1 pointer-events-auto cursor-pointer">For You</span>
    </div>
  </div>
);

const TwitterWrapper = ({ children, caption }) => (
  <div className="w-full max-w-[500px] mx-auto bg-surface border border-border rounded-xl text-text font-sans flex p-4 gap-3 shadow-sm">
    <div className="w-10 h-10 rounded-full bg-zinc-200 dark:bg-zinc-700 flex-shrink-0" />
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-1 mb-1">
        <span className="font-bold text-text truncate">Orbit PR</span>
        <span className="text-mutedText truncate">@orbit_pr</span>
        <span className="text-mutedText">·</span>
        <span className="text-mutedText">2h</span>
      </div>
      <div className="text-body mb-3 whitespace-pre-wrap">
        {caption || "Just dropped: our latest campaign assets! What do you think? 🚀"}
      </div>
      <div className="rounded-xl border border-border overflow-hidden bg-black mb-3 relative flex justify-center">
        {children}
      </div>
      <div className="flex flex-wrap items-center justify-between text-mutedText pr-8 mt-2">
        <div className="flex items-center gap-2 hover:text-primary cursor-pointer transition-colors"><MessageSquare size={16} /> <span className="text-xs">12</span></div>
        <div className="flex items-center gap-2 hover:text-success cursor-pointer transition-colors"><RefreshCw size={16} /> <span className="text-xs">48</span></div>
        <div className="flex items-center gap-2 hover:text-danger cursor-pointer transition-colors"><Heart size={16} /> <span className="text-xs">256</span></div>
        <div className="flex items-center gap-2 hover:text-primary cursor-pointer transition-colors"><Bookmark size={16} /></div>
        <div className="flex items-center gap-2 hover:text-primary cursor-pointer transition-colors"><Share2 size={16} /></div>
      </div>
    </div>
  </div>
);

const LinkedInWrapper = ({ children, caption }) => (
  <div className="w-full max-w-[550px] mx-auto bg-surface border border-border rounded-xl font-sans overflow-hidden shadow-sm">
    <div className="p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-12 h-12 rounded-full bg-zinc-200 dark:bg-zinc-700 flex-shrink-0" />
        <div className="flex-1">
          <div className="font-bold text-text">Orbit PR Team</div>
          <div className="text-xs text-mutedText">Marketing & Corporate Communications</div>
          <div className="text-xs text-mutedText flex items-center gap-1">2d • 🌍</div>
        </div>
        <button className="text-primary font-bold text-sm bg-primary/10 px-3 py-1 rounded-full flex items-center gap-1 hover:bg-primary/20 transition-colors">
          + Follow
        </button>
      </div>
      <div className="text-sm text-text mb-3 whitespace-pre-wrap">
        {caption || "We're thrilled to unveil our new strategic direction. Let us know your thoughts below! 👇\n\n#PR #Marketing #Orbit"}
      </div>
    </div>
    <div className="bg-black relative flex justify-center border-y border-border">
      {children}
    </div>
    <div className="p-2 border-b border-border text-xs text-mutedText flex items-center justify-between px-4">
      <div className="flex items-center gap-1"><span className="bg-primary text-white rounded-full p-0.5"><ThumbsUp size={10} /></span> 1,204</div>
      <div className="hover:text-primary cursor-pointer transition-colors hover:underline">142 comments • 18 reposts</div>
    </div>
    <div className="flex items-center justify-between p-2 px-6">
      <div className="flex-1 flex items-center justify-center gap-2 text-mutedText font-semibold hover:bg-surface2 py-2 rounded-control cursor-pointer transition-colors text-sm"><ThumbsUp size={18} /> Like</div>
      <div className="flex-1 flex items-center justify-center gap-2 text-mutedText font-semibold hover:bg-surface2 py-2 rounded-control cursor-pointer transition-colors text-sm"><MessageSquare size={18} /> Comment</div>
      <div className="flex-1 flex items-center justify-center gap-2 text-mutedText font-semibold hover:bg-surface2 py-2 rounded-control cursor-pointer transition-colors text-sm"><RefreshCw size={18} /> Repost</div>
      <div className="flex-1 flex items-center justify-center gap-2 text-mutedText font-semibold hover:bg-surface2 py-2 rounded-control cursor-pointer transition-colors text-sm"><Send size={18} /> Send</div>
    </div>
  </div>
);

const PinterestWrapper = ({ children, title }) => (
  <div className="w-full max-w-[300px] mx-auto font-sans relative group">
    <div className="rounded-2xl overflow-hidden bg-black relative flex justify-center shadow-sm">
       {children}
       <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors pointer-events-none z-10" />
       <button className="absolute top-4 right-4 bg-red-600 hover:bg-red-700 text-white font-bold px-4 py-3 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-auto shadow-md">
         Save
       </button>
       <div className="absolute bottom-4 right-4 bg-surface/80 text-text backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-auto cursor-pointer flex items-center justify-center hover:bg-surface">
         <MoreHorizontal size={20} />
       </div>
       <div className="absolute bottom-4 right-14 bg-surface/80 text-text backdrop-blur-md p-2 rounded-full opacity-0 group-hover:opacity-100 transition-opacity z-20 pointer-events-auto cursor-pointer flex items-center justify-center hover:bg-surface">
         <Share2 size={20} />
       </div>
    </div>
    <div className="pt-2 px-1">
      <h4 className="font-bold text-text truncate mb-1">{title || "Orbit Campaign Asset"}</h4>
      <div className="flex items-center gap-2">
         <div className="w-6 h-6 rounded-full bg-zinc-200 dark:bg-zinc-700 flex-shrink-0" />
         <span className="text-xs text-mutedText truncate">Orbit PR</span>
      </div>
    </div>
  </div>
);

const DefaultWrapper = ({ children }) => (
  <div className="w-full flex justify-center bg-black rounded-xl overflow-hidden shadow-sm border border-border">
    {children}
  </div>
);

const PreviewStudio = ({ request, assets, onApprove, onRequestChanges }) => {
  const [selectedAsset, setSelectedAsset] = useState(assets && assets.length > 0 ? assets[0] : null);
  const [comments, setComments] = useState([]);
  const [showCommentInput, setShowCommentInput] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [pinPosition, setPinPosition] = useState(null);

  const getPreviewFrameClass = () => {
    const frames = {
      reel: 'w-full aspect-[9/16] max-w-[300px] mx-auto',
      feed_post: 'w-full aspect-[4/5] max-w-[400px] mx-auto',
      story: 'w-full aspect-[9/16] max-w-[300px] mx-auto',
      carousel: 'w-full aspect-square max-w-[400px] mx-auto',
    };
    return frames[request.content_type] || frames.feed_post;
  };

  useEffect(() => {
    if (request && request.request_id) {
      fetchComments();
    }
  }, [request]);

  const fetchComments = async () => {
    try {
      const res = await fetch(`/api/requests/${request.request_id}/comments`);
      if (res.ok) {
        const data = await res.json();
        // Map database fields to our local state fields
        const mappedComments = data.map(c => ({
          id: c.id,
          body: c.body,
          pinX: c.pin_x,
          pinY: c.pin_y,
          createdAt: c.created_at
        }));
        setComments(mappedComments);
      }
    } catch (err) {
      console.error('Failed to fetch comments', err);
    }
  };

  const handleImageClick = (e) => {
    if (e.target.tagName === 'IMG') {
      const rect = e.target.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setPinPosition({ x, y });
      setShowCommentInput(true);
    }
  };

  const handleAddComment = async () => {
    if (commentText.trim() && request && request.request_id) {
      try {
        const res = await fetch(`/api/requests/${request.request_id}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            body: commentText,
            pinX: pinPosition?.x || null,
            pinY: pinPosition?.y || null
          })
        });

        if (res.ok) {
          const newCommentData = await res.json();
          const newComment = {
            id: newCommentData.id,
            body: newCommentData.body,
            pinX: newCommentData.pin_x,
            pinY: newCommentData.pin_y,
            createdAt: newCommentData.created_at,
          };
          setComments([...comments, newComment]);
          setCommentText('');
          setPinPosition(null);
          setShowCommentInput(false);
        }
      } catch (err) {
        console.error('Failed to add comment', err);
      }
    }
  };

  const renderPreview = () => {
    if (!selectedAsset) {
      return (
        <div className="w-full aspect-[4/5] bg-surface2 border-2 border-dashed border-border rounded-control flex items-center justify-center">
          <p className="text-mutedText">No asset uploaded</p>
        </div>
      );
    }

    const isVideo = selectedAsset.type === 'video';
    const frameClass = getPreviewFrameClass();

    const AssetContent = (
      <div className={`${frameClass} relative w-full`}>
        {isVideo ? (
          <video
            src={selectedAsset.url}
            className="w-full h-full object-contain"
            controls
          />
        ) : (
          <img
            src={selectedAsset.url}
            alt={selectedAsset.file_name || 'Preview'}
            className="w-full h-full object-contain cursor-crosshair"
            onClick={handleImageClick}
          />
        )}
        
        {/* Pin Comments */}
        {comments
          .filter(c => c.pinX !== null && c.pinY !== null)
          .map((comment) => (
            <div
              key={comment.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-none"
              style={{
                left: `${comment.pinX}%`,
                top: `${comment.pinY}%`,
              }}
            >
              <div className="bg-danger text-white rounded-full p-1.5 shadow-lg pointer-events-auto">
                <Pin size={12} />
              </div>
            </div>
          ))}

        {/* Safe Zone Overlay for Stories */}
        {request.content_type === 'story' && (
          <div className="absolute inset-0 pointer-events-none z-10">
            <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-black/50 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/50 to-transparent" />
          </div>
        )}
      </div>
    );

    const platform = request.platform?.toLowerCase() || 'other';
    const caption = request.description;
    const title = request.title;

    switch(platform) {
      case 'instagram':
        return <InstagramWrapper caption={caption}>{AssetContent}</InstagramWrapper>;
      case 'tiktok':
        return <TikTokWrapper caption={caption}>{AssetContent}</TikTokWrapper>;
      case 'twitter':
        return <TwitterWrapper caption={caption}>{AssetContent}</TwitterWrapper>;
      case 'linkedin':
        return <LinkedInWrapper caption={caption}>{AssetContent}</LinkedInWrapper>;
      case 'pinterest':
        return <PinterestWrapper title={title}>{AssetContent}</PinterestWrapper>;
      default:
        return <DefaultWrapper>{AssetContent}</DefaultWrapper>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Preview Frame */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-h3 font-semibold text-text">Preview</h3>
          <div className="flex items-center gap-2">
            <span className="text-small text-mutedText capitalize">
              {request.content_type?.replace('_', ' ')}
            </span>
            <span className="text-small text-mutedText">•</span>
            <span className="text-small text-mutedText capitalize">{request.platform}</span>
          </div>
        </div>

        {renderPreview()}

        {/* Asset Selector */}
        {assets && assets.length > 1 && (
          <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
            {assets.map((asset) => (
              <button
                key={asset.asset_id}
                onClick={() => setSelectedAsset(asset)}
                className={`flex-shrink-0 w-20 h-20 rounded-control overflow-hidden border-2 ${
                  selectedAsset?.asset_id === asset.asset_id
                    ? 'border-primary'
                    : 'border-border'
                }`}
              >
                <img
                  src={asset.url}
                  alt={asset.file_name}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Comment Input */}
      {showCommentInput && (
        <div className="card">
          <div className="flex items-start gap-3">
            <div className="flex-1">
              <textarea
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="Add a comment..."
                className="w-full bg-surface2 border border-border rounded-control p-3 text-text placeholder-mutedText resize-none"
                rows={3}
              />
              {pinPosition && (
                <p className="text-small text-mutedText mt-2">
                  Pinned at {Math.round(pinPosition.x)}%, {Math.round(pinPosition.y)}%
                </p>
              )}
            </div>
            <div className="flex flex-col gap-2">
              <button
                onClick={handleAddComment}
                className="btn-primary text-small"
              >
                Add
              </button>
              <button
                onClick={() => {
                  setShowCommentInput(false);
                  setCommentText('');
                  setPinPosition(null);
                }}
                className="btn-secondary text-small"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments List */}
      {comments.length > 0 && (
        <div className="card">
          <h3 className="text-h3 font-semibold text-text mb-4">Comments</h3>
          <div className="space-y-3">
            {comments.map((comment) => (
              <div
                key={comment.id}
                className="p-3 bg-surface2 rounded-control border border-border"
              >
                <div className="flex items-center gap-2 mb-2">
                  <MessageSquare size={16} className="text-mutedText" />
                  <span className="text-small text-mutedText">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                  {comment.pinX && comment.pinY && (
                    <span className="text-small text-mutedText">
                      • Pinned at {Math.round(comment.pinX)}%, {Math.round(comment.pinY)}%
                    </span>
                  )}
                </div>
                <p className="text-body text-text">{comment.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Approval Actions */}
      {request.status === 'in_review' && (
        <div className="card">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-h3 font-semibold text-text mb-2">Ready to approve?</h3>
              <p className="text-body text-mutedText">
                Review the preview and comments before making a decision.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={onRequestChanges}
                className="btn-secondary flex items-center gap-2"
              >
                <XCircle size={18} />
                Request Changes
              </button>
              <button
                onClick={onApprove}
                className="btn-primary flex items-center gap-2"
              >
                <CheckCircle size={18} />
                Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PreviewStudio;




