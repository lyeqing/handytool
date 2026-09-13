"use server";
import { getCurrentUser, saveAdmin, deleteAdminCategory } from "@/lib/handytool-api";
import { revalidatePath } from "next/cache";
import { isLocale } from "@/i18n/config";
import { adminCopy } from "@/i18n/admin-copy";
import type { AdminSection, AdminSaveRequest } from "@/lib/admin-types";

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
 let request: AdminSaveRequest;
 if(section==="users") {
   if(id===null) return {message:t.failed,ok:false};
   const companyId=number("companyId");
   const companyRole=companyId===null?null:optional("companyRole");
   if(companyRole!==null && companyRole!=="Owner" && companyRole!=="Admin" && companyRole!=="Member") return {message:t.failed,ok:false};
   request={section:"users",id,payload:{displayName:text("displayName"),email:text("email"),phone:optional("phone"),preferredLanguage:optional("preferredLanguage"),
    companyId,companyRole,accountTypeId:companyId===null?number("accountTypeId"):null,
    isActive:checked("isActive"),isSuperAdmin:checked("isSuperAdmin"),modifiedDate:text("modifiedDate")}};
 } else if(section==="companies") {
   if(id===null) return {message:t.failed,ok:false};
   const accountTypeId=number("accountTypeId"),seatLimit=number("seatLimit");
   if(accountTypeId===null || seatLimit===null || !Number.isInteger(accountTypeId) || !Number.isInteger(seatLimit)) return {message:t.failed,ok:false};
   const expiry=optional("expiresAt");
   if(expiry && Number.isNaN(Date.parse(expiry+"Z"))) return {message:t.failed,ok:false};
   request={section:"companies",id,payload:{name:text("name"),country:optional("country"),address:optional("address"),websiteUrl:optional("websiteUrl"),
    accountTypeId,seatLimit,expiresAt:expiry?new Date(expiry+"Z").toISOString():null,
    isActive:checked("isActive"),modifiedDate:text("modifiedDate")}};
 } else request={section:"categories",id,sub,payload:{name:text("name"),description:text("description"),isActive:checked("isActive"),displayOrder:number("displayOrder")??0,
   masterCategoryId:sub?number("masterCategoryId"):null,modifiedDate:optional("modifiedDate"),
   translations:[{languageCode:"en",name:optional("enName"),description:optional("enDescription")},
     {languageCode:"zh-Hans",name:optional("zhName"),description:optional("zhDescription")}]}};
 const result=await saveAdmin(request);
 if(!result.ok) return {message: result.status===401||result.status===403?t.forbidden:
   lang==="en" && result.status>=400 && result.status<500 ? result.message : result.status===409?t.conflict:t.failed,ok:false};
 revalidatePath(`/${lang}/admin`,"layout");
 revalidatePath(`/${lang}`,"layout");
 return {message:t.saved,ok:true};
}

export async function deleteCategoryAction(lang: string, id: number, sub: boolean, modifiedDate: string,
 _previous: { message: string; ok: boolean } | null, form: FormData) {
 const t=adminCopy(lang);
 if(!isLocale(lang) || !Number.isSafeInteger(id) || form.get("confirmDelete")!=="on")
  return {message:t.confirmRequired,ok:false};
 const actor=await getCurrentUser();
 if(!actor.ok || !actor.data.isSuperAdmin) return {message:t.forbidden,ok:false};
 const result=await deleteAdminCategory(id,sub,modifiedDate);
 if(!result.ok) return {message:result.status===401||result.status===403?t.forbidden:
  lang==="en" && result.status>=400 && result.status<500?result.message:result.status===409?t.conflict:t.failed,ok:false};
 revalidatePath(`/${lang}/admin`,"layout");
 revalidatePath(`/${lang}`,"layout");
 return {message:t.deleted,ok:true};
}