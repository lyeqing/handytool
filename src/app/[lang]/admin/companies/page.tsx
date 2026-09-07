import Link from "next/link";
import { listAdmin, adminPlans } from "@/lib/handytool-api";
import { AdminForm } from "@/components/admin/admin-forms";
import { adminCopy } from "@/i18n/admin-copy";
export default async function Page({params,searchParams}:{params:Promise<{lang:string}>;searchParams:Promise<{q?:string;skip?:string;sub?:string}>}) {
 const {lang}=await params; const query=await searchParams; const t=adminCopy(lang); const section="companies" as const;
 const sub=query.sub==="true"; const skip=Math.max(0,Number(query.skip)||0); const q=query.q??"";
 const [result,plans]=await Promise.all([listAdmin(section,q,skip,sub),adminPlans()]);
 if(!result.ok) return <p role="alert">{result.status===403||result.status===401?t.forbidden:t.unavailable}</p>;
 const href=(offset:number)=>`/${lang}/admin/${section}?${new URLSearchParams({q,skip:String(offset),sub:String(sub)})}`;
 return <section><h2 className="text-xl font-semibold">{t[section]}</h2>
 
 <form className="my-6 flex flex-wrap items-end gap-3"><input type="hidden" name="sub" value={String(sub)}/><label className="grid gap-2 text-sm">{t.search}<input className="form-input" name="q" maxLength={200} defaultValue={q}/></label><button className="btn-secondary">{t.search}</button></form>
 <p className="mb-4 text-sm text-slate-500">{result.data.total} {t.results}</p>
 <div className="space-y-4">{result.data.items.map(row=><details key={row.id} className="rounded-xl border border-slate-200 bg-white p-5"><summary className="cursor-pointer break-words font-medium">{row.displayName??row.name} <span className="font-normal text-slate-500">#{row.id} {row.email??""} · {row.isActive?t.active:"—"}</span></summary><AdminForm key={row.modifiedDate} lang={lang} section={section} row={row} sub={sub} plans={plans.ok?plans.data:[]}/></details>)}</div>
 {result.data.items.length===0&&<p className="py-6 text-slate-500">{t.empty}</p>}
 <nav className="mt-6 flex gap-4" aria-label={t.results}>{skip>0&&<Link className="btn-secondary" href={href(Math.max(0,skip-25))}>{t.previous}</Link>}{skip+25<result.data.total&&<Link className="btn-secondary" href={href(skip+25)}>{t.next}</Link>}</nav>
 </section>;
}
