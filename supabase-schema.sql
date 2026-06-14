-- ================================================================
-- SCHEMA SUPABASE — Caderno Vivo
-- Execute este SQL no editor do Supabase (SQL Editor → New query)
--
-- Cria as tabelas necessárias para o sistema de 4 camadas:
--   api_keys    → Camada 3: pool rotativo de APIs
--   cache_obras → Camada 2: cache inteligente por hash
-- ================================================================


-- ----------------------------------------------------------------
-- CAMADA 2: Cache inteligente de resultados
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.cache_obras (
  id           uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  hash         text          NOT NULL UNIQUE,          -- SHA-256 do type+payload (32 chars)
  type         text          NOT NULL,                 -- 'lyrics' | 'translation' | 'image' | etc.
  result_json  jsonb,                                  -- resultado completo em JSON
  result_url   text,                                   -- URL de imagem/áudio/vídeo (quando aplicável)
  provider     text          NOT NULL DEFAULT 'unknown',
  hit_count    integer       NOT NULL DEFAULT 0,       -- quantas vezes foi servido do cache
  created_at   timestamptz   NOT NULL DEFAULT now(),
  last_hit_at  timestamptz
);

-- Índice para busca rápida por hash
CREATE INDEX IF NOT EXISTS idx_cache_obras_hash ON public.cache_obras (hash);
-- Índice para limpeza de cache antigo
CREATE INDEX IF NOT EXISTS idx_cache_obras_created ON public.cache_obras (created_at);

-- Função para incrementar hit_count automaticamente
CREATE OR REPLACE FUNCTION public.increment_cache_hit(p_hash text)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.cache_obras
  SET hit_count = hit_count + 1, last_hit_at = now()
  WHERE hash = p_hash;
END;
$$;

-- Row Level Security: apenas service_role pode escrever/ler
ALTER TABLE public.cache_obras ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role full access on cache_obras"
  ON public.cache_obras
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ----------------------------------------------------------------
-- CAMADA 3: Pool rotativo de chaves de API
-- ----------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.api_keys (
  id               uuid          PRIMARY KEY DEFAULT gen_random_uuid(),
  provider         text          NOT NULL,   -- 'groq' | 'fal-ai' | 'replicate' | 'huggingface' | 'together'
  label            text,                     -- nome amigável ex: "Groq conta principal"
  api_key          text          NOT NULL,   -- chave cifrada (use Supabase Vault em produção)
  is_active        boolean       NOT NULL DEFAULT true,
  daily_limit      integer,                  -- NULL = sem limite
  requests_today   integer       NOT NULL DEFAULT 0,
  requests_total   bigint        NOT NULL DEFAULT 0,
  last_used        timestamptz,
  last_error       text,
  last_error_at    timestamptz,
  reset_at         timestamptz,              -- quando o contador diário foi zerado
  created_at       timestamptz   NOT NULL DEFAULT now()
);

-- Índice para busca de chaves disponíveis por provedor
CREATE INDEX IF NOT EXISTS idx_api_keys_provider_active
  ON public.api_keys (provider, is_active, last_used)
  WHERE is_active = true;

-- Função para incrementar uso de uma chave (chamada pelo orchestrator)
CREATE OR REPLACE FUNCTION public.increment_key_usage(key_id uuid)
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.api_keys
  SET
    requests_today = requests_today + 1,
    requests_total = requests_total + 1,
    last_used      = now()
  WHERE id = key_id;
END;
$$;

-- Função para resetar contadores diários (rode às 00:00 via cron Supabase)
CREATE OR REPLACE FUNCTION public.reset_daily_counters()
RETURNS void LANGUAGE plpgsql AS $$
BEGIN
  UPDATE public.api_keys
  SET requests_today = 0, reset_at = now();
END;
$$;

-- Row Level Security: apenas service_role acessa as chaves
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "service_role full access on api_keys"
  ON public.api_keys
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);


-- ----------------------------------------------------------------
-- DADOS INICIAIS — insira suas chaves aqui após criar a tabela
-- (substitua 'SUA_CHAVE_AQUI' pela chave real)
-- ----------------------------------------------------------------

-- Groq (LLM: texto, letra, tradução, mentor, storyboard)
INSERT INTO public.api_keys (provider, label, api_key, daily_limit)
VALUES
  ('groq', 'Groq conta 1', 'SUA_CHAVE_GROQ_1', 14400),
  ('groq', 'Groq conta 2', 'SUA_CHAVE_GROQ_2', 14400)
ON CONFLICT DO NOTHING;

-- HuggingFace (LLM + imagem: FLUX.1-schnell, Mistral)
INSERT INTO public.api_keys (provider, label, api_key, daily_limit)
VALUES
  ('huggingface', 'HuggingFace conta 1', 'SUA_CHAVE_HF_1', 1000)
ON CONFLICT DO NOTHING;

-- Together.ai (LLM alternativo: Llama-3)
INSERT INTO public.api_keys (provider, label, api_key, daily_limit)
VALUES
  ('together', 'Together conta 1', 'SUA_CHAVE_TOGETHER_1', 500)
ON CONFLICT DO NOTHING;

-- Fal.ai (imagem e vídeo: FLUX, SVD)
INSERT INTO public.api_keys (provider, label, api_key, daily_limit)
VALUES
  ('fal-ai', 'Fal.ai conta 1', 'SUA_CHAVE_FAL_1', 200)
ON CONFLICT DO NOTHING;

-- Replicate (áudio: Bark, imagem: FLUX, vídeo: SVD)
INSERT INTO public.api_keys (provider, label, api_key, daily_limit)
VALUES
  ('replicate', 'Replicate conta 1', 'SUA_CHAVE_REPLICATE_1', 100)
ON CONFLICT DO NOTHING;


-- ----------------------------------------------------------------
-- CRON JOB — reseta contadores às 00:00 UTC diariamente
-- SELECT cron.schedule('reset-api-keys', '0 0 * * *', 'SELECT public.reset_daily_counters()');
-- ----------------------------------------------------------------


-- ----------------------------------------------------------------
-- VIEW útil para monitoramento no Supabase Studio
-- ----------------------------------------------------------------
CREATE OR REPLACE VIEW public.api_keys_status AS
SELECT
  provider,
  label,
  is_active,
  requests_today,
  daily_limit,
  CASE
    WHEN daily_limit IS NULL THEN NULL
    ELSE ROUND(requests_today::numeric / daily_limit * 100, 1)
  END AS usage_pct,
  last_used,
  last_error,
  last_error_at
FROM public.api_keys
ORDER BY provider, last_used DESC NULLS LAST;
