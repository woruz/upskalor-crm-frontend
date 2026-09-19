import { apiClient } from './client';
import type {
  Quotation,
  QuotationsResponse,
  QuotationFilters,
  CreateQuotationPayload,
  UpdateQuotationPayload,
} from '@/shared/lib/types';

// ─── 1. List Quotations ──────────────────────────────────────────────────────

/**
 * Retrieves a paginated list of solar quotations with support for search, filtering, and sorting.
 * GET /quotations
 */
export async function listQuotations(
  params?: QuotationFilters,
): Promise<QuotationsResponse> {
  const response = await apiClient.get<QuotationsResponse>('/quotations', {
    params,
  });
  return response.data;
}

// ─── 2. Create Quotation ─────────────────────────────────────────────────────

/**
 * Creates a new solar quotation along with line items.
 * POST /quotations
 */
export async function createQuotation(
  data: CreateQuotationPayload,
): Promise<{ data: Quotation }> {
  const response = await apiClient.post<{ data: Quotation }>('/quotations', data);
  return response.data;
}

// ─── 3. Get Single Quotation ─────────────────────────────────────────────────

/**
 * Fetches details of a quotation by ID with line items and linked lead.
 * GET /quotations/:id
 */
export async function getQuotationById(
  id: string,
): Promise<{ data: Quotation }> {
  const response = await apiClient.get<{ data: Quotation }>(`/quotations/${id}`);
  return response.data;
}

// ─── 4. Update Quotation (Partial) ───────────────────────────────────────────

/**
 * Updates editable fields and/or replaces line items on a quotation.
 * PATCH /quotations/:id
 */
export async function updateQuotation(
  id: string,
  data: UpdateQuotationPayload,
): Promise<{ data: Quotation }> {
  const response = await apiClient.patch<{ data: Quotation }>(
    `/quotations/${id}`,
    data,
  );
  return response.data;
}

// ─── 5. Delete Quotation ─────────────────────────────────────────────────────

/**
 * Soft-deletes a quotation.
 * DELETE /quotations/:id
 */
export async function deleteQuotation(
  id: string,
): Promise<{ message: string }> {
  const response = await apiClient.delete<{ message: string }>(
    `/quotations/${id}`,
  );
  return response.data;
}
