import { apiClient } from './client';
import type {
  PaymentReceipt,
  OutstandingPayment,
  PaymentMilestone,
  InvoiceRecord,
  PaymentDashboardKpis,
  RecordPaymentPayload,
  ReceiptFilters,
  MilestoneFilters,
  OutstandingFilters,
  InvoiceFilters,
  PaginatedResult,
} from '@/shared/lib/types';

// ─── 1. Dashboard KPIs ───────────────────────────────────────────────────────

/**
 * Fetches dashboard KPI cards data (Total Outstanding, Collections This Month, Overdue Receivables)
 * GET /payments/dashboard
 */
export async function getPaymentDashboardKpis(params?: {
  month?: number;
  year?: number;
}): Promise<{ data: PaymentDashboardKpis }> {
  const response = await apiClient.get<{ data: PaymentDashboardKpis }>('/payments/dashboard', {
    params,
  });
  return response.data;
}

// ─── 2. Payment Receipts ────────────────────────────────────────────────────

/**
 * Retrieves a paginated list of payment receipts with filtering, search, and sorting.
 * GET /payments/receipts
 */
export async function listReceipts(
  params?: ReceiptFilters,
): Promise<PaginatedResult<PaymentReceipt>> {
  const response = await apiClient.get<PaginatedResult<PaymentReceipt>>('/payments/receipts', {
    params,
  });
  return response.data;
}

/**
 * Fetches single receipt details by ID.
 * GET /payments/receipts/:id
 */
export async function getReceiptById(
  receiptId: string,
): Promise<{ data: PaymentReceipt }> {
  const response = await apiClient.get<{ data: PaymentReceipt }>(`/payments/receipts/${receiptId}`);
  return response.data;
}

/**
 * Generates and downloads the PDF receipt for a payment.
 * GET /payments/receipts/:id/pdf
 */
