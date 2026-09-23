import type { AmcContract } from '@/shared/lib/types/amc';

export const AMC_STATUS_OPTIONS = [
  { label: 'All Statuses', value: 'all' },
  { label: 'Active', value: 'Active' },
  { label: 'Pending Renewal', value: 'Pending Renewal' },
  { label: 'Expired', value: 'Expired' },
  { label: 'Terminated', value: 'Terminated' },
];

export const INITIAL_AMC_CONTRACTS: AmcContract[] = [
  {
    id: 'amc-1',
    projectId: 'proj-2',
    projectName: 'Rahul Desai - 3kW - 2026',
    customerName: 'Rahul Desai',
    startDate: '2026-07-01',
    endDate: '2027-07-01',
    annualValue: 40000,
    status: 'Active',
    createdAt: '2026-07-01',
  },
  {
    id: 'amc-2',
    projectId: 'proj-1',
    projectName: 'Arun Sharma - 3kW - 2026',
    customerName: 'Arun Sharma',
    startDate: '2026-06-30',
    endDate: '2027-06-30',
    annualValue: 40000,
    status: 'Active',
    createdAt: '2026-06-30',
  },
  {
    id: 'amc-3',
    projectId: 'proj-1',
    projectName: 'Arun Sharma - 3kW - 2026',
    customerName: 'Arun Sharma',
    startDate: '2026-08-01',
    endDate: '2026-08-31',
    annualValue: 15000,
    status: 'Active',
    createdAt: '2026-08-01',
  },
];
