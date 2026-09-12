"use client";

import { useEffect, useId, useRef, useState } from "react";
import { signOut } from "@/app/[lang]/login/actions";
import { homeCopy } from "@/i18n/home-copy";
import type { Locale } from "@/i18n/config";

export function AccountMenu({locale,name,email,isSuperAdmin,companyName}:{
  locale:Locale; name:string; email:string; isSuperAdmin:boolean; companyName?:string|null;
}) {
  const t=homeCopy(locale);
  const [open,setOpen]=useState(false);
  const id=useId();
  const root=useRef<HTMLDivElement>(null);
  const trigger=useRef<HTMLButtonElement>(null);
  const logoutButton=useRef<HTMLButtonElement>(null);
  const parts=name.trim().split(/\s+/).filter(Boolean);
  const initials=(parts.length>1
    ? Array.from(parts[0])[0]+Array.from(parts[parts.length-1])[0]
    : Array.from(parts[0]||email).slice(0,2).join("")).toLocaleUpperCase(locale);
  const role=isSuperAdmin?t.accountSuperuser:companyName||t.accountPersonal;

  useEffect(()=>{
    if(!open) return;
    const outside=(event:PointerEvent)=>{
      if(event.target instanceof Node && !root.current?.contains(event.target)) setOpen(false);
    };
    const escape=(event:KeyboardEvent)=>{
      if(event.key==="Escape") { event.preventDefault(); setOpen(false); trigger.current?.focus(); }
    };
    document.addEventListener("pointerdown",outside);
    document.addEventListener("keydown",escape);
    return ()=>{
      document.removeEventListener("pointerdown",outside);
      document.removeEventListener("keydown",escape);
    };
  },[open]);

  return <div className="relative" ref={root} onBlur={event=>{
    if(!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
  }}>
    <button ref={trigger} type="button" aria-expanded={open} aria-controls={id}
      aria-label={`${t.accountMenu}: ${name||email}`}
      onClick={()=>setOpen(value=>!value)}
      onKeyDown={event=>{
        if(event.key==="ArrowDown") {
          event.preventDefault(); setOpen(true);
          requestAnimationFrame(()=>logoutButton.current?.focus());
        }
      }}
      className="flex min-h-11 items-center gap-2 rounded-full p-1 text-sm font-medium text-slate-800 hover:bg-sky-50 sm:pr-3">
      <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-full bg-sky-100 font-semibold text-sky-800 ring-1 ring-sky-200">{initials}</span>
      <span className="hidden max-w-40 truncate sm:block">{name||email}</span>
      <svg aria-hidden="true" className="hidden size-4 sm:block" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d={open?"m6 15 6-6 6 6":"m6 9 6 6 6-6"}/></svg>
    </button>
    {open&&<div id={id} role="region" aria-label={t.accountMenu}
      className="absolute right-0 top-full z-50 mt-3 w-72 max-w-[calc(100vw-2rem)] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
      <div className="border-b border-slate-100 bg-sky-50 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{t.signedInAs}</p>
        <p className="mt-2 wrap-break-word font-semibold text-slate-900">{name||email}</p>
        <p className="mt-1 break-all text-sm text-slate-600">{email}</p>
        <span className="mt-3 inline-flex max-w-full wrap-break-word rounded-xl bg-white px-3 py-1 text-xs font-semibold text-sky-800 ring-1 ring-sky-100">{role}</span>
      </div>
      <form action={signOut.bind(null,locale)} className="p-2">
        <button ref={logoutButton} className="flex min-h-11 w-full items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-slate-700 hover:bg-slate-100">
          <svg aria-hidden="true" className="size-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M9 4H4v16h5m6-12 4 4-4 4M9 12h10"/></svg>{t.signOut}
        </button>
      </form>
    </div>}
  </div>;
}