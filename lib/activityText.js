export function activityText(item) {
  const name = item.profile?.full_name || "Bir kullanıcı";
  const title = item.metadata?.title || "";
  const map = {
    task_created: `${name} "${title}" görevini oluşturdu.`,
    task_completed: `${name} "${title}" görevini tamamladı.`,
    task_assigned: `${name} "${title}" görevine kişi atadı.`,
    customer_created: `${name} ${title} müşterisini ekledi.`,
    customer_note_added: `${name} ${title} müşterisine not ekledi.`,
    project_created: `${name} ${title} projesini oluşturdu.`,
    project_note_added: `${name} ${title} projesine not ekledi.`,
    subscription_created: `${name} "${title}" aboneliğini ekledi.`,
    goal_created: `${name} "${title}" hedefini ekledi.`,
  };
  return map[item.action] || `${name} bir güncelleme yaptı.`;
}
