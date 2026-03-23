import React, { useState, useMemo, useCallback } from 'react';
import {
  Camera, Calendar, Palette, Sparkles,
  ChevronRight, Plus, GripVertical, MessageSquare, Download,
  Zap, TrendingUp, Users, Target, ArrowLeft, X, Check,
  Edit3, Trash2, ArrowUpDown, Lightbulb, AlertTriangle, Bot,
  FileText, Star, PenTool,
  Megaphone, Briefcase, LayoutList, LayoutGrid,
} from 'lucide-react';

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const CAMPAIGN_TYPES = [
  'Product Launch', 'Brand Awareness', 'Crisis Management', 'Event Promotion',
  'Thought Leadership', 'Rebranding', 'Sustainability Initiative', 'Partnership Announcement',
];

const CHANNEL_OPTIONS = [
  { id: 'pressRelease', name: 'Press Release', icon: '📰' },
  { id: 'emailPitch', name: 'Email Pitch', icon: '📧' },
  { id: 'socialMedia', name: 'Social Media', icon: '📱' },
  { id: 'podcast', name: 'Podcast', icon: '🎙️' },
  { id: 'video', name: 'Video', icon: '🎬' },
  { id: 'influencer', name: 'Influencer', icon: '⭐' },
  { id: 'events', name: 'Events', icon: '🎪' },
  { id: 'blog', name: 'Blog Posts', icon: '✍️' },
  { id: 'newsletter', name: 'Newsletter', icon: '📬' },
  { id: 'linkedin', name: 'LinkedIn', icon: '💼' },
  { id: 'mediaKit', name: 'Media Kit', icon: '📦' },
];

const AUDIENCE_COLORS = [
  'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
  'bg-purple-100 text-purple-700 dark:bg-purple-900/40 dark:text-purple-300',
  'bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300',
  'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-300',
  'bg-pink-100 text-pink-700 dark:bg-pink-900/40 dark:text-pink-300',
  'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/40 dark:text-cyan-300',
];

const PRIORITY_STYLES = {
  high: 'bg-[#ffe6e6] text-[#d83a52] dark:bg-red-900/30 dark:text-red-300',
  medium: 'bg-[#fff4e6] text-[#ff9900] dark:bg-orange-900/30 dark:text-orange-300',
  low: 'bg-[#e6f3ff] text-[#0073ea] dark:bg-blue-900/30 dark:text-blue-300',
};

const STATUS_STYLES = {
  planned: 'bg-surface2 dark:bg-surface2-dark text-mutedText',
  'in-progress': 'bg-primary/15 text-primary',
  review: 'bg-warning/15 text-warning',
  done: 'bg-success/15 text-success',
};

const GOAL_OPTIONS = [
  { id: 'awareness', label: 'Awareness', icon: TrendingUp },
  { id: 'signups', label: 'Signups', icon: Users },
  { id: 'event', label: 'Event Turnout', icon: Calendar },
  { id: 'donations', label: 'Donations', icon: Target },
];

const TABS = [
  { id: 'strategy', label: 'Strategy Brief', icon: Target },
  { id: 'content', label: 'Content Pipeline', icon: PenTool },
  { id: 'outreach', label: 'Outreach Tasks', icon: Megaphone },
];

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

