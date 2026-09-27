"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { errorMessage, usernameToEmail } from "@/lib/format";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    if (!username.trim() || !password) {
      setError("Kullanıcı adı ve şifre gerekli.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const { error: signError } = await supabase.auth.signInWithPassword({
        email: usernameToEmail(username),
        password,
      });
      if (signError) throw signError;
      router.replace("/");
      router.refresh();
    } catch (signError) {
      setError(errorMessage(signError, "Giriş yapılamadı."));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-canvas px-4">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-line bg-white p-6 shadow-sm">
        <div className="mb-6 flex items-center gap-3">
          <span className="grid h-11 w-11 place-items-center rounded-xl bg-accent font-semibold text-white">E</span>
          <div>
            <h1 className="text-xl font-semibold">Ekip</h1>
            <p className="text-sm text-muted">Operasyon paneli</p>
          </div>
        </div>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Kullanıcı adı</span>
          <input
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            autoComplete="username"
            className="h-11 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-accent"
          />
        </label>
        <label className="mt-3 block space-y-1.5">
          <span className="text-sm font-medium">Şifre</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            autoComplete="current-password"
            className="h-11 w-full rounded-xl border border-line px-3 text-sm outline-none focus:border-accent"
          />
        </label>
        {error ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}
        <button
          type="submit"
          disabled={busy}
          className="mt-5 h-11 w-full rounded-xl bg-accent text-sm font-medium text-white disabled:opacity-60"
        >
          {busy ? "Giriş yapılıyor..." : "Giriş Yap"}
        </button>
      </form>
    </main>
  );
}
