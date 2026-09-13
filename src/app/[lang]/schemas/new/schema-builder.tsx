'use client'

import Link from 'next/link'
import { FIELD_SETTING_KEYS, updateSettingFromInput, type FieldSettingKey } from '@/lib/field-settings-types'
import { startTransition, useActionState, useId, useRef, useState, type ReactNode } from 'react'
import { FIELD_TYPES, hasOptions, type FieldType, type ObjectDefinition } from '@/lib/handytool-types'
import { buildSettings, emptySchemaDraft, definitionToDraft, emptyField, type DraftField, type SchemaDraft } from '@/lib/schema-draft'
import type { Dictionary } from '@/i18n/get-dictionary'
import { createSchemaAction } from './actions'
import { updateSchemaAction } from '../[id]/edit/actions'

type Copy = Dictionary['editing']

export function SchemaBuilder({
  locale,
  t,
  initial,
  definitions = [],
}: {
  locale: string
  t: Copy
  initial?: ObjectDefinition
  definitions?: ObjectDefinition[]
}) {
  const next = useRef(0)
  const uid = () => `field-${++next.current}`
  const [draft, setDraft] = useState<SchemaDraft>(() => {
    let seed = 0
    return initial ? definitionToDraft(initial) : emptySchemaDraft(() => `seed-${++seed}`)
  })
  const [state, submit, pending] = useActionState(initial ? updateSchemaAction.bind(null, locale, initial.id) : createSchemaAction.bind(null, locale), null)
  const move = (index: number, direction: number) =>
    setDraft((current) => {
      const fields = [...current.fields]
      const to = index + direction
      ;[fields[index], fields[to]] = [fields[to], fields[index]]
      return { ...current, fields }
    })
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
          <ul>
            {state.errors.map((e, i) => (
              <li key={i}>
                {e.fieldKey}: {e.message}
              </li>
            ))}
          </ul>
          {'conflict' in state && state.conflict === true && (
            <button type='button' className='btn-secondary mt-3' onClick={() => window.location.reload()}>
              {t.reload}
            </button>
          )}
        </div>
      )}
      <fieldset disabled={pending} className='min-w-0 space-y-7 disabled:opacity-60'>
        <section className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
          <div className='flex items-center gap-3 border-b border-slate-200 bg-slate-50/80 px-5 py-4 sm:px-6'>
            <span className='rounded-xl bg-sky-100 p-2.5 text-sky-700'>
              <EditorIcon kind='schema' />
            </span>
            <div>
              <h2 className='font-semibold text-slate-900'>{t.schemaDetails}</h2>
              <p className='mt-0.5 text-sm text-slate-500'>{t.schemaDetailsHint}</p>
            </div>
          </div>
          <div className='space-y-5 p-5 sm:p-6'>
            <label className='grid min-w-0 content-start gap-2 text-sm font-medium'>
              {t.name}
              <input
                required
                maxLength={200}
                className='form-input min-w-0 transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-100 read-only:bg-slate-50 disabled:bg-slate-100 motion-reduce:transition-none'
                placeholder={t.schemaNamePlaceholder}
                value={draft.name}
                onChange={(e) => setDraft({ ...draft, name: e.target.value })}
              />
            </label>
            <label className='grid min-w-0 content-start gap-2 text-sm font-medium'>
              {t.description}
              <textarea
                maxLength={2000}
                className='form-input min-w-0 transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-100 read-only:bg-slate-50 disabled:bg-slate-100 motion-reduce:transition-none'
                placeholder={t.schemaDescriptionPlaceholder}
                value={draft.description}
                onChange={(e) => setDraft({ ...draft, description: e.target.value })}
              />
            </label>
            <Disclosure title={t.translations} hint={t.translationsHint} icon='language'>
              <Translations t={t} label={t.name} value={draft.nameTranslations} onChange={(value) => setDraft({ ...draft, nameTranslations: value })} />
              <Translations
                t={t}
                label={t.description}
                value={draft.descriptionTranslations}
                onChange={(value) => setDraft({ ...draft, descriptionTranslations: value })}
              />
            </Disclosure>
            {initial && (
              <>
                <label className='flex items-center gap-2'>
                  <input
                    className='size-4 accent-sky-600'
                    type='checkbox'
                    checked={draft.isActive ?? true}
                    onChange={(e) => setDraft({ ...draft, isActive: e.target.checked })}
                  />
                  {t.active}
                </label>
                <p className='text-sm text-slate-500'>{t.scope}</p>
              </>
            )}
          </div>
        </section>
        <div className='flex items-start justify-between gap-4'>
          <div>
            <h2 className='flex items-center gap-3 text-xl font-semibold text-slate-900'>
              {t.fields}
              <span className='rounded-full bg-sky-100 px-2.5 py-0.5 text-xs font-semibold text-sky-700'>{draft.fields.length}</span>
            </h2>
            <p className='mt-1 text-sm text-slate-500'>{t.fieldsHint}</p>
          </div>
        </div>
        {initial && <p className='text-sm text-slate-600'>{t.stable}</p>}
        {draft.fields.map((field, index) => (
          <section key={field.uid} className='overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm'>
            <div className='flex flex-wrap items-center justify-between gap-3 border-b border-sky-100 bg-sky-50/70 px-5 py-4 sm:px-6'>
              <div className='flex min-w-0 items-center gap-3'>
                <span className='flex size-9 shrink-0 items-center justify-center rounded-lg bg-sky-600 text-sm font-semibold text-white shadow-sm'>
                  {index + 1}
                </span>
                <h3 className='min-w-0 wrap-break-word font-semibold text-slate-900'>{field.name || t.untitledField}</h3>
              </div>
              <span className='rounded-full border border-sky-200 bg-white px-3 py-1 text-xs font-medium text-sky-700'>{t.fieldTypes[field.fieldType]}</span>
            </div>
            <div className='p-5 sm:p-6'>
              <FieldEditor
                field={field}
                t={t}
                uid={uid}
                definitions={definitions.filter((d) => d.id !== initial?.id)}
                depth={1}
                onChange={(value) => setDraft((current) => ({ ...current, fields: current.fields.map((f) => (f.uid === field.uid ? value : f)) }))}
              />
            </div>
            <div className='flex flex-wrap items-center gap-2 border-t border-slate-100 bg-slate-50/60 px-5 py-3 sm:px-6'>
              <button
                type='button'
                className='btn-secondary disabled:cursor-not-allowed disabled:opacity-40'
                disabled={index === 0}
                onClick={() => move(index, -1)}
              >
                <EditorIcon kind='up' />
                {t.moveUp}
              </button>
              <button
                type='button'
                className='btn-secondary disabled:cursor-not-allowed disabled:opacity-40'
                disabled={index === draft.fields.length - 1}
                onClick={() => move(index, 1)}
              >
                <EditorIcon kind='down' />
                {t.moveDown}
              </button>
              {!field.id && (
                <button
                  type='button'
                  className='btn-secondary text-red-700 hover:bg-red-50 sm:ml-auto'
                  onClick={() => setDraft({ ...draft, fields: draft.fields.filter((f) => f.uid !== field.uid) })}
                >
                  <EditorIcon kind='remove' />
                  {t.remove}
                </button>
              )}
            </div>
          </section>
        ))}
        <button
          type='button'
          className='flex min-h-14 w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-sky-200 bg-sky-50/40 px-5 py-3 text-sm font-semibold text-sky-700 transition-colors hover:border-sky-400 hover:bg-sky-50 disabled:opacity-50 motion-reduce:transition-none'
          disabled={draft.fields.length >= 512}
          onClick={() => setDraft({ ...draft, fields: [...draft.fields, emptyField(uid())] })}
        >
          <EditorIcon kind='add' />
          {t.addField}
        </button>
        <div className='flex flex-wrap items-center justify-end gap-3 border-t border-slate-200 pt-6'>
          <button className='btn-primary shadow-sm shadow-sky-200' type='submit'>
            <EditorIcon kind='check' />
            {pending ? t.saving : initial ? t.save : t.create}
          </button>
          <Link className='btn-secondary' href={initial ? `/${locale}/schemas/${initial.id}/records/new` : `/${locale}`}>
            {t.cancel}
          </Link>
        </div>
      </fieldset>
    </form>
  )
}

