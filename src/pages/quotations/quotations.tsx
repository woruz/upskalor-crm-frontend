import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router';
import { AppLayout } from '@/shared/components/ui/appLayout/appLayout';
import { Button } from '@/shared/components/ui/button/button';
import { Badge } from '@/shared/components/ui/badge/badge';
import { SearchInput } from '@/shared/components/ui/input';
import { Dropdown } from '@/shared/components/ui/dropdown';
import { Table, type Column } from '@/shared/components/ui/table';
import { Pagination } from '@/shared/components/ui/pagination/pagination';
import { useToast } from '@/shared/components/ui/toast/toast';
import { useAuth } from '@/shared/lib/hooks/useAuth';
import { listQuotations, deleteQuotation } from '@/shared/lib/api/quotationsApi';
import { extractApiError } from '@/shared/lib/api/authApi';
import type { Quotation, QuotationStatus, PaginationInfo } from '@/shared/lib/types';
import { ROUTES } from '@/shared/lib/config/routes';
import styles from './quotations.module.scss';

// ─── Filter Options ───────────────────────────────────────────────────────────

const STATUS_FILTER_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Draft', value: 'DRAFT' },
  { label: 'Sent to Customer', value: 'SENT' },
  { label: 'Accepted', value: 'ACCEPTED' },
  { label: 'Rejected', value: 'REJECTED' },
  { label: 'Expired', value: 'EXPIRED' },
];

const SORT_OPTIONS = [
  { label: 'Recently Created', value: 'createdAt:desc' },
  { label: 'Oldest First', value: 'createdAt:asc' },
  { label: 'Grand Total (High to Low)', value: 'grandTotal:desc' },
  { label: 'Grand Total (Low to High)', value: 'grandTotal:asc' },
  { label: 'System Size (Largest)', value: 'systemSizeKw:desc' },
  { label: 'Validity Date (Soonest)', value: 'validityDate:asc' },
];

const getStatusBadgeVariant = (status: QuotationStatus) => {
  switch (status) {
    case 'ACCEPTED':
      return 'success';
    case 'SENT':
      return 'info';
    case 'DRAFT':
      return 'secondary';
    case 'REJECTED':
      return 'error';
    case 'EXPIRED':
      return 'warning';
    default:
      return 'default';
  }
};

