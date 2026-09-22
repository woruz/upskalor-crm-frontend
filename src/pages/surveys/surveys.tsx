import { useState, useMemo, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router';
import { AppLayout } from '@/shared/components/ui/appLayout/appLayout';
import { SearchInput } from '@/shared/components/ui/input';
import { Dropdown } from '@/shared/components/ui/dropdown';
import { Table, type Column } from '@/shared/components/ui/table';
import { useToast } from '@/shared/components/ui/toast/toast';
import { useAuth } from '@/shared/lib/hooks/useAuth';
import { listSurveys, deleteSurvey } from '@/shared/lib/api/surveysApi';
import { surveyService } from '@/shared/lib/services/surveyService';
import type { SiteSurvey, SurveyStatus } from '@/shared/lib/types';
import styles from './surveys.module.scss';

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const ClipboardCheckIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
    <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
    <polyline points="9 13 12 16 16 11" />
  </svg>
);

const EyeIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const UserAvatarIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z" />
  </svg>
);

const CheckmarkIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

// ─── Filter Options ───────────────────────────────────────────────────────────

const STATUS_FILTER_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Scheduled', value: 'Scheduled' },
  { label: 'Completed', value: 'Completed' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Cancelled', value: 'Cancelled' },
];

export function SurveysPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  // Survey data state
  const [surveys, setSurveys] = useState<SiteSurvey[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [techFilter, setTechFilter] = useState('all');
  const [viewAllAdmin, setViewAllAdmin] = useState(true);

  // Fetch surveys from backend API
  const fetchSurveys = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await listSurveys({
        page: 1,
        limit: 100,
        search: searchQuery.trim() || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        assignedTechId: techFilter !== 'all' ? techFilter : undefined,
        viewAll: viewAllAdmin,
      });
      setSurveys(res.data || []);
    } catch {
      // In case backend is offline, read any real user-created surveys from local storage
      const local = surveyService.getSurveys();
      setSurveys(local);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, statusFilter, techFilter, viewAllAdmin]);

  useEffect(() => {
    fetchSurveys();
  }, [fetchSurveys]);

  // Derive technician list dynamically from current data
  const technicianOptions = useMemo(() => {
    const techs = Array.from(new Set(surveys.map((s) => s.assignedTech)));
    return [
      { label: 'All Technicians', value: 'all' },
      ...techs.map((tech) => ({ label: tech, value: tech })),
    ];
  }, [surveys]);

  // Filtered & searched data
  const filteredSurveys = useMemo(() => {
    return surveys.filter((item) => {
      // 1. Search filter (by customer name)
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        if (!item.customerName.toLowerCase().includes(query)) {
          return false;
        }
      }

      // 2. Status filter
      if (statusFilter !== 'all' && item.status !== statusFilter) {
        return false;
      }

      // 3. Technician filter
      if (techFilter !== 'all' && item.assignedTech !== techFilter) {
        return false;
      }

      // 4. Admin vs Assigned filter (if not viewAllAdmin, show only user's assigned surveys)
      if (!viewAllAdmin) {
        const currentUserName = fullName || user?.email || '';
        if (
          item.assignedTech === 'Unassigned' ||
          !item.assignedTech.toLowerCase().includes(currentUserName.toLowerCase())
        ) {
          return false;
        }
      }

      return true;
    });
  }, [surveys, searchQuery, statusFilter, techFilter, viewAllAdmin, fullName, user?.email]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || statusFilter !== 'all' || techFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setTechFilter('all');
  };

  // ─── Survey Actions Handlers ────────────────────────────────────────────────

  const handleStartOrViewSurvey = (survey: SiteSurvey) => {
    // Navigate to survey details / execution page (placeholder ready for next phase)
    navigate(`/surveys/${survey.id}`);
  };

  const handleDeleteSurvey = async (surveyId: string, customerName: string) => {
    if (window.confirm(`Are you sure you want to delete survey for "${customerName}"?`)) {
      try {
        await deleteSurvey(surveyId);
      } catch {
        surveyService.deleteSurvey(surveyId);
      }
      setSurveys((prev) => prev.filter((s) => s.id !== surveyId));
      addToast({
        title: 'Survey Deleted',
        description: `Survey for ${customerName} has been removed.`,
        variant: 'success',
      });
    }
  };

  // ─── Table Columns Definition ──────────────────────────────────────────────

  const columns: Column<SiteSurvey>[] = [
    {
      key: 'customerName',
      header: 'CUSTOMER NAME',
      sortable: true,
      minWidth: '180px',
      render: (val, row) => (
        <span
          className={styles.customerNameCell}
          onClick={() => handleStartOrViewSurvey(row)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleStartOrViewSurvey(row);
          }}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'surveyDateTime',
      header: 'SURVEY DATE/TIME',
      sortable: true,
      minWidth: '200px',
      render: (val) => <span className={styles.dateTimeCell}>{val}</span>,
    },
    {
      key: 'assignedTech',
      header: 'ASSIGNED TECH',
      sortable: true,
      minWidth: '180px',
      render: (val) => {
        const isUnassigned = !val || val === 'Unassigned';
        return (
          <div
            className={`${styles.assignedTechCell} ${
              !isUnassigned ? styles['assignedTechCell--assigned'] : ''
            }`}
          >
            <span className={styles.techAvatarIcon}>
              <UserAvatarIcon />
            </span>
            <span>{val || 'Unassigned'}</span>
          </div>
        );
      },
    },
    {
      key: 'status',
      header: 'STATUS',
      minWidth: '140px',
      render: (val: SurveyStatus) => {
        let badgeClass = styles['badge--scheduled'];
        if (val === 'Completed') badgeClass = styles['badge--completed'];
        else if (val === 'In Progress') badgeClass = styles['badge--inProgress'];
        else if (val === 'Cancelled') badgeClass = styles['badge--cancelled'];

        return <span className={`${styles.badge} ${badgeClass}`}>{val}</span>;
      },
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      align: 'right',
      minWidth: '190px',
      render: (_, row) => {
        const isCompleted = row.status === 'Completed';

        return (
          <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={styles.primaryActionBtn}
              onClick={() => handleStartOrViewSurvey(row)}
              title={isCompleted ? 'View Survey Details' : 'Start Survey Form'}
            >
              {isCompleted ? <EyeIcon /> : <ClipboardCheckIcon />}
              <span>{isCompleted ? 'View Survey' : 'Start Survey'}</span>
            </button>

            <button
              type="button"
              className={styles.deleteBtn}
              onClick={() => handleDeleteSurvey(row.id, row.customerName)}
              title={`Delete survey for ${row.customerName}`}
              aria-label={`Delete survey for ${row.customerName}`}
            >
              <TrashIcon />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <AppLayout
      headerProps={{
        title: 'Site Surveys',
        breadcrumbs: [{ label: 'CRM' }, { label: 'Site Surveys' }],
        userName: fullName || user?.email || 'User',
        userRole: user?.role || 'user',
        notificationCount: 2,
      }}
    >
      <div className={styles.page}>
        {/* ── Header Row with Page Title & Admin View Checkbox ─────────────── */}
        <div className={styles.headerRow}>
          <h1 className={styles.pageTitle}>Site Surveys</h1>

          <label className={styles.adminToggle}>
            <input
              type="checkbox"
              className={styles.checkboxInput}
              checked={viewAllAdmin}
              onChange={(e) => setViewAllAdmin(e.target.checked)}
            />
            <span
              className={`${styles.checkboxBox} ${
                viewAllAdmin ? styles['checkboxBox--checked'] : ''
              }`}
            >
              {viewAllAdmin && <CheckmarkIcon />}
            </span>
            <span>View All Surveys (Admin)</span>
          </label>
        </div>

        {/* ── Main White Container Card with Filters & Table ────────────────── */}
        <div className={styles.card}>
          {/* Top Filter Bar */}
          <div className={styles.filterRow}>
            <div className={styles.searchWrap}>
              <SearchInput
                placeholder="Search by customer name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                size="sm"
              />
            </div>

            <div className={styles.filterItem}>
              <Dropdown
                size="sm"
                options={STATUS_FILTER_OPTIONS}
                value={statusFilter}
                onChange={(val) => setStatusFilter(String(val || 'all'))}
              />
            </div>

            <div className={styles.filterItem}>
              <Dropdown
                size="sm"
                options={technicianOptions}
                value={techFilter}
                onChange={(val) => setTechFilter(String(val || 'all'))}
              />
            </div>

            {hasActiveFilters && (
              <button
                type="button"
                className={styles.clearFiltersBtn}
                onClick={resetFilters}
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Table Component */}
          <Table
            columns={columns}
            data={filteredSurveys}
            rowKey="id"
            bordered={false}
            isLoading={isLoading}
            emptyText="No surveys found. Schedule a site survey from a lead's details page."
          />
        </div>
      </div>
    </AppLayout>
  );
}

export default SurveysPage;
