import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router';
import { AppLayout } from '@/shared/components/ui/appLayout/appLayout';
import { LeadCard } from '@/shared/components/ui/leadCard';
import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge/badge';
import { Spinner } from '@/shared/components/ui/spinner/spinner';
import { useToast } from '@/shared/components/ui/toast/toast';
import { useAuth } from '@/shared/lib/hooks/useAuth';
import {
  getLeadById,
  updateLead,
  deleteLead,
  getLeadActivities,
} from '@/shared/lib/api/leadsApi';
import { listQuotations } from '@/shared/lib/api/quotationsApi';
import { getLeadSurveys, createSurvey } from '@/shared/lib/api/surveysApi';
import { extractApiError } from '@/shared/lib/api/authApi';
import { surveyService } from '@/shared/lib/services/surveyService';
import type { Lead, LeadActivity, LeadStatus, Quotation, SiteSurvey } from '@/shared/lib/types';
import { ROUTES } from '@/shared/lib/config/routes';
import styles from './leadDetail.module.scss';

const BACKEND_STATUS_OPTIONS: { label: string; value: LeadStatus }[] = [
  { label: 'New', value: 'NEW' },
  { label: 'Contacted', value: 'CONTACTED' },
  { label: 'Follow Up', value: 'FOLLOW_UP' },
  { label: 'Interested', value: 'INTERESTED' },
  { label: 'Survey Scheduled', value: 'SURVEY_SCHEDULED' },
  { label: 'Not Interested', value: 'NOT_INTERESTED' },
  { label: 'Converted', value: 'CONVERTED' },
  { label: 'Lost', value: 'LOST' },
];

const TECHNICIANS = [
  'Rajesh Kumar',
  'Vikram Singh',
  'Amit Patel',
  'Unassigned',
];

const formatActivityType = (type: string): string => {
  return type
    .replace(/^LEAD_/, '')
    .replace(/_/g, ' ')
    .toLowerCase()
    .replace(/\b\w/g, (c) => c.toUpperCase());
};

const activityBadgeVariant = (type: string) => {
  switch (type) {
    case 'LEAD_CREATED':
      return 'success' as const;
    case 'LEAD_STATUS_CHANGED':
      return 'primary' as const;
    case 'LEAD_ASSIGNED':
    case 'LEAD_REASSIGNED':
      return 'info' as const;
    case 'LEAD_DELETED':
      return 'error' as const;
    default:
      return 'secondary' as const;
  }
};