function Translations({
  t,
  label,
  value = {},
  onChange,
}: {
  t: Copy
  label: string
  value?: Record<string, string>
  onChange: (v: Record<string, string>) => void
}) {
  return (
    <fieldset className='min-w-0'>
      <legend className='mb-3 text-sm font-semibold text-slate-700'>{label}</legend>
      <div className='grid items-start gap-4 sm:grid-cols-2'>
        {(['en', 'zh-Hans'] as const).map((lang) => (
          <label key={lang} className='grid content-start gap-2 text-sm text-slate-600'>
            {lang === 'en' ? t.english : t.chinese}
            <input
              className='form-input min-w-0 transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-100 read-only:bg-slate-50 disabled:bg-slate-100 motion-reduce:transition-none'
              value={value[lang] ?? ''}
              onChange={(e) => onChange({ ...value, [lang]: e.target.value })}
            />
          </label>
        ))}
      </div>
    </fieldset>
  )
}

function Disclosure({
  title,
  hint,
  icon,
  children,
  open = false,
}: {
  title: string
  hint?: string
  icon: 'language' | 'settings'
  children: ReactNode
  open?: boolean
}) {
  return (
    <details open={open} className='group rounded-xl border border-slate-200 bg-slate-50/60'>
      <summary className='flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-xl px-4 py-3 text-slate-700 transition-colors hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-600 motion-reduce:transition-none [&::-webkit-details-marker]:hidden'>
        <span className='text-slate-500'>
          <EditorIcon kind={icon} />
        </span>
        <span className='flex-1'>
          <span className='block text-sm font-semibold'>{title}</span>
          {hint && <span className='mt-0.5 block text-xs text-slate-500'>{hint}</span>}
        </span>
        <span className='transition-transform group-open:rotate-180 motion-reduce:transition-none'>
          <EditorIcon kind='down' />
        </span>
      </summary>
      <div className='space-y-5 border-t border-slate-200 p-4'>{children}</div>
    </details>
  )
}

