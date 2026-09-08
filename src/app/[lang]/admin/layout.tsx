import { AdminNav } from "@/components/admin/admin-nav";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/handytool-api";
import { adminCopy } from "@/i18n/admin-copy";
export const metadata={title:"Administration | Handytool",robots:{index:false,follow:false}};
export default async function AdminLayout({children,params}:{children:React.ReactNode;params:Promise<{lang:string}>}) {
 const {lang}=await params; const t=adminCopy(lang); const user=await getCurrentUser();
 if(!user.ok) { if(user.status===401) redirect(`/${lang}/login`); return <main id="main-content" className="p-8">{t.unavailable}</main>; }
 if(!user.data.isSuperAdmin) return <main id="main-content" className="p-8">{t.forbidden}</main>;
 return <main id="main-content" className="mx-auto w-full max-w-[90rem] px-4 py-10 sm:px-6">
 <h1 className="text-3xl font-semibold tracking-tight">{t.title}</h1><p className="mt-3 text-slate-600">{t.intro}</p>
 <AdminNav lang={lang} />{children}</main>;
}
