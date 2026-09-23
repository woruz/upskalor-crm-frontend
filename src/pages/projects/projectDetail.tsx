import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AppLayout } from '@/shared/components/ui/appLayout/appLayout';
import { Dropdown } from '@/shared/components/ui/dropdown';
import { Badge } from '@/shared/components/ui/badge/badge';
import { Button } from '@/shared/components/ui/button/button';
import { Modal } from '@/shared/components/ui/modal/modal';
import { useToast } from '@/shared/components/ui/toast/toast';
import { useAuth } from '@/shared/lib/hooks/useAuth';
import { ROUTES } from '@/shared/lib/config/routes';
import { INITIAL_PROJECTS } from './mockProjects';
import type {
  Project,
  ProjectMilestone,
  SubsidyDocument,
  PaymentMilestoneItem,
  ProjectStatus,
} from '@/shared/lib/types/project';
import styles from './projectDetail.module.scss';

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const BackArrowIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const LocationPinIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const LandmarkIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="3" y1="21" x2="21" y2="21" />
    <line x1="6" y1="18" x2="6" y2="11" />
    <line x1="10" y1="18" x2="10" y2="11" />
    <line x1="14" y1="18" x2="14" y2="11" />
    <line x1="18" y1="18" x2="18" y2="11" />
    <polygon points="12 2 20 7 4 7" />
  </svg>
);

const ListCheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 6h9M11 12h9M11 18h9" />
    <polyline points="3 5 5 7 8 4" />
    <polyline points="3 11 5 13 8 10" />
    <polyline points="3 17 5 19 8 16" />
  </svg>
);

const WhatsAppIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.058-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.371s-1.041 1.017-1.041 2.479 1.066 2.876 1.214 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
  </svg>
);

const CameraIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
    <circle cx="12" cy="13" r="4" />
  </svg>
);

const ImageIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="8.5" cy="8.5" r="1.5" />
    <polyline points="21 15 16 10 5 21" />
  </svg>
);

const TrashIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const DocumentIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const CheckCircleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

const PackageIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16.5 9.4 7.55 4.24a2 2 0 0 0-2 0L2.5 6.04a2 2 0 0 0-1 1.73v8.46a2 2 0 0 0 1 1.73l3.05 1.8a2 2 0 0 0 2 0l8.95-5.16a2 2 0 0 0 1-1.74V11.14a2 2 0 0 0-1-1.74z" />
    <polyline points="3.29 7 12 12 20.71 7" />
    <line x1="12" y1="22" x2="12" y2="12" />
  </svg>
);

const WalletIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
    <line x1="1" y1="10" x2="23" y2="10" />
  </svg>
);

const PlusIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const EditIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
    <line x1="16" y1="2" x2="16" y2="6" />
    <line x1="8" y1="2" x2="8" y2="6" />
    <line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

const IndianRupeeSymbol = () => (
  <span style={{ fontSize: '13px', fontWeight: 700 }}>₹</span>
);

// ─── Filter & Select Options ─────────────────────────────────────────────────

const MANAGER_OPTIONS = [
  { label: 'Unassigned', value: 'Unassigned' },
  { label: 'Rajesh Kumar', value: 'Rajesh Kumar' },
  { label: 'Priya Sharma', value: 'Priya Sharma' },
  { label: 'Amit Verma', value: 'Amit Verma' },
  { label: 'Sneha Patil', value: 'Sneha Patil' },
];

