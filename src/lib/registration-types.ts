export interface RegistrationPayload {
  displayName: string;
  email: string;
  password: string;
  phone?: string;
  accountKind: "Personal" | "Company";
  company?: { name: string; country?: string; address?: string; websiteUrl?: string };
}
