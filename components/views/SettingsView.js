"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";
import Button, { Field, inputClass } from "@/components/ui/Button";
import UserAvatar from "@/components/ui/UserAvatar";
import { useProfile } from "@/components/layout/AppShell";
import { ROLES, labelOf } from "@/lib/constants";
import { createClient } from "@/lib/supabase/client";
import { errorMessage } from "@/lib/format";

export default function SettingsView() {
  const profile = useProfile();
  const router = useRouter();
  const [fullName, setFullName] = useState(profile.full_name || "");
  const [jobTitle, setJobTitle] = useState(profile.job_title || "");
  const [file, setFile] = useState(null);
  const [busy, setBusy] = useState(false);

  async function save(event) {
    event.preventDefault();
    if (!fullName.trim()) {
      toast.error("Ad soyad gerekli.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      let avatarUrl = profile.avatar_url;
      if (file) {
        const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
        const path = `${profile.id}/${Date.now()}-${safeName}`;
        const { error: uploadError } = await supabase.storage.from("avatars").upload(path, file);
        if (uploadError) throw uploadError;
        avatarUrl = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
      }
      const { error } = await supabase.from("profiles").update({
        full_name: fullName.trim(),
        job_title: jobTitle.trim() || null,
        avatar_url: avatarUrl,
      }).eq("id", profile.id);
      if (error) throw error;
      toast.success("Profil güncellendi.");
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error, "Profil kaydedilemedi."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader title="Ayarlar" description="Profil bilgilerinizi güncelleyin." />
      <form onSubmit={save} className="max-w-lg space-y-4 rounded-2xl border border-line bg-white p-4">
        <UserAvatar name={fullName || profile.username} url={profile.avatar_url} size="lg" />
        <Field label="Ad soyad"><input className={inputClass} value={fullName} onChange={(event) => setFullName(event.target.value)} required /></Field>
        <Field label="Pozisyon"><input className={inputClass} value={jobTitle} onChange={(event) => setJobTitle(event.target.value)} /></Field>
        <Field label="Fotoğraf"><input type="file" accept="image/*" className="block w-full text-sm" onChange={(event) => setFile(event.target.files?.[0] || null)} /></Field>
        <p className="text-sm text-muted">Kullanıcı adı: {profile.username} · Rol: {labelOf(ROLES, profile.role)}</p>
        <Button type="submit" disabled={busy}>{busy ? "Kaydediliyor..." : "Kaydet"}</Button>
      </form>
    </div>
  );
}
