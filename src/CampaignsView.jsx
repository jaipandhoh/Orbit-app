import React, { useState, useMemo } from 'react';
import { Plus, Search, Bell, ChevronRight, ChevronLeft, Filter, Columns } from 'lucide-react';
import { Button, StatusPill, Input, Tabs, FilterPill } from './components/ui';
import { PlatformIconCluster } from './components/ui/PlatformIcon';
import { Table, THead, TBody, TR, TH, TD } from './components/ui/Table';

const PAGE_SIZE = 10;

const STATUS_TABS = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'drafting', label: 'Drafting' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'published', label: 'Published' },
];

function deriveStage(status) {
  switch ((status || '').toLowerCase()) {
    case 'planning':
    case 'planned':
      return 'Planning';
    case 'active':
      return 'Execution';
    case 'drafting':
    case 'draft':
      return 'Outreach';
    case 'scheduled':
      return 'Scheduled';
    case 'published':
    case 'completed':
    case 'complete':
      return 'Completed';
    default:
      return 'Planning';
  }
};

function formatDate(dateStr) {
  if (!dateStr) return null;
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return null;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch {
    return null;
  }
}

const StagePill = ({ stage }) => {
  const styles = {
    Planning: 'border-gray-300 text-gray-600',
    Execution: 'border-blue-300 text-blue-600',
    Outreach: 'border-purple-300 text-purple-600',
    Scheduled: 'border-amber-300 text-amber-600',
    Completed: 'border-green-300 text-green-600',
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${styles[stage] || styles.Planning}`}>
      {stage}
    </span>
  );
};

const CampaignsView = ({
  transformedCampaigns,
  posts = [],
  loading,
  onNewCampaign,
  onCampaignClick,
}) => {
  const [activeTab, setActiveTab] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState(null);
  const [sortDir, setSortDir] = useState(null);

  // Build a map of campaign_id → distinct platforms
  const platformMap = useMemo(() => {
    const map = {};
    (posts || []).forEach((p) => {
      if (!p?.campaign_id || !p?.platform) return;
      if (!map[p.campaign_id]) map[p.campaign_id] = new Set();
      map[p.campaign_id].add(p.platform);
    });
    // Convert sets to arrays
    Object.keys(map).forEach((k) => (map[k] = [...map[k]]));
    return map;
  }, [posts]);

  // Filter
  const filtered = useMemo(() => {
    let list = transformedCampaigns || [];

    if (activeTab !== 'all') {
      list = list.filter((c) => {
        const s = (c.status || '').toLowerCase();
        if (activeTab === 'drafting') return s === 'drafting' || s === 'draft' || s === 'planning' || s === 'planned';
        if (activeTab === 'published') return s === 'published' || s === 'completed' || s === 'complete';
        return s === activeTab;
      });
    }

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) =>
          (c.name || '').toLowerCase().includes(q) ||
          (c.goal || '').toLowerCase().includes(q)
      );
    }

    return list;
  }, [transformedCampaigns, activeTab, search]);

  // Sort
  const sorted = useMemo(() => {
    if (!sortField) return filtered;
    const list = [...filtered];
    list.sort((a, b) => {
      let va, vb;
      if (sortField === 'name') { va = a.name || ''; vb = b.name || ''; }
      else if (sortField === 'status') { va = a.status || ''; vb = b.status || ''; }
      else if (sortField === 'date') { va = a.endDate || ''; vb = b.endDate || ''; }
      else return 0;
      const cmp = va.localeCompare(vb);
      return sortDir === 'desc' ? -cmp : cmp;
    });
    return list;
  }, [filtered, sortField, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE));
  const safePageNum = Math.min(page, totalPages);
  const paged = sorted.slice((safePageNum - 1) * PAGE_SIZE, safePageNum * PAGE_SIZE);

  const handleSort = (field) => {
    if (sortField === field) {
      setSortDir((d) => (d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc'));
      if (sortDir === 'desc') setSortField(null);
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  // Reset page when filters change
  const handleTabChange = (v) => { setActiveTab(v); setPage(1); };
  const handleSearchChange = (e) => { setSearch(e.target.value); setPage(1); };

  // Tab counts
  const tabsWithCounts = STATUS_TABS.map((t) => {
    if (t.value === 'all') return { ...t, count: (transformedCampaigns || []).length };
    const count = (transformedCampaigns || []).filter((c) => {
      const s = (c.status || '').toLowerCase();
      if (t.value === 'drafting') return s === 'drafting' || s === 'draft' || s === 'planning' || s === 'planned';
      if (t.value === 'published') return s === 'published' || s === 'completed' || s === 'complete';
      return s === t.value;
    }).length;
    return { ...t, count };
  });

  return (
    <div className="animate-fadeIn">
      {/* Page header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-ds-fg">Campaigns</h1>
          <p className="text-sm text-ds-fg-muted mt-1">Plan, manage, and track your PR campaigns.</p>
        </div>
        <div className="flex items-center gap-3">
          <Input
            icon={Search}
            placeholder="Search campaigns..."
            value={search}
            onChange={handleSearchChange}
            className="w-56"
          />
          <button className="relative p-2 rounded-lg hover:bg-ds-bg-subtle transition-colors duration-150">
            <Bell size={20} className="text-ds-fg-muted" />
            <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-ds-accent" />
          </button>
          <Button variant="primary" onClick={onNewCampaign}>
            <Plus size={16} />
            New Campaign
          </Button>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-6 border-b border-ds-border">
        <Tabs tabs={tabsWithCounts} activeTab={activeTab} onChange={handleTabChange} />
        <div className="flex items-center gap-2 pb-2">
          <FilterPill icon={Filter} label="Filters" />
          <FilterPill icon={Columns} label="Columns" />
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-16 text-ds-fg-muted text-sm">Loading campaigns...</div>
      ) : paged.length === 0 ? (
        <div className="text-center py-16 text-ds-fg-muted text-sm">
          {search || activeTab !== 'all' ? 'No campaigns match your filters.' : 'No campaigns yet. Create your first campaign to get started.'}
        </div>
      ) : (
        <div className="border border-ds-border rounded-xl overflow-hidden">
          <Table>
            <THead>
              <TR>
                <TH sortable sortDir={sortField === 'name' ? sortDir : undefined} onSort={() => handleSort('name')}>Campaign</TH>
                <TH sortable sortDir={sortField === 'status' ? sortDir : undefined} onSort={() => handleSort('status')}>Status</TH>
                <TH>Stage</TH>
                <TH>Channels</TH>
                <TH sortable sortDir={sortField === 'date' ? sortDir : undefined} onSort={() => handleSort('date')}>Publish Date</TH>
                <TH className="text-right">Coverage</TH>
              </TR>
            </THead>
            <TBody>
              {paged.map((campaign) => {
                const cid = campaign.campaign_id ?? campaign.id;
                const platforms = platformMap[cid] || [];
                const stage = deriveStage(campaign.status);
                const publishDate = formatDate(campaign.end_date || campaign.endDate) || null;

                return (
                  <TR key={cid} onClick={() => onCampaignClick(campaign)}>
                    <TD>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-ds-accent-subtle flex items-center justify-center shrink-0">
                          <span className="text-ds-accent-fg text-sm font-bold">
                            {(campaign.name || 'C')[0].toUpperCase()}
                          </span>
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-sm text-ds-fg truncate">{campaign.name}</div>
                          <div className="text-xs text-ds-fg-muted truncate max-w-[260px]">{campaign.goal || campaign.objective || ''}</div>
                        </div>
                      </div>
                    </TD>
                    <TD>
                      <StatusPill status={campaign.status} />
                    </TD>
                    <TD>
                      <StagePill stage={stage} />
                    </TD>
                    <TD>
                      {platforms.length > 0 ? (
                        <PlatformIconCluster platforms={platforms} />
                      ) : (
                        <span className="text-ds-fg-subtle text-xs">--</span>
                      )}
                    </TD>
                    <TD>
                      {publishDate || <span className="text-ds-fg-subtle">--</span>}
                    </TD>
                    <TD className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-ds-fg-muted">0</span>
                        <ChevronRight size={14} className="text-ds-fg-subtle" />
                      </div>
                    </TD>
                  </TR>
                );
              })}
            </TBody>
          </Table>
        </div>
      )}

      {/* Footer / Pagination */}
      {!loading && sorted.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <span className="text-sm text-ds-fg-muted">
            Showing {(safePageNum - 1) * PAGE_SIZE + 1} to {Math.min(safePageNum * PAGE_SIZE, sorted.length)} of {sorted.length} campaigns
          </span>
          {totalPages > 1 && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={safePageNum <= 1}
                className="p-1.5 rounded-lg hover:bg-ds-bg-subtle disabled:opacity-30 transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronLeft size={16} className="text-ds-fg-muted" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button
                  key={n}
                  onClick={() => setPage(n)}
                  className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors duration-150 cursor-pointer ${
                    n === safePageNum
                      ? 'border border-ds-accent text-ds-accent'
                      : 'text-ds-fg-muted hover:bg-ds-bg-subtle'
                  }`}
                >
                  {n}
                </button>
              ))}
              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={safePageNum >= totalPages}
                className="p-1.5 rounded-lg hover:bg-ds-bg-subtle disabled:opacity-30 transition-colors duration-150 cursor-pointer disabled:cursor-not-allowed"
              >
                <ChevronRight size={16} className="text-ds-fg-muted" />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CampaignsView;
