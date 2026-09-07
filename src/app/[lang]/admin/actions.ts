"use server";
import { getCurrentUser, saveAdmin } from "@/lib/handytool-api";
import { revalidatePath } from "next/cache";
import { isLocale } from "@/i18n/config";
import { adminCopy } from "@/i18n/admin-copy";
import type { AdminSection } from "@/lib/admin-types";

export async function saveAdminAction(lang: string, section: AdminSection, id: number | null, sub: boolean,
 _previous: { message: string; ok: boolean } | null, form: FormData) {
 const t=adminCopy(lang);
 if(!isLocale(lang) || !["users","companies","categories"].includes(section)) return {message:t.failed,ok:false};
 const actor=await getCurrentUser();
 if(!actor.ok || !actor.data.isSuperAdmin) return {message:t.forbidden,ok:false};
 const text=(key:string)=>String(form.get(key) ?? "").trim();
 const optional=(key:string)=>text(key)||null;
 const number=(key:string)=>text(key) ? Number(text(key)) : null;
 const checked=(key:string)=>form.get(key)==="on";
 let payload: Record<string,unknown>;
 if(section==="users") {
   const companyId=number("companyId");
   payload={displayName:text("displayName"),email:text("email"),phone:optional("phone"),preferredLanguage:optional("preferredLanguage"),
    companyId,companyRole:companyId===null?null:optional("companyRole"),accountTypeId:companyId===null?number("accountTypeId"):null,
    isActive:checked("isActive"),isSuperAdmin:checked("isSuperAdmin"),modifiedDate:text("modifiedDate")};
 } else if(section==="companies") {
   const expiry=optional("expiresAt");
   if(expiry && Number.isNaN(Date.parse(expiry+"Z"))) return {message:t.failed,ok:false};
   payload={name:text("name"),country:optional("country"),address:optional("address"),websiteUrl:optional("websiteUrl"),
    accountTypeId:number("accountTypeId"),seatLimit:number("seatLimit"),expiresAt:expiry?new Date(expiry+"Z").toISOString():null,
    isActive:checked("isActive"),modifiedDate:text("modifiedDate")};
 } else payload={name:text("name"),description:text("description"),isActive:checked("isActive"),displayOrder:number("displayOrder")??0,
   masterCategoryId:sub?number("masterCategoryId"):null,modifiedDate:optional("modifiedDate"),
   translations:[{languageCode:"en",name:optional("enName"),description:optional("enDescription")},
     {languageCode:"zh-Hans",name:optional("zhName"),description:optional("zhDescription")}]};
 const result=await saveAdmin(section,id,sub,payload);
 if(!result.ok) return {message: result.status===401||result.status===403?t.forbidden:
   lang==="en" && result.status>=400 && result.status<500 ? result.message : result.status===409?t.conflict:t.failed,ok:false};
 revalidatePath(`/${lang}/admin`,"layout");
 revalidatePath(`/${lang}`,"layout");
 return {message:t.saved,ok:true};
}
