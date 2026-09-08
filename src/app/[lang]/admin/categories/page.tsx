import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { listAdmin } from "@/lib/handytool-api";
import { AdminForm } from "@/components/admin/admin-forms";
import { adminCopy } from "@/i18n/admin-copy";

export default async function Page({params,searchParams}:{params:Promise<{lang:string}>;searchParams:Promise<{q?:string;skip?:string;sub?:string;masterCategoryId?:string}>}) {
 const {lang}=await params;
 const query=await searchParams;
 const t=adminCopy(lang);
 const base=`/${lang}/admin/categories`;
 const masterCategoryId=query.masterCategoryId===undefined?undefined:Number(query.masterCategoryId);
 if(masterCategoryId!==undefined && (!Number.isSafeInteger(masterCategoryId) || masterCategoryId===0)) notFound();
 if(query.sub==="true" && masterCategoryId===undefined) redirect(base);
 const sub=masterCategoryId!==undefined;
 const offset=Number(query.skip);
 const skip=Number.isSafeInteger(offset)&&offset>=0?offset:0;
 const q=query.q??"";
 const result=await listAdmin("categories",q,skip,sub,masterCategoryId);
 if(!result.ok) {
   if(result.status===404) notFound();
   return <p role="alert">{result.status===403||result.status===401?t.forbidden:t.unavailable}</p>;
 }
 const parent=result.data.parent;
 const href=(offset:number)=> {
   const search=new URLSearchParams({q,skip:String(offset)});
   if(masterCategoryId!==undefined) search.set("masterCategoryId",String(masterCategoryId));
   return `${base}?${search}`;
 };
 return <section>
  <nav aria-label={t.categories} className="mb-5 flex flex-wrap items-center gap-2 text-sm">
   {sub?<><Link className="text-sky-700 underline" href={base}>{t.categories}</Link><span aria-hidden="true">→</span><span>{parent?.name}</span><span aria-hidden="true">→</span><span aria-current="page">{t.sub}</span></>:<span aria-current="page">{t.categories}</span>}
  </nav>
  <h2 className="text-xl font-semibold">{sub?`${parent?.name} — ${t.sub}`:t.master}</h2>
  <details className="my-5 rounded-xl border border-sky-200 bg-sky-50 p-5">
   <summary className="font-medium">{sub?t.createSub:t.createMaster}</summary>
   <AdminForm key={masterCategoryId??"master"} lang={lang} section="categories" sub={sub} masterCategoryId={masterCategoryId}/>
  </details>
  <form className="my-6 flex flex-wrap items-end gap-3">
   {sub&&<input type="hidden" name="masterCategoryId" value={masterCategoryId}/>}
   <label className="grid gap-2 text-sm">{t.search}<input className="form-input" name="q" maxLength={200} defaultValue={q}/></label>
   <button className="btn-secondary">{t.search}</button>
  </form>
  <p className="mb-4 text-sm text-slate-500">{result.data.total} {t.results}</p>
  <div className="space-y-4">{result.data.items.map(row=><article key={row.id} className="rounded-xl border border-slate-200 bg-white p-5">
   <div className="flex flex-wrap items-center justify-between gap-3">
    <h3 className="break-words font-medium">{sub?row.name:<Link className="text-sky-700 underline" href={`${base}?masterCategoryId=${row.id}`}>{row.name}</Link>}</h3>
    {!sub&&<Link className="btn-secondary" href={`${base}?masterCategoryId=${row.id}`}>{t.manageSub}</Link>}
   </div>
   <details className="mt-4"><summary className="text-sm font-medium">{t.edit} · {row.isActive?t.active:"—"}</summary>
    <AdminForm key={row.modifiedDate} lang={lang} section="categories" row={row} sub={sub} masterCategoryId={masterCategoryId}/>
   </details>
  </article>)}</div>
  {result.data.items.length===0&&<p className="py-6 text-slate-500">{t.empty}</p>}
  <nav className="mt-6 flex gap-4" aria-label={t.results}>
   {skip>0&&<Link className="btn-secondary" href={href(Math.max(0,skip-25))}>{t.previous}</Link>}
   {skip+25<result.data.total&&<Link className="btn-secondary" href={href(skip+25)}>{t.next}</Link>}
  </nav>
 </section>;
}
