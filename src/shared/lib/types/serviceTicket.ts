export type TicketStatus = 'Open' | 'In Progress' | 'Resolved' | 'Closed';

export type IssueType =
  | 'Inverter Fault'
  | 'Physical Damage'
  | 'Grid Sync Issue'
  | 'Wiring Issue'
  | 'Low Generation'
  | 'Panel Cleaning'
  | 'Other';

export interface ServiceTicket {
  id: string;
  ticketNo: string; // e.g. "TCK-2026-0001"
  projectId: string; // e.g. "proj-2"
  projectName: string; // e.g. "Rahul Desai - 3kW - 2026"
  customerName?: string;
  issueType: IssueType | string;
  description: string;
  status: TicketStatus;
  reportedOn: string; // e.g. "2026-07-01"
  assignedTechnician: string; // e.g. "Unassigned"
  attachedFiles?: string[];
  resolutionNotes?: string;
  resolvedAt?: string;
}

export interface TicketFilters {
  search: string;
  issueType: string;
  status: string;
  technician: string;
}
