/** JSON responses matching Contracts/AuthContracts.cs in handytool-api. */
export interface UserResponse {
  id: number;
  email: string;
  displayName: string;
  preferredLanguage: string | null;
  /** ISO 8601 timestamp. */
  createdDate: string;
  phone: string | null;
  companyId: number | null;
  companyRole: "Owner" | "Admin" | "Member" | null;
  isSuperAdmin: boolean;
  companyName: string | null;
}

export interface AuthenticatedResponse {
  token: string;
  /** ISO 8601 timestamp. */
  expiresDate: string;
  user: UserResponse;
}
