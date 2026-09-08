"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { adminCopy } from "@/i18n/admin-copy";

export function AdminNav({ lang }: { lang: string }) {
  const pathname = usePathname();
  const t = adminCopy(lang);

  return (
    <nav aria-label={t.title} className="my-8 flex flex-wrap gap-3">
      {(["users", "companies", "categories"] as const).map((section) => {
        const href = `/${lang}/admin/${section}`;
        const active = pathname === href || pathname.startsWith(href + "/");

        return (
          <Link
            key={section}
            href={href}
            aria-current={active ? "page" : undefined}
            className={active ? "btn-primary" : "btn-secondary"}
          >
            {t[section]}
          </Link>
        );
      })}
    </nav>
  );
}