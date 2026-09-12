import { AdminAccountMeta, AdminBadge, AdminCard, AdminCardHeading, AdminDisclosureSummary, AdminTextLink } from "@/components/admin/admin-ui";
import Link from "next/link";
import { listAdmin, adminPlans } from "@/lib/handytool-api";
import { AdminForm } from "@/components/admin/admin-forms";
import { adminCopy } from "@/i18n/admin-copy";

export default async function Page({params,searchParams}:{params:Promise<{lang:string}>;searchParams:Promise<{q?:string;skip?:string;companyId?:string}>}) {
 const {lang}=await params; const query=await searchParams; const t=adminCopy(lang); const section="companies" as const;
 const offset=Number(query.skip); const skip=Number.isSafeInteger(offset)&&offset>=0?offset:0; const q=query.q??"";
 const companyId=query.companyId??"";
 const [result,plans]=await Promise.all([listAdmin(section,q,skip,false,undefined,companyId?{companyId}:{}),adminPlans()]);
 if(!result.ok) return <p role="alert">{result.status===403||result.status===401?t.forbidden:t.unavailable}</p>;
 const href=(offset:number)=>`/${lang}/admin/${section}?${new URLSearchParams({q,skip:String(offset),companyId})}`;
 return <section>
  {companyId&&<AdminTextLink className="mb-4" href={`/${lang}/admin/companies`}>← {t.allCompanies}</AdminTextLink>}
  <header className="mb-7 flex items-start gap-4">
   <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0"><path d="M4 21V3h12v18M16 9h4v12M8 7h4M8 11h4M8 15h4M9 21v-3h2v3"/></svg></span>
   <div className="min-w-0"><p className="mb-1 text-xs font-semibold uppercase tracking-widest text-sky-700">{t.accountDirectory}</p>
    <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{t[section]}</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">{t.companiesIntro}</p>
   </div>
  </header>
  <div className="mb-5 flex flex-wrap items-end justify-between gap-5">
   <p className="flex items-center gap-3 text-lg font-semibold text-slate-900">{t[section]}<span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">{result.data.total}<span className="sr-only"> {t.results}</span></span></p>
   <form className="flex w-full flex-wrap items-end gap-3 sm:w-auto">{companyId&&<input type="hidden" name="companyId" value={companyId}/>}<label className="grid min-w-0 flex-1 gap-2 text-sm font-medium sm:flex-none">{t.search}<input className="form-input" name="q" maxLength={200} defaultValue={q}/></label><button className="btn-secondary">{t.search}</button></form>
  </div>
  <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2 2xl:grid-cols-3">{result.data.items.map(row=><AdminCard key={row.id}>
   <AdminCardHeading>
    <div className="mb-4 flex items-center justify-between gap-3">
     <span className="flex size-10 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0"><path d="M4 21V3h12v18M16 9h4v12M8 7h4M8 11h4M8 15h4M9 21v-3h2v3"/></svg></span>
     <AdminBadge className={row.isActive?"bg-emerald-50 text-emerald-800":"bg-slate-200 text-slate-700"}><span aria-hidden="true" className={row.isActive?"size-1.5 rounded-full bg-emerald-600":"size-1.5 rounded-full bg-slate-500"}/>{row.isActive?t.active:t.inactive}</AdminBadge>
    </div>
    <h3 className="wrap-break-word text-xl font-semibold tracking-tight text-slate-900">{row.name}</h3>
    <p className="mt-2 text-sm text-slate-600">{row.country||t.countryUnset}</p>
    <div className="mt-4 flex flex-wrap gap-2"><AdminBadge className="bg-white text-sky-800">{plans.ok?plans.data.find(p=>p.id===row.accountTypeId)?.name??t.planUnavailable:t.planUnavailable}</AdminBadge><AdminBadge className="bg-sky-100 text-sky-800">{row.seatLimit} {t.seatsLabel}</AdminBadge></div>
   </AdminCardHeading>
   <AdminAccountMeta>
    <div><dt>{t.companyLabel}</dt><dd>#{row.id}</dd></div>
    {row.address&&<div><dt>{t.addressLabel}</dt><dd>{row.address}</dd></div>}
    {row.websiteUrl&&<div><dt>{t.websiteLabel}</dt><dd>{row.websiteUrl}</dd></div>}
   </AdminAccountMeta>
   <div className="border-t border-slate-200 px-2 py-1"><AdminTextLink className="m-2" href={`/${lang}/admin/users?companyId=${row.id}`}>{t.viewUsers} <span aria-hidden="true">→</span></AdminTextLink><details className="group/admin-disclosure" open={companyId===String(row.id)}><AdminDisclosureSummary className="text-slate-700"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0"><path d="m15 5 4 4M4 20l4-1L20 7a2 2 0 0 0-4-4L4 15Z"/></svg><span>{t.editCompany}</span></AdminDisclosureSummary>
    <div className="px-4 pb-5"><AdminForm inCard key={row.modifiedDate} lang={lang} section={section} row={row} plans={plans.ok?plans.data:[]}/></div>
   </details></div>
  </AdminCard>)}</div>
  {result.data.items.length===0&&<p className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">{t.empty}</p>}
  <nav className="mt-6 flex gap-4" aria-label={t.results}>{skip>0&&<Link className="btn-secondary" href={href(Math.max(0,skip-25))}>{t.previous}</Link>}{skip+25<result.data.total&&<Link className="btn-secondary" href={href(skip+25)}>{t.next}</Link>}</nav>
 </section>;
}
