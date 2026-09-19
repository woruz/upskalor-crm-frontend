import axios from 'axios';
import { apiClient } from './client';
import type {
  Lead,
  LeadsResponse,
  LeadFilters,
  CreateLeadPayload,
  UpdateLeadPayload,
  LeadStatus,
  LeadActivitiesResponse,
  ImportUploadUrlPayload,
  ImportUploadUrlResponse,
  ImportConfirmPayload,
  ImportJob,
  ExportPayload,
  ExportJob,
} from '@/shared/lib/types';

// ─── 1. List Leads ───────────────────────────────────────────────────────────

/**
 * Retrieves a paginated list of leads with support for filtering, search, and sorting.
 * GET /leads
 */
export async function listLeads(params?: LeadFilters): Promise<LeadsResponse> {
  const response = await apiClient.get<LeadsResponse>('/leads', { params });
  return response.data;
}

// ─── 2. Create Lead ──────────────────────────────────────────────────────────

/**
 * Creates a new sales lead.
 * POST /leads
 */
export async function createLead(
  data: CreateLeadPayload,
): Promise<{ data: Lead }> {
  const response = await apiClient.post<{ data: Lead }>('/leads', data);
  return response.data;
}

// ─── 3. Get Single Lead ──────────────────────────────────────────────────────

/**
 * Fetches details of a lead by ID.
 * GET /leads/:id
 */
export async function getLeadById(id: string): Promise<{ data: Lead }> {
  const response = await apiClient.get<{ data: Lead }>(`/leads/${id}`);
  return response.data;
}

// ─── 4. Update Lead (Partial) ────────────────────────────────────────────────

/**
 * Updates editable fields on a lead.
 * PATCH /leads/:id
 */
export async function updateLead(
  id: string,
  data: UpdateLeadPayload,
): Promise<{ data: Lead }> {
  const response = await apiClient.patch<{ data: Lead }>(`/leads/${id}`, data);
  return response.data;
}

// ─── 5. Update Lead Status ───────────────────────────────────────────────────

/**
 * Quick status change endpoint.
 * PATCH /leads/:id/status
 */
export async function updateLeadStatus(
  id: string,
  status: LeadStatus,
): Promise<{ data: Lead }> {
  const response = await apiClient.patch<{ data: Lead }>(
    `/leads/${id}/status`,
    { status },
  );
  return response.data;
}

// ─── 6. Assign / Reassign Lead ───────────────────────────────────────────────

/**
 * Assigns or unassigns a sales executive.
 * PATCH /leads/:id/assign
 */
export async function assignLead(
  id: string,
  assignedExecutive: string | null,
): Promise<{ data: Lead }> {
  const response = await apiClient.patch<{ data: Lead }>(
    `/leads/${id}/assign`,
    { assignedExecutive },
  );
  return response.data;
}

// ─── 7. Delete Lead ──────────────────────────────────────────────────────────

/**
 * Soft-deletes a lead.
 * DELETE /leads/:id
 */
export async function deleteLead(id: string): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(`/leads/${id}`);
  return response.data;
}

// ─── 8. Get Lead Activity Timeline ───────────────────────────────────────────

/**
 * Fetches all chronological audit logs and activity events for a lead.
 * GET /leads/:id/activities
 */
export async function getLeadActivities(
  id: string,
  page = 1,
  limit = 20,
): Promise<LeadActivitiesResponse> {
  const response = await apiClient.get<LeadActivitiesResponse>(
    `/leads/${id}/activities`,
    { params: { page, limit } },
  );
  return response.data;
}

// ─── 9. Import Leads: Step 1 Presigned URL ───────────────────────────────────

/**
 * Requests a presigned S3 PUT URL to upload a bulk .csv or .xlsx file.
 * POST /leads/import/upload-url
 */
export async function getImportUploadUrl(
  data: ImportUploadUrlPayload,
): Promise<ImportUploadUrlResponse> {
  const response = await apiClient.post<ImportUploadUrlResponse>(
    '/leads/import/upload-url',
    data,
  );
  return response.data;
}

/**
 * Directly uploads binary file data to the presigned S3 URL.
 * Uses a plain axios instance without Authorization headers.
 */
export async function uploadFileToS3(
  uploadUrl: string,
  file: File,
): Promise<void> {
  await axios.put(uploadUrl, file, {
    headers: {
      'Content-Type': file.type || 'text/csv',
    },
  });
}

// ─── 10. Import Leads: Step 2 Confirm & Queue ────────────────────────────────

/**
 * Triggers background BullMQ import processing after S3 upload.
 * POST /leads/import
 */
export async function triggerImport(
  data: ImportConfirmPayload,
): Promise<{ data: ImportJob }> {
  const response = await apiClient.post<{ data: ImportJob }>(
    '/leads/import',
    data,
  );
  return response.data;
}

// ─── 11. Get Import Job Status ───────────────────────────────────────────────

/**
 * Polls progress and row count metrics of an ongoing or completed import.
 * GET /leads/import/:importId
 */
export async function getImportStatus(
  importId: string,
): Promise<{ data: ImportJob }> {
  const response = await apiClient.get<{ data: ImportJob }>(
    `/leads/import/${importId}`,
  );
  return response.data;
}

// ─── 12. Download Import Error Report ────────────────────────────────────────

/**
 * Fetches presigned S3 download URL for the error CSV.
 * GET /leads/import/:importId/error-report
 */
export async function getImportErrorReport(
  importId: string,
): Promise<{ data: { downloadUrl: string; expiresIn: number } }> {
  const response = await apiClient.get<{
    data: { downloadUrl: string; expiresIn: number };
  }>(`/leads/import/${importId}/error-report`);
  return response.data;
}

// ─── 13. Export Leads: Initiate ──────────────────────────────────────────────

/**
 * Starts an asynchronous background export job.
 * POST /leads/export
 */
export async function initiateExport(
  data: ExportPayload,
): Promise<{ data: ExportJob }> {
  const response = await apiClient.post<{ data: ExportJob }>(
    '/leads/export',
    data,
  );
  return response.data;
}

// ─── 14. Get Export Status ───────────────────────────────────────────────────

/**
 * Polls status of an export job.
 * GET /leads/export/:exportId
 */
export async function getExportStatus(
  exportId: string,
): Promise<{ data: ExportJob }> {
  const response = await apiClient.get<{ data: ExportJob }>(
    `/leads/export/${exportId}`,
  );
  return response.data;
}

// ─── 15. Download Exported File ──────────────────────────────────────────────

/**
 * Fetches presigned S3 download URL once export status is COMPLETED.
 * GET /leads/export/:exportId/download
 */
export async function getExportDownloadUrl(
  exportId: string,
): Promise<{ data: { downloadUrl: string; expiresIn: number } }> {
  const response = await apiClient.get<{
    data: { downloadUrl: string; expiresIn: number };
  }>(`/leads/export/${exportId}/download`);
  return response.data;
}
