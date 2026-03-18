import React, { useState } from 'react';
import { Target, Sparkles, Calendar, TrendingUp, AlertCircle, Users } from 'lucide-react';

const TEMPLATES = [
  {
    template_key: "product_launch",
    name: "Product Launch Campaign",
    description: "A structured campaign to introduce a new product, feature, or service to a target audience.",
    recommended_duration_weeks: 4,
    default_status: "planning",
    primary_goal: "Generate awareness and initial engagement around a new launch",
    stages: [
      "Pre-Launch Preparation",
      "Launch Moment",
      "Post-Launch Amplification"
    ],
    planned_deliverables: [
      {
        deliverable_type: "post",
        stage: "Pre-Launch Preparation",
        platform: "instagram",
        title: "Product Teaser Post",
        description: "Create anticipation with a teaser post highlighting key features without revealing everything",
        default_due_offset_days: -7,
        priority: "high",
        owner_role: "Content Creator"
      },
      {
        deliverable_type: "email",
        stage: "Pre-Launch Preparation",
        platform: "email",
        title: "Launch Announcement Email",
        description: "Email to existing customers announcing the upcoming launch",
        default_due_offset_days: -3,
        priority: "high",
        owner_role: "Writer"
      },
      {
        deliverable_type: "post",
        stage: "Launch Moment",
        platform: "linkedin",
        title: "Official Launch Announcement",
        description: "Official announcement post with full product details and launch information",
        default_due_offset_days: 0,
        priority: "high",
        owner_role: "Lead"
      },
      {
        deliverable_type: "press_note",
        stage: "Launch Moment",
        platform: "press",
        title: "Product Launch Press Release",
        description: "Press release for media distribution",
        default_due_offset_days: 0,
        priority: "high",
        owner_role: "Writer"
      },
      {
        deliverable_type: "post",
        stage: "Post-Launch Amplification",
        platform: "instagram",
        title: "Feature Highlights Post",
        description: "Post showcasing key features and benefits",
        default_due_offset_days: 3,
        priority: "medium",
        owner_role: "Content Creator"
      }
    ],
    suggested_metrics: ["reach", "engagement", "clicks"],
    audience_personas: ["Early adopters", "Existing customers", "Media/press", "Industry influencers"],
    messaging_pillars: ["Innovation", "Value proposition", "User benefits"],
    cta_library: ["Learn more", "Try now", "Get started", "Sign up", "Share"],
    asset_checklist: ["1 hero graphic", "3 product photos", "1 demo video", "Link-in-bio URL", "Press release"],
    channel_mix: {
      primary: "Instagram",
      secondary: "LinkedIn",
      support: ["Email", "Website", "Press"]
    },
    risk_flags: ["Avoid overpromising features", "Ensure product is ready before launch", "Have support team ready for inquiries"],
    deliverable_sets: [
      {
        name: "Launch Pack",
        items: ["Announcement post", "FAQ document", "Media note", "Press release"]
      }
    ]
  },
  {
    template_key: "awareness_campaign",
    name: "Brand or Awareness Campaign",
    description: "A campaign focused on increasing visibility, recognition, or understanding of a brand, cause, or initiative.",
    recommended_duration_weeks: 6,
    default_status: "planning",
    primary_goal: "Increase awareness and familiarity among a defined audience",
    stages: [
      "Audience Research",
      "Message Development",
      "Distribution",
      "Reinforcement"
    ],
    planned_deliverables: [
      {
        deliverable_type: "post",
        stage: "Distribution",
        platform: "instagram",
        title: "Educational Explainer Post",
        description: "Educational content explaining brand values and mission",
        default_due_offset_days: 0,
        priority: "high",
        owner_role: "Content Creator"
      },
      {
        deliverable_type: "post",
        stage: "Distribution",
        platform: "tiktok",
        title: "Story-Driven Reel",
        description: "Story-driven content showcasing brand values and impact",
        default_due_offset_days: 7,
        priority: "medium",
        owner_role: "Content Creator"
      },
      {
        deliverable_type: "post",
        stage: "Reinforcement",
        platform: "linkedin",
        title: "Recap and Reminder Post",
        description: "Post reinforcing key messages and reminding audience of brand mission",
        default_due_offset_days: 28,
        priority: "low",
        owner_role: "Content Creator"
      }
    ],
    suggested_metrics: ["reach", "engagement", "earned_mentions"],
    audience_personas: ["General public", "Local community", "Media/press", "Stakeholders"],
    messaging_pillars: ["Values", "Mission", "Impact"],
    cta_library: ["Learn more", "Follow us", "Share", "Get involved", "Spread the word"],
    asset_checklist: ["2 brand graphics", "3 photos", "1 video story", "Link-in-bio URL"],
    channel_mix: {
      primary: "Instagram",
      secondary: "TikTok",
      support: ["LinkedIn", "Facebook"]
    },
    risk_flags: ["Maintain consistent brand voice", "Avoid messaging fatigue", "Monitor sentiment"],
    deliverable_sets: [
      {
        name: "Awareness Pack",
        items: ["Brand story post", "Values explainer", "Impact highlights"]
      }
    ]
  },
  {
    template_key: "event_promotion",
    name: "Event Promotion Campaign",
    description: "A campaign designed to promote attendance and engagement for an upcoming event.",
    recommended_duration_weeks: 3,
    default_status: "planning",
    primary_goal: "Drive awareness and attendance for an event",
    stages: [
      "Event Announcement",
      "Build Momentum",
      "Final Push",
      "Post-Event Follow-Up"
    ],
    planned_deliverables: [
      {
        deliverable_type: "post",
        stage: "Event Announcement",
        platform: "instagram",
        title: "Save-the-Date Announcement",
        description: "Initial event announcement with key details and save-the-date information",
        default_due_offset_days: -21,
        priority: "high",
        owner_role: "Content Creator"
      },
      {
        deliverable_type: "email",
        stage: "Event Announcement",
        platform: "email",
        title: "Event Invitation Email",
        description: "Email invitation to key stakeholders and attendees",
        default_due_offset_days: -14,
        priority: "high",
        owner_role: "Writer"
      },
      {
        deliverable_type: "post",
        stage: "Build Momentum",
        platform: "linkedin",
        title: "Speaker Highlights Post",
        description: "Post featuring key speakers and agenda preview to build excitement",
        default_due_offset_days: -7,
        priority: "medium",
        owner_role: "Content Creator"
      },
      {
        deliverable_type: "post",
        stage: "Post-Event Follow-Up",
        platform: "instagram",
        title: "Event Recap Post",
        description: "Thank-you post with event highlights and key takeaways",
        default_due_offset_days: 2,
        priority: "medium",
        owner_role: "Content Creator"
      }
    ],
    suggested_metrics: ["reach", "engagement", "attendance"],
    audience_personas: ["Students", "Local community", "Media/press", "Donors", "Attendees"],
    messaging_pillars: ["Access", "Belonging", "Convenience"],
    cta_library: ["Register", "RSVP", "Learn more", "Share", "Get tickets"],
    asset_checklist: ["1 hero graphic", "2 event photos", "1 short video", "Link-in-bio URL", "Event details page"],
    channel_mix: {
      primary: "Instagram",
      secondary: "Email",
      support: ["TikTok", "LinkedIn"]
    },
    risk_flags: ["Confirm event logistics before posting", "Have backup plan for cancellations", "Avoid overpromising attendance"],
    deliverable_sets: [
      {
        name: "Event Pack",
        items: ["Announcement post", "FAQ document", "Media note", "Registration link"]
      }
    ]
  },
  {
    template_key: "crisis_response",
    name: "Crisis or Issue Response Campaign",
    description: "A controlled communications campaign designed to respond to a crisis, issue, or sensitive situation.",
    recommended_duration_weeks: 2,
    default_status: "active",
    primary_goal: "Provide clarity, maintain trust, and control the narrative",
    stages: [
      "Situation Assessment",
      "Official Response",
      "Ongoing Updates",
      "Resolution"
    ],
    planned_deliverables: [
      {
        deliverable_type: "press_note",
        stage: "Official Response",
        platform: "press",
        title: "Initial Crisis Statement",
        description: "Official statement addressing the crisis situation",
        default_due_offset_days: 0,
        priority: "high",
        owner_role: "Lead"
      },
      {
        deliverable_type: "web_update",
        stage: "Official Response",
        platform: "website",
        title: "Crisis Response Web Page",
        description: "Dedicated page on website with full statement and FAQ",
        default_due_offset_days: 0,
        priority: "high",
        owner_role: "Writer"
      },
      {
        deliverable_type: "post",
        stage: "Official Response",
        platform: "linkedin",
        title: "Public Statement Post",
        description: "Social media post with key points from official statement",
        default_due_offset_days: 1,
        priority: "high",
        owner_role: "Content Creator"
      },
      {
        deliverable_type: "post",
        stage: "Ongoing Updates",
        platform: "twitter",
        title: "Progress Update Post",
        description: "Regular update on progress and resolution steps",
        default_due_offset_days: 3,
        priority: "medium",
        owner_role: "Content Creator"
      }
    ],
    suggested_metrics: ["sentiment", "engagement", "media_mentions"],
    audience_personas: ["Media/press", "Stakeholders", "General public", "Affected parties"],
    messaging_pillars: ["Transparency", "Accountability", "Resolution"],
    cta_library: ["Learn more", "Contact us", "Read statement", "Stay updated"],
    asset_checklist: ["1 official statement", "FAQ document", "Contact information", "Update timeline"],
    channel_mix: {
      primary: "Website",
      secondary: "Press",
      support: ["Social Media", "Email"]
    },
    risk_flags: ["Avoid overpromising", "Ensure legal review of statements", "Coordinate all channels", "Monitor sentiment closely"],
    deliverable_sets: [
      {
        name: "Response Pack",
        items: ["Official statement", "FAQ document", "Media note", "Internal communication"]
      }
    ]
  },
  {
    template_key: "partnership_collaboration",
    name: "Partnership or Collaboration Campaign",
    description: "A campaign highlighting collaboration between two or more organizations or stakeholders.",
    recommended_duration_weeks: 4,
    default_status: "planning",
    primary_goal: "Highlight shared value and expand reach through collaboration",
    stages: [
      "Alignment",
      "Joint Announcement",
      "Co-Created Content",
      "Wrap-Up"
    ],
    planned_deliverables: [
      {
        deliverable_type: "press_note",
        stage: "Joint Announcement",
        platform: "press",
        title: "Partnership Press Release",
        description: "Joint press release announcing the partnership",
        default_due_offset_days: 0,
        priority: "high",
        owner_role: "Writer"
      },
      {
        deliverable_type: "post",
        stage: "Joint Announcement",
        platform: "linkedin",
        title: "Partnership Announcement Post",
        description: "LinkedIn post announcing the partnership with key details",
        default_due_offset_days: 0,
        priority: "high",
        owner_role: "Content Creator"
      },
      {
        deliverable_type: "partnership_outreach",
        stage: "Alignment",
        platform: null,
        title: "Partner Coordination Email",
        description: "Email to partner coordinating messaging and timeline",
        default_due_offset_days: -7,
        priority: "high",
        owner_role: "Lead"
      },
      {
        deliverable_type: "post",
        stage: "Co-Created Content",
        platform: "instagram",
        title: "Collaborative Spotlight Post",
        description: "Co-created content highlighting the partnership story",
        default_due_offset_days: 7,
        priority: "medium",
        owner_role: "Content Creator"
      }
    ],
    suggested_metrics: ["reach", "engagement", "earned_mentions"],
    audience_personas: ["Partners", "Stakeholders", "Media/press", "Both organizations' audiences"],
    messaging_pillars: ["Collaboration", "Shared values", "Mutual benefit"],
    cta_library: ["Learn more", "Read announcement", "Follow partner", "Share", "Explore partnership"],
    asset_checklist: ["1 partnership graphic", "2 collaborative photos", "1 joint video", "Link-in-bio URL", "Press release"],
    channel_mix: {
      primary: "LinkedIn",
      secondary: "Press",
      support: ["Instagram", "Email"]
    },
    risk_flags: ["Coordinate messaging with partner", "Ensure brand alignment", "Avoid conflicting messages", "Get partner approval before posting"],
    deliverable_sets: [
      {
        name: "Partnership Pack",
        items: ["Joint announcement", "Partnership FAQ", "Media note", "Co-branded assets"]
      }
    ]
  }
];

