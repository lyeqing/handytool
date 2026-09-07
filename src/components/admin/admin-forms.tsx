"use client";
import { useActionState } from "react";
import { saveAdminAction } from "@/app/[lang]/admin/actions";
import { adminCopy } from "@/i18n/admin-copy";
import type { AdminRow, AdminSection, AdminPlan } from "@/lib/admin-types";

export function AdminForm({lang,section,row,sub=false,plans=[]}:{lang:string;section:AdminSection;row?:AdminRow;sub?:boolean;plans?:AdminPlan[]}) {
 const t=adminCopy(lang);
 const [state,action,pending]=useActionState(saveAdminAction.bind(null,lang,section,row?.id??null,sub),null);
 const input=(key:keyof typeof t,value: string|number|null|undefined,type="text",required=false,max?:number)=>
  <label className="grid gap-2 text-sm font-medium" key={key}>{t[key]}
   <input className="form-input" name={key} defaultValue={value??""} type={type} required={required} maxLength={max} step={type==="number"?"1":undefined}/></label>;
 const check=(key:"isActive"|"isSuperAdmin",label:string,value:boolean)=><label className="flex items-center gap-3 text-sm font-medium"><input type="checkbox" name={key} defaultChecked={value} className="size-4 accent-sky-600"/>{label}</label>;
 const plan=<label className="grid gap-2 text-sm font-medium">{t.accountTypeId}<select name="accountTypeId" className="form-input" defaultValue={row?.accountTypeId??1}>{plans.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select></label>;
 return <form action={action} className="mt-5 space-y-5">
  <input type="hidden" name="modifiedDate" value={row?.modifiedDate??""}/>
  {state && <p role="status" className={state.ok?"text-emerald-700":"text-red-700"}>{state.message}</p>}
  <fieldset disabled={pending} className="grid gap-5 sm:grid-cols-2 disabled:opacity-60">
   {section==="users" && <>
    {input("displayName",row?.displayName,"text",true,200)}{input("email",row?.email,"email",true,320)}{input("phone",row?.phone,"tel",false,40)}
    <label className="grid gap-2 text-sm font-medium">{t.preferredLanguage}<select className="form-input" name="preferredLanguage" defaultValue={row?.preferredLanguage??""}><option value="">{t.browser}</option><option value="en">English</option><option value="zh-Hans">简体中文</option></select></label>
    {input("companyId",row?.companyId,"number")}
    <label className="grid gap-2 text-sm font-medium">{t.companyRole}<select className="form-input" name="companyRole" defaultValue={row?.companyRole??""}><option value="">{t.personal}</option><option value="Member">{t.member}</option><option value="Admin">{t.admin}</option><option value="Owner">{t.owner}</option></select></label>
    {plan}{check("isSuperAdmin",t.isSuperAdmin,row?.isSuperAdmin??false)}
   </>}
   {section==="companies" && <>
    {input("name",row?.name,"text",true,200)}{input("country",row?.country,"text",false,100)}{input("address",row?.address,"text",false,2000)}
    {input("websiteUrl",row?.websiteUrl,"url",false,2048)}{plan}{input("seatLimit",row?.seatLimit,"number",true)}
    {input("expiresAt",row?.expiresAt?.slice(0,16),"datetime-local")}
   </>}
   {section==="categories" && <>
    {input("name",row?.name,"text",true,200)}{input("description",row?.description,"text",false,2000)}
    {input("displayOrder",row?.displayOrder??0,"number",true)}{sub&&input("masterCategoryId",row?.masterCategoryId,"number",true)}
    {input("enName",row?.translations?.find(t=>t.languageCode==="en")?.name,"text",false,200)}
    {input("enDescription",row?.translations?.find(t=>t.languageCode==="en")?.description,"text",false,2000)}
    {input("zhName",row?.translations?.find(t=>t.languageCode==="zh-Hans")?.name,"text",false,200)}
    {input("zhDescription",row?.translations?.find(t=>t.languageCode==="zh-Hans")?.description,"text",false,2000)}
   </>}
   {check("isActive",t.active,row?.isActive??true)}
   <div className="sm:col-span-2">{section==="users"&&<p className="mb-4 text-sm text-slate-500">{t.hint}</p>}<button className="btn-primary" disabled={pending}>{pending?t.saving:t.save}</button></div>
  </fieldset>
 </form>;
}
