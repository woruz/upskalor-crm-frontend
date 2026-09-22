import type { SiteSurvey } from '@/shared/lib/types';

const STORAGE_KEY = 'upskalor_crm_site_surveys';

export const INITIAL_SURVEYS: SiteSurvey[] = [];

export const surveyService = {
  getSurveys(): SiteSurvey[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        return [];
      }
      return JSON.parse(stored);
    } catch {
      return [];
    }
  },

  getSurveysForLead(leadId: string, customerName?: string): SiteSurvey[] {
    const all = this.getSurveys();
    const cleanLeadId = leadId?.trim().toLowerCase();
    const cleanName = customerName?.trim().toLowerCase();

    return all.filter((s) => {
      if (s.leadId && cleanLeadId && s.leadId.toLowerCase() === cleanLeadId) {
        return true;
      }
      if (cleanName && s.customerName && s.customerName.toLowerCase() === cleanName) {
        return true;
      }
      return false;
    });
  },

  getSurveyById(id: string): SiteSurvey | undefined {
    const all = this.getSurveys();
    return all.find((s) => s.id === id);
  },

  addSurvey(data: Omit<SiteSurvey, 'id'> & { id?: string }): SiteSurvey {
    const all = this.getSurveys();
    const newSurvey: SiteSurvey = {
      ...data,
      id: data.id || `srv-${Date.now()}`,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const updated = [newSurvey, ...all];
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to persist survey', e);
    }
    return newSurvey;
  },

  updateSurvey(id: string, updates: Partial<SiteSurvey>): SiteSurvey | null {
    const all = this.getSurveys();
    const index = all.findIndex((s) => s.id === id);
    if (index === -1) return null;

    const updatedSurvey = {
      ...all[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    all[index] = updatedSurvey;

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch (e) {
      console.error('Failed to update survey', e);
    }
    return updatedSurvey;
  },

  deleteSurvey(id: string): boolean {
    const all = this.getSurveys();
    const filtered = all.filter((s) => s.id !== id);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
    } catch (e) {
      console.error('Failed to delete survey', e);
    }
    return filtered.length < all.length;
  },
};
