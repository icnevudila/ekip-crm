import Image from "next/image";

export function initials(name) {
  const parts = String(name || "?")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (!parts.length) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toLocaleUpperCase("tr-TR");
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toLocaleUpperCase("tr-TR");
}

export default function UserAvatar({ name, url, size = "md" }) {
  const sizes = {
    sm: "h-7 w-7 text-[10px]",
    md: "h-9 w-9 text-xs",
    lg: "h-14 w-14 text-base",
  };

  if (url) {
    return (
      <span className={`${sizes[size]} relative shrink-0 overflow-hidden rounded-full`}>
        <Image src={url} alt={name || "Kullanıcı"} fill className="object-cover" sizes="56px" />
      </span>
    );
  }

  return (
    <span
      className={`${sizes[size]} grid shrink-0 place-items-center rounded-full bg-zinc-200 font-semibold text-zinc-700`}
      title={name}
    >
      {initials(name)}
    </span>
  );
}
