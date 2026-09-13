"use client";

import Link from "next/link";
import { startTransition, useActionState, useId, useRef, useState } from "react";
import { FIELD_TYPES, hasOptions, type FieldType, type ObjectDefinition } from "@/lib/handytool-types";
import { buildSettings, emptySchemaDraft, definitionToDraft, emptyField, type DraftField, type SchemaDraft } from "@/lib/schema-draft";
import type { Dictionary } from "@/i18n/get-dictionary";
import { createSchemaAction } from "./actions";
import { updateSchemaAction } from "../[id]/edit/actions";

type Copy = Dictionary["editing"];
const settingKeys: Record<FieldType, string[]> = {
  ShortText: ["minimumLength","maximumLength","placeholder"],
  LongText: ["minimumLength","maximumLength","placeholder","rows"],
  Markdown: ["minimumLength","maximumLength","placeholder"],
  Integer: ["minimum","maximum","step","placeholder"], Decimal: ["minimum","maximum","step","placeholder"],
  Range: ["minimum","maximum","step"], Date: ["minimumDate","maximumDate"],
  DateTime: ["minimumDateTime","maximumDateTime"], Time: ["minimumTime","maximumTime","stepSeconds"],
  Dropdown: ["placeholder"], RadioGroup: [], Boolean: [],
  Checklist: ["minimumItems","maximumItems"], MultiSelect: ["minimumItems","maximumItems"],
  Object: ["referencedObjectDefinitionId"], Collection: ["minimumItems","maximumItems"],
};

export function SchemaBuilder({locale,t,initial,definitions=[]}: {
  locale:string; t:Copy; initial?:ObjectDefinition; definitions?:ObjectDefinition[];
}) {
  const next = useRef(0);
  const uid = () => `field-${++next.current}`;
  const [draft,setDraft] = useState<SchemaDraft>(() => {
    let seed=0;
    return initial ? definitionToDraft(initial) : emptySchemaDraft(() => `seed-${++seed}`);
  });
  const [state,submit,pending] = useActionState(
    initial ? updateSchemaAction.bind(null,locale,initial.id) : createSchemaAction.bind(null,locale), null
  );
  const move = (index:number, direction:number) => setDraft(current => {
    const fields=[...current.fields]; const to=index+direction;
    [fields[index],fields[to]]=[fields[to],fields[index]];return {...current,fields};
  });
  return <form onSubmit={event => { event.preventDefault(); startTransition(() => submit(draft)); }} className="space-y-6">
    {state && <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 wrap-break-word text-red-800">
      <p>{state.message}</p>
      <ul>{state.errors.map((e,i)=><li key={i}>{e.fieldKey}: {e.message}</li>)}</ul>
      {"conflict" in state && state.conflict === true && <button type="button" className="btn-secondary mt-3" onClick={()=>window.location.reload()}>{t.reload}</button>}
    </div>}
    <fieldset disabled={pending} className="space-y-6 disabled:opacity-60">
      <section className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <label className="grid gap-2 text-sm font-medium">{t.name}<input required maxLength={200} className="form-input" placeholder={t.schemaNamePlaceholder} value={draft.name} onChange={e=>setDraft({...draft,name:e.target.value})}/></label>
        <label className="grid gap-2 text-sm font-medium">{t.description}<textarea maxLength={2000} className="form-input" placeholder={t.schemaDescriptionPlaceholder} value={draft.description} onChange={e=>setDraft({...draft,description:e.target.value})}/></label>
        <Translations t={t} label={t.name} value={draft.nameTranslations} onChange={value=>setDraft({...draft,nameTranslations:value})}/>
        <Translations t={t} label={t.description} value={draft.descriptionTranslations} onChange={value=>setDraft({...draft,descriptionTranslations:value})}/>
        {initial && <><label className="flex items-center gap-2"><input type="checkbox" checked={draft.isActive??true} onChange={e=>setDraft({...draft,isActive:e.target.checked})}/>{t.active}</label><p className="text-sm text-slate-500">{t.scope}</p></>}
      </section>
      <h2 className="text-xl font-semibold">{t.fields}</h2>
      {initial && <p className="text-sm text-slate-600">{t.stable}</p>}
      {draft.fields.map((field,index)=><section key={field.uid} className="space-y-4 rounded-2xl border border-slate-200 bg-white p-5">
        <FieldEditor field={field} t={t} uid={uid} definitions={definitions.filter(d=>d.id!==initial?.id)} depth={1} onChange={value=>setDraft(current=>({...current,fields:current.fields.map(f=>f.uid===field.uid?value:f)}))}/>
        <div className="flex flex-wrap gap-2">
          <button type="button" className="btn-secondary" disabled={index===0} onClick={()=>move(index,-1)}>{t.moveUp}</button>
          <button type="button" className="btn-secondary" disabled={index===draft.fields.length-1} onClick={()=>move(index,1)}>{t.moveDown}</button>
          {!field.id && <button type="button" className="btn-secondary" onClick={()=>setDraft({...draft,fields:draft.fields.filter(f=>f.uid!==field.uid)})}>{t.remove}</button>}
        </div>
      </section>)}
      <button type="button" className="btn-secondary" disabled={draft.fields.length>=512} onClick={()=>setDraft({...draft,fields:[...draft.fields,emptyField(uid())]})}>{t.addField}</button>
      <div className="flex gap-3"><button className="btn-primary" type="submit">{pending?t.saving:initial?t.save:t.create}</button><Link className="btn-secondary" href={initial?`/${locale}/schemas/${initial.id}/records/new`:`/${locale}`}>{t.cancel}</Link></div>
    </fieldset>
  </form>;
}

