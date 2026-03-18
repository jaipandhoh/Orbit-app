import React, { useState, useMemo, useCallback } from 'react';
import {
  Camera, Calendar, Palette, Sparkles, Lock, Unlock,
  ChevronRight, ChevronLeft, ChevronDown, Plus, GripVertical, MessageSquare, Download,
  Zap, TrendingUp, Users, Target, ArrowLeft, X, Check,
  Edit3, Trash2, ArrowUpDown, Lightbulb, AlertTriangle, Bot,
  FileText, Mail, Mic, Video, Star, PartyPopper, PenTool,
  Megaphone, Briefcase, LayoutList, LayoutGrid, Eye,
} from 'lucide-react';

/* ═══════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════ */

const PHASES = [
  { id: 0, title: 'Strategy & Planning', desc: 'Goals, audiences & messaging', icon: Target },
  { id: 1, title: 'Content Creation', desc: 'Channels, assets & calendar', icon: PenTool },
  { id: 2, title: 'Media Outreach', desc: 'Tasks & assignments', icon: Megaphone },
  { id: 3, title: 'Execution & Monitoring', desc: 'Track & measure results', icon: TrendingUp },
  { id: 4, title: 'Campaign Overview', desc: 'Review & launch', icon: Eye },
];

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

/* ═══════════════════════════════════════════
   MAIN COMPONENT
   ═══════════════════════════════════════════ */