type IconKind = 'schema' | 'language' | 'settings' | 'up' | 'down' | 'add' | 'remove' | 'check'
function EditorIcon({ kind }: { kind: IconKind }) {
  const paths: Record<IconKind, string> = {
    schema: 'M4 4h6v6H4z M14 4h6v6h-6z M4 14h6v6H4z M14 14h6v6h-6z',
    language: 'M3 5h12 M9 3v2 M6 5c0 6 5 10 9 11 M12 5c0 6-5 10-9 11 M14 21l4-10 4 10 M15.5 17h5',
    settings: 'M4 7h16 M4 17h16 M8 4v6 M16 14v6',
    up: 'm6 14 6-6 6 6',
    down: 'm6 10 6 6 6-6',
    add: 'M12 5v14 M5 12h14',
    remove: 'M4 7h16 M9 7V4h6v3 M6 7l1 13h10l1-13 M10 11v5 M14 11v5',
    check: 'm5 12 4 4L19 6',
  }
  return (
    <svg
      aria-hidden='true'
      className='size-5 shrink-0'
      viewBox='0 0 24 24'
      fill='none'
      stroke='currentColor'
      strokeWidth='1.7'
      strokeLinecap='round'
      strokeLinejoin='round'
    >
      <path d={paths[kind]} />
    </svg>
  )
}

export function SchemaPageHeader({ title, intro, back, href }: { title: string; intro: string; back: string; href: string }) {
  return (
    <header className='mb-8'>
      <Link
        className='inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition-colors hover:text-sky-700 motion-reduce:transition-none'
        href={href}
      >
        {back}
      </Link>
      <div className='mt-6 flex items-start gap-4'>
        <span className='hidden rounded-2xl bg-sky-600 p-3.5 text-white shadow-md shadow-sky-200 sm:block'>
          <EditorIcon kind='schema' />
        </span>
        <div>
          <h1 className='text-3xl font-semibold tracking-tight text-slate-900'>{title}</h1>
          <p className='mt-2 max-w-2xl text-sm leading-6 text-slate-600'>{intro}</p>
        </div>
      </div>
    </header>
  )
}