export function QuotationsPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 1,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt:desc');

  // Search debounce
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

  // ── Fetch Quotations ───────────────────────────────────────────────────────
  const fetchQuotations = useCallback(async () => {
    setIsLoading(true);
    try {
      const [sortField, sortDirection] = sortBy.split(':') as [
        'createdAt' | 'validityDate' | 'quoteNumber' | 'systemSizeKw' | 'grandTotal',
        'asc' | 'desc',
      ];

      const res = await listQuotations({
        page,
        limit: 20,
        search: debouncedSearch.trim() || undefined,
        status: statusFilter !== 'all' ? (statusFilter as QuotationStatus) : undefined,
        sort: sortField,
        direction: sortDirection,
      });

      setQuotations(res.data || []);
      setPagination(res.pagination);
    } catch (err) {
      const msg = extractApiError(err);
      addToast({
        title: 'Failed to load quotations',
        description: msg,
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [page, debouncedSearch, statusFilter, sortBy, addToast]);

  useEffect(() => {
    fetchQuotations();
  }, [fetchQuotations]);

  // ── Delete Quotation ───────────────────────────────────────────────────────
  const handleDelete = async (e: React.MouseEvent, quote: Quotation) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to delete quote "${quote.quoteNumber}"?`)) {
      return;
    }

    try {
      await deleteQuotation(quote.id);
      addToast({
        title: 'Quotation Deleted',
        description: `Quote "${quote.quoteNumber}" was deleted successfully.`,
        variant: 'success',
      });
      fetchQuotations();
    } catch (err) {
      const msg = extractApiError(err);
      addToast({
        title: 'Delete Failed',
        description: msg,
        variant: 'error',
      });
    }
  };

  // ── Table Column Definitions ───────────────────────────────────────────────
  const columns: Column<Quotation>[] = [
    {
      key: 'quoteNumber',
      header: 'QUOTE #',
      sortable: true,
      minWidth: '150px',
      render: (val, row) => (
        <div className={styles.quoteNumberCell}>
          <span className={styles.quoteNumber}>{val}</span>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-text-tertiary)' }}>
            v{row.version || 1}
          </span>
        </div>
      ),
    },
    {
      key: 'lead',
      header: 'CUSTOMER / LEAD',
      minWidth: '180px',
      render: (_, row) => (
        <div className={styles.leadCell}>
          <span className={styles.leadName}>
            {row.lead?.customerName || (row.leadId ? row.leadId.substring(0, 8) : 'N/A')}
          </span>
          {row.lead?.mobileNumber && (
            <span style={{ fontSize: '0.75rem', color: 'var(--color-text-secondary)' }}>
              {row.lead.mobileNumber}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'systemSizeKw',
      header: 'SYSTEM CAPACITY',
      sortable: true,
      minWidth: '160px',
      render: (val, row) => (
        <div className={styles.systemSpec}>
          <span>{val} kW</span>
          <Badge variant="primary" size="sm">
            {row.systemType?.replace('_', ' ') || 'ON GRID'}
          </Badge>
        </div>
      ),
    },
    {
      key: 'grandTotal',
      header: 'GROSS AMOUNT',
      sortable: true,
      minWidth: '140px',
      render: (val: number) => `₹${(val || 0).toLocaleString('en-IN')}`,
    },
    {
      key: 'netCustomerCost',
      header: 'NET CUSTOMER COST',
      sortable: true,
      minWidth: '160px',
      render: (val: number, row) => (
        <div className={styles.costCell}>
          <span className={styles.netCost}>₹{(val || 0).toLocaleString('en-IN')}</span>
          {(row.centralSubsidy > 0 || row.stateSubsidy > 0) && (
            <span className={styles.grossCost}>
              Gross: ₹{row.grandTotal.toLocaleString('en-IN')}
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      sortable: true,
      minWidth: '130px',
      render: (val: QuotationStatus) => (
        <Badge variant={getStatusBadgeVariant(val)} pill>
          {val}
        </Badge>
      ),
    },
    {
      key: 'validityDate',
      header: 'VALID UNTIL',
      sortable: true,
      minWidth: '130px',
      render: (val: string) => {
        if (!val) return '-';
        const date = new Date(val);
        const isPast = date.getTime() < Date.now();
        return (
          <span style={{ color: isPast ? 'var(--color-error)' : 'inherit' }}>
            {date.toLocaleDateString('en-US', {
              month: 'short',
              day: '2-digit',
              year: 'numeric',
            })}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      align: 'right',
      minWidth: '90px',
      render: (_, row) => (
        <div className={styles.rowActions} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={styles.actionBtn}
            onClick={() => navigate(`/quotations/${row.id}`)}
            title="View Details"
            aria-label="View quotation details"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
          </button>
          <button
            type="button"
            className={`${styles.actionBtn} ${styles['actionBtn--delete']}`}
            onClick={(e) => handleDelete(e, row)}
            title="Delete Quotation"
            aria-label="Delete quotation"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
            </svg>
          </button>
        </div>
      ),
    },
  ];

  return (
    <AppLayout
      headerProps={{
        title: 'Quotations',
        breadcrumbs: [{ label: 'CRM' }, { label: 'Quotations' }],
        userName: fullName || user?.email || 'User',
        userRole: user?.role || 'user',
        notificationCount: 3,
      }}
    >
      <div className={styles.page}>
        {/* Top Toolbar */}
        <div className={styles.toolbar}>
          <div className={styles.toolbarLeft}>
            <div className={styles.searchWrap}>
              <SearchInput
                placeholder="Search quote # or customer..."
                value={searchQuery}
                onChange={(e) => handleSearchChange(e.target.value)}
                onClear={() => handleSearchChange('')}
                size="sm"
              />
            </div>
          </div>

          <div className={styles.toolbarRight}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate(ROUTES.CREATE_QUOTATION)}
              leftIcon={
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              }
            >
              New Quotation
            </Button>
          </div>
        </div>

        {/* Filter Bar */}
        <div className={styles.filterBar}>
          <span className={styles.filterLabel}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
            </svg>
            Filter by:
          </span>

          <div className={styles.filterItem}>
            <Dropdown
              size="sm"
              options={STATUS_FILTER_OPTIONS}
              value={statusFilter}
              onChange={(val) => {
                setStatusFilter(String(val || 'all'));
                setPage(1);
              }}
            />
          </div>

          <div className={styles.filterItem}>
            <Dropdown
              size="sm"
              options={SORT_OPTIONS}
              value={sortBy}
              onChange={(val) => {
                setSortBy(String(val || 'createdAt:desc'));
                setPage(1);
              }}
            />
          </div>

          {(statusFilter !== 'all' || debouncedSearch) && (
            <button
              type="button"
              className={styles.clearFiltersBtn}
              onClick={() => {
                setStatusFilter('all');
                setSearchQuery('');
                setDebouncedSearch('');
                setPage(1);
              }}
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Quotations Table */}
        <div className={styles.tableCard}>
          <Table
            columns={columns}
            data={quotations}
            isLoading={isLoading}
            emptyText="No quotations found. Click 'New Quotation' to generate one."
            onRowClick={(row) => navigate(`/quotations/${row.id}`)}
          />

          {pagination.totalPages > 1 && (
            <div className={styles.paginationWrap}>
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
}

export default QuotationsPage;
