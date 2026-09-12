import { AdminAccountMeta, AdminBadge, AdminCard, AdminCardHeading, AdminDisclosureSummary, AdminTextLink } from "@/components/admin/admin-ui";
import Link from "next/link";
import { listAdmin, adminPlans, adminCompanyOptions } from "@/lib/handytool-api";
import { AdminForm } from "@/components/admin/admin-forms";
import { adminCopy } from "@/i18n/admin-copy";

export default async function Page({params,searchParams}:{params:Promise<{lang:string}>;searchParams:Promise<{q?:string;skip?:string;companyId?:string;sort?:string}>}) {
 const {lang}=await params; const query=await searchParams; const t=adminCopy(lang); const section="users" as const;
 const offset=Number(query.skip); const skip=Number.isSafeInteger(offset)&&offset>=0?offset:0; const q=query.q??"";
 const company=query.companyId??"";
 const sort=["name","name-desc","owners","admins","newest"].includes(query.sort??"")?query.sort!:"name";
 const filters:Record<string,string>={sort,...(company==="personal"?{personalOnly:"true"}:company?{companyId:company}:{})};
 const [result,plans,companies]=await Promise.all([listAdmin(section,q,skip,false,undefined,filters),adminPlans(),adminCompanyOptions()]);
 if(!result.ok) return <p role="alert">{result.status===403||result.status===401?t.forbidden:t.unavailable}</p>;
 const href=(offset:number)=>`/${lang}/admin/${section}?${new URLSearchParams({q,skip:String(offset),companyId:company,sort})}`;
 return <section>
  {company&&<AdminTextLink className="mb-4" href={`/${lang}/admin/users`}>← {t.allUsers}</AdminTextLink>}
  <header className="mb-7 flex items-start gap-4">
   <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0"><path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2"/></svg></span>
   <div className="min-w-0"><p className="mb-1 text-xs font-semibold uppercase tracking-widest text-sky-700">{t.accountDirectory}</p>
    <h2 className="text-3xl font-semibold tracking-tight text-slate-900">{t[section]}{company&&<span className="mt-2 block text-lg font-medium text-sky-700">{company==="personal"?t.personalAccount:companies.ok?companies.data.find(c=>String(c.id)===company)?.name??t.companyLabel:t.companyLabel}</span>}</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">{t.usersIntro}</p>
   </div>
  </header>
  <div className="mb-5 flex flex-wrap items-end justify-between gap-5">
   <p className="flex items-center gap-3 text-lg font-semibold text-slate-900">{t[section]}<span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">{result.data.total}<span className="sr-only"> {t.results}</span></span></p>
   <form className="flex w-full flex-wrap items-end gap-3 sm:w-auto"><label className="grid min-w-0 flex-1 gap-2 text-sm font-medium sm:flex-none">{t.search}<input className="form-input" name="q" maxLength={200} defaultValue={q}/></label><label className="grid min-w-0 gap-2 text-sm font-medium">{t.companyFilter}<select className="form-input max-w-full sm:max-w-64" name="companyId" defaultValue={company}><option value="">{t.allUsers}</option><option value="personal">{t.personalAccount}</option>{companies.ok&&companies.data.map(c=><option key={c.id} value={String(c.id)}>{c.name}</option>)}</select></label>
<label className="grid gap-2 text-sm font-medium">{t.sortBy}<select className="form-input" name="sort" defaultValue={sort}><option value="name">{t.nameAsc}</option><option value="name-desc">{t.nameDesc}</option><option value="owners">{t.ownersFirst}</option><option value="admins">{t.adminsFirst}</option><option value="newest">{t.newestFirst}</option></select></label>
<button className="btn-secondary">{t.applyFilters}</button></form>
  </div>
  <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2 2xl:grid-cols-3">{result.data.items.map(row=><AdminCard key={row.id}>
   <AdminCardHeading>
    <div className="mb-4 flex items-center justify-between gap-3">
     <span className="flex size-10 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0"><path d="M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2"/></svg></span>
     <AdminBadge className={row.isActive?"bg-emerald-50 text-emerald-800":"bg-slate-200 text-slate-700"}><span aria-hidden="true" className={row.isActive?"size-1.5 rounded-full bg-emerald-600":"size-1.5 rounded-full bg-slate-500"}/>{row.isActive?t.active:t.inactive}</AdminBadge>
    </div>
    <h3 className="wrap-break-word text-xl font-semibold tracking-tight text-slate-900">{row.displayName}</h3>
    <p className="mt-2 break-all text-sm text-slate-600">{row.email}</p>
    <div className="mt-4 flex flex-wrap gap-2">
     <AdminBadge className="bg-white text-sky-800">{row.companyId? t.companyAccount:t.personalAccount}</AdminBadge>
     {row.companyRole&&<AdminBadge className="bg-sky-100 text-sky-800">{row.companyRole==="Owner"?t.owner:row.companyRole==="Admin"?t.admin:t.member}</AdminBadge>}
     {row.isSuperAdmin&&<AdminBadge className="bg-violet-100 text-violet-800">{t.isSuperAdmin}</AdminBadge>}
    </div>
   </AdminCardHeading>
   <AdminAccountMeta>
    <div><dt>{t.accountLabel}</dt><dd>#{row.id}</dd></div>
    <div><dt>{row.companyId?t.companyLabel:t.accountTypeId}</dt><dd>{row.companyId?<Link className="text-sky-700 underline" href={`/${lang}/admin/companies?companyId=${row.companyId}`}>{row.companyName??`#${row.companyId}`}</Link>:plans.ok?plans.data.find(p=>p.id===row.accountTypeId)?.name??t.planUnavailable:t.planUnavailable}</dd></div>
    {row.phone&&<div><dt>{t.phoneLabel}</dt><dd>{row.phone}</dd></div>}
   </AdminAccountMeta>
   <div className="border-t border-slate-200 px-2 py-1"><details className="group/admin-disclosure"><AdminDisclosureSummary className="text-slate-700"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0"><path d="m15 5 4 4M4 20l4-1L20 7a2 2 0 0 0-4-4L4 15Z"/></svg><span>{t.editUser}</span></AdminDisclosureSummary>
    <div className="px-4 pb-5"><AdminForm inCard key={row.modifiedDate} lang={lang} section={section} row={row} plans={plans.ok?plans.data:[]}/></div>
   </details></div>
  </AdminCard>)}</div>
  {result.data.items.length===0&&<p className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">{t.empty}</p>}
  <nav className="mt-6 flex gap-4" aria-label={t.results}>{skip>0&&<Link className="btn-secondary" href={href(Math.max(0,skip-25))}>{t.previous}</Link>}{skip+25<result.data.total&&<Link className="btn-secondary" href={href(skip+25)}>{t.next}</Link>}</nav>
 </section>;
}
