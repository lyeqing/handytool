import type { FieldType, FieldDefinition, ObjectDefinition } from "./handytool-types";
import { hasOptions } from "./handytool-types";

/**
 * The shape the schema builder keeps in browser state, and the shape the Server Action receives.
 * Existing fields retain IDs, typed settings and translation maps. New field defaults also support
 * the original string-based seed settings. API payload conversion lives in toDefinitionPayload.
 */

export interface DraftOption {
  id?: number;
  isActive?: boolean;
  labelTranslations?: Record<string, string>;
  uid: string;
  value: string;
  label: string;
}

export interface DraftField {
  id?: number;
  isActive?: boolean;
  settings?: Record<string, unknown>;
  nameTranslations?: Record<string, string>;
  descriptionTranslations?: Record<string, string>;
  placeholderTranslations?: Record<string, string>;
  item?: DraftField;
  uid: string;
  key: string;
  name: string;
  description: string;
  fieldType: FieldType;
  isRequired: boolean;
  minimumLength: string;
  maximumLength: string;
  minimum: string;
  maximum: string;
  step: string;
  minimumDate: string;
  maximumDate: string;
  options: DraftOption[];
}

export interface SchemaDraft {
  id?: number;
  modifiedDate?: string;
  isActive?: boolean;
  visibility?: ObjectDefinition["visibility"];
  requiredAccessLevel?: number;
  masterCategoryId?: number;
  subcategoryId?: number | null;
  nameTranslations?: Record<string, string>;
  descriptionTranslations?: Record<string, string>;
  name: string;
  description: string;
  fields: DraftField[];
}

export function emptyField(uid: string): DraftField {
  return {
    uid,
    key: "",
    name: "",
    description: "",
    fieldType: "ShortText",
    isRequired: false,
    minimumLength: "",
    maximumLength: "",
    minimum: "",
    maximum: "",
    step: "",
    minimumDate: "",
    maximumDate: "",
    options: [],
  };
}

function numeric(value: string): number | undefined {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function put(
  target: Record<string, unknown>,
  key: string,
  value: number | string | undefined,
) {
  if (value !== undefined && value !== "") target[key] = value;
}

/**
 * Only settings that apply to the chosen field type are sent. Dropdown choices are never put in
 * settings - they are relational FieldOption rows.
 */
export function buildSettings(field: DraftField): Record<string, unknown> {
  if (field.settings) return field.settings;
  const settings: Record<string, unknown> = {};

  switch (field.fieldType) {
    case "ShortText":
    case "LongText":
      put(settings, "minimumLength", numeric(field.minimumLength));
      put(settings, "maximumLength", numeric(field.maximumLength));
      break;
    case "Integer":
    case "Decimal":
      put(settings, "minimum", numeric(field.minimum));
      put(settings, "maximum", numeric(field.maximum));
      break;
    case "Range":
      put(settings, "minimum", numeric(field.minimum));
      put(settings, "maximum", numeric(field.maximum));
      put(settings, "step", numeric(field.step));
      break;
    case "Date":
      put(settings, "minimumDate", field.minimumDate);
      put(settings, "maximumDate", field.maximumDate);
      break;
    default:
      break;
  }

  return settings;
}

export function toDefinitionPayload(draft: SchemaDraft) {
  const fieldPayload = (field: DraftField, index: number): Record<string, unknown> => {
    const settings = { ...buildSettings(field) };
    if (field.fieldType === "Collection") delete settings.itemDefinitionId;
    return {
      id: field.id, key: field.key.trim(), name: field.name.trim(),
      description: field.description.trim() || null, fieldType: field.fieldType,
      isRequired: field.isRequired, isActive: field.isActive ?? true, displayOrder: index + 1,
      nameTranslations: field.nameTranslations, descriptionTranslations: field.descriptionTranslations,
      placeholderTranslations: field.placeholderTranslations, settings,
      item: field.item ? fieldPayload(field.item, 0) : undefined,
      options: hasOptions(field.fieldType) ? field.options.map((option, i) => ({
        id: option.id, value: option.value.trim(), label: option.label.trim(),
        isActive: option.isActive ?? true, displayOrder: i + 1, labelTranslations: option.labelTranslations,
      })) : [],
    };
  };
  return {
    name: draft.name.trim(), description: draft.description.trim(),
    visibility: draft.visibility ?? "Private", requiredAccessLevel: draft.requiredAccessLevel ?? 0,
    masterCategoryId: draft.masterCategoryId ?? -1, subcategoryId: draft.subcategoryId,
    nameTranslations: draft.nameTranslations, descriptionTranslations: draft.descriptionTranslations,
    fields: draft.fields.map(fieldPayload),
  };
}

export function definitionToDraft(definition: ObjectDefinition): SchemaDraft {
  const fieldDraft = (field: FieldDefinition): DraftField => ({
    ...emptyField(String(field.id)), ...field, description: field.description ?? "",
    uid: String(field.id), settings: { ...field.settings },
    options: field.options.map(option => ({ ...option, uid: String(option.id) })),
    item: field.item ? fieldDraft(field.item) : undefined,
  });
  return { ...definition, fields: (definition.fields ?? []).map(fieldDraft) };
}

/** A ready-made "Customer" schema so the page is useful the moment it loads. */
export function customerSchemaDraft(uid: () => string): SchemaDraft {
  return {
    name: "Customer",
    description: "A customer record captured by the field team.",
    fields: [
      {
        ...emptyField(uid()),
        key: "fullName",
        name: "Full Name",
        fieldType: "ShortText",
        isRequired: true,
        minimumLength: "2",
        maximumLength: "120",
      },
      {
        ...emptyField(uid()),
        key: "emailAddress",
        name: "Email Address",
        fieldType: "ShortText",
        isRequired: true,
        maximumLength: "200",
      },
      {
        ...emptyField(uid()),
        key: "signedUpOn",
        name: "Signed Up On",
        fieldType: "Date",
        isRequired: true,
      },
      {
        ...emptyField(uid()),
        key: "lifetimeValue",
        name: "Lifetime Value",
        fieldType: "Decimal",
        minimum: "0",
        maximum: "1000000",
      },
      {
        ...emptyField(uid()),
        key: "satisfaction",
        name: "Satisfaction",
        fieldType: "Range",
        isRequired: true,
        minimum: "1",
        maximum: "10",
        step: "1",
      },
      {
        ...emptyField(uid()),
        key: "isActive",
        name: "Active Customer",
        fieldType: "Boolean",
        isRequired: true,
      },
      {
        ...emptyField(uid()),
        key: "tier",
        name: "Tier",
        fieldType: "Dropdown",
        options: [
          { uid: uid(), value: "bronze", label: "Bronze" },
          { uid: uid(), value: "silver", label: "Silver" },
          { uid: uid(), value: "gold", label: "Gold" },
        ],
      },
      {
        ...emptyField(uid()),
        key: "contactMethods",
        name: "Contact Methods",
        fieldType: "MultiSelect",
        options: [
          { uid: uid(), value: "email", label: "Email" },
          { uid: uid(), value: "sms", label: "SMS" },
          { uid: uid(), value: "phone", label: "Phone" },
        ],
      },
      {
        ...emptyField(uid()),
        key: "notes",
        name: "Notes",
        fieldType: "LongText",
        maximumLength: "2000",
      },
    ],
  };
}
