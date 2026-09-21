import { useState, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
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
} from '@/shared/lib/types';
import styles from './payments.module.scss';

// ─── Dummy Data Matching Screenshot Exactly ──────────────────────────────────

const INITIAL_RECEIPTS: PaymentReceipt[] = [
  {
    id: 'rcpt-1',
    dateLogged: '21 Sep 2026, 06:15 PM',
    projectName: 'Arun Sharma - 3kW - 2026',
    projectDetails: 'Delivery Payment',
    amount: 10000,
    mode: 'UPI',
    refNo: '-',
    status: 'Successful',
    customerPhone: '+919012345678',
  },
  {
    id: 'rcpt-2',
    dateLogged: '16 Sep 2026, 04:33 PM',
    projectName: 'Arun Sharma - 3kW - 2026',
    projectDetails: 'Advance Payment',
    amount: 56330,
    mode: 'UPI',
    refNo: '-',
    status: 'Successful',
    customerPhone: '+919012345678',
  },
  {
    id: 'rcpt-3',
    dateLogged: '12 Sep 2026, 02:45 PM',
    projectName: 'Suresh - 5kW - 2026',
    projectDetails: 'Advance Payment',
    amount: 45000,
    mode: 'Net Banking',
    refNo: 'HDFC9821034',
    status: 'Successful',
    customerPhone: '+919876543210',
  },
  {
    id: 'rcpt-4',
    dateLogged: '05 Sep 2026, 11:20 AM',
    projectName: 'Rahul Desai - 4kW - 2026',
    projectDetails: 'Commissioning Payment',
    amount: 25000,
    mode: 'Cheque',
    refNo: 'CHQ-882109',
    status: 'Successful',
    customerPhone: '+919712345678',
  },
];

const INITIAL_OUTSTANDING: OutstandingPayment[] = [
  {
    id: 'out-1',
    projectName: 'Rahul Desai - 3kW - 2026',
    customerName: 'Rahul Desai',
    totalDue: 221100,
    received: 0,
    balance: 221100,
    overdueAmount: 221100,
    status: 'In Progress',
  },
  {
    id: 'out-2',
    projectName: 'Arun Sharma - 3kW - 2026',
    customerName: 'Arun Sharma',
    totalDue: 221100,
    received: 66330,
    balance: 154770,
    overdueAmount: 154770,
    status: 'In Progress',
  },
];

const INITIAL_SCHEDULES: PaymentMilestone[] = [
  {
    id: 'sch-1',
    projectName: 'Arun Sharma - 3kW - 2026',
    milestoneName: 'Delivery Payment',
    amountDue: 110550,
    paidAmount: 10000,
    dueDate: '07 Jul 2026',
    status: 'Partially Received',
  },
  {
    id: 'sch-2',
    projectName: 'Arun Sharma - 3kW - 2026',
    milestoneName: 'Commissioning Payment',
    amountDue: 44220,
    paidAmount: 0,
    dueDate: '07 Jul 2026',
    status: 'Pending',
  },
  {
    id: 'sch-3',
    projectName: 'Rahul Desai - 3kW - 2026',
    milestoneName: 'Delivery Payment',
    amountDue: 110550,
    paidAmount: 0,
    dueDate: '08 Jul 2026',
    status: 'Pending',
  },
  {
    id: 'sch-4',
    projectName: 'Rahul Desai - 3kW - 2026',
    milestoneName: 'Commissioning Payment',
    amountDue: 44220,
    paidAmount: 0,
    dueDate: '08 Jul 2026',
    status: 'Pending',
  },
  {
    id: 'sch-5',
    projectName: 'Rahul Desai - 3kW - 2026',
    milestoneName: 'Advance Payment',
    amountDue: 66330,
    paidAmount: 0,
    dueDate: '08 Jul 2026',
    status: 'Pending',
  },
  {
    id: 'sch-6',
    projectName: 'Arun Sharma - 3kW - 2026',
    milestoneName: 'Advance Payment',
    amountDue: 66330,
    paidAmount: 56330,
    dueDate: '07 Jul 2026',
    status: 'Received',
  },
];

