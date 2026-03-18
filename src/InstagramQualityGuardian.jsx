import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';

const InstagramQualityGuardian = ({ request, contentType, assets, checklist, onChecklistUpdate }) => {
  const [items, setItems] = useState([]);
  const [acknowledgedWarnings, setAcknowledgedWarnings] = useState([]);

  useEffect(() => {
    // Load checklist based on content type
    const checklistData = getChecklistForType(contentType);
    setItems(checklistData.map(item => ({ ...item, checked: false })));
    
    // Check for dimension warnings
    if (assets && assets.length > 0) {
      checkAssetDimensions(assets[0], contentType);
    }
  }, [contentType, assets]);

  const getChecklistForType = (type) => {
    const checklists = {
      reel: [
        { id: 'reel_dimensions', label: 'Exported at 1080×1920 (9:16)', type: 'toggle' },
        { id: 'reel_codec', label: 'Codec: H.264', type: 'toggle' },
        { id: 'reel_fps', label: 'Frame rate: 30fps (or 60fps if intentional)', type: 'toggle' },
        { id: 'reel_safe_margins', label: 'Text within safe margins', type: 'toggle' },
        { id: 'hq_uploads', label: 'High Quality Uploads enabled on device', type: 'toggle' },
      ],
      feed_post: [
        { id: 'feed_size', label: '1080×1350 (4:5) preferred', type: 'toggle' },
        { id: 'srgb', label: 'Color profile: sRGB', type: 'toggle' },
        { id: 'no_rescreenshot', label: 'Not a screenshot-of-a-screenshot', type: 'toggle' },
        { id: 'sharpening', label: 'No heavy sharpening artifacts', type: 'toggle' },
      ],
      story: [
        { id: 'story_size', label: '1080×1920', type: 'toggle' },
        { id: 'ui_safe_zones', label: 'Text clear of UI zones', type: 'toggle' },
        { id: 'contrast', label: 'Text contrast readable', type: 'toggle' },
      ],
    };
    return checklists[type] || [];
  };

  const checkAssetDimensions = (asset, type) => {
    if (!asset.width || !asset.height) return;

    const recommendedDimensions = {
      reel: { width: 1080, height: 1920 },
      feed_post: { width: 1080, height: 1350 },
      story: { width: 1080, height: 1920 },
    };

    const recommended = recommendedDimensions[type];
    if (!recommended) return;

    const warnings = [];
    
    if (asset.width !== recommended.width || asset.height !== recommended.height) {
      warnings.push({
        id: 'wrong_dimensions',
        message: `This file may crop or compress. Recommended: ${recommended.width}×${recommended.height}`,
        acknowledged: acknowledgedWarnings.includes('wrong_dimensions'),
      });
    }

    if (asset.width < 900 || asset.height < 900) {
      warnings.push({
        id: 'low_resolution',
        message: 'This may appear soft on Instagram. Consider re-exporting at 1080px minimum.',
        acknowledged: acknowledgedWarnings.includes('low_resolution'),
      });
    }

    return warnings;
  };

  const handleToggle = (itemId) => {
    setItems(items.map(item =>
      item.id === itemId ? { ...item, checked: !item.checked } : item
    ));
  };

  const handleAcknowledgeWarning = (warningId) => {
    if (!acknowledgedWarnings.includes(warningId)) {
      const newAcknowledged = [...acknowledgedWarnings, warningId];
      setAcknowledgedWarnings(newAcknowledged);
      if (onChecklistUpdate) {
        onChecklistUpdate({
          items,
          acknowledgedWarnings: newAcknowledged,
        });
      }
    }
  };

  const warnings = assets && assets.length > 0 
    ? checkAssetDimensions(assets[0], contentType) || []
    : [];

  const allChecked = items.length > 0 && items.every(item => item.checked);
  const hasUnacknowledgedWarnings = warnings.some(w => !w.acknowledged);

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <AlertCircle size={20} className="text-warning" />
        <h3 className="text-h3 font-semibold text-text">Instagram Quality Guardian</h3>
      </div>

      {/* Checklist */}
      <div className="space-y-3 mb-6">
        {items.map((item) => (
          <label
            key={item.id}
            className="flex items-start gap-3 cursor-pointer group"
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={() => handleToggle(item.id)}
              className="mt-1 w-5 h-5 rounded border-border bg-surface2 text-primary focus:ring-primary"
            />
            <span className={`text-body flex-1 ${item.checked ? 'text-mutedText line-through' : 'text-text'}`}>
              {item.label}
            </span>
          </label>
        ))}
      </div>

      {/* Progress Indicator */}
      {items.length > 0 && (
        <div className="mb-6">
          <div className="flex items-center justify-between text-small text-mutedText mb-2">
            <span>Checklist Progress</span>
            <span>{items.filter(i => i.checked).length} / {items.length}</span>
          </div>
          <div className="w-full bg-surface2 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${(items.filter(i => i.checked).length / items.length) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="space-y-3">
          {warnings.map((warning) => (
            <div
              key={warning.id}
              className={`p-3 rounded-control border ${
                warning.acknowledged
                  ? 'bg-surface2 border-border'
                  : 'bg-warning/10 border-warning/50'
              }`}
            >
              <div className="flex items-start gap-2 mb-2">
                <AlertCircle size={18} className="text-warning flex-shrink-0 mt-0.5" />
                <p className="text-small text-text flex-1">{warning.message}</p>
              </div>
              {!warning.acknowledged && (
                <button
                  onClick={() => handleAcknowledgeWarning(warning.id)}
                  className="text-small text-warning hover:text-warning/80 font-medium"
                >
                  Acknowledge
                </button>
              )}
              {warning.acknowledged && (
                <div className="flex items-center gap-1 text-small text-mutedText">
                  <CheckCircle size={14} />
                  <span>Acknowledged</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* One-time Tips */}
      {contentType === 'feed_post' && (
        <div className="mt-6 p-3 bg-info/10 border border-info/30 rounded-control">
          <div className="flex items-start gap-2">
            <Info size={18} className="text-info flex-shrink-0 mt-0.5" />
            <p className="text-small text-text">
              4:5 feed posts take up more screen space than square.
            </p>
          </div>
        </div>
      )}

      {/* Status Summary */}
      <div className="mt-6 pt-6 border-t border-border">
        {allChecked && !hasUnacknowledgedWarnings ? (
          <div className="flex items-center gap-2 text-success">
            <CheckCircle size={18} />
            <span className="text-body font-medium">Quality checks passed</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-warning">
            <AlertCircle size={18} />
            <span className="text-body font-medium">
              {hasUnacknowledgedWarnings ? 'Warnings need acknowledgment' : 'Complete checklist'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstagramQualityGuardian;




