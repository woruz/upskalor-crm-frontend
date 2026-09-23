export type AmcStatus = 'Active' | 'Pending Renewal' | 'Expired' | 'Terminated';

export interface AmcContract {
  id: string;
  projectId: string;
  projectName: string;
  customerName?: string;
  startDate: string; // YYYY-MM-DD e.g. "2026-07-01"
  endDate: string; // YYYY-MM-DD e.g. "2027-07-01"
  annualValue: number; // e.g. 40000
  status: AmcStatus;
  createdAt?: string;
  updatedAt?: string;
}

export interface AmcFilters {
  search: string;
  status: string;
  project: string;
}
