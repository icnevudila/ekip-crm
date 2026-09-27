"use client";

import { useState } from "react";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function ConfirmDialog({ title, message, confirmLabel = "Sil", onConfirm, onClose }) {
  const [busy, setBusy] = useState(false);

  async function confirm() {
    setBusy(true);
    try {
      await onConfirm();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal title={title} onClose={onClose}>
      <p className="text-sm text-zinc-600">{message}</p>
      <div className="mt-5 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onClose} disabled={busy}>
          Vazgeç
        </Button>
        <Button variant="danger" onClick={confirm} disabled={busy}>
          {busy ? "Siliniyor..." : confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
