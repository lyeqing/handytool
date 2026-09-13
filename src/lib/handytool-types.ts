/**
 * Mirrors the contracts in the handytool-api project (Contracts/DynamicObjectContracts.cs).
 * The API serialises camelCase JSON with string enums.
 */

export const FIELD_TYPES = [
  "ShortText",
  "LongText",
  "Time", "RadioGroup", "Checklist", "Markdown", "Object", "Collection",
  "Integer",
  "Decimal",
  "Boolean",
  "Date",
  "DateTime",
  "Range",
  "Dropdown",
  "MultiSelect",
] as const;

export type FieldType = (typeof FIELD_TYPES)[number];

/** Field types whose allowed values are relational FieldOption rows. */
export function hasOptions(fieldType: FieldType): boolean {
  return ["Dropdown", "MultiSelect", "RadioGroup", "Checklist"].includes(fieldType);
}

export interface FieldOption {
  labelTranslations?: Record<string, string>;
  id: number;
  value: string;
  label: string;
  displayOrder: number;
  isActive: boolean;
}

export interface FieldDefinition {
  nameTranslations?: Record<string, string>;
  descriptionTranslations?: Record<string, string>;
  placeholderTranslations?: Record<string, string>;
  item?: FieldDefinition;
  fields?: FieldDefinition[];
  id: number;
  key: string;
  name: string;
  description?: string | null;
  fieldType: FieldType;
  isRequired: boolean;
  isActive: boolean;
  displayOrder: number;
  settings: Record<string, unknown>;
  options: FieldOption[];
}

export interface ObjectDefinition {
  canEdit?: boolean;
  visibility: "Private" | "Company" | "Public";
  requiredAccessLevel: number;
  masterCategoryId: number;
  subcategoryId?: number | null;
  companyId?: number | null;
  nameTranslations?: Record<string, string>;
  descriptionTranslations?: Record<string, string>;
  id: number;
  createdByUserId?: number | null;
  name: string;
  description: string;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string;
  fields?: FieldDefinition[];
}

export interface ObjectRecord {
  canEdit?: boolean;
  revision: number;
  visibility: "Private" | "Company";
  companyId?: number | null;
  id: number;
  objectDefinitionId: number;
  createdByUserId?: number | null;
  title?: string | null;
  description: string | null;
  values: Record<string, unknown>;
  createdDate: string;
  modifiedDate: string;
}

/** One structured failure: `{ fieldKey, errorCode, message }`. */
export interface ValidationError {
  fieldKey: string;
  errorCode: string;
  message: string;
}

export interface ValidationErrorResponse {
  title: string;
  status: number;
  errors: ValidationError[];
}

/** Numeric setting helper - settings arrive as untyped jsonb. */
export function numberSetting(
  settings: Record<string, unknown>,
  name: string,
): number | undefined {
  const value = settings[name];
  return typeof value === "number" ? value : undefined;
}

export function stringSetting(
  settings: Record<string, unknown>,
  name: string,
): string | undefined {
  const value = settings[name];
  return typeof value === "string" ? value : undefined;
}
