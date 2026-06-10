import { createSupabaseClient } from "./supabaseClient.js";

let cachedClient = null;

async function client() {
  if (!cachedClient) cachedClient = await createSupabaseClient();
  return cachedClient;
}

export const ProfileService = {
  async getCurrentProfile() {
    const supabase = await client();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    const user = userData.user;
    if (!user?.id) return null;

    const { data, error } = await supabase
      .from("profiles")
      .select("id,display_name,artist_name,language,plan,preferences,created_at,updated_at")
      .eq("id", user.id)
      .maybeSingle();
    if (error) throw error;
    return data;
  },

  async upsertCurrentProfile(profile = {}) {
    const supabase = await client();
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    const user = userData.user;
    if (!user?.id) throw new Error("Usuario autenticado obrigatorio.");

    const payload = {
      id: user.id,
      display_name: profile.display_name || profile.displayName || null,
      artist_name: profile.artist_name || profile.artistName || null,
      language: profile.language || "pt-BR",
      plan: profile.plan || "free",
      preferences: profile.preferences || {},
      updated_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from("profiles")
      .upsert(payload)
      .select("id,display_name,artist_name,language,plan,preferences,created_at,updated_at")
      .single();
    if (error) throw error;
    return data;
  },
};
