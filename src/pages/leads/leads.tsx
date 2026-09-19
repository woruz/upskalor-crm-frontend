import { useState, useEffect, useCallback, useRef } from 'react';
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
import { ImportLeadsModal } from './importLeadsModal';
import { ExportLeadsModal } from './exportLeadsModal';
import {
  listLeads,
  updateLeadStatus,
  deleteLead,
} from '@/shared/lib/api/leadsApi';
import { extractApiError } from '@/shared/lib/api/authApi';
import type { Lead, LeadStatus, PaginationInfo } from '@/shared/lib/types';
import styles from './leads.module.scss';

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

// ─── Kanban columns matching Backend Enum ────────────────────────────────────

const KANBAN_COLUMNS: KanbanColumn[] = [
  { id: 'NEW', title: 'NEW' },
  { id: 'CONTACTED', title: 'CONTACTED' },
  { id: 'FOLLOW_UP', title: 'FOLLOW UP' },
  { id: 'INTERESTED', title: 'INTERESTED' },
  { id: 'NOT_INTERESTED', title: 'NOT INTERESTED' },
  { id: 'CONVERTED', title: 'CONVERTED' },
  { id: 'LOST', title: 'LOST' },
];

// ─── Status badge variant map ─────────────────────────────────────────────────

const statusVariant = (status: LeadStatus | string) => {
  switch (status) {
    case 'NEW':            return 'primary'   as const;
    case 'CONTACTED':      return 'info'      as const;
    case 'FOLLOW_UP':      return 'warning'   as const;
    case 'INTERESTED':     return 'warning'   as const;
    case 'NOT_INTERESTED': return 'secondary' as const;
    case 'CONVERTED':      return 'success'   as const;
    case 'LOST':           return 'error'     as const;
    default:               return 'secondary' as const;
  }
};

const formatStatusLabel = (status: LeadStatus | string): string => {
  switch (status) {
    case 'NEW':            return 'New';
    case 'CONTACTED':      return 'Contacted';
    case 'FOLLOW_UP':      return 'Follow Up';
    case 'INTERESTED':     return 'Interested';
    case 'NOT_INTERESTED': return 'Not Interested';
    case 'CONVERTED':      return 'Converted';
    case 'LOST':           return 'Lost';
    default:               return String(status);
  }
};

// ─── Page component ───────────────────────────────────────────────────────────

