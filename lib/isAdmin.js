export async function getCurrentUser(supabase) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, admin: false };

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, is_active")
    .eq("auth_user_id", user.id)
    .maybeSingle();

  const admin = Boolean(profile?.is_active && profile.role === "admin");
  return { user, admin };
}