const getTemplateIcon = (templateKey) => {
  switch (templateKey) {
    case 'product_launch':
      return Target;
    case 'awareness_campaign':
      return TrendingUp;
    case 'event_promotion':
      return Calendar;
    case 'crisis_response':
      return AlertCircle;
    case 'partnership_collaboration':
      return Users;
    default:
      return Sparkles;
  }
};

const TemplatesView = ({ onSelectTemplate, onStartFromScratch }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);

  return (
    <div className="space-y-6 animate-fadeIn">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Campaign Templates</h1>
        <p className="text-gray-600 mt-1">Choose a template to quickly structure your PR campaign</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {TEMPLATES.map((template) => {
          const Icon = getTemplateIcon(template.template_key);
          return (
            <div
              key={template.template_key}
              className="card hover-lift group border-2 border-transparent hover:border-blue-500 transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-100 rounded-xl group-hover:bg-blue-200 transition-colors">
                  <Icon className="text-blue-600" size={24} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                    {template.recommended_duration_weeks} weeks
                  </span>
                  <Sparkles className="text-blue-400" size={20} />
                </div>
              </div>
              
              <div 
                onClick={() => setSelectedTemplate(selectedTemplate === template.template_key ? null : template.template_key)}
                className="cursor-pointer"
              >
                <h3 className="text-xl font-bold text-gray-900 mb-2">{template.name}</h3>
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                
                <div className="mb-4">
                  <div className="text-xs font-semibold text-gray-700 mb-2">Primary Goal:</div>
                  <p className="text-sm text-gray-600">{template.primary_goal}</p>
                </div>
              </div>

              {selectedTemplate === template.template_key && (
                <div className="mt-4 pt-4 border-t border-gray-200 space-y-4">
                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-2">Stages ({template.stages.length}):</div>
                    <div className="flex flex-wrap gap-2">
                      {template.stages.map((stage, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium"
                        >
                          {stage}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-2">Audience Personas:</div>
                    <div className="flex flex-wrap gap-2">
                      {template.audience_personas?.map((persona, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                        >
                          {persona}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-2">Messaging Pillars:</div>
                    <div className="flex flex-wrap gap-2">
                      {template.messaging_pillars?.map((pillar, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium"
                        >
                          {pillar}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-2">CTA Library:</div>
                    <div className="flex flex-wrap gap-2">
                      {template.cta_library?.map((cta, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-amber-50 text-amber-700 rounded text-xs font-medium"
                        >
                          {cta}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-2">Asset Checklist:</div>
                    <div className="p-2 bg-gray-50 rounded text-xs text-gray-700">
                      {template.asset_checklist?.join(', ')}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-2">Channel Mix:</div>
                    <div className="p-2 bg-gray-50 rounded text-xs">
                      <div className="text-gray-900 font-medium">Primary: {template.channel_mix?.primary}</div>
                      <div className="text-gray-700 mt-1">Secondary: {template.channel_mix?.secondary}</div>
                      {template.channel_mix?.support && (
                        <div className="text-gray-600 mt-1">
                          Support: {Array.isArray(template.channel_mix.support) ? template.channel_mix.support.join(', ') : template.channel_mix.support}
                        </div>
                      )}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-2">Risk Flags / Watch-outs:</div>
                    <div className="space-y-1">
                      {template.risk_flags?.map((risk, idx) => (
                        <div key={idx} className="p-2 bg-red-50 border border-red-100 rounded text-xs text-red-800">
                          ⚠ {risk}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-2">Deliverable Sets:</div>
                    <div className="space-y-2">
                      {template.deliverable_sets?.map((set, idx) => (
                        <div key={idx} className="p-2 bg-green-50 border border-green-100 rounded text-xs">
                          <div className="font-medium text-green-900 mb-1">{set.name}:</div>
                          <div className="text-green-700">{set.items.join(', ')}</div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-2">Planned Deliverables ({template.planned_deliverables?.length || 0}):</div>
                    <div className="space-y-2">
                      {template.planned_deliverables?.map((deliverable, idx) => (
                        <div key={idx} className="p-2 bg-gray-50 rounded text-xs">
                          <div className="flex items-start justify-between mb-1">
                            <div className="font-medium text-gray-900">{deliverable.title}</div>
                            <span className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                              deliverable.priority === 'high' ? 'bg-red-100 text-red-700' :
                              deliverable.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                              'bg-gray-100 text-gray-700'
                            }`}>
                              {deliverable.priority}
                            </span>
                          </div>
                          <div className="text-gray-600 mt-1 space-y-0.5">
                            <div>
                              <span className="font-medium">{deliverable.deliverable_type}</span>
                              {deliverable.platform && <span> • {deliverable.platform}</span>}
                              {deliverable.stage && <span> • {deliverable.stage}</span>}
                            </div>
                            <div className="text-gray-500">{deliverable.description}</div>
                            {deliverable.owner_role && (
                              <div className="text-gray-500">Owner: {deliverable.owner_role}</div>
                            )}
                            {deliverable.default_due_offset_days !== undefined && (
                              <div className="text-gray-500">
                                Due: {deliverable.default_due_offset_days < 0 ? `${Math.abs(deliverable.default_due_offset_days)} days before` : `${deliverable.default_due_offset_days} days after`} campaign start
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-gray-700 mb-2">Suggested Metrics:</div>
                    <div className="flex flex-wrap gap-2">
                      {template.suggested_metrics.map((metric, idx) => (
                        <span
                          key={idx}
                          className="px-2 py-1 bg-emerald-50 text-emerald-700 rounded text-xs font-medium"
                        >
                          {metric}
                        </span>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTemplate(template);
                    }}
                    className="w-full btn-primary mt-4"
                  >
                    Use This Template
                  </button>
                </div>
              )}

              {selectedTemplate !== template.template_key && (
                <>
                  <div className="flex items-center gap-4 text-sm text-gray-600 mb-4">
                    <span>{template.stages.length} stages</span>
                    <span>•</span>
                    <span>{template.planned_deliverables?.length || 0} deliverables</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTemplate(template);
                    }}
                    className="w-full btn-primary"
                  >
                    Use This Template
                  </button>
                </>
              )}
            </div>
          );
        })}
      </div>

      <div className="card">
        <div className="text-center py-6">
          <p className="text-gray-600 mb-4">Want to start from scratch instead?</p>
          <button 
            onClick={onStartFromScratch}
            className="btn-secondary"
          >
            Start from Scratch
          </button>
        </div>
      </div>
    </div>
  );
};

export default TemplatesView;

