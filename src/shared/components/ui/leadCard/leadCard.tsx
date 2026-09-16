import React, { useState, useEffect } from 'react';
import { Button } from '@/shared/components/ui/button';
import type { LeadCardProps, LeadStatusOption } from './leadCard.types';
import styles from './leadCard.module.scss';

const DEFAULT_STATUS_OPTIONS: LeadStatusOption[] = [
  { label: 'New', value: 'New' },
  { label: 'Contacted', value: 'Contacted' },
  { label: 'Survey Scheduled', value: 'Survey Scheduled' },
  { label: 'Quote Sent', value: 'Quote Sent' },
  { label: 'Negotiation', value: 'Negotiation' },
  { label: 'Won', value: 'Won' },
  { label: 'Lost', value: 'Lost' },
  { label: 'Junk', value: 'Junk' },
];

export const LeadCard: React.FC<LeadCardProps> = ({
  title,
  location,
  monthlyAmount,
  metadata = [],
  status: controlledStatus,
  statusOptions = DEFAULT_STATUS_OPTIONS,
  followUpDate: controlledFollowUpDate,
  statusLabel = 'LEAD STATUS',
  followUpLabel = 'FOLLOW-UP DATE',
  editLabel = 'Edit',
  quotationLabel = 'Create Quotation',
  saveLabel = 'Save',
  showEdit = true,
  showQuotation = true,
  showDelete = true,
  showStatusSection = true,
  isSaving = false,
  onEdit,
  onCreateQuotation,
  onDelete,
  onStatusChange,
  onFollowUpDateChange,
  onSave,
  customActions,
  children,
  className = '',
  style,
}) => {
  // Normalize status options
  const normalizedOptions: LeadStatusOption[] = statusOptions.map((opt) =>
    typeof opt === 'string' ? { label: opt, value: opt } : opt
  );

  // Local state for status and date (supports both controlled and uncontrolled usage)
  const [internalStatus, setInternalStatus] = useState<string>(
    controlledStatus ?? normalizedOptions[0]?.value ?? 'New'
  );
  const [internalDate, setInternalDate] = useState<string>(
    controlledFollowUpDate ?? ''
  );

  useEffect(() => {
    if (controlledStatus !== undefined) {
      setInternalStatus(controlledStatus);
    }
  }, [controlledStatus]);

  useEffect(() => {
    if (controlledFollowUpDate !== undefined) {
      setInternalDate(controlledFollowUpDate);
    }
  }, [controlledFollowUpDate]);

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const nextStatus = e.target.value;
    setInternalStatus(nextStatus);
    onStatusChange?.(nextStatus);
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const nextDate = e.target.value;
    setInternalDate(nextDate);
    onFollowUpDateChange?.(nextDate);
  };

  const handleSave = () => {
    onSave?.({
      status: internalStatus,
      followUpDate: internalDate,
    });
  };

  return (
    <article className={`${styles.card} ${className}`} style={style}>
      {/* ─── Top Header Row ────────────────────────────────────────────── */}
      <div className={styles.header}>
        <div className={styles.titleArea}>
          <h2 className={styles.title}>{title}</h2>

          <div className={styles.metaRow}>
            {/* Location */}
            {location && (
              <span className={styles.metaItem}>
                <span className={styles.metaIcon} aria-hidden="true">
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                </span>
                <span className={styles.metaText}>{location}</span>
              </span>
            )}

            {/* Divider if both location and amount exist */}
            {location && monthlyAmount && (
              <span className={styles.metaDivider} aria-hidden="true">
                |
              </span>
            )}

            {/* Monthly bill amount / metric */}
            {monthlyAmount && (
              <span className={styles.metaItem}>
                <span
                  className={`${styles.metaIcon} ${styles['metaIcon--metric']}`}
                  aria-hidden="true"
                >
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                    stroke="none"
                  >
                    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
                  </svg>
                </span>
                <span
                  className={`${styles.metaText} ${styles['metaText--highlight']}`}
                >
                  {monthlyAmount}
                </span>
              </span>
            )}

            {/* Additional custom metadata items */}
            {metadata.map((item, index) => (
              <React.Fragment key={index}>
                {(location || monthlyAmount || index > 0) && (
                  <span className={styles.metaDivider} aria-hidden="true">
                    |
                  </span>
                )}
                <span className={styles.metaItem}>
                  {item.icon && (
                    <span className={styles.metaIcon} aria-hidden="true">
                      {item.icon}
                    </span>
                  )}
                  <span className={styles.metaText}>{item.text}</span>
                </span>
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* ─── Top-Right Actions ───────────────────────────────────────── */}
        <div className={styles.actions}>
          {customActions ? (
            customActions
          ) : (
            <>
              {/* Edit button */}
              {showEdit && (
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={onEdit}
                  aria-label={editLabel}
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
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                      <path d="M19 8l2 2-4 4-2-2 4-4z" />
                    </svg>
                  }
                >
                  {editLabel}
                </Button>
              )}

              {/* Create Quotation button */}
              {showQuotation && (
                <Button
                  type="button"
                  variant="primary"
                  size="md"
                  onClick={onCreateQuotation}
                  aria-label={quotationLabel}
                  leftIcon={
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
                      <rect width="16" height="20" x="4" y="2" rx="2" />
                      <path d="M9 10h6" />
                      <path d="M9 14h6" />
                      <path d="M12 6v2" />
                      <path d="M10 8h4" />
                    </svg>
                  }
                >
                  {quotationLabel}
                </Button>
              )}

              {/* Delete button */}
              {showDelete && (
                <Button
                  type="button"
                  variant="danger"
                  size="md"
                  onClick={onDelete}
                  aria-label="Delete"
                  title="Delete"
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
                    aria-hidden="true"
                  >
                    <path d="M3 6h18" />
                    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
                    <line x1="10" y1="11" x2="10" y2="17" />
                    <line x1="14" y1="11" x2="14" y2="17" />
                  </svg>
                </Button>
              )}
            </>
          )}
        </div>
      </div>

      {/* ─── Bottom Status & Follow-up Section ──────────────────────────── */}
      {showStatusSection && (
        <section className={styles.statusSection} aria-label="Lead Status and Follow-up">
          <div className={styles.statusGrid}>
            {/* Status Dropdown */}
            <div className={styles.fieldGroup}>
              <label htmlFor="lead-card-status" className={styles.fieldLabel}>
                {statusLabel}
              </label>
              <div className={styles.selectWrapper}>
                <select
                  id="lead-card-status"
                  className={styles.select}
                  value={internalStatus}
                  onChange={handleStatusChange}
                >
                  {normalizedOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
                <span className={styles.selectArrow} aria-hidden="true">
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

            {/* Follow-up Date + Save Button */}
            <div className={styles.fieldGroup}>
              <label htmlFor="lead-card-date" className={styles.fieldLabel}>
                {followUpLabel}
              </label>
              <div className={styles.dateSaveGroup}>
                <div className={styles.dateInputWrapper}>
                  <input
                    id="lead-card-date"
                    type="date"
                    className={styles.dateInput}
                    value={internalDate}
                    onChange={handleDateChange}
                  />
                </div>

                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={handleSave}
                  isLoading={isSaving}
                  disabled={isSaving}
                >
                  {saveLabel}
                </Button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ─── Optional Custom Children Slot ─────────────────────────────── */}
      {children && <div className={styles.customContent}>{children}</div>}
    </article>
  );
};

export default LeadCard;
