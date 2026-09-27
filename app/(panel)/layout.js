import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import { createClient } from "@/lib/supabase/server";

export default async function PanelLayout({ children }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  if (!profile) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas px-6 text-center">
        <div className="max-w-md">
          <h1 className="text-xl font-semibold">Profil bulunamadı</h1>
          <p className="mt-2 text-sm text-muted">Hesabınız var ancak profil kaydı oluşmamış. Yöneticinize haber verin.</p>
        </div>
      </div>
    );
  }

  if (!profile.is_active) {
    return (
      <div className="grid min-h-screen place-items-center bg-canvas px-6 text-center">
        <p className="text-sm">Hesabınız pasif durumda. Yönetici ile iletişime geçin.</p>
      </div>
    );
  }

  return <AppShell profile={profile}>{children}</AppShell>;
}
