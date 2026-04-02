import React, { useState, useEffect } from 'react';
import DashboardView from './DashboardView';
import CampaignsView from './CampaignsView';
import CalendarView from './CalendarView';
import ContactsView from './ContactsView';
import CampaignDetail from './CampaignDetail';
import TemplatesView from './TemplatesView';
import InboxView from './InboxView';
import BoardView from './BoardView';
import RequestDetail from './RequestDetail';
import RequestFormModal from './RequestFormModal';
import OnboardingTemplates from './OnboardingTemplates';
import DeliverableFormModal from './DeliverableFormModal';
import CampaignPlanningView from './CampaignPlanningView.jsx';
import CampaignFormModal from './CampaignFormModal.jsx';
import PostFormModal from './PostFormModal.jsx';
import ContactFormModal from './ContactFormModal.jsx';
import TemplateModal from './TemplateModal.jsx';
import AssetsView from './AssetsView.jsx';
import SettingsPage from './SettingsPage.jsx';
import { useToast } from './ToastProvider.jsx';
import TopNav from './components/TopNav.jsx';
import OnboardingTour, { shouldShowTour } from './components/OnboardingTour.jsx';
import HelpView from './Views/HelpView.jsx';
import ApprovalReviewModal from './ApprovalReviewModal.jsx';
import PublicRequestView from './PublicRequestView.jsx';
import MasterTodoView from './MasterTodoView.jsx';
import { VIEWS, MODALS, DEFAULT_VIEW } from './routes.js';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';

// Gemini API Key (set in Vite env as VITE_GEMINI_API_KEY)
const GEMINI_API_KEY = import.meta.env?.VITE_GEMINI_API_KEY || '';
const API_BASE = '/api';

