import UserAvatar from "@/components/ui/UserAvatar";

export default function AvatarGroup({ people = [], max = 3 }) {
  const visible = people.slice(0, max);
  const extra = people.length - visible.length;

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {visible.map((person) => (
          <span key={person.id} className="rounded-full ring-2 ring-white">
            <UserAvatar name={person.full_name || person.username} url={person.avatar_url} size="sm" />
          </span>
        ))}
      </div>
      {extra > 0 ? <span className="ml-2 text-xs font-medium text-muted">+{extra}</span> : null}
    </div>
  );
}

export function peopleNames(people = [], max = 2) {
  if (!people.length) return "Atanmamış";
  const names = people.slice(0, max).map((person) => person.full_name || person.username);
  const extra = people.length - names.length;
  return extra > 0 ? `${names.join(", ")} +${extra}` : names.join(", ");
}