export function LeadsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  const [leads, setLeads] = useState<Lead[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'kanban' | 'table'>('kanban');
  const [isCompact, setIsCompact] = useState(false);
  const [page, setPage] = useState(1);

  // Modals state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [stateFilter, setStateFilter] = useState('all');

  // Debounce search input
  const searchTimeoutRef = useRef<number | null>(null);
  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    if (searchTimeoutRef.current) {
      window.clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = window.setTimeout(() => {
      setDebouncedSearch(val);
      setPage(1);
    }, 350);
  };

  // ── Data fetching ──────────────────────────────────────────────────────────

  const fetchLeads = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await listLeads({
        page,
        limit: viewMode === 'kanban' ? 100 : 20,
        search: debouncedSearch.trim() || undefined,
        status: statusFilter !== 'all' ? (statusFilter as LeadStatus) : undefined,
        leadSource: sourceFilter !== 'all' ? sourceFilter : undefined,
        state: stateFilter !== 'all' ? stateFilter : undefined,
        sort: 'createdAt',
        direction: 'desc',
      });

      setLeads(response.data || []);
      if (response.pagination) {
        setPagination(response.pagination);
      }
    } catch (error) {
      const msg = extractApiError(error);
      addToast({
        title: 'Failed to fetch leads',
        description: msg,
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, viewMode, debouncedSearch, statusFilter, sourceFilter, stateFilter, addToast]);

  useEffect(() => {
    fetchLeads();
  }, [fetchLeads]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const handleImport = () => setIsImportOpen(true);
  const handleExport = () => setIsExportOpen(true);
  const handleNewLead = () => setIsModalOpen(true);

  const handleDeleteLead = async (id: string, name: string) => {
    try {
      await deleteLead(id);
      setLeads((prev) => prev.filter((l) => l.id !== id));
      addToast({
        title: 'Lead Deleted',
        description: `${name} has been removed.`,
        variant: 'success',
      });
    } catch (error) {
      const msg = extractApiError(error);
      addToast({
        title: 'Delete Failed',
        description: msg,
        variant: 'error',
      });
    }
  };

  const handleStatusChange = async (leadId: string, newStatus: LeadStatus) => {
    const originalLead = leads.find((l) => l.id === leadId);
    if (!originalLead || originalLead.status === newStatus) return;

    // Optimistic UI update
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l)),
    );

    try {
      await updateLeadStatus(leadId, newStatus);
      addToast({
        title: 'Status Updated',
        description: `Moved "${originalLead.customerName}" to ${formatStatusLabel(newStatus)}.`,
        variant: 'success',
      });
    } catch (error) {
      // Revert optimistic update
      setLeads((prev) =>
        prev.map((l) => (l.id === leadId ? { ...l, status: originalLead.status } : l)),
      );
      const msg = extractApiError(error);
      addToast({
        title: 'Status Update Failed',
        description: msg,
        variant: 'error',
      });
    }
  };

  // ── Filtering helpers ──────────────────────────────────────────────────────

  const hasActiveFilters =
    statusFilter !== 'all' ||
    sourceFilter !== 'all' ||
    stateFilter !== 'all' ||
    searchQuery.trim() !== '';

  const resetFilters = () => {
    setStatusFilter('all');
    setSourceFilter('all');
    setStateFilter('all');
    setSearchQuery('');
    setDebouncedSearch('');
    setPage(1);
  };

  // ── Table columns ──────────────────────────────────────────────────────────

  const columns: Column<Lead>[] = [
    {
      key: 'customerName',
      header: 'CUSTOMER NAME',
      sortable: true,
      minWidth: '180px',
      render: (_, row) => (
        <div className={styles.customerCell}>
          <span className={styles.customerName}>{row.customerName}</span>
          {row.mobileNumber && (
            <a
              href={`https://wa.me/${row.mobileNumber.replace(/\D/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.waIcon}
              title={`WhatsApp ${row.customerName}`}
              onClick={(e) => e.stopPropagation()}
              aria-label={`Chat with ${row.customerName} on WhatsApp`}
            >
              <WhatsAppIcon />
            </a>
          )}
        </div>
      ),
    },
    {
      key: 'followUpDate',
      header: 'FOLLOW-UP',
      sortable: true,
      minWidth: '130px',
      render: (val) =>
        val ? new Date(val).toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' }) : '-',
    },
    {
      key: 'status',
      header: 'STATUS',
      sortable: true,
      minWidth: '150px',
      render: (value) => (
        <Badge variant={statusVariant(value)} pill>
          {formatStatusLabel(value)}
        </Badge>
      ),
    },
    {
      key: 'monthlyBillAmount',
      header: 'BILL AMOUNT',
      sortable: true,
      minWidth: '130px',
      render: (val: number) => (val ? `₹${val.toLocaleString('en-IN')}` : '-'),
    },
    {
      key: 'state',
      header: 'STATE',
      sortable: true,
      minWidth: '130px',
      render: (val) => val || '-',
    },
    {
      key: 'leadSource',
      header: 'SOURCE',
      sortable: true,
      minWidth: '120px',
      render: (val) => val || '-',
    },
    {
      key: 'assignedExecutive',
      header: 'EXECUTIVE',
      sortable: true,
      minWidth: '150px',
      render: (val) => (val ? 'Assigned' : 'Unassigned'),
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

  // ── Filter bar ─────────────────────────────────────────────────────────────

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
        onChange={(v) => {
          setStatusFilter(String(v));
          setPage(1);
        }}
        options={[
          { label: 'All Statuses',   value: 'all' },
          { label: 'New',            value: 'NEW' },
          { label: 'Contacted',      value: 'CONTACTED' },
          { label: 'Follow Up',      value: 'FOLLOW_UP' },
          { label: 'Interested',     value: 'INTERESTED' },
          { label: 'Not Interested', value: 'NOT_INTERESTED' },
          { label: 'Converted',      value: 'CONVERTED' },
          { label: 'Lost',           value: 'LOST' },
        ]}
      />
      <Dropdown
        size="sm"
        inline
        value={sourceFilter}
        onChange={(v) => {
          setSourceFilter(String(v));
          setPage(1);
        }}
        options={[
          { label: 'All Sources', value: 'all' },
          { label: 'Website', value: 'Website' },
          { label: 'Referral', value: 'Referral' },
          { label: 'Campaign', value: 'Campaign' },
          { label: 'Cold Call', value: 'Cold Call' },
          { label: 'Direct Referral', value: 'Direct Referral' },
        ]}
      />
      <Dropdown
        size="sm"
        inline
        value={stateFilter}
        onChange={(v) => {
          setStateFilter(String(v));
          setPage(1);
        }}
        options={[
          { label: 'All States', value: 'all' },
          { label: 'Maharashtra', value: 'Maharashtra' },
          { label: 'Delhi', value: 'Delhi' },
          { label: 'Karnataka', value: 'Karnataka' },
          { label: 'Jharkhand', value: 'Jharkhand' },
          { label: 'Gujarat', value: 'Gujarat' },
          { label: 'Tamil Nadu', value: 'Tamil Nadu' },
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
          </div>

          {/* Right: search + actions */}
          <div className={styles.toolbarRight}>
            <div className={styles.searchWrap}>
              <SearchInput
                size="sm"
                placeholder="Search name, phone, email…"
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onClear={() => {
                  setSearchQuery('');
                  setDebouncedSearch('');
                }}
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

            <Kanban<Lead>
              columns={KANBAN_COLUMNS}
              data={leads}
              columnKey="status"
              onCardMove={(item, toColumnId) => {
                handleStatusChange(item.id, toColumnId as LeadStatus);
              }}
              renderCard={(lead) => (
                <div className={styles.kanbanCard}>
                  {/* Row 1: name + WA + delete */}
                  <div className={styles.cardHeader}>
                    <div className={styles.cardTitleRow}>
                      <span className={styles.cardName}>{lead.customerName}</span>
                      {lead.mobileNumber && (
                        <a
                          href={`https://wa.me/${lead.mobileNumber.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.cardWa}
                          title="WhatsApp"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <WhatsAppIcon />
                        </a>
                      )}
                    </div>
                    <button
                      type="button"
                      className={styles.cardDelete}
                      title="Delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteLead(lead.id, lead.customerName);
                      }}
                      aria-label={`Delete ${lead.customerName}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>

                  {/* Row 2: amount */}
                  <div className={styles.cardAmount}>
                    <span className={styles.lightningIcon}><LightningIcon /></span>
                    <span>
                      {lead.monthlyBillAmount
                        ? `₹${lead.monthlyBillAmount.toLocaleString('en-IN')} / mo`
                        : 'No bill amount'}
                    </span>
                  </div>

                  {/* Row 3: location + view */}
                  <div className={styles.cardFooter}>
                    <span className={styles.cardLocation}>
                      <LocationIcon />
                      {lead.city || lead.state || 'India'}
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
          <Table<Lead>
            columns={columns}
            data={leads}
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
                  Showing {leads.length} of {pagination.total} leads
                </span>
                <Pagination
                  currentPage={page}
                  totalPages={Math.max(1, pagination.totalPages || 1)}
                  onPageChange={setPage}
                />
              </div>
            }
          />
        )}
      </div>

      {/* ── Add New Lead Modal ───────────────────────────────────── */}
      <AddLeadModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={fetchLeads}
      />

      {/* ── Import Leads Modal ───────────────────────────────────── */}
      <ImportLeadsModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onSuccess={fetchLeads}
      />

      {/* ── Export Leads Modal ───────────────────────────────────── */}
      <ExportLeadsModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        currentFilters={{
          search: debouncedSearch,
          status: statusFilter !== 'all' ? (statusFilter as LeadStatus) : undefined,
          state: stateFilter !== 'all' ? stateFilter : undefined,
          leadSource: sourceFilter !== 'all' ? sourceFilter : undefined,
        }}
        totalLeadsCount={pagination.total}
      />
    </AppLayout>
  );
}
