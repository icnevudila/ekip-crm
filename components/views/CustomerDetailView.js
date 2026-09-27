"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";
import Tabs from "@/components/ui/Tabs";
import StatusBadge from "@/components/ui/StatusBadge";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import NotesPanel from "@/components/notes/NotesPanel";
import FileUploader from "@/components/files/FileUploader";
import TaskModal from "@/components/tasks/TaskModal";
import PriorityBadge from "@/components/ui/PriorityBadge";
import UserAvatar from "@/components/ui/UserAvatar";
import { useProfile } from "@/components/layout/AppShell";
import { getCustomer, listEntityActivities, listProfiles, listProjects, listSubscriptions, listTags, listTasks } from "@/lib/data";
import { activityText } from "@/lib/activityText";
import { errorMessage, formatDate, formatDateTime, formatMoney } from "@/lib/format";
import { startRequest } from "@/lib/load";

const TABS = [
  { id: "info", label: "Genel Bilgiler" },
  { id: "projects", label: "Projeler" },
  { id: "subscriptions", label: "Abonelikler" },
  { id: "notes", label: "Notlar" },
  { id: "tasks", label: "Görevler" },
  { id: "files", label: "Dosyalar" },
  { id: "activity", label: "Aktiviteler" },
];

export default function CustomerDetailView() {
  const params = useParams();
  const profile = useProfile();
  const [tab, setTab] = useState("info");
  const [customer, setCustomer] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [activities, setActivities] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [customerRow, taskRows, subscriptionRows, activityRows, profileRows, projectRows, tagRows] = await Promise.all([
        getCustomer(params.id),
        listTasks(),
        listSubscriptions(),
        listEntityActivities("customer", params.id),
        listProfiles(),
        listProjects(),
        listTags(),
      ]);
      setCustomer(customerRow);
      setTasks(taskRows.filter((task) => task.customer_id === params.id));
      setSubscriptions(subscriptionRows.filter((item) => item.customer_id === params.id));
      setActivities(activityRows);
      setProfiles(profileRows);
      setProjects(projectRows);
      setTags(tagRows);
    } catch (error) {
      toast.error(errorMessage(error, "Müşteri yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => startRequest(() => load()), [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <LoadingSkeleton />;
  if (!customer) return <EmptyState title="Müşteri bulunamadı." description="Bu kayda erişiminiz olmayabilir." />;

  const info = [
    ["Yetkili", customer.contact_name],
    ["Telefon", customer.phone],
    ["E-mail", customer.email],
    ["Web sitesi", customer.website],
    ["Adres", customer.address],
    ["Oluşturulma", formatDate(customer.created_at)],
  ];

  return (
    <div>
      <PageHeader title={customer.company_name} description={customer.note || "Müşteri detayı"} action={<StatusBadge kind="customer" value={customer.status} />} />
      <div className="mb-4 flex flex-wrap gap-2">
        {(customer.tags || []).map((item) => (
          <span key={item.tag_id} className="rounded-full bg-white px-2.5 py-1 text-xs ring-1 ring-line">{item.tag?.name}</span>
        ))}
      </div>
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "info" ? (
        <section className="rounded-2xl border border-line bg-white p-4">
          <div className="mb-4 flex items-center gap-2 text-sm">
            <UserAvatar name={customer.owner?.full_name} url={customer.owner?.avatar_url} size="sm" />
            Sorumlu: {customer.owner?.full_name || "—"}
          </div>
          <dl className="grid gap-3 sm:grid-cols-2">
            {info.map(([label, value]) => (
              <div key={label}>
                <dt className="text-xs text-muted">{label}</dt>
                <dd className="text-sm">{value || "—"}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
      {tab === "projects" ? (
        <div className="space-y-2">
          {(customer.projects || []).length === 0 ? <EmptyState title="Bağlı proje yok." description="Müşteriyi düzenleyerek proje bağlayabilirsiniz." /> : null}
          {(customer.projects || []).map((link) => (
            <Link key={link.id} href={`/projects/${link.project_id}`} className="block rounded-2xl border border-line bg-white p-3 font-medium">{link.project?.name}</Link>
          ))}
        </div>
      ) : null}
      {tab === "subscriptions" ? (
        <div className="space-y-2">
          {subscriptions.length === 0 ? <EmptyState title="Abonelik yok." description="Abonelikler ekranından bu müşteriye paket ekleyebilirsiniz." /> : null}
          {subscriptions.map((item) => (
            <div key={item.id} className="rounded-2xl border border-line bg-white p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="font-medium">{item.package_name}</div>
                <StatusBadge kind="subscription" value={item.status} />
              </div>
              <p className="mt-1 text-sm text-muted">{item.project?.name || "Ürün seçilmedi"} · {formatMoney(item.monthly_fee, item.currency)}</p>
            </div>
          ))}
        </div>
      ) : null}
      {tab === "notes" ? <NotesPanel table="customer_notes" column="customer_id" parentId={customer.id} profile={profile} entityName={customer.company_name} action="customer_note_added" /> : null}
      {tab === "tasks" ? (
        <div className="space-y-2">
          {tasks.length === 0 ? <EmptyState title="Bu müşteriye bağlı görev yok." /> : null}
          {tasks.map((task) => (
            <button key={task.id} type="button" onClick={() => setEditing(task)} className="flex w-full items-center justify-between rounded-2xl border border-line bg-white p-3 text-left">
              <span className="font-medium">{task.title}</span>
              <span className="flex gap-2"><PriorityBadge value={task.priority} /><StatusBadge value={task.status} /></span>
            </button>
          ))}
        </div>
      ) : null}
      {tab === "files" ? <FileUploader entityType="customer" entityId={customer.id} profileId={profile.id} /> : null}
      {tab === "activity" ? (
        <div className="space-y-3">
          {activities.length === 0 ? <EmptyState title="Henüz aktivite yok." /> : null}
          {activities.map((item) => (
            <div key={item.id} className="flex gap-3 rounded-2xl border border-line bg-white p-3">
              <UserAvatar name={item.profile?.full_name} url={item.profile?.avatar_url} size="sm" />
              <div>
                <p className="text-sm">{activityText(item)}</p>
                <p className="text-xs text-muted">{formatDateTime(item.created_at)}</p>
              </div>
            </div>
          ))}
        </div>
      ) : null}
      {editing ? (
        <TaskModal key={editing.id} task={editing} profiles={profiles} projects={projects} customers={[customer]} tags={tags} profile={profile} onClose={() => setEditing(null)} onSaved={load} onTagCreated={(tag) => setTags((current) => [...current, tag])} />
      ) : null}
    </div>
  );
}
