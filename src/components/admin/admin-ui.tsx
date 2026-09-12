import Link from "next/link";
import type { ComponentProps } from "react";

export function AdminCard({ className = "", ...props }: ComponentProps<"article">) {
  return <article className={`@container min-w-0 rounded-2xl border border-slate-200 bg-white shadow-[0_2px_4px_rgb(15_23_42/5%),0_6px_16px_rgb(15_23_42/5%)] ${className}`} {...props} />;
}

export function AdminCardHeading({ className = "", ...props }: ComponentProps<"div">) {
  return <div className={`rounded-t-2xl bg-[#f0f7fc] p-5 ${className}`} {...props} />;
}

export function AdminBadge({ className = "", ...props }: ComponentProps<"span">) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold leading-normal ${className}`} {...props} />;
}

export function AdminTextLink({ className = "", ...props }: ComponentProps<typeof Link>) {
  return <Link className={`inline-flex min-h-11 items-center gap-2 rounded-lg px-2 py-1 text-sm font-semibold leading-normal text-sky-700 hover:bg-sky-100 motion-safe:transition-[background-color] motion-safe:duration-150 motion-safe:ease-[ease] ${className}`} {...props} />;
}

export function AdminAccountMeta({ className = "", ...props }: ComponentProps<"dl">) {
  return <dl className={`grid gap-3 px-5 py-4 text-sm leading-normal [&>div]:grid [&>div]:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] [&>div]:gap-3 [&_dt]:text-slate-500 [&_dd]:m-0 [&_dd]:text-slate-700 [&_dd]:wrap-anywhere ${className}`} {...props} />;
}

export function AdminDisclosureSummary({ className = "", children, ...props }: ComponentProps<"summary">) {
  return (
    <summary className={`flex min-h-12 list-none items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold leading-normal hover:bg-slate-900/5 motion-safe:transition-[background-color] motion-safe:duration-150 motion-safe:ease-[ease] [&::-webkit-details-marker]:hidden ${className}`} {...props}>
      {children}
      <span aria-hidden="true" className="ml-auto group-open/admin-disclosure:rotate-180 motion-safe:transition-transform motion-safe:duration-150 motion-safe:ease-[ease]">⌄</span>
    </summary>
  );
}
