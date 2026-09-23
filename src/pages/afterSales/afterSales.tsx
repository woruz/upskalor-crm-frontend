import { useState, useMemo } from 'react';
import { AppLayout } from '@/shared/components/ui/appLayout/appLayout';
import { SearchInput } from '@/shared/components/ui/input';
import { Dropdown } from '@/shared/components/ui/dropdown';
import { Button } from '@/shared/components/ui/button/button';
import { Modal } from '@/shared/components/ui/modal/modal';
import { NoContentCard } from '@/shared/components/ui/noContentCard/noContentCard';
import { useToast } from '@/shared/components/ui/toast/toast';
import { useAuth } from '@/shared/lib/hooks/useAuth';
import { INITIAL_PROJECTS } from '@/pages/projects/mockProjects';
import {
  INITIAL_SERVICE_TICKETS,
  ISSUE_TYPE_OPTIONS,
  STATUS_OPTIONS,
  TECHNICIAN_OPTIONS,
} from './mockTickets';
import {
  INITIAL_AMC_CONTRACTS,
  AMC_STATUS_OPTIONS,
} from './mockAmc';
import type {
  ServiceTicket,
  TicketStatus,
  IssueType,
} from '@/shared/lib/types/serviceTicket';
import type {
  AmcContract,
  AmcStatus,
} from '@/shared/lib/types/amc';
import styles from './afterSales.module.scss';

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const DocumentIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const TrashIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const SortIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.6, marginLeft: '4px' }}>
    <polyline points="7 15 12 20 17 15" />
    <polyline points="7 9 12 4 17 9" />
  </svg>
);

const formatCurrency = (val: number) => {
  return `₹${Number(val || 0).toLocaleString('en-IN')}`;
};