const CampaignPlanningView = ({ onBack, onUseTemplates, onCreateFromPlan, toast }) => {
  // ── Page / Phase state ──
  const [activePage, setActivePage] = useState(0);
  const [phaseComplete, setPhaseComplete] = useState([false, false, false, false]);

  // ── Strategy & Planning (Page 1) ──
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
  const [showAdvancedStrategy, setShowAdvancedStrategy] = useState(false);

  // ── Content Creation (Page 2) ──
  const [channels, setChannels] = useState({});
  const [platforms, setPlatforms] = useState({ IG: true, TikTok: false, X: false, LinkedIn: false });
  const [vibe, setVibe] = useState({ serious: 50, bold: 50, corporate: 50 });
  const [postsPerWeek, setPostsPerWeek] = useState(3);
  const [reelsPerWeek, setReelsPerWeek] = useState(1);
  const [mustInclude, setMustInclude] = useState('');
  const [cta, setCta] = useState('');
  const [brief, setBrief] = useState('');
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [audience, setAudience] = useState('');
  const [selectedPalette, setSelectedPalette] = useState(null);
  const [paletteOptions, setPaletteOptions] = useState([]);
  const [contentCards, setContentCards] = useState([]);
  const [brandKit, setBrandKit] = useState(null);
  const [expandedPost, setExpandedPost] = useState(null);

  // ── Media Outreach (Page 3) ──
  const [tasks, setTasks] = useState([]);
  const [taskView, setTaskView] = useState('list');
  const [taskSort, setTaskSort] = useState({ col: '', dir: 'asc' });
  const [editingTaskId, setEditingTaskId] = useState(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [suggestedTasks, setSuggestedTasks] = useState([]);
  const [isLoadingSuggestions, setIsLoadingSuggestions] = useState(false);

  // ── AI state ──
  const [aiChat, setAiChat] = useState([]);
  const [chatInput, setChatInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAiAssistant, setShowAiAssistant] = useState(false);
  const [showSaved, setShowSaved] = useState(false);

  const canCreate = useMemo(() => Boolean(campaignName.trim() && startDate), [campaignName, startDate]);
  const triggerSave = useCallback(() => { setShowSaved(true); setTimeout(() => setShowSaved(false), 1500); }, []);

  const platformColors = {
    IG: { bg: 'bg-gradient-to-br from-purple-500 to-pink-500', text: 'text-white', dot: '#9333EA' },
    TikTok: { bg: 'bg-black dark:bg-white', text: 'text-white dark:text-black', dot: '#000000' },
    X: { bg: 'bg-gray-900 dark:bg-gray-200', text: 'text-white dark:text-black', dot: '#1E293B' },
    LinkedIn: { bg: 'bg-blue-600', text: 'text-white', dot: '#0A66C2' },
  };

  /* ── Navigation ── */
  const goNext = () => setActivePage(p => Math.min(4, p + 1));
  const goPrev = () => setActivePage(p => Math.max(0, p - 1));
  const markPhaseComplete = (idx) => setPhaseComplete(p => { const n = [...p]; n[idx] = !n[idx]; return n; });

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

  const suggestTasks = async () => {
    setIsLoadingSuggestions(true);
    setSuggestedTasks([]);
    const ctx = buildCampaignContext();
    const existingNames = tasks.map(t => t.name).join(', ');
    const prompt = `You are a PR campaign strategist. Based on this campaign context, suggest 6 specific, actionable tasks for the media outreach phase.

Campaign: "${ctx.name || 'Untitled'}"
Type: ${ctx.campaignType || 'General'}
Goal: ${ctx.goal || 'Not specified'}
Channels: ${ctx.channels?.join(', ') || 'Not specified'}
Audiences: ${ctx.audience || 'Not specified'}
${existingNames ? `Already have tasks: ${existingNames}` : ''}

Return ONLY a JSON array of objects with this exact shape (no markdown, no explanation):
[{"name":"task name","priority":"high"|"medium"|"low","assignee":"suggested role"}]

Suggest tasks that are specific to the campaign type and channels, covering areas like pitching, follow-up, press release drafting, media list building, social scheduling, etc.`;
    try {
      const res = await fetch('/api/ai/campaign-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [{ role: 'user', content: prompt }], campaignContext: ctx }),
      });
      const data = await res.json();
      const reply = data.reply || '';
      const match = reply.match(/\[[\s\S]*\]/);
      if (match) {
        const parsed = JSON.parse(match[0]);
        setSuggestedTasks(parsed.map((t, i) => ({ ...t, id: `sug-${Date.now()}-${i}` })));
      }
    } catch {
      setSuggestedTasks([
        { id: 'sug-1', name: 'Build target media list', priority: 'high', assignee: 'PR Manager' },
        { id: 'sug-2', name: 'Draft press release', priority: 'high', assignee: 'Copywriter' },
        { id: 'sug-3', name: 'Send initial pitch emails', priority: 'high', assignee: 'PR Manager' },
        { id: 'sug-4', name: 'Follow up with journalists', priority: 'medium', assignee: 'PR Manager' },
        { id: 'sug-5', name: 'Prepare spokesperson briefing', priority: 'medium', assignee: 'Communications Lead' },
        { id: 'sug-6', name: 'Monitor media coverage', priority: 'low', assignee: 'Analyst' },
      ]);
    } finally {
      setIsLoadingSuggestions(false);
    }
  };

  const acceptSuggestedTask = (sug) => {
    setTasks(p => [...p, { id: Date.now(), name: sug.name, assignee: sug.assignee || '', priority: sug.priority || 'medium', status: 'planned', dueDate: '' }]);
    setSuggestedTasks(p => p.filter(s => s.id !== sug.id));
    triggerSave();
  };

  const dismissSuggestedTask = (id) => setSuggestedTasks(p => p.filter(s => s.id !== id));

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

  /* ── AI Suggestions ── */
  const aiSuggestions = useMemo(() => {
    const s = [];
    if (!campaignName) s.push({ icon: Edit3, title: 'Name your campaign', desc: 'Give it a clear, memorable name', type: 'warning' });
    if (!campaignType) s.push({ icon: Briefcase, title: 'Select campaign type', desc: 'Helps suggest relevant tasks and templates', type: 'tip' });
    if (!objectives) s.push({ icon: Target, title: 'Set objectives', desc: 'Define measurable goals for tracking success', type: 'warning' });
    if (audiences.length === 0) s.push({ icon: Users, title: 'Define audiences', desc: 'Add 2-3 target audience segments', type: 'tip' });
    if (keyMessages.length === 0) s.push({ icon: MessageSquare, title: 'Add key messages', desc: 'Define 3-5 consistent campaign messages', type: 'tip' });
    if (Object.values(channels).filter(Boolean).length === 0) s.push({ icon: Megaphone, title: 'Select channels', desc: 'Choose distribution channels', type: 'tip' });
    if (contentCards.length === 0) s.push({ icon: Zap, title: 'Generate content plan', desc: 'Use AI to create a content calendar', type: 'action' });
    if (tasks.length === 0 && contentCards.length > 0) s.push({ icon: LayoutList, title: 'Add tasks', desc: 'Break campaign into actionable steps', type: 'tip' });
    if (startDate && !endDate) s.push({ icon: Calendar, title: 'Set end date', desc: 'Campaigns with deadlines are 40% more effective', type: 'tip' });
    if (campaignType === 'Product Launch') s.push({ icon: Lightbulb, title: 'Launch tip', desc: 'Send press releases 3-5 days before launch', type: 'best-practice' });
    if (campaignType === 'Crisis Management') s.push({ icon: AlertTriangle, title: 'Crisis tip', desc: 'Prepare holding statements and designate a spokesperson', type: 'best-practice' });
    return s;
  }, [campaignName, campaignType, objectives, audiences, keyMessages, channels, contentCards, tasks, startDate, endDate]);

  /* ═══════════════════════════════════════════
     AI API FUNCTIONS
     ═══════════════════════════════════════════ */

  const generatePalettes = async () => {
    setIsGenerating(true);
    setAiChat(p => [...p, { role: 'user', content: 'Generate color palettes' }]);
    try {
      const res = await fetch('/api/ai/campaign-palettes', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: campaignName, goal, audience: audiences.map(a => a.name).join(', '), vibe }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error);
      if (data.palettes?.length) { setPaletteOptions(data.palettes); setAiChat(p => [...p, { role: 'assistant', content: `Generated ${data.palettes.length} palettes:\n${data.palettes.map(p => `- "${p.name}" -- ${p.vibe}`).join('\n')}` }]); }
      else throw new Error('No palettes');
    } catch {
      setPaletteOptions([
        { id: 1, name: 'Civic Neon', colors: ['#FF3366', '#7C3AED', '#06B6D4', '#F59E0B', '#10B981'], gradient: 'linear-gradient(135deg, #FF3366, #7C3AED)', vibe: 'Bold, energetic' },
        { id: 2, name: 'Midnight Policy', colors: ['#1E293B', '#3B82F6', '#8B5CF6', '#E0E7FF', '#F1F5F9'], gradient: 'linear-gradient(135deg, #1E293B, #3B82F6)', vibe: 'Professional, trustworthy' },
        { id: 3, name: 'Campus Sunrise', colors: ['#FBBF24', '#F59E0B', '#FB923C', '#FDE68A', '#FEF3C7'], gradient: 'linear-gradient(135deg, #FBBF24, #FB923C)', vibe: 'Warm, optimistic' },
      ]);
      setAiChat(p => [...p, { role: 'assistant', content: 'Generated 3 default palettes. Click to preview.' }]);
    } finally { setIsGenerating(false); }
  };

  const generateCampaignPlan = async (skip = false) => {
    const needsInfo = !campaignName || !startDate || !endDate;
    if (needsInfo && !skip) {
      setAiChat(p => [...p, { role: 'user', content: 'Generate plan' }, { role: 'assistant', content: `Fill in the campaign name and dates first, then I'll generate your plan.` }]);
      return;
    }
    setIsGenerating(true);
    setAiChat(p => [...p, { role: 'user', content: 'Generate full campaign plan' }, { role: 'assistant', content: 'Building your content plan...' }]);
    try {
      const res = await fetch('/api/ai/campaign-generate', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildCampaignContext()) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error);
      if (data.plan) {
        const plan = data.plan;
        if (plan.recommendedVibe) setVibe(plan.recommendedVibe);
        setBrandKit({ pillars: plan.pillars || [], voice: plan.voice || {} });
        const cards = (plan.contentCards || []).map((c, i) => ({ ...c, id: i + 1 }));
        setContentCards(cards);
        const counts = {}; cards.forEach(c => { counts[c.platform] = (counts[c.platform] || 0) + 1; });
        setAiChat(p => [...p, { role: 'assistant', content: `${plan.vibeAnalysis || 'Plan generated!'}\n\n${cards.length} posts across ${Object.keys(counts).length} platforms.\n\n${(plan.pillars || []).map(p => `${p.emoji} ${p.name}`).join(' / ')}` }]);
        toast?.('Campaign plan generated!', { type: 'success' });
      } else throw new Error('No plan returned');
    } catch (err) {
      setAiChat(p => [...p, { role: 'assistant', content: `Error: ${err.message}` }]);
      toast?.(err.message, { type: 'error' });
    } finally { setIsGenerating(false); }
  };

  const generateCaptions = async () => {
    setIsGenerating(true);
    setAiChat(p => [...p, { role: 'user', content: 'Generate captions' }]);
    try {
      const res = await fetch('/api/ai/campaign-captions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(buildCampaignContext()) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error);
      if (data.captionBank) {
        const fmt = (arr) => arr?.map(c => `- "${c.text}" (${c.bestFor})`).join('\n') || '';
        setAiChat(p => [...p, { role: 'assistant', content: `Caption Bank:\n\nShort:\n${fmt(data.captionBank.short)}\n\nMedium:\n${fmt(data.captionBank.medium)}\n\nHooks:\n${fmt(data.captionBank.hooks)}\n\nCTAs:\n${fmt(data.captionBank.ctas)}` }]);
      } else throw new Error('No captions');
    } catch (err) { setAiChat(p => [...p, { role: 'assistant', content: `Error: ${err.message}` }]); }
    finally { setIsGenerating(false); }
  };

  const sendMessage = async () => {
    if (!chatInput.trim()) return;
    const msg = chatInput.trim(); setChatInput(''); setIsGenerating(true);
    setAiChat(p => [...p, { role: 'user', content: msg }]);
    try {
      const res = await fetch('/api/ai/campaign-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ messages: [...aiChat, { role: 'user', content: msg }], campaignContext: buildCampaignContext() }) });
      const data = await res.json(); if (!res.ok) throw new Error(data.error);
      setAiChat(p => [...p, { role: 'assistant', content: data.reply || 'How can I help?' }]);
    } catch (err) { setAiChat(p => [...p, { role: 'assistant', content: `Error: ${err.message}` }]); }
    finally { setIsGenerating(false); }
  };

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

  /* Page footer with nav buttons */
  const PageNav = ({ showComplete, phaseIdx }) => (
    <div className="flex items-center justify-between pt-6 mt-6 border-t border-border dark:border-border-dark">
      <button onClick={goPrev} disabled={activePage === 0} className="btn-secondary flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
        <ChevronLeft size={16} /> Previous
      </button>
      <div className="flex items-center gap-3">
        {showComplete && phaseIdx !== undefined && (
          <button onClick={() => markPhaseComplete(phaseIdx)} className={`text-small px-4 py-2 rounded-control border transition-colors font-medium ${phaseComplete[phaseIdx] ? 'bg-success/10 border-success/30 text-success' : 'border-border dark:border-border-dark text-mutedText hover:border-success/30 hover:text-success'}`}>
            <Check size={14} className="inline mr-1.5" />{phaseComplete[phaseIdx] ? 'Completed' : 'Mark Complete'}
          </button>
        )}
        {showSaved && <span className="text-small text-success animate-pulse font-medium">Saved</span>}
        <button onClick={goNext} disabled={activePage === 4} className="btn-primary flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed">
          {activePage === 3 ? 'Review Campaign' : 'Next'} <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );

  /* Completion stats for the stepper */
  const activeChannels = Object.values(channels).filter(Boolean).length;
  const activePlatforms = Object.values(platforms).filter(Boolean).length;

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
                  <p className="text-small text-mutedText">{expandedPost.type} - Week {expandedPost.week} - {expandedPost.day} @ {expandedPost.time}</p>
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

      {/* ═══ AI ASSISTANT PANEL ═══ */}
      {showAiAssistant && (
        <div className="fixed bottom-20 right-6 w-96 max-h-[70vh] bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-card shadow-2xl z-40 flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border dark:border-border-dark">
            <h3 className="text-body font-semibold text-text dark:text-white flex items-center gap-2"><Bot size={18} className="text-primary" /> AI Campaign Assistant</h3>
            <button onClick={() => setShowAiAssistant(false)} className="text-mutedText hover:text-text dark:hover:text-white"><X size={16} /></button>
          </div>
          {aiSuggestions.length > 0 && (
            <div className="p-3 border-b border-border dark:border-border-dark max-h-44 overflow-y-auto space-y-2">
              {aiSuggestions.slice(0, 5).map((s, i) => (
                <div key={i} className={`p-2.5 rounded-control border text-small ${s.type === 'warning' ? 'border-warning/30 bg-warning/5' : s.type === 'best-practice' ? 'border-success/30 bg-success/5' : 'border-primary/20 bg-primary/5'}`}>
                  <div className="flex items-center gap-2 font-semibold text-text dark:text-white"><s.icon size={14} className="text-primary" />{s.title}</div>
                  <p className="text-mutedText dark:text-mutedText-dark mt-0.5">{s.desc}</p>
                </div>
              ))}
            </div>
          )}
          <div className="p-3 border-b border-border dark:border-border-dark grid grid-cols-3 gap-2">
            <button onClick={generatePalettes} disabled={isGenerating} className="px-2 py-1.5 bg-primary/5 border border-primary/20 rounded-control text-small font-medium text-primary hover:shadow-sm disabled:opacity-50"><Palette size={14} className="mx-auto mb-0.5" />Palettes</button>
            <button onClick={() => generateCampaignPlan(true)} disabled={isGenerating} className="px-2 py-1.5 bg-primary/5 border border-primary/20 rounded-control text-small font-medium text-primary hover:shadow-sm disabled:opacity-50"><Zap size={14} className="mx-auto mb-0.5" />Full Plan</button>
            <button onClick={generateCaptions} disabled={isGenerating} className="px-2 py-1.5 bg-primary/5 border border-primary/20 rounded-control text-small font-medium text-primary hover:shadow-sm disabled:opacity-50"><MessageSquare size={14} className="mx-auto mb-0.5" />Captions</button>
          </div>
          <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[100px]">
            {aiChat.length === 0 && <p className="text-small text-mutedText text-center py-6">Ask me anything about your campaign</p>}
            {aiChat.map((m, i) => (
              <div key={i} className={`p-2.5 rounded-control text-small ${m.role === 'user' ? 'bg-primary/10 border border-primary/20 ml-6' : 'bg-surface2 dark:bg-surface2-dark border border-border dark:border-border-dark mr-6'}`}>
                <span className="font-medium text-mutedText text-[11px]">{m.role === 'user' ? 'You' : 'AI'}</span>
                <div className="text-text dark:text-white whitespace-pre-line mt-0.5">{m.content}</div>
              </div>
            ))}
            {isGenerating && <div className="flex gap-1 items-center text-mutedText"><div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" /><div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.1s' }} /><div className="w-1.5 h-1.5 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0.2s' }} /></div>}
          </div>
          <div className="p-3 border-t border-border dark:border-border-dark flex gap-2">
            <input value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && sendMessage()} placeholder="Ask AI..." className={`flex-1 ${inp} text-small`} />
            <button onClick={sendMessage} disabled={isGenerating} className="btn-primary px-3 py-2 disabled:opacity-50"><ChevronRight size={16} /></button>
          </div>
        </div>
      )}

      {/* ═══ TOP BAR ═══ */}
      <div className="bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="btn-secondary flex items-center gap-2 text-small"><ArrowLeft size={16} /> Back</button>
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-purple-500 rounded-control flex items-center justify-center"><Sparkles className="w-4 h-4 text-white" /></div>
          <h1 className="text-body font-bold text-text dark:text-white">Campaign Studio</h1>
          {campaignName && <span className="text-small text-mutedText">/ {campaignName}</span>}
          {campaignType && <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium">{campaignType}</span>}
        </div>
        <div className="flex items-center gap-2">
          {showSaved && <span className="text-small text-success animate-pulse font-medium">Saved</span>}
          <button onClick={onUseTemplates} className="btn-secondary text-small flex items-center gap-1"><Sparkles size={14} /> Templates</button>
          <button onClick={handleCreate} disabled={!canCreate} className="btn-primary text-small flex items-center gap-1 disabled:opacity-50"><Download size={14} /> Create Campaign</button>
        </div>
      </div>

      {/* ═══ PHASE STEPPER ═══ */}
      <div className="bg-surface dark:bg-surface-dark border-b border-border dark:border-border-dark px-6 py-2.5 flex items-center gap-2 flex-shrink-0 overflow-x-auto">
        {PHASES.map((phase, i) => {
          const isActive = activePage === i;
          const isDone = i < 4 && phaseComplete[i];
          const isPast = i < activePage;
          return (
            <React.Fragment key={phase.id}>
              {i > 0 && <div className={`h-0.5 flex-1 min-w-[20px] rounded-full transition-colors ${isPast || isActive ? 'bg-primary' : 'bg-border dark:bg-border-dark'}`} />}
              <button
                onClick={() => setActivePage(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-control transition-all whitespace-nowrap ${isActive
                  ? 'bg-primary/10 border border-primary/30 shadow-sm'
                  : 'hover:bg-surface2 dark:hover:bg-surface2-dark border border-transparent'
                  }`}
              >
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-small font-bold transition-colors ${isDone ? 'bg-success text-white' : isActive ? 'bg-primary text-white' : isPast ? 'bg-primary/20 text-primary' : 'bg-surface2 dark:bg-surface2-dark text-mutedText'
                  }`}>
                  {isDone ? <Check size={14} /> : i + 1}
                </div>
                <div className="text-left">
                  <div className={`text-small font-semibold ${isActive ? 'text-primary' : 'text-text dark:text-white'}`}>{phase.title}</div>
                  <div className="text-[10px] text-mutedText">{phase.desc}</div>
                </div>
              </button>
            </React.Fragment>
          );
        })}
      </div>

      {/* ═══ PAGE CONTENT ═══ */}
      <div className="flex-1 overflow-y-auto bg-background dark:bg-background-dark">
        <div className="max-w-5xl mx-auto p-6">

          {/* ═══════════════════════════════════════════
             PAGE 1: STRATEGY & PLANNING
             ═══════════════════════════════════════════ */}
          {activePage === 0 && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Target size={20} className="text-primary" /></div>
                <div>
                  <h2 className="text-h2 font-bold text-text dark:text-white">Strategy & Planning</h2>
                  <p className="text-small text-mutedText">Define your campaign foundation - goals, audiences, and key messaging</p>
                </div>
              </div>

              {/* Campaign Identity */}
              <div className="card mb-6">
                {sectionTitle(FileText, 'Campaign Identity')}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className={lbl}>Campaign Name *</label>
                    <input value={campaignName} onChange={e => { setCampaignName(e.target.value); triggerSave(); }} placeholder="Enter campaign name..." className={`${inp} font-semibold text-h3`} />
                  </div>
                  <div>
                    <label className={lbl}>Campaign Type</label>
                    <select value={campaignType} onChange={e => { setCampaignType(e.target.value); triggerSave(); }} className={inp}>
                      <option value="">Select type...</option>
                      {CAMPAIGN_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className={lbl}>Start Date *</label>
                    <input type="date" value={startDate} onChange={e => { setStartDate(e.target.value); triggerSave(); }} className={inp} />
                  </div>
                  <div>
                    <label className={lbl}>End Date</label>
                    <input type="date" value={endDate} onChange={e => { setEndDate(e.target.value); triggerSave(); }} className={inp} />
                  </div>
                </div>
                <div className="mt-4">
                  <label className={lbl}>Campaign Goal</label>
                  <div className="grid grid-cols-4 gap-3">
                    {GOAL_OPTIONS.map(o => (
                      <button key={o.id} onClick={() => { setGoal(o.id); triggerSave(); }} className={`p-3 rounded-control border-2 transition-all text-center ${goal === o.id ? 'border-primary bg-primary/10 shadow-sm' : 'border-border dark:border-border-dark hover:border-mutedText/30'}`}>
                        <o.icon className={`w-5 h-5 mx-auto mb-1 ${goal === o.id ? 'text-primary' : 'text-mutedText'}`} />
                        <div className="text-small font-medium text-text dark:text-white">{o.label}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Objectives + KPIs */}
              <div className="card mb-6">
                {sectionTitle(Target, 'Campaign Objectives')}
                <textarea value={objectives} onChange={e => { setObjectives(e.target.value); triggerSave(); }} rows={3} placeholder="Generate X media placements, achieve X impressions, increase brand awareness by X%..." className={inp} />
              </div>

              <div className="mb-6">
                <button
                  onClick={() => setShowAdvancedStrategy(p => !p)}
                  className="flex items-center gap-2 text-small font-semibold text-text dark:text-white mb-4 hover:text-primary transition-colors"
                >
                  <ChevronRight size={16} className={`transition-transform duration-200 ${showAdvancedStrategy ? 'rotate-90' : ''}`} />
                  Advanced Strategy (Optional)
                  <span className="text-[11px] font-normal text-mutedText ml-2 border px-2 py-0.5 rounded-full border-border dark:border-border-dark">Audiences & Key Messages</span>
                </button>

                {showAdvancedStrategy && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn pb-2">
                    {/* Audiences */}
                    <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm backdrop-blur-xl bg-white/50 dark:bg-black/50 rounded-card p-6">
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
                        <input value={audienceInput} onChange={e => setAudienceInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addAudience()} placeholder="Add audience segment..." className={`flex-1 bg-transparent border-b border-border dark:border-border-dark px-2 py-1.5 text-small text-text dark:text-white focus:outline-none focus:border-primary transition-colors`} />
                        <button onClick={addAudience} className="btn-secondary text-small px-3 flex items-center gap-1 bg-transparent border-none hover:text-primary"><Plus size={14} /> Add</button>
                      </div>
                    </div>

                    {/* Key Messages */}
                    <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm backdrop-blur-xl bg-white/50 dark:bg-black/50 rounded-card p-6">
                      {sectionTitle(MessageSquare, 'Key Messages')}
                      <div className="space-y-2 mb-3 min-h-[40px]">
                        {keyMessages.map((m, idx) => (
                          <div key={m.id} draggable onDragStart={() => setDraggedMsgIdx(idx)} onDragOver={e => e.preventDefault()} onDrop={() => handleMsgDrop(idx)} onDragEnd={() => setDraggedMsgIdx(null)}
                            className={`flex items-center gap-2 p-2.5 rounded-control bg-surface2/50 dark:bg-surface2-dark/50 transition-all ${draggedMsgIdx === idx ? 'opacity-40 scale-95' : 'hover:shadow-sm'}`}>
                            <GripVertical size={16} className="text-mutedText cursor-grab flex-shrink-0" />
                            <span className="w-5 h-5 rounded-full bg-primary/10 text-primary text-[11px] font-bold flex items-center justify-center flex-shrink-0">{idx + 1}</span>
                            <input value={m.text} onChange={e => updateMessage(m.id, e.target.value)} className="flex-1 bg-transparent text-small text-text dark:text-white focus:outline-none" placeholder="Enter message..." />
                            <button onClick={() => removeMessage(m.id)} className="text-mutedText hover:text-danger flex-shrink-0"><X size={14} /></button>
                          </div>
                        ))}
                        {keyMessages.length === 0 && <p className="text-small text-mutedText italic py-1">Add 3-5 key messages for consistency</p>}
                      </div>
                      <div className="flex gap-2">
                        <input value={msgInput} onChange={e => setMsgInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && addMessage()} placeholder="Add key message..." className={`flex-1 bg-transparent border-b border-border dark:border-border-dark px-2 py-1.5 text-small text-text dark:text-white focus:outline-none focus:border-primary transition-colors`} />
                        <button onClick={addMessage} className="btn-secondary text-small px-3 flex items-center gap-1 bg-transparent border-none hover:text-primary"><Plus size={14} /> Add</button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <PageNav showComplete phaseIdx={0} />
            </div>
          )}

          {/* ═══════════════════════════════════════════
             PAGE 2: CONTENT CREATION
             ═══════════════════════════════════════════ */}
          {activePage === 1 && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><PenTool size={20} className="text-primary" /></div>
                <div>
                  <h2 className="text-h2 font-bold text-text dark:text-white">Content Creation</h2>
                  <p className="text-small text-mutedText">Choose channels, set the vibe, and generate your content calendar</p>
                </div>
              </div>

              {/* Channel Selection */}
              <div className="mb-6">
                <h4 className="text-body font-semibold text-text dark:text-white mb-4 flex items-center gap-2"><Megaphone size={16} className="text-primary" /> Target Channels</h4>
                <div className="flex flex-wrap gap-2">
                  {CHANNEL_OPTIONS.map(ch => (
                    <button key={ch.id} onClick={() => toggleChannel(ch.id)} className={`px-4 py-2 rounded-full border transition-all flex items-center gap-2 ${channels[ch.id] ? 'bg-primary border-primary text-white shadow-sm' : 'bg-surface dark:bg-surface-dark border-border dark:border-border-dark text-text dark:text-white hover:border-primary/50'}`}>
                      <span>{ch.icon}</span>
                      <span className="text-small font-medium">{ch.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Advanced Content Settings Dropdown */}
              <div className="mb-6">
                <button
                  onClick={() => setShowAdvancedSettings(p => !p)}
                  className="flex items-center gap-2 text-small font-semibold text-text dark:text-white mb-4 hover:text-primary transition-colors"
                >
                  <ChevronRight size={16} className={`transition-transform duration-200 ${showAdvancedSettings ? 'rotate-90' : ''}`} />
                  Advanced Settings
                  <span className="text-[11px] font-normal text-mutedText ml-2 border px-2 py-0.5 rounded-full border-border dark:border-border-dark">Vibe, Frequency, Instructions</span>
                </button>

                {showAdvancedSettings && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 animate-fadeIn pb-2">
                    {/* Social + Vibe */}
                    <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm backdrop-blur-xl bg-white/50 dark:bg-black/50 rounded-card p-6">
                      <h4 className="text-body font-semibold text-text dark:text-white mb-3">Social Platforms</h4>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {Object.entries(platforms).map(([p, active]) => (
                          <button key={p} onClick={() => togglePlatform(p)} className={`px-4 py-1.5 rounded-full text-small font-semibold transition-all border ${active ? 'bg-text text-surface border-text dark:bg-white dark:text-black dark:border-white shadow-sm' : 'bg-transparent text-mutedText border-border dark:border-border-dark hover:border-text dark:hover:border-white'}`}>{p}</button>
                        ))}
                      </div>
                      <h4 className="text-body font-semibold text-text dark:text-white mb-3">Campaign Vibe</h4>
                      {[{ key: 'serious', l: 'Serious', r: 'Playful' }, { key: 'bold', l: 'Minimal', r: 'Bold' }, { key: 'corporate', l: 'Corporate', r: 'Student' }].map(s => (
                        <div key={s.key} className="mb-4">
                          <div className="flex justify-between text-[11px] text-mutedText mb-2"><span className="font-medium">{s.l}</span><span className="text-primary font-bold bg-primary/10 px-2 py-0.5 rounded-full">{vibe[s.key]}</span><span className="font-medium">{s.r}</span></div>
                          <input type="range" min="0" max="100" value={vibe[s.key]} onChange={e => setVibe(p => ({ ...p, [s.key]: +e.target.value }))} className="w-full accent-primary h-1.5 bg-border dark:bg-border-dark rounded-full appearance-none outline-none cursor-pointer" />
                        </div>
                      ))}
                    </div>

                    {/* Content Settings */}
                    <div className="bg-surface dark:bg-surface-dark border border-border dark:border-border-dark shadow-sm backdrop-blur-xl bg-white/50 dark:bg-black/50 rounded-card p-6 space-y-4">
                      <h4 className="text-body font-semibold text-text dark:text-white">Content Rules</h4>
                      <div className="flex items-center justify-between p-2 bg-surface2/50 dark:bg-surface2-dark/50 rounded-control"><span className="text-small text-text dark:text-white font-medium">Posts per week</span><input type="number" min="1" max="14" value={postsPerWeek} onChange={e => setPostsPerWeek(+e.target.value)} className="w-16 px-2 py-1 bg-transparent border-b border-border focus:border-primary outline-none text-center text-text dark:text-white font-semibold" /></div>
                      <div className="flex items-center justify-between p-2 bg-surface2/50 dark:bg-surface2-dark/50 rounded-control"><span className="text-small text-text dark:text-white font-medium">Reels per week</span><input type="number" min="0" max="7" value={reelsPerWeek} onChange={e => setReelsPerWeek(+e.target.value)} className="w-16 px-2 py-1 bg-transparent border-b border-border focus:border-primary outline-none text-center text-text dark:text-white font-semibold" /></div>
                      <div>
                        <label className="text-small font-medium text-text mt-2 block">Call to Action <span className="text-mutedText font-normal">(Optional)</span></label>
                        <input value={cta} onChange={e => setCta(e.target.value)} placeholder="E.g., Link in bio, Register today" className={`w-full bg-transparent border-b border-border dark:border-border-dark px-2 py-2 text-small text-text dark:text-white focus:outline-none focus:border-primary transition-colors`} />
                      </div>
                      <div>
                        <label className="text-small font-medium text-text mt-2 block">Must Include <span className="text-mutedText font-normal">(Optional)</span></label>
                        <textarea value={mustInclude} onChange={e => setMustInclude(e.target.value)} rows={2} placeholder="Specific hashtags, sponsor links..." className={`w-full bg-transparent border-b border-border dark:border-border-dark px-2 py-2 text-small text-text dark:text-white focus:outline-none focus:border-primary transition-colors resize-none`} />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* AI Generation Box */}
              <div className="bg-gradient-to-br from-primary/5 to-purple-500/5 border border-primary/20 rounded-card p-6 mb-8 flex flex-col md:flex-row items-start md:items-center gap-6">
                <div className="flex-1 w-full">
                  <h4 className="text-body font-bold text-text dark:text-white mb-2 flex items-center gap-2"><Zap size={18} className="text-primary text-glow" /> Campaign Generator</h4>
                  <p className="text-small text-mutedText mb-3">Provide a rough idea and let AI build the timeline, palettes, and captions.</p>
                  <textarea value={brief} onChange={e => setBrief(e.target.value)} rows={2} placeholder="Idea dump: context, special requests..." className={`w-full bg-surface dark:bg-surface-dark border p-3 border-border dark:border-border-dark focus:border-primary rounded-xl text-small shadow-inner transition-colors resize-none`} />
                </div>
                <div className="flex flex-col gap-2 w-full md:w-auto mt-auto shrink-0">
                  <button onClick={() => generateCampaignPlan(true)} disabled={isGenerating} className="btn-primary text-small flex items-center justify-center gap-2 disabled:opacity-50 py-2.5 px-6 shadow-md hover:shadow-lg transition-all"><Sparkles size={16} /> Generate Plan</button>
                  <div className="flex gap-2">
                    <button onClick={generatePalettes} disabled={isGenerating} className="flex-1 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-control py-2 text-small font-medium hover:border-primary transition-colors disabled:opacity-50 text-text dark:text-white">Colors</button>
                    <button onClick={generateCaptions} disabled={isGenerating} className="flex-1 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark rounded-control py-2 text-small font-medium hover:border-primary transition-colors disabled:opacity-50 text-text dark:text-white">Captions</button>
                  </div>
                </div>
              </div>

              {/* Palettes */}
              {paletteOptions.length > 0 && (
                <div className="card mb-6">
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
                <div className="card mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-body font-semibold text-text dark:text-white">Content Timeline - {contentCards.length} posts</h4>
                    {selectedPalette && <div className="flex items-center gap-1.5 px-2 py-1 rounded-full" style={{ background: selectedPalette.gradient }}><Palette size={12} className="text-white" /><span className="text-[11px] font-medium text-white">{selectedPalette.name}</span></div>}
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

              <PageNav showComplete phaseIdx={1} />
            </div>
          )}

          {/* ═══════════════════════════════════════════
             PAGE 3: MEDIA OUTREACH
             ═══════════════════════════════════════════ */}
          {activePage === 2 && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><Megaphone size={20} className="text-primary" /></div>
                <div>
                  <h2 className="text-h2 font-bold text-text dark:text-white">Media Outreach</h2>
                  <p className="text-small text-mutedText">Manage tasks, assign team members, and track your outreach efforts</p>
                </div>
              </div>

              <div className="card">
                <div className="flex items-center justify-between mb-4">
                  {sectionTitle(LayoutList, 'Task Management')}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={suggestTasks}
                      disabled={isLoadingSuggestions}
                      className="flex items-center gap-1.5 text-small font-medium px-3 py-1.5 rounded-control bg-primary/10 text-primary hover:bg-primary/20 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isLoadingSuggestions ? (
                        <><span className="w-3.5 h-3.5 border-2 border-primary/40 border-t-primary rounded-full animate-spin" /> Suggesting...</>
                      ) : (
                        <><Sparkles size={13} /> Suggest Tasks</>
                      )}
                    </button>
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
                    <div className="col-span-1 px-3 py-2.5 text-center">Actions</div>
                  </div>
                  {sortedTasks.map(t => (
                    <div key={t.id} className="grid grid-cols-12 gap-0 border-t border-border dark:border-border-dark hover:bg-surface2/50 dark:hover:bg-surface2-dark/50 transition-colors">
                      <div className="col-span-4 px-3 py-2.5">
                        {editingTaskId === t.id ? (
                          <input value={t.name} onChange={e => updateTask(t.id, 'name', e.target.value)} onBlur={() => setEditingTaskId(null)} onKeyDown={e => e.key === 'Enter' && setEditingTaskId(null)} autoFocus className="bg-transparent text-small text-text dark:text-white focus:outline-none border-b border-primary w-full" />
                        ) : (
                          <span onClick={() => setEditingTaskId(t.id)} className="text-small text-text dark:text-white cursor-pointer hover:text-primary">{t.name}</span>
                        )}
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

                {suggestedTasks.length > 0 && (
                  <div className="mt-4 p-4 rounded-control bg-primary/5 border border-primary/20">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Sparkles size={14} className="text-primary" />
                        <span className="text-small font-semibold text-text dark:text-white">AI Suggested Tasks</span>
                        <span className="text-[11px] text-mutedText">Click + to add</span>
                      </div>
                      <button onClick={() => setSuggestedTasks([])} className="text-mutedText hover:text-danger transition-colors"><X size={14} /></button>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {suggestedTasks.map(sug => (
                        <div key={sug.id} className="flex items-center gap-1.5 pl-3 pr-1.5 py-1.5 rounded-full bg-surface dark:bg-surface-dark border border-border dark:border-border-dark text-small">
                          <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${sug.priority === 'high' ? 'bg-danger' : sug.priority === 'medium' ? 'bg-warning' : 'bg-success'}`} />
                          <span className="text-text dark:text-white">{sug.name}</span>
                          {sug.assignee && <span className="text-mutedText text-[11px]">· {sug.assignee}</span>}
                          <button onClick={() => acceptSuggestedTask(sug)} className="ml-1 w-5 h-5 rounded-full bg-primary/10 text-primary hover:bg-primary hover:text-white flex items-center justify-center transition-colors flex-shrink-0"><Plus size={11} /></button>
                          <button onClick={() => dismissSuggestedTask(sug.id)} className="w-5 h-5 rounded-full text-mutedText hover:bg-danger/10 hover:text-danger flex items-center justify-center transition-colors flex-shrink-0"><X size={11} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <PageNav showComplete phaseIdx={2} />
            </div>
          )}

          {/* ═══════════════════════════════════════════
             PAGE 4: EXECUTION & MONITORING
             ═══════════════════════════════════════════ */}
          {activePage === 3 && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center"><TrendingUp size={20} className="text-primary" /></div>
                <div>
                  <h2 className="text-h2 font-bold text-text dark:text-white">Execution & Monitoring</h2>
                  <p className="text-small text-mutedText">Track performance, monitor progress, and measure campaign success</p>
                </div>
              </div>

              {contentCards.length > 0 ? (
                <>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                    <div className="card text-center"><div className="text-3xl font-bold text-primary mb-1">{contentCards.length}</div><div className="text-small text-mutedText">Total Posts</div></div>
                    <div className="card text-center"><div className="text-3xl font-bold text-info mb-1">{activePlatforms}</div><div className="text-small text-mutedText">Platforms</div></div>
                    <div className="card text-center"><div className="text-3xl font-bold text-success mb-1">{brandKit?.pillars?.length || 0}</div><div className="text-small text-mutedText">Content Pillars</div></div>
                    <div className="card text-center"><div className="text-3xl font-bold text-warning mb-1">{tasks.filter(t => t.status === 'done').length}/{tasks.length}</div><div className="text-small text-mutedText">Tasks Done</div></div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                    <div className="card">
                      <h4 className="text-body font-semibold text-text dark:text-white mb-4">Platform Breakdown</h4>
                      <div className="space-y-3">
                        {Object.entries(platforms).filter(([, v]) => v).map(([p]) => {
                          const count = contentCards.filter(c => c.platform === p).length;
                          const pct = contentCards.length ? Math.round((count / contentCards.length) * 100) : 0;
                          return (
                            <div key={p} className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-control flex items-center justify-center text-white font-bold text-small ${platformColors[p]?.bg}`}>{count}</div>
                              <div className="flex-1">
                                <div className="flex justify-between text-small mb-1"><span className="font-semibold text-text dark:text-white">{p}</span><span className="text-mutedText">{pct}%</span></div>
                                <div className="w-full bg-surface2 dark:bg-surface2-dark rounded-full h-2"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="card">
                      <h4 className="text-body font-semibold text-text dark:text-white mb-4">Task Progress</h4>
                      {tasks.length > 0 ? (
                        <div className="space-y-3">
                          {['planned', 'in-progress', 'review', 'done'].map(status => {
                            const count = tasks.filter(t => t.status === status).length;
                            const pct = tasks.length ? Math.round((count / tasks.length) * 100) : 0;
                            return (
                              <div key={status} className="flex items-center gap-3">
                                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[status]} min-w-[80px] text-center`}>{status}</span>
                                <div className="flex-1">
                                  <div className="w-full bg-surface2 dark:bg-surface2-dark rounded-full h-2"><div className="h-2 rounded-full bg-primary transition-all" style={{ width: `${pct}%` }} /></div>
                                </div>
                                <span className="text-small text-mutedText w-8 text-right">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      ) : (
                        <p className="text-small text-mutedText text-center py-6">Add tasks in the Media Outreach phase to see progress</p>
                      )}
                    </div>
                  </div>
                </>
              ) : (
                <div className="card text-center py-16">
                  <Camera size={48} className="text-mutedText/30 mx-auto mb-3" />
                  <p className="text-body text-mutedText mb-4">Generate a content plan to see campaign stats and progress tracking</p>
                  <button onClick={() => { setActivePage(1); }} className="btn-primary"><PenTool size={14} className="inline mr-1" /> Go to Content Creation</button>
                </div>
              )}

              <PageNav showComplete phaseIdx={3} />
            </div>
          )}

          {/* ═══════════════════════════════════════════
             PAGE 5: CAMPAIGN OVERVIEW
             ═══════════════════════════════════════════ */}
          {activePage === 4 && (
            <div className="animate-fadeIn">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-purple-500 flex items-center justify-center"><Eye size={20} className="text-white" /></div>
                <div>
                  <h2 className="text-h2 font-bold text-text dark:text-white">Campaign Overview</h2>
                  <p className="text-small text-mutedText">Review everything before launching your campaign</p>
                </div>
              </div>

              {/* Hero Header */}
              <div className="card mb-6 p-0 overflow-hidden">
                <div className="p-6" style={{ background: selectedPalette?.gradient || 'linear-gradient(135deg, #6EA8FF, #8B5CF6)' }}>
                  <h3 className="text-h2 font-bold text-white mb-1">{campaignName || 'Untitled Campaign'}</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {campaignType && <span className="px-3 py-1 rounded-full bg-white/20 text-white text-small font-medium">{campaignType}</span>}
                    {goal && <span className="px-3 py-1 rounded-full bg-white/20 text-white text-small font-medium capitalize">{goal}</span>}
                    {startDate && <span className="px-3 py-1 rounded-full bg-white/20 text-white text-small font-medium">{startDate}{endDate ? ` - ${endDate}` : ''}</span>}
                  </div>
                </div>
              </div>

              {/* Phase completion summary */}
              <div className="grid grid-cols-4 gap-3 mb-6">
                {PHASES.slice(0, 4).map(phase => (
                  <button key={phase.id} onClick={() => setActivePage(phase.id)} className={`card text-center p-4 cursor-pointer hover:shadow-md transition-all border-2 ${phaseComplete[phase.id] ? 'border-success/30' : 'border-transparent'}`}>
                    <div className={`w-8 h-8 rounded-full mx-auto mb-2 flex items-center justify-center ${phaseComplete[phase.id] ? 'bg-success text-white' : 'bg-surface2 dark:bg-surface2-dark text-mutedText'}`}>
                      {phaseComplete[phase.id] ? <Check size={16} /> : <phase.icon size={16} />}
                    </div>
                    <div className="text-small font-semibold text-text dark:text-white">{phase.title}</div>
                    <div className={`text-[11px] mt-1 font-medium ${phaseComplete[phase.id] ? 'text-success' : 'text-mutedText'}`}>{phaseComplete[phase.id] ? 'Complete' : 'Edit'}</div>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                {/* Strategy Summary */}
                <div className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-body font-semibold text-text dark:text-white flex items-center gap-2"><Target size={16} className="text-primary" /> Strategy</h4>
                    <button onClick={() => setActivePage(0)} className="text-[11px] text-primary hover:underline">Edit</button>
                  </div>
                  {objectives && <div className="p-3 bg-surface2 dark:bg-surface2-dark rounded-control mb-3"><p className="text-small text-text dark:text-white">{objectives}</p></div>}
                  {(kpis.media || kpis.impressions || kpis.engagement || kpis.sentiment) && (
                    <div className="grid grid-cols-2 gap-2 mb-3">
                      {kpis.media && <div className="p-2 bg-primary/5 rounded-control"><div className="text-[11px] text-mutedText uppercase">Media</div><div className="text-small font-semibold text-text dark:text-white">{kpis.media}</div></div>}
                      {kpis.impressions && <div className="p-2 bg-primary/5 rounded-control"><div className="text-[11px] text-mutedText uppercase">Impressions</div><div className="text-small font-semibold text-text dark:text-white">{kpis.impressions}</div></div>}
                      {kpis.engagement && <div className="p-2 bg-primary/5 rounded-control"><div className="text-[11px] text-mutedText uppercase">Engagement</div><div className="text-small font-semibold text-text dark:text-white">{kpis.engagement}</div></div>}
                      {kpis.sentiment && <div className="p-2 bg-primary/5 rounded-control"><div className="text-[11px] text-mutedText uppercase">Sentiment</div><div className="text-small font-semibold text-text dark:text-white">{kpis.sentiment}</div></div>}
                    </div>
                  )}
                  {audiences.length > 0 && (
                    <div className="mb-3">
                      <div className="text-[11px] text-mutedText font-medium uppercase mb-1">Audiences</div>
                      <div className="flex flex-wrap gap-1.5">{audiences.map((a, i) => <span key={a.id} className={`px-2 py-0.5 rounded-full text-[11px] font-medium ${AUDIENCE_COLORS[i % AUDIENCE_COLORS.length]}`}>{a.name}</span>)}</div>
                    </div>
                  )}
                  {keyMessages.length > 0 && (
                    <div>
                      <div className="text-[11px] text-mutedText font-medium uppercase mb-1">Key Messages</div>
                      <div className="space-y-1">{keyMessages.map((m, i) => <div key={m.id} className="text-small text-text dark:text-white"><span className="text-primary font-bold mr-1.5">{i + 1}.</span>{m.text}</div>)}</div>
                    </div>
                  )}
                  {!objectives && audiences.length === 0 && keyMessages.length === 0 && <p className="text-small text-mutedText italic">No strategy details added yet</p>}
                </div>

                {/* Channels & Content Summary */}
                <div className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-body font-semibold text-text dark:text-white flex items-center gap-2"><PenTool size={16} className="text-primary" /> Content</h4>
                    <button onClick={() => setActivePage(1)} className="text-[11px] text-primary hover:underline">Edit</button>
                  </div>
                  {activeChannels > 0 && (
                    <div className="mb-3">
                      <div className="text-[11px] text-mutedText font-medium uppercase mb-1">Channels ({activeChannels})</div>
                      <div className="flex flex-wrap gap-1.5">
                        {CHANNEL_OPTIONS.filter(ch => channels[ch.id]).map(ch => (
                          <span key={ch.id} className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-medium">{ch.icon} {ch.name}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {activePlatforms > 0 && (
                    <div className="mb-3">
                      <div className="text-[11px] text-mutedText font-medium uppercase mb-1">Social Platforms</div>
                      <div className="flex gap-1.5">{Object.entries(platforms).filter(([, v]) => v).map(([p]) => <span key={p} className={`px-2 py-0.5 rounded text-[11px] font-bold ${platformColors[p]?.bg} ${platformColors[p]?.text}`}>{p}</span>)}</div>
                    </div>
                  )}
                  {contentCards.length > 0 && (
                    <div className="mb-3">
                      <div className="text-[11px] text-mutedText font-medium uppercase mb-1">Generated Content</div>
                      <div className="grid grid-cols-4 gap-2">
                        {[1, 2, 3, 4].map(w => {
                          const c = contentCards.filter(c => c.week === w).length;
                          return <div key={w} className="text-center p-2 bg-surface2 dark:bg-surface2-dark rounded-control"><div className="text-body font-bold text-text dark:text-white">{c}</div><div className="text-[10px] text-mutedText">Week {w}</div></div>;
                        })}
                      </div>
                    </div>
                  )}
                  {selectedPalette && (
                    <div>
                      <div className="text-[11px] text-mutedText font-medium uppercase mb-1">Color Theme</div>
                      <div className="flex items-center gap-2"><div className="flex gap-0.5">{selectedPalette.colors.map((c, i) => <div key={i} className="w-6 h-6 rounded" style={{ backgroundColor: c }} />)}</div><span className="text-small text-text dark:text-white font-medium">{selectedPalette.name}</span></div>
                    </div>
                  )}
                  {activeChannels === 0 && contentCards.length === 0 && <p className="text-small text-mutedText italic">No content details added yet</p>}
                </div>

                {/* Tasks Summary */}
                <div className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-body font-semibold text-text dark:text-white flex items-center gap-2"><Megaphone size={16} className="text-primary" /> Outreach Tasks</h4>
                    <button onClick={() => setActivePage(2)} className="text-[11px] text-primary hover:underline">Edit</button>
                  </div>
                  {tasks.length > 0 ? (
                    <div className="space-y-1.5">
                      {tasks.slice(0, 8).map(t => (
                        <div key={t.id} className="flex items-center gap-2 py-1.5">
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${PRIORITY_STYLES[t.priority]}`}>{t.priority}</span>
                          <span className="text-small text-text dark:text-white flex-1 truncate">{t.name}</span>
                          <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${STATUS_STYLES[t.status]}`}>{t.status}</span>
                        </div>
                      ))}
                      {tasks.length > 8 && <p className="text-[11px] text-mutedText">+{tasks.length - 8} more tasks</p>}
                    </div>
                  ) : (
                    <p className="text-small text-mutedText italic">No tasks added yet</p>
                  )}
                </div>

                {/* Content Timeline Mini */}
                <div className="card">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-body font-semibold text-text dark:text-white flex items-center gap-2"><TrendingUp size={16} className="text-primary" /> Metrics</h4>
                    <button onClick={() => setActivePage(3)} className="text-[11px] text-primary hover:underline">Edit</button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="text-center p-3 bg-primary/10 rounded-control"><div className="text-h3 font-bold text-primary">{contentCards.length}</div><div className="text-[11px] text-mutedText">Posts</div></div>
                    <div className="text-center p-3 bg-success/10 rounded-control"><div className="text-h3 font-bold text-success">{tasks.filter(t => t.status === 'done').length}/{tasks.length}</div><div className="text-[11px] text-mutedText">Tasks Done</div></div>
                    <div className="text-center p-3 bg-info/10 rounded-control"><div className="text-h3 font-bold text-info">{activePlatforms}</div><div className="text-[11px] text-mutedText">Platforms</div></div>
                    <div className="text-center p-3 bg-warning/10 rounded-control"><div className="text-h3 font-bold text-warning">{activeChannels}</div><div className="text-[11px] text-mutedText">Channels</div></div>
                  </div>
                </div>
              </div>

              {/* Create Campaign CTA */}
              <div className="card text-center p-8 border-2 border-primary/20 bg-primary/5 dark:bg-primary/10">
                <h3 className="text-h3 font-bold text-text dark:text-white mb-2">Ready to launch?</h3>
                <p className="text-small text-mutedText mb-4">Review the summary above, then create your campaign to start executing.</p>
                <div className="flex items-center justify-center gap-3">
                  <button onClick={() => setActivePage(0)} className="btn-secondary">Back to Editing</button>
                  <button onClick={handleCreate} disabled={!canCreate} className="btn-primary px-8 py-3 text-body flex items-center gap-2 disabled:opacity-50">
                    <Download size={18} /> Create Campaign
                  </button>
                </div>
                {!canCreate && <p className="text-[11px] text-warning mt-2">Campaign name and start date are required</p>}
              </div>

              {/* Bottom nav */}
              <div className="flex items-center justify-between pt-6 mt-6 border-t border-border dark:border-border-dark">
                <button onClick={goPrev} className="btn-secondary flex items-center gap-2"><ChevronLeft size={16} /> Previous</button>
                <div />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* ═══ AI ASSISTANT PILL (Inline / Subtle) ═══ */}
      <button
        onClick={() => setShowAiAssistant(v => !v)}
        className="fixed bottom-8 right-8 bg-surface dark:bg-surface-dark border border-border dark:border-border-dark px-4 py-2.5 rounded-full shadow-lg flex items-center gap-2 hover:border-primary/50 transition-all z-30 group"
      >
        <div className={`w-2.5 h-2.5 rounded-full ${showAiAssistant ? 'bg-danger' : 'bg-primary'} animate-pulse`} />
        <span className="text-small font-medium text-text dark:text-white group-hover:text-primary transition-colors">
          {showAiAssistant ? 'Close Assistant' : 'AI Assistant'}
        </span>
        {!showAiAssistant && aiSuggestions.length > 0 && (
          <span className="ml-1 px-1.5 py-0.5 bg-primary/10 text-primary text-[10px] font-bold rounded-full">
            {aiSuggestions.length}
          </span>
        )}
      </button>
    </div>
  );
};

export default CampaignPlanningView;
