/**
 * Mirrors the contracts in the handytool-api project (Contracts/DynamicObjectContracts.cs).
 * The API serialises camelCase JSON with string enums.
 */

export const FIELD_TYPES = [
  "ShortText",
  "LongText",
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
  return fieldType === "Dropdown" || fieldType === "MultiSelect";
}

export interface FieldOption {
  id: number;
  value: string;
  label: string;
  displayOrder: number;
  isActive: boolean;
}

export interface FieldDefinition {
  id: number;
  key: string;
  name: string;
  description?: string;
  fieldType: FieldType;
  isRequired: boolean;
  isActive: boolean;
  displayOrder: number;
  settings: Record<string, unknown>;
  options: FieldOption[];
}

export interface ObjectDefinition {
  id: number;
  userId: number;
  name: string;
  description: string;
  isActive: boolean;
  createdDate: string;
  modifiedDate: string;
  fields?: FieldDefinition[];
}

export interface ObjectRecord {
  id: number;
  objectDefinitionId: number;
  userId: number;
  title: string;
  description: string;
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
