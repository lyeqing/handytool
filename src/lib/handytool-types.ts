import type { FieldSettings, NumericSettingKey, StringSettingKey } from "./field-settings-types";
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
  settings: FieldSettings;
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
  values: JsonObject;
  createdDate: string;
  modifiedDate: string;
}


/** JSON request contracts matching Contracts/DynamicObjectContracts.cs in the API. */
export interface CreateFieldOptionRequest {
  value: string;
  label: string;
  displayOrder?: number;
  labelTranslations?: Record<string, string> | null;
  id?: number | null;
  isActive?: boolean;
}

export interface CreateFieldDefinitionRequest {
  key: string;
  name: string;
  fieldType: FieldType;
  description?: string | null;
  isRequired?: boolean;
  displayOrder?: number;
  /** Settings vary by field type and are validated by the API. */
  settings?: FieldSettings | null;
  options?: CreateFieldOptionRequest[] | null;
  nameTranslations?: Record<string, string> | null;
  descriptionTranslations?: Record<string, string> | null;
  placeholderTranslations?: Record<string, string> | null;
  item?: CreateFieldDefinitionRequest | null;
  id?: number | null;
  isActive?: boolean;
}

export interface CreateObjectDefinitionRequest {
  name: string;
  description?: string | null;
  fields?: CreateFieldDefinitionRequest[] | null;
  nameTranslations?: Record<string, string> | null;
  descriptionTranslations?: Record<string, string> | null;
  masterCategoryId?: number;
  subcategoryId?: number | null;
  visibility?: ObjectDefinition["visibility"];
  requiredAccessLevel?: number;
}

export interface EditObjectDefinitionRequest {
  definition: CreateObjectDefinitionRequest;
  /** ISO 8601 timestamp originally loaded from the API, used to detect stale edits. */
  modifiedDate: string;
  isActive?: boolean;
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
  settings: FieldSettings,
  name: NumericSettingKey,
): number | undefined {
  const value = settings[name];
  return typeof value === "number" ? value : undefined;
}

export function stringSetting(
  settings: FieldSettings,
  name: StringSettingKey,
): string | undefined {
  const value = settings[name];
  return typeof value === "string" ? value : undefined;
}

/** JSON-compatible record data. Missing fields are omitted, rather than stored as undefined. */
export type JsonValue = string | number | boolean | null | JsonValue[] | JsonObject;
export interface JsonObject { [key: string]: JsonValue }

export interface CreateObjectRecordRequest {
  title?: string | null;
  description?: string | null;
  values: JsonObject;
  visibility?: ObjectRecord["visibility"];
}
export interface UpdateObjectRecordRequest extends CreateObjectRecordRequest {
  revision: number;
}
