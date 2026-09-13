export type AdminSection = "users" | "companies" | "categories";
export interface AdminRow {
  id: number; modifiedDate: string; name?: string; displayName?: string; email?: string; phone?: string | null;
  preferredLanguage?: string | null; companyId?: number | null; companyName?: string | null; companyRole?: string | null; accountTypeId?: number | null;
  isActive: boolean; isSuperAdmin?: boolean; country?: string | null; address?: string | null; websiteUrl?: string | null;
  seatLimit?: number; expiresAt?: string | null; description?: string; displayOrder?: number; masterCategoryId?: number | null;
  translations?: { languageCode: string; name: string | null; description: string | null }[];
}
export interface AdminPage { items: AdminRow[]; total: number; parent?: { id: number; name: string } }
export interface AdminPlan { id: number; name: string; code: string }

/** Matches Contracts/AdminContracts.cs. */
export type CompanyRole = "Owner" | "Admin" | "Member";
export interface AdminUserEdit {
  displayName: string; email: string; phone: string | null;
  preferredLanguage: string | null; companyId: number | null;
  companyRole: CompanyRole | null; accountTypeId: number | null;
  isActive: boolean; isSuperAdmin: boolean; modifiedDate: string;
}
export interface AdminCompanyEdit {
  name: string; country: string | null; address: string | null; websiteUrl: string | null;
  accountTypeId: number; seatLimit: number; expiresAt: string | null;
  isActive: boolean; modifiedDate: string;
}
export interface AdminTranslation {
  languageCode: string; name: string | null; description: string | null;
}
export interface AdminCategoryEdit {
  name: string; description: string | null; isActive: boolean; displayOrder: number;
  masterCategoryId: number | null; translations: AdminTranslation[] | null; modifiedDate: string | null;
}
/** Keeps the endpoint, ID requirements and payload correlated. */
export type AdminSaveRequest =
  | { section: "users"; id: number; payload: AdminUserEdit }
  | { section: "companies"; id: number; payload: AdminCompanyEdit }
  | { section: "categories"; id: number | null; sub: boolean; payload: AdminCategoryEdit };
