export function formatDate(value) {
  if (!value) return "—";
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("tr-TR", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatMoney(amount, currency = "TRY") {
  const value = Number(amount || 0);
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(value);
}

export function toDateInput(value) {
  if (!value) return "";
  const date = toDate(value);
  if (Number.isNaN(date.getTime())) return "";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${date.getFullYear()}-${month}-${day}`;
}

export function startOfDay(value) {
  const date = value ? new Date(value) : new Date();
  date.setHours(0, 0, 0, 0);
  return date;
}

function toDate(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split("-").map(Number);
    return new Date(year, month - 1, day);
  }
  return new Date(value);
}

export function dayDiff(dueDate) {
  const due = startOfDay(toDate(dueDate));
  const today = startOfDay(new Date());
  return Math.round((today.getTime() - due.getTime()) / 86400000);
}

export function taskTiming(task) {
  if (!task?.due_date || task.status === "done") return null;
  const diff = dayDiff(task.due_date);
  if (diff > 0) return { kind: "overdue", label: `${diff} gün gecikti`, days: diff };
  if (diff === 0) return { kind: "today", label: "Bugün", days: 0 };
  return { kind: "upcoming", label: `${Math.abs(diff)} gün kaldı`, days: diff };
}

export function goalProgress(goal) {
  const target = Number(goal?.target_value || 0);
  const current = Number(goal?.current_value || 0);
  if (target <= 0) return 0;
  return Math.max(0, Math.min(100, Math.round((current / target) * 100)));
}

export function goalRemaining(goal) {
  if (!goal?.end_date) return null;
  if (goal.status === "completed") return "Tamamlandı";
  if (goal.status === "cancelled") return "İptal";
  const diff = dayDiff(goal.end_date);
  if (diff > 0) return "Süre Doldu";
  if (diff === 0) return "Son gün";
  return `${Math.abs(diff)} gün kaldı`;
}

export function initials(name) {
  const parts = String(name || "?")
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function fileSize(bytes) {
  const size = Number(bytes || 0);
  if (size < 1024) return `${size} B`;
  if (size < 1024 * 1024) return `${Math.round(size / 1024)} KB`;
  return `${(size / (1024 * 1024)).toFixed(1)} MB`;
}

export function usernameToEmail(username) {
  const raw = String(username || "").trim().toLowerCase();
  if (!raw) return "";
  if (raw.endsWith("@ekip.com")) return raw;
  return `${raw.split("@")[0]}@ekip.com`;
}

export function errorMessage(error, fallback = "İşlem tamamlanamadı.") {
  const text = error?.message || error?.error_description || "";
  if (!text) return fallback;
  if (/invalid login credentials/i.test(text)) return "Kullanıcı adı veya şifre hatalı.";
  if (/row-level security/i.test(text)) return "Bu işlem için yetkiniz yok.";
  if (/duplicate key/i.test(text)) return "Bu kayıt zaten mevcut.";
  if (/JWT|session/i.test(text)) return "Oturum süresi doldu. Tekrar giriş yapın.";
  return fallback;
}
