import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { Button } from '@/shared/components/ui/button/button';
import { Badge } from '@/shared/components/ui/badge/badge';
import { SearchInput } from '@/shared/components/ui/input';
import { useToast } from '@/shared/components/ui/toast/toast';
import { Table, type Column } from '@/shared/components/ui/table';
import { Pagination } from '@/shared/components/ui/pagination/pagination';
import { Dropdown } from '@/shared/components/ui/dropdown';
import { Kanban, type KanbanColumn } from '@/shared/components/ui/kanban';
import { AppLayout } from '@/shared/components/ui/appLayout/appLayout';
import { useAuth } from '@/shared/lib/hooks/useAuth';
import { AddLeadModal } from './addLeadModal';
import styles from './leads.module.scss';

// ─── Types ────────────────────────────────────────────────────────────────────

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Survey Scheduled'
  | 'Quote Sent'
  | 'Negotiation'
  | 'Won'
  | 'Lost'
  | 'Junk';

export interface LeadItem {
  id: string;
  customerName: string;
  phone: string;
  followUp: string;
  status: LeadStatus;
  billAmount: number;
  state: string;
  city: string;
  source: string;
  executive: string;
}

// ─── Dummy data ───────────────────────────────────────────────────────────────

const INITIAL_LEADS: LeadItem[] = [
  {
    id: '1',
    customerName: 'Fuzen',
    phone: '919876543210',
    followUp: 'Jul 01, 2026',
    status: 'New',
    billAmount: 10000,
    state: 'Jharkhand',
    city: 'Ranchi',
    source: 'Website',
    executive: 'Amit Verma',
  },
  {
    id: '2',
    customerName: 'Rahul Desai',
    phone: '919876543211',
    followUp: 'Jul 01, 2026',
    status: 'New',
    billAmount: 3500,
    state: 'Maharashtra',
    city: 'Mumbai',
    source: 'Referral',
    executive: 'Pooja Sharma',
  },
  {
    id: '3',
    customerName: 'Sham',
    phone: '919876543212',
    followUp: 'Aug 29, 2026',
    status: 'Contacted',
    billAmount: 1000,
    state: 'Maharashtra',
    city: 'Pune',
    source: 'Website',
    executive: 'Amit Verma',
  },
  {
    id: '4',
    customerName: 'Suresh',
    phone: '919876543213',
    followUp: 'Jun 30, 2026',
    status: 'Quote Sent',
    billAmount: 5000,
    state: 'Maharashtra',
    city: 'Mumbai',
    source: 'Campaign',
    executive: 'Pooja Sharma',
  },
  {
    id: '5',
    customerName: 'Arun Sharma',
    phone: '919876543214',
    followUp: 'Jul 01, 2026',
    status: 'Survey Scheduled',
    billAmount: 3000,
    state: 'Maharashtra',
    city: 'Pune',
    source: 'Referral',
    executive: 'Amit Verma',
  },
  {
    id: '6',
    customerName: 'Priya Nair',
    phone: '919876543215',
    followUp: 'Sep 10, 2026',
    status: 'New',
    billAmount: 7500,
    state: 'Karnataka',
    city: 'Bangalore',
    source: 'Website',
    executive: 'Pooja Sharma',
  },
  {
    id: '7',
    customerName: 'Vikram Singh',
    phone: '919876543216',
    followUp: 'Sep 12, 2026',
    status: 'Contacted',
    billAmount: 12000,
    state: 'Delhi',
    city: 'New Delhi',
    source: 'Campaign',
    executive: 'Amit Verma',
  },
  {
    id: '8',
    customerName: 'Meera Joshi',
    phone: '919876543217',
    followUp: 'Sep 15, 2026',
    status: 'Negotiation',
    billAmount: 18000,
    state: 'Gujarat',
    city: 'Ahmedabad',
    source: 'Referral',
    executive: 'Amit Verma',
  },
  {
    id: '9',
    customerName: 'Deepak Rao',
    phone: '919876543218',
    followUp: 'Sep 18, 2026',
    status: 'Won',
    billAmount: 25000,
    state: 'Tamil Nadu',
    city: 'Chennai',
    source: 'Website',
    executive: 'Pooja Sharma',
  },
  {
    id: '10',
    customerName: 'Kavita Patel',
    phone: '919876543219',
    followUp: 'Sep 20, 2026',
    status: 'Lost',
    billAmount: 8000,
    state: 'Rajasthan',
    city: 'Jaipur',
    source: 'Campaign',
    executive: 'Amit Verma',
  },
  {
    id: '11',
    customerName: 'Ravi Kumar',
    phone: '919876543220',
    followUp: 'Sep 22, 2026',
    status: 'Junk',
    billAmount: 500,
    state: 'Uttar Pradesh',
    city: 'Lucknow',
    source: 'Website',
    executive: 'Pooja Sharma',
  },
];