const STATUS_OPTIONS = [
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Pending Survey', value: 'Pending Survey' },
  { label: 'On Hold', value: 'On Hold' },
  { label: 'Scheduled', value: 'Scheduled' },
];

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  // Find initial project matching ID or default to first project
  const initialData = useMemo(() => {
    return INITIAL_PROJECTS.find((p) => p.id === id) || INITIAL_PROJECTS[0];
  }, [id]);

  // Main local state
  const [project, setProject] = useState<Project>(initialData);
  const [milestones, setMilestones] = useState<ProjectMilestone[]>(
    initialData.milestones || [],
  );
  const [subsidyDocs, setSubsidyDocs] = useState<SubsidyDocument[]>(
    initialData.subsidyDocuments || [],
  );
  const [payments, setPayments] = useState<PaymentMilestoneItem[]>(
    initialData.paymentMilestones || [],
  );

  // Modals state
  const [isAddMilestoneModalOpen, setIsAddMilestoneModalOpen] = useState(false);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('');
  const [newMilestoneDesc, setNewMilestoneDesc] = useState('');

  // Edit milestone state
  const [editingMilestone, setEditingMilestone] = useState<ProjectMilestone | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [editStatus, setEditStatus] = useState<'Done' | 'Pending'>('Pending');

  // Delete milestone state
  const [milestoneToDelete, setMilestoneToDelete] = useState<ProjectMilestone | null>(null);

  const [uploadProofMilestone, setUploadProofMilestone] =
    useState<ProjectMilestone | null>(null);
  const [proofNote, setProofNote] = useState('');

  const [viewProofMilestone, setViewProofMilestone] =
    useState<ProjectMilestone | null>(null);

  const [uploadSubsidyDoc, setUploadSubsidyDoc] =
    useState<SubsidyDocument | null>(null);

  const [viewSubsidyDoc, setViewSubsidyDoc] =
    useState<SubsidyDocument | null>(null);

  const [recordPaymentItem, setRecordPaymentItem] =
    useState<PaymentMilestoneItem | null>(null);
  const [paymentAmountInput, setPaymentAmountInput] = useState('');
  const [paymentNotesInput, setPaymentNotesInput] = useState('');

  const [isSubsidyTrackingModalOpen, setIsSubsidyTrackingModalOpen] =
    useState(false);

  // Derived financial metrics
  const totalProjectValue = project.cost || 221100;
  const totalReceived = useMemo(() => {
    return payments.reduce((acc, curr) => acc + (curr.receivedAmount || 0), 0);
  }, [payments]);
  const balanceOutstanding = Math.max(0, totalProjectValue - totalReceived);

  // ─── Handlers ─────────────────────────────────────────────────────────────

  // Milestone completion toggle
  const handleToggleMilestone = (mId: number | string) => {
    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id === mId) {
          const nextCompleted = !m.completed;
          return {
            ...m,
            completed: nextCompleted,
            status: nextCompleted ? 'Done' : 'Pending',
          };
        }
        return m;
      }),
    );
  };

  // Add custom milestone by assigned personnel
  const handleAddCustomMilestone = () => {
    if (!newMilestoneTitle.trim()) {
      addToast({
        title: 'Title required',
        description: 'Please enter a title for the installation milestone.',
        variant: 'error',
      });
      return;
    }

    const newMilestone: ProjectMilestone = {
      id: `custom-${Date.now()}`,
      title: newMilestoneTitle.trim(),
      description: newMilestoneDesc.trim() || undefined,
      completed: false,
      status: 'Pending',
      isCustom: true,
      createdBy: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || 'Assigned Personnel',
    };

    setMilestones((prev) => [...prev, newMilestone]);
    setNewMilestoneTitle('');
    setNewMilestoneDesc('');
    setIsAddMilestoneModalOpen(false);

    addToast({
      title: 'Milestone Added',
      description: `Custom milestone "${newMilestone.title}" created.`,
      variant: 'success',
    });
  };

  // Edit milestone handlers
  const handleOpenEditMilestone = (m: ProjectMilestone) => {
    setEditingMilestone(m);
    setEditTitle(m.title);
    setEditDesc(m.description || '');
    setEditStatus((m.status as 'Done' | 'Pending') || (m.completed ? 'Done' : 'Pending'));
  };

  const handleSaveEditMilestone = () => {
    if (!editingMilestone) return;
    if (!editTitle.trim()) {
      addToast({
        title: 'Title required',
        description: 'Milestone title cannot be empty.',
        variant: 'error',
      });
      return;
    }

    const isDone = editStatus === 'Done';
    setMilestones((prev) =>
      prev.map((m) =>
        m.id === editingMilestone.id
          ? {
              ...m,
              title: editTitle.trim(),
              description: editDesc.trim() || undefined,
              status: editStatus,
              completed: isDone,
            }
          : m,
      ),
    );

    addToast({
      title: 'Milestone Updated',
      description: `Milestone "${editTitle.trim()}" has been updated.`,
      variant: 'success',
    });

    setEditingMilestone(null);
  };

  // Delete milestone handlers
  const handleOpenDeleteMilestone = (m: ProjectMilestone) => {
    setMilestoneToDelete(m);
  };

  const handleConfirmDeleteMilestone = () => {
    if (!milestoneToDelete) return;

    setMilestones((prev) => prev.filter((item) => item.id !== milestoneToDelete.id));

    addToast({
      title: 'Milestone Deleted',
      description: `Milestone "${milestoneToDelete.title}" has been deleted.`,
      variant: 'success',
    });

    setMilestoneToDelete(null);
  };

  // Remove proof from a milestone
  const handleRemoveProofOnly = (m: ProjectMilestone) => {
    setMilestones((prev) =>
      prev.map((item) =>
        item.id === m.id
          ? { ...item, proofUrl: undefined, proofFileName: undefined }
          : item,
      ),
    );
    addToast({
      title: 'Proof Removed',
      description: `Proof for "${m.title}" has been removed.`,
      variant: 'info',
    });
  };

  // Save proof
  const handleSaveProof = () => {
    if (!uploadProofMilestone) return;

    setMilestones((prev) =>
      prev.map((m) => {
        if (m.id === uploadProofMilestone.id) {
          return {
            ...m,
            proofUrl: 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80',
            proofFileName: `proof_${uploadProofMilestone.id}_verified.jpg`,
            proofUploadedAt: 'Today',
            description: proofNote || m.description,
          };
        }
        return m;
      }),
    );

    addToast({
      title: 'Proof Uploaded',
      description: `Proof uploaded for "${uploadProofMilestone.title}".`,
      variant: 'success',
    });
    setUploadProofMilestone(null);
    setProofNote('');
  };

  // WhatsApp update
  const handleWhatsAppShare = (m: ProjectMilestone) => {
    const text = `*Project Update: ${project.name}*\nMilestone: *${m.title}*\nStatus: *${m.status || (m.completed ? 'Done' : 'Pending')}*\nCustomer: ${project.customerName}\nCapacity: ${project.systemCapacity}`;
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // Subsidy Document Upload simulation
  const handleConfirmDocUpload = () => {
    if (!uploadSubsidyDoc) return;
    setSubsidyDocs((prev) =>
      prev.map((doc) =>
        doc.id === uploadSubsidyDoc.id
          ? {
              ...doc,
              uploaded: true,
              fileName: `${uploadSubsidyDoc.title.toLowerCase().replace(/\s+/g, '_')}_verified.pdf`,
              uploadedAt: 'Today',
            }
          : doc,
      ),
    );
    addToast({
      title: 'Document Uploaded',
      description: `${uploadSubsidyDoc.title} has been successfully uploaded.`,
      variant: 'success',
    });
    setUploadSubsidyDoc(null);
  };

  // Subsidy Document Remove
  const handleDeleteDoc = (docId: string, title: string) => {
    setSubsidyDocs((prev) =>
      prev.map((doc) =>
        doc.id === docId ? { ...doc, uploaded: false, fileName: undefined } : doc,
      ),
    );
    addToast({
      title: 'Document Removed',
      description: `${title} was removed. You can upload a new copy.`,
      variant: 'info',
    });
  };

  // Record Payment
  const handleConfirmPayment = () => {
    if (!recordPaymentItem) return;
    const amount = parseFloat(paymentAmountInput);
    if (isNaN(amount) || amount <= 0) {
      addToast({
        title: 'Invalid Amount',
        description: 'Please enter a valid payment amount.',
        variant: 'error',
      });
      return;
    }

    setPayments((prev) =>
      prev.map((p) => {
        if (p.id === recordPaymentItem.id) {
          const newReceived = (p.receivedAmount || 0) + amount;
          const newStatus =
            newReceived >= p.amountDue ? 'Received' : 'Partially Received';
          return {
            ...p,
            receivedAmount: Math.min(newReceived, p.amountDue),
            status: newStatus,
          };
        }
        return p;
      }),
    );

    addToast({
      title: 'Payment Recorded',
      description: `Payment of ₹${amount.toLocaleString('en-IN')} recorded for ${recordPaymentItem.milestone}.`,
      variant: 'success',
    });

    setRecordPaymentItem(null);
    setPaymentAmountInput('');
    setPaymentNotesInput('');
  };

  return (
    <AppLayout
      headerProps={{
        title: 'Project Details',
        breadcrumbs: [
          { label: 'Projects', path: ROUTES.PROJECTS },
          { label: project.name },
        ],
        userName: [user?.firstName, user?.lastName].filter(Boolean).join(' ') || user?.email || 'User',
        userRole: user?.role || 'user',
      }}
    >
      <div className={styles.page}>
        {/* ─── 1. Top Header Card ────────────────────────────────────────── */}
        <section className={styles.headerCard} aria-label="Project Header">
          <button
            type="button"
            className={styles.backBtn}
            onClick={() => navigate(ROUTES.PROJECTS)}
          >
            <BackArrowIcon /> Back to Projects
          </button>

          <div className={styles.headerMain}>
            <div className={styles.headerLeft}>
              <h1 className={styles.projectTitle}>{project.name}</h1>
              <div className={styles.metaRow}>
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                  <LocationPinIcon /> {project.location || 'Mumbai, Maharashtra'}
                </span>
                <span className={styles.metaSeparator}>|</span>
                <span>{project.systemCapacity}</span>
              </div>

              <button
                type="button"
                className={styles.subsidyTrackingBtn}
                onClick={() => setIsSubsidyTrackingModalOpen(true)}
              >
                <LandmarkIcon /> View Subsidy Tracking
              </button>
            </div>

            <div className={styles.headerRight}>
              <div className={styles.dropdownControl}>
                <span className={styles.dropdownLabel}>Project Manager</span>
                <Dropdown
                  options={MANAGER_OPTIONS}
                  value={project.projectManager}
                  onChange={(val) =>
                    setProject((prev) => ({
                      ...prev,
                      projectManager: String(val || 'Unassigned'),
                    }))
                  }
                  size="sm"
                />
              </div>

              <div className={styles.dropdownControl}>
                <span className={styles.dropdownLabel}>Project Status</span>
                <Dropdown
                  options={STATUS_OPTIONS}
                  value={project.status}
                  onChange={(val) =>
                    setProject((prev) => ({
                      ...prev,
                      status: (val as ProjectStatus) || 'In Progress',
                    }))
                  }
                  size="sm"
                />
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. Installation Milestones Section ─────────────────────────── */}
        <section className={styles.sectionCard} aria-labelledby="milestones-title">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleWrap}>
              <span className={styles.sectionIcon}>
                <ListCheckIcon />
              </span>
              <h2 id="milestones-title" className={styles.sectionTitle}>
                Installation Milestones
              </h2>
            </div>

            <Button
              variant="outline"
              size="sm"
              leftIcon={<PlusIcon />}
              onClick={() => setIsAddMilestoneModalOpen(true)}
            >
              Add Custom Milestone
            </Button>
          </div>

          <div className={styles.milestonesContainer}>
            {milestones.map((m) => {
              const isDone = m.status === 'Done' || m.completed;
              return (
                <div
                  key={m.id}
                  className={`${styles.milestoneRow} ${
                    isDone ? styles['milestoneRow--done'] : ''
                  }`}
                >
                  <div className={styles.milestoneLeft}>
                    <input
                      type="checkbox"
                      className={styles.milestoneCheckbox}
                      checked={isDone}
                      onChange={() => handleToggleMilestone(m.id)}
                      id={`chk-${m.id}`}
                    />
                    <label
                      htmlFor={`chk-${m.id}`}
                      className={`${styles.milestoneTitle} ${
                        isDone ? styles['milestoneTitle--done'] : ''
                      }`}
                    >
                      {m.title}
                    </label>

                    {m.isCustom && (
                      <span className={styles.customTag}>Custom</span>
                    )}

                    <Badge
                      variant={isDone ? 'success' : 'default'}
                      size="sm"
                      pill
                    >
                      {isDone ? 'Done' : 'Pending'}
                    </Badge>

                    <button
                      type="button"
                      className={styles.whatsAppBtn}
                      onClick={() => handleWhatsAppShare(m)}
                      title="Send WhatsApp milestone update"
                      aria-label="Send WhatsApp update"
                    >
                      <WhatsAppIcon />
                    </button>
                  </div>

                  <div className={styles.milestoneRight}>
                    {m.proofUrl ? (
                      <button
                        type="button"
                        className={styles.viewProofBtn}
                        onClick={() => setViewProofMilestone(m)}
                        title="View proof"
                      >
                        <ImageIcon /> View Proof
                      </button>
                    ) : (
                      <button
                        type="button"
                        className={styles.uploadProofBtn}
                        onClick={() => setUploadProofMilestone(m)}
                        title="Upload proof"
                      >
                        <CameraIcon /> Upload Proof
                      </button>
                    )}

                    <button
                      type="button"
                      className={styles.editIconBtn}
                      onClick={() => handleOpenEditMilestone(m)}
                      title="Edit milestone"
                      aria-label={`Edit milestone ${m.title}`}
                    >
                      <EditIcon />
                    </button>

                    <button
                      type="button"
                      className={styles.deleteIconBtn}
                      onClick={() => handleOpenDeleteMilestone(m)}
                      title="Delete milestone"
                      aria-label={`Delete milestone ${m.title}`}
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── 3. Subsidy Documents Section ──────────────────────────────── */}
        <section className={styles.sectionCard} aria-labelledby="subsidy-title">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleWrap}>
              <span className={styles.sectionIcon}>
                <DocumentIcon />
              </span>
              <h2 id="subsidy-title" className={styles.sectionTitle}>
                Subsidy Documents
              </h2>
            </div>
          </div>

          <div className={styles.documentsGrid}>
            {subsidyDocs.map((doc) => (
              <div
                key={doc.id}
                className={`${styles.documentCard} ${
                  doc.uploaded ? styles['documentCard--uploaded'] : ''
                }`}
              >
                <div className={styles.documentHeader}>
                  <span
                    className={
                      doc.uploaded ? styles.docCheckIcon : styles.docFileIcon
                    }
                  >
                    {doc.uploaded ? <CheckCircleIcon /> : <DocumentIcon />}
                  </span>
                  <span>{doc.title}</span>
                </div>

                <div className={styles.documentActionArea}>
                  {doc.uploaded ? (
                    <>
                      <div
                        className={styles.documentViewBox}
                        onClick={() => setViewSubsidyDoc(doc)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') setViewSubsidyDoc(doc);
                        }}
                      >
                        View
                      </div>
                      <button
                        type="button"
                        className={styles.deleteIconBtn}
                        onClick={() => handleDeleteDoc(doc.id, doc.title)}
                        title="Remove document"
                        aria-label="Remove document"
                      >
                        <TrashIcon />
                      </button>
                    </>
                  ) : (
                    <button
                      type="button"
                      className={styles.uploadFileBtn}
                      onClick={() => setUploadSubsidyDoc(doc)}
                    >
                      Upload File
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ─── 4. Materials Section ───────────────────────────────────────── */}
        <section className={styles.sectionCard} aria-labelledby="materials-title">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleWrap}>
              <span className={styles.sectionIcon}>
                <PackageIcon />
              </span>
              <h2 id="materials-title" className={styles.sectionTitle}>
                Materials
              </h2>
            </div>
            <button
              type="button"
              className={styles.sectionLink}
              onClick={() =>
                addToast({
                  title: 'Inventory Module',
                  description: 'Inventory stock manager connected.',
                  variant: 'info',
                })
              }
            >
              Inventory &rarr;
            </button>
          </div>

          <p className={styles.materialsEmptyText}>
            No quoted line items to compare yet, or no stock-tracked catalog items on this quote.
          </p>
        </section>

        {/* ─── 5. Payment Schedule & Collections Section ─────────────────── */}
        <section className={styles.sectionCard} aria-labelledby="payments-title">
          <div className={styles.sectionHeader}>
            <div className={styles.sectionTitleWrap}>
              <span className={styles.sectionIcon}>
                <WalletIcon />
              </span>
              <h2 id="payments-title" className={styles.sectionTitle}>
                Payment Schedule &amp; Collections
              </h2>
            </div>
          </div>

          {/* Metrics summary cards */}
          <div className={styles.metricsGrid}>
            <div className={`${styles.metricCard} ${styles['metricCard--value']}`}>
              <span className={styles.metricLabel}>Total Project Value</span>
              <span className={styles.metricAmount}>
                ₹{totalProjectValue.toLocaleString('en-IN')}
              </span>
            </div>

            <div className={`${styles.metricCard} ${styles['metricCard--received']}`}>
              <span className={styles.metricLabel}>Total Received</span>
              <span className={styles.metricAmount}>
                ₹{totalReceived.toLocaleString('en-IN')}
              </span>
            </div>

            <div className={`${styles.metricCard} ${styles['metricCard--outstanding']}`}>
              <span className={styles.metricLabel}>Balance Outstanding</span>
              <span className={styles.metricAmount}>
                ₹{balanceOutstanding.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          {/* Payments Table */}
          <div className={styles.paymentsTableWrapper}>
            <table className={styles.paymentsTable}>
              <thead>
                <tr>
                  <th>Milestone</th>
                  <th>Amount Due</th>
                  <th>Due Date</th>
                  <th>Status</th>
                  <th>Received</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => {
                  const isPartiallyReceived = p.status === 'Partially Received';
                  const isReceived = p.status === 'Received';
                  const badgeVariant = isReceived
                    ? 'success'
                    : isPartiallyReceived
                      ? 'warning'
                      : 'default';

                  return (
                    <tr key={p.id}>
                      <td className={styles.paymentMilestoneName}>{p.milestone}</td>
                      <td>₹{p.amountDue.toLocaleString('en-IN')}</td>
                      <td>{p.dueDate}</td>
                      <td>
                        <Badge variant={badgeVariant} size="sm" pill>
                          {p.status}
                        </Badge>
                      </td>
                      <td>₹{p.receivedAmount.toLocaleString('en-IN')}</td>
                      <td>
                        <div className={styles.paymentActionGroup}>
                          <button
                            type="button"
                            className={styles.iconActionButton}
                            onClick={() => {
                              setRecordPaymentItem(p);
                              setPaymentAmountInput(String(Math.max(0, p.amountDue - p.receivedAmount)));
                            }}
                            title="Collect / Record payment"
                            aria-label="Collect payment"
                          >
                            <IndianRupeeSymbol />
                          </button>
                          <button
                            type="button"
                            className={styles.iconActionButton}
                            onClick={() =>
                              addToast({
                                title: 'Due Date Scheduled',
                                description: `Due date for ${p.milestone}: ${p.dueDate}`,
                                variant: 'info',
                              })
                            }
                            title="View or schedule due date"
                            aria-label="Calendar view"
                          >
                            <CalendarIcon />
                          </button>
                          <button
                            type="button"
                            className={`${styles.iconActionButton} ${styles['iconActionButton--delete']}`}
                            onClick={() => {
                              setPayments((prev) => prev.filter((item) => item.id !== p.id));
                              addToast({
                                title: 'Payment Milestone Removed',
                                description: `${p.milestone} removed.`,
                                variant: 'info',
                              });
                            }}
                            title="Delete payment item"
                            aria-label="Delete milestone"
                          >
                            <TrashIcon />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* ─── MODALS ────────────────────────────────────────────────────── */}

        {/* 1. Add Custom Milestone Modal */}
        <Modal
          isOpen={isAddMilestoneModalOpen}
          onClose={() => setIsAddMilestoneModalOpen(false)}
          size="md"
        >
          <div className={styles.modalHeader}>
            <h3>Add Custom Installation Milestone</h3>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Milestone Title *</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="e.g. Earthing pit chemical treatment"
                value={newMilestoneTitle}
                onChange={(e) => setNewMilestoneTitle(e.target.value)}
              />
            </div>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description (Optional)</label>
              <textarea
                className={styles.formTextarea}
                placeholder="Details of the task or proof required..."
                value={newMilestoneDesc}
                onChange={(e) => setNewMilestoneDesc(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.modalFooter}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddMilestoneModalOpen(false)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleAddCustomMilestone}>
              Create Milestone
            </Button>
          </div>
        </Modal>

        {/* Edit Milestone Modal */}
        <Modal
          isOpen={Boolean(editingMilestone)}
          onClose={() => setEditingMilestone(null)}
          size="md"
        >
          <div className={styles.modalHeader}>
            <h3>Edit Milestone</h3>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Milestone Title *</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="Enter milestone title..."
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Status</label>
              <select
                className={styles.formInput}
                value={editStatus}
                onChange={(e) => setEditStatus(e.target.value as 'Done' | 'Pending')}
              >
                <option value="Pending">Pending</option>
                <option value="Done">Done</option>
              </select>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Description / Notes (Optional)</label>
              <textarea
                className={styles.formTextarea}
                placeholder="Details of the task or milestone..."
                value={editDesc}
                onChange={(e) => setEditDesc(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.modalFooter}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setEditingMilestone(null)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveEditMilestone}>
              Save Changes
            </Button>
          </div>
        </Modal>

        {/* Delete Milestone Confirmation Modal */}
        <Modal
          isOpen={Boolean(milestoneToDelete)}
          onClose={() => setMilestoneToDelete(null)}
          size="sm"
        >
          <div className={styles.modalHeader}>
            <h3>Delete Milestone</h3>
          </div>
          <div className={styles.modalBody}>
            <p className={styles.deleteWarningText}>
              Are you sure you want to delete milestone{' '}
              <strong>"{milestoneToDelete?.title}"</strong>? This will remove it
              from the installation checklist.
            </p>
          </div>
          <div className={styles.modalFooter}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setMilestoneToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDeleteMilestone}
            >
              Delete Milestone
            </Button>
          </div>
        </Modal>

        {/* 2. Upload Proof Modal */}
        <Modal
          isOpen={Boolean(uploadProofMilestone)}
          onClose={() => setUploadProofMilestone(null)}
          size="md"
        >
          <div className={styles.modalHeader}>
            <h3>Upload Proof: {uploadProofMilestone?.title}</h3>
          </div>
          <div className={styles.modalBody}>
            <div
              style={{
                border: '2px dashed var(--color-border, #cbd5e1)',
                borderRadius: '8px',
                padding: '28px',
                textAlign: 'center',
                backgroundColor: 'var(--color-bg-secondary, #f8fafc)',
                cursor: 'pointer',
              }}
              onClick={handleSaveProof}
            >
              <CameraIcon />
              <p style={{ margin: '8px 0 4px', fontWeight: 600, fontSize: '0.875rem' }}>
                Click or drag &amp; drop proof photo / invoice
              </p>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                PNG, JPG or PDF up to 10MB
              </span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Verification Note</label>
              <input
                type="text"
                className={styles.formInput}
                placeholder="Add technician note or verification comments..."
                value={proofNote}
                onChange={(e) => setProofNote(e.target.value)}
              />
            </div>
          </div>
          <div className={styles.modalFooter}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUploadProofMilestone(null)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSaveProof}>
              Save &amp; Verify Proof
            </Button>
          </div>
        </Modal>

        {/* 3. View Proof Modal */}
        <Modal
          isOpen={Boolean(viewProofMilestone)}
          onClose={() => setViewProofMilestone(null)}
          size="md"
        >
          <div className={styles.modalHeader}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <h3>Proof: {viewProofMilestone?.title}</h3>
              <Badge variant="success" size="sm" pill>Verified</Badge>
            </div>
          </div>
          <div className={styles.modalBody}>
            <div style={{ borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
              <img
                src={viewProofMilestone?.proofUrl || 'https://images.unsplash.com/photo-1509391365360-2e959784a276?w=600&auto=format&fit=crop&q=80'}
                alt="Installation proof verification"
                style={{ width: '100%', maxHeight: '320px', objectFit: 'cover', display: 'block' }}
              />
            </div>
            <div>
              <p style={{ margin: '0 0 4px', fontSize: '0.875rem', fontWeight: 600 }}>
                {viewProofMilestone?.proofFileName || 'proof_document.pdf'}
              </p>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#64748b' }}>
                {viewProofMilestone?.description || 'Installation inspection verified on site.'}
              </p>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (viewProofMilestone) {
                  handleRemoveProofOnly(viewProofMilestone);
                  setViewProofMilestone(null);
                }
              }}
            >
              Remove Proof
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setViewProofMilestone(null)}
            >
              Close
            </Button>
          </div>
        </Modal>

        {/* 4. Subsidy Document Upload Modal */}
        <Modal
          isOpen={Boolean(uploadSubsidyDoc)}
          onClose={() => setUploadSubsidyDoc(null)}
          size="sm"
        >
          <div className={styles.modalHeader}>
            <h3>Upload {uploadSubsidyDoc?.title}</h3>
          </div>
          <div className={styles.modalBody}>
            <div
              style={{
                border: '2px dashed var(--color-border, #cbd5e1)',
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
                backgroundColor: 'var(--color-bg-secondary, #f8fafc)',
                cursor: 'pointer',
              }}
              onClick={handleConfirmDocUpload}
            >
              <DocumentIcon />
              <p style={{ margin: '8px 0 4px', fontWeight: 600, fontSize: '0.875rem' }}>
                Select {uploadSubsidyDoc?.title} File
              </p>
              <span style={{ fontSize: '0.75rem', color: '#64748b' }}>
                PDF or JPG accepted (Max 5MB)
              </span>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setUploadSubsidyDoc(null)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmDocUpload}>
              Upload Document
            </Button>
          </div>
        </Modal>

        {/* 5. View Subsidy Document Modal */}
        <Modal
          isOpen={Boolean(viewSubsidyDoc)}
          onClose={() => setViewSubsidyDoc(null)}
          size="md"
        >
          <div className={styles.modalHeader}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <h3>{viewSubsidyDoc?.title}</h3>
              <Badge variant="success" size="sm" pill>Verified on DBT</Badge>
            </div>
          </div>
          <div className={styles.modalBody}>
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '24px',
                textAlign: 'center',
              }}
            >
              <DocumentIcon />
              <p style={{ margin: '12px 0 4px', fontWeight: 700, fontSize: '0.9375rem' }}>
                {viewSubsidyDoc?.fileName || `${viewSubsidyDoc?.title.toLowerCase()}_file.pdf`}
              </p>
              <span style={{ fontSize: '0.8125rem', color: '#16a34a', fontWeight: 600 }}>
                Verified &amp; Accepted by Discom Authority
              </span>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setViewSubsidyDoc(null)}
            >
              Close
            </Button>
          </div>
        </Modal>

        {/* 6. Record Payment Modal */}
        <Modal
          isOpen={Boolean(recordPaymentItem)}
          onClose={() => setRecordPaymentItem(null)}
          size="sm"
        >
          <div className={styles.modalHeader}>
            <h3>Collect Payment: {recordPaymentItem?.milestone}</h3>
          </div>
          <div className={styles.modalBody}>
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Amount Due</label>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#0f172a' }}>
                ₹{recordPaymentItem?.amountDue.toLocaleString('en-IN')}
              </span>
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Amount Received (₹) *</label>
              <input
                type="number"
                className={styles.formInput}
                value={paymentAmountInput}
                onChange={(e) => setPaymentAmountInput(e.target.value)}
                placeholder="e.g. 50000"
              />
            </div>

            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Payment Note / Ref No.</label>
              <input
                type="text"
                className={styles.formInput}
                value={paymentNotesInput}
                onChange={(e) => setPaymentNotesInput(e.target.value)}
                placeholder="NEFT/UPI Ref, Bank, Cheque No."
              />
            </div>
          </div>
          <div className={styles.modalFooter}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setRecordPaymentItem(null)}
            >
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleConfirmPayment}>
              Save Payment
            </Button>
          </div>
        </Modal>

        {/* 7. Subsidy Tracking Modal */}
        <Modal
          isOpen={isSubsidyTrackingModalOpen}
          onClose={() => setIsSubsidyTrackingModalOpen(false)}
          size="md"
        >
          <div className={styles.modalHeader}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
              <h3>National Portal Subsidy Tracking</h3>
              <Badge variant="info" pill>In Progress</Badge>
            </div>
          </div>
          <div className={styles.modalBody}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                background: '#f8fafc',
                padding: '16px',
                borderRadius: '8px',
                border: '1px solid #e2e8f0',
              }}
            >
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Application No.
                </span>
                <p style={{ margin: '2px 0 0', fontWeight: 700, fontSize: '0.875rem' }}>
                  MNRE-MH-2026-09412
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Beneficiary
                </span>
                <p style={{ margin: '2px 0 0', fontWeight: 700, fontSize: '0.875rem' }}>
                  {project.customerName}
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Approved Subsidy
                </span>
                <p style={{ margin: '2px 0 0', fontWeight: 700, fontSize: '0.875rem', color: '#16a34a' }}>
                  ₹78,000 (Central DBT)
                </p>
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase' }}>
                  Aadhaar Seeding
                </span>
                <p style={{ margin: '2px 0 0', fontWeight: 700, fontSize: '0.875rem', color: '#16a34a' }}>
                  Active (NPCI Linked)
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '0.8125rem', fontWeight: 700 }}>DBT Processing Steps</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#16a34a' }}>
                <CheckCircleIcon /> 1. Application submission &amp; Discom feasibility clearance
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#16a34a' }}>
                <CheckCircleIcon /> 2. Installation agreement upload &amp; vendor selection
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#2563eb', fontWeight: 600 }}>
                • 3. Net meter installation &amp; Discom inspection certificate (Awaiting)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8125rem', color: '#94a3b8' }}>
                • 4. Final subsidy release to bank account via DBT
              </div>
            </div>
          </div>
          <div className={styles.modalFooter}>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsSubsidyTrackingModalOpen(false)}
            >
              Close
            </Button>
          </div>
        </Modal>
      </div>
    </AppLayout>
  );
}

export default ProjectDetailPage;
