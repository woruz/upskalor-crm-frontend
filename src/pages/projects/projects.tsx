import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router';
import { AppLayout } from '@/shared/components/ui/appLayout/appLayout';
import { SearchInput } from '@/shared/components/ui/input';
import { Dropdown } from '@/shared/components/ui/dropdown';
import { ProjectCard } from '@/shared/components/ui/projectCard';
import { Modal } from '@/shared/components/ui/modal/modal';
import { Button } from '@/shared/components/ui/button/button';
import { Badge } from '@/shared/components/ui/badge/badge';
import { ProgressBar } from '@/shared/components/ui/progressBar';
import { NoContentCard } from '@/shared/components/ui/noContentCard/noContentCard';
import { useToast } from '@/shared/components/ui/toast/toast';
import { useAuth } from '@/shared/lib/hooks/useAuth';
import { INITIAL_PROJECTS } from './mockProjects';
import type { Project } from '@/shared/lib/types/project';
import styles from './projects.module.scss';

// ─── SVG Icons ───────────────────────────────────────────────────────────────

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

const STATUS_FILTER_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Pending Survey', value: 'Pending Survey' },
  { label: 'On Hold', value: 'On Hold' },
];

export function ProjectsPage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [managerFilter, setManagerFilter] = useState('all');

  // Modals state
  const [projectToDelete, setProjectToDelete] = useState<Project | null>(null);
  const [selectedProjectDetails, setSelectedProjectDetails] = useState<Project | null>(null);

  const fullName = [user?.firstName, user?.lastName].filter(Boolean).join(' ');

  // Manager options extracted dynamically from current list of projects
  const managerOptions = useMemo(() => {
    const managers = Array.from(
      new Set(projects.map((p) => p.projectManager || 'Unassigned')),
    );
    return [
      { label: 'All Managers', value: 'all' },
      ...managers.map((m) => ({ label: m, value: m })),
    ];
  }, [projects]);

  // Filtered projects list
  const filteredProjects = useMemo(() => {
    return projects.filter((project) => {
      // 1. Search filter: matches project name, customer name, or location
      if (searchQuery.trim()) {
        const query = searchQuery.trim().toLowerCase();
        const matchesName = project.name.toLowerCase().includes(query);
        const matchesCustomer = project.customerName.toLowerCase().includes(query);
        const matchesLocation = project.location.toLowerCase().includes(query);
        if (!matchesName && !matchesCustomer && !matchesLocation) {
          return false;
        }
      }

      // 2. Status filter
      if (statusFilter !== 'all' && project.status !== statusFilter) {
        return false;
      }

      // 3. Manager filter
      if (managerFilter !== 'all' && project.projectManager !== managerFilter) {
        return false;
      }

      return true;
    });
  }, [projects, searchQuery, statusFilter, managerFilter]);

  const hasActiveFilters =
    searchQuery.trim() !== '' || statusFilter !== 'all' || managerFilter !== 'all';

  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setManagerFilter('all');
  };

  // Handlers
  const handleDeleteClick = (project: Project) => {
    setProjectToDelete(project);
  };

  const handleConfirmDelete = () => {
    if (!projectToDelete) return;
    setProjects((prev) => prev.filter((p) => p.id !== projectToDelete.id));
    addToast({
      title: 'Project Deleted',
      description: `Project "${projectToDelete.name}" has been removed.`,
      variant: 'success',
    });
    setProjectToDelete(null);
  };

  const handleViewDetails = (project: Project) => {
    navigate(`/projects/${project.id}`);
  };

  return (
    <AppLayout
      headerProps={{
        title: 'Installation Pipeline',
        breadcrumbs: [{ label: 'CRM' }, { label: 'Installation Pipeline' }],
        userName: fullName || user?.email || 'User',
        userRole: user?.role || 'user',
        notificationCount: 3,
      }}
    >
      <div className={styles.page}>
        {/* ─── Page Title Header ────────────────────────────────────────── */}
        <div className={styles.headerRow}>
          <h1 className={styles.pageTitle}>Installation Pipeline</h1>
          <p className={styles.pageSubtitle}>
            Manage ongoing projects, track milestones, and monitor installations.
          </p>
        </div>

        {/* ─── Filter Bar Card ──────────────────────────────────────────── */}
        <div className={styles.filterCard}>
          <div className={styles.filterControls}>
            {/* Search Input */}
            <div className={styles.searchColumn}>
              <span className={styles.controlLabel}>SEARCH</span>
              <SearchInput
                placeholder="Search project name or customer..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onClear={() => setSearchQuery('')}
                size="md"
              />
            </div>

            {/* Status Dropdown */}
            <div className={styles.dropdownColumn}>
              <span className={styles.controlLabel}>STATUS</span>
              <Dropdown
                options={STATUS_FILTER_OPTIONS}
                value={statusFilter}
                onChange={(val) => setStatusFilter(String(val || 'all'))}
                size="md"
              />
            </div>

            {/* Project Manager Dropdown */}
            <div className={styles.dropdownColumn}>
              <span className={styles.controlLabel}>PROJECT MANAGER</span>
              <Dropdown
                options={managerOptions}
                value={managerFilter}
                onChange={(val) => setManagerFilter(String(val || 'all'))}
                size="md"
              />
            </div>
          </div>

          {hasActiveFilters && (
            <div className={styles.filterActionRow}>
              <span>
                Showing {filteredProjects.length} of {projects.length} projects
              </span>
              <button
                type="button"
                className={styles.clearFiltersBtn}
                onClick={resetFilters}
              >
                Clear all filters
              </button>
            </div>
          )}
        </div>

        {/* ─── Project Cards Grid ───────────────────────────────────────── */}
        {filteredProjects.length > 0 ? (
          <div className={styles.projectsGrid}>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onDelete={handleDeleteClick}
                onViewDetails={handleViewDetails}
              />
            ))}
          </div>
        ) : (
          <NoContentCard
            title="No projects found"
            description={
              hasActiveFilters
                ? 'No projects match your current search and filter criteria.'
                : 'There are no ongoing installation projects at this moment.'
            }
            action={
              hasActiveFilters ? (
                <Button variant="outline" size="sm" onClick={resetFilters}>
                  Clear Filters
                </Button>
              ) : undefined
            }
          />
        )}

        {/* ─── Delete Confirmation Modal ─────────────────────────────────── */}
        <Modal
          isOpen={Boolean(projectToDelete)}
          onClose={() => setProjectToDelete(null)}
          size="sm"
        >
          <div className={styles.modalHeader}>
            <h3>Delete Project</h3>
          </div>
          <div className={styles.modalBody}>
            <p className={styles.deleteWarningText}>
              Are you sure you want to delete project{' '}
              <strong>"{projectToDelete?.name}"</strong>? This will remove all
              associated installation milestone progress. This action cannot be
              undone.
            </p>
          </div>
          <div className={styles.modalFooter}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setProjectToDelete(null)}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
            >
              Delete Project
            </Button>
          </div>
        </Modal>

        {/* ─── Project Details & Milestones Modal ─────────────────────────── */}
        <Modal
          isOpen={Boolean(selectedProjectDetails)}
          onClose={() => setSelectedProjectDetails(null)}
          size="lg"
        >
          {selectedProjectDetails && (
            <>
              <div className={styles.modalHeader}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
                  <h3>{selectedProjectDetails.name}</h3>
                  <Badge variant="info" pill>
                    {selectedProjectDetails.status}
                  </Badge>
                </div>
              </div>

              <div className={styles.modalBody}>
                {/* Summary Info */}
                <div className={styles.projectSummaryCard}>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Customer</span>
                    <span className={styles.summaryValue}>
                      {selectedProjectDetails.customerName}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Project Manager</span>
                    <span className={styles.summaryValue}>
                      {selectedProjectDetails.projectManager || 'Unassigned'}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>System Capacity</span>
                    <span className={styles.summaryValue}>
                      {selectedProjectDetails.systemCapacity}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Location</span>
                    <span className={styles.summaryValue}>
                      {selectedProjectDetails.location}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Contract Value</span>
                    <span className={styles.summaryValue}>
                      ₹{selectedProjectDetails.cost.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span className={styles.summaryLabel}>Current Progress</span>
                    <span className={styles.summaryValue}>
                      {selectedProjectDetails.completedMilestones}/
                      {selectedProjectDetails.totalMilestones} Milestones (
                      {Math.round(
                        (selectedProjectDetails.completedMilestones /
                          selectedProjectDetails.totalMilestones) *
                          100,
                      )}
                      %)
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div>
                  <ProgressBar
                    value={selectedProjectDetails.completedMilestones}
                    max={selectedProjectDetails.totalMilestones}
                    height={8}
                  />
                </div>

                {/* Milestones Checklist */}
                <div className={styles.milestonesList}>
                  <h4 className={styles.milestonesSectionTitle}>
                    Installation Milestones Checklist
                  </h4>
                  {selectedProjectDetails.milestones?.map((milestone) => (
                    <div
                      key={milestone.id}
                      className={`${styles.milestoneItem} ${
                        milestone.completed ? styles['milestoneItem--completed'] : ''
                      }`}
                    >
                      <div
                        className={`${styles.milestoneIcon} ${
                          milestone.completed
                            ? styles['milestoneIcon--completed']
                            : styles['milestoneIcon--pending']
                        }`}
                      >
                        {milestone.completed ? <CheckmarkIcon /> : milestone.id}
                      </div>
                      <div className={styles.milestoneInfo}>
                        <p className={styles.milestoneTitle}>{milestone.title}</p>
                        {milestone.description && (
                          <p className={styles.milestoneDesc}>{milestone.description}</p>
                        )}
                        {milestone.completed && milestone.completedDate && (
                          <span className={styles.milestoneDate}>
                            Completed on {milestone.completedDate}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className={styles.modalFooter}>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedProjectDetails(null)}
                >
                  Close
                </Button>
              </div>
            </>
          )}
        </Modal>
      </div>
    </AppLayout>
  );
}

export default ProjectsPage;