function FieldEditor({
  field,
  t,
  uid,
  definitions,
  depth,
  onChange,
}: {
  field: DraftField
  t: Copy
  uid: () => string
  definitions: ObjectDefinition[]
  depth: number
  onChange: (value: DraftField) => void
}) {
  const set = (patch: Partial<DraftField>) => onChange({ ...field, ...patch })
  const settings = buildSettings(field)
  const settingKeys: FieldSettingKey[] = FIELD_SETTING_KEYS[field.fieldType]
  const keyHintId = useId()
  return (
    <div className='space-y-5'>
      <div className='grid items-start gap-5 sm:grid-cols-2'>
        <label className='grid min-w-0 content-start gap-2 text-sm font-medium text-slate-700'>
          {t.key}
          <input
            required
            pattern='[A-Za-z][A-Za-z0-9_]{0,99}'
            readOnly={!!field.id}
            className='form-input min-w-0 transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-100 read-only:bg-slate-50 disabled:bg-slate-100 motion-reduce:transition-none'
            placeholder={t.fieldKeyPlaceholder}
            aria-describedby={keyHintId}
            value={field.key}
            onChange={(e) => set({ key: e.target.value })}
          />
          <span id={keyHintId} className='text-xs text-slate-500'>
            {t.fieldKeyHint}
          </span>
        </label>
        <label className='grid min-w-0 content-start gap-2 text-sm font-medium text-slate-700'>
          {t.name}
          <input
            required
            maxLength={200}
            className='form-input min-w-0 transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-100 read-only:bg-slate-50 disabled:bg-slate-100 motion-reduce:transition-none'
            placeholder={t.fieldNamePlaceholder}
            value={field.name}
            onChange={(e) => set({ name: e.target.value })}
          />
        </label>
        <label className='grid min-w-0 content-start gap-2 text-sm font-medium text-slate-700'>
          {t.type}
          <select
            disabled={!!field.id}
            className='form-input min-w-0 transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-100 read-only:bg-slate-50 disabled:bg-slate-100 motion-reduce:transition-none'
            value={field.fieldType}
            onChange={(e) => {
              const fieldType = e.target.value as FieldType
              set({ fieldType, settings: {}, options: [], item: fieldType === 'Collection' ? { ...emptyField(uid()), key: 'item', name: t.item } : undefined })
            }}
          >
            {FIELD_TYPES.map((type) => (
              <option key={type} value={type} disabled={depth >= 8 && (type === 'Collection' || type === 'Object')}>
                {t.fieldTypes[type]}
              </option>
            ))}
          </select>
        </label>
        <label className='grid min-w-0 content-start gap-2 text-sm'>
          {t.description}
          <input
            maxLength={2000}
            className='form-input min-w-0 transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-100 read-only:bg-slate-50 disabled:bg-slate-100 motion-reduce:transition-none'
            placeholder={t.fieldDescriptionPlaceholder}
            value={field.description}
            onChange={(e) => set({ description: e.target.value })}
          />
        </label>
      </div>
      <div className='flex flex-wrap gap-3 rounded-xl bg-slate-50 p-3'>
        <label className='flex items-center gap-2'>
          <input className='size-4 accent-sky-600' type='checkbox' checked={field.isRequired} onChange={(e) => set({ isRequired: e.target.checked })} />
          {t.required}
        </label>
        <label className='flex items-center gap-2'>
          <input className='size-4 accent-sky-600' type='checkbox' checked={field.isActive ?? true} onChange={(e) => set({ isActive: e.target.checked })} />
          {t.active}
        </label>
      </div>
      <Disclosure title={t.translations} hint={t.translationsHint} icon='language'>
        <Translations t={t} label={t.name} value={field.nameTranslations} onChange={(v) => set({ nameTranslations: v })} />
        <Translations t={t} label={t.description} value={field.descriptionTranslations} onChange={(v) => set({ descriptionTranslations: v })} />
        {settingKeys.includes('placeholder') && (
          <Translations t={t} label={t.placeholder} value={field.placeholderTranslations} onChange={(v) => set({ placeholderTranslations: v })} />
        )}
      </Disclosure>
      {settingKeys.length > 0 && (
        <Disclosure title={t.settings} hint={t.settingsHint} icon='settings' open={field.fieldType === 'Object'}>
          <div className='grid items-start gap-4 sm:grid-cols-2'>
            {settingKeys.map((key) => {
              const type = key.includes('DateTime')
                ? 'datetime-local'
                : key.includes('Date')
                  ? 'date'
                  : key.includes('Time')
                    ? 'time'
                    : key === 'placeholder'
                      ? 'text'
                      : 'number'
              const raw = settings[key]
              const value =
                type === 'datetime-local' && typeof raw === 'string'
                  ? !Number.isNaN(Date.parse(raw))
                    ? new Date(raw).toISOString().replace(/Z$/, '')
                    : raw
                  : String(raw ?? '')
              const change = (text: string) => set({ settings: updateSettingFromInput(settings, key, text) })
              return (
                <label key={key} className='grid min-w-0 content-start gap-2 text-sm font-medium text-slate-700'>
                  {key === 'itemDefinitionId' ? t.item : t[key]}
                  {key === 'referencedObjectDefinitionId' ? (
                    <select
                      required
                      className='form-input min-w-0 transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-100 read-only:bg-slate-50 disabled:bg-slate-100 motion-reduce:transition-none'
                      value={value}
                      onChange={(e) => change(e.target.value)}
                    >
                      <option value=''>{t.none}</option>
                      {value && !definitions.some((d) => String(d.id) === value) && <option value={value}>#{value}</option>}
                      {definitions.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      className='form-input min-w-0 transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-100 read-only:bg-slate-50 disabled:bg-slate-100 motion-reduce:transition-none'
                      type={type}
                      step='any'
                      value={value}
                      onChange={(e) => change(e.target.value)}
                    />
                  )}
                </label>
              )
            })}
          </div>
        </Disclosure>
      )}
      {hasOptions(field.fieldType) && (
        <div className='space-y-3'>
          <h3 className='font-medium'>{t.options}</h3>
          {field.options.map((option, i) => (
            <div key={option.uid} className='space-y-3 rounded-xl border border-slate-200 p-3'>
              <div className='grid gap-3 sm:grid-cols-2'>
                <label className='grid min-w-0 content-start gap-2 text-sm'>
                  {t.value}
                  <input
                    required
                    readOnly={!!option.id}
                    className='form-input min-w-0 transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-100 read-only:bg-slate-50 disabled:bg-slate-100 motion-reduce:transition-none'
                    placeholder={t.choiceValuePlaceholder}
                    value={option.value}
                    onChange={(e) => set({ options: field.options.map((o, n) => (n === i ? { ...o, value: e.target.value } : o)) })}
                  />
                </label>
                <label className='grid min-w-0 content-start gap-2 text-sm'>
                  {t.label}
                  <input
                    required
                    className='form-input min-w-0 transition-colors placeholder:text-slate-400 hover:border-slate-400 focus:border-sky-500 focus:outline-none focus:ring-3 focus:ring-sky-100 read-only:bg-slate-50 disabled:bg-slate-100 motion-reduce:transition-none'
                    placeholder={t.choiceLabelPlaceholder}
                    value={option.label}
                    onChange={(e) => set({ options: field.options.map((o, n) => (n === i ? { ...o, label: e.target.value } : o)) })}
                  />
                </label>
              </div>
              <Disclosure title={t.translations} icon='language'>
                <Translations
                  t={t}
                  label={t.label}
                  value={option.labelTranslations}
                  onChange={(v) => set({ options: field.options.map((o, n) => (n === i ? { ...o, labelTranslations: v } : o)) })}
                />
              </Disclosure>
              <label className='flex items-center gap-2'>
                <input
                  className='size-4 accent-sky-600'
                  type='checkbox'
                  checked={option.isActive ?? true}
                  onChange={(e) => set({ options: field.options.map((o, n) => (n === i ? { ...o, isActive: e.target.checked } : o)) })}
                />
                {t.active}
              </label>
              {!option.id && (
                <button type='button' className='btn-secondary' onClick={() => set({ options: field.options.filter((_, n) => n !== i) })}>
                  {t.remove}
                </button>
              )}
            </div>
          ))}
          <button type='button' className='btn-secondary' onClick={() => set({ options: [...field.options, { uid: uid(), value: '', label: '' }] })}>
            {t.addOption}
          </button>
        </div>
      )}
      {field.fieldType === 'Collection' && field.item && depth < 8 && (
        <fieldset className='space-y-3 border-l-2 border-sky-200 pl-4'>
          <legend className='px-2 font-semibold'>{t.item}</legend>
          <FieldEditor field={field.item} t={t} uid={uid} definitions={definitions} depth={depth + 1} onChange={(item) => set({ item })} />
        </fieldset>
      )}
    </div>
  )
}