const CampaignPlanningView = ({ onBack, onUseTemplates, onCreateFromPlan, toast }) => {
  // ── Tab navigation ──
  const [activeTab, setActiveTab] = useState('strategy');

  // ── Strategy & Planning ──
  const [campaignName, setCampaignName] = useState('');
  const [campaignType, setCampaignType] = useState('');
  const [goal, setGoal] = useState('awareness');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [objectives, setObjectives] = useState('');
  const [kpis, setKpis] = useState({ media: '', impressions: '', engagement: '', sentiment: '' });
  const [audiences, setAudiences] = useState([]);
  const [audienceInput, setAudienceInput] = useState('');
  const [keyMessages, setKeyMessages] = useState([]);
  const [msgInput, setMsgInput] = useState('');
  const [draggedMsgIdx, setDraggedMsgIdx] = useState(null);

  // ── Content Creation ──
  const [channels, setChannels] = useState({});
  const [platforms, setPlatforms] = useState({ IG: true, TikTok: false, X: false, LinkedIn: false });
  const [vibe, setVibe] = useState({ serious: 50, bold: 50, corporate: 50 });
  const [postsPerWeek, setPostsPerWeek] = useState(3);
  const [reelsPerWeek, setReelsPerWeek] = useState(1);
  const [mustInclude, setMustInclude] = useState('');
  const [cta, setCta] = useState('');
  const [brief, setBrief] = useState('');
  const [audience, setAudience] = useState('');
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [paletteOptions, setPaletteOptions] = useState([]);
  const [contentCards, setContentCards] = useState([]);
  const [brandKit, setBrandKit] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null);

  // ── Media Outreach ──
  const [tasks, setTasks] = useState([]);
  const [taskView, setTaskView] = useState('list');
  const [taskSort, setTaskSort] = useState({ col: '', dir: 'asc' });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [showSaved, setShowSaved] = useState(false);

  const canCreate = useMemo(() => Boolean(campaignName.trim() && startDate), [campaignName, startDate]);
  const triggerSave = useCallback(() => { setShowSaved(true); setTimeout(() => setShowSaved(false), 1500); }, []);

  const platformColors = {
    IG: { bg: 'bg-gradient-to-br from-purple-500 to-pink-500', text: 'text-white', dot: '#9333EA' },
    TikTok: { bg: 'bg-black dark:bg-white', text: 'text-white dark:text-black', dot: '#000000' },
    X: { bg: 'bg-gray-900 dark:bg-gray-200', text: 'text-white dark:text-black', dot: '#1E293B' },
    LinkedIn: { bg: 'bg-blue-600', text: 'text-white', dot: '#0A66C2' },
  };

  /* ── Key Messages ── */
  const addMessage = () => { if (msgInput.trim()) { setKeyMessages(p => [...p, { id: Date.now(), text: msgInput.trim() }]); setMsgInput(''); triggerSave(); } };
  const removeMessage = (id) => { setKeyMessages(p => p.filter(m => m.id !== id)); triggerSave(); };
  const updateMessage = (id, text) => { setKeyMessages(p => p.map(m => m.id === id ? { ...m, text } : m)); triggerSave(); };
  const handleMsgDrop = (dropIdx) => {
    if (draggedMsgIdx === null || draggedMsgIdx === dropIdx) return;
    const arr = [...keyMessages]; const [moved] = arr.splice(draggedMsgIdx, 1); arr.splice(dropIdx, 0, moved);
    setKeyMessages(arr); setDraggedMsgIdx(null);
  };

  /* ── Audiences ── */
  const addAudience = () => { if (audienceInput.trim()) { setAudiences(p => [...p, { id: Date.now(), name: audienceInput.trim() }]); setAudienceInput(''); triggerSave(); } };
  const removeAudience = (id) => { setAudiences(p => p.filter(a => a.id !== id)); triggerSave(); };

  /* ── Channels ── */
  const toggleChannel = (id) => { setChannels(p => ({ ...p, [id]: !p[id] })); triggerSave(); };
  const togglePlatform = (p) => { setPlatforms(prev => ({ ...prev, [p]: !prev[p] })); triggerSave(); };

  /* ── Tasks ── */
  const addTask = () => {
    if (!newTaskName.trim()) return;
    setTasks(p => [...p, { id: Date.now(), name: newTaskName.trim(), assignee: '', priority: 'medium', status: 'planned', dueDate: '' }]);
    setNewTaskName(''); triggerSave();
  };
  const updateTask = (id, field, value) => { setTasks(p => p.map(t => t.id === id ? { ...t, [field]: value } : t)); triggerSave(); };
  const removeTask = (id) => { setTasks(p => p.filter(t => t.id !== id)); triggerSave(); };



  const sortTasks = (col) => { setTaskSort(prev => ({ col, dir: prev.col === col && prev.dir === 'asc' ? 'desc' : 'asc' })); };
  const sortedTasks = useMemo(() => {
    if (!taskSort.col) return tasks;
    return [...tasks].sort((a, b) => {
      const av = (a[taskSort.col] || '').toString(); const bv = (b[taskSort.col] || '').toString();
      return taskSort.dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  }, [tasks, taskSort]);

  /* ── API helper ── */
  const buildCampaignContext = () => ({
    name: campaignName, goal, audience: audiences.map(a => a.name).join(', ') || audience,
    platforms, vibe, startDate, endDate, postsPerWeek, reelsPerWeek, mustInclude, cta, brief,
    contentCount: contentCards.length, paletteName: selectedPalette?.name || null,
    campaignType, objectives, keyMessages: keyMessages.map(m => m.text),
    channels: Object.entries(channels).filter(([, v]) => v).map(([k]) => k),
  });



  const applyPalette = (palette) => { setSelectedPalette(palette); triggerSave(); };

  /* ── Create Campaign ── */
  const handleCreate = async () => {
    if (!campaignName || !startDate) { toast?.('Name and start date are required.', { type: 'error' }); return; }
    const deliverables = [
      ...contentCards.map((card, idx) => ({ deliverable_type: 'post', title: card.title, description: card.caption || card.script || card.content || '', platform: card.platform === 'IG' ? 'instagram' : card.platform?.toLowerCase() || 'other', stage: `Week ${card.week}`, priority: idx < 4 ? 'high' : 'medium', due_offset_days: ((card.week - 1) * 7) + ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].indexOf(card.day), owner_role: null })),
      ...tasks.map(t => ({ deliverable_type: 'other', title: t.name, description: '', platform: null, stage: null, priority: t.priority, due_offset_days: t.dueDate ? Math.round((new Date(t.dueDate) - new Date(startDate)) / 86400000) : 0, owner_role: t.assignee || null })),
    ];
    const colors = selectedPalette ? { primary: selectedPalette.colors[0], secondary: selectedPalette.colors[1], accent: selectedPalette.colors[2] } : { primary: '#6EA8FF', secondary: '#8B5CF6', accent: '#10B981' };
    await onCreateFromPlan?.({ campaign: { title: campaignName, objective: objectives || goal, start_date: startDate, end_date: endDate || null, status: 'planning' }, plan: { brief_text: brief || objectives || '', colors_json: colors, plan_json: brandKit || null, meta: { audience: audiences.map(a => a.name).join(', '), channels: Object.entries(channels).filter(([, v]) => v).map(([k]) => k).join(', '), notes: mustInclude, cta, vibe, campaignType, keyMessages: keyMessages.map(m => m.text), kpis } }, aiPlan: { stages: brandKit?.pillars?.map(p => ({ name: p.name, goal: `${p.posts} posts` })) || [], deliverables, suggested_posts: [] } });
  };

  /* ═══════════════════════════════════════════
     RENDER HELPERS
     ═══════════════════════════════════════════ */
  const inp = 'w-full px-3 py-2.5 border border-border dark:border-border-dark bg-surface2 dark:bg-surface2-dark rounded-control text-body text-text dark:text-white focus:outline-none focus:ring-2 focus:ring-primary transition-colors';
  const lbl = 'block text-small font-medium text-text dark:text-white mb-1.5';

  const sectionTitle = (icon, title) => (
    <h3 className="text-h3 font-semibold text-text dark:text-white flex items-center gap-2 mb-4">
      {React.createElement(icon, { size: 20, className: 'text-primary' })}{title}
    </h3>
  );

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col animate-fadeIn">

      {/* ═══ POST DETAIL MODAL ═══ */}
      {expandedPost && (
        <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4" onClick={() => setExpandedPost(null)}>
          <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-card max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="sticky top-0 bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark p-6 flex items-center justify-between z-10">
              <div className="flex items-center gap-3">
                <div className={`px-3 py-1 rounded-control text-small font-bold ${platformColors[expandedPost.platform]?.bg} ${platformColors[expandedPost.platform]?.text}`}>{expandedPost.platform}</div>
                <div>
                  <h2 className="text-h3 font-bold text-text dark:text-white">{expandedPost.title}</h2>
                  <p className="text-small text-mutedText">{expandedPost.type} — Week {expandedPost.week} — {expandedPost.day} @ {expandedPost.time}</p>
                </div>
              </div>
              <button onClick={() => setExpandedPost(null)} className="w-8 h-8 rounded-full hover:bg-surface2 dark:hover:bg-surface2-dark flex items-center justify-center text-mutedText"><X size={18} /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className={lbl}>{expandedPost.caption ? 'Caption' : expandedPost.script ? 'Script' : 'Content'}</label>
                <textarea value={expandedPost.caption || expandedPost.script || expandedPost.content} onChange={e => { const k = expandedPost.caption ? 'caption' : expandedPost.script ? 'script' : 'content'; setExpandedPost(p => ({ ...p, [k]: e.target.value })); }} className={`${inp} font-mono`} rows="8" />
              </div>
              {expandedPost.hashtags && <div><label className={lbl}>Hashtags</label><input value={expandedPost.hashtags} onChange={e => setExpandedPost(p => ({ ...p, hashtags: e.target.value }))} className={inp} /></div>}
              {expandedPost.notes && <div className="p-4 bg-warning/10 border border-warning/30 rounded-control"><p className="text-small font-medium text-text dark:text-white">Production Notes</p><p className="text-small text-mutedText mt-1">{expandedPost.notes}</p></div>}
              {expandedPost.assetChecklist && <div><label className={lbl}>Assets</label><div className="space-y-1">{expandedPost.assetChecklist.map((a, i) => <label key={i} className="flex items-center gap-2 p-2 bg-surface2 dark:bg-surface2-dark rounded-control cursor-pointer hover:bg-border dark:hover:bg-border-dark"><input type="checkbox" className="accent-primary" /><span className="text-small text-text dark:text-white">{a}</span></label>)}</div></div>}
              <div className="flex gap-3 pt-4 border-t border-border dark:border-border-dark">
                <button onClick={() => { toast?.('Saved!', { type: 'success' }); setExpandedPost(null); }} className="flex-1 btn-primary">Save</button>
                <button className="btn-secondary">Duplicate</button>
                <button onClick={() => { setContentCards(p => p.filter(c => c.id !== expandedPost.id)); setExpandedPost(null); }} className="px-4 py-2 border border-danger/40 text-danger rounded-control hover:bg-danger/10 font-medium">Delete</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ STICKY HEADER ═══ */}
      <div className="flex-shrink-0 bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark z-20">
        {/* Row 1: Branding + nav */}
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button onClick={onBack} className="btn-secondary flex items-center gap-2 text-small"><ArrowLeft size={16} /> Back</button>
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-500 rounded-control flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-body font-bold text-text dark:text-white">Campaign Studio</h1>
          </div>
          <div className="flex items-center gap-2">
            {showSaved && <span className="text-small text-success animate-pulse font-medium">Saved</span>}
            <button onClick={onUseTemplates} className="btn-secondary text-small flex items-center gap-1.5"><Sparkles size={14} /> Templates</button>
          </div>
        </div>

        {/* Row 2: Campaign Identity Banner */}
        <div className="px-6 pb-4 pt-1 flex items-end gap-3 flex-wrap border-t border-border dark:border-border-dark bg-surface2/30 dark:bg-surface2-dark/20">
          <div className="flex-1 min-w-[200px]">
            <label className={lbl}>Campaign Name *</label>
            <input
              value={campaignName}
              onChange={e => { setCampaignName(e.target.value); triggerSave(); }}
              placeholder="Enter campaign name..."
              className={`${inp} font-semibold`}
            />
          </div>
          <div className="w-44">
            <label className={lbl}>Type</label>
            <select value={campaignType} onChange={e => { setCampaignType(e.target.value); triggerSave(); }} className={inp}>
              <option value="">Select type...</option>
              {CAMPAIGN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          <div className="w-36">
            <label className={lbl}>Start Date *</label>
            <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); triggerSave(); }} className={inp} />
          </div>
          <div className="w-36">
            <label className={lbl}>End Date</label>
            <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); triggerSave(); }} className={inp} />
          </div>
          <div className="flex flex-col">
            <div className="mb-1.5 invisible text-small">_</div>
            <button
              onClick={handleCreate}
              disabled={!canCreate}
              className="btn-primary flex items-center gap-2 disabled:opacity-40 py-2.5 px-5 whitespace-nowrap"
            >
              <Download size={15} /> Create Campaign
            </button>
          </div>
        </div>
      </div>

      {/* ═══ TAB NAVIGATION ═══ */}
      <div className="flex-shrink-0 bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark px-6">
        <nav className="flex gap-0">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-5 py-3 text-small font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-mutedText hover:text-text dark:hover:text-white hover:border-border dark:hover:border-border-dark'
              }`}
            >
              <tab.icon size={15} />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ═══ SPLIT PANE ═══ */}
      <div className="flex-1 flex overflow-hidden">

        {/* ── Left Canvas (70%) ── */}
        <div className="flex-1 overflow-y-auto bg-background dark:bg-background-dark">
          <div className="max-w-3xl mx-auto p-6">

            {/* ────────────────────────────────
                TAB 1: STRATEGY BRIEF
            ──────────────────────────────── */}
            {activeTab === 'strategy' && (
              <div className="animate-fadeIn space-y-5">

                {/* Campaign Goal */}
                <div className="card">
                  {sectionTitle(Target, 'Campaign Goal')}
                  <div className="grid grid-cols-4 gap-3">
                    {GOAL_OPTIONS.map(o => (
                      <button
                        key={o.id}
                        onClick={() => { setGoal(o.id); triggerSave(); }}
                        className={`p-3 rounded-control border-2 transition-all text-center ${goal === o.id ? 'border-primary bg-primary/10 shadow-sm' : 'border-border dark:border-border-dark hover:border-primary/40'}`}
                      >
                        <o.icon className={`w-5 h-5 mx-auto mb-1 ${goal === o.id ? 'text-primary' : 'text-mutedText'}`} />
                        <div className="text-small font-medium text-text dark:text-white">{o.label}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Objectives */}
                <div className="card">
                  {sectionTitle(FileText, 'Campaign Objectives')}
                  <textarea
                    value={objectives}
                    onChange={e => { setObjectives(e.target.value); triggerSave(); }}
                    rows={3}
                    placeholder="Generate X media placements, achieve X impressions, increase brand awareness by X%..."
                    className={inp}
                  />
                </div>

                {/* Target Audiences — always visible */}
                <div className="card">
                  {sectionTitle(Users, 'Target Audiences')}
                  <div className="flex flex-wrap gap-2 mb-3 min-h-[40px]">
                    {audiences.map((a, i) => (
                      <span key={a.id} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-small font-medium ${AUDIENCE_COLORS[i % AUDIENCE_COLORS.length]}`}>
                        {a.name}
                        <button onClick={() => removeAudience(a.id)} className="hover:opacity-70"><X size={12} /></button>
                      </span>
                    ))}
                    {audiences.length === 0 && <span className="text-small text-mutedText italic py-1">No audiences added yet</span>}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={audienceInput}
                      onChange={e => setAudienceInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addAudience()}
                      placeholder="Add audience segment..."
                      className="flex-1 bg-transparent border-b border-border dark:border-border-dark px-2 py-1.5 text-small text-text dark:text-white focus:outline-none focus:border-primary transition-colors"
                    />
                    <button onClick={addAudience} className="text-small px-3 flex items-center gap-1 text-primary hover:text-primary/80 font-medium"><Plus size={14} /> Add</button>
                  </div>
                </div>

                {/* Key Messages — always visible */}
                <div className="card">
                  {sectionTitle(MessageSquare, 'Key Messages')}
                  <div className="space-y-2 mb-3 min-h-[40px]">
                    {keyMessages.map((m, idx) => (
                      <div
                        key={m.id}
                        draggable
                        onDragStart={() => setDraggedMsgIdx(idx)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={() => handleMsgDrop(idx)}
                        onDragEnd={() => setDraggedMsgIdx(null)}
                        className={`flex items-center gap-2 p-2.5 rounded-control bg-surface2/50 dark:bg-surface2-dark/50 transition-all ${draggedMsgIdx === idx ? 'opacity-40 scale-95' : 'hover:shadow-sm'}`}
                      >
                        <GripVertical size={16} className="text-mutedText cursor-grab flex-shrink-0" />
                        <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                        <input value={m.text} onChange={e => updateMessage(m.id, e.target.value)} className="flex-1 bg-transparent text-small text-text dark:text-white focus:outline-none" placeholder="Enter message..." />
                        <button onClick={() => removeMessage(m.id)} className="text-mutedText hover:text-danger flex-shrink-0"><X size={14} /></button>
                      </div>
                    ))}
                    {keyMessages.length === 0 && <p className="text-small text-mutedText italic py-1">Add 3-5 key messages for consistency</p>}
                  </div>
                  <div className="flex gap-2">
                    <input
                      value={msgInput}
                      onChange={e => setMsgInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addMessage()}
                      placeholder="Add key message..."
                      className="flex-1 bg-transparent border-b border-border dark:border-border-dark px-2 py-1.5 text-small text-text dark:text-white focus:outline-none focus:border-primary transition-colors"
                    />
                    <button onClick={addMessage} className="text-small px-3 flex items-center gap-1 text-primary hover:text-primary/80 font-medium"><Plus size={14} /> Add</button>
                  </div>
                </div>

              </div>
            )}

            {/* ────────────────────────────────
                TAB 2: CONTENT PIPELINE
            ──────────────────────────────── */}
            {activeTab === 'content' && (
              <div className="animate-fadeIn space-y-5">

                {/* Target Channels */}
                <div className="card">
                  {sectionTitle(Megaphone, 'Target Channels')}
                  <div className="flex flex-wrap gap-2">
                    {CHANNEL_OPTIONS.map(ch => (
                      <button
                        key={ch.id}
                        onClick={() => toggleChannel(ch.id)}
                        className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${channels[ch.id] ? 'bg-primary border-primary text-white shadow-sm' : 'bg-surface dark:bg-surface-dark border-border dark:border-border-dark text-text dark:text-white hover:border-primary/50'}`}
                      >
                        <span>{ch.icon}</span>
                        <span className="text-small font-medium">{ch.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Social Platforms — always visible */}
                <div className="card">
                  <h4 className="text-body font-semibold text-text dark:text-white mb-3">Social Platforms</h4>
                  <div className="flex flex-wrap gap-2 mb-6">
                    {Object.entries(platforms).map(([p, active]) => (
                      <button
                        key={p}
                        onClick={() => togglePlatform(p)}
                        className={`px-4 py-1.5 rounded-full text-small font-semibold transition-all border ${active ? 'bg-text text-surface border-text dark:bg-white dark:text-black dark:border-white shadow-sm' : 'bg-transparent text-mutedText border-border dark:border-border-dark hover:border-text dark:hover:border-white'}`}
                      >{p}</button>
                    ))}
                  </div>

                  {sectionTitle(Palette, 'Campaign Vibe')}
                  {[
                    { key: 'serious', l: 'Serious', r: 'Playful' },
                    { key: 'bold', l: 'Minimal', r: 'Bold' },
                    { key: 'corporate', l: 'Corporate', r: 'Student' },
                  ].map(s => (
                    <div key={s.key} className="mb-4">
                      <div className="flex justify-between text-[11px] text-mutedText mb-2">
                        <span className="font-medium">{s.l}</span>
                        <span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">{vibe[s.key]}</span>
                        <span className="font-medium">{s.r}</span>
                      </div>
                      <input type="range" min="0" max="100" value={vibe[s.key]} onChange={e => setVibe(p => ({ ...p, [s.key]: +e.target.value }))} className="w-full accent-primary h-1.5 bg-border dark:bg-border-dark rounded-full appearance-none outline-none cursor-pointer" />
                    </div>
                  ))}
                </div>

                {/* Content Rules — always visible */}
                <div className="card space-y-4">
                  {sectionTitle(FileText, 'Content Rules')}
                  <div className="flex items-center justify-between p-2 bg-surface2/50 dark:bg-surface2-dark/50 rounded-control">
                    <span className="text-small text-text dark:text-white font-medium">Posts per week</span>
                    <input type="number" min="1" max="14" value={postsPerWeek} onChange={e => setPostsPerWeek(+e.target.value)} className="w-16 px-2 py-1 bg-transparent border-b border-border focus:border-primary outline-none text-center text-text dark:text-white font-semibold" />
                  </div>
                  <div className="flex items-center justify-between p-2 bg-surface2/50 dark:bg-surface2-dark/50 rounded-control">
                    <span className="text-small text-text dark:text-white font-medium">Reels per week</span>
                    <input type="number" min="0" max="7" value={reelsPerWeek} onChange={e => setReelsPerWeek(+e.target.value)} className="w-16 px-2 py-1 bg-transparent border-b border-border focus:border-primary outline-none text-center text-text dark:text-white font-semibold" />
                  </div>
                  <div>
                    <label className="text-small font-medium text-text dark:text-white block mb-1">Call to Action <span className="text-mutedText font-normal">(Optional)</span></label>
                    <input value={cta} onChange={e => setCta(e.target.value)} placeholder="E.g., Link in bio, Register today" className="w-full bg-transparent border-b border-border dark:border-border-dark px-2 py-2 text-small text-text dark:text-white focus:outline-none focus:border-primary transition-colors" />
                  </div>
                  <div>
                    <label className="text-small font-medium text-text dark:text-white block mb-1">Must Include <span className="text-mutedText font-normal">(Optional)</span></label>
                    <textarea value={mustInclude} onChange={e => setMustInclude(e.target.value)} rows={2} placeholder="Specific hashtags, sponsor links..." className="w-full bg-transparent border-b border-border dark:border-border-dark px-2 py-2 text-small text-text dark:text-white focus:outline-none focus:border-primary transition-colors resize-none" />
                  </div>
                </div>



                {/* Color Palettes */}
                {paletteOptions.length > 0 && (
                  <div className="card">
                    <h4 className="text-body font-semibold text-text dark:text-white mb-3">Color Themes</h4>
                    <div className="grid grid-cols-3 gap-3">
                      {paletteOptions.map(p => (
                        <div key={p.id} onClick={() => applyPalette(p)} className={`p-3 rounded-control border-2 cursor-pointer transition-all ${selectedPalette?.id === p.id ? 'border-primary bg-primary/5 shadow-sm' : 'border-border dark:border-border-dark hover:border-mutedText/30'}`}>
                          <div className="font-medium text-small text-text dark:text-white mb-2">{p.name}</div>
                          <div className="flex gap-1 mb-2">{p.colors.map((c, i) => <div key={i} className="w-8 h-6 rounded" style={{ backgroundColor: c }} />)}</div>
                          <p className="text-[11px] text-mutedText">{p.vibe}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Content Timeline */}
                {contentCards.length > 0 && (
                  <div className="card">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-body font-semibold text-text dark:text-white">Content Timeline — {contentCards.length} posts</h4>
                      {selectedPalette && (
                        <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: selectedPalette.gradient }}>
                          <Palette size={12} className="text-white" />
                          <span className="text-[11px] font-medium text-white">{selectedPalette.name}</span>
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                      {[1, 2, 3, 4].map(week => {
                        const cards = contentCards.filter(c => c.week === week);
                        return (
                          <div key={week}>
                            <div className="text-small font-medium text-mutedText mb-2">Week {week} <span className="text-[11px]">({cards.length})</span></div>
                            <div className="space-y-1.5 min-h-[100px]">
                              {cards.length > 0 ? cards.map(item => (
                                <div key={item.id} onClick={() => setExpandedPost(item)} className="p-2 rounded-control text-[11px] cursor-pointer hover:shadow-md transition-all bg-primary/5 dark:bg-primary/10 border-l-4" style={{ borderLeftColor: platformColors[item.platform]?.dot || '#6EA8FF' }}>
                                  <div className="flex items-center gap-1"><span className="font-bold text-text dark:text-white">{item.platform}</span><span className="text-mutedText">{item.day}</span></div>
                                  <div className="font-medium text-text dark:text-white truncate">{item.title}</div>
                                </div>
                              )) : (
                                <div className="h-full border-2 border-dashed border-border dark:border-border-dark rounded-control flex items-center justify-center py-6"><Plus size={16} className="text-mutedText" /></div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

              </div>
            )}

            {/* ────────────────────────────────
                TAB 3: OUTREACH TASKS
            ──────────────────────────────── */}
            {activeTab === 'outreach' && (
              <div className="animate-fadeIn">
                <div className="card">
                  <div className="flex items-center justify-between mb-4">
                    {sectionTitle(LayoutList, 'Task Management')}
                    <div className="flex items-center gap-2">
                      <div className="flex gap-1">
                        {[{ id: 'list', icon: LayoutList }, { id: 'board', icon: LayoutGrid }].map(v => (
                          <button key={v.id} onClick={() => setTaskView(v.id)} className={`p-1.5 rounded-control ${taskView === v.id ? 'bg-primary/10 text-primary' : 'text-mutedText hover:bg-surface2 dark:hover:bg-surface2-dark'}`}><v.icon size={16} /></button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="border border-border dark:border-border-dark rounded-control overflow-hidden">
                    <div className="grid grid-cols-12 gap-0 bg-surface2 dark:bg-surface2-dark text-[11px] font-semibold text-mutedText uppercase tracking-wide">
                      <div className="col-span-4 px-3 py-2.5 cursor-pointer hover:text-text dark:hover:text-white flex items-center gap-1" onClick={() => sortTasks('name')}>Task Name <ArrowUpDown size={10} /></div>
                      <div className="col-span-2 px-3 py-2.5 cursor-pointer hover:text-text flex items-center gap-1" onClick={() => sortTasks('assignee')}>Assignee <ArrowUpDown size={10} /></div>
                      <div className="col-span-2 px-3 py-2.5 cursor-pointer hover:text-text flex items-center gap-1" onClick={() => sortTasks('priority')}>Priority <ArrowUpDown size={10} /></div>
                      <div className="col-span-2 px-3 py-2.5 cursor-pointer hover:text-text flex items-center gap-1" onClick={() => sortTasks('status')}>Status <ArrowUpDown size={10} /></div>
                      <div className="col-span-1 px-3 py-2.5">Due</div>
                      <div className="col-span-1 px-3 py-2.5 text-center">Del</div>
                    </div>
                    {sortedTasks.map(t => (
                      <div key={t.id} className="grid grid-cols-12 gap-0 border-t border-border dark:border-border-dark hover:bg-surface2/50 dark:hover:bg-surface2-dark/50 transition-colors">
                        <div className="col-span-4 px-3 py-2.5">
                          {editingTaskId === t.id
                            ? <input value={t.name} onChange={e => updateTask(t.id, 'name', e.target.value)} onBlur={() => setEditingTaskId(null)} onKeyDown={e => e.key === 'Enter' && setEditingTaskId(null)} autoFocus className="bg-transparent text-small text-text dark:text-white focus:outline-none border-b border-primary w-full" />
                            : <span onClick={() => setEditingTaskId(t.id)} className="text-small text-text dark:text-white cursor-pointer hover:text-primary">{t.name}</span>
                          }
                        </div>
                        <div className="col-span-2 px-3 py-2.5"><input value={t.assignee} onChange={e => updateTask(t.id, 'assignee', e.target.value)} placeholder="Unassigned" className="bg-transparent text-small text-text dark:text-white focus:outline-none w-full" /></div>
                        <div className="col-span-2 px-3 py-2.5">
                          <select value={t.priority} onChange={e => updateTask(t.id, 'priority', e.target.value)} className={`text-[11px] font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer ${PRIORITY_STYLES[t.priority]}`}>
                            <option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
                          </select>
                        </div>
                        <div className="col-span-2 px-3 py-2.5">
                          <select value={t.status} onChange={e => updateTask(t.id, 'status', e.target.value)} className={`text-[11px] font-medium px-2 py-0.5 rounded-full border-0 cursor-pointer ${STATUS_STYLES[t.status]}`}>
                            <option value="planned">Planned</option><option value="in-progress">In Progress</option><option value="review">Review</option><option value="done">Done</option>
                          </select>
                        </div>
                        <div className="col-span-1 px-3 py-2.5"><input type="date" value={t.dueDate} onChange={e => updateTask(t.id, 'dueDate', e.target.value)} className="bg-transparent text-[11px] text-text dark:text-white focus:outline-none w-full" /></div>
                        <div className="col-span-1 px-3 py-2.5 text-center"><button onClick={() => removeTask(t.id)} className="text-mutedText hover:text-danger"><Trash2 size={14} /></button></div>
                      </div>
                    ))}
                    {tasks.length === 0 && (
                      <div className="px-3 py-12 text-center">
                        <LayoutList size={32} className="text-mutedText/30 mx-auto mb-2" />
                        <p className="text-small text-mutedText">No tasks yet. Add your first task below.</p>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mt-3">
                    <input value={newTaskName} onChange={e => setNewTaskName(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} placeholder="+ Add Task..." className={`flex-1 ${inp} text-small`} />
                    <button onClick={addTask} className="btn-primary text-small px-4 flex items-center gap-1"><Plus size={14} /> Add Task</button>
                  </div>


                </div>
              </div>
            )}

          </div>
        </div>


      </div>
    </div>
  );
};

export default CampaignPlanningView;
