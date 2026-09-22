import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router';
import { AppLayout } from '@/shared/components/ui/appLayout/appLayout';
import { Input, SearchInput } from '@/shared/components/ui/input';
import { Dropdown } from '@/shared/components/ui/dropdown';
import { Table, type Column } from '@/shared/components/ui/table';
import { Button } from '@/shared/components/ui/button';
import { Modal } from '@/shared/components/ui/modal/modal';
import { useToast } from '@/shared/components/ui/toast/toast';
import { useAuth } from '@/shared/lib/hooks/useAuth';
import type {
  PaymentReceipt,
  OutstandingPayment,
  PaymentMilestone,
  InvoiceRecord,
  PaymentMode,
  PaymentDashboardKpis,
} from '@/shared/lib/types';
import {
  getPaymentDashboardKpis,
  listReceipts,
  listOutstandingPayments,
  listPaymentMilestones,
  listInvoices,
  recordPayment,
  deleteProjectMilestone,
  downloadReceiptPdf,
  shareReceiptWhatsApp,
} from '@/shared/lib/api/paymentsApi';
import styles from './payments.module.scss';

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const WhatsAppIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.058-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.371s-1.041 1.017-1.041 2.479 1.066 2.876 1.214 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

const PrintReceiptIcon = () => (
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
    <polyline points="6 9 6 2 18 2 18 9" />
    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
    <rect x="6" y="14" width="12" height="8" />
  </svg>
);

const InfoIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10" />
    <line x1="12" y1="16" x2="12" y2="12" />
    <line x1="12" y1="8" x2="12.01" y2="8" />
  </svg>
);

const PlusCircleIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path
      fillRule="evenodd"
      clipRule="evenodd"
      d="M12 2C6.477 2 2 6.477 2 12s4.477 10 10 10 10-4.477 10-10S17.523 2 12 2zm1 6a1 1 0 10-2 0v3H8a1 1 0 100 2h3v3a1 1 0 102 0v-3h3a1 1 0 100-2h-3V8z"
    />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="15"
    height="15"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.75"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6" />
    <path d="M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);

// ─── Date Formatter Helpers ──────────────────────────────────────────────────

function formatDate(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function formatDateOnly(dateStr?: string | null): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

// ─── Filter Dropdown Options ─────────────────────────────────────────────────

const STATUS_FILTER_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Successful', value: 'Successful' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Failed', value: 'Failed' },
  { label: 'Partially Received', value: 'Partially Received' },
  { label: 'Received', value: 'Received' },
  { label: 'Overdue', value: 'Overdue' },
  { label: 'Paid', value: 'Paid' },
  { label: 'Unpaid', value: 'Unpaid' },
];

const MODE_FILTER_OPTIONS = [
  { label: 'All Modes', value: 'all' },
  { label: 'UPI', value: 'UPI' },
  { label: 'Net Banking', value: 'Net Banking' },
  { label: 'Cheque', value: 'Cheque' },
  { label: 'Cash', value: 'Cash' },
  { label: 'Credit/Debit Card', value: 'Credit/Debit Card' },
];

const SORT_OPTIONS = [
  { label: 'Sort By...', value: 'all' },
  { label: 'Amount: High to Low', value: 'amount:desc' },
  { label: 'Amount: Low to High', value: 'amount:asc' },
];

type ActiveTab = 'Outstanding' | 'Schedules' | 'Receipt History' | 'Invoices';

