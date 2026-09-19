export type UserRole = 'super_admin' | 'admin' | 'user' | string;

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'export';

export interface ResourcePermission {
  resource: string;
  actions: PermissionAction[];
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  permissions?: ResourcePermission[];
  status?: 'ACTIVE' | 'INACTIVE';
  avatar?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface Role {
  id: string;
  name: string; // unique slug e.g. 'super_admin', 'sales_manager'
  displayName: string;
  description?: string;
  isSystem?: boolean;
  permissions: ResourcePermission[];
  userCount?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateRolePayload {
  name: string;
  displayName: string;
  description?: string;
  permissions: ResourcePermission[];
}

export interface UpdateRolePayload {
  name?: string;
  displayName?: string;
  description?: string;
  permissions?: ResourcePermission[];
}

export interface CreateUserPayload {
  email: string;
  password?: string;
  firstName: string;
  lastName: string;
  role: string;
  status?: 'ACTIVE' | 'INACTIVE';
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  role?: string;
  status?: 'ACTIVE' | 'INACTIVE';
  password?: string;
}

export interface UsersResponse {
  data: User[];
  pagination: PaginationInfo;
}

export interface RolesResponse {
  data: Role[];
}

export interface Company {
  id: string;
  name: string;
  slug: string;
  schemaName?: string;
}

export interface AuthResponse {
  token: string;
  refreshToken: string;
  expiresIn: number;
  refreshTokenExpiresIn: number;
  user: User;
  company: Company;
}

export interface RegisterResponse {
  company: Company;
  owner: User;
}

export interface ApiErrorDetail {
  code: string;
  message: string;
  requestId?: string;
}

export interface ApiErrorResponse {
  error: ApiErrorDetail;
}

export interface ApiError {
  message: string;
  status: number;
  code?: string;
  errors?: Record<string, string[]>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// ─── Leads Types ─────────────────────────────────────────────────────────────

export type LeadStatus =
  | 'NEW'
  | 'CONTACTED'
  | 'FOLLOW_UP'
  | 'INTERESTED'
  | 'NOT_INTERESTED'
  | 'CONVERTED'
  | 'LOST';

export interface Lead {
  id: string;
  customerName: string;
  mobileNumber: string;
  email?: string | null;
  address?: string | null;
  monthlyBillAmount?: number | null;
  followUpDate: string;
  state?: string | null;
  city?: string | null;
  roofOwnership?: string | null;
  roofType?: string | null;
  leadSource?: string | null;
  assignedExecutive?: string | null;
  status: LeadStatus;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface LeadsResponse {
  data: Lead[];
  pagination: PaginationInfo;
}

export interface LeadFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: LeadStatus;
  assignedExecutive?: string;
  leadSource?: string;
  state?: string;
  city?: string;
  followUpDate?: string;
  followUpDateFrom?: string;
  followUpDateTo?: string;
  sort?: 'createdAt' | 'followUpDate' | 'customerName' | 'status';
  direction?: 'asc' | 'desc';
}

export interface CreateLeadPayload {
  customerName: string;
  mobileNumber: string;
  followUpDate: string;
  status?: LeadStatus;
  email?: string;
  address?: string;
  monthlyBillAmount?: number;
  state?: string;
  city?: string;
  roofOwnership?: string;
  roofType?: string;
  leadSource?: string;
  assignedExecutive?: string;
}

export type UpdateLeadPayload = Partial<CreateLeadPayload>;

export interface LeadActivity {
  id: string;
  lead_id: string;
  activity_type: string;
  description: string;
  old_value: any;
  new_value: any;
  performed_by: string;
  created_at: string;
}

export interface LeadActivitiesResponse {
  data: LeadActivity[];
  pagination: PaginationInfo;
}

// ─── Lead Import Types ───────────────────────────────────────────────────────

export interface ImportUploadUrlPayload {
  fileName: string;
  contentType: string;
  fileSize: number;
}

export interface ImportUploadUrlResponse {
  uploadUrl: string;
  key: string;
  fileId: string;
  expiresIn: number;
}

export interface ImportConfirmPayload {
  fileId: string;
  key: string;
}

export type ImportJobStatus =
  | 'QUEUED'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'COMPLETED_WITH_ERRORS'
  | 'FAILED';

export interface ImportJob {
  id: string;
  fileName: string;
  status: ImportJobStatus;
  totalRows: number;
  successfulRows: number;
  failedRows: number;
  duplicateRows: number;
  errorFileKey: string | null;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
}

// ─── Lead Export Types ───────────────────────────────────────────────────────

export interface ExportPayload {
  format: 'csv' | 'xlsx';
  status?: LeadStatus;
  search?: string;
  state?: string;
  city?: string;
  assignedExecutive?: string;
  sort?: 'createdAt' | 'followUpDate' | 'customerName' | 'status';
  direction?: 'asc' | 'desc';
}

export type ExportJobStatus = 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

export interface ExportJob {
  id: string;
  status: ExportJobStatus;
  format: 'csv' | 'xlsx';
  totalRows: number | null;
  createdAt: string;
  completedAt: string | null;
}

// ─── Quotation Types ─────────────────────────────────────────────────────────

export type QuotationStatus =
  | 'DRAFT'
  | 'SENT'
  | 'ACCEPTED'
  | 'REJECTED'
  | 'EXPIRED';

export type QuotationSystemType = 'ON_GRID' | 'OFF_GRID' | 'HYBRID';

export interface QuotationItem {
  id?: string;
  quotationId?: string;
  productId?: string | null;
  name?: string;
  itemName?: string;
  itemType?: string | null;
  brand?: string | null;
  model?: string | null;
  quantity: number;
  unit?: string | null;
  rate: number;
  gstRate: number;
  gstAmount?: number;
  preTaxAmount?: number;
  totalAmount?: number;
  total?: number;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface Quotation {
  id: string;
  leadId?: string | null;
  quoteNumber: string;
  version?: number;
  systemSizeKw: number;
  systemType?: QuotationSystemType | string | null;
  inverterCapacityKw?: number | null;
  batteryCapacityKwh?: number | null;
  panelCount?: number | null;
  panelWattage?: number | null;
  roofAreaSqft?: number | null;
  validityDate?: string;
  validityDays?: number;
  paymentTermsTemplate?: string | null;
  advancePercentage?: number;
  deliveryPercentage?: number;
  commissioningPercentage?: number;
  stateSubsidyCapOverride?: number | null;
  leadState?: string | null;
  subtotal: number;
  totalGst: number;
  grandTotal: number;
  centralSubsidy: number;
  stateSubsidy: number;
  netCustomerCost: number;
  status: QuotationStatus;
  notes?: string | null;
  termsAndConditions?: string | null;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  lead?: (Partial<Lead> & {
    id: string;
    customerName: string;
    mobileNumber: string;
  }) | null;
  items?: QuotationItem[];
}

export interface QuotationFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: QuotationStatus;
  leadId?: string;
  sort?: 'createdAt' | 'validityDate' | 'quoteNumber' | 'systemSizeKw' | 'grandTotal';
  direction?: 'asc' | 'desc';
}

export interface QuotationsResponse {
  data: Quotation[];
  pagination: PaginationInfo;
}

export interface CreateQuotationItemPayload {
  productId?: string;
  name: string;
  itemName?: string;
  itemType?: string;
  brand?: string;
  model?: string;
  quantity: number;
  unit?: string;
  rate: number;
  gstRate?: number;
  total?: number;
  sortOrder?: number;
}

export interface CreateQuotationPayload {
  leadId?: string;
  quoteNumber?: string;
  systemSizeKw: number;
  systemType?: QuotationSystemType | string;
  inverterCapacityKw?: number;
  batteryCapacityKwh?: number;
  panelCount?: number;
  panelWattage?: number;
  roofAreaSqft?: number;
  validityDate?: string;
  validityDays?: number;
  paymentTermsTemplate?: string;
  advancePercentage?: number;
  deliveryPercentage?: number;
  commissioningPercentage?: number;
  stateSubsidyCapOverride?: number | null;
  leadState?: string;
  centralSubsidy?: number;
  stateSubsidy?: number;
  status?: QuotationStatus;
  notes?: string;
  termsAndConditions?: string;
  items?: CreateQuotationItemPayload[];
}

export interface UpdateQuotationPayload extends Partial<CreateQuotationPayload> {
  rejectionReason?: string;
}