const INITIAL_INVOICES: InvoiceRecord[] = [
  {
    id: 'inv-1',
    invoiceNumber: 'INV-2026-0882',
    date: '21 Sep 2026',
    projectName: 'Arun Sharma - 3kW - 2026',
    customerName: 'Arun Sharma',
    grossAmount: 10000,
    gstAmount: 1800,
    netAmount: 11800,
    status: 'Paid',
  },
  {
    id: 'inv-2',
    invoiceNumber: 'INV-2026-0854',
    date: '16 Sep 2026',
    projectName: 'Arun Sharma - 3kW - 2026',
    customerName: 'Arun Sharma',
    grossAmount: 47737,
    gstAmount: 8593,
    netAmount: 56330,
    status: 'Paid',
  },
];

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
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

// ─── Filter Options ───────────────────────────────────────────────────────────

const STATUS_FILTER_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Successful', value: 'Successful' },
  { label: 'Pending', value: 'Pending' },
  { label: 'Failed', value: 'Failed' },
];

const MODE_FILTER_OPTIONS = [
  { label: 'All Modes', value: 'all' },
  { label: 'UPI', value: 'UPI' },
  { label: 'Net Banking', value: 'Net Banking' },
  { label: 'Cheque', value: 'Cheque' },
  { label: 'Cash', value: 'Cash' },
];

const SORT_OPTIONS = [
  { label: 'Sort By...', value: 'all' },
  { label: 'Latest First', value: 'date:desc' },
  { label: 'Oldest First', value: 'date:asc' },
  { label: 'Amount: High to Low', value: 'amount:desc' },
  { label: 'Amount: Low to High', value: 'amount:asc' },
];

type ActiveTab = 'Outstanding' | 'Schedules' | 'Receipt History' | 'Invoices';