export const LeadDetailPage: React.FC = () => {
  const { user } = useAuth();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  const [lead, setLead] = useState<Lead | null>(null);
  const [activities, setActivities] = useState<LeadActivity[]>([]);
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [leadSurveys, setLeadSurveys] = useState<SiteSurvey[]>([]);
  const [newSurveyDate, setNewSurveyDate] = useState('');
  const [selectedTechnician, setSelectedTechnician] = useState('');
  const [isSchedulingSurvey, setIsSchedulingSurvey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // ── Fetch lead, activities & quotations ─────────────────────────────────────

  const loadLead = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);

    try {
      const [leadRes, actRes, quoteRes, surveyRes] = await Promise.all([
        getLeadById(id),
        getLeadActivities(id, 1, 50).catch(() => ({ data: [] })),
        listQuotations({ leadId: id, limit: 50 }).catch(() => ({ data: [] })),
        getLeadSurveys(id).catch(() => ({ data: [] })),
      ]);

      setLead(leadRes.data);
      setActivities(actRes.data || []);
      setQuotations(quoteRes.data || []);
      const surveysList = surveyRes.data?.length
        ? surveyRes.data
        : surveyService.getSurveysForLead(id, leadRes.data.customerName);
      setLeadSurveys(surveysList);
    } catch (err) {
      const msg = extractApiError(err);
      setError(msg);
      addToast({
        title: 'Lead Not Found',
        description: msg,
        variant: 'error',
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, addToast]);

  useEffect(() => {
    loadLead();
  }, [loadLead]);

  // ── Handlers ───────────────────────────────────────────────────────────────

  const formatSurveyDateTime = (isoOrStr: string) => {
    if (!isoOrStr) return '-';
    const d = new Date(isoOrStr);
    if (isNaN(d.getTime())) return isoOrStr;
    const datePart = d.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timePart = d.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${datePart}, ${timePart}`;
  };

  const handleScheduleSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lead) return;
    if (!newSurveyDate) {
      addToast({
        title: 'Survey Date Required',
        description: 'Please select a date and time for the survey.',
        variant: 'error',
      });
      return;
    }

    setIsSchedulingSurvey(true);
    try {
      // 1. Create survey via backend API with fallback
      let newSurvey: SiteSurvey;
      let warningMsg: string | undefined;

      try {
        const res = await createSurvey({
          leadId: lead.id,
          customerName: lead.customerName,
          mobileNumber: lead.mobileNumber,
          address: [lead.address, lead.city, lead.state].filter(Boolean).join(', '),
          surveyDateTime: new Date(newSurveyDate).toISOString(),
          assignedTech: selectedTechnician || 'Unassigned',
        });
        newSurvey = res.data;
        warningMsg = res.warning;
      } catch {
        // Fallback to local storage if endpoint is not yet connected
        newSurvey = surveyService.addSurvey({
          customerName: lead.customerName,
          leadId: lead.id,
          surveyDateTime: newSurveyDate,
          assignedTech: selectedTechnician || 'Unassigned',
          status: 'Scheduled',
          mobileNumber: lead.mobileNumber,
          address: [lead.address, lead.city, lead.state].filter(Boolean).join(', '),
        });
      }

      if (warningMsg) {
        addToast({
          title: 'Technician Overlap Warning',
          description: warningMsg,
          variant: 'warning',
        });
      }

      // 2. Automatically update lead status to SURVEY_SCHEDULED
      try {
        const response = await updateLead(lead.id, {
          status: 'SURVEY_SCHEDULED',
        });
        setLead(response.data);
      } catch (apiErr) {
        // Optimistic update if backend has not yet updated its enum
        setLead((prev) => (prev ? { ...prev, status: 'SURVEY_SCHEDULED' } : prev));
      }

      setLeadSurveys((prev) => [newSurvey, ...prev.filter((s) => s.id !== newSurvey.id)]);
      setNewSurveyDate('');
      setSelectedTechnician('');

      // Refresh activity timeline
      const actRes = await getLeadActivities(lead.id, 1, 50).catch(() => ({
        data: [],
      }));
      setActivities(actRes.data || []);

      addToast({
        title: 'Survey Scheduled',
        description: `Survey scheduled for ${formatSurveyDateTime(newSurveyDate)}. Lead moved to "Survey Scheduled".`,
        variant: 'success',
      });
    } catch (err) {
      const msg = extractApiError(err);
      addToast({
        title: 'Failed to Schedule Survey',
        description: msg,
        variant: 'error',
      });
    } finally {
      setIsSchedulingSurvey(false);
    }
  };

  const handleSaveLead = async ({
    status,
    followUpDate,
  }: {
    status: string;
    followUpDate: string;
  }) => {
    if (!lead) return;
    setIsSaving(true);

    try {
      const isoDate = followUpDate
        ? new Date(followUpDate).toISOString()
        : lead.followUpDate;

      const response = await updateLead(lead.id, {
        status: status as LeadStatus,
        followUpDate: isoDate,
      });

      setLead(response.data);

      // Refresh activities to show the update log
      const actRes = await getLeadActivities(lead.id, 1, 50).catch(() => ({
        data: [],
      }));
      setActivities(actRes.data || []);

      addToast({
        title: 'Lead Updated',
        description: `Status updated to "${status}" and follow-up saved.`,
        variant: 'success',
      });
    } catch (err) {
      const msg = extractApiError(err);
      addToast({
        title: 'Update Failed',
        description: msg,
        variant: 'error',
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!lead) return;
    try {
      await deleteLead(lead.id);
      addToast({
        title: 'Lead Deleted',
        description: `${lead.customerName} has been removed.`,
        variant: 'success',
      });
      navigate('/leads');
    } catch (err) {
      const msg = extractApiError(err);
      addToast({
        title: 'Delete Failed',
        description: msg,
        variant: 'error',
      });
    }
  };

  // ── Loading & Error states ─────────────────────────────────────────────────

  if (isLoading) {
    return (
      <AppLayout
        headerProps={{
          title: 'Lead Details',
          breadcrumbs: [{ label: 'CRM' }, { label: 'Leads' }],
          userName: fullName || user?.email || 'User',
          userRole: user?.role || 'user',
        }}
      >
        <div className={styles.loadingCenter}>
          <Spinner size="lg" />
          <p>Loading lead details…</p>
        </div>
      </AppLayout>
    );
  }

  if (error || !lead) {
    return (
      <AppLayout
        headerProps={{
          title: 'Lead Details',
          breadcrumbs: [{ label: 'CRM' }, { label: 'Leads' }],
          userName: fullName || user?.email || 'User',
          userRole: user?.role || 'user',
        }}
      >
        <div className={styles.loadingCenter}>
          <h3>Unable to load lead</h3>
          <p style={{ color: 'var(--color-text-secondary)' }}>
            {error || 'The requested lead does not exist or has been deleted.'}
          </p>
          <Button variant="primary" size="md" onClick={() => navigate('/leads')}>
            Back to Leads
          </Button>
        </div>
      </AppLayout>
    );
  }

  const locationString = [lead.city, lead.state].filter(Boolean).join(', ');
  const followUpDateInput = lead.followUpDate
    ? lead.followUpDate.split('T')[0]
    : '';

  return (
    <AppLayout
      headerProps={{
        title: `${lead.customerName} - Lead Details`,
        breadcrumbs: [
          { label: 'CRM' },
          { label: 'Leads' },
          { label: lead.customerName },
        ],
        userName: fullName || user?.email || 'User',
        userRole: user?.role || 'user',
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
              location={locationString || undefined}
              monthlyAmount={
                lead.monthlyBillAmount
                  ? `₹${lead.monthlyBillAmount.toLocaleString('en-IN')} / mo`
                  : undefined
              }
              status={lead.status}
              statusOptions={BACKEND_STATUS_OPTIONS}
              followUpDate={followUpDateInput}
              isSaving={isSaving}
              onSave={handleSaveLead}
              onEdit={() =>
                addToast({
                  title: 'Edit Lead',
                  description: `Editing ${lead.customerName}`,
                  variant: 'info',
                })
              }
              onCreateQuotation={() => navigate(`${ROUTES.CREATE_QUOTATION}?leadId=${lead.id}`)}
              onDelete={handleDelete}
            />

            {/* 2. Contact & Property Information Card */}
            <section className={styles.card} aria-label="Contact Information">
              <h3 className={styles.cardTitle}>Contact & Property Information</h3>

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
                    <span>{lead.email || '-'}</span>
                  </div>
                </div>

                {/* Address */}
                <div className={styles.contactField}>
                  <span className={styles.contactLabel}>ADDRESS</span>
                  <div className={styles.contactValue}>
                    <span>{lead.address || '-'}</span>
                  </div>
                </div>

                {/* Lead Source */}
                <div className={styles.contactField}>
                  <span className={styles.contactLabel}>LEAD SOURCE</span>
                  <div className={styles.contactValue}>
                    <span>{lead.leadSource || '-'}</span>
                  </div>
                </div>

                {/* Roof Ownership */}
                <div className={styles.contactField}>
                  <span className={styles.contactLabel}>ROOF OWNERSHIP</span>
                  <div className={styles.contactValue}>
                    <span>{lead.roofOwnership || '-'}</span>
                  </div>
                </div>

                {/* Roof Type */}
                <div className={styles.contactField}>
                  <span className={styles.contactLabel}>ROOF TYPE</span>
                  <div className={styles.contactValue}>
                    <span>{lead.roofType || '-'}</span>
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
                    required
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

                <Button
                  type="submit"
                  variant="primary"
                  className={styles.scheduleBtn}
                  disabled={isSchedulingSurvey}
                >
                  {isSchedulingSurvey ? 'Scheduling…' : 'Schedule'}
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
                      {leadSurveys.length === 0 ? (
                        <tr>
                          <td colSpan={4} style={{ textAlign: 'center', color: 'var(--color-text-secondary)', padding: '24px' }}>
                            No surveys scheduled yet. Use the form above to schedule a site survey.
                          </td>
                        </tr>
                      ) : (
                        leadSurveys.map((survey) => (
                          <tr key={survey.id}>
                            <td>{formatSurveyDateTime(survey.surveyDateTime)}</td>
                            <td>{survey.assignedTech || 'Unassigned'}</td>
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
                                onClick={() => navigate(`/surveys/${survey.id}`)}
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
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            {/* 4. Solar Quotations Card */}
            <section className={styles.card} aria-label="Quotations">
              <div className={styles.quotesHeader}>
                <h3 className={styles.cardTitle} style={{ margin: 0 }}>
                  Solar Quotations ({quotations.length})
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => navigate(`${ROUTES.CREATE_QUOTATION}?leadId=${lead?.id || id}`)}
                  leftIcon={
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <line x1="12" y1="5" x2="12" y2="19" />
                      <line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                  }
                >
                  Create Quotation
                </Button>
              </div>

              {quotations.length === 0 ? (
                <div style={{ color: 'var(--color-text-secondary)', fontSize: '0.875rem' }}>
                  No quotations generated yet. Click &quot;Create Quotation&quot; to prepare a proposal.
                </div>
              ) : (
                <div className={styles.quotesList}>
                  {quotations.map((q) => (
                    <div key={q.id} className={styles.quoteItem}>
                      <div className={styles.quoteItemLeft}>
                        <span
                          className={styles.quoteItemNumber}
                          onClick={() => navigate(`/quotations/${q.id}`)}
                        >
                          {q.quoteNumber}
                        </span>
                        <div className={styles.quoteItemDetails}>
                          <span>{q.systemSizeKw} kW {q?.systemType?.replace('_', ' ') || 'ON GRID'}</span>
                          <span>•</span>
                          <span>
                            {new Date(q.createdAt).toLocaleDateString('en-US', {
                              month: 'short',
                              day: '2-digit',
                              year: 'numeric',
                            })}
                          </span>
                        </div>
                      </div>

                      <div className={styles.quoteItemRight}>
                        <div className={styles.quoteItemCost}>
                          <span className={styles.quoteItemNet}>
                            ₹{(q.netCustomerCost || 0).toLocaleString('en-IN')}
                          </span>
                          <span className={styles.quoteItemGross}>
                            Gross: ₹{(q.grandTotal || 0).toLocaleString('en-IN')}
                          </span>
                        </div>
                        <Badge
                          variant={q.status === 'ACCEPTED' ? 'success' : q.status === 'SENT' ? 'info' : 'secondary'}
                          pill
                        >
                          {q.status}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => navigate(`/quotations/${q.id}`)}
                        >
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

          {/* ─── Right Column: Activity Timeline ──────────────────────────── */}
          <div className={styles.rightCol}>
            <aside className={styles.notesCard} aria-label="Activity Timeline">
              <h3 className={styles.cardTitle}>Activity Timeline</h3>

              {activities.length === 0 ? (
                <div className={styles.notesEmptyState}>
                  No activities recorded yet.
                </div>
              ) : (
                <div className={styles.activityTimeline}>
                  {activities.map((act) => (
                    <div key={act.id} className={styles.activityItem}>
                      <div className={styles.activityHeader}>
                        <Badge
                          variant={activityBadgeVariant(act.activity_type)}
                          pill
                        >
                          {formatActivityType(act.activity_type)}
                        </Badge>
                        <span className={styles.activityTime}>
                          {act.created_at
                            ? new Date(act.created_at).toLocaleDateString(
                              'en-US',
                              {
                                month: 'short',
                                day: '2-digit',
                                hour: '2-digit',
                                minute: '2-digit',
                              },
                            )
                            : ''}
                        </span>
                      </div>

                      {act.description && (
                        <p className={styles.activityDesc}>{act.description}</p>
                      )}

                      {(act.old_value || act.new_value) && (
                        <div className={styles.activityDiff}>
                          {act.old_value ? `${act.old_value} → ` : ''}
                          <strong>{String(act.new_value)}</strong>
                        </div>
                      )}
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
