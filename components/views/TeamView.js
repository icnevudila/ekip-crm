"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import PageHeader from "@/components/ui/PageHeader";
import EmptyState from "@/components/ui/EmptyState";
import LoadingSkeleton from "@/components/ui/LoadingSkeleton";
import UserAvatar from "@/components/ui/UserAvatar";
import { ROLES, labelOf } from "@/lib/constants";
import { listProjects, listTasks, listTeam } from "@/lib/data";
import { errorMessage, taskTiming } from "@/lib/format";
import { startRequest } from "@/lib/load";

export default function TeamView() {
  const [people, setPeople] = useState([]);
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    return startRequest(async () => {
      try {
        const [team, projectRows, taskRows] = await Promise.all([listTeam(), listProjects(), listTasks()]);
        setPeople(team);
        setProjects(projectRows);
        setTasks(taskRows);
      } catch (error) {
        toast.error(errorMessage(error, "Ekip yüklenemedi."));
      } finally {
        setLoading(false);
      }
    });
  }, []);

  if (loading) return <LoadingSkeleton />;

  return (
    <div>
      <PageHeader title="Ekip" description="Üyelerin projeleri ve açık işleri." />
      {people.length === 0 ? <EmptyState title="Henüz ekip üyesi yok." description="Kullanıcıları Supabase Auth üzerinden oluşturun." /> : null}
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {people.map((person) => {
          const memberships = projects.filter((project) =>
            project.manager_id === person.id || (project.members || []).some((member) => member.profile_id === person.id)
          );
          const assigned = tasks.filter((task) => task.assigneeIds.includes(person.id) && task.status !== "done");
          const late = assigned.filter((task) => taskTiming(task)?.kind === "overdue");
          return (
            <Link key={person.id} href={`/team/${person.id}`} className="rounded-2xl border border-line bg-white p-4 hover:border-zinc-300">
              <div className="flex items-center gap-3">
                <UserAvatar name={person.full_name || person.username} url={person.avatar_url} size="lg" />
                <div>
                  <div className="font-semibold">{person.full_name || person.username}</div>
                  <div className="text-sm text-muted">{labelOf(ROLES, person.role)}{person.job_title ? ` · ${person.job_title}` : ""}</div>
                </div>
              </div>
              <p className="mt-4 text-sm text-muted">{memberships.map((project) => project.name).join(", ") || "Projesi yok"}</p>
              <div className="mt-3 flex gap-4 text-sm">
                <span>{assigned.length} açık görev</span>
                <span className={late.length ? "text-rose-600" : ""}>{late.length} geciken</span>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
