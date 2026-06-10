import { createSupabaseClient } from "./supabaseClient.js";
import { EntitlementService } from "./entitlementService.js";

let cachedClient = null;

async function client() {
  if (!cachedClient) cachedClient = await createSupabaseClient();
  return cachedClient;
}

function assertAllowedKind(kind) {
  const allowed = new Set(["dossier_json", "dossier_pdf", "video_webm", "video_mp4", "final_zip"]);
  if (!allowed.has(kind)) {
    throw new Error(`Tipo de exportacao nao permitido: ${kind}`);
  }
}

function productForKind(kind) {
  const map = {
    dossier_json: "dossier",
    dossier_pdf: "dossier",
    video_webm: "clip",
    video_mp4: "clip",
    final_zip: "professional",
  };
  return map[kind] || "professional";
}

export const ExportProtectionService = {
  async assertExportAllowed({ kind, workId = null }) {
    assertAllowedKind(kind);
    const product = productForKind(kind);
    await EntitlementService.assert(product, workId);
    return { allowed: true, product, kind, workId };
  },

  async requestSignedExportUrl({ exportId }) {
    if (!exportId) throw new Error("exportId obrigatorio para URL assinada.");
    const supabase = await client();
    const { data, error } = await supabase.functions.invoke("create-signed-export-url", {
      body: { exportId },
    });
    if (error) throw error;
    if (!data?.url) throw new Error("Edge Function nao retornou URL assinada.");
    return data;
  },

  async logBlockedClientExport({ kind, workId = null, reason = "backend_required" }) {
    const supabase = await client();
    const { data: userData } = await supabase.auth.getUser();
    await supabase.from("audit_logs").insert({
      user_id: userData?.user?.id || null,
      work_id: workId,
      action: "client_export_blocked",
      resource: "exports",
      metadata: { kind, reason },
    });
    return { logged: true, kind, workId, reason };
  },

  describePolicy() {
    return {
      bucket: "private-exports",
      public: false,
      signedUrlTtlSeconds: 300,
      rule: "Exportacao final premium deve sair por Edge Function/backend apos validar usuario, obra e entitlement.",
    };
  },
};
