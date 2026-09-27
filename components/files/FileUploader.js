"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Download, Trash2, Upload } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { listAttachments } from "@/lib/data";
import { errorMessage, fileSize, formatDateTime } from "@/lib/format";
import { startRequest } from "@/lib/load";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import EmptyState from "@/components/ui/EmptyState";

export default function FileUploader({ entityType, entityId, profileId }) {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  async function load() {
    setLoading(true);
    try {
      setFiles(await listAttachments(entityType, entityId));
    } catch (error) {
      toast.error(errorMessage(error, "Dosyalar yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => startRequest(() => load()), [entityType, entityId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function upload(event) {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (file.size > 20 * 1024 * 1024) {
      toast.error("Dosya 20 MB'dan büyük olamaz.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${entityType}/${entityId}/${crypto.randomUUID()}-${safeName}`;
      const { error: uploadError } = await supabase.storage.from("attachments").upload(path, file);
      if (uploadError) throw uploadError;
      const { error } = await supabase.from("attachments").insert({
        filename: file.name,
        storage_path: path,
        mime_type: file.type || null,
        size: file.size,
        uploaded_by: profileId,
        entity_type: entityType,
        entity_id: entityId,
      });
      if (error) throw error;
      toast.success("Dosya yüklendi.");
      await load();
    } catch (error) {
      toast.error(errorMessage(error, "Dosya yüklenemedi."));
    } finally {
      setBusy(false);
    }
  }

  async function download(file) {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.storage.from("attachments").createSignedUrl(file.storage_path, 60);
      if (error) throw error;
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(errorMessage(error, "Dosya açılamadı."));
    }
  }

  async function remove(file) {
    const supabase = createClient();
    const { error: storageError } = await supabase.storage.from("attachments").remove([file.storage_path]);
    if (storageError) throw storageError;
    const { error } = await supabase.from("attachments").delete().eq("id", file.id);
    if (error) throw error;
    toast.success("Dosya silindi.");
    setPendingDelete(null);
    await load();
  }

  return (
    <div className="space-y-3">
      <label className="inline-flex h-11 cursor-pointer items-center gap-2 rounded-xl bg-accent px-4 text-sm font-medium text-white">
        <Upload className="h-4 w-4" />
        {busy ? "Yükleniyor..." : "Dosya yükle"}
        <input type="file" className="hidden" onChange={upload} disabled={busy} />
      </label>
      {loading ? <div className="skeleton h-16 rounded-2xl" /> : null}
      {!loading && files.length === 0 ? (
        <EmptyState title="Henüz dosya yok." description="Bu kayda dosya ekleyebilirsiniz." />
      ) : null}
      <div className="space-y-2">
        {files.map((file) => (
          <div key={file.id} className="flex items-center gap-3 rounded-2xl border border-line bg-white px-3 py-3">
            <div className="min-w-0 flex-1">
              <div className="truncate text-sm font-medium">{file.filename}</div>
              <div className="text-xs text-muted">
                {fileSize(file.size)} · {formatDateTime(file.created_at)}
              </div>
            </div>
            <button type="button" className="grid h-10 w-10 place-items-center rounded-xl hover:bg-zinc-100" onClick={() => download(file)} aria-label="İndir">
              <Download className="h-4 w-4" />
            </button>
            <button type="button" className="grid h-10 w-10 place-items-center rounded-xl text-rose-600 hover:bg-rose-50" onClick={() => setPendingDelete(file)} aria-label="Sil">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
      {pendingDelete ? (
        <ConfirmDialog
          title="Dosyayı sil"
          message={`${pendingDelete.filename} kalıcı olarak silinsin mi?`}
          onClose={() => setPendingDelete(null)}
          onConfirm={() => remove(pendingDelete)}
        />
      ) : null}
    </div>
  );
}
