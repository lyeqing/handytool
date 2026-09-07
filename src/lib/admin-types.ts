export type AdminSection = "users" | "companies" | "categories";
export interface AdminRow {
  id: number; modifiedDate: string; name?: string; displayName?: string; email?: string; phone?: string | null;
  preferredLanguage?: string | null; companyId?: number | null; companyRole?: string | null; accountTypeId?: number | null;
  isActive: boolean; isSuperAdmin?: boolean; country?: string | null; address?: string | null; websiteUrl?: string | null;
  seatLimit?: number; expiresAt?: string | null; description?: string; displayOrder?: number; masterCategoryId?: number | null;
  translations?: { languageCode: string; name: string | null; description: string | null }[];
}
export interface AdminPage { items: AdminRow[]; total: number }
export interface AdminPlan { id: number; name: string; code: string }
