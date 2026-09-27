"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { listNotes, logActivity } from "@/lib/data";
import { errorMessage, formatDateTime } from "@/lib/format";
import { startRequest } from "@/lib/load";
import UserAvatar from "@/components/ui/UserAvatar";
import Button, { textareaClass } from "@/components/ui/Button";
import EmptyState from "@/components/ui/EmptyState";

export default function NotesPanel({ table, column, parentId, profile, entityName, action }) {
  const [notes, setNotes] = useState([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      setNotes(await listNotes(table, column, parentId));
    } catch (error) {
      toast.error(errorMessage(error, "Notlar yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => startRequest(() => load()), [table, parentId]); // eslint-disable-line react-hooks/exhaustive-deps

  async function addNote(event) {
    event.preventDefault();
    const text = body.trim();
    if (!text) {
      toast.error("Not boş olamaz.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from(table).insert({
        [column]: parentId,
        profile_id: profile.id,
        body: text,
      });
      if (error) throw error;
      if (action) {
        await logActivity(profile.id, action, column === "customer_id" ? "customer" : "project", parentId, {
          title: entityName,
        });
      }
      setBody("");
      toast.success("Not eklendi.");
      await load();
    } catch (error) {
      toast.error(errorMessage(error, "Not eklenemedi."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-4">
      <form onSubmit={addNote} className="space-y-3">
        <textarea value={body} onChange={(event) => setBody(event.target.value)} className={textareaClass} placeholder="Not yazın" />
        <Button type="submit" disabled={busy}>
          {busy ? "Kaydediliyor..." : "Not ekle"}
        </Button>
      </form>
      {loading ? <div className="skeleton h-20 rounded-2xl" /> : null}
      {!loading && notes.length === 0 ? <EmptyState title="Henüz not yok." description="İlk notu yukarıdan ekleyebilirsiniz." /> : null}
      <div className="space-y-2">
        {notes.map((note) => (
          <article key={note.id} className="rounded-2xl border border-line bg-white p-4">
            <div className="flex items-center gap-2">
              <UserAvatar name={note.profile?.full_name} url={note.profile?.avatar_url} size="sm" />
              <div>
                <div className="text-sm font-medium">{note.profile?.full_name}</div>
                <div className="text-xs text-muted">{formatDateTime(note.created_at)}</div>
              </div>
            </div>
            <p className="mt-3 whitespace-pre-wrap text-sm text-zinc-700">{note.body}</p>
          </article>
        ))}
      </div>
    </div>
  );
}