function Translations({t,label,value={},onChange}:{t:Copy;label:string;value?:Record<string,string>;onChange:(v:Record<string,string>)=>void}) {
  return <details className="rounded-lg border border-slate-200 p-3"><summary className="text-sm font-medium">{label} · {t.translations}</summary>
    <div className="mt-3 grid gap-3 sm:grid-cols-2">{(["en","zh-Hans"] as const).map(lang=><label key={lang} className="grid gap-2 text-sm">{lang==="en"?t.english:t.chinese}<input className="form-input" value={value[lang]??""} onChange={e=>onChange({...value,[lang]:e.target.value})}/></label>)}</div>
  </details>;
}

function FieldEditor({field,t,uid,definitions,depth,onChange}:{
  field:DraftField;t:Copy;uid:()=>string;definitions:ObjectDefinition[];depth:number;onChange:(value:DraftField)=>void;
}) {
  const set=(patch:Partial<DraftField>)=>onChange({...field,...patch});
  const settings=buildSettings(field);
  const keyHintId = useId();
  return <div className="space-y-4">
    <div className="grid gap-4 sm:grid-cols-2">
      <label className="grid min-w-0 gap-2 text-sm">{t.key}<input required pattern="[A-Za-z][A-Za-z0-9_]{0,99}" readOnly={!!field.id} className="form-input" placeholder={t.fieldKeyPlaceholder} aria-describedby={keyHintId} value={field.key} onChange={e=>set({key:e.target.value})}/><span id={keyHintId} className="text-xs text-slate-500">{t.fieldKeyHint}</span></label>
      <label className="grid min-w-0 gap-2 text-sm">{t.name}<input required maxLength={200} className="form-input" placeholder={t.fieldNamePlaceholder} value={field.name} onChange={e=>set({name:e.target.value})}/></label>
      <label className="grid min-w-0 gap-2 text-sm">{t.type}<select disabled={!!field.id} className="form-input" value={field.fieldType} onChange={e=>{
        const fieldType=e.target.value as FieldType;
        set({fieldType,settings:{},options:[],item:fieldType==="Collection"?{...emptyField(uid()),key:"item",name:t.item}:undefined});
      }}>{FIELD_TYPES.map(type=><option key={type} value={type} disabled={depth>=8&&(type==="Collection"||type==="Object")}>{t.fieldTypes[type]}</option>)}</select></label>
      <label className="grid gap-2 text-sm">{t.description}<input maxLength={2000} className="form-input" placeholder={t.fieldDescriptionPlaceholder} value={field.description} onChange={e=>set({description:e.target.value})}/></label>
    </div>
    <div className="flex gap-4"><label className="flex items-center gap-2"><input type="checkbox" checked={field.isRequired} onChange={e=>set({isRequired:e.target.checked})}/>{t.required}</label><label className="flex items-center gap-2"><input type="checkbox" checked={field.isActive??true} onChange={e=>set({isActive:e.target.checked})}/>{t.active}</label></div>
    <Translations t={t} label={t.name} value={field.nameTranslations} onChange={v=>set({nameTranslations:v})}/>
    <Translations t={t} label={t.description} value={field.descriptionTranslations} onChange={v=>set({descriptionTranslations:v})}/>
    {settingKeys[field.fieldType].includes("placeholder")&&<Translations t={t} label={t.placeholder} value={field.placeholderTranslations} onChange={v=>set({placeholderTranslations:v})}/>}
    <div className="grid gap-3 sm:grid-cols-2">{settingKeys[field.fieldType].map(key=>{
      const type=key.includes("DateTime")?"datetime-local":key.includes("Date")?"date":key.includes("Time")?"time":key==="placeholder"?"text":"number";
      const raw=settings[key];
      const value=type==="datetime-local"&&typeof raw==="string"?(!Number.isNaN(Date.parse(raw))?new Date(raw).toISOString().replace(/Z$/,""):raw):String(raw??"");
      const change=(text:string)=>{
        const updated={...settings};
        if(text==="")delete updated[key];
        else updated[key]=type==="number"?Number(text):type==="datetime-local"?text+"Z":text;
        set({settings:updated});
      };
      return <label key={key} className="grid min-w-0 gap-2 text-sm">{t[key as keyof Copy] as string}
        {key==="referencedObjectDefinitionId"?<select required className="form-input" value={value} onChange={e=>change(e.target.value)}><option value="">{t.none}</option>{value&&!definitions.some(d=>String(d.id)===value)&&<option value={value}>#{value}</option>}{definitions.map(d=><option key={d.id} value={d.id}>{d.name}</option>)}</select>
        :<input className="form-input" type={type} step="any" value={value} onChange={e=>change(e.target.value)}/>}
      </label>;
    })}</div>
    {hasOptions(field.fieldType)&&<div className="space-y-3"><h3 className="font-medium">{t.options}</h3>{field.options.map((option,i)=><div key={option.uid} className="space-y-3 rounded-xl border border-slate-200 p-3">
      <div className="grid gap-3 sm:grid-cols-2"><label className="grid gap-2 text-sm">{t.value}<input required readOnly={!!option.id} className="form-input" placeholder={t.choiceValuePlaceholder} value={option.value} onChange={e=>set({options:field.options.map((o,n)=>n===i?{...o,value:e.target.value}:o)})}/></label>
      <label className="grid gap-2 text-sm">{t.label}<input required className="form-input" placeholder={t.choiceLabelPlaceholder} value={option.label} onChange={e=>set({options:field.options.map((o,n)=>n===i?{...o,label:e.target.value}:o)})}/></label></div>
      <Translations t={t} label={t.label} value={option.labelTranslations} onChange={v=>set({options:field.options.map((o,n)=>n===i?{...o,labelTranslations:v}:o)})}/>
      <label className="flex items-center gap-2"><input type="checkbox" checked={option.isActive??true} onChange={e=>set({options:field.options.map((o,n)=>n===i?{...o,isActive:e.target.checked}:o)})}/>{t.active}</label>
      {!option.id&&<button type="button" className="btn-secondary" onClick={()=>set({options:field.options.filter((_,n)=>n!==i)})}>{t.remove}</button>}
    </div>)}<button type="button" className="btn-secondary" onClick={()=>set({options:[...field.options,{uid:uid(),value:"",label:""}]})}>{t.addOption}</button></div>}
    {field.fieldType==="Collection"&&field.item&&depth<8&&<fieldset className="space-y-3 border-l-2 border-sky-200 pl-4"><legend className="px-2 font-semibold">{t.item}</legend><FieldEditor field={field.item} t={t} uid={uid} definitions={definitions} depth={depth+1} onChange={item=>set({item})}/></fieldset>}
  </div>;
}
