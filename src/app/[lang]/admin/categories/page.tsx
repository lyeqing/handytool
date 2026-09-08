import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { listAdmin } from "@/lib/handytool-api";
import { AdminForm, DeleteCategoryForm } from "@/components/admin/admin-forms";
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
 return <section className="admin-category-surface">
  {sub&&<nav aria-label={t.categories} className="mb-6"><Link className="admin-text-action" href={base}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0"><path d="m12 5-7 7 7 7M5 12h14"/></svg>{t.allCategories}</Link></nav>}
  <header className="mb-7 flex items-start gap-4">
   <span className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-sky-100 text-sky-700"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3Z"/></svg></span>
   <div className="min-w-0"><p className="mb-1 text-xs font-semibold uppercase tracking-widest text-sky-700">{sub?t.masterLabel:t.categoryLibrary}</p>
    <h2 className="break-words text-3xl font-semibold tracking-tight text-slate-900">{sub?parent?.name:t.master}</h2>
    <p className="mt-2 text-sm leading-6 text-slate-600">{sub?t.subIntro:t.masterIntro}</p>
   </div>
  </header>
  <details className="admin-create mb-7 max-w-3xl">
   <summary className="admin-disclosure text-sky-800"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0"><path d="M12 5v14M5 12h14"/></svg><span>{sub?t.createSub:t.createMaster}</span><span aria-hidden="true" className="admin-chevron ml-auto">⌄</span></summary>
   <div className="border-t border-sky-100 p-5"><AdminForm key={masterCategoryId??"master"} lang={lang} section="categories" sub={sub} masterCategoryId={masterCategoryId}/></div>
  </details>
  <div className="mb-5 flex flex-wrap items-end justify-between gap-5">
   <h3 className="flex items-center gap-3 text-lg font-semibold text-slate-900">{sub?t.sub:t.master}<span className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700">{result.data.total}<span className="sr-only"> {t.results}</span></span></h3>
   <form className="flex w-full flex-wrap items-end gap-3 sm:w-auto">
    {sub&&<input type="hidden" name="masterCategoryId" value={masterCategoryId}/>}
    <label className="grid min-w-0 flex-1 gap-2 text-sm font-medium sm:flex-none">{t.search}<input className="form-input" name="q" maxLength={200} defaultValue={q}/></label>
    <button className="btn-secondary">{t.search}</button>
   </form>
  </div>
  <div className="grid grid-cols-1 items-start gap-5 lg:grid-cols-2 2xl:grid-cols-3">{result.data.items.map(row=><article key={row.id} className="admin-category-card min-w-0">
   <div className="admin-card-heading">
    <div className="mb-4 flex items-center justify-between gap-3">
     <span className="flex size-10 items-center justify-center rounded-xl bg-white text-sky-700 shadow-sm"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0"><path d="M3 7a2 2 0 0 1 2-2h5l2 2h7a2 2 0 0 1 2 2v10H3Z"/></svg></span>
     <span className={row.isActive?"admin-status bg-emerald-50 text-emerald-800":"admin-status bg-slate-200 text-slate-700"}><span aria-hidden="true" className={row.isActive?"size-1.5 rounded-full bg-emerald-600":"size-1.5 rounded-full bg-slate-500"}/>{row.isActive?t.active:t.inactive}</span>
    </div>
    <p className="mb-1 text-xs font-medium text-slate-500">{sub?t.subLabel:t.masterLabel}</p>
    <h4 className="break-words text-xl font-semibold tracking-tight text-slate-900">{sub?row.name:<Link className="rounded hover:text-sky-700 hover:underline" href={`${base}?masterCategoryId=${row.id}`}>{row.name}</Link>}</h4>
    {row.description&&<p className="mt-2 break-words text-sm leading-6 text-slate-600">{row.description}</p>}
    {!sub&&<Link className="admin-text-action mt-4" href={`${base}?masterCategoryId=${row.id}`}>{t.manageSub}<span aria-hidden="true">→</span></Link>}
   </div>
   <div className="admin-card-actions">
    <details><summary className="admin-disclosure text-slate-700"><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="size-5 shrink-0"><path d="m15 5 4 4M4 20l4-1L20 7a2 2 0 0 0-4-4L4 15Z"/></svg><span>{t.edit}</span><span aria-hidden="true" className="admin-chevron ml-auto">⌄</span></summary>
     <div className="px-4 pb-5"><AdminForm key={row.modifiedDate} lang={lang} section="categories" row={row} sub={sub} masterCategoryId={masterCategoryId}/></div>
    </details>
    <DeleteCategoryForm key={"delete-"+row.modifiedDate} lang={lang} row={row} sub={sub}/>
   </div>
  </article>)}</div>
  {result.data.items.length===0&&<p className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center text-slate-500">{t.empty}</p>}
  <nav className="mt-6 flex gap-4" aria-label={t.results}>
   {skip>0&&<Link className="btn-secondary" href={href(Math.max(0,skip-25))}>{t.previous}</Link>}
   {skip+25<result.data.total&&<Link className="btn-secondary" href={href(skip+25)}>{t.next}</Link>}
  </nav>
 </section>;
}
