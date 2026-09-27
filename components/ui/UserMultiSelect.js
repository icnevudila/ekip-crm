"use client";

import { useState } from "react";
import UserAvatar from "@/components/ui/UserAvatar";
import { inputClass } from "@/components/ui/Button";

export default function UserMultiSelect({ profiles, value = [], onChange, placeholder = "Kişi seç" }) {
  const [open, setOpen] = useState(false);
  const selected = profiles.filter((profile) => value.includes(profile.id));

  function toggle(id) {
    onChange(value.includes(id) ? value.filter((item) => item !== id) : [...value, id]);
  }

  return (
    <div className="relative">
      <button type="button" className={`${inputClass} flex items-center justify-between text-left`} onClick={() => setOpen(true)}>
        <span className="truncate text-zinc-700">
          {selected.length ? selected.map((profile) => profile.full_name || profile.username).join(", ") : placeholder}
        </span>
      </button>
      {open ? (
        <>
          <button type="button" className="fixed inset-0 z-20 cursor-default" aria-label="Kapat" onClick={() => setOpen(false)} />
          <div className="absolute z-30 mt-1 max-h-64 w-full overflow-auto rounded-xl border border-line bg-white p-1 shadow-lg">
            {profiles.length === 0 ? <div className="px-3 py-3 text-sm text-muted">Kayıtlı üye yok.</div> : null}
            {profiles.map((profile) => (
              <button
                key={profile.id}
                type="button"
                onClick={() => toggle(profile.id)}
                className="flex w-full items-center gap-2 rounded-lg px-2 py-2 text-left text-sm hover:bg-zinc-50"
              >
                <input type="checkbox" readOnly checked={value.includes(profile.id)} className="h-4 w-4" />
                <UserAvatar name={profile.full_name || profile.username} url={profile.avatar_url} size="sm" />
                <span>{profile.full_name || profile.username}</span>
              </button>
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
