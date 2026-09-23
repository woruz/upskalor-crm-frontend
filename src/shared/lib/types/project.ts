export type ProjectStatus =
  | 'In Progress'
  | 'Completed'
  | 'Pending Survey'
  | 'On Hold'
  | 'Scheduled';

export interface ProjectMilestone {
  id: number | string;
  title: string;
  completed: boolean;
  completedDate?: string;
  description?: string;
  status?: 'Done' | 'Pending';
  proofUrl?: string;
  proofFileName?: string;
  proofUploadedAt?: string;
  isCustom?: boolean;
  createdBy?: string;
}

export interface SubsidyDocument {
  id: string;
  title: string;
  uploaded: boolean;
  fileUrl?: string;
  fileName?: string;
  uploadedAt?: string;
}

export interface PaymentMilestoneItem {
  id: string;
  milestone: string;
  amountDue: number;
  dueDate: string;
  status: 'Received' | 'Partially Received' | 'Pending';
  receivedAmount: number;
}

export interface MaterialItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  specification?: string;
  status?: string;
}

export interface Project {
  id: string;
  name: string;
  customerName: string;
  status: ProjectStatus;
  projectManager: string;
  systemCapacity: string;
  location: string;
  state?: string;
  cost: number;
  completedMilestones: number;
  totalMilestones: number;
  milestones?: ProjectMilestone[];
  subsidyDocuments?: SubsidyDocument[];
  paymentMilestones?: PaymentMilestoneItem[];
  materials?: MaterialItem[];
  totalReceived?: number;
  balanceOutstanding?: number;
  createdAt?: string;
  notes?: string;
}

export interface ProjectFilters {
  search: string;
  status: string;
  projectManager: string;
}
