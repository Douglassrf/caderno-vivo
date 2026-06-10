const SUPABASE_CONFIG_KEY = "caderno-vivo-supabase-config";

function readBrowserConfig() {
  const globalConfig = window.CADERNO_VIVO_SUPABASE || {};
  const storedConfig = (() => {
    try {
      return JSON.parse(sessionStorage.getItem(SUPABASE_CONFIG_KEY) || "{}");
    } catch {
      return {};
    }
  })();

  return {
    url: globalConfig.url || storedConfig.url || "",
    anonKey: globalConfig.anonKey || storedConfig.anonKey || "",
  };
}

export function saveSupabaseConfig(config) {
  const next = {
    url: String(config?.url || "").trim(),
    anonKey: String(config?.anonKey || "").trim(),
  };
  sessionStorage.setItem(SUPABASE_CONFIG_KEY, JSON.stringify(next));
  return next;
}

export function getSupabaseConfig() {
  return readBrowserConfig();
}

export async function createSupabaseClient() {
  const { url, anonKey } = readBrowserConfig();
  if (!url || !anonKey) {
    throw new Error("Supabase nao configurado. Informe URL e anon key antes do login.");
  }

  const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.44.4");
  return createClient(url, anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

