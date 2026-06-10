import { createSupabaseClient } from "./supabaseClient.js";

let cachedClient = null;
let authSubscription = null;

async function client() {
  if (!cachedClient) {
    cachedClient = await createSupabaseClient();
  }
  return cachedClient;
}

export const AuthService = {
  async signUp(email, password) {
    const supabase = await client();
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    return data;
  },

  async login(email, password) {
    const supabase = await client();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  },

  async getSession() {
    const supabase = await client();
    const { data, error } = await supabase.auth.getSession();
    if (error) throw error;
    return data.session;
  },

  async getUser() {
    const supabase = await client();
    const { data, error } = await supabase.auth.getUser();
    if (error) throw error;
    return data.user;
  },

  async logout() {
    const supabase = await client();
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async onAuthChange(callback) {
    const supabase = await client();
    authSubscription?.unsubscribe();
    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      callback(event, session);
    });
    authSubscription = data.subscription;
    return authSubscription;
  },
};

