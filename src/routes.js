/** Single source of truth for app routing */

export const VIEWS = {
  DASHBOARD: 'dashboard',
  INBOX: 'inbox',
  BOARD: 'board',
  CALENDAR: 'calendar',
  CAMPAIGNS: 'campaigns',
  CONTACTS: 'contacts',
  ASSETS: 'assets',
  TEMPLATES: 'templates',
  SETTINGS: 'settings',
  CAMPAIGN_DETAIL: 'campaign-detail',
  CAMPAIGN_PLANNING: 'campaign-planning',
  REQUEST_DETAIL: 'request-detail',
  PUBLIC_REQUEST: 'public-request',
  TODO: 'todo',
  HELP: 'help',
};

export const MODALS = {
  TEMPLATE: 'template',
  CAMPAIGN_FORM: 'campaign-form',
  POST_FORM: 'post-form',
  CONTACT_FORM: 'contact-form',
  REQUEST_FORM: 'request-form',
  DELIVERABLE_FORM: 'deliverable-form',
  APPROVAL_REVIEW: 'approval-review',
};

export const DEFAULT_VIEW = VIEWS.DASHBOARD;
