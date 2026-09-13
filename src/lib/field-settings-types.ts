import type { FieldType } from "./handytool-types";

export interface TextFieldSettings {
  minimumLength?: number | null;
  maximumLength?: number | null;
  placeholder?: string | null;
}
export interface LongTextFieldSettings extends TextFieldSettings { rows?: number | null }
export interface NumericFieldSettings {
  minimum?: number | null;
  maximum?: number | null;
  step?: number | null;
}
export interface NumberInputFieldSettings extends NumericFieldSettings { placeholder?: string | null }
export interface DateFieldSettings { minimumDate?: string | null; maximumDate?: string | null }
export interface DateTimeFieldSettings { minimumDateTime?: string | null; maximumDateTime?: string | null }
export interface TimeFieldSettings { minimumTime?: string | null; maximumTime?: string | null; stepSeconds?: number | null }
export interface ChoiceFieldSettings { placeholder?: string | null }
export interface ItemCountSettings { minimumItems?: number | null; maximumItems?: number | null }
export interface ObjectFieldSettings { referencedObjectDefinitionId?: number | null }
export interface CollectionFieldSettings extends ItemCountSettings {
  /** Returned by the API; creation/editing sends the nested item definition instead. */
  itemDefinitionId?: number | null;
}

/** Known settings available to the dynamic editor; no arbitrary property names. */
export interface FieldSettings extends LongTextFieldSettings, NumberInputFieldSettings,
  DateFieldSettings, DateTimeFieldSettings, TimeFieldSettings, ChoiceFieldSettings,
  CollectionFieldSettings, ObjectFieldSettings {}

export interface SettingsByFieldType {
  ShortText: TextFieldSettings;
  LongText: LongTextFieldSettings;
  Markdown: TextFieldSettings;
  Integer: NumberInputFieldSettings;
  Decimal: NumberInputFieldSettings;
  Range: NumericFieldSettings;
  Date: DateFieldSettings;
  DateTime: DateTimeFieldSettings;
  Time: TimeFieldSettings;
  Dropdown: ChoiceFieldSettings;
  RadioGroup: Record<string, never>;
  Boolean: Record<string, never>;
  Checklist: ItemCountSettings;
  MultiSelect: ItemCountSettings;
  Object: ObjectFieldSettings;
  Collection: CollectionFieldSettings;
}
export type FieldSettingKey = keyof FieldSettings;
export type NumericSettingKey = { [K in FieldSettingKey]: NonNullable<FieldSettings[K]> extends number ? K : never }[FieldSettingKey];
export type StringSettingKey = Exclude<FieldSettingKey, NumericSettingKey>;

/** One source for editor controls and the settings allowed by each field type. */
export const FIELD_SETTING_KEYS: { [T in FieldType]: (keyof SettingsByFieldType[T] & FieldSettingKey)[] } = {
  ShortText: ["minimumLength","maximumLength","placeholder"],
  LongText: ["minimumLength","maximumLength","placeholder","rows"],
  Markdown: ["minimumLength","maximumLength","placeholder"],
  Integer: ["minimum","maximum","step","placeholder"],
  Decimal: ["minimum","maximum","step","placeholder"],
  Range: ["minimum","maximum","step"],
  Date: ["minimumDate","maximumDate"],
  DateTime: ["minimumDateTime","maximumDateTime"],
  Time: ["minimumTime","maximumTime","stepSeconds"],
  Dropdown: ["placeholder"], RadioGroup: [], Boolean: [],
  Checklist: ["minimumItems","maximumItems"], MultiSelect: ["minimumItems","maximumItems"],
  Object: ["referencedObjectDefinitionId"], Collection: ["minimumItems","maximumItems"],
};

export function updateSettingFromInput(settings: FieldSettings, key: FieldSettingKey, text: string): FieldSettings {
  const next = { ...settings };
  if (text === "") { delete next[key]; return next; }
  switch (key) {
    case "placeholder": case "minimumDate": case "maximumDate": case "minimumTime": case "maximumTime":
      next[key] = text; break;
    case "minimumDateTime": case "maximumDateTime":
      next[key] = text + "Z"; break;
    default:
      next[key] = Number(text);
  }
  return next;
}
