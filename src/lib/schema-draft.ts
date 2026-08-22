import type { FieldType } from "./handytool-types";
import { hasOptions } from "./handytool-types";

/**
 * The shape the schema builder keeps in browser state, and the shape the Server Action receives.
 * Everything is a string because it comes straight from form inputs; conversion to the API payload
 * happens in one place, `toDefinitionPayload`.
 */

export interface DraftOption {
  uid: string;
  value: string;
  label: string;
}

export interface DraftField {
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
    fieldType: "Text",
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
  const settings: Record<string, unknown> = {};

  switch (field.fieldType) {
    case "Text":
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
  return {
    name: draft.name.trim(),
    description: draft.description.trim(),
    fields: draft.fields.map((field, index) => ({
      key: field.key.trim(),
      name: field.name.trim(),
      description: field.description.trim() || null,
      fieldType: field.fieldType,
      isRequired: field.isRequired,
      displayOrder: index + 1,
      settings: buildSettings(field),
      options: hasOptions(field.fieldType)
        ? field.options.map((option, optionIndex) => ({
            value: option.value.trim(),
            label: option.label.trim(),
            displayOrder: optionIndex + 1,
          }))
        : [],
    })),
  };
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
        fieldType: "Text",
        isRequired: true,
        minimumLength: "2",
        maximumLength: "120",
      },
      {
        ...emptyField(uid()),
        key: "emailAddress",
        name: "Email Address",
        fieldType: "Text",
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
