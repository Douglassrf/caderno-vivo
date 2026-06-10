import { createSupabaseClient } from "./supabaseClient.js";

let cachedClient = null;

async function client() {
  if (!cachedClient) cachedClient = await createSupabaseClient();
  return cachedClient;
}

export const PaymentService = {
  async getCurrentUserOrThrow() {
    const supabase = await client();
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    if (!data.user?.id) throw new Error("Login obrigatorio antes de iniciar pagamento.");
    return data.user;
  },

  buildCheckoutMetadata({ product, workId = null }) {
    if (!product) throw new Error("Produto obrigatorio para checkout.");
    return { product, work_id: workId || null };
  },

  async registerCheckoutIntent({ product, workId = null, amountCents = 0 }) {
    const supabase = await client();
    const user = await this.getCurrentUserOrThrow();
    const { error } = await supabase.from("audit_logs").insert({
      user_id: user.id,
      work_id: workId,
      action: "checkout_intent",
      resource: "mercado_pago",
      metadata: { product, amount_cents: amountCents },
    });
    if (error) throw error;
    return { userId: user.id, metadata: this.buildCheckoutMetadata({ product, workId }) };
  },
};