export function PaymentsPage() {
  const navigate = useNavigate();
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

  // Data States
  const [receipts, setReceipts] = useState<PaymentReceipt[]>(INITIAL_RECEIPTS);
  const [outstanding] = useState<OutstandingPayment[]>(INITIAL_OUTSTANDING);
  const [schedules, setSchedules] = useState<PaymentMilestone[]>(INITIAL_SCHEDULES);
  const [invoices] = useState<InvoiceRecord[]>(INITIAL_INVOICES);

  // Record Payment Modal State
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedMilestone, setSelectedMilestone] = useState<PaymentMilestone | null>(null);
  const [recordAmount, setRecordAmount] = useState<string>('');
  const [recordMode, setRecordMode] = useState<PaymentMode>('UPI');
  const [recordRefNo, setRecordRefNo] = useState<string>('');
  const [recordDate, setRecordDate] = useState<string>('22 Sep 2026');

  // Milestone Info Modal State
  const [infoModalOpen, setInfoModalOpen] = useState(false);
  const [infoMilestone, setInfoMilestone] = useState<PaymentMilestone | null>(null);

  // Filtered Outstanding Data
  const filteredOutstanding = useMemo(() => {
    if (!searchQuery.trim()) return outstanding;
    const q = searchQuery.trim().toLowerCase();
    return outstanding.filter(
      (o) =>
        o.projectName.toLowerCase().includes(q) ||
        (o.customerName && o.customerName.toLowerCase().includes(q)),
    );
  }, [outstanding, searchQuery]);

  // Filtered Schedules Data
  const filteredSchedules = useMemo(() => {
    let result = schedules.filter((s) => {
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
    return result;
  }, [schedules, searchQuery, statusFilter]);

  // Filtered Receipts Data
  const filteredReceipts = useMemo(() => {
    let result = receipts.filter((r) => {
      // 1. Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const matchesProject = r.projectName.toLowerCase().includes(q);
        const matchesDetails = r.projectDetails.toLowerCase().includes(q);
        if (!matchesProject && !matchesDetails) return false;
      }
      // 2. Status Filter
      if (statusFilter !== 'all' && r.status !== statusFilter) {
        return false;
      }
      // 3. Mode Filter
      if (modeFilter !== 'all' && r.mode !== modeFilter) {
        return false;
      }
      return true;
    });

    // 4. Sorting
    if (sortBy === 'amount:desc') {
      result = [...result].sort((a, b) => b.amount - a.amount);
    } else if (sortBy === 'amount:asc') {
      result = [...result].sort((a, b) => a.amount - b.amount);
    }

    return result;
  }, [receipts, searchQuery, statusFilter, modeFilter, sortBy]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || statusFilter !== 'all' || modeFilter !== 'all' || sortBy !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setModeFilter('all');
    setSortBy('all');
  };

  // ─── Actions Handlers ───────────────────────────────────────────────────────

  const handleShareWhatsApp = (receipt: PaymentReceipt) => {
    addToast({
      title: 'WhatsApp Receipt Sent',
      description: `Receipt for ₹${receipt.amount.toLocaleString('en-IN')} sent to ${receipt.customerPhone || 'Customer'}.`,
      variant: 'success',
    });
  };

  const handlePrintReceipt = (receipt: PaymentReceipt) => {
    addToast({
      title: 'Preparing Receipt PDF',
      description: `Printing payment receipt for ${receipt.projectName}...`,
      variant: 'info',
    });
  };

  // ─── Schedule Actions Handlers ──────────────────────────────────────────────

  const handleOpenRecordPayment = (milestone: PaymentMilestone) => {
    setSelectedMilestone(milestone);
    const balanceDue = Math.max(0, milestone.amountDue - (milestone.paidAmount || 0));
    setRecordAmount(String(balanceDue));
    setRecordMode('UPI');
    setRecordRefNo('');
    setRecordDate('22 Sep 2026');
    setPaymentModalOpen(true);
  };

  const handleConfirmRecordPayment = () => {
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

    const updatedPaid = (selectedMilestone.paidAmount || 0) + paymentAmt;
    const updatedStatus = updatedPaid >= selectedMilestone.amountDue ? 'Received' : 'Partially Received';

    // 1. Update schedule milestone
    setSchedules((prev) =>
      prev.map((s) =>
        s.id === selectedMilestone.id
          ? {
              ...s,
              paidAmount: updatedPaid,
              status: updatedStatus,
            }
          : s,
      ),
    );

    // 2. Add to receipts
    const newReceipt: PaymentReceipt = {
      id: `rcpt-${Date.now()}`,
      dateLogged: `${recordDate}, 12:00 PM`,
      projectName: selectedMilestone.projectName,
      projectDetails: selectedMilestone.milestoneName,
      amount: paymentAmt,
      mode: recordMode,
      refNo: recordRefNo.trim() || '-',
      status: 'Successful',
    };
    setReceipts((prev) => [newReceipt, ...prev]);

    addToast({
      title: 'Payment Recorded',
      description: `₹${paymentAmt.toLocaleString('en-IN')} recorded for ${selectedMilestone.milestoneName} via ${recordMode}.`,
      variant: 'success',
    });

    setPaymentModalOpen(false);
    setSelectedMilestone(null);
  };

  const handleDeleteMilestone = (milestone: PaymentMilestone) => {
    setSchedules((prev) => prev.filter((s) => s.id !== milestone.id));
    addToast({
      title: 'Milestone Deleted',
      description: `Schedule for "${milestone.milestoneName}" was deleted.`,
      variant: 'info',
    });
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
      render: (val) => <span className={styles.dateLoggedCell}>{val}</span>,
    },
    {
      key: 'projectName',
      header: 'PROJECT & DETAILS',
      sortable: true,
      minWidth: '240px',
      render: (_, row) => (
        <div className={styles.projectCell}>
          <span
            className={styles.projectName}
            onClick={() => navigate('/surveys')}
            role="button"
            tabIndex={0}
          >
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
          ₹{val.toLocaleString('en-IN')}
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
      render: (val: string) => <span className={styles.refNoCell}>{val}</span>,
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
            title="Print Receipt"
            aria-label="Print Receipt"
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
      render: (val) => (
        <span
          className={styles.projectName}
          onClick={() => navigate('/surveys')}
          role="button"
          tabIndex={0}
        >
          {val}
        </span>
      ),
    },
    {
      key: 'totalDue',
      header: 'TOTAL DUE',
      sortable: true,
      minWidth: '140px',
      render: (val: number) => (
        <span className={styles.totalDueCell}>
          ₹{val.toLocaleString('en-IN')}
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
          ₹{val.toLocaleString('en-IN')}
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
            ₹{val.toLocaleString('en-IN')}
          </span>
          <span className={styles.overdueLabel}>
            (₹{(row.overdueAmount || val).toLocaleString('en-IN')} Overdue)
          </span>
        </div>
      ),
    },
    {
      key: 'status',
      header: 'STATUS',
      minWidth: '130px',
      render: (val: string) => (
        <span className={styles.inProgressBadge}>{val}</span>
      ),
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
          <span
            className={styles.projectName}
            onClick={() => navigate('/surveys')}
            role="button"
            tabIndex={0}
          >
            {row.projectName}
          </span>
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
            ₹{val.toLocaleString('en-IN')}
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
      render: (val: string) => <span className={styles.dueDateCell}>{val}</span>,
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
            : styles['badge--pending'];
        return <span className={`${styles.milestoneBadge} ${badgeClass}`}>{val}</span>;
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
    },
    {
      key: 'projectName',
      header: 'PROJECT / CUSTOMER',
      minWidth: '220px',
    },
    {
      key: 'grossAmount',
      header: 'TAXABLE AMT',
      minWidth: '130px',
      render: (val: number) => `₹${val.toLocaleString('en-IN')}`,
    },
    {
      key: 'gstAmount',
      header: 'GST (18%)',
      minWidth: '110px',
      render: (val: number) => `₹${val.toLocaleString('en-IN')}`,
    },
    {
      key: 'netAmount',
      header: 'TOTAL INVOICE',
      minWidth: '140px',
      render: (val: number) => (
        <span style={{ fontWeight: 700, color: '#16a34a' }}>
          ₹{val.toLocaleString('en-IN')}
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
            color: val === 'Paid' ? '#16a34a' : '#dc2626',
            borderColor: val === 'Paid' ? '#bbf7d0' : '#fecaca',
            backgroundColor: val === 'Paid' ? '#f0fdf4' : '#fef2f2',
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
              ₹3,65,870
            </span>
          </div>

          {/* 2. Collections This Month */}
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Collections This Month</span>
            <span className={`${styles.metricValue} ${styles['metricValue--green']}`}>
              ₹66,330
            </span>
          </div>

          {/* 3. Overdue Receivables */}
          <div className={styles.metricCard}>
            <span className={styles.metricLabel}>Overdue Receivables</span>
            <span className={`${styles.metricValue} ${styles['metricValue--red']}`}>
              ₹3,75,870
            </span>
          </div>
        </div>

        {/* ── Search & Filters Bar Card ───────────────────────────────────── */}
        <div className={styles.filterCard}>
          <div className={styles.searchWrap}>
            <SearchInput
              placeholder="Search Project Name..."
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
              emptyText="No payment receipts found matching the selected filters."
            />
          )}

          {activeTab === 'Outstanding' && (
            <Table
              columns={outstandingColumns}
              data={filteredOutstanding}
              rowKey="id"
              bordered={false}
              emptyText="No outstanding balances found."
            />
          )}

          {activeTab === 'Schedules' && (
            <Table
              columns={scheduleColumns}
              data={filteredSchedules}
              rowKey="id"
              bordered={false}
              emptyText="No payment milestone schedules found."
            />
          )}

          {activeTab === 'Invoices' && (
            <Table
              columns={invoiceColumns}
              data={invoices}
              rowKey="id"
              bordered={false}
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
                      type="text"
                      value={recordDate}
                      onChange={(e) => setRecordDate(e.target.value)}
                      placeholder="e.g. 22 Sep 2026"
                    />
                  </div>

                  <div className={styles.modalFooterActions}>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setPaymentModalOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" variant="primary">
                      Confirm &amp; Record Payment
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
                    <span className={styles.modalSummaryValue}>{infoMilestone.dueDate}</span>
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