// ─── Icons ────────────────────────────────────────────────────────────────────

const ImportIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="18" x2="12" y2="12" />
    <polyline points="9 15 12 18 15 15" />
  </svg>
);

const ExportIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="12" y1="12" x2="12" y2="18" />
    <polyline points="9 15 12 12 15 15" />
  </svg>
);

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const FilterIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M10 18h4v-2h-4v2zM3 6v2h18V6H3zm3 7h12v-2H6v2z" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.058-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.371s-1.041 1.017-1.041 2.479 1.066 2.876 1.214 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6" />
  </svg>
);

const LightningIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
  </svg>
);

const LocationIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

// ─── Kanban columns ───────────────────────────────────────────────────────────

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'New', title: 'NEW' },
  { id: 'Contacted', title: 'CONTACTED' },
  { id: 'Survey Scheduled', title: 'SURVEY SCHEDULED' },
  { id: 'Quote Sent', title: 'QUOTE SENT' },
  { id: 'Negotiation', title: 'NEGOTIATION' },
  { id: 'Won', title: 'WON' },
  { id: 'Lost', title: 'LOST' },
  { id: 'Junk', title: 'JUNK' },
];

// ─── Status badge variant map ─────────────────────────────────────────────────

const statusVariant = (status: string) => {
  switch (status) {
    case 'New':              return 'primary'   as const;
    case 'Contacted':        return 'info'      as const;
    case 'Survey Scheduled': return 'warning'   as const;
    case 'Quote Sent':       return 'info'      as const;
    case 'Negotiation':      return 'warning'   as const;
    case 'Won':              return 'success'   as const;
    case 'Lost':             return 'error'     as const;
    case 'Junk':             return 'secondary' as const;
    default:                 return 'secondary' as const;
  }
};

// ─── Page component ───────────────────────────────────────────────────────────

