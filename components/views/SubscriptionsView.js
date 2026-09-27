"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";
import Button, { Field, inputClass, textareaClass } from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import StatusBadge from "@/components/ui/StatusBadge";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import { useProfile } from "@/components/layout/AppShell";
import { CURRENCIES, SUBSCRIPTION_STATUSES, canManage } from "@/lib/constants";
import { listCustomers, listProjects, listSubscriptions, logActivity } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { errorMessage, formatDate, formatMoney } from "@/lib/format";
import { startRequest } from "@/lib/load";

const emptyForm = {
  customer_id: "",
  project_id: "",
  package_name: "",
  monthly_fee: "",
  currency: "TRY",
  start_date: "",
  next_renewal_date: "",
  status: "active",
  note: "",
};

export default function SubscriptionsView() {
  const profile = useProfile();
  const [rows, setRows] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState(null);
  const [busy, setBusy] = useState(false);
  const [pendingDelete, setPendingDelete] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [subscriptionRows, customerRows, projectRows] = await Promise.all([
        listSubscriptions(),
        listCustomers(),
        listProjects(),
      ]);
      setRows(subscriptionRows);
      setCustomers(customerRows);
      setProjects(projectRows);
    } catch (error) {
      toast.error(errorMessage(error, "Abonelikler yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => startRequest(() => load()), []);

  const mrr = useMemo(() => {
    const totals = {};
    rows.filter((row) => row.status === "active").forEach((row) => {
      totals[row.currency] = (totals[row.currency] || 0) + Number(row.monthly_fee || 0);
    });
    return totals;
  }, [rows]);

  async function save(event) {
    event.preventDefault();
    if (!form.customer_id || !form.package_name.trim()) {
      toast.error("Müşteri ve paket adı gerekli.");
      return;
    }
    setBusy(true);
    try {
      const supabase = createClient();
      const payload = {
        customer_id: form.customer_id,
        project_id: form.project_id || null,
        package_name: form.package_name.trim(),
        monthly_fee: Number(form.monthly_fee || 0),
        currency: form.currency,
        start_date: form.start_date || null,
        next_renewal_date: form.next_renewal_date || null,
        status: form.status,
        note: form.note.trim() || null,
      };
      if (form.id) {
        const { error } = await supabase.from("subscriptions").update(payload).eq("id", form.id);
        if (error) throw error;
        toast.success("Abonelik güncellendi.");
      } else {
        const { data, error } = await supabase.from("subscriptions").insert({ ...payload, created_by: profile.id }).select("id").single();
        if (error) throw error;
        await logActivity(profile.id, "subscription_created", "subscription", data.id, { title: payload.package_name });
        toast.success("Abonelik eklendi.");
      }
      setForm(null);
      await load();
    } catch (error) {
      toast.error(errorMessage(error, "Abonelik kaydedilemedi."));
    } finally {
      setBusy(false);
    }
  }

  async function removeRow() {
    const supabase = createClient();
    const { error } = await supabase.from("subscriptions").delete().eq("id", pendingDelete.id);
    if (error) throw error;
    toast.success("Abonelik silindi.");
    setPendingDelete(null);
    await load();
  }

  return (
    <div>
      <PageHeader title="Abonelikler" description="Aylık paketleri ve yenileme tarihlerini izleyin." action={canManage(profile) ? <Button onClick={() => setForm(emptyForm)}>Yeni abonelik</Button> : null} />
      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        {Object.keys(mrr).length === 0 ? (
          <div className="rounded-2xl border border-line bg-white p-4 text-sm text-muted">Aktif abonelik yok. MRR hesaplanamadı.</div>
        ) : Object.entries(mrr).map(([currency, total]) => (
          <div key={currency} className="rounded-2xl border border-line bg-white p-4">
            <div className="text-sm text-muted">MRR · {currency}</div>
            <div className="mt-1 text-2xl font-semibold">{formatMoney(total, currency)}</div>
          </div>
        ))}
      </div>
      {loading ? <LoadingSkeleton /> : null}
      {!loading && rows.length === 0 ? <EmptyState title="Henüz abonelik yok." description="Müşteri ve ürün için aylık paket ekleyin." action={canManage(profile) ? <Button onClick={() => setForm(emptyForm)}>İlk aboneliği ekle</Button> : null} /> : null}
      <div className="space-y-2 lg:hidden">
        {rows.map((row) => (
          <article key={row.id} className="rounded-2xl border border-line bg-white p-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="font-semibold">{row.package_name}</div>
                <div className="text-sm text-muted">{row.customer?.company_name}</div>
              </div>
              <StatusBadge kind="subscription" value={row.status} />
            </div>
            <p className="mt-2 text-sm">{formatMoney(row.monthly_fee, row.currency)} · yenileme {formatDate(row.next_renewal_date)}</p>
          </article>
        ))}
      </div>
      <div className="hidden overflow-hidden rounded-2xl border border-line bg-white lg:block">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-line text-xs text-muted">
            <tr>
              <th className="px-4 py-3 font-medium">Müşteri</th>
              <th className="px-4 py-3 font-medium">Paket</th>
              <th className="px-4 py-3 font-medium">Ürün</th>
              <th className="px-4 py-3 font-medium">Ücret</th>
              <th className="px-4 py-3 font-medium">Yenileme</th>
              <th className="px-4 py-3 font-medium">Durum</th>
              <th className="px-4 py-3 font-medium" />
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-b border-line last:border-0">
                <td className="px-4 py-3">{row.customer?.company_name}</td>
                <td className="px-4 py-3">{row.package_name}</td>
                <td className="px-4 py-3">{row.project?.name || "—"}</td>
                <td className="px-4 py-3">{formatMoney(row.monthly_fee, row.currency)}</td>
                <td className="px-4 py-3">{formatDate(row.next_renewal_date)}</td>
                <td className="px-4 py-3"><StatusBadge kind="subscription" value={row.status} /></td>
                <td className="px-4 py-3 text-right">
                  {canManage(profile) ? (
                    <button type="button" className="text-sm font-medium text-accent" onClick={() => setForm({
                      ...row,
                      project_id: row.project_id || "",
                      start_date: row.start_date || "",
                      next_renewal_date: row.next_renewal_date || "",
                      note: row.note || "",
                      monthly_fee: row.monthly_fee,
                    })}>Düzenle</button>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-2 space-y-2 lg:hidden">
        {canManage(profile) ? rows.map((row) => (
          <div key={`${row.id}-actions`} className="flex gap-2">
            <Button variant="secondary" onClick={() => setForm({ ...row, project_id: row.project_id || "", start_date: row.start_date || "", next_renewal_date: row.next_renewal_date || "", note: row.note || "" })}>Düzenle</Button>
            <Button variant="ghost" onClick={() => setPendingDelete(row)}>Sil</Button>
          </div>
        )) : null}
      </div>
      {form ? (
        <Modal title={form.id ? "Aboneliği düzenle" : "Yeni abonelik"} onClose={() => setForm(null)}>
          <form onSubmit={save} className="space-y-3">
            <Field label="Müşteri">
              <select className={inputClass} value={form.customer_id} onChange={(event) => setForm({ ...form, customer_id: event.target.value })} required>
                <option value="">Seçin</option>
                {customers.map((item) => <option key={item.id} value={item.id}>{item.company_name}</option>)}
              </select>
            </Field>
            <Field label="Proje / ürün">
              <select className={inputClass} value={form.project_id || ""} onChange={(event) => setForm({ ...form, project_id: event.target.value })}>
                <option value="">Seçilmedi</option>
                {projects.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
              </select>
            </Field>
            <Field label="Paket adı"><input className={inputClass} value={form.package_name} onChange={(event) => setForm({ ...form, package_name: event.target.value })} required /></Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Aylık ücret"><input type="number" min="0" step="0.01" className={inputClass} value={form.monthly_fee} onChange={(event) => setForm({ ...form, monthly_fee: event.target.value })} /></Field>
              <Field label="Para birimi">
                <select className={inputClass} value={form.currency} onChange={(event) => setForm({ ...form, currency: event.target.value })}>
                  {CURRENCIES.map((item) => <option key={item} value={item}>{item}</option>)}
                </select>
              </Field>
              <Field label="Başlangıç"><input type="date" className={inputClass} value={form.start_date || ""} onChange={(event) => setForm({ ...form, start_date: event.target.value })} /></Field>
              <Field label="Sonraki yenileme"><input type="date" className={inputClass} value={form.next_renewal_date || ""} onChange={(event) => setForm({ ...form, next_renewal_date: event.target.value })} /></Field>
            </div>
            <Field label="Durum">
              <select className={inputClass} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
                {SUBSCRIPTION_STATUSES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
              </select>
            </Field>
            <Field label="Not"><textarea className={textareaClass} value={form.note || ""} onChange={(event) => setForm({ ...form, note: event.target.value })} /></Field>
            <div className="flex justify-between gap-2">
              {form.id ? <Button variant="danger" onClick={() => setPendingDelete(form)}>Sil</Button> : <span />}
              <div className="flex gap-2">
                <Button variant="secondary" onClick={() => setForm(null)}>Vazgeç</Button>
                <Button type="submit" disabled={busy}>{busy ? "Kaydediliyor..." : "Kaydet"}</Button>
              </div>
            </div>
          </form>
        </Modal>
      ) : null}
      {pendingDelete ? <ConfirmDialog title="Aboneliği sil" message={`${pendingDelete.package_name} silinsin mi?`} onClose={() => setPendingDelete(null)} onConfirm={removeRow} /> : null}
    </div>
  );
}
