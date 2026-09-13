'use client'
import Link from 'next/link'
import { startTransition, useActionState, useId, useState } from 'react'
import { numberSetting, stringSetting, type FieldDefinition, type ObjectRecord, type JsonValue, type JsonObject } from '@/lib/handytool-types'
import type { Dictionary } from '@/i18n/get-dictionary'
import { createRecordAction, type RecordDraft, type RecordFormState } from './actions'
import { updateRecordAction } from '../../../../records/[id]/edit/actions'

type Copy = Dictionary['editing']
const objectValue = (value: JsonValue | undefined): JsonObject => (value !== null && typeof value === 'object' && !Array.isArray(value) ? value : {})
function replace(values: JsonObject, key: string, value: JsonValue | undefined) {
  const next = { ...values }
  if (value === undefined) delete next[key]
  else next[key] = value
  return next
}
export function RecordForm({
  definitionId,
  fields,
  locale,
  t,
  initial,
}: {
  definitionId: number
  fields: FieldDefinition[]
  locale: string
  t: Copy
  initial?: ObjectRecord
}) {
  const [draft, setDraft] = useState<RecordDraft>(() => ({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    values: structuredClone(initial?.values ?? {}),
    revision: initial?.revision,
  }))
  const [state, submit, pending] = useActionState<RecordFormState | null, RecordDraft>(
    initial ? updateRecordAction.bind(null, locale, initial.id) : createRecordAction.bind(null, locale, definitionId),
    null,
  )
  return (
    <form
      onSubmit={(event) => {
        event.preventDefault()
        startTransition(() => submit(draft))
      }}
      className='space-y-6'
    >
      {state && (
        <div role='alert' className='rounded-xl border border-red-200 bg-red-50 p-4 wrap-break-word text-red-800'>
          <p>{state.message}</p>
          <ul className='mt-2 space-y-1'>
            {state.errors.map((error, index) => (
              <li key={index}>
                {error.fieldKey}: {error.message}
              </li>
            ))}
          </ul>
          {state.conflict && (
            <button type='button' className='btn-secondary mt-3' onClick={() => window.location.reload()}>
              {t.reload}
            </button>
          )}
        </div>
      )}
      <fieldset disabled={pending} className='space-y-6 disabled:opacity-60'>
        <section className='grid gap-4 rounded-2xl border border-slate-200 bg-white p-5'>
          <label className='grid gap-2 text-sm font-medium'>
            {t.title}
            <input className='form-input' maxLength={300} value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
          </label>
          <label className='grid gap-2 text-sm font-medium'>
            {t.description}
            <textarea className='form-input' maxLength={4000} value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </label>
        </section>
        <section className='space-y-5 rounded-2xl border border-slate-200 bg-white p-5'>
          <ObjectInputs fields={fields} value={draft.values} t={t} onChange={(values) => setDraft({ ...draft, values })} />
        </section>
        <div className='flex flex-wrap gap-3'>
          <button type='submit' className='btn-primary'>
            {pending ? t.saving : initial ? t.save : t.create}
          </button>
          <Link className='btn-secondary' href={initial ? `/${locale}/records/${initial.id}` : `/${locale}`}>
            {t.cancel}
          </Link>
        </div>
      </fieldset>
    </form>
  )
}
function ObjectInputs({ fields, value, onChange, t }: { fields: FieldDefinition[]; value: JsonObject; onChange: (value: JsonObject) => void; t: Copy }) {
  return [...fields]
    .filter((f) => f.isActive)
    .sort((a, b) => a.displayOrder - b.displayOrder)
    .map((field) => <ValueInput key={field.id} field={field} value={value[field.key]} onChange={(next) => onChange(replace(value, field.key, next))} t={t} />)
}
function ValueInput({
  field,
  value,
  onChange,
  t,
}: {
  field: FieldDefinition
  value: JsonValue | undefined
  onChange: (value: JsonValue | undefined) => void
  t: Copy
}) {
  const id = useId(),
    settings = field.settings,
    text = value == null ? '' : String(value)
  const options = field.options.filter((o) => o.isActive)
  let control: React.ReactNode
  switch (field.fieldType) {
    case 'Object':
      control = (
        <div className='space-y-4 border-l-2 border-sky-100 pl-4'>
          {value == null ? (
            <button type='button' className='btn-secondary' onClick={() => onChange({})}>
              {t.create}
            </button>
          ) : (
            <ObjectInputs fields={field.fields ?? []} value={objectValue(value)} onChange={onChange} t={t} />
          )}
        </div>
      )
      break
    case 'Collection': {
      const items = Array.isArray(value) ? value : []
      control = (
        <div className='space-y-4 border-l-2 border-sky-100 pl-4'>
          {field.item ? (
            <>
              {items.map((item, index) => (
                <div key={index} className='space-y-2 rounded-xl border border-slate-200 p-3'>
                  <ValueInput
                    field={field.item!}
                    value={item}
                    t={t}
                    onChange={(next) => onChange(items.map((old, i) => (i === index ? (next ?? null) : old)))}
                  />
                  <button type='button' className='btn-secondary' onClick={() => onChange(items.filter((_, i) => i !== index))}>
                    {t.remove} {index + 1}
                  </button>
                </div>
              ))}
              <button
                type='button'
                className='btn-secondary'
                onClick={() => onChange([...items, field.item?.fieldType === 'Object' ? {} : field.item?.fieldType === 'Collection' ? [] : null])}
              >
                {t.addItem}
              </button>
            </>
          ) : (
            <p role='alert'>{t.unsupported}</p>
          )}
        </div>
      )
      break
    }
    case 'Boolean':
      control = (
        <select
          id={id}
          className='form-input'
          value={value == null ? '' : String(value)}
          onChange={(e) => onChange(e.target.value === '' ? undefined : e.target.value === 'true')}
        >
          <option value=''>{t.none}</option>
          <option value='true'>{t.yes}</option>
          <option value='false'>{t.no}</option>
        </select>
      )
      break
    case 'Dropdown':
    case 'RadioGroup':
      control =
        field.fieldType === 'Dropdown' ? (
          <select id={id} className='form-input' value={text} onChange={(e) => onChange(e.target.value || undefined)}>
            <option value=''>{t.none}</option>
            {options.map((o) => (
              <option key={o.id} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        ) : (
          <div className='flex flex-wrap gap-4'>
            {options.map((o) => (
              <label key={o.id} className='flex items-center gap-2'>
                <input type='radio' name={id} value={o.value} checked={value === o.value} onChange={() => onChange(o.value)} />
                {o.label}
              </label>
            ))}
          </div>
        )
      break
    case 'MultiSelect':
    case 'Checklist': {
      const selected = Array.isArray(value) ? value : []
      control = (
        <div className='flex flex-wrap gap-4'>
          {options.map((o) => (
            <label key={o.id} className='flex items-center gap-2'>
              <input
                type='checkbox'
                checked={selected.includes(o.value)}
                onChange={(e) => onChange(e.target.checked ? [...selected, o.value] : selected.filter((v) => v !== o.value))}
              />
              {o.label}
            </label>
          ))}
        </div>
      )
      break
    }
    case 'LongText':
    case 'Markdown':
      control = (
        <textarea
          id={id}
          className='form-input'
          rows={numberSetting(settings, 'rows') ?? 4}
          value={text}
          placeholder={stringSetting(settings, 'placeholder')}
          onChange={(e) => onChange(e.target.value)}
        />
      )
      break
    case 'Range':
      control = (
        <div className='flex flex-wrap items-center gap-3'>
          <input
            type='range'
            className='min-w-0 flex-1 accent-sky-600'
            aria-label={field.name + ' · ' + t.fieldTypes.Range}
            min={numberSetting(settings, 'minimum') ?? 0}
            max={numberSetting(settings, 'maximum') ?? 100}
            step={numberSetting(settings, 'step') ?? 1}
            value={typeof value === 'number' ? value : (numberSetting(settings, 'minimum') ?? 0)}
            onChange={(e) => onChange(Number(e.target.value))}
          />
          <input
            id={id}
            type='number'
            className='form-input w-28'
            value={text}
            step={numberSetting(settings, 'step') ?? 1}
            min={numberSetting(settings, 'minimum')}
            max={numberSetting(settings, 'maximum')}
            onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
          />
        </div>
      )
      break
    case 'Integer':
    case 'Decimal':
      control = (
        <input
          id={id}
          type='number'
          className='form-input'
          value={text}
          step={numberSetting(settings, 'step') ?? (field.fieldType === 'Integer' ? 1 : 'any')}
          min={numberSetting(settings, 'minimum')}
          max={numberSetting(settings, 'maximum')}
          onChange={(e) => onChange(e.target.value === '' ? undefined : Number(e.target.value))}
        />
      )
      break
    case 'DateTime':
      // Show UTC explicitly; keep untouched offset strings and fractional precision in draft state.
      control = (
        <>
          <input
            id={id}
            type='datetime-local'
            step='any'
            className='form-input'
            value={text && !Number.isNaN(Date.parse(text)) ? new Date(text).toISOString().replace(/Z$/, '') : text}
            onChange={(e) => onChange(e.target.value ? e.target.value + 'Z' : undefined)}
          />
          <p className='mt-1 text-xs text-slate-500'>{t.utc}</p>
        </>
      )
      break
    case 'Date':
    case 'Time':
      control = (
        <input
          id={id}
          className='form-input'
          type={field.fieldType === 'Date' ? 'date' : 'time'}
          step={field.fieldType === 'Time' ? (numberSetting(settings, 'stepSeconds') ?? 'any') : undefined}
          value={text}
          onChange={(e) => onChange(e.target.value || undefined)}
        />
      )
      break
    default:
      control = (
        <input id={id} className='form-input' value={text} placeholder={stringSetting(settings, 'placeholder')} onChange={(e) => onChange(e.target.value)} />
      )
  }
  const group = ['Object', 'Collection', 'RadioGroup', 'MultiSelect', 'Checklist'].includes(field.fieldType)
  return (
    <fieldset className='min-w-0 space-y-2'>
      {group ? (
        <legend className='mb-2 text-sm font-medium'>
          {field.name}
          {field.isRequired && ` · ${t.required}`}
        </legend>
      ) : (
        <label htmlFor={id} className='block text-sm font-medium'>
          {field.name}
          {field.isRequired && ` · ${t.required}`}
        </label>
      )}
      {control}
      {field.description && <p className='text-sm text-slate-500'>{field.description}</p>}
      {value !== undefined && (
        <button type='button' className='text-xs text-sky-700 hover:underline' onClick={() => onChange(undefined)}>
          {t.clear}
        </button>
      )}
    </fieldset>
  )
}
