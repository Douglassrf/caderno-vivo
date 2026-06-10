import { createClient } from "https://esm.sh/@supabase/supabase-js@2.44.4";
import { corsHeaders, jsonResponse } from "../_shared/cors.ts";


function parseSignatureHeader(value: string) {
  return Object.fromEntries(
    value
      .split(",")
      .map((part) => part.trim().split("="))
      .filter((part) => part.length === 2)
      .map(([key, val]) => [key, val]),
  );
}

function bytesToHex(buffer: ArrayBuffer) {
  return Array.from(new Uint8Array(buffer))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function safeEqual(a: string, b: string) {
  if (a.length !== b.length) return false;
  let result = 0;
  for (let i = 0; i < a.length; i += 1) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return result === 0;
}

async function validateMercadoPagoSignature(req: Request, paymentId: string, secret: string) {
  const xSignature = req.headers.get("x-signature") || "";
  const xRequestId = req.headers.get("x-request-id") || "";

  if (!xSignature || !xRequestId) {
    return { ok: false, error: "missing_signature_headers" };
  }

  const parts = parseSignatureHeader(xSignature);
  const ts = parts.ts || "";
  const received = parts.v1 || "";

  if (!ts || !received) {
    return { ok: false, error: "invalid_signature_header" };
  }

  const manifest = `id:${String(paymentId).toLowerCase()};request-id:${xRequestId};ts:${ts};`;
  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(manifest));
  const expected = bytesToHex(signature);

  return { ok: safeEqual(expected, received), error: "signature_mismatch" };
}

type MercadoPagoPayment = {
  id: number;
  status: string;
  transaction_amount: number;
  currency_id: string;
  metadata?: {
    user_id?: string;
    work_id?: string;
    product?: string;
  };
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "method_not_allowed" }, 405);
  }

  const accessToken = Deno.env.get("MERCADO_PAGO_ACCESS_TOKEN");
  const webhookSecret = Deno.env.get("MERCADO_PAGO_WEBHOOK_SECRET");
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!accessToken || !webhookSecret || !supabaseUrl || !serviceRoleKey) {
    return jsonResponse({ error: "missing_server_config" }, 500);
  }

  const event = await req.json().catch(() => null);
  const url = new URL(req.url);
  const paymentId = url.searchParams.get("data.id") || event?.data?.id || event?.id;

  if (!paymentId) {
    return jsonResponse({ error: "missing_payment_id" }, 400);
  }

  const signature = await validateMercadoPagoSignature(req, String(paymentId), webhookSecret);
  if (!signature.ok) {
    return jsonResponse({ error: signature.error }, 401);
  }

  const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!paymentResponse.ok) {
    return jsonResponse({ error: "payment_lookup_failed" }, 502);
  }

  const payment = (await paymentResponse.json()) as MercadoPagoPayment;
  const metadata = payment.metadata || {};

  if (!metadata.user_id || !metadata.product) {
    return jsonResponse({ error: "missing_payment_metadata" }, 400);
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey, {
    auth: { persistSession: false },
  });

  const { data: storedPayment, error: paymentError } = await supabase
    .from("payments")
    .upsert(
      {
        user_id: metadata.user_id,
        work_id: metadata.work_id || null,
        provider: "mercado_pago",
        provider_payment_id: String(payment.id),
        product: metadata.product,
        amount_cents: Math.round(Number(payment.transaction_amount || 0) * 100),
        currency: payment.currency_id || "BRL",
        status: payment.status,
        paid_at: payment.status === "approved" ? new Date().toISOString() : null,
        raw_event: payment,
      },
      { onConflict: "provider,provider_payment_id" },
    )
    .select("id")
    .single();

  if (paymentError) {
    return jsonResponse({ error: "payment_store_failed", details: paymentError.message }, 500);
  }

  if (payment.status !== "approved") {
    return jsonResponse({ ok: true, entitlementCreated: false, status: payment.status });
  }

  const { error: entitlementError } = await supabase.from("entitlements").insert({
    user_id: metadata.user_id,
    work_id: metadata.work_id || null,
    product: metadata.product,
    source_payment_id: storedPayment.id,
    active: true,
  });

  if (entitlementError) {
    return jsonResponse({ error: "entitlement_store_failed", details: entitlementError.message }, 500);
  }

  await supabase.from("audit_logs").insert({
    user_id: metadata.user_id,
    work_id: metadata.work_id || null,
    action: "payment_approved",
    resource: "mercado_pago",
    metadata: { product: metadata.product, providerPaymentId: payment.id },
  });

  return jsonResponse({ ok: true, entitlementCreated: true });
});