export function LeadsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isCompact, setIsCompact] = useState(false);
  const [page, setPage] = useState(1);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');
  const [executiveFilter, setExecutiveFilter] = useState('all');

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchLeads = useCallback(() => {
    setIsLoading(true);
    const t = setTimeout(() => {
      setLeads(INITIAL_LEADS);
      setIsLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    return fetchLeads();
  }, [fetchLeads]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleImport = () =>
    addToast({ title: 'Import Leads', description: 'Opening import dialog…', variant: 'info' });

  const handleExport = () =>
    addToast({ title: 'Export Leads', description: `Exporting ${filteredLeads.length} leads to CSV…`, variant: 'success' });

  const handleNewLead = () => setIsModalOpen(true);

  const handleSaveLead = (lead: Omit<LeadItem, 'id'>) => {
    const newLead: LeadItem = { id: String(Date.now()), ...lead };
    setLeads((prev) => [newLead, ...prev]);
    addToast({
      title: 'Lead Created',
      description: `"${newLead.customerName}" added successfully`,
      variant: 'success',
    });
  };

  const handleDeleteLead = (id: string, name: string) => {
    setLeads((prev) => prev.filter((l) => l.id !== id));
    addToast({ title: 'Lead Deleted', description: `${name} has been removed.`, variant: 'error' });
  };

  // ── Filtering ──────────────────────────────────────────────────────────────

  const hasActiveFilters =
    statusFilter !== 'all' || sourceFilter !== 'all' ||
    stateFilter !== 'all' || executiveFilter !== 'all' ||
    searchQuery.trim() !== '';

  const resetFilters = () => {
    setStatusFilter('all');
    setSourceFilter('all');
    setStateFilter('all');
    setExecutiveFilter('all');
    setSearchQuery('');
  };

  const filteredLeads = leads.filter((l) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (
        !l.customerName.toLowerCase().includes(q) &&
        !l.state.toLowerCase().includes(q) &&
        !l.city.toLowerCase().includes(q) &&
        !l.phone.includes(q) &&
        !l.source.toLowerCase().includes(q)
      )
        return false;
    }
    if (statusFilter !== 'all' && l.status !== statusFilter) return false;
    if (sourceFilter !== 'all' && l.source !== sourceFilter) return false;
    if (stateFilter !== 'all' && l.state.toLowerCase() !== stateFilter.toLowerCase()) return false;
    if (executiveFilter !== 'all' && l.executive !== executiveFilter) return false;
    return true;
  });

  // ── Table columns ──────────────────────────────────────────────────────────

  const columns: Column<LeadItem>[] = [
    {
      key: 'customerName',
      header: 'CUSTOMER NAME',
      sortable: true,
      minWidth: '180px',
      render: (_, row) => (
        <div className={styles.customerCell}>
          <span className={styles.customerName}>{row.customerName}</span>
          <a
            href={`https://wa.me/${row.phone}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.waIcon}
            title={`WhatsApp ${row.customerName}`}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Chat with ${row.customerName} on WhatsApp`}
          >
            <WhatsAppIcon />
          </a>
        </div>
      ),
    },
    {
      key: 'followUp',
      header: 'FOLLOW-UP',
      sortable: true,
      minWidth: '130px',
      accessor: 'followUp',
    },
    {
      key: 'status',
      header: 'STATUS',
      sortable: true,
      minWidth: '150px',
      render: (value) => (
        <Badge variant={statusVariant(value)} pill>
          {value}
        </Badge>
      ),
    },
    {
      key: 'billAmount',
      header: 'BILL AMOUNT',
      sortable: true,
      minWidth: '130px',
      render: (val: number) => `₹${val.toLocaleString('en-IN')}`,
    },
    {
      key: 'state',
      header: 'STATE',
      sortable: true,
      minWidth: '130px',
      accessor: 'state',
    },
    {
      key: 'source',
      header: 'SOURCE',
      sortable: true,
      minWidth: '120px',
      accessor: 'source',
    },
    {
      key: 'executive',
      header: 'EXECUTIVE',
      sortable: true,
      minWidth: '150px',
      accessor: 'executive',
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      align: 'right',
      minWidth: '120px',
      render: (_, row) => (
        <div className={styles.actionCell}>
          <button
            type="button"
            className={styles.viewBtn}
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/leads/${row.id}`);
            }}
          >
            View
          </button>
          <button
            type="button"
            className={styles.deleteBtn}
            title={`Delete ${row.customerName}`}
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteLead(row.id, row.customerName);
            }}
            aria-label={`Delete ${row.customerName}`}
          >
            <TrashIcon />
          </button>
        </div>
      ),
    },
  ];

  // ── Filter bar (shared between table and kanban) ───────────────────────────

  const filterBar = (
    <div className={styles.filterBar}>
      <span className={styles.filterLabel}>
        <FilterIcon />
        Filters
      </span>

      <Dropdown
        size="sm"
        inline
        value={statusFilter}
        onChange={(v) => setStatusFilter(String(v))}
        options={[
          { label: 'All Statuses',       value: 'all' },
          { label: 'New',                value: 'New' },
          { label: 'Contacted',          value: 'Contacted' },
          { label: 'Survey Scheduled',   value: 'Survey Scheduled' },
          { label: 'Quote Sent',         value: 'Quote Sent' },
          { label: 'Negotiation',        value: 'Negotiation' },
          { label: 'Won',                value: 'Won' },
          { label: 'Lost',               value: 'Lost' },
          { label: 'Junk',               value: 'Junk' },
        ]}
      />
      <Dropdown
        size="sm"
        inline
        value={sourceFilter}
        onChange={(v) => setSourceFilter(String(v))}
        options={[
          { label: 'All Sources', value: 'all' },
          { label: 'Website', value: 'Website' },
          { label: 'Referral', value: 'Referral' },
          { label: 'Campaign', value: 'Campaign' },
        ]}
      />
      <Dropdown
        size="sm"
        inline
        value={stateFilter}
        onChange={(v) => setStateFilter(String(v))}
        options={[
          { label: 'All States', value: 'all' },
          { label: 'Jharkhand', value: 'Jharkhand' },
          { label: 'Maharashtra', value: 'Maharashtra' },
          { label: 'Karnataka', value: 'Karnataka' },
          { label: 'Delhi', value: 'Delhi' },
        ]}
      />
      <Dropdown
        size="sm"
        inline
        value={executiveFilter}
        onChange={(v) => setExecutiveFilter(String(v))}
        options={[
          { label: 'All Executives', value: 'all' },
          { label: 'Amit Verma', value: 'Amit Verma' },
          { label: 'Pooja Sharma', value: 'Pooja Sharma' },
        ]}
      />

      {hasActiveFilters && (
        <Button variant="ghost" size="sm" onClick={resetFilters}>
          Clear Filters
        </Button>
      )}
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <AppLayout
      headerProps={{
        title: 'Leads',
        breadcrumbs: [{ label: 'CRM' }, { label: 'Leads' }],
        userName: fullName || user?.email || 'User',
        userRole: user?.role || 'user',
        notificationCount: 5,
      }}
    >
      <div className={styles.page}>

        {/* ── Top toolbar ─────────────────────────────────────────────── */}
        <div className={styles.toolbar}>
          {/* Left: view switcher */}
          <div className={styles.toolbarLeft}>
            <div className={styles.viewSwitcher}>
              <button
                type="button"
                className={`${styles.viewBtn2} ${viewMode === 'kanban' ? styles['viewBtn2--active'] : ''}`}
                onClick={() => setViewMode('kanban')}
                aria-pressed={viewMode === 'kanban'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="5" height="18" rx="1" />
                  <rect x="10" y="3" width="5" height="11" rx="1" />
                  <rect x="17" y="3" width="4" height="7" rx="1" />
                </svg>
                Kanban
              </button>
              <button
                type="button"
                className={`${styles.viewBtn2} ${viewMode === 'table' ? styles['viewBtn2--active'] : ''}`}
                onClick={() => setViewMode('table')}
                aria-pressed={viewMode === 'table'}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="3" width="18" height="18" rx="2" />
                  <line x1="3" y1="9" x2="21" y2="9" />
                  <line x1="3" y1="15" x2="21" y2="15" />
                  <line x1="9" y1="3" x2="9" y2="21" />
                </svg>
                Table
              </button>
            </div>

            {viewMode === 'table' && (
              <Button variant="outline" size="sm" onClick={() => setIsCompact((p) => !p)}>
                {isCompact ? 'Normal View' : 'Compact'}
              </Button>
            )}

            {leads.length < INITIAL_LEADS.length && (
              <Button variant="ghost" size="sm" onClick={() => setLeads(INITIAL_LEADS)}>
                Restore Leads
              </Button>
            )}
          </div>

          {/* Right: search + actions */}
          <div className={styles.toolbarRight}>
            <div className={styles.searchWrap}>
              <SearchInput
                size="sm"
                placeholder="Search leads…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
              />
            </div>

            <div className={styles.actionBtns}>
              <Button variant="outline" size="sm" onClick={fetchLeads} disabled={isLoading}>
                Refetch
              </Button>
              <Button variant="secondary" size="sm" onClick={handleImport} leftIcon={<ImportIcon />}>
                Import
              </Button>
              <Button variant="secondary" size="sm" onClick={handleExport} leftIcon={<ExportIcon />}>
                Export
              </Button>
              <Button variant="primary" size="sm" onClick={handleNewLead} leftIcon={<PlusIcon />}>
                New Lead
              </Button>
            </div>
          </div>
        </div>

        {/* ── Kanban view ──────────────────────────────────────────────── */}
        {viewMode === 'kanban' && (
          <div className={styles.kanbanWrapper}>
            {filterBar}

            <Kanban<LeadItem>
              columns={KANBAN_COLUMNS}
              data={filteredLeads}
              columnKey="status"
              onCardMove={(item, toColumnId) => {
                setLeads((prev) =>
                  prev.map((l) => l.id === item.id ? { ...l, status: toColumnId as LeadItem['status'] } : l),
                );
                addToast({ title: 'Lead Moved', description: `Moved "${item.customerName}" to ${toColumnId}`, variant: 'success' });
              }}
              renderCard={(lead) => (
                <div className={styles.kanbanCard}>
                  {/* Row 1: name + WA + delete */}
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleRow}>
                      <span className={styles.cardName}>{lead.customerName}</span>
                      <a
                        href={`https://wa.me/${lead.phone}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={styles.cardWa}
                        title="WhatsApp"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <WhatsAppIcon />
                      </a>
                    </div>
                    <button
                      type="button"
                      className={styles.cardDelete}
                      title="Delete"
                      onClick={(e) => { e.stopPropagation(); handleDeleteLead(lead.id, lead.customerName); }}
                      aria-label={`Delete ${lead.customerName}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>

                  {/* Row 2: amount */}
                  <div className={styles.cardAmount}>
                    <span className={styles.lightningIcon}><LightningIcon /></span>
                    <span>₹{lead.billAmount.toLocaleString('en-IN')} / mo</span>
                  </div>

                  {/* Row 3: location + view */}
                  <div className={styles.cardFooter}>
                    <span className={styles.cardLocation}>
                      <LocationIcon />
                      {lead.state}
                    </span>
                    <button
                      type="button"
                      className={styles.cardViewBtn}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/leads/${lead.id}`);
                      }}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              )}
            />
          </div>
        )}

        {/* ── Table view ───────────────────────────────────────────────── */}
        {viewMode === 'table' && (
          <Table<LeadItem>
            columns={columns}
            data={filteredLeads}
            rowKey="id"
            isLoading={isLoading}
            compact={isCompact}
            bordered
            hoverable
            onRowClick={(row) => navigate(`/leads/${row.id}`)}
            toolbar={filterBar}
            footer={
              <div className={styles.tableFooter}>
                <span className={styles.tableCount}>
                  Showing {filteredLeads.length} of {leads.length} leads
                </span>
                <Pagination currentPage={page} totalPages={Math.max(1, Math.ceil(filteredLeads.length / 10))} onPageChange={setPage} />
              </div>
            }
          />
        )}
      </div>

      {/* ── Add New Lead Modal ───────────────────────────────────── */}
      <AddLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveLead}
      />
    </AppLayout>
  );
}