export async function downloadReceiptPdf(receiptId: string): Promise<void> {
  const response = await apiClient.get(`/payments/receipts/${receiptId}/pdf`, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `Receipt-${receiptId.slice(0, 8).toUpperCase()}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.parentNode?.removeChild(link);
  window.URL.revokeObjectURL(url);
}

/**
 * Generates a pre-filled WhatsApp share link for a receipt.
 * POST /payments/receipts/:id/share
 */
export async function shareReceiptWhatsApp(
  receiptId: string,
): Promise<{ data: { message: string; whatsappUrl: string; customerPhone: string } }> {
  const response = await apiClient.post<{
    data: { message: string; whatsappUrl: string; customerPhone: string };
  }>(`/payments/receipts/${receiptId}/share`);
  return response.data;
}

/**
 * Voids an existing payment receipt (Admin only).
 * PATCH /payments/receipts/:id/void
 */
export async function voidReceipt(
  receiptId: string,
  reason: string,
): Promise<{ data: { receipt: { id: string; status: string }; milestone?: any } }> {
  const response = await apiClient.patch<{
    data: { receipt: { id: string; status: string }; milestone?: any };
  }>(`/payments/receipts/${receiptId}/void`, { reason });
  return response.data;
}

// ─── 3. Outstanding Payments ────────────────────────────────────────────────

/**
 * Retrieves project-level outstanding payment summaries.
 * GET /payments/outstanding
 */
export async function listOutstandingPayments(
  params?: OutstandingFilters,
): Promise<PaginatedResult<OutstandingPayment>> {
  const response = await apiClient.get<PaginatedResult<OutstandingPayment>>(
    '/payments/outstanding',
    { params },
  );
  return response.data;
}

// ─── 4. Payment Milestone Schedules ─────────────────────────────────────────

/**
 * Retrieves global payment milestones across projects.
 * GET /payments/milestones
 */
export async function listPaymentMilestones(
  params?: MilestoneFilters,
): Promise<PaginatedResult<PaymentMilestone>> {
  const response = await apiClient.get<PaginatedResult<PaymentMilestone>>(
    '/payments/milestones',
    { params },
  );
  return response.data;
}

/**
 * Records a payment against a milestone within a project.
 * POST /projects/:projectId/payments
 */
export async function recordPayment(
  projectId: string,
  payload: RecordPaymentPayload,
): Promise<{ data: { receipt: PaymentReceipt; milestone: PaymentMilestone; invoice?: InvoiceRecord } }> {
  const response = await apiClient.post<{
    data: { receipt: PaymentReceipt; milestone: PaymentMilestone; invoice?: InvoiceRecord };
  }>(`/projects/${projectId}/payments`, payload);
  return response.data;
}

/**
 * Adds a custom milestone to a project.
 * POST /projects/:projectId/milestones
 */
export async function addProjectMilestone(
  projectId: string,
  payload: {
    milestoneName: string;
    amountDue: number;
    dueDate?: string;
    percentage?: number | null;
  },
): Promise<{ data: PaymentMilestone }> {
  const response = await apiClient.post<{ data: PaymentMilestone }>(
    `/projects/${projectId}/milestones`,
    payload,
  );
  return response.data;
}

/**
 * Updates a milestone in a project.
 * PATCH /projects/:projectId/milestones/:milestoneId
 */
export async function updateProjectMilestone(
  projectId: string,
  milestoneId: string,
  payload: {
    milestoneName?: string;
    amountDue?: number;
    dueDate?: string;
  },
): Promise<{ data: PaymentMilestone }> {
  const response = await apiClient.patch<{ data: PaymentMilestone }>(
    `/projects/${projectId}/milestones/${milestoneId}`,
    payload,
  );
  return response.data;
}

/**
 * Deletes a custom milestone from a project.
 * DELETE /projects/:projectId/milestones/:milestoneId
 */
export async function deleteProjectMilestone(
  projectId: string,
  milestoneId: string,
): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(
    `/projects/${projectId}/milestones/${milestoneId}`,
  );
  return response.data;
}

// ─── 5. Invoices & Billing ──────────────────────────────────────────────────

/**
 * Retrieves a paginated list of invoices with filtering, search, and sorting.
 * GET /invoices
 */
export async function listInvoices(
  params?: InvoiceFilters,
): Promise<PaginatedResult<InvoiceRecord>> {
  const response = await apiClient.get<PaginatedResult<InvoiceRecord>>('/invoices', {
    params,
  });
  return response.data;
}

/**
 * Fetches single invoice details by ID.
 * GET /invoices/:id
 */
export async function getInvoiceById(
  invoiceId: string,
): Promise<{ data: InvoiceRecord }> {
  const response = await apiClient.get<{ data: InvoiceRecord }>(`/invoices/${invoiceId}`);
  return response.data;
}

/**
 * Updates invoice status (Unpaid / Paid / Overdue).
 * PATCH /invoices/:id/status
 */
export async function updateInvoiceStatus(
  invoiceId: string,
  status: string,
): Promise<{ data: InvoiceRecord }> {
  const response = await apiClient.patch<{ data: InvoiceRecord }>(
    `/invoices/${invoiceId}/status`,
    { status },
  );
  return response.data;
}

/**
 * Cancels an invoice.
 * DELETE /invoices/:id
 */
export async function cancelInvoice(
  invoiceId: string,
): Promise<{ message: string; invoiceId: string }> {
  const response = await apiClient.delete<{ message: string; invoiceId: string }>(
    `/invoices/${invoiceId}`,
  );
  return response.data;
}

/**
 * Triggers backend check for overdue milestones and invoices.
 * POST /payments/check-overdue
 */
export async function checkOverduePayments(): Promise<{
  data: { milestonesUpdated: number; invoicesUpdated: number };
}> {
  const response = await apiClient.post<{
    data: { milestonesUpdated: number; invoicesUpdated: number };
  }>('/payments/check-overdue');
  return response.data;
}
