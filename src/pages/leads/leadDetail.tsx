import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AppLayout } from '@/shared/components/ui/appLayout/appLayout';
import { LeadCard } from '@/shared/components/ui/leadCard';
import { Button } from '@/shared/components/ui/button';
import { useToast } from '@/shared/components/ui/toast/toast';
import styles from './leadDetail.module.scss';

interface SurveyItem {
  id: string;
  dateTime: string;
  technician: string;
  status: string;
}

interface NoteItem {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

interface LeadDetailData {
  id: string;
  customerName: string;
  location: string;
  billAmount: string;
  status: string;
  followUpDate: string;
  mobileNumber: string;
  email: string;
  leadSource: string;
  roofOwnership: string;
  surveys: SurveyItem[];
  notes: NoteItem[];
}

// ─── Default Mock Data matching screenshot ────────────────────────────────────
const DEFAULT_LEAD: LeadDetailData = {
  id: '1',
  customerName: 'Fuzen',
  location: 'Mumbai, Mumbai, Jharkhand',
  billAmount: '₹10,000 /mo',
  status: 'New',
  followUpDate: '2026-07-01',
  mobileNumber: '+789652010',
  email: 'fuzen@gmail.com',
  leadSource: 'Referral',
  roofOwnership: 'Owned',
  surveys: [
    {
      id: 's1',
      dateTime: '25 Aug 2026, 02:08 PM',
      technician: 'Unassigned',
      status: 'Scheduled',
    },
  ],
  notes: [],
};

const LEADS_DATABASE: Record<string, LeadDetailData> = {
  '1': DEFAULT_LEAD,
  '2': {
    id: '2',
    customerName: 'Rahul Desai',
    location: 'Mumbai, Maharashtra',
    billAmount: '₹3,500 /mo',
    status: 'New',
    followUpDate: '2026-07-01',
    mobileNumber: '+919876543211',
    email: 'rahul.desai@gmail.com',
    leadSource: 'Referral',
    roofOwnership: 'Owned',
    surveys: [],
    notes: [],
  },
  '3': {
    id: '3',
    customerName: 'Sham',
    location: 'Pune, Maharashtra',
    billAmount: '₹1,000 /mo',
    status: 'Contacted',
    followUpDate: '2026-08-29',
    mobileNumber: '+919876543212',
    email: 'sham.k@gmail.com',
    leadSource: 'Website',
    roofOwnership: 'Rented',
    surveys: [],
    notes: [],
  },
};

const TECHNICIANS = [
  'Rajesh Kumar',
  'Sunil Mehta',
  'Vikram Rathore',
  'Deepak Verma',
];

export const LeadDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [lead, setLead] = useState<LeadDetailData>(() => {
    if (id && LEADS_DATABASE[id]) {
      return LEADS_DATABASE[id];
    }
    return DEFAULT_LEAD;
  });

  React.useEffect(() => {
    if (id && LEADS_DATABASE[id]) {
      setLead(LEADS_DATABASE[id]);
    }
  }, [id]);

