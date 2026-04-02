import React, { useState } from 'react';
import {
  LayoutDashboard, Megaphone, Inbox, Trello, Calendar,
  Users, ListTodo, X, ArrowRight, ArrowLeft, Sparkles,
  CheckCircle, BookOpen,
} from 'lucide-react';

const TOUR_KEY = 'orbit_onboarding_done';

const STEPS = [
  {
    icon: Sparkles,
    gradient: 'from-primary to-purple-500',
    title: 'Welcome to Orbit',
    subtitle: 'Your PR & communications command center',
    body: 'Orbit brings together campaign management, content scheduling, team approvals, and AI-powered planning — all in one place. This quick tour will show you around.',
  },
  {
    icon: LayoutDashboard,
    gradient: 'from-blue-500 to-cyan-500',
    title: 'Dashboard',
    subtitle: 'Your daily command center',
    body: 'The Dashboard surfaces what matters most: urgent requests, at-risk campaigns, upcoming deadlines, and pending approvals. Start every day here to stay on top of things.',
    tip: 'Tip: blocked or urgent items are surfaced automatically — no digging needed.',
  },
  {
    icon: Megaphone,
    gradient: 'from-violet-500 to-pink-500',
    title: 'Campaigns',
    subtitle: 'Plan, track, and execute PR campaigns',
    body: 'Create campaigns with goals, timelines, and content plans. Use the AI Campaign Planner to auto-generate strategies, messaging pillars, audience personas, and a full content calendar.',
    tip: 'Tip: click "AI Plan" inside any campaign to generate a complete campaign strategy.',
  },
  {
    icon: Inbox,
    gradient: 'from-orange-500 to-amber-500',
    title: 'Inbox & Board',
    subtitle: 'Manage every incoming request',
    body: 'The Inbox collects all incoming requests. The Board gives you a Kanban view — drag-and-drop requests through New → In Progress → Review → Approved → Published.',
    tip: 'Tip: filter by urgency or platform to focus on what\'s most critical.',
  },
  {
    icon: Calendar,
    gradient: 'from-green-500 to-emerald-500',
    title: 'Calendar',
    subtitle: 'Visualize your content schedule',
    body: 'See all scheduled and published posts laid out across the week or month. Quickly spot gaps in your content schedule and plan accordingly.',
    tip: 'Tip: switch between week and month view using the controls at the top right.',
  },
  {
    icon: Users,
    gradient: 'from-rose-500 to-red-500',
    title: 'Contacts',
    subtitle: 'Build your media relationships',
    body: 'Store and manage journalists, partners, and media contacts. Tag them by type, track relationships, and reference them across campaigns.',
  },
  {
    icon: ListTodo,
    gradient: 'from-teal-500 to-cyan-600',
    title: 'To-Do',
    subtitle: 'Your personal task list',
    body: 'Every deliverable and pending action across all your campaigns is surfaced here, grouped by due date. Overdue items are highlighted so nothing slips through.',
    tip: 'Tip: To-Do pulls automatically from all active campaigns — no manual entry needed.',
  },
  {
    icon: CheckCircle,
    gradient: 'from-primary to-purple-500',
    title: "You're all set!",
    subtitle: 'Ready to launch your first campaign',
    body: 'That covers the essentials. Explore the Settings page to configure approvals, connect integrations, and customize your workspace. The Help & Tutorials page has a full feature guide.',
  },
];

export function shouldShowTour() {
  return !localStorage.getItem(TOUR_KEY);
}

export function markTourDone() {
  localStorage.setItem(TOUR_KEY, '1');
}

export function resetTour() {
  localStorage.removeItem(TOUR_KEY);
}

const OnboardingTour = ({ onComplete, onViewHelp }) => {
  const [step, setStep] = useState(0);
  const current = STEPS[step];
  const isLast = step === STEPS.length - 1;
  const Icon = current.icon;

  const next = () => {
    if (isLast) {
      markTourDone();
      onComplete();
    } else {
      setStep((s) => s + 1);
    }
  };

  const skip = () => {
    markTourDone();
    onComplete();
  };

  const handleViewHelp = () => {
    markTourDone();
    onComplete();
    onViewHelp?.();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-md bg-white dark:bg-surface-dark rounded-3xl shadow-2xl overflow-hidden">

        {/* Progress bar */}
        <div className="h-1 bg-gray-100 dark:bg-gray-800">
          <div
            className="h-full bg-gradient-to-r from-primary to-purple-500 transition-all duration-500"
            style={{ width: `${((step + 1) / STEPS.length) * 100}%` }}
          />
        </div>

        {/* Header icon */}
        <div className={`flex items-center justify-center pt-10 pb-6 bg-gradient-to-br ${current.gradient} bg-opacity-10`}>
          <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${current.gradient} flex items-center justify-center shadow-lg`}>
            <Icon size={36} className="text-white" />
          </div>
        </div>

        {/* Content */}
        <div className="px-8 pb-8">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-text mb-1">{current.title}</h2>
            <p className="text-sm font-medium text-primary mb-3">{current.subtitle}</p>
            <p className="text-sm text-mutedText leading-relaxed">{current.body}</p>
            {current.tip && (
              <div className="mt-4 px-4 py-2.5 rounded-xl bg-primary/8 dark:bg-primary/10 text-xs text-primary text-left">
                {current.tip}
              </div>
            )}
          </div>

          {/* Step dots */}
          <div className="flex items-center justify-center gap-1.5 mb-6">
            {STEPS.map((_, i) => (
              <button
                key={i}
                onClick={() => setStep(i)}
                className={`rounded-full transition-all ${
                  i === step
                    ? 'w-5 h-2 bg-primary'
                    : i < step
                    ? 'w-2 h-2 bg-primary/40'
                    : 'w-2 h-2 bg-gray-200 dark:bg-gray-700'
                }`}
              />
            ))}
          </div>

          {/* Actions */}
          {isLast ? (
            <div className="space-y-2">
              <button
                onClick={next}
                className="w-full btn-primary py-3 flex items-center justify-center gap-2"
              >
                Get started
                <ArrowRight size={16} />
              </button>
              {onViewHelp && (
                <button
                  onClick={handleViewHelp}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-control text-sm font-medium text-mutedText hover:text-text transition-colors"
                >
                  <BookOpen size={15} />
                  View full tutorial guide
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <button
                onClick={skip}
                className="text-sm text-mutedText hover:text-text transition-colors"
              >
                Skip tour
              </button>
              <div className="flex items-center gap-2">
                {step > 0 && (
                  <button
                    onClick={() => setStep((s) => s - 1)}
                    className="flex items-center gap-1.5 px-4 py-2 rounded-control text-sm font-medium text-mutedText border border-border dark:border-gray-700 hover:text-text transition-colors"
                  >
                    <ArrowLeft size={14} />
                    Back
                  </button>
                )}
                <button
                  onClick={next}
                  className="btn-primary flex items-center gap-1.5 py-2 px-5"
                >
                  Next
                  <ArrowRight size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default OnboardingTour;
