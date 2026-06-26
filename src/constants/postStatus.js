export const POST_STATUSES = [
  { value: 'idea',       label: 'Idea',       color: 'gray' },
  { value: 'approved',   label: 'Approved',   color: 'blue' },
  { value: 'drafting',   label: 'Drafting',   color: 'amber' },
  { value: 'in_review',  label: 'In Review',  color: 'purple' },
  { value: 'scheduled',  label: 'Scheduled',  color: 'sky' },
  { value: 'published',  label: 'Published',  color: 'green' },
  { value: 'reported',   label: 'Reported',   color: 'slate' },
];

export const POST_STATUS_VALUES = POST_STATUSES.map(s => s.value);