  const [newSurveyDate, setNewSurveyDate] = useState<string>('');
  const [selectedTechnician, setSelectedTechnician] = useState<string>('');
  const [noteContent, setNoteContent] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);

  // Handle Save from the LeadCard
  const handleSaveLead = ({
    status,
    followUpDate,
  }: {
    status: string;
    followUpDate: string;
  }) => {
    setIsSaving(true);
    setTimeout(() => {
      setLead((prev) => ({ ...prev, status, followUpDate }));
      setIsSaving(false);
      addToast({
        title: 'Lead Updated',
        description: `Status updated to "${status}" and follow-up saved.`,
        variant: 'success',
      });
    }, 500);
  };

  // Handle schedule survey
  const handleScheduleSurvey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSurveyDate) {
      addToast({
        title: 'Survey Date Required',
        description: 'Please select a survey date & time.',
        variant: 'warning',
      });
      return;
    }

    // Format survey date nicely
    const dateObj = new Date(newSurveyDate);
    const formattedDate = !isNaN(dateObj.getTime())
      ? dateObj.toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
          hour12: true,
        })
      : newSurveyDate;

    const newSurvey: SurveyItem = {
      id: `s-${Date.now()}`,
      dateTime: formattedDate,
      technician: selectedTechnician || 'Unassigned',
      status: 'Scheduled',
    };

    setLead((prev) => ({
      ...prev,
      surveys: [newSurvey, ...prev.surveys],
    }));

    setNewSurveyDate('');
    setSelectedTechnician('');

    addToast({
      title: 'Survey Scheduled',
      description: `Survey assigned to ${newSurvey.technician}.`,
      variant: 'success',
    });
  };

  // Handle add note
  const handleAddNote = () => {
    if (!noteContent.trim()) {
      addToast({
        title: 'Empty Note',
        description: 'Please write a note before adding.',
        variant: 'warning',
      });
      return;
    }

    const newNote: NoteItem = {
      id: `n-${Date.now()}`,
      text: noteContent.trim(),
      author: 'Amit Verma',
      createdAt: 'Just now',
    };

    setLead((prev) => ({
      ...prev,
      notes: [newNote, ...prev.notes],
    }));

    setNoteContent('');
    addToast({
      title: 'Note Added',
      description: 'Your note has been saved.',
      variant: 'success',
    });
  };

  return (
    <AppLayout
      headerProps={{
        title: `${lead.customerName} - Lead Details`,
        breadcrumbs: [
          { label: 'CRM' },
          { label: 'Leads' },
          { label: lead.customerName },
        ],
        userName: 'Amit Verma',
        userRole: 'Sales Executive',
        notificationCount: 5,
      }}
    >
      <div className={styles.page}>
        {/* Back navigation */}
        <div className={styles.backNav}>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => navigate('/leads')}
            leftIcon={
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="19" y1="12" x2="5" y2="12" />
                <polyline points="12 19 5 12 12 5" />
              </svg>
            }
          >
            Back to Leads
          </Button>
        </div>

        <div className={styles.layout}>
          {/* ─── Left Column: Main Cards ──────────────────────────────────── */}
          <div className={styles.leftCol}>
            {/* 1. Custom LeadCard Component */}
            <LeadCard
              title={lead.customerName}
              location={lead.location}
              monthlyAmount={lead.billAmount}
              status={lead.status}
              followUpDate={lead.followUpDate}
              isSaving={isSaving}
              onSave={handleSaveLead}
              onEdit={() =>
                addToast({
                  title: 'Edit Lead',
                  description: `Editing ${lead.customerName}`,
                  variant: 'info',
                })
              }
              onCreateQuotation={() =>
                addToast({
                  title: 'Create Quotation',
                  description: `Generating quotation for ${lead.customerName}`,
                  variant: 'info',
                })
              }
              onDelete={() => {
                addToast({
                  title: 'Lead Deleted',
                  description: `${lead.customerName} was removed.`,
                  variant: 'error',
                });
                navigate('/leads');
              }}
            />

            {/* 2. Contact Information Card */}
            <section className={styles.card} aria-label="Contact Information">
              <h3 className={styles.cardTitle}>Contact Information</h3>

              <div className={styles.contactGrid}>
                {/* Mobile Number */}
                <div className={styles.contactField}>
                  <span className={styles.contactLabel}>MOBILE NUMBER</span>
                  <div className={styles.contactValue}>
                    <span>{lead.mobileNumber}</span>
                    <a
                      href={`https://wa.me/${lead.mobileNumber.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.whatsappLink}
                      title="Chat on WhatsApp"
                      aria-label="WhatsApp"
                    >
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="currentColor"
                      >
                        <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.1.824zm-3.423-10.416c-4.415 0-8 3.585-8 8 0 1.411.368 2.736 1.009 3.887l-1.072 3.923 4.025-1.055c1.109.605 2.379.945 3.73.945 4.415 0 8-3.585 8-8s-3.585-8-8-8zm0 18c-1.261 0-2.453-.339-3.488-.934l-.25-.144-2.585.678.69-2.52-.164-.261c-.655-1.042-1.003-2.253-1.003-3.519 0-3.64 2.96-6.6 6.6-6.6s6.6 2.96 6.6 6.6c0 3.64-2.96 6.6-6.6 6.6z" />
                      </svg>
                    </a>
                  </div>
                </div>

                {/* Email Address */}
                <div className={styles.contactField}>
                  <span className={styles.contactLabel}>EMAIL ADDRESS</span>
                  <div className={styles.contactValue}>
                    <span>{lead.email}</span>
                  </div>
                </div>

                {/* Lead Source */}
                <div className={styles.contactField}>
                  <span className={styles.contactLabel}>LEAD SOURCE</span>
                  <div className={styles.contactValue}>
                    <span>{lead.leadSource}</span>
                  </div>
                </div>

                {/* Roof Ownership */}
                <div className={styles.contactField}>
                  <span className={styles.contactLabel}>ROOF OWNERSHIP</span>
                  <div className={styles.contactValue}>
                    <span>{lead.roofOwnership}</span>
                  </div>
                </div>
              </div>
            </section>

            {/* 3. Site Surveys Card */}
            <section className={styles.card} aria-label="Site Surveys">
              <h3 className={styles.cardTitle}>Site Surveys</h3>

              {/* Schedule form */}
              <form onSubmit={handleScheduleSurvey} className={styles.surveyScheduleForm}>
                <div className={styles.surveyInputGroup}>
                  <label htmlFor="survey-date" className={styles.surveyLabel}>
                    SURVEY DATE
                  </label>
                  <input
                    id="survey-date"
                    type="datetime-local"
                    className={styles.surveyDateInput}
                    value={newSurveyDate}
                    onChange={(e) => setNewSurveyDate(e.target.value)}
                  />
                </div>

                <div className={styles.surveyInputGroup}>
                  <label htmlFor="survey-tech" className={styles.surveyLabel}>
                    ASSIGN TECHNICIAN
                  </label>
                  <div className={styles.surveySelectWrapper}>
                    <select
                      id="survey-tech"
                      className={styles.surveySelect}
                      value={selectedTechnician}
                      onChange={(e) => setSelectedTechnician(e.target.value)}
                    >
                      <option value="">Select Technician</option>
                      {TECHNICIANS.map((tech) => (
                        <option key={tech} value={tech}>
                          {tech}
                        </option>
                      ))}
                    </select>
                    <span className={styles.surveySelectArrow} aria-hidden="true">
                      <svg
                        width="14"
                        height="14"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.4"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <polyline points="6 9 12 15 18 9" />
                      </svg>
                    </span>
                  </div>
                </div>

                <Button type="submit" variant="primary" size="md">
                  Schedule
                </Button>
              </form>

              {/* Survey History */}
              <div className={styles.surveyHistorySection}>
                <h4 className={styles.surveyHistoryTitle}>SURVEY HISTORY</h4>

                <div className={styles.tableWrapper}>
                  <table className={styles.surveyTable}>
                    <thead>
                      <tr>
                        <th>DATE & TIME</th>
                        <th>TECHNICIAN</th>
                        <th>STATUS</th>
                        <th>ACTION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {lead.surveys.map((survey) => (
                        <tr key={survey.id}>
                          <td>{survey.dateTime}</td>
                          <td>{survey.technician}</td>
                          <td>
                            <span className={styles.statusPill}>
                              {survey.status}
                            </span>
                          </td>
                          <td>
                            <button
                              type="button"
                              className={styles.actionIconBtn}
                              title="View Survey"
                              onClick={() =>
                                addToast({
                                  title: 'Survey Details',
                                  description: `Survey scheduled for ${survey.dateTime}`,
                                  variant: 'info',
                                })
                              }
                            >
                              <svg
                                width="16"
                                height="16"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2.2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              >
                                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                                <polyline points="15 3 21 3 21 9" />
                                <line x1="10" y1="14" x2="21" y2="3" />
                              </svg>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          </div>

          {/* ─── Right Column: Activity & Notes Card ──────────────────────── */}
          <div className={styles.rightCol}>
            <aside className={styles.notesCard} aria-label="Activity & Notes">
              <h3 className={styles.cardTitle}>Activity & Notes</h3>

              <textarea
                className={styles.notesTextarea}
                placeholder="Add a quick note..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
              />

              <div className={styles.addNoteBtnWrap}>
                <Button
                  type="button"
                  variant="primary"
                  fullWidth
                  size="md"
                  onClick={handleAddNote}
                  leftIcon={
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2.2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  }
                >
                  Add Note
                </Button>
              </div>

              {lead.notes.length === 0 ? (
                <div className={styles.notesEmptyState}>
                  No notes added yet.
                </div>
              ) : (
                <div className={styles.notesList}>
                  {lead.notes.map((n) => (
                    <div key={n.id} className={styles.noteItem}>
                      <p className={styles.noteText}>{n.text}</p>
                      <div className={styles.noteMeta}>
                        <span>{n.author}</span>
                        <span>{n.createdAt}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </aside>
          </div>
        </div>
      </div>
    </AppLayout>
  );
};

export default LeadDetailPage;
