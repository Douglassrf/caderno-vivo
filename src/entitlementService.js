import { createSupabaseClient } from "./supabaseClient.js";

let cachedClient = null;

async function client() {
  if (!cachedClient) cachedClient = await createSupabaseClient();
  return cachedClient;
}

export const EntitlementService = {
  async listActive() {
    const supabase = await client();
    const { data, error } = await supabase
      .from("entitlements")
      .select("id,work_id,product,active,created_at,expires_at,source_payment_id")
      .eq("active", true)
      .or(`expires_at.is.null,expires_at.gt.${new Date().toISOString()}`);
    if (error) throw error;
    return data || [];
  },

  async has(product, workId = null) {
    const entitlements = await this.listActive();
    return entitlements.some((item) => {
      const sameProduct = item.product === product;
      const accountLevel = !item.work_id;
      const sameWork = workId && item.work_id === workId;
      return sameProduct && (accountLevel || sameWork);
    });
  },

  async assert(product, workId = null) {
    const allowed = await this.has(product, workId);
    if (!allowed) {
      throw new Error(`Entitlement obrigatorio ausente: ${product}`);
    }
    return true;
  },
};
