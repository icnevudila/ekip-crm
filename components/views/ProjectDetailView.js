"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";
import Tabs from "@/components/ui/Tabs";
import StatusBadge from "@/components/ui/StatusBadge";
import AvatarGroup from "@/components/ui/AvatarGroup";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import TaskModal from "@/components/tasks/TaskModal";
import NotesPanel from "@/components/notes/NotesPanel";
import FileUploader from "@/components/files/FileUploader";
import PriorityBadge from "@/components/ui/PriorityBadge";
import { useProfile } from "@/components/layout/AppShell";
import { getProject, listCustomers, listProfiles, listTags, listTasks } from "@/lib/data";
import { errorMessage, formatDate } from "@/lib/format";
import { startRequest } from "@/lib/load";
import { labelOf, ROLES } from "@/lib/constants";

const TABS = [
  { id: "overview", label: "Genel Bakış" },
  { id: "tasks", label: "Görevler" },
  { id: "customers", label: "Müşteriler" },
  { id: "notes", label: "Notlar" },
  { id: "files", label: "Dosyalar" },
];

export default function ProjectDetailView() {
  const params = useParams();
  const profile = useProfile();
  const [tab, setTab] = useState("overview");
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [profiles, setProfiles] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(null);

  async function load() {
    setLoading(true);
    try {
      const [projectRow, taskRows, customerRows, profileRows, tagRows] = await Promise.all([
        getProject(params.id),
        listTasks(),
        listCustomers(),
        listProfiles(),
        listTags(),
      ]);
      setProject(projectRow);
      setTasks(taskRows.filter((task) => task.project_id === params.id));
      setCustomers(customerRows.filter((customer) => (customer.projects || []).some((link) => link.project_id === params.id)));
      setProfiles(profileRows);
      setTags(tagRows);
    } catch (error) {
      toast.error(errorMessage(error, "Proje yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => startRequest(() => load()), [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) return <LoadingSkeleton />;
  if (!project) return <EmptyState title="Proje bulunamadı." description="Bu projeye erişiminiz olmayabilir." />;

  const members = (project.members || []).map((item) => item.profile).filter(Boolean);

  return (
    <div>
      <PageHeader title={project.name} description={project.description || "Proje detayı"} />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "overview" ? (
        <div className="grid gap-3 lg:grid-cols-2">
          <section className="rounded-2xl border border-line bg-white p-4">
            <div className="mb-3"><StatusBadge kind="project" value={project.status} /></div>
            <p className="text-sm text-muted">Başlangıç: {formatDate(project.start_date)}</p>
            <p className="mt-2 text-sm text-muted">Yönetici: {project.manager?.full_name || "—"}</p>
            <p className="mt-2 text-sm text-muted">Oluşturulma: {formatDate(project.created_at)}</p>
          </section>
          <section className="rounded-2xl border border-line bg-white p-4">
            <h3 className="mb-3 font-semibold">Ekip</h3>
            <AvatarGroup people={members} max={8} />
            <div className="mt-3 space-y-2">
              {members.map((member) => (
                <div key={member.id} className="text-sm">{member.full_name} · {labelOf(ROLES, member.role)}</div>
              ))}
            </div>
          </section>
        </div>
      ) : null}
      {tab === "tasks" ? (
        <div className="space-y-2">
          {tasks.length === 0 ? <EmptyState title="Bu projede görev yok." description="İşler ekranından bu projeye görev ekleyebilirsiniz." /> : null}
          {tasks.map((task) => (
            <button key={task.id} type="button" onClick={() => setEditing(task)} className="flex w-full items-center justify-between gap-3 rounded-2xl border border-line bg-white p-3 text-left">
              <span className="font-medium">{task.title}</span>
              <span className="flex items-center gap-2"><PriorityBadge value={task.priority} /><StatusBadge value={task.status} /></span>
            </button>
          ))}
        </div>
      ) : null}
      {tab === "customers" ? (
        <div className="space-y-2">
          {customers.length === 0 ? <EmptyState title="Bağlı müşteri yok." description="Müşteri kaydından bu projeyi seçebilirsiniz." /> : null}
          {customers.map((customer) => (
            <Link key={customer.id} href={`/customers/${customer.id}`} className="block rounded-2xl border border-line bg-white p-3">
              <div className="font-medium">{customer.company_name}</div>
              <div className="text-sm text-muted">{customer.contact_name || "Yetkili yok"}</div>
            </Link>
          ))}
        </div>
      ) : null}
      {tab === "notes" ? <NotesPanel table="project_notes" column="project_id" parentId={project.id} profile={profile} entityName={project.name} action="project_note_added" /> : null}
      {tab === "files" ? <FileUploader entityType="project" entityId={project.id} profileId={profile.id} /> : null}
      {editing ? (
        <TaskModal
          key={editing.id}
          task={editing}
          profiles={profiles}
          projects={[project]}
          customers={customers}
          tags={tags}
          profile={profile}
          onClose={() => setEditing(null)}
          onSaved={load}
          onTagCreated={(tag) => setTags((current) => [...current, tag])}
        />
      ) : null}
    </div>
  );
}
