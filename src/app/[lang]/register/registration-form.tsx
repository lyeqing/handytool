"use client";

import { useActionState, useState } from "react";
import type { RegistrationCopy } from "@/i18n/registration-copy";
import type { Locale } from "@/i18n/config";
import { registerAction } from "./actions";

export function RegistrationForm({ locale, t }: { locale: Locale; t: RegistrationCopy }) {
  const [company, setCompany] = useState(false);
  const [state, action, pending] = useActionState(registerAction.bind(null, locale), null);
  const error = (name: string) => state?.errors[name];

  function field(name: string, label: string, options: { required?: boolean; type?: string; max?: number; autoComplete?: string; hint?: string } = {}) {
    return <div className="space-y-2" key={name}>
      <label htmlFor={name} className="block text-sm font-medium text-slate-700">{label}{!options.required && <span className="ml-2 font-normal text-slate-500">({t.optional})</span>}</label>
      <input id={name} name={name} type={options.type ?? "text"} required={options.required}
        maxLength={options.max} autoComplete={options.autoComplete} minLength={name === "password" ? 8 : undefined}
        defaultValue={name === "password" ? undefined : state?.values[name]} className="form-input"
        aria-invalid={!!error(name)} aria-describedby={[options.hint ? `${name}-hint` : "", error(name) ? `${name}-error` : ""].filter(Boolean).join(" ") || undefined} />
      {options.hint && <p id={`${name}-hint`} className="text-sm text-slate-500">{options.hint}</p>}
      {error(name) && <p id={`${name}-error`} className="text-sm text-red-700">{error(name)}</p>}
    </div>;
  }

  return <form action={action} className="mt-8 space-y-6">
    {state && <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">{state.message}</div>}
    <fieldset disabled={pending} className="space-y-6 disabled:opacity-60">
      <legend className="mb-3 text-sm font-medium">{t.kind}</legend>
      <div className="grid grid-cols-2 gap-3">
        {[{ value: "Personal", label: t.personal }, { value: "Company", label: t.company }].map(item =>
          <label key={item.value} className={`flex min-h-12 cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm font-medium ${company === (item.value === "Company") ? "border-sky-500 bg-sky-50 text-sky-800" : "border-slate-300 bg-white"}`}>
            <input type="radio" name="accountKind" value={item.value} checked={company === (item.value === "Company")} onChange={() => setCompany(item.value === "Company")} className="size-4 accent-sky-600" />{item.label}
          </label>)}
      </div>
      <p className="text-sm leading-6 text-slate-600">{company ? t.companyHint : t.personalHint}</p>
      {field("displayName", t.name, { required: true, max: 200, autoComplete: "name" })}
      {field("email", t.email, { required: true, type: "email", max: 320, autoComplete: "email" })}
      {field("phone", t.phone, { type: "tel", max: 40, autoComplete: "tel" })}
      {field("password", t.password, { required: true, type: "password", max: 1024, autoComplete: "new-password", hint: t.passwordHint })}
      {company && <fieldset className="space-y-5 rounded-xl border border-slate-200 bg-slate-50 p-5">
        <legend className="px-2 text-base font-semibold text-slate-900">{t.companyDetails}</legend>
        {field("companyName", t.companyName, { required: true, max: 200, autoComplete: "organization" })}
        {field("country", t.country, { max: 100, autoComplete: "country-name" })}
        <div className="space-y-2"><label htmlFor="address" className="block text-sm font-medium">{t.address} <span className="font-normal text-slate-500">({t.optional})</span></label>
          <textarea id="address" name="address" maxLength={2000} autoComplete="street-address" rows={3} className="form-input" defaultValue={state?.values.address} aria-invalid={!!error("address")} aria-describedby={error("address") ? "address-error" : undefined} />
          {error("address") && <p id="address-error" className="text-sm text-red-700">{error("address")}</p>}
        </div>
        {field("websiteUrl", t.websiteUrl, { type: "url", max: 2048, autoComplete: "url", hint: t.websiteHint })}
      </fieldset>}
      <p className="text-sm font-medium text-emerald-700">{t.free}</p>
      <button disabled={pending} className="btn-primary w-full">{pending ? t.pending : t.create}</button>
    </fieldset>
  </form>;
}
