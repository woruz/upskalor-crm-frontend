import React from 'react';
import { Badge } from '@/shared/components/ui/badge/badge';
import { ProgressBar } from '@/shared/components/ui/progressBar';
import type { Project, ProjectStatus } from '@/shared/lib/types/project';
import styles from './projectCard.module.scss';

export interface ProjectCardProps {
  project: Project;
  onDelete?: (project: Project) => void;
  onViewDetails?: (project: Project) => void;
  className?: string;
}

// ─── SVG Icons ───────────────────────────────────────────────────────────────

const UserIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="currentColor"
    aria-hidden="true"
  >
    <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
  </svg>
);

const SolarPanelIcon = () => (
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
    <polygon points="3 3 21 3 19 15 5 15" />
    <line x1="12" y1="3" x2="12" y2="15" />
    <line x1="4" y1="9" x2="20" y2="9" />
    <line x1="8" y1="15" x2="6" y2="21" />
    <line x1="16" y1="15" x2="18" y2="21" />
    <line x1="6" y1="18" x2="18" y2="18" />
  </svg>
);

const LocationPinIcon = () => (
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
    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
    <circle cx="12" cy="10" r="3" />
  </svg>
);

const TrashIcon = () => (
  <svg
    width="17"
    height="17"
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

// ─── Helpers ─────────────────────────────────────────────────────────────────

const getStatusBadgeVariant = (
  status: ProjectStatus,
): 'info' | 'success' | 'warning' | 'error' | 'primary' | 'default' => {
  switch (status) {
    case 'In Progress':
      return 'info';
    case 'Completed':
      return 'success';
    case 'Pending Survey':
      return 'warning';
    case 'On Hold':
      return 'error';
    case 'Scheduled':
      return 'primary';
    default:
      return 'info';
  }
};

const formatIndianCurrency = (amount: number): string => {
  return '₹' + amount.toLocaleString('en-IN');
};

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  onDelete,
  onViewDetails,
  className = '',
}) => {
  const {
    name,
    status,
    projectManager,
    systemCapacity,
    location,
    cost,
    completedMilestones,
    totalMilestones = 10,
  } = project;

  const badgeVariant = getStatusBadgeVariant(status);

  return (
    <article className={`${styles.card} ${className}`} aria-label={`Project: ${name}`}>
      {/* ─── Top Header: Status & Delete ────────────────────────────────────── */}
      <div className={styles.header}>
        <Badge variant={badgeVariant} pill size="md">
          {status}
        </Badge>
        {onDelete && (
          <button
            type="button"
            className={styles.deleteBtn}
            onClick={() => onDelete(project)}
            aria-label={`Delete project ${name}`}
            title="Delete project"
          >
            <TrashIcon />
          </button>
        )}
      </div>

      {/* ─── Title ──────────────────────────────────────────────────────────── */}
      <h2 className={styles.title}>{name}</h2>

      {/* ─── Metadata List ─────────────────────────────────────────────────── */}
      <div className={styles.metaList}>
        <div className={styles.metaItem}>
          <span className={styles.metaIcon}>
            <UserIcon />
          </span>
          <span className={styles.metaText}>{projectManager || 'Unassigned'}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaIcon}>
            <SolarPanelIcon />
          </span>
          <span className={styles.metaText}>{systemCapacity}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaIcon}>
            <LocationPinIcon />
          </span>
          <span className={styles.metaText}>{location}</span>
        </div>

        <div className={styles.metaItem}>
          <span className={styles.metaIcon} style={{ fontWeight: 600, fontSize: '15px' }}>
            ₹
          </span>
          <span className={`${styles.metaText} ${styles.currencyText}`}>
            {formatIndianCurrency(cost)}
          </span>
        </div>
      </div>

      {/* ─── Progress Bar Section ───────────────────────────────────────────── */}
      <div className={styles.progressSection}>
        <div className={styles.progressHeader}>
          <span>Progress</span>
          <span>
            {completedMilestones}/{totalMilestones} Milestones
          </span>
        </div>
        <ProgressBar
          value={completedMilestones}
          max={totalMilestones}
          height={7}
          ariaLabel={`Project progress: ${completedMilestones} of ${totalMilestones} milestones completed`}
        />
      </div>

      {/* ─── Footer Details Link ───────────────────────────────────────────── */}
      <div className={styles.footer}>
        <button
          type="button"
          className={styles.viewDetailsBtn}
          onClick={() => onViewDetails?.(project)}
          aria-label={`View details for ${name}`}
        >
          View Details &gt;
        </button>
      </div>
    </article>
  );
};

export default ProjectCard;
