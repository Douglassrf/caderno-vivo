import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.4";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

const EXPORT_BUCKET = Deno.env.get("EXPORT_BUCKET") || "private-exports";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const anonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !anonKey || !serviceRoleKey) {
    return jsonResponse({ error: "missing_server_config" }, 500);
  }

  const authHeader = req.headers.get("Authorization") || "";
  const userClient = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: authHeader } },
    auth: { persistSession: false },
  });

  const { data: userData, error: userError } = await userClient.auth.getUser();
  const user = userData?.user;

  if (userError || !user) {
    return jsonResponse({ error: "unauthorized" }, 401);
  }

  const { exportId } = await req.json().catch(() => ({}));

  if (!exportId) {
    return jsonResponse({ error: "missing_export_id" }, 400);
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: exportRecord, error: exportError } = await serviceClient
    .from("exports")
    .select("id,user_id,work_id,entitlement_id,kind,storage_path,content_type")
    .eq("id", exportId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (exportError) {
    return jsonResponse({ error: "export_lookup_failed", details: exportError.message }, 500);
  }

  if (!exportRecord) {
    return jsonResponse({ error: "export_not_found" }, 404);
  }

  const { data: entitlement, error: entitlementError } = await serviceClient
    .from("entitlements")
    .select("id,active,expires_at")
    .eq("id", exportRecord.entitlement_id)
    .eq("user_id", user.id)
    .eq("active", true)
    .maybeSingle();

  if (entitlementError) {
    return jsonResponse({ error: "entitlement_lookup_failed", details: entitlementError.message }, 500);
  }

  if (!entitlement) {
    return jsonResponse({ error: "entitlement_required" }, 403);
  }

  if (entitlement.expires_at && new Date(entitlement.expires_at).getTime() < Date.now()) {
    return jsonResponse({ error: "entitlement_expired" }, 403);
  }

  const { data: signed, error: signedError } = await serviceClient.storage
    .from(EXPORT_BUCKET)
    .createSignedUrl(exportRecord.storage_path, 60 * 5);

  if (signedError) {
    return jsonResponse({ error: "signed_url_failed", details: signedError.message }, 500);
  }

  await serviceClient.from("audit_logs").insert({
    user_id: user.id,
    work_id: exportRecord.work_id,
    action: "signed_export_url_created",
    resource: "exports",
    metadata: { exportId: exportRecord.id, kind: exportRecord.kind },
  });

  return jsonResponse({
    url: signed.signedUrl,
    expiresInSeconds: 300,
    contentType: exportRecord.content_type,
  });
});

