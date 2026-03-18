import React, { useState } from 'react';
import { Users, GraduationCap, Heart, CheckCircle, ArrowRight } from 'lucide-react';

const OnboardingTemplates = ({ onSelectTemplate }) => {
  const templates = [
    {
      template_key: 'student_gov',
      name: 'Student Government Comms',
      description: 'Perfect for student government teams managing campus-wide communications',
      icon: GraduationCap,
      color: 'primary',
      defaults: {
        platforms: ['instagram', 'tiktok', 'email', 'website'],
        approval_mode: 'multi_stage',
        roles: ['Requester', 'Creator', 'Editor', 'Director', 'Admin'],
        example_requests: [
          { title: 'Election Announcement', platform: 'instagram', content_type: 'feed_post' },
          { title: 'Event RSVP Email', platform: 'email', content_type: 'email_blast' },
          { title: 'Meeting Recap Reel', platform: 'tiktok', content_type: 'reel' },
        ],
      },
    },
    {
      template_key: 'university_department',
      name: 'University Department',
      description: 'Ideal for academic departments managing program announcements and updates',
      icon: Users,
      color: 'info',
      defaults: {
        platforms: ['instagram', 'email', 'website', 'flyer'],
        approval_mode: 'single_approver',
        roles: ['Requester', 'Creator', 'Approver', 'Admin'],
        example_requests: [
          { title: 'Course Registration Open', platform: 'email', content_type: 'email_blast' },
          { title: 'Department Newsletter', platform: 'website', content_type: 'web_update' },
          { title: 'Event Flyer', platform: 'flyer', content_type: 'print' },
        ],
      },
    },
    {
      template_key: 'nonprofit',
      name: 'Nonprofit / Community Org',
      description: 'Designed for nonprofits and community organizations',
      icon: Heart,
      color: 'success',
      defaults: {
        platforms: ['instagram', 'facebook', 'email', 'print'],
        approval_mode: 'single_approver',
        roles: ['Requester', 'Creator', 'Approver', 'Admin'],
        example_requests: [
          { title: 'Fundraiser Announcement', platform: 'instagram', content_type: 'feed_post' },
          { title: 'Volunteer Call', platform: 'email', content_type: 'email_blast' },
          { title: 'Event Poster', platform: 'print', content_type: 'print' },
        ],
      },
    },
  ];

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="text-center mb-8">
        <h1 className="text-h1 font-bold text-text mb-2">Welcome to Orbit Comms OS</h1>
        <p className="text-body text-mutedText max-w-2xl mx-auto">
          Choose a template to get started. Each template includes pre-built workflows,
          default platforms, approval roles, and example requests.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <div
              key={template.template_key}
              className="card card-hoverable border-2 border-transparent hover:border-primary/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 bg-${template.color}/20 rounded-control`}>
                  <Icon className={`text-${template.color}`} size={32} />
                </div>
                <CheckCircle className="text-primary" size={20} />
              </div>

              <h3 className="text-h3 font-bold text-text mb-2">{template.name}</h3>
              <p className="text-body text-mutedText mb-6">{template.description}</p>

              <div className="space-y-4 mb-6">
                <div>
                  <div className="text-small text-mutedText mb-2">Platforms</div>
                  <div className="flex flex-wrap gap-2">
                    {template.defaults.platforms.map((platform) => (
                      <span
                        key={platform}
                        className="badge-status bg-surface2 text-text capitalize"
                      >
                        {platform}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <div className="text-small text-mutedText mb-2">Approval Mode</div>
                  <span className="badge-primary">
                    {template.defaults.approval_mode === 'multi_stage' ? 'Multi-Stage' : 'Single Approver'}
                  </span>
                </div>

                <div>
                  <div className="text-small text-mutedText mb-2">Roles</div>
                  <div className="text-small text-text">
                    {template.defaults.roles.join(', ')}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onSelectTemplate(template)}
                className="w-full btn-primary flex items-center justify-center gap-2"
              >
                Use This Template
                <ArrowRight size={18} />
              </button>
            </div>
          );
        })}
      </div>

      <div className="text-center pt-6 border-t border-border">
        <button className="btn-secondary">
          Start from Scratch
        </button>
      </div>
    </div>
  );
};

export default OnboardingTemplates;




