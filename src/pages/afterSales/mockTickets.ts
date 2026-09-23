import type { ServiceTicket } from '@/shared/lib/types/serviceTicket';

export const ISSUE_TYPE_OPTIONS = [
  { label: 'All Issue Types', value: 'all' },
  { label: 'Inverter Fault', value: 'Inverter Fault' },
  { label: 'Physical Damage', value: 'Physical Damage' },
  { label: 'Grid Sync Issue', value: 'Grid Sync Issue' },
  { label: 'Wiring Issue', value: 'Wiring Issue' },
  { label: 'Low Generation', value: 'Low Generation' },
  { label: 'Panel Cleaning', value: 'Panel Cleaning' },
  { label: 'Other', value: 'Other' },
];

export const STATUS_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Open', value: 'Open' },
  { label: 'In Progress', value: 'In Progress' },
  { label: 'Resolved', value: 'Resolved' },
  { label: 'Closed', value: 'Closed' },
];

export const TECHNICIAN_OPTIONS = [
  { label: 'All Technicians', value: 'all' },
  { label: 'Unassigned', value: 'Unassigned' },
  { label: 'Rajesh Kumar', value: 'Rajesh Kumar' },
  { label: 'Amit Verma', value: 'Amit Verma' },
  { label: 'Ramesh K', value: 'Ramesh K' },
  { label: 'Priya Sharma', value: 'Priya Sharma' },
];

export const INITIAL_SERVICE_TICKETS: ServiceTicket[] = [
  {
    id: 'tck-1',
    ticketNo: 'TCK-2026-0001',
    projectId: 'proj-2',
    projectName: 'Rahul Desai - 3kW - 2026',
    customerName: 'Rahul Desai',
    issueType: 'Inverter Fault',
    description: 'Inverter displaying Error E03 (Grid Overvoltage) during peak afternoon hours.',
    status: 'Open',
    reportedOn: '2026-07-01',
    assignedTechnician: 'Unassigned',
  },
  {
    id: 'tck-2',
    ticketNo: 'TCK-2026-0002',
    projectId: 'proj-1',
    projectName: 'Arun Sharma - 3kW - 2026',
    customerName: 'Arun Sharma',
    issueType: 'Physical Damage',
    description: 'Hailstorm impact on module string 2 top panel glass crack. Panel replaced and recommissioned.',
    status: 'Resolved',
    reportedOn: '2026-08-17',
    assignedTechnician: 'Unassigned',
    resolutionNotes: 'Damaged 540W module replaced with new warranty unit.',
    resolvedAt: '2026-08-20',
  },
  {
    id: 'tck-3',
    ticketNo: 'TCK-2026-0003',
    projectId: 'proj-3',
    projectName: 'Vikram Patel - 5kW - 2026',
    customerName: 'Vikram Patel',
    issueType: 'Grid Sync Issue',
    description: 'Net meter frequency discrepancy causing micro-trips during voltage surge.',
    status: 'In Progress',
    reportedOn: '2026-09-02',
    assignedTechnician: 'Rajesh Kumar',
  },
  {
    id: 'tck-4',
    ticketNo: 'TCK-2026-0004',
    projectId: 'proj-4',
    projectName: 'Priya Kulkarni - 10kW - 2026',
    customerName: 'Priya Kulkarni',
    issueType: 'Low Generation',
    description: 'Generation output dropped by 30% compared to expected monthly yield.',
    status: 'Open',
    reportedOn: '2026-09-15',
    assignedTechnician: 'Amit Verma',
  },
];