export function PaymentsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { user } = useAuth();
  const { addToast } = useToast();

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  // Active Tab State (supports ?tab= query parameter, defaults to 'Receipt History')
  const tabParam = searchParams.get('tab');
  const initialTab: ActiveTab =
    tabParam === 'outstanding'
      ? 'Outstanding'
      : tabParam === 'schedules'
      ? 'Schedules'
      : tabParam === 'invoices'
      ? 'Invoices'
      : 'Receipt History';

  const [activeTab, setActiveTab] = useState<ActiveTab>(initialTab);

  const handleTabChange = (tab: ActiveTab) => {
    setActiveTab(tab);
    setSearchParams({ tab: tab.toLowerCase().replace(/\s+/g, '-') });
  };

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [modeFilter, setModeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('all');

  // Live Data States
  const [kpis, setKpis] = useState<PaymentDashboardKpis | null>(null);
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [outstanding, setOutstanding] = useState<OutstandingPayment[]>([]);
  const [schedules, setSchedules] = useState<PaymentMilestone[]>([]);
  const [invoices, setInvoices] = useState<InvoiceRecord[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Record Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<PaymentMilestone | null>(null);
  const [recordAmount, setRecordAmount] = useState<string>('');
  const [recordMode, setRecordMode] = useState<PaymentMode>('UPI');
  const [recordRefNo, setRecordRefNo] = useState<string>('');
  const [recordDate, setRecordDate] = useState<string>(() => new Date().toISOString().split('T')[0]);

  // Milestone Info Modal State
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoMilestone, setInfoMilestone] = useState<PaymentMilestone | null>(null);

  // ─── API Data Fetching ─────────────────────────────────────────────────────

  const fetchKpis = useCallback(async () => {
    try {
      const res = await getPaymentDashboardKpis();
      if (res?.data) {
        setKpis(res.data);
      }
    } catch (err) {
      console.error('Failed to load payment KPIs:', err);
    }
  }, []);

  const fetchReceipts = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await listReceipts({ limit: 100 });
      setReceipts(res?.data || []);
    } catch (err: any) {
      console.error('Failed to load receipts:', err);
      addToast({
        title: 'Error Loading Receipts',
        description: err.response?.data?.error?.message || err.message || 'Could not fetch receipts.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const fetchOutstanding = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await listOutstandingPayments({ limit: 100 });
      setOutstanding(res?.data || []);
    } catch (err: any) {
      console.error('Failed to load outstanding payments:', err);
      addToast({
        title: 'Error Loading Outstanding Payments',
        description: err.response?.data?.error?.message || err.message || 'Could not fetch outstanding payments.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const fetchSchedules = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await listPaymentMilestones({ limit: 100 });
      setSchedules(res?.data || []);
    } catch (err: any) {
      console.error('Failed to load payment milestones:', err);
      addToast({
        title: 'Error Loading Schedules',
        description: err.response?.data?.error?.message || err.message || 'Could not fetch milestone schedules.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  const fetchInvoices = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await listInvoices({ limit: 100 });
      setInvoices(res?.data || []);
    } catch (err: any) {
      console.error('Failed to load invoices:', err);
      addToast({
        title: 'Error Loading Invoices',
        description: err.response?.data?.error?.message || err.message || 'Could not fetch invoices.',
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [addToast]);

  // Initial load: KPIs
  useEffect(() => {
    fetchKpis();
  }, [fetchKpis]);

  // Tab change: fetch active tab data
  useEffect(() => {
    if (activeTab === 'Receipt History') {
      fetchReceipts();
    } else if (activeTab === 'Outstanding') {
      fetchOutstanding();
    } else if (activeTab === 'Schedules') {
      fetchSchedules();
    } else if (activeTab === 'Invoices') {
      fetchInvoices();
    }
  }, [activeTab, fetchReceipts, fetchOutstanding, fetchSchedules, fetchInvoices]);

  // ─── Filtered Data ─────────────────────────────────────────────────────────

  const filteredOutstanding = useMemo(() => {
    if (!searchQuery.trim()) return outstanding;
    const q = searchQuery.trim().toLowerCase();
    return outstanding.filter(
      (o) =>
        o.projectName.toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)),
    );
  }, [outstanding, searchQuery]);

  const filteredSchedules = useMemo(() => {
    return schedules.filter((s) => {
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesProject = s.projectName.toLowerCase().includes(q);
        const matchesMilestone = s.milestoneName.toLowerCase().includes(q);
        if (!matchesProject && !matchesMilestone) return false;
      }
      if (statusFilter !== 'all' && s.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [schedules, searchQuery, statusFilter]);

  const filteredReceipts = useMemo(() => {
    let result = receipts.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesProject = r.projectName.toLowerCase().includes(q);
        const matchesDetails = r.projectDetails.toLowerCase().includes(q);
        if (!matchesProject && !matchesDetails) return false;
      }
      if (statusFilter !== 'all' && r.status !== statusFilter) {
        return false;
      }
      if (modeFilter !== 'all' && r.mode !== modeFilter) {
        return false;
      }
      return true;
    });

    if (sortBy === 'amount:desc') {
      result = [...result].sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'amount:asc') {
      result = [...result].sort((a, b) => a.amount - b.amount);
    }

    return result;
  }, [receipts, searchQuery, statusFilter, modeFilter, sortBy]);

  const filteredInvoices = useMemo(() => {
    return invoices.filter((inv) => {
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesProj = inv.projectName.toLowerCase().includes(q);
        const matchesInvNum = inv.invoiceNumber.toLowerCase().includes(q);
        const matchesCust = (inv.customerName || '').toLowerCase().includes(q);
        if (!matchesProj && !matchesInvNum && !matchesCust) return false;
      }
      if (statusFilter !== 'all' && inv.status !== statusFilter) {
        return false;
      }
      return true;
    });
  }, [invoices, searchQuery, statusFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || statusFilter !== 'all' || modeFilter !== 'all' || sortBy !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setModeFilter('all');
    setSortBy('all');
  };

  // ─── Actions Handlers ───────────────────────────────────────────────────────

  const handleShareWhatsApp = async (receipt: PaymentReceipt) => {
    try {
      const res = await shareReceiptWhatsApp(receipt.id);
      if (res?.data?.whatsappUrl) {
        window.open(res.data.whatsappUrl, '_blank', 'noopener,noreferrer');
      }
      addToast({
        title: 'WhatsApp Share Link Generated',
        description: `Receipt for ₹${receipt.amount.toLocaleString('en-IN')} ready to send.`,
        variant: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Share Failed',
        description: err.response?.data?.error?.message || err.message || 'Could not generate WhatsApp share link.',
        variant: 'error',
      });
    }
  };

  const handlePrintReceipt = async (receipt: PaymentReceipt) => {
    try {
      addToast({
        title: 'Downloading Receipt PDF',
        description: `Generating PDF for ${receipt.projectName}...`,
        variant: 'info',
      });
      await downloadReceiptPdf(receipt.id);
      addToast({
        title: 'PDF Downloaded',
        description: 'Payment receipt downloaded successfully.',
        variant: 'success',
      });
    } catch (err: any) {
      addToast({
        title: 'Download Failed',
        description: err.response?.data?.error?.message || err.message || 'Could not download receipt PDF.',
        variant: 'error',
      });
    }
  };

  // ─── Schedule Actions Handlers ──────────────────────────────────────────────

  const handleOpenRecordPayment = (milestone: PaymentMilestone) => {
    setSelectedMilestone(milestone);
    const balanceDue = Math.max(0, milestone.amountDue - (milestone.paidAmount || 0));
    setRecordAmount(String(balanceDue));
    setRecordMode('UPI');
    setRecordRefNo('');
    setRecordDate(new Date().toISOString().split('T')[0]);
    setPaymentModalOpen(true);
  };

  const handleConfirmRecordPayment = async () => {
    if (!selectedMilestone) return;
    const paymentAmt = parseFloat(recordAmount);
    if (isNaN(paymentAmt) || paymentAmt <= 0) {
      addToast({
        title: 'Invalid Amount',
        description: 'Please enter a valid payment amount greater than zero.',
        variant: 'error',
      });
      return;
    }

    if (!selectedMilestone.projectId) {
      addToast({
        title: 'Project Missing',
        description: 'Could not find the associated project ID for this milestone.',
        variant: 'error',
      });
      return;
    }

    try {
      setIsSubmitting(true);
      await recordPayment(selectedMilestone.projectId, {
        milestoneId: selectedMilestone.id,
        amount: paymentAmt,
        mode: recordMode,
        referenceNumber: recordRefNo.trim() || undefined,
        paymentDate: recordDate ? new Date(recordDate).toISOString() : new Date().toISOString(),
      });

      addToast({
        title: 'Payment Recorded',
        description: `₹${paymentAmt.toLocaleString('en-IN')} recorded for ${selectedMilestone.milestoneName} via ${recordMode}.`,
        variant: 'success',
      });

      setPaymentModalOpen(false);
      setSelectedMilestone(null);

      // Refresh data and KPI numbers
      fetchKpis();
      if (activeTab === 'Schedules') fetchSchedules();
      else if (activeTab === 'Receipt History') fetchReceipts();
      else if (activeTab === 'Outstanding') fetchOutstanding();
    } catch (err: any) {
      console.error('Failed to record payment:', err);
      addToast({
        title: 'Record Payment Failed',
        description: err.response?.data?.error?.message || err.message || 'Failed to record payment.',
        variant: 'error',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMilestone = async (milestone: PaymentMilestone) => {
    if (!milestone.projectId) {
      addToast({
        title: 'Cannot Delete Milestone',
        description: 'Missing associated project ID.',
        variant: 'error',
      });
      return;
    }

    if (!window.confirm(`Are you sure you want to delete "${milestone.milestoneName}"?`)) {
      return;
    }

    try {
      await deleteProjectMilestone(milestone.projectId, milestone.id);
      addToast({
        title: 'Milestone Deleted',
        description: `Schedule for "${milestone.milestoneName}" was deleted.`,
        variant: 'info',
      });
      fetchSchedules();
      fetchKpis();
    } catch (err: any) {
      addToast({
        title: 'Delete Failed',
        description: err.response?.data?.error?.message || err.message || 'Could not delete milestone.',
        variant: 'error',
      });
    }
  };

  const handleViewMilestoneInfo = (milestone: PaymentMilestone) => {
    setInfoMilestone(milestone);
    setInfoModalOpen(true);
  };

  // ─── Receipt History Table Columns ──────────────────────────────────────────

  const receiptColumns: Column<PaymentReceipt>[] = [
    {
      key: 'dateLogged',
      header: 'DATE LOGGED',
      sortable: true,
      minWidth: '200px',
      render: (val) => <span className={styles.dateLoggedCell}>{formatDate(val)}</span>,
    },
    {
      key: 'projectName',
      header: 'PROJECT & DETAILS',
      sortable: true,
      minWidth: '240px',
      render: (_, row) => (
        <div className={styles.projectCell}>
          <span className={styles.projectName}>
            {row.projectName}
          </span>
          <span className={styles.projectSubtitle}>{row.projectDetails}</span>
        </div>
      ),
    },
    {
      key: 'amount',
      header: 'AMOUNT',
      sortable: true,
      minWidth: '130px',
      render: (val: number) => (
        <span className={styles.amountCell}>
          ₹{(val || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'mode',
      header: 'MODE',
      minWidth: '100px',
      render: (val: string) => <span className={styles.modeBadge}>{val}</span>,
    },
    {
      key: 'refNo',
      header: 'REF NO',
      minWidth: '100px',
      render: (val: string) => <span className={styles.refNoCell}>{val || '-'}</span>,
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      align: 'right',
      minWidth: '110px',
      render: (_, row) => (
        <div className={styles.actionsCell} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={styles.whatsappBtn}
            onClick={() => handleShareWhatsApp(row)}
            title="Share on WhatsApp"
            aria-label="Share on WhatsApp"
          >
            <WhatsAppIcon />
          </button>
          <button
            type="button"
            className={styles.printBtn}
            onClick={() => handlePrintReceipt(row)}
            title="Download Receipt PDF"
            aria-label="Download Receipt PDF"
          >
            <PrintReceiptIcon />
          </button>
        </div>
      ),
    },
  ];

  // ─── Outstanding Table Columns ──────────────────────────────────────────────

  const outstandingColumns: Column<OutstandingPayment>[] = [
    {
      key: 'projectName',
      header: 'PROJECT NAME',
      sortable: true,
      minWidth: '220px',
      render: (val, row) => (
        <div className={styles.projectCell}>
          <span className={styles.projectName}>{val}</span>
          {row.customerName && (
            <span className={styles.projectSubtitle}>{row.customerName}</span>
          )}
        </div>
      ),
    },
    {
      key: 'totalDue',
      header: 'TOTAL DUE',
      sortable: true,
      minWidth: '140px',
      render: (val: number) => (
        <span className={styles.totalDueCell}>
          ₹{(val || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'received',
      header: 'RECEIVED',
      sortable: true,
      minWidth: '130px',
      render: (val: number) => (
        <span className={styles.receivedCell}>
          ₹{(val || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'balance',
      header: 'BALANCE',
      sortable: true,
      minWidth: '180px',
      render: (val: number, row) => (
        <div className={styles.balanceCell}>
          <span className={styles.balanceAmount}>
            ₹{(val || 0).toLocaleString('en-IN')}
          </span>
          {row.overdueAmount !== undefined && row.overdueAmount > 0 && (
            <span className={styles.overdueLabel}>
              (₹{row.overdueAmount.toLocaleString('en-IN')} Overdue)
            </span>
          )}
        </div>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      minWidth: '130px',
      render: (val: string) => {
        const isCompleted = val === 'Completed';
        const isOverdue = val === 'Overdue';
        const badgeStyle = isCompleted
          ? { color: '#16a34a', borderColor: '#bbf7d0', backgroundColor: '#f0fdf4' }
          : isOverdue
          ? { color: '#dc2626', borderColor: '#fecaca', backgroundColor: '#fef2f2' }
          : undefined;
        return (
          <span className={styles.inProgressBadge} style={badgeStyle}>
            {val}
          </span>
        );
      },
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      align: 'right',
      minWidth: '100px',
      render: () => null,
    },
  ];

  // ─── Schedules Table Columns ────────────────────────────────────────────────

  const scheduleColumns: Column<PaymentMilestone>[] = [
    {
      key: 'projectName',
      header: 'PROJECT & MILESTONE',
      sortable: true,
      minWidth: '240px',
      render: (_, row) => (
        <div className={styles.projectCell}>
          <span className={styles.projectName}>{row.projectName}</span>
          <span className={styles.projectSubtitle}>{row.milestoneName}</span>
        </div>
      ),
    },
    {
      key: 'amountDue',
      header: 'AMOUNT DUE',
      sortable: true,
      minWidth: '160px',
      render: (val: number, row) => (
        <div className={styles.amountDueCell}>
          <span className={styles.amountDueMain}>
            ₹{(val || 0).toLocaleString('en-IN')}
          </span>
          <span className={styles.paidSubtitle}>
            Paid: ₹{(row.paidAmount || 0).toLocaleString('en-IN')}
          </span>
        </div>
      ),
    },
    {
      key: 'dueDate',
      header: 'DUE DATE',
      sortable: true,
      minWidth: '130px',
      render: (val: string) => (
        <span className={styles.dueDateCell}>{formatDateOnly(val)}</span>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      minWidth: '160px',
      render: (val: string) => {
        const badgeClass =
          val === 'Partially Received'
            ? styles['badge--partiallyReceived']
            : val === 'Received'
            ? styles['badge--received']
            : val === 'Overdue'
            ? styles['badge--overdue']
            : styles['badge--pending'];
        return <span className={`${styles.milestoneBadge} ${badgeClass || ''}`}>{val}</span>;
      },
    },
    {
      key: 'actions',
      header: 'ACTIONS',
      align: 'right',
      minWidth: '220px',
      render: (_, row) => (
        <div className={styles.scheduleActionsCell} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            className={styles.infoBtn}
            onClick={() => handleViewMilestoneInfo(row)}
            title="View Details"
            aria-label="View Details"
          >
            <InfoIcon />
          </button>
          {row.status !== 'Received' && (
            <button
              type="button"
              className={styles.recordPaymentBtn}
              onClick={() => handleOpenRecordPayment(row)}
              title="Record Payment"
              aria-label="Record Payment"
            >
              <PlusCircleIcon />
              <span>Record Payment</span>
            </button>
          )}
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={() => handleDeleteMilestone(row)}
            title="Delete Milestone"
            aria-label="Delete Milestone"
          >
            <TrashIcon />
          </button>
        </div>
      ),
    },
  ];

  // ─── Invoices Table Columns ─────────────────────────────────────────────────

  const invoiceColumns: Column<InvoiceRecord>[] = [
    {
      key: 'invoiceNumber',
      header: 'INVOICE #',
      minWidth: '150px',
      render: (val) => (
        <span className={styles.projectName} style={{ fontWeight: 600 }}>
          {val}
        </span>
      ),
    },
    {
      key: 'date',
      header: 'DATE',
      minWidth: '120px',
      render: (val: string, row) => <span>{formatDateOnly(val || row.invoiceDate)}</span>,
    },
    {
      key: 'projectName',
      header: 'PROJECT / CUSTOMER',
      minWidth: '220px',
      render: (val: string, row) => (
        <div className={styles.projectCell}>
          <span>{val}</span>
          {row.customerName && (
            <span className={styles.projectSubtitle}>{row.customerName}</span>
          )}
        </div>
      ),
    },
    {
      key: 'grossAmount',
      header: 'TAXABLE AMT',
      minWidth: '130px',
      render: (val: number) => `₹${(val || 0).toLocaleString('en-IN')}`,
    },
    {
      key: 'gstAmount',
      header: 'GST',
      minWidth: '110px',
      render: (val: number) => `₹${(val || 0).toLocaleString('en-IN')}`,
    },
    {
      key: 'netAmount',
      header: 'TOTAL INVOICE',
      minWidth: '140px',
      render: (val: number) => (
        <span style={{ fontWeight: 700, color: '#16a34a' }}>
          ₹{(val || 0).toLocaleString('en-IN')}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      align: 'right',
      minWidth: '100px',
      render: (val: string) => (
        <span
          className={styles.modeBadge}
          style={{
            color: val === 'Paid' ? '#16a34a' : val === 'Cancelled' ? '#64748b' : '#dc2626',
            borderColor: val === 'Paid' ? '#bbf7d0' : val === 'Cancelled' ? '#cbd5e1' : '#fecaca',
            backgroundColor: val === 'Paid' ? '#f0fdf4' : val === 'Cancelled' ? '#f8fafc' : '#fef2f2',
          }}
        >
          {val}
        </span>
      ),
    },
  ];

  return (
    <AppLayout
      headerProps={{
        title: 'Payments & Invoicing',
        breadcrumbs: [{ label: 'CRM' }, { label: 'Payments & Invoicing' }],
        userName: fullName || user?.email || 'User',
        userRole: user?.role || 'user',
        notificationCount: 3,
      }}
    >
      <div className={styles.page}>
        {/* ── Page Title ──────────────────────────────────────────────────── */}
        <h1 className={styles.pageTitle}>Payments & Invoicing</h1>

        {/* ── Top 3 KPI Metric Cards ──────────────────────────────────────── */}
        <div className={styles.metricCardsGrid}>
          {/* 1. Total Outstanding */}
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Total Outstanding</span>
            <span className={`${styles.metricValue} ${styles['metricValue--dark']}`}>
              ₹{(kpis?.totalOutstanding ?? 0).toLocaleString('en-IN')}
            </span>
          </div>

          {/* 2. Collections This Month */}
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Collections This Month</span>
            <span className={`${styles.metricValue} ${styles['metricValue--green']}`}>
              ₹{(kpis?.collectionsThisMonth ?? 0).toLocaleString('en-IN')}
            </span>
          </div>

          {/* 3. Overdue Receivables */}
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Overdue Receivables</span>
            <span className={`${styles.metricValue} ${styles['metricValue--red']}`}>
              ₹{(kpis?.overdueReceivables ?? 0).toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* ── Search & Filters Bar Card ───────────────────────────────────── */}
        <div className={styles.filterCard}>
          <div className={styles.searchWrap}>
            <SearchInput
              placeholder="Search Project or Customer Name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClear={() => setSearchQuery('')}
              size="sm"
            />
          </div>

          <div className={styles.filtersGroup}>
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
                options={MODE_FILTER_OPTIONS}
                value={modeFilter}
                onChange={(val) => setModeFilter(String(val || 'all'))}
              />
            </div>

            <div className={styles.filterItem}>
              <Dropdown
                size="sm"
                options={SORT_OPTIONS}
                value={sortBy}
                onChange={(val) => setSortBy(String(val || 'all'))}
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
        </div>

        {/* ── Tab Navigation ──────────────────────────────────────────────── */}
        <div className={styles.tabBar}>
          {(['Outstanding', 'Schedules', 'Receipt History', 'Invoices'] as ActiveTab[]).map(
            (tab) => (
              <button
                key={tab}
                type="button"
                className={`${styles.tabBtn} ${
                  activeTab === tab ? styles['tabBtn--active'] : ''
                }`}
                onClick={() => handleTabChange(tab)}
              >
                {tab}
              </button>
            ),
          )}
        </div>

        {/* ── Tab Content Card with Table ─────────────────────────────────── */}
        <div className={styles.contentCard}>
          <div className={styles.cardHeader}>
            <h2 className={styles.cardTitle}>
              {activeTab === 'Outstanding'
                ? 'Outstanding Receivables by Project'
                : activeTab === 'Receipt History'
                ? 'Receipt History'
                : activeTab === 'Schedules'
                ? 'Payment Milestone Schedules'
                : 'Invoices & Billing'}
            </h2>
          </div>

          {activeTab === 'Receipt History' && (
            <Table
              columns={receiptColumns}
              data={filteredReceipts}
              rowKey="id"
              bordered={false}
              isLoading={isLoading}
              emptyText="No payment receipts found."
            />
          )}

          {activeTab === 'Outstanding' && (
            <Table
              columns={outstandingColumns}
              data={filteredOutstanding}
              rowKey="id"
              bordered={false}
              isLoading={isLoading}
              emptyText="No outstanding balances found."
            />
          )}

          {activeTab === 'Schedules' && (
            <Table
              columns={scheduleColumns}
              data={filteredSchedules}
              rowKey="id"
              bordered={false}
              isLoading={isLoading}
              emptyText="No payment milestone schedules found."
            />
          )}

          {activeTab === 'Invoices' && (
            <Table
              columns={invoiceColumns}
              data={filteredInvoices}
              rowKey="id"
              bordered={false}
              isLoading={isLoading}
              emptyText="No invoices found."
            />
          )}
        </div>

        {/* ── Record Payment Modal ─────────────────────────────────────── */}
        <Modal
          isOpen={paymentModalOpen}
          onClose={() => setPaymentModalOpen(false)}
          size="md"
        >
          <Modal.Header
            title="Record Payment"
            onClose={() => setPaymentModalOpen(false)}
          />
          <Modal.Content>
            {selectedMilestone && (
              <div>
                <div className={styles.modalSummaryBox}>
                  <div className={styles.modalSummaryItem}>
                    <span className={styles.modalSummaryLabel}>Project</span>
                    <span className={styles.modalSummaryValue}>
                      {selectedMilestone.projectName}
                    </span>
                  </div>
                  <div className={styles.modalSummaryItem}>
                    <span className={styles.modalSummaryLabel}>Milestone</span>
                    <span className={`${styles.modalSummaryValue} ${styles['modalSummaryValue--accent']}`}>
                      {selectedMilestone.milestoneName}
                    </span>
                  </div>
                  <div className={styles.modalSummaryItem}>
                    <span className={styles.modalSummaryLabel}>Milestone Due</span>
                    <span className={styles.modalSummaryValue}>
                      ₹{selectedMilestone.amountDue.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className={styles.modalSummaryItem}>
                    <span className={styles.modalSummaryLabel}>Remaining Balance</span>
                    <span className={`${styles.modalSummaryValue} ${styles['modalSummaryValue--due']}`}>
                      ₹{Math.max(0, selectedMilestone.amountDue - (selectedMilestone.paidAmount || 0)).toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                <form
                  className={styles.modalForm}
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleConfirmRecordPayment();
                  }}
                >
                  <div className={styles.modalFormField}>
                    <label className={styles.modalFieldLabel}>Payment Amount (₹) *</label>
                    <Input
                      type="number"
                      value={recordAmount}
                      onChange={(e) => setRecordAmount(e.target.value)}
                      placeholder="e.g. 50000"
                      required
                      min="1"
                    />
                  </div>

                  <div className={styles.modalFormField}>
                    <label className={styles.modalFieldLabel}>Payment Mode *</label>
                    <Dropdown
                      options={[
                        { label: 'UPI', value: 'UPI' },
                        { label: 'Net Banking', value: 'Net Banking' },
                        { label: 'Cheque', value: 'Cheque' },
                        { label: 'Cash', value: 'Cash' },
                        { label: 'Credit/Debit Card', value: 'Credit/Debit Card' },
                      ]}
                      value={recordMode}
                      onChange={(val) => setRecordMode(val as PaymentMode)}
                    />
                  </div>

                  <div className={styles.modalFormField}>
                    <label className={styles.modalFieldLabel}>Reference / Transaction ID</label>
                    <Input
                      type="text"
                      value={recordRefNo}
                      onChange={(e) => setRecordRefNo(e.target.value)}
                      placeholder="e.g. UPI-9876543210 or Cheque No."
                    />
                  </div>

                  <div className={styles.modalFormField}>
                    <label className={styles.modalFieldLabel}>Payment Date</label>
                    <Input
                      type="date"
                      value={recordDate}
                      onChange={(e) => setRecordDate(e.target.value)}
                    />
                  </div>

                  <div className={styles.modalFooterActions}>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPaymentModalOpen(false)}
                      disabled={isSubmitting}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary" disabled={isSubmitting}>
                      {isSubmitting ? 'Recording...' : 'Confirm & Record Payment'}
                    </Button>
                  </div>
                </form>
              </div>
            )}
          </Modal.Content>
        </Modal>

        {/* ── Milestone Info Modal ──────────────────────────────────────── */}
        <Modal
          isOpen={infoModalOpen}
          onClose={() => setInfoModalOpen(false)}
          size="sm"
        >
          <Modal.Header
            title="Milestone Details"
            onClose={() => setInfoModalOpen(false)}
          />
          <Modal.Content>
            {infoMilestone && (
              <div>
                <div className={styles.modalSummaryBox} style={{ gridTemplateColumns: '1fr', gap: '14px' }}>
                  <div className={styles.modalSummaryItem}>
                    <span className={styles.modalSummaryLabel}>Project</span>
                    <span className={styles.modalSummaryValue}>{infoMilestone.projectName}</span>
                  </div>
                  <div className={styles.modalSummaryItem}>
                    <span className={styles.modalSummaryLabel}>Milestone</span>
                    <span className={`${styles.modalSummaryValue} ${styles['modalSummaryValue--accent']}`}>
                      {infoMilestone.milestoneName}
                    </span>
                  </div>
                  <div className={styles.modalSummaryItem}>
                    <span className={styles.modalSummaryLabel}>Amount Due</span>
                    <span className={styles.modalSummaryValue}>
                      ₹{infoMilestone.amountDue.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className={styles.modalSummaryItem}>
                    <span className={styles.modalSummaryLabel}>Amount Paid</span>
                    <span className={styles.modalSummaryValue} style={{ color: '#16a34a' }}>
                      ₹{(infoMilestone.paidAmount || 0).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className={styles.modalSummaryItem}>
                    <span className={styles.modalSummaryLabel}>Remaining Balance</span>
                    <span className={`${styles.modalSummaryValue} ${styles['modalSummaryValue--due']}`}>
                      ₹{Math.max(0, infoMilestone.amountDue - (infoMilestone.paidAmount || 0)).toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className={styles.modalSummaryItem}>
                    <span className={styles.modalSummaryLabel}>Target Due Date</span>
                    <span className={styles.modalSummaryValue}>{formatDateOnly(infoMilestone.dueDate)}</span>
                  </div>
                  <div className={styles.modalSummaryItem}>
                    <span className={styles.modalSummaryLabel}>Current Status</span>
                    <span className={styles.modalSummaryValue}>{infoMilestone.status}</span>
                  </div>
                </div>

                <div className={styles.modalFooterActions}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setInfoModalOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            )}
          </Modal.Content>
        </Modal>
      </div>
    </AppLayout>
  );
}

export default PaymentsPage;
