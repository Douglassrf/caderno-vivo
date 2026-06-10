import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.4";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";

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

  const { workId, product = "dossier" } = await req.json().catch(() => ({}));

  if (!workId) {
    return jsonResponse({ error: "missing_work_id" }, 400);
  }

  const serviceClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: work, error: workError } = await serviceClient
    .from("works")
    .select("id,user_id,title")
    .eq("id", workId)
    .eq("user_id", user.id)
    .maybeSingle();

  if (workError) {
    return jsonResponse({ error: "work_lookup_failed", details: workError.message }, 500);
  }

  if (!work) {
    return jsonResponse({ error: "work_not_found" }, 404);
  }

  const { data: entitlement, error: entitlementError } = await serviceClient
    .from("entitlements")
    .select("id,product,active,expires_at")
    .eq("user_id", user.id)
    .or(`work_id.eq.${workId},work_id.is.null`)
    .in("product", [product, "professional"])
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

  const { data: dossier, error: dossierError } = await serviceClient
    .from("dossiers")
    .select("id,work_id,user_id,content,hash,created_at,access_level,metadata")
    .eq("work_id", workId)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (dossierError) {
    return jsonResponse({ error: "dossier_lookup_failed", details: dossierError.message }, 500);
  }

  if (!dossier) {
    return jsonResponse({ error: "dossier_not_found" }, 404);
  }

  await serviceClient.from("audit_logs").insert({
    user_id: user.id,
    work_id: workId,
    action: "dossier_downloaded",
    resource: "dossiers",
    metadata: { dossierId: dossier.id, entitlementId: entitlement.id },
  });

  return jsonResponse({
    work: { id: work.id, title: work.title },
    dossier,
  });
});

