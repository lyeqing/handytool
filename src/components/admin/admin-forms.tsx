"use client";
import { AdminDisclosureSummary } from "@/components/admin/admin-ui";

import { useActionState } from "react";
import { saveAdminAction, deleteCategoryAction } from "@/app/[lang]/admin/actions";
import { adminCopy } from "@/i18n/admin-copy";
import type { AdminRow, AdminSection, AdminPlan } from "@/lib/admin-types";

export function AdminForm({lang,section,row,sub=false,plans=[],masterCategoryId,inCard=false}:{lang:string;section:AdminSection;row?:AdminRow;sub?:boolean;plans?:AdminPlan[];masterCategoryId?:number;inCard?:boolean}) {
 const t=adminCopy(lang);
 const [state,action,pending]=useActionState(saveAdminAction.bind(null,lang,section,row?.id??null,sub),null);
 const input=(key:keyof typeof t,value: string|number|null|undefined,type="text",required=false,max?:number)=>
  <label className={`grid gap-2 text-sm font-medium ${inCard?"min-w-0":""}`} key={key}>{t[key]}
   <input className={`form-input ${inCard?"min-w-0":""}`} name={key} defaultValue={value??""} type={type} required={required} maxLength={max} step={type==="number"?"1":undefined}/></label>;
 const check=(key:"isActive"|"isSuperAdmin",label:string,value:boolean)=><label className={`flex items-center gap-3 text-sm font-medium ${inCard?"min-w-0":""}`}><input type="checkbox" name={key} defaultChecked={value} className={`size-4 accent-sky-600 ${inCard?"min-w-0":""}`}/>{label}</label>;
 const plan=<label className={`grid gap-2 text-sm font-medium ${inCard?"min-w-0":""}`}>{t.accountTypeId}<select name="accountTypeId" className={`form-input ${inCard?"min-w-0":""}`} defaultValue={row?.accountTypeId??1}>{plans.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>;
 return <form action={action} className="mt-5 space-y-5">
  <input type="hidden" name="modifiedDate" value={row?.modifiedDate??""}/>
  {state && <p role="status" className={state.ok?"text-emerald-700":"text-red-700"}>{state.message}</p>}
  <fieldset disabled={pending} className={inCard?"grid grid-cols-1 gap-5 sm:[@container(width>30rem)]:grid-cols-2 disabled:opacity-60":"grid gap-5 sm:grid-cols-2 disabled:opacity-60"}>
   {section==="users" && <>
    {input("displayName",row?.displayName,"text",true,200)}{input("email",row?.email,"email",true,320)}{input("phone",row?.phone,"tel",false,40)}
    <label className={`grid gap-2 text-sm font-medium ${inCard?"min-w-0":""}`}>{t.preferredLanguage}<select className={`form-input ${inCard?"min-w-0":""}`} name="preferredLanguage" defaultValue={row?.preferredLanguage??""}><option value="">{t.browser}</option><option value="en">English</option><option value="zh-Hans">简体中文</option></select></label>
    {input("companyId",row?.companyId,"number")}
    <label className={`grid gap-2 text-sm font-medium ${inCard?"min-w-0":""}`}>{t.companyRole}<select className={`form-input ${inCard?"min-w-0":""}`} name="companyRole" defaultValue={row?.companyRole??""}><option value="">{t.personal}</option><option value="Member">{t.member}</option><option value="Admin">{t.admin}</option><option value="Owner">{t.owner}</option></select></label>
    {plan}{check("isSuperAdmin",t.isSuperAdmin,row?.isSuperAdmin??false)}
   </>}
   {section==="companies" && <>
    {input("name",row?.name,"text",true,200)}{input("country",row?.country,"text",false,100)}{input("address",row?.address,"text",false,2000)}
    {input("websiteUrl",row?.websiteUrl,"url",false,2048)}{plan}{input("seatLimit",row?.seatLimit,"number",true)}
    {input("expiresAt",row?.expiresAt?.slice(0,16),"datetime-local")}
   </>}
   {section==="categories" && <>
    {input("name",row?.name,"text",true,200)}{input("description",row?.description,"text",false,2000)}
    {input("displayOrder",row?.displayOrder??0,"number",true)}{sub&&<input type="hidden" name="masterCategoryId" value={masterCategoryId??row?.masterCategoryId??""}/>}
    {input("enName",row?.translations?.find(t=>t.languageCode==="en")?.name,"text",false,200)}
    {input("enDescription",row?.translations?.find(t=>t.languageCode==="en")?.description,"text",false,2000)}
    {input("zhName",row?.translations?.find(t=>t.languageCode==="zh-Hans")?.name,"text",false,200)}
    {input("zhDescription",row?.translations?.find(t=>t.languageCode==="zh-Hans")?.description,"text",false,2000)}
   </>}
   {check("isActive",t.active,row?.isActive??true)}
   <div className={inCard?"sm:[@container(width>30rem)]:col-span-2":"sm:col-span-2"}>{section==="users"&&<p className="mb-4 text-sm text-slate-500">{t.hint}</p>}<button className="btn-primary" disabled={pending}>{pending?t.saving:t.save}</button></div>
  </fieldset>
 </form>;
}

export function DeleteCategoryForm({lang,row,sub}:{lang:string;row:AdminRow;sub:boolean}) {
 const t=adminCopy(lang);
 const [state,action,pending]=useActionState(deleteCategoryAction.bind(null,lang,row.id,sub,row.modifiedDate),null);
 if(!sub && row.id===-1) return null;
 return <details className="group/admin-disclosure border-t border-slate-100">
  <AdminDisclosureSummary className="text-red-700"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0"><path d="M3 6h18M9 6V3h6v3M5 6l1 15h12l1-15M10 10v7M14 10v7"/></svg><span>{t.deleteCategory}</span></AdminDisclosureSummary>
  <form action={action} className="m-4 space-y-4 rounded-xl border border-red-200 bg-red-50 p-4 inset-shadow-sm">
   <p className="font-medium text-slate-900">{row.name}</p>
   <p className="text-sm text-slate-700">{sub?t.deleteSubWarning:t.deleteMasterWarning}</p>
   {state&&<p role="status" className={state.ok?"text-emerald-700":"text-red-700"}>{state.message}</p>}
   <fieldset disabled={pending} className="space-y-4 disabled:opacity-60">
    <label className="flex min-w-0 items-start gap-3 text-sm"><input type="checkbox" name="confirmDelete" required className="mt-1 size-4 min-w-0 accent-red-700"/>{t.confirmDelete}</label>
    <button className="inline-flex min-h-11 items-center justify-center rounded-lg bg-red-700 px-5 py-2.5 text-sm font-medium text-white hover:bg-red-800 disabled:opacity-50" disabled={pending}>{pending?t.deleting:t.deleteCategory}</button>
   </fieldset>
  </form>
 </details>;
}