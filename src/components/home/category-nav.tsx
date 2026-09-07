import Link from "next/link";
import type { Category } from "@/lib/home-types";
import type { HomeCopy } from "@/i18n/home-copy";
import type { Locale } from "@/i18n/config";
export function CategoryNav({ categories, locale, selected, t }: { categories: Category[]; locale: Locale; selected?: number; t: HomeCopy }) {
  return <nav aria-label={t.all} className="space-y-2">
    <Link className={`block rounded-lg px-4 py-3 text-sm font-medium ${selected === undefined ? "bg-sky-50 text-sky-800" : "text-slate-600 hover:bg-slate-100"}`} href={`/${locale}#workspace`} aria-current={selected === undefined ? "page" : undefined}>{t.all}</Link>
    {categories.map(c => <div key={c.id}>
      <Link className={`block rounded-lg px-4 py-3 text-sm font-medium ${selected === c.id ? "bg-sky-50 text-sky-800" : "text-slate-600 hover:bg-slate-100"}`} href={`/${locale}?category=${c.id}#workspace`} aria-current={selected === c.id ? "page" : undefined}>{c.name}</Link>
      {selected === c.id && c.subcategories.map(s => <Link key={s.id} className="ml-4 block rounded-lg px-4 py-2 text-sm text-slate-600 hover:text-sky-700" href={`/${locale}?category=${c.id}&subcategory=${s.id}#workspace`}>{s.name}</Link>)}
    </div>)}
  </nav>;
}
