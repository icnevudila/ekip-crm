"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";
import Tabs from "@/components/ui/Tabs";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import UserAvatar from "@/components/ui/UserAvatar";
import StatusBadge from "@/components/ui/StatusBadge";
import Button, { Field, inputClass } from "@/components/ui/Button";
import { useProfile } from "@/components/layout/AppShell";
import { ROLES, labelOf } from "@/lib/constants";
import { listProjects, listTasks, listTeam } from "@/lib/data";
import { createClient } from "@/lib/supabase/client";
import { errorMessage, taskTiming } from "@/lib/format";
import { startRequest } from "@/lib/load";

const TABS = [
  { id: "profile", label: "Profil" },
  { id: "projects", label: "Projeler" },
  { id: "open", label: "Açık Görevler" },
  { id: "done", label: "Tamamlanan Görevler" },
  { id: "late", label: "Geciken Görevler" },
];

export default function TeamDetailView() {
  const params = useParams();
  const me = useProfile();
  const [tab, setTab] = useState("profile");
  const [person, setPerson] = useState(null);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState("member");
  const [busy, setBusy] = useState(false);

  async function load() {
    setLoading(true);
    try {
      const [team, projectRows, taskRows] = await Promise.all([listTeam(), listProjects(), listTasks()]);
      const found = team.find((item) => item.id === params.id) || null;
      setPerson(found);
      setRole(found?.role || "member");
      setProjects(projectRows.filter((project) => project.manager_id === params.id || (project.members || []).some((member) => member.profile_id === params.id)));
      setTasks(taskRows.filter((task) => task.assigneeIds.includes(params.id)));
    } catch (error) {
      toast.error(errorMessage(error, "Profil yüklenemedi."));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => startRequest(() => load()), [params.id]); // eslint-disable-line react-hooks/exhaustive-deps

  async function saveRole(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.from("profiles").update({ role }).eq("id", person.id);
      if (error) throw error;
      toast.success("Rol güncellendi.");
      await load();
    } catch (error) {
      toast.error(errorMessage(error, "Rol güncellenemedi."));
    } finally {
      setBusy(false);
    }
  }

  if (loading) return <LoadingSkeleton />;
  if (!person) return <EmptyState title="Üye bulunamadı." />;

  const openTasks = tasks.filter((task) => task.status !== "done");
  const doneTasks = tasks.filter((task) => task.status === "done");
  const lateTasks = openTasks.filter((task) => taskTiming(task)?.kind === "overdue");
  const lists = { open: openTasks, done: doneTasks, late: lateTasks };

  return (
    <div>
      <PageHeader title={person.full_name || person.username} description={`${labelOf(ROLES, person.role)}${person.job_title ? ` · ${person.job_title}` : ""}`} />
      <Tabs tabs={TABS} value={tab} onChange={setTab} />
      {tab === "profile" ? (
        <section className="max-w-lg rounded-2xl border border-line bg-white p-4">
          <UserAvatar name={person.full_name || person.username} url={person.avatar_url} size="lg" />
          <p className="mt-3 text-sm text-muted">@{person.username}</p>
          {me.role === "admin" ? (
            <form onSubmit={saveRole} className="mt-4 space-y-3">
              <Field label="Rol">
                <select className={inputClass} value={role} onChange={(event) => setRole(event.target.value)}>
                  {ROLES.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}
                </select>
              </Field>
              <Button type="submit" disabled={busy}>{busy ? "Kaydediliyor..." : "Rolü kaydet"}</Button>
            </form>
          ) : null}
        </section>
      ) : null}
      {tab === "projects" ? (
        <div className="space-y-2">
          {projects.length === 0 ? <EmptyState title="Bağlı proje yok." /> : null}
          {projects.map((project) => (
            <Link key={project.id} href={`/projects/${project.id}`} className="block rounded-2xl border border-line bg-white p-3 font-medium">{project.name}</Link>
          ))}
        </div>
      ) : null}
      {tab !== "profile" && tab !== "projects" ? (
        <div className="space-y-2">
          {lists[tab].length === 0 ? <EmptyState title="Görev yok." /> : null}
          {lists[tab].map((task) => (
            <Link key={task.id} href="/tasks" className="flex items-center justify-between rounded-2xl border border-line bg-white p-3">
              <span className="font-medium">{task.title}</span>
              <StatusBadge value={task.status} />
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  );
}
