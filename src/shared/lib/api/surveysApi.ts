import { apiClient } from './client';
import type {
  SiteSurvey,
  SiteSurveyPhoto,
  SurveysResponse,
  SurveyFilters,
  CreateSurveyPayload,
  UpdateSurveyPayload,
  SurveyStatus,
} from '@/shared/lib/types';

// ─── 1. Schedule / Create Survey ─────────────────────────────────────────────

/**
 * Creates a new survey. If leadId is provided, automatically links to the lead,
 * updates lead status to SURVEY_SCHEDULED, and logs activity.
 * POST /surveys
 */
export async function createSurvey(
  data: CreateSurveyPayload,
): Promise<{ data: SiteSurvey; warning?: string }> {
  const response = await apiClient.post<{ data: SiteSurvey; warning?: string }>(
    '/surveys',
    data,
  );
  return response.data;
}

// ─── 2. List Surveys ─────────────────────────────────────────────────────────

/**
 * Retrieves a paginated list of site surveys with filtering, search, and sorting.
 * GET /surveys
 */
export async function listSurveys(
  params?: SurveyFilters,
): Promise<SurveysResponse> {
  const response = await apiClient.get<SurveysResponse>('/surveys', {
    params,
  });
  return response.data;
}

// ─── 3. Get Single Survey Details ────────────────────────────────────────────

/**
 * Fetches details of a survey by ID including linked lead info and photos.
 * GET /surveys/:id
 */
export async function getSurveyById(
  id: string,
): Promise<{ data: SiteSurvey }> {
  const response = await apiClient.get<{ data: SiteSurvey }>(`/surveys/${id}`);
  return response.data;
}

// ─── 4. Update Technical Specs & Details ─────────────────────────────────────

/**
 * Updates partial technical specifications or survey schedule.
 * PATCH /surveys/:id
 */
export async function updateSurvey(
  id: string,
  data: UpdateSurveyPayload,
): Promise<{ data: SiteSurvey; warning?: string }> {
  const response = await apiClient.patch<{ data: SiteSurvey; warning?: string }>(
    `/surveys/${id}`,
    data,
  );
  return response.data;
}

// ─── 5. Quick Status Transition ──────────────────────────────────────────────

/**
 * Updates the survey status adhering to the state machine.
 * PATCH /surveys/:id/status
 */
export async function updateSurveyStatus(
  id: string,
  status: SurveyStatus,
): Promise<{ data: SiteSurvey }> {
  const response = await apiClient.patch<{ data: SiteSurvey }>(
    `/surveys/${id}/status`,
    { status },
  );
  return response.data;
}

// ─── 6. Assign Technician ────────────────────────────────────────────────────

/**
 * Assigns or reassigns a technician to the survey.
 * PATCH /surveys/:id/assign
 */
export async function assignSurveyTechnician(
  id: string,
  data: { assignedTechId: string | null; assignedTech?: string },
): Promise<{ data: SiteSurvey; warning?: string }> {
  const response = await apiClient.patch<{ data: SiteSurvey; warning?: string }>(
    `/surveys/${id}/assign`,
    data,
  );
  return response.data;
}

// ─── 7. Upload Survey Photo Metadata ─────────────────────────────────────────

/**
 * Saves metadata for a photo captured/uploaded during the site survey.
 * POST /surveys/:id/photos
 */
export async function uploadSurveyPhoto(
  id: string,
  data: {
    fileUrl: string;
    fileName: string;
    fileSizeBytes?: number;
    mimeType?: string;
  },
): Promise<{ data: SiteSurveyPhoto }> {
  const response = await apiClient.post<{ data: SiteSurveyPhoto }>(
    `/surveys/${id}/photos`,
    data,
  );
  return response.data;
}

// ─── 8. Delete Survey Photo ──────────────────────────────────────────────────

/**
 * Deletes photo metadata record.
 * DELETE /surveys/:id/photos/:photoId
 */
export async function deleteSurveyPhoto(
  id: string,
  photoId: string,
): Promise<{ message: string; photoId: string }> {
  const response = await apiClient.delete<{ message: string; photoId: string }>(
    `/surveys/${id}/photos/${photoId}`,
  );
  return response.data;
}

// ─── 9. Soft Delete Survey ───────────────────────────────────────────────────

/**
 * Soft deletes survey.
 * DELETE /surveys/:id
 */
export async function deleteSurvey(
  id: string,
): Promise<{ message: string; surveyId: string }> {
  const response = await apiClient.delete<{ message: string; surveyId: string }>(
    `/surveys/${id}`,
  );
  return response.data;
}

// ─── 10. Get Survey History for a Specific Lead ──────────────────────────────

/**
 * Returns all site surveys linked to a specific lead, ordered by surveyDateTime descending.
 * GET /leads/:leadId/surveys
 */
export async function getLeadSurveys(
  leadId: string,
): Promise<{ data: SiteSurvey[] }> {
  const response = await apiClient.get<{ data: SiteSurvey[] }>(
    `/leads/${leadId}/surveys`,
  );
  return response.data;
}