// Helper function to call Gemini API
async function callGemini(prompt, notify) {
  if (!GEMINI_API_KEY) {
    notify?.('AI is not configured. Set VITE_GEMINI_API_KEY to enable AI features.', { type: 'info' });
    return null;
  }
  try {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${GEMINI_API_KEY}`;
    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
    };

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    if (!response.ok) throw new Error('AI request failed');
    const data = await response.json();
    return data.candidates[0].content.parts[0].text;
  } catch (error) {
    console.error('Gemini API Error:', error);
    notify?.('Failed to generate AI content. Please try again.', { type: 'error' });
    return null;
  }
}

const AppContent = () => {
  const { toast } = useToast();
  const [currentView, setCurrentView] = useState(window.location.pathname === '/request' ? VIEWS.PUBLIC_REQUEST : DEFAULT_VIEW);
  const [activeModal, setActiveModal] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [editingCampaign, setEditingCampaign] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [editingContact, setEditingContact] = useState(null);
  const [editingDeliverable, setEditingDeliverable] = useState(null);
  const [deliverableCampaignId, setDeliverableCampaignId] = useState(null);
  const [calendarView, setCalendarView] = useState('month');
  const [showOnboarding, setShowOnboarding] = useState(() => shouldShowTour());
  const [campaigns, setCampaigns] = useState([]);
  const [posts, setPosts] = useState([]);
  const [deliverables, setDeliverables] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [requests, setRequests] = useState([]);
  const [approvalRules, setApprovalRules] = useState([]);
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [approvals, setApprovals] = useState([]);
  const [reviewingApproval, setReviewingApproval] = useState(null);

  const navigate = (view) => setCurrentView(view);
  const openModal = (modal) => setActiveModal(modal);
  const closeModal = () => setActiveModal(null);

  const createFromPlanner = async ({ campaign, plan, aiPlan }) => {
    try {
      // 1) Create the campaign
      const res = await fetch(`${API_BASE}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaign),
      });
      const created = await res.json().catch(() => null);
      if (!res.ok || !created?.campaign_id) throw new Error(created?.error || 'Failed to create campaign');

      const campaignId = created.campaign_id;

      // 2) Save plan meta (brief/colors/ai json)
      await fetch(`${API_BASE}/campaigns/${campaignId}/plan`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(plan),
      }).catch(() => { });

      // 3) Materialize deliverables/posts from AI plan
      const start = new Date(campaign.start_date);
      const deliverablesList = aiPlan?.deliverables || [];
      const suggestedPosts = aiPlan?.suggested_posts || [];

      const makeDate = (offsetDays) => {
        const d = new Date(start);
        d.setDate(d.getDate() + (Number.isFinite(offsetDays) ? offsetDays : 0));
        return d;
      };

      for (const d of deliverablesList) {
        const due = makeDate(d.due_offset_days);
        if (d.deliverable_type === 'post') {
          await fetch(`${API_BASE}/posts`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              campaign_id: campaignId,
              platform: d.platform || 'other',
              content: d.description || d.title,
              scheduled_at: due.toISOString(),
              published_at: null,
              impressions: 0,
              clicks: 0,
            }),
          }).catch(() => { });
        } else {
          await fetch(`${API_BASE}/deliverables`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              campaign_id: campaignId,
              deliverable_type: d.deliverable_type || 'other',
              stage: d.stage || null,
              platform: d.platform || null,
              title: d.title || 'Untitled deliverable',
              description: d.description || null,
              due_date: due.toISOString().slice(0, 10),
              priority: d.priority || 'medium',
              owner_role: d.owner_role || null,
              status: 'planned',
            }),
          }).catch(() => { });
        }
      }

      // suggested_posts (optional extra)
      for (const p of suggestedPosts) {
        const due = makeDate(p.due_offset_days);
        await fetch(`${API_BASE}/posts`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            campaign_id: campaignId,
            platform: p.platform || 'other',
            content: p.content || 'Suggested post',
            scheduled_at: due.toISOString(),
            published_at: null,
            impressions: 0,
            clicks: 0,
          }),
        }).catch(() => { });
      }

      await fetchData();
      navigate(VIEWS.CAMPAIGN_DETAIL);
      setSelectedCampaign(transformCampaign(created));
      toast('Campaign created from plan.', { type: 'success' });
    } catch (e) {
      toast(e.message, { type: 'error' });
    }
  };

  // Fetch data from backend
  useEffect(() => {
    fetchData();
  }, []);

  // Apply theme class to document
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [campaignsRes, postsRes, deliverablesRes, contactsRes, requestsRes, approvalRulesRes, usersRes, departmentsRes] = await Promise.all([
        fetch(`${API_BASE}/campaigns`).then((r) => {
          if (!r.ok) throw new Error(`Campaigns API error: ${r.status}`);
          return r.json();
        }).catch(err => {
          console.error('Error fetching campaigns:', err);
          return [];
        }),
        fetch(`${API_BASE}/posts`).then((r) => {
          if (!r.ok) throw new Error(`Posts API error: ${r.status}`);
          return r.json();
        }).catch(err => {
          console.error('Error fetching posts:', err);
          return [];
        }),
        fetch(`${API_BASE}/deliverables`).then((r) => {
          if (!r.ok) return [];
          return r.json();
        }).catch(err => {
          console.error('Error fetching deliverables:', err);
          return [];
        }),
        fetch(`${API_BASE}/contacts`).then((r) => {
          if (!r.ok) throw new Error(`Contacts API error: ${r.status}`);
          return r.json();
        }).catch(err => {
          console.error('Error fetching contacts:', err);
          return [];
        }),
        fetch(`${API_BASE}/requests`).then((r) => {
          if (!r.ok) return [];
          return r.json();
        }).catch(err => {
          console.error('Error fetching requests:', err);
          return [];
        }),
        fetch(`${API_BASE}/approval-rules`).then((r) => {
          if (!r.ok) return [];
          return r.json();
        }).catch(err => {
          console.error('Error fetching approval rules:', err);
          return [];
        }),
        fetch(`${API_BASE}/users`).then((r) => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_BASE}/departments`).then((r) => r.ok ? r.json() : []).catch(() => []),
      ]);

      setCampaigns(campaignsRes || []);
      setPosts(postsRes || []);
      setDeliverables(deliverablesRes || []);
      setContacts(contactsRes || []);
      setRequests(requestsRes || []);
      setApprovalRules(approvalRulesRes || []);
      setUsers(usersRes || []);
      setDepartments(departmentsRes || []);

      const approvalsData = await fetch(`${API_BASE}/approvals/pending`).then(r => r.ok ? r.json() : []).catch(() => []);
      setApprovals(approvalsData || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set empty arrays on error so app still renders
      setCampaigns([]);
      setPosts([]);
      setDeliverables([]);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  // Campaign handlers
  const handleCreateCampaign = async (campaignData) => {
    try {
      const response = await fetch(`${API_BASE}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to create campaign: ${response.status} ${response.statusText}`);
      }

      const newCampaign = await response.json();
      await fetchData();
      closeModal();
      setEditingCampaign(null);

      if (newCampaign && newCampaign.campaign_id) {
        const transformedCampaign = transformCampaign(newCampaign);
        if (transformedCampaign) {
          setSelectedCampaign(transformedCampaign);
          navigate(VIEWS.CAMPAIGN_DETAIL);
        } else {
          navigate(VIEWS.CAMPAIGNS);
        }
      } else {
        navigate(VIEWS.CAMPAIGNS);
      }

      alert('Campaign created successfully!');
    } catch (error) {
      console.error('Error creating campaign:', error);
      alert(`Failed to create campaign: ${error.message}`);
    }
  };

  const handleUpdateCampaign = async (id, campaignData) => {
    try {
      const response = await fetch(`${API_BASE}/campaigns/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      });
      if (!response.ok) throw new Error('Failed to update campaign');
      const updatedCampaign = await response.json().catch(() => null);
      await fetchData();
      closeModal();
      setEditingCampaign(null);
      if (updatedCampaign && (selectedCampaign?.campaign_id === id || selectedCampaign?.id === id)) {
        const transformed = transformCampaign(updatedCampaign);
        if (transformed) setSelectedCampaign(transformed);
      }
      alert('Campaign updated successfully!');
    } catch (error) {
      console.error('Error updating campaign:', error);
      alert('Failed to update campaign. Please try again.');
    }
  };

  const handleDeleteCampaign = async (id) => {
    try {
      const ok = window.confirm('Delete this campaign? This will also remove its posts and deliverables.');
      if (!ok) return;

      const response = await fetch(`${API_BASE}/campaigns/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete campaign');

      await fetchData();

      if (selectedCampaign?.campaign_id === id || selectedCampaign?.id === id) {
        setSelectedCampaign(null);
        navigate(VIEWS.CAMPAIGNS);
      }

      alert('Campaign deleted.');
    } catch (error) {
      console.error('Error deleting campaign:', error);
      alert('Failed to delete campaign. Please try again.');
    }
  };

  // Post handlers
  const handleCreatePost = async (postData) => {
    try {
      const response = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      if (!response.ok) throw new Error('Failed to create post');
      await fetchData();
      closeModal();
      setEditingPost(null);
      alert('Post created successfully!');
    } catch (error) {
      console.error('Error creating post:', error);
      alert('Failed to create post. Please try again.');
    }
  };

  // Deliverable handlers
  const handleCreateDeliverable = async (deliverableData) => {
    try {
      const response = await fetch(`${API_BASE}/deliverables`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(deliverableData),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Failed to create deliverable' }));
        throw new Error(err.error || 'Failed to create deliverable');
      }
      await fetchData();
      closeModal();
      setDeliverableCampaignId(null);
      setEditingDeliverable(null);
      toast('Deliverable added.', { type: 'success' });
    } catch (error) {
      console.error('Error creating deliverable:', error);
      toast(`Failed to add deliverable: ${error.message}`, { type: 'error' });
    }
  };

  const handleUpdateDeliverable = async (deliverableId, updates) => {
    try {
      const response = await fetch(`${API_BASE}/deliverables/${deliverableId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Failed to update deliverable' }));
        throw new Error(err.error || 'Failed to update deliverable');
      }
      await fetchData();
      closeModal();
      setEditingDeliverable(null);
      setDeliverableCampaignId(null);
      toast('Deliverable updated.', { type: 'success' });
    } catch (error) {
      console.error('Error updating deliverable:', error);
      toast(`Failed to update deliverable: ${error.message}`, { type: 'error' });
    }
  };

  const handleDeleteDeliverable = async (deliverableId) => {
    try {
      const ok = window.confirm('Delete this deliverable?');
      if (!ok) return;
      const response = await fetch(`${API_BASE}/deliverables/${deliverableId}`, { method: 'DELETE' });
      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: 'Failed to delete deliverable' }));
        throw new Error(err.error || 'Failed to delete deliverable');
      }
      await fetchData();
      toast('Deliverable deleted.', { type: 'success' });
    } catch (error) {
      console.error('Error deleting deliverable:', error);
      toast(`Failed to delete deliverable: ${error.message}`, { type: 'error' });
    }
  };

  const handleUpdatePost = async (id, postData) => {
    try {
      const response = await fetch(`${API_BASE}/posts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postData),
      });
      if (!response.ok) throw new Error('Failed to update post');
      await fetchData();
      closeModal();
      setEditingPost(null);
      toast('Post updated.', { type: 'success' });
    } catch (error) {
      console.error('Error updating post:', error);
      toast('Failed to update post. Please try again.', { type: 'error' });
    }
  };

  const handleDeletePost = async (id) => {
    try {
      const ok = window.confirm('Delete this post?');
      if (!ok) return;
      const response = await fetch(`${API_BASE}/posts/${id}`, { method: 'DELETE' });
      if (!response.ok) throw new Error('Failed to delete post');
      await fetchData();
      toast('Post deleted.', { type: 'success' });
    } catch (error) {
      console.error('Error deleting post:', error);
      toast('Failed to delete post. Please try again.', { type: 'error' });
    }
  };

  // Contact handlers
  const handleCreateContact = async (contactData) => {
    try {
      const response = await fetch(`${API_BASE}/contacts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });
      if (!response.ok) throw new Error('Failed to create contact');
      await fetchData();
      closeModal();
      setEditingContact(null);
      alert('Contact created successfully!');
    } catch (error) {
      console.error('Error creating contact:', error);
      alert('Failed to create contact. Please try again.');
    }
  };

  const handleUpdateContact = async (id, contactData) => {
    try {
      const response = await fetch(`${API_BASE}/contacts/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactData),
      });
      if (!response.ok) throw new Error('Failed to update contact');
      await fetchData();
      closeModal();
      setEditingContact(null);
      alert('Contact updated successfully!');
    } catch (error) {
      console.error('Error updating contact:', error);
      alert('Failed to update contact. Please try again.');
    }
  };

  // Template handler - creates campaign and suggested posts from template
  const handleSelectTemplate = async (template) => {
    try {
      // Calculate end date based on recommended duration
      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + (template.recommended_duration_weeks * 7));

      // Create campaign from template
      const campaignData = {
        title: template.name,
        objective: template.primary_goal,
        start_date: startDate.toISOString().split('T')[0],
        status: template.default_status,
      };

      const campaignResponse = await fetch(`${API_BASE}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(campaignData),
      });

      if (!campaignResponse.ok) {
        const errorData = await campaignResponse.json().catch(() => ({ error: 'Unknown error' }));
        throw new Error(errorData.error || `Failed to create campaign: ${campaignResponse.status} ${campaignResponse.statusText}`);
      }
      const newCampaign = await campaignResponse.json();

      // Create deliverables from template
      if (template.planned_deliverables && template.planned_deliverables.length > 0) {
        for (const deliverable of template.planned_deliverables) {
          // Calculate due date based on offset
          const dueDate = new Date(startDate);
          dueDate.setDate(dueDate.getDate() + (deliverable.default_due_offset_days || 0));

          // Map platform to database enum values
          const platformMap = {
            'instagram': 'instagram',
            'tiktok': 'tiktok',
            'twitter': 'twitter',
            'facebook': 'facebook',
            'linkedin': 'linkedin',
            'youtube': 'youtube',
            'email': 'email',
            'website': 'website',
            'press': 'press',
          };

          const mappedPlatform = deliverable.platform ? (platformMap[deliverable.platform.toLowerCase()] || 'other') : null;

          if (deliverable.deliverable_type === 'post') {
            // Create post in posts table
            const postData = {
              campaign_id: newCampaign.campaign_id,
              platform: mappedPlatform || 'other',
              content: deliverable.description || deliverable.title,
              scheduled_at: dueDate.toISOString(),
              due_date: dueDate.toISOString(),
              impressions: 0,
              clicks: 0,
            };

            await fetch(`${API_BASE}/posts`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(postData),
            });
          } else {
            // Create deliverable in deliverables table
            const deliverableData = {
              campaign_id: newCampaign.campaign_id,
              deliverable_type: deliverable.deliverable_type,
              stage: deliverable.stage || null,
              platform: mappedPlatform || null,
              title: deliverable.title,
              description: deliverable.description || null,
              due_date: dueDate.toISOString().slice(0, 10),
              priority: deliverable.priority || 'medium',
              owner_role: deliverable.owner_role || null,
              status: 'planned',
            };

            await fetch(`${API_BASE}/deliverables`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(deliverableData),
            });
          }
        }
      }

      // Refresh data to get all posts
      const [campaignsRes, postsRes] = await Promise.all([
        fetch(`${API_BASE}/campaigns`).then(r => r.ok ? r.json() : []).catch(() => []),
        fetch(`${API_BASE}/posts`).then(r => r.ok ? r.json() : []).catch(() => [])
      ]);

      setCampaigns(campaignsRes || []);
      setPosts(postsRes || []);
      closeModal();

      // Find the campaign from the fetched data and transform it
      const updatedCampaign = campaignsRes.find(c => c.campaign_id === newCampaign.campaign_id) || newCampaign;

      // Create a temporary transform function with the fetched posts
      const transformWithPosts = (campaign, postsArray) => {
        if (!campaign) return null;
        const campaignPosts = (postsArray || []).filter((p) => p && p.campaign_id === campaign.campaign_id);
        const completedPosts = campaignPosts.filter((p) => p && p.published_at).length;
        const plannedPosts = campaignPosts.length || 1;
        const progress = plannedPosts > 0 ? Math.round((completedPosts / plannedPosts) * 100) : 0;
        const totalImpressions = campaignPosts.reduce((sum, p) => sum + (p?.impressions || 0), 0);
        const totalClicks = campaignPosts.reduce((sum, p) => sum + (p?.clicks || 0), 0);
        const totalEngagement = totalClicks;
        const earnedMentions = campaignPosts.filter((p) => p && p.published_at && (p.impressions || 0) > 1000).length;

        return {
          id: campaign.campaign_id,
          name: campaign.title || 'Untitled Campaign',
          status: campaign.status || 'planning',
          progress: progress,
          health: progress < 50 ? 'at_risk' : 'healthy',
          startDate: campaign.start_date || '',
          endDate: campaign.end_date || '',
          goal: campaign.objective || 'No objective set',
          plannedPosts: plannedPosts,
          completedPosts: completedPosts,
          kpi_reach: totalImpressions,
          kpi_engagement: totalEngagement,
          kpi_earned_mentions: earnedMentions,
          ...campaign,
        };
      };

      const transformedNewCampaign = transformWithPosts(updatedCampaign, postsRes);
      if (transformedNewCampaign) {
        setSelectedCampaign(transformedNewCampaign);
        navigate(VIEWS.CAMPAIGN_DETAIL);
      } else {
        navigate(VIEWS.CAMPAIGNS);
      }

      const deliverableCount = template.planned_deliverables?.length || 0;
      alert(`Campaign "${template.name}" created successfully with ${deliverableCount} planned deliverables!`);
    } catch (error) {
      console.error('Error creating campaign from template:', error);
      alert('Failed to create campaign from template. Please try again.');
    }
  };

  const handleSubmitForApproval = async (postId) => {
    try {
      const res = await fetch(`${API_BASE}/approvals/${postId}/request`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to submit for approval');
      await fetchData();
      toast('Post submitted for approval.', { type: 'success' });
    } catch (err) {
      console.error(err);
      toast('Failed to submit for approval.', { type: 'error' });
    }
  };

  const handleApprove = async (postId) => {
    try {
      const res = await fetch(`${API_BASE}/approvals/${postId}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to approve post');
      await fetchData();
      toast('Post approved.', { type: 'success' });
    } catch (err) {
      console.error(err);
      toast('Failed to approve post.', { type: 'error' });
    }
  };

  const handleReject = async (postId, feedback) => {
    try {
      const res = await fetch(`${API_BASE}/approvals/${postId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
      if (!res.ok) throw new Error('Failed to request changes');
      await fetchData();
      toast('Feedback sent.', { type: 'info' });
    } catch (err) {
      console.error(err);
      toast('Failed to send feedback.', { type: 'error' });
    }
  };

  const handleApproveRequest = async (requestId) => {
    try {
      const res = await fetch(`${API_BASE}/requests/${requestId}/approve`, { method: 'POST' });
      if (!res.ok) throw new Error('Failed to approve request');
      const updated = await res.json().catch(() => null);
      await fetchData();
      if (selectedRequest?.request_id === requestId) {
        setSelectedRequest((prev) => ({ ...prev, ...(updated || {}), status: 'approved' }));
      }
      toast('Request approved.', { type: 'success' });
    } catch (err) {
      console.error(err);
      toast('Failed to approve request.', { type: 'error' });
    }
  };

  const handleRejectRequest = async (requestId, feedback) => {
    try {
      const res = await fetch(`${API_BASE}/requests/${requestId}/reject`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feedback }),
      });
      if (!res.ok) throw new Error('Failed to reject request');
      await fetchData();
      if (selectedRequest?.request_id === requestId) {
        setSelectedRequest((prev) => ({ ...prev, status: 'changes_requested' }));
      }
      toast('Request sent back for changes.', { type: 'info' });
    } catch (err) {
      console.error(err);
      toast('Failed to reject request.', { type: 'error' });
    }
  };

  const formatShortDate = (value) => {
    if (!value) return '';
    const d = value instanceof Date ? value : new Date(value);
    if (Number.isNaN(d.getTime())) return '';
    return d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const transformCampaign = (campaign) => {
    if (!campaign) return null;

    const campaignPosts = (posts || []).filter((p) => p && p.campaign_id === campaign.campaign_id);
    const completedPosts = campaignPosts.filter((p) => p && p.published_at).length;
    const plannedPosts = campaignPosts.length || 1;
    const progress = plannedPosts > 0 ? Math.round((completedPosts / plannedPosts) * 100) : 0;

    // Calculate KPIs from posts
    const totalImpressions = campaignPosts.reduce((sum, p) => sum + (p?.impressions || 0), 0);
    const totalClicks = campaignPosts.reduce((sum, p) => sum + (p?.clicks || 0), 0);
    const totalEngagement = totalClicks; // Using clicks as engagement metric
    const earnedMentions = campaignPosts.filter((p) => p && p.published_at && (p.impressions || 0) > 1000).length;

    return {
      id: campaign.campaign_id,
      name: campaign.title || 'Untitled Campaign',
      status: campaign.status || 'planning',
      progress: progress,
      health: progress < 50 ? 'at_risk' : 'healthy',
      startDate: formatShortDate(campaign.start_date),
      endDate: campaign.end_date ? formatShortDate(campaign.end_date) : '',
      goal: campaign.objective || 'No objective set',
      plannedPosts: plannedPosts,
      completedPosts: completedPosts,
      kpi_reach: totalImpressions,
      kpi_engagement: totalEngagement,
      kpi_earned_mentions: earnedMentions,
      ...campaign,
    };
  };

  const transformedCampaigns = (campaigns || []).map(transformCampaign).filter(c => c !== null);

  const handleCloseCampaignForm = () => {
    closeModal();
    setEditingCampaign(null);
  };
  const handleClosePostForm = () => {
    closeModal();
    setEditingPost(null);
  };
  const handleCloseContactForm = () => {
    closeModal();
    setEditingContact(null);
  };

  if (currentView === VIEWS.PUBLIC_REQUEST) {
    return <PublicRequestView />;
  }

  return (
    <div className={`min-h-screen bg-background dark:bg-background-dark`}>
      <TopNav
        currentView={currentView}
        onNavigate={navigate}
        isDarkMode={isDarkMode}
        onToggleTheme={() => setIsDarkMode(!isDarkMode)}
        onShowSettings={() => navigate(VIEWS.SETTINGS)}
      />

      {/* Main Content */}
      <div className="pt-20 px-6 pb-8 max-w-[1400px] mx-auto">
        {currentView === VIEWS.DASHBOARD && (
          <DashboardView
            transformedCampaigns={transformedCampaigns}
            posts={posts}
            requests={requests}
            loading={loading}
            approvals={approvals}
            onNewCampaign={() => navigate(VIEWS.CAMPAIGN_PLANNING)}
            onViewCampaigns={() => navigate(VIEWS.CAMPAIGNS)}
            onViewCalendar={() => navigate(VIEWS.CALENDAR)}
            onViewInsights={() => navigate(VIEWS.CAMPAIGNS)}
            onCampaignClick={(campaign) => {
              setSelectedCampaign(campaign);
              navigate(VIEWS.CAMPAIGN_DETAIL);
            }}
            onViewInbox={() => navigate(VIEWS.INBOX)}
            onViewBoard={() => navigate(VIEWS.BOARD)}
            onReviewApproval={(a) => { setReviewingApproval(a); openModal(MODALS.APPROVAL_REVIEW); }}
          />
        )}
        {currentView === VIEWS.CAMPAIGNS && (
          <CampaignsView
            transformedCampaigns={transformedCampaigns}
            loading={loading}
            isDarkMode={isDarkMode}
            onNewCampaign={() => navigate(VIEWS.CAMPAIGN_PLANNING)}
            onCampaignClick={(campaign) => {
              setSelectedCampaign(campaign);
              navigate(VIEWS.CAMPAIGN_DETAIL);
            }}
            onEditCampaign={(campaign) => {
              setEditingCampaign(campaign);
              openModal(MODALS.CAMPAIGN_FORM);
            }}
            onDeleteCampaign={(id) => handleDeleteCampaign(id)}
          />
        )}
        {currentView === VIEWS.CALENDAR && (
          <CalendarView
            posts={posts}
            calendarView={calendarView}
            isDarkMode={isDarkMode}
            onAddPost={() => {
              setEditingPost(null);
              openModal(MODALS.POST_FORM);
            }}
            onViewChange={(view) => setCalendarView(view)}
          />
        )}
        {currentView === VIEWS.INBOX && (
          <InboxView
            requests={requests}
            users={users}
            onSelectRequest={(request) => {
              setSelectedRequest(request);
              navigate(VIEWS.REQUEST_DETAIL);
            }}
            onCreateRequest={() => {
              setSelectedRequest(null);
              openModal(MODALS.REQUEST_FORM);
            }}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
          />
        )}
        {currentView === VIEWS.BOARD && (
          <BoardView
            requests={requests}
            onSelectRequest={(request) => {
              setSelectedRequest(request);
              navigate(VIEWS.REQUEST_DETAIL);
            }}
            onCreateRequest={() => {
              setSelectedRequest(null);
              openModal(MODALS.REQUEST_FORM);
            }}
          />
        )}
        {currentView === VIEWS.CONTACTS && (
          <ContactsView
            contacts={contacts}
            campaigns={campaigns}
            posts={posts}
            loading={loading}
            isDarkMode={isDarkMode}
            onAddContact={() => {
              setEditingContact(null);
              openModal(MODALS.CONTACT_FORM);
            }}
          />
        )}
        {currentView === VIEWS.CAMPAIGN_DETAIL && (
          <CampaignDetail
            campaign={selectedCampaign}
            posts={posts}
            deliverables={deliverables}
            approvals={approvals}
            onBack={() => navigate(VIEWS.CAMPAIGNS)}
            onEdit={(campaign) => {
              setEditingCampaign(campaign);
              openModal(MODALS.CAMPAIGN_FORM);
            }}
            onDelete={(id) => handleDeleteCampaign(id)}
            onAddPost={(campaignId) => {
              setEditingPost({
                campaign_id: campaignId,
                platform: 'twitter',
                content: '',
                scheduled_at: '',
                published_at: '',
                impressions: 0,
                clicks: 0,
              });
              openModal(MODALS.POST_FORM);
            }}
            onEditPost={(post) => {
              setEditingPost(post);
              openModal(MODALS.POST_FORM);
            }}
            onDeletePost={(postId) => handleDeletePost(postId)}
            onAddDeliverable={(campaignId) => {
              setDeliverableCampaignId(campaignId);
              setEditingDeliverable(null);
              openModal(MODALS.DELIVERABLE_FORM);
            }}
            onEditDeliverable={(deliverable) => {
              setDeliverableCampaignId(deliverable.campaign_id);
              setEditingDeliverable(deliverable);
              openModal(MODALS.DELIVERABLE_FORM);
            }}
            onDeleteDeliverable={(deliverableId) => handleDeleteDeliverable(deliverableId)}
            onSubmitForApproval={handleSubmitForApproval}
          />
        )}
        {currentView === VIEWS.CAMPAIGN_PLANNING && (
          <CampaignPlanningView
            onBack={() => navigate(VIEWS.CAMPAIGNS)}
            onUseTemplates={() => openModal(MODALS.TEMPLATE)}
            onCreateFromPlan={createFromPlanner}
            toast={toast}
          />
        )}
        {currentView === VIEWS.TEMPLATES && (
          <TemplatesView
            onSelectTemplate={handleSelectTemplate}
            onStartFromScratch={() => {
              setEditingCampaign(null);
              openModal(MODALS.CAMPAIGN_FORM);
            }}
          />
        )}
        {currentView === VIEWS.ASSETS && <AssetsView />}
        {currentView === VIEWS.HELP && (
          <HelpView
            onNavigate={navigate}
            onReplayTour={() => setShowOnboarding(true)}
          />
        )}
        {currentView === VIEWS.SETTINGS && (
          <SettingsPage
            isDarkMode={isDarkMode}
            onToggleTheme={() => setIsDarkMode(!isDarkMode)}
            geminiConfigured={Boolean(GEMINI_API_KEY)}
            approvalRules={approvalRules}
            onSaveApprovalRule={async (ruleData) => {
              try {
                const url = ruleData.rule_id
                  ? `${API_BASE}/approval-rules/${ruleData.rule_id}`
                  : `${API_BASE}/approval-rules`;
                const method = ruleData.rule_id ? 'PATCH' : 'POST';
                const response = await fetch(url, {
                  method,
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(ruleData),
                });
                if (!response.ok) throw new Error('Failed to save rule');
                await fetchData();
                alert('Approval rule saved successfully!');
              } catch (error) {
                console.error('Error saving rule:', error);
                alert('Failed to save approval rule. Please try again.');
              }
            }}
            onDeleteApprovalRule={async (ruleId) => {
              try {
                const response = await fetch(`${API_BASE}/approval-rules/${ruleId}`, {
                  method: 'DELETE',
                });
                if (!response.ok) throw new Error('Failed to delete rule');
                await fetchData();
                alert('Approval rule deleted successfully!');
              } catch (error) {
                console.error('Error deleting rule:', error);
                alert('Failed to delete approval rule. Please try again.');
              }
            }}
            onRefreshData={fetchData}
            loading={loading}
            apiBase={API_BASE}
            onNavigateHelp={() => navigate(VIEWS.HELP)}
          />
        )}
        {currentView === VIEWS.REQUEST_DETAIL && selectedRequest && (
          <RequestDetail
            request={selectedRequest}
            users={users}
            onBack={() => {
              setSelectedRequest(null);
              navigate(VIEWS.INBOX);
            }}
            onApproveRequest={handleApproveRequest}
            onRejectRequest={handleRejectRequest}
            onUpdate={async (requestId, updates) => {
              await fetchData();
              // Refresh selectedRequest from re-fetched data
              const refreshed = requests.find(r => r.request_id === requestId);
              if (refreshed) setSelectedRequest({ ...refreshed, ...updates });
              toast('Request updated.', { type: 'success' });
            }}
          />
        )}
        {currentView === VIEWS.TODO && (
          <MasterTodoView />
        )}
      </div>

      {activeModal === MODALS.TEMPLATE && (
        <TemplateModal
          onClose={closeModal}
          onSelectTemplate={handleSelectTemplate}
          onViewAllTemplates={() => {
            closeModal();
            navigate(VIEWS.TEMPLATES);
          }}
          onStartFromScratch={() => {
            closeModal();
            setEditingCampaign(null);
            openModal(MODALS.CAMPAIGN_FORM);
          }}
        />
      )}
      {activeModal === MODALS.CAMPAIGN_FORM && (
        <CampaignFormModal
          campaign={editingCampaign}
          onClose={handleCloseCampaignForm}
          onCreate={handleCreateCampaign}
          onUpdate={handleUpdateCampaign}
        />
      )}
      {activeModal === MODALS.POST_FORM && (
        <PostFormModal
          post={editingPost}
          campaigns={campaigns}
          onClose={handleClosePostForm}
          onCreate={handleCreatePost}
          onUpdate={handleUpdatePost}
        />
      )}
      {activeModal === MODALS.CONTACT_FORM && (
        <ContactFormModal
          contact={editingContact}
          onClose={handleCloseContactForm}
          onCreate={handleCreateContact}
          onUpdate={handleUpdateContact}
        />
      )}
      {activeModal === MODALS.REQUEST_FORM && (
        <RequestFormModal
          request={selectedRequest}
          campaigns={campaigns}
          users={users}
          departments={departments}
          onClose={() => {
            closeModal();
            setSelectedRequest(null);
          }}
          onSubmit={async (formData) => {
            try {
              const url = selectedRequest
                ? `${API_BASE}/requests/${selectedRequest.request_id}`
                : `${API_BASE}/requests`;
              const method = selectedRequest ? 'PATCH' : 'POST';
              const response = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
              });
              if (!response.ok) throw new Error('Failed to save request');
              await fetchData();
              closeModal();
              setSelectedRequest(null);
              toast(selectedRequest ? 'Request updated.' : 'Request created.', { type: 'success' });
            } catch (error) {
              console.error('Error saving request:', error);
              toast('Failed to save request. Please try again.', { type: 'error' });
            }
          }}
        />
      )}
      {activeModal === MODALS.DELIVERABLE_FORM && (
        <DeliverableFormModal
          campaignId={deliverableCampaignId}
          deliverable={editingDeliverable}
          onClose={() => {
            closeModal();
            setDeliverableCampaignId(null);
            setEditingDeliverable(null);
          }}
          onSubmit={(payload) => {
            if (editingDeliverable?.deliverable_id) {
              return handleUpdateDeliverable(editingDeliverable.deliverable_id, payload);
            }
            return handleCreateDeliverable(payload);
          }}
        />
      )}
      {activeModal === MODALS.APPROVAL_REVIEW && reviewingApproval && (
        <ApprovalReviewModal
          approval={reviewingApproval}
          onClose={() => { closeModal(); setReviewingApproval(null); }}
          onApprove={() => handleApprove(reviewingApproval.post_id)}
          onReject={(fb) => handleReject(reviewingApproval.post_id, fb)}
        />
      )}

      {/* First-login onboarding tour */}
      {showOnboarding && (
        <OnboardingTour
          onComplete={() => setShowOnboarding(false)}
          onViewHelp={() => { setShowOnboarding(false); navigate(VIEWS.HELP); }}
        />
      )}
    </div>
  );
};

const App = () => {
  const { user, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-gray-950" />;
  if (!user) return <Login />;
  return <AppContent />;
};

export default App;

