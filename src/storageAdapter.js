import { createSupabaseClient } from "./supabaseClient.js";

export function createLocalStorageAdapter(storageKey) {
  return {
    async loadState() {
      const raw = localStorage.getItem(storageKey);
      return raw ? JSON.parse(raw) : { works: [], phrases: [] };
    },

    async saveState(state) {
      localStorage.setItem(storageKey, JSON.stringify(state));
      return state;
    },
  };
}

export async function createSupabaseStorageAdapter() {
  const supabase = await createSupabaseClient();

  async function listWorks() {
    const { data, error } = await supabase
      .from("works")
      .select("id,title,status,metadata,created_at,updated_at")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });
    if (error) throw error;
    return (data || []).map((row) => ({
      ...(row.metadata || {}),
      id: row.id,
      title: row.title,
      status: row.status,
      createdAt: row.metadata?.createdAt || row.created_at,
      updatedAt: row.metadata?.updatedAt || row.updated_at,
      cloud: {
        synced: true,
        rowId: row.id,
        updatedAt: row.updated_at,
      },
    }));
  }

  async function saveWork(work) {
    const payload = {
      id: work.id || undefined,
      title: work.title || "Sem titulo",
      status: work.status || "ideia solta",
      metadata: {
        ...work,
        updatedAt: new Date().toISOString(),
      },
    };
    const { data, error } = await supabase
      .from("works")
      .upsert(payload)
      .select("id,title,status,metadata,created_at,updated_at")
      .single();
    if (error) throw error;
    return {
      ...(data.metadata || {}),
      id: data.id,
      title: data.title,
      status: data.status,
      createdAt: data.metadata?.createdAt || data.created_at,
      updatedAt: data.metadata?.updatedAt || data.updated_at,
      cloud: { synced: true, rowId: data.id, updatedAt: data.updated_at },
    };
  }

  async function loadState() {
    const works = await listWorks();
    // Frases soltas ainda permanecem locais ate existir tabela dedicada.
    // Mantemos o contrato { works, phrases } para o app principal.
    return { works, phrases: [] };
  }

  async function saveState(state) {
    const works = Array.isArray(state?.works) ? state.works : [];
    const savedWorks = [];
    for (const work of works) {
      savedWorks.push(await saveWork(work));
    }
    return { works: savedWorks, phrases: Array.isArray(state?.phrases) ? state.phrases : [] };
  }

  async function saveDossier(workId, dossier) {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userData.user?.id) throw new Error("Usuario autenticado obrigatorio.");

    const { data, error } = await supabase
      .from("dossiers")
      .insert({
        work_id: workId,
        user_id: userData.user.id,
        content: JSON.stringify(dossier),
        hash: dossier?.hash || "",
        access_level: "full",
        metadata: dossier,
      })
      .select("id,work_id,hash,created_at")
      .single();
    if (error) throw error;
    return data;
  }



  async function uploadUserAsset({ bucket, path, file, contentType, expiresIn = 3600 }) {
    if (!["audio", "covers", "documents", "private-exports"].includes(bucket)) {
      throw new Error("Bucket nao permitido para upload do usuario.");
    }
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) throw userError;
    if (!userData.user?.id) throw new Error("Usuario autenticado obrigatorio.");

    const safePath = `${userData.user.id}/${String(path || "asset").replace(/^\/+/, "")}`;
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(safePath, file, { contentType, upsert: false });
    if (uploadError) throw uploadError;

    const { data: signedData, error: signedError } = await supabase.storage
      .from(bucket)
      .createSignedUrl(uploadData.path, expiresIn);
    if (signedError) throw signedError;

    return { bucket, path: uploadData.path, signedUrl: signedData.signedUrl };
  }

  return { loadState, saveState, listWorks, saveWork, saveDossier, uploadUserAsset };
}

export async function migrateLocalStateToSupabase({ storageKey, legacyKeys = [] } = {}) {
  const key = storageKey || "caderno-vivo-state-v5";
  const raw = localStorage.getItem(key) || legacyKeys.map((item) => localStorage.getItem(item)).find(Boolean);
  if (!raw) return { migrated: false, reason: "empty_local_state" };
  const parsed = JSON.parse(raw);
  const state = parsed.data || parsed;
  const adapter = await createSupabaseStorageAdapter();
  const saved = await adapter.saveState(state);
  return {
    migrated: true,
    works: saved.works.length,
    phrases: saved.phrases.length,
  };
}