export function AfterSalesPage() {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [activeTab, setActiveTab] = useState<'service_tickets' | 'amc_contracts'>('service_tickets');
  const [tickets, setTickets] = useState<ServiceTicket[]>(INITIAL_SERVICE_TICKETS);

  // Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [issueTypeFilter, setIssueTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [technicianFilter, setTechnicianFilter] = useState('all');

  // Modals state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [ticketToUpdate, setTicketToUpdate] = useState<ServiceTicket | null>(null);
  const [ticketToDelete, setTicketToDelete] = useState<ServiceTicket | null>(null);

  // Create form state
  const [formProjectId, setFormProjectId] = useState('');
  const [formIssueType, setFormIssueType] = useState('Inverter Fault');
  const [formDescription, setFormDescription] = useState('');
  const [formTechnician, setFormTechnician] = useState('Unassigned');
  const [formStatus, setFormStatus] = useState<TicketStatus>('Open');
  const [formFileName, setFormFileName] = useState<string | null>(null);

  // Update form state
  const [updateStatus, setUpdateStatus] = useState<TicketStatus>('Open');
  const [updateTechnician, setUpdateTechnician] = useState('Unassigned');
  const [updateNotes, setUpdateNotes] = useState('');

  // ─── AMC State ─────────────────────────────────────────────────────────────
  const [amcContracts, setAmcContracts] = useState<AmcContract[]>(INITIAL_AMC_CONTRACTS);
  const [amcSearch, setAmcSearch] = useState('');
  const [amcStatusFilter, setAmcStatusFilter] = useState('all');
  const [amcProjectFilter, setAmcProjectFilter] = useState('all');
  const [amcSortField, setAmcSortField] = useState<'projectName' | 'startDate' | 'endDate' | null>(null);
  const [amcSortOrder, setAmcSortOrder] = useState<'asc' | 'desc'>('asc');

  // AMC Modals
  const [isCreateAmcModalOpen, setIsCreateAmcModalOpen] = useState(false);
  const [amcToEdit, setAmcToEdit] = useState<AmcContract | null>(null);
  const [amcToDelete, setAmcToDelete] = useState<AmcContract | null>(null);

  // Create AMC form
  const [amcFormProjectId, setAmcFormProjectId] = useState('');
  const [amcFormStartDate, setAmcFormStartDate] = useState('');
  const [amcFormEndDate, setAmcFormEndDate] = useState('');
  const [amcFormAnnualValue, setAmcFormAnnualValue] = useState('');
  const [amcFormStatus, setAmcFormStatus] = useState<AmcStatus>('Active');

  // Edit AMC form
  const [editAmcProjectId, setEditAmcProjectId] = useState('');
  const [editAmcStartDate, setEditAmcStartDate] = useState('');
  const [editAmcEndDate, setEditAmcEndDate] = useState('');
  const [editAmcAnnualValue, setEditAmcAnnualValue] = useState('');
  const [editAmcStatus, setEditAmcStatus] = useState<AmcStatus>('Active');

  // Filtered tickets
  const filteredTickets = useMemo(() => {
    return tickets.filter((ticket) => {
      // 1. Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesNo = ticket.ticketNo.toLowerCase().includes(query);
        const matchesProj = ticket.projectName.toLowerCase().includes(query);
        const matchesIssue = ticket.issueType.toLowerCase().includes(query);
        const matchesTech = ticket.assignedTechnician.toLowerCase().includes(query);
        if (!matchesNo && !matchesProj && !matchesIssue && !matchesTech) {
          return false;
        }
      }

      // 2. Issue Type filter
      if (issueTypeFilter !== 'all' && ticket.issueType !== issueTypeFilter) {
        return false;
      }

      // 3. Status filter
      if (statusFilter !== 'all' && ticket.status !== statusFilter) {
        return false;
      }

      // 4. Technician filter
      if (technicianFilter !== 'all' && ticket.assignedTechnician !== technicianFilter) {
        return false;
      }

      return true;
    });
  }, [tickets, searchQuery, issueTypeFilter, statusFilter, technicianFilter]);

  // Handle Create Ticket
  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formProjectId) {
      addToast({
        title: 'Project required',
        description: 'Please select a project for the service ticket.',
        variant: 'error',
      });
      return;
    }

    const selectedProj = INITIAL_PROJECTS.find((p) => p.id === formProjectId);
    const projectName = selectedProj ? selectedProj.name : 'Unknown Project';

    const newTicketNumber = `TCK-2026-${String(tickets.length + 1).padStart(4, '0')}`;
    const today = new Date().toISOString().split('T')[0];

    const newTicket: ServiceTicket = {
      id: `tck-${Date.now()}`,
      ticketNo: newTicketNumber,
      projectId: formProjectId,
      projectName,
      customerName: selectedProj?.customerName,
      issueType: formIssueType as IssueType,
      description: formDescription.trim(),
      assignedTechnician: formTechnician,
      status: formStatus,
      reportedOn: today,
      attachedFiles: formFileName ? [formFileName] : undefined,
    };

    setTickets((prev) => [newTicket, ...prev]);
    setIsCreateModalOpen(false);

    // Reset form
    setFormProjectId('');
    setFormIssueType('Inverter Fault');
    setFormDescription('');
    setFormTechnician('Unassigned');
    setFormStatus('Open');
    setFormFileName(null);

    addToast({
      title: 'Ticket Created',
      description: `Service ticket ${newTicket.ticketNo} has been generated.`,
      variant: 'success',
    });
  };

  // Open Update Modal
  const handleOpenUpdateModal = (ticket: ServiceTicket) => {
    setTicketToUpdate(ticket);
    setUpdateStatus(ticket.status);
    setUpdateTechnician(ticket.assignedTechnician || 'Unassigned');
    setUpdateNotes(ticket.resolutionNotes || '');
  };

  // Save Ticket Update
  const handleSaveTicketUpdate = () => {
    if (!ticketToUpdate) return;

    setTickets((prev) =>
      prev.map((t) =>
        t.id === ticketToUpdate.id
          ? {
              ...t,
              status: updateStatus,
              assignedTechnician: updateTechnician,
              resolutionNotes: updateNotes.trim() || undefined,
              resolvedAt: updateStatus === 'Resolved' ? new Date().toISOString().split('T')[0] : t.resolvedAt,
            }
          : t,
      ),
    );

    addToast({
      title: 'Ticket Updated',
      description: `Service ticket ${ticketToUpdate.ticketNo} status updated to ${updateStatus}.`,
      variant: 'success',
    });

    setTicketToUpdate(null);
  };

  // Confirm Delete Ticket
  const handleConfirmDeleteTicket = () => {
    if (!ticketToDelete) return;

    setTickets((prev) => prev.filter((t) => t.id !== ticketToDelete.id));

    addToast({
      title: 'Ticket Deleted',
      description: `Ticket ${ticketToDelete.ticketNo} has been deleted.`,
      variant: 'success',
    });

    setTicketToDelete(null);
  };

  const getStatusBadgeClass = (status: TicketStatus) => {
    switch (status) {
      case 'Open':
        return styles['statusBadge--open'];
      case 'In Progress':
        return styles['statusBadge--inProgress'];
      case 'Resolved':
        return styles['statusBadge--resolved'];
      case 'Closed':
        return styles['statusBadge--closed'];
      default:
        return '';
    }
  };

  // AMC project filter options
  const amcProjectOptions = useMemo(() => {
    const list = [{ label: 'All Projects', value: 'all' }];
    INITIAL_PROJECTS.forEach((p) => {
      if (!list.some((item) => item.value === p.name)) {
        list.push({ label: p.name, value: p.name });
      }
    });
    return list;
  }, []);

  // Filtered and sorted AMC contracts
  const filteredAmcContracts = useMemo(() => {
    let list = amcContracts.filter((c) => {
      if (amcSearch.trim()) {
        const q = amcSearch.trim().toLowerCase();
        const matchesProj = c.projectName.toLowerCase().includes(q);
        const matchesCust = c.customerName?.toLowerCase().includes(q);
        const matchesVal = String(c.annualValue).includes(q);
        const matchesStatus = c.status.toLowerCase().includes(q);
        if (!matchesProj && !matchesCust && !matchesVal && !matchesStatus) {
          return false;
        }
      }

      if (amcStatusFilter !== 'all' && c.status !== amcStatusFilter) {
        return false;
      }

      if (amcProjectFilter !== 'all' && c.projectName !== amcProjectFilter) {
        return false;
      }

      return true;
    });

    if (amcSortField) {
      list = [...list].sort((a, b) => {
        const valA = (a[amcSortField] || '').toLowerCase();
        const valB = (b[amcSortField] || '').toLowerCase();
        if (valA < valB) return amcSortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return amcSortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return list;
  }, [amcContracts, amcSearch, amcStatusFilter, amcProjectFilter, amcSortField, amcSortOrder]);

  const handleToggleAmcSort = (field: 'projectName' | 'startDate' | 'endDate') => {
    if (amcSortField === field) {
      setAmcSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setAmcSortField(field);
      setAmcSortOrder('asc');
    }
  };

  // Handle Create AMC Contract
  const handleCreateAmc = (e: React.FormEvent) => {
    e.preventDefault();

    if (!amcFormProjectId) {
      addToast({
        title: 'Project required',
        description: 'Please select a project for the AMC contract.',
        variant: 'error',
      });
      return;
    }

    const selectedProj = INITIAL_PROJECTS.find((p) => p.id === amcFormProjectId);
    const projectName = selectedProj ? selectedProj.name : 'Unknown Project';

    const newContract: AmcContract = {
      id: `amc-${Date.now()}`,
      projectId: amcFormProjectId,
      projectName,
      customerName: selectedProj?.customerName,
      startDate: amcFormStartDate,
      endDate: amcFormEndDate,
      annualValue: Number(amcFormAnnualValue) || 0,
      status: amcFormStatus,
      createdAt: new Date().toISOString().split('T')[0],
    };

    setAmcContracts((prev) => [newContract, ...prev]);
    setIsCreateAmcModalOpen(false);

    // Reset create form
    setAmcFormProjectId('');
    setAmcFormStartDate('');
    setAmcFormEndDate('');
    setAmcFormAnnualValue('');
    setAmcFormStatus('Active');

    addToast({
      title: 'AMC Contract Created',
      description: `Contract for ${projectName} created successfully.`,
      variant: 'success',
    });
  };

  // Open Edit AMC
  const handleOpenEditAmc = (contract: AmcContract) => {
    setAmcToEdit(contract);
    setEditAmcProjectId(contract.projectId);
    setEditAmcStartDate(contract.startDate);
    setEditAmcEndDate(contract.endDate);
    setEditAmcAnnualValue(String(contract.annualValue));
    setEditAmcStatus(contract.status);
  };

  // Handle Save Edit AMC
  const handleSaveEditAmc = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amcToEdit) return;

    const selectedProj = INITIAL_PROJECTS.find((p) => p.id === editAmcProjectId);
    const projectName = selectedProj ? selectedProj.name : amcToEdit.projectName;

    setAmcContracts((prev) =>
      prev.map((c) =>
        c.id === amcToEdit.id
          ? {
              ...c,
              projectId: editAmcProjectId,
              projectName,
              customerName: selectedProj?.customerName || c.customerName,
              startDate: editAmcStartDate,
              endDate: editAmcEndDate,
              annualValue: Number(editAmcAnnualValue) || 0,
              status: editAmcStatus,
              updatedAt: new Date().toISOString().split('T')[0],
            }
          : c,
      ),
    );

    addToast({
      title: 'AMC Contract Updated',
      description: `AMC contract for ${projectName} has been updated.`,
      variant: 'success',
    });

    setAmcToEdit(null);
  };

  // Handle Delete AMC
  const handleConfirmDeleteAmc = () => {
    if (!amcToDelete) return;

    setAmcContracts((prev) => prev.filter((c) => c.id !== amcToDelete.id));

    addToast({
      title: 'AMC Contract Deleted',
      description: `Contract for ${amcToDelete.projectName} has been removed.`,
      variant: 'success',
    });

    setAmcToDelete(null);
  };

  const getAmcStatusBadgeClass = (status: AmcStatus | string) => {
    switch (status) {
      case 'Active':
        return styles['statusBadge--active'];
      case 'Pending Renewal':
        return styles['statusBadge--pendingRenewal'];
      case 'Expired':
        return styles['statusBadge--expired'];
      case 'Terminated':
        return styles['statusBadge--terminated'];
      default:
        return '';
    }
  };

  return (
    <AppLayout
      headerProps={{
        title: 'Service and AMC Center',
        breadcrumbs: [{ label: 'CRM' }, { label: 'After Sales' }],
        userName: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'User',
        userRole: user?.role || 'user',
      }}
    >
      <div className={styles.page}>
        {/* ─── Top Header Row ────────────────────────────────────────────── */}
        <div className={styles.headerRow}>
          <h1 className={styles.pageTitle}>Service and AMC Center</h1>

          <div className={styles.headerActions}>
            <Button
              variant="primary"
              size="md"
              leftIcon={<PlusIcon />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              New Ticket
            </Button>
            <Button
              variant="outline"
              size="md"
              leftIcon={<DocumentIcon />}
              onClick={() => {
                setActiveTab('amc_contracts');
                setIsCreateAmcModalOpen(true);
              }}
            >
              New AMC
            </Button>
          </div>
        </div>

        {/* ─── Tabs Navigation ───────────────────────────────────────────── */}
        <nav className={styles.tabsNav} aria-label="Center tabs">
          <button
            type="button"
            className={`${styles.tabBtn} ${
              activeTab === 'service_tickets' ? styles['tabBtn--active'] : ''
            }`}
            onClick={() => setActiveTab('service_tickets')}
          >
            Service Tickets
          </button>
          <button
            type="button"
            className={`${styles.tabBtn} ${
              activeTab === 'amc_contracts' ? styles['tabBtn--active'] : ''
            }`}
            onClick={() => setActiveTab('amc_contracts')}
          >
            AMC Contracts
          </button>
        </nav>

        {/* ─── Service Tickets Content ───────────────────────────────────── */}
        {activeTab === 'service_tickets' ? (
          <div className={styles.card}>
            {/* Filter Bar */}
            <div className={styles.filterRow}>
              <div className={styles.searchWrap}>
                <SearchInput
                  placeholder="Search tickets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onClear={() => setSearchQuery('')}
                  size="md"
                />
              </div>

              <div className={styles.filterItem}>
                <Dropdown
                  options={ISSUE_TYPE_OPTIONS}
                  value={issueTypeFilter}
                  onChange={(val) => setIssueTypeFilter(String(val || 'all'))}
                  size="md"
                />
              </div>

              <div className={styles.filterItem}>
                <Dropdown
                  options={STATUS_OPTIONS}
                  value={statusFilter}
                  onChange={(val) => setStatusFilter(String(val || 'all'))}
                  size="md"
                />
              </div>

              <div className={styles.filterItem}>
                <Dropdown
                  options={TECHNICIAN_OPTIONS}
                  value={technicianFilter}
                  onChange={(val) => setTechnicianFilter(String(val || 'all'))}
                  size="md"
                />
              </div>
            </div>

            {/* Table */}
            {filteredTickets.length > 0 ? (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>
                        TICKET NO <SortIcon />
                      </th>
                      <th>
                        PROJECT <SortIcon />
                      </th>
                      <th>ISSUE TYPE</th>
                      <th>STATUS</th>
                      <th>
                        REPORTED ON <SortIcon />
                      </th>
                      <th>TECHNICIAN</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredTickets.map((t) => (
                      <tr key={t.id}>
                        <td className={styles.ticketNoCell}>{t.ticketNo}</td>
                        <td className={styles.projectNameCell}>{t.projectName}</td>
                        <td>{t.issueType}</td>
                        <td>
                          <span className={`${styles.statusBadge} ${getStatusBadgeClass(t.status)}`}>
                            {t.status}
                          </span>
                        </td>
                        <td>{t.reportedOn}</td>
                        <td>{t.assignedTechnician || 'Unassigned'}</td>
                        <td>
                          <div className={styles.actionCell}>
                            <button
                              type="button"
                              className={styles.updateBtn}
                              onClick={() => handleOpenUpdateModal(t)}
                            >
                              Update
                            </button>
                            <button
                              type="button"
                              className={styles.deleteBtn}
                              onClick={() => setTicketToDelete(t)}
                              title={`Delete ticket ${t.ticketNo}`}
                              aria-label={`Delete ticket ${t.ticketNo}`}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <NoContentCard
                title="No service tickets found"
                description="Try clearing your search or filter options to see all tickets."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSearchQuery('');
                      setIssueTypeFilter('all');
                      setStatusFilter('all');
                      setTechnicianFilter('all');
                    }}
                  >
                    Reset Filters
                  </Button>
                }
              />
            )}
          </div>
        ) : (
          /* ─── AMC Contracts Tab Content (Matching Screenshot 1) ────────── */
          <div className={styles.card}>
            {/* Filter Bar */}
            <div className={styles.filterRow}>
              <div className={styles.searchWrap}>
                <SearchInput
                  placeholder="Search AMCs..."
                  value={amcSearch}
                  onChange={(e) => setAmcSearch(e.target.value)}
                  onClear={() => setAmcSearch('')}
                  size="md"
                />
              </div>

              <div className={styles.filterItem}>
                <Dropdown
                  options={AMC_STATUS_OPTIONS}
                  value={amcStatusFilter}
                  onChange={(val) => setAmcStatusFilter(String(val || 'all'))}
                  size="md"
                />
              </div>

              <div className={styles.filterItem}>
                <Dropdown
                  options={amcProjectOptions}
                  value={amcProjectFilter}
                  onChange={(val) => setAmcProjectFilter(String(val || 'all'))}
                  size="md"
                />
              </div>
            </div>

            {/* Table */}
            {filteredAmcContracts.length > 0 ? (
              <div className={styles.tableContainer}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th
                        className={styles.thSortable}
                        onClick={() => handleToggleAmcSort('projectName')}
                      >
                        PROJECT <SortIcon />
                      </th>
                      <th
                        className={styles.thSortable}
                        onClick={() => handleToggleAmcSort('startDate')}
                      >
                        START DATE <SortIcon />
                      </th>
                      <th
                        className={styles.thSortable}
                        onClick={() => handleToggleAmcSort('endDate')}
                      >
                        END DATE <SortIcon />
                      </th>
                      <th>ANNUAL VALUE</th>
                      <th>STATUS</th>
                      <th>ACTIONS</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAmcContracts.map((c) => (
                      <tr key={c.id}>
                        <td className={styles.projectNameCell}>{c.projectName}</td>
                        <td>{c.startDate}</td>
                        <td>{c.endDate}</td>
                        <td>{formatCurrency(c.annualValue)}</td>
                        <td>
                          <span
                            className={`${styles.statusBadge} ${getAmcStatusBadgeClass(
                              c.status,
                            )}`}
                          >
                            {c.status}
                          </span>
                        </td>
                        <td>
                          <div className={styles.actionCell}>
                            <button
                              type="button"
                              className={styles.editBtn}
                              onClick={() => handleOpenEditAmc(c)}
                              title={`Edit AMC for ${c.projectName}`}
                              aria-label={`Edit AMC for ${c.projectName}`}
                            >
                              <EditIcon />
                            </button>
                            <button
                              type="button"
                              className={styles.deleteBtn}
                              onClick={() => setAmcToDelete(c)}
                              title={`Delete AMC for ${c.projectName}`}
                              aria-label={`Delete AMC for ${c.projectName}`}
                            >
                              <TrashIcon />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <NoContentCard
                title="No AMC contracts found"
                description="Try clearing your search or filter options to see all contracts."
                action={
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setAmcSearch('');
                      setAmcStatusFilter('all');
                      setAmcProjectFilter('all');
                    }}
                  >
                    Reset Filters
                  </Button>
                }
              />
            )}
          </div>
        )}

        {/* ─── MODALS ────────────────────────────────────────────────────── */}

        {/* 1. Create Service Ticket Modal ─────────────────────────────────── */}
        <Modal
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          size="md"
        >
          <Modal.Header
            title="Create Service Ticket"
            className={styles.modalHeaderCustom}
            onClose={() => setIsCreateModalOpen(false)}
          />
          <form onSubmit={handleCreateTicket} className={styles.modalForm}>
            <Modal.Content className={styles.modalBody}>
              {/* Project Select */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Project *</label>
                <select
                  className={styles.formSelect}
                  value={formProjectId}
                  onChange={(e) => setFormProjectId(e.target.value)}
                  required
                >
                  <option value="">Select Project</option>
                  {INITIAL_PROJECTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Issue Type Select */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Issue Type *</label>
                <select
                  className={styles.formSelect}
                  value={formIssueType}
                  onChange={(e) => setFormIssueType(e.target.value)}
                  required
                >
                  <option value="Inverter Fault">Inverter Fault</option>
                  <option value="Physical Damage">Physical Damage</option>
                  <option value="Grid Sync Issue">Grid Sync Issue</option>
                  <option value="Wiring Issue">Wiring Issue</option>
                  <option value="Low Generation">Low Generation</option>
                  <option value="Panel Cleaning">Panel Cleaning</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Description Textarea */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Description</label>
                <textarea
                  className={styles.formTextarea}
                  placeholder="Describe the issue, customer observations, error codes..."
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                />
              </div>

              {/* Assign Technician */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Assign Technician</label>
                <select
                  className={styles.formSelect}
                  value={formTechnician}
                  onChange={(e) => setFormTechnician(e.target.value)}
                >
                  <option value="Unassigned">Unassigned</option>
                  <option value="Ramesh K">Ramesh K</option>
                  <option value="Rajesh Kumar">Rajesh Kumar</option>
                  <option value="Amit Verma">Amit Verma</option>
                  <option value="Priya Sharma">Priya Sharma</option>
                </select>
              </div>

              {/* Status */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status</label>
                <select
                  className={styles.formSelect}
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value as TicketStatus)}
                >
                  <option value="Open">Open</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              {/* Attach Files */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Attach Files</label>
                <div className={styles.fileAttachRow}>
                  <label className={styles.chooseFileBtn}>
                    Choose Files
                    <input
                      type="file"
                      style={{ display: 'none' }}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) setFormFileName(file.name);
                      }}
                    />
                  </label>
                  <span className={styles.fileStatusText}>
                    {formFileName || 'No file chosen'}
                  </span>
                </div>
              </div>
            </Modal.Content>

            <Modal.Footer className={styles.modalFooter}>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="md">
                Create Ticket
              </Button>
            </Modal.Footer>
          </form>
        </Modal>

        {/* 2. Update Service Ticket Modal ──────────────────────────────────── */}
        <Modal
          isOpen={Boolean(ticketToUpdate)}
          onClose={() => setTicketToUpdate(null)}
          size="md"
        >
          <Modal.Header
            title={`Update Ticket: ${ticketToUpdate?.ticketNo || ''}`}
            className={styles.modalHeaderCustom}
            onClose={() => setTicketToUpdate(null)}
          />
          <Modal.Content className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Project</label>
              <input
                type="text"
                className={styles.formInput}
                value={ticketToUpdate?.projectName || ''}
                disabled
                style={{ backgroundColor: '#f8fafc', color: '#64748b' }}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Status</label>
              <select
                className={styles.formSelect}
                value={updateStatus}
                onChange={(e) => setUpdateStatus(e.target.value as TicketStatus)}
              >
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Assign Technician</label>
              <select
                className={styles.formSelect}
                value={updateTechnician}
                onChange={(e) => setUpdateTechnician(e.target.value)}
              >
                <option value="Unassigned">Unassigned</option>
                <option value="Ramesh K">Ramesh K</option>
                <option value="Rajesh Kumar">Rajesh Kumar</option>
                <option value="Amit Verma">Amit Verma</option>
                <option value="Priya Sharma">Priya Sharma</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Resolution Remarks / Action Taken</label>
              <textarea
                className={styles.formTextarea}
                placeholder="Enter actions taken, parts replaced, or site visit feedback..."
                value={updateNotes}
                onChange={(e) => setUpdateNotes(e.target.value)}
              />
            </div>
          </Modal.Content>
          <Modal.Footer className={styles.modalFooter}>
            <Button
              variant="outline"
              size="md"
              onClick={() => setTicketToUpdate(null)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="md" onClick={handleSaveTicketUpdate}>
              Save Updates
            </Button>
          </Modal.Footer>
        </Modal>

        {/* 3. Delete Confirmation Modal ────────────────────────────────────── */}
        <Modal
          isOpen={Boolean(ticketToDelete)}
          onClose={() => setTicketToDelete(null)}
          size="sm"
        >
          <Modal.Header
            title="Delete Service Ticket"
            className={styles.modalHeaderCustom}
            onClose={() => setTicketToDelete(null)}
          />
          <Modal.Content className={styles.modalBody}>
            <p className={styles.deleteWarningText}>
              Are you sure you want to delete service ticket{' '}
              <strong>"{ticketToDelete?.ticketNo}"</strong>? This action cannot be undone.
            </p>
          </Modal.Content>
          <Modal.Footer className={styles.modalFooter}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setTicketToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDeleteTicket}
            >
              Delete Ticket
            </Button>
          </Modal.Footer>
        </Modal>

        {/* 4. Create AMC Contract Modal (Matching Screenshot 2) ───────────── */}
        <Modal
          isOpen={isCreateAmcModalOpen}
          onClose={() => setIsCreateAmcModalOpen(false)}
          size="md"
        >
          <Modal.Header
            title="Create AMC Contract"
            className={styles.modalHeaderCustom}
            onClose={() => setIsCreateAmcModalOpen(false)}
          />
          <form onSubmit={handleCreateAmc} className={styles.modalForm}>
            <Modal.Content className={styles.modalBody}>
              {/* Project Select */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Project</label>
                <select
                  className={styles.formSelect}
                  value={amcFormProjectId}
                  onChange={(e) => setAmcFormProjectId(e.target.value)}
                  required
                >
                  <option value="">Select Project</option>
                  {INITIAL_PROJECTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Start Date & End Date Row */}
              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Start Date</label>
                  <input
                    type="date"
                    className={styles.formInput}
                    value={amcFormStartDate}
                    onChange={(e) => setAmcFormStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>End Date</label>
                  <input
                    type="date"
                    className={styles.formInput}
                    value={amcFormEndDate}
                    onChange={(e) => setAmcFormEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Annual Value (₹) */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Annual Value (₹)</label>
                <input
                  type="number"
                  className={styles.formInput}
                  placeholder="e.g. 40000"
                  value={amcFormAnnualValue}
                  onChange={(e) => setAmcFormAnnualValue(e.target.value)}
                  required
                />
              </div>

              {/* Status */}
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status</label>
                <select
                  className={styles.formSelect}
                  value={amcFormStatus}
                  onChange={(e) => setAmcFormStatus(e.target.value as AmcStatus)}
                >
                  <option value="Active">Active</option>
                  <option value="Pending Renewal">Pending Renewal</option>
                  <option value="Expired">Expired</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
            </Modal.Content>

            <Modal.Footer className={styles.modalFooter}>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsCreateAmcModalOpen(false)}
              >
                Cancel
              </Button>
              <button type="submit" className={styles.greenSaveBtn}>
                Save AMC
              </button>
            </Modal.Footer>
          </form>
        </Modal>

        {/* 5. Edit AMC Contract Modal ─────────────────────────────────────── */}
        <Modal
          isOpen={Boolean(amcToEdit)}
          onClose={() => setAmcToEdit(null)}
          size="md"
        >
          <Modal.Header
            title="Edit AMC Contract"
            className={styles.modalHeaderCustom}
            onClose={() => setAmcToEdit(null)}
          />
          <form onSubmit={handleSaveEditAmc} className={styles.modalForm}>
            <Modal.Content className={styles.modalBody}>
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Project</label>
                <select
                  className={styles.formSelect}
                  value={editAmcProjectId}
                  onChange={(e) => setEditAmcProjectId(e.target.value)}
                  required
                >
                  <option value="">Select Project</option>
                  {INITIAL_PROJECTS.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formRow}>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Start Date</label>
                  <input
                    type="date"
                    className={styles.formInput}
                    value={editAmcStartDate}
                    onChange={(e) => setEditAmcStartDate(e.target.value)}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>End Date</label>
                  <input
                    type="date"
                    className={styles.formInput}
                    value={editAmcEndDate}
                    onChange={(e) => setEditAmcEndDate(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Annual Value (₹)</label>
                <input
                  type="number"
                  className={styles.formInput}
                  placeholder="e.g. 40000"
                  value={editAmcAnnualValue}
                  onChange={(e) => setEditAmcAnnualValue(e.target.value)}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Status</label>
                <select
                  className={styles.formSelect}
                  value={editAmcStatus}
                  onChange={(e) => setEditAmcStatus(e.target.value as AmcStatus)}
                >
                  <option value="Active">Active</option>
                  <option value="Pending Renewal">Pending Renewal</option>
                  <option value="Expired">Expired</option>
                  <option value="Terminated">Terminated</option>
                </select>
              </div>
            </Modal.Content>

            <Modal.Footer className={styles.modalFooter}>
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setAmcToEdit(null)}
              >
                Cancel
              </Button>
              <button type="submit" className={styles.greenSaveBtn}>
                Save AMC
              </button>
            </Modal.Footer>
          </form>
        </Modal>

        {/* 6. Delete AMC Contract Modal ───────────────────────────────────── */}
        <Modal
          isOpen={Boolean(amcToDelete)}
          onClose={() => setAmcToDelete(null)}
          size="sm"
        >
          <Modal.Header
            title="Delete AMC Contract"
            className={styles.modalHeaderCustom}
            onClose={() => setAmcToDelete(null)}
          />
          <Modal.Content className={styles.modalBody}>
            <p className={styles.deleteWarningText}>
              Are you sure you want to delete the AMC contract for{' '}
              <strong>"{amcToDelete?.projectName}"</strong>? This action cannot be undone.
            </p>
          </Modal.Content>
          <Modal.Footer className={styles.modalFooter}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setAmcToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDeleteAmc}
            >
              Delete Contract
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </AppLayout>
  );
}

export default AfterSalesPage;
