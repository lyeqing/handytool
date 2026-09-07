import { cookies } from "next/headers";
import Link from "next/link";
import type { Metadata } from "next";
import { getHome } from "@/lib/handytool-api";
import { defaultLocale, isLocale } from "@/i18n/config";
import { homeCopy } from "@/i18n/home-copy";
import { CategoryNav } from "@/components/home/category-nav";
export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  const t = homeCopy(locale);
  return { title: `Handytool | ${t.tagline}`, description: t.intro,
    alternates: { canonical: `https://handytool.org/${locale}`, languages: { en: "https://handytool.org/en", "zh-Hans": "https://handytool.org/zh-Hans" } } };
}
export default async function Home({ params, searchParams }: PageProps<"/[lang]">) {
  const { lang } = await params;
  const locale = isLocale(lang) ? lang : defaultLocale;
  const t = homeCopy(locale);
  const search = await searchParams;
  const number = (v: string | string[] | undefined) => typeof v === "string" && /^-?\d+$/.test(v) && Number.isSafeInteger(Number(v)) ? Number(v) : undefined;
  const category = number(search.category), subcategory = number(search.subcategory), skip = Math.max(0, number(search.skip) ?? 0);
  const result = await getHome(locale, category, subcategory, skip);
  const hasSession = (await cookies()).has("session_token");
  const data = result.ok ? result.data : { user: null, canCreateDefinition: false, categories: [], tools: [], records: null };
  const signedIn = !!data?.user;
  const path = (offset: number) => `/${locale}?${new URLSearchParams({ ...(category !== undefined ? { category: String(category) } : {}), ...(subcategory !== undefined ? { subcategory: String(subcategory) } : {}), skip: String(offset) })}#workspace`;
  const tools = <section className="mt-10" id="tools"><h2 className="text-xl font-semibold text-slate-900">{t.tools}</h2>
    <div className="mt-5 grid gap-4 sm:grid-cols-2">{data?.tools.map(tool => <Link key={tool.id} href={`/${locale}/schemas/${tool.id}/records/new`} className="group rounded-xl border border-slate-200 bg-white p-5 transition-colors hover:border-sky-300">
      <h3 className="font-semibold text-slate-900">{tool.name}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{tool.description}</p><span className="mt-4 inline-block text-sm font-medium text-sky-700">{t.open} <span aria-hidden="true">↗</span></span>
    </Link>)}</div>{data?.tools.length === 0 && <p className="mt-4 text-sm text-slate-500">{t.noTools}</p>}</section>;
  return <main id="main-content" className="flex-1">
    {search.error === "logout" && <p role="alert" className="mx-auto mt-4 max-w-7xl rounded-lg bg-red-50 p-4 text-red-700">{t.logoutError}</p>}
    {!result.ok && hasSession ? <section className="mx-auto max-w-3xl px-6 py-16"><h1 className="text-3xl font-semibold text-slate-900">Handytool</h1><p role="alert" className="mt-5 rounded-lg border border-amber-200 bg-amber-50 p-5 text-amber-900">{t.unavailable}</p><Link className="btn-primary mt-6" href={`/${locale}`}>{t.retry}</Link></section> :
    signedIn ? <div id="workspace" className="mx-auto grid max-w-7xl gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[15rem_1fr] lg:px-8 lg:py-10">
      <aside className="self-start rounded-xl border border-slate-200 bg-white p-3 lg:sticky lg:top-6"><p className="px-4 py-3 text-xs font-semibold uppercase tracking-wider text-slate-500">{t.all}</p><CategoryNav categories={data!.categories} locale={locale} selected={category} t={t} /></aside>
      <div className="min-w-0"><p className="text-sm text-slate-500">{t.greeting.replace("{name}", data!.user!.displayName)}</p><div className="mt-2 flex flex-wrap items-center justify-between gap-4"><h1 className="text-3xl font-semibold tracking-tight text-slate-900">{t.records}</h1>{data!.canCreateDefinition && <Link href={`/${locale}/schemas/new`} className="btn-secondary">+ {t.create}</Link>}</div><p className="mt-3 leading-7 text-slate-600">{t.recordsIntro}</p>
        <p className="mt-8 text-sm text-slate-500">{t.total.replace("{count}", String(data!.records!.total))}</p>
        {data!.records!.items.length ? <div className="mt-4 grid gap-4 md:grid-cols-2">{data!.records!.items.map(r => <Link key={r.id} href={`/${locale}/records/${r.id}`} className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm transition-colors hover:border-sky-300"><span className="rounded-full bg-sky-50 px-3 py-1 text-xs font-medium text-sky-800">{r.toolName}</span><h2 className="mt-4 text-lg font-semibold text-slate-900">{r.title || t.noTitle}</h2><p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{r.description || t.noDescription}</p><p className="mt-6 text-xs text-slate-500">{t.updated} <time dateTime={r.modifiedDate}>{new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeZone: "UTC" }).format(new Date(r.modifiedDate))}</time></p></Link>)}</div> :
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center"><h2 className="text-xl font-semibold text-slate-900">{t.noRecords}</h2><p className="mt-3 text-slate-600">{t.noRecordsText}</p></div>}
        <nav aria-label={t.records} className="mt-6 flex justify-between">{skip > 0 ? <Link className="btn-secondary" href={path(Math.max(0, skip - 12))}>{t.previous}</Link> : <span />}{skip + 12 < data!.records!.total && <Link className="btn-secondary" href={path(skip + 12)}>{t.next}</Link>}</nav>{tools}
      </div>
    </div> : <>
      <section className="mx-auto grid max-w-7xl items-center gap-12 px-4 py-16 sm:px-6 md:py-24 lg:grid-cols-[1.2fr_1fr] lg:gap-20 lg:px-8">
        <div><p className="text-xs font-semibold tracking-widest text-sky-700">{t.badge}</p><h1 className="mt-6 text-4xl font-semibold leading-tight tracking-tight text-slate-900 sm:text-5xl lg:text-6xl">{t.title}<br /><span className="text-sky-600">{t.accent}</span></h1><p className="mt-6 max-w-xl text-lg leading-8 text-slate-600">{t.intro}</p><div className="mt-8 flex flex-wrap gap-4"><a className="btn-primary" href="#categories">{t.browse} <span aria-hidden="true">↗</span></a><Link className="btn-secondary" href={`/${locale}/login`}>{t.workspace}</Link></div></div>
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"><div className="flex items-center gap-2 text-xs font-medium tracking-wider text-emerald-700"><span className="size-2 rounded-full bg-emerald-600" />{t.previewLabel}</div><h2 className="mt-5 text-2xl font-semibold tracking-tight text-slate-900">{t.previewTitle}</h2><ul className="mt-6 space-y-3">{t.previewItems.map((item, i) => <li key={item} className="flex items-center gap-4 rounded-lg border border-slate-100 bg-slate-50 p-4"><span aria-hidden="true" className="text-sm font-medium text-sky-600">0{i + 1}</span><span className="text-sm text-slate-700">{item}</span></li>)}</ul><p className="mt-6 border-t border-slate-100 pt-5 text-sm text-slate-500">{t.previewFoot}</p></div>
      </section>
      <section className="border-y border-slate-200 bg-white"><div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8"><h2 className="text-2xl font-semibold tracking-tight text-slate-900">{t.how}</h2><p className="mt-3 text-slate-600">{t.howIntro}</p><div className="mt-10 grid gap-8 md:grid-cols-3">{t.steps.map((step, i) => <article key={step.title}><span className="inline-flex size-10 items-center justify-center rounded-lg bg-sky-50 font-medium text-sky-700">0{i + 1}</span><h3 className="mt-5 text-lg font-semibold text-slate-900">{step.title}</h3><p className="mt-3 text-sm leading-7 text-slate-600">{step.text}</p></article>)}</div></div></section>
      <section id="categories" className="mx-auto max-w-7xl scroll-mt-6 px-4 py-14 sm:px-6 lg:px-8"><h2 className="text-2xl font-semibold tracking-tight text-slate-900">{t.categories}</h2>{!result.ok && <p role="alert" className="mt-4 rounded-lg bg-amber-50 p-4 text-amber-900">{t.catalogueUnavailable} <Link className="underline" href={`/${locale}#categories`}>{t.retry}</Link></p>}<p className="mt-3 text-slate-600">{t.categoriesIntro}</p><div className="mt-8 grid gap-5 md:grid-cols-3">{data!.categories.map(c => <Link href={`/${locale}?category=${c.id}#workspace`} key={c.id} className={`rounded-xl border bg-white p-6 transition-colors hover:border-sky-300 ${category === c.id ? "border-sky-500" : "border-slate-200"}`}><h3 className="text-lg font-semibold text-slate-900">{c.name} <span aria-hidden="true" className="float-right text-sky-600">↗</span></h3><p className="mt-3 text-sm leading-7 text-slate-600">{c.description}</p></Link>)}</div>{!data!.categories.length && <p className="mt-6 text-slate-500">{t.noCategories}</p>}<div id="workspace" className="scroll-mt-6">{category !== undefined && <Link href={`/${locale}#categories`} className="mt-8 inline-block text-sm text-sky-700">{t.all}</Link>}{tools}</div></section>
    </>}
  </main>;
}
