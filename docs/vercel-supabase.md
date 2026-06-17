# Deploy gratuito na Vercel com Supabase

O deploy gratuito recomendado usa:

- Vercel para hospedar o frontend.
- Supabase para salvar os dados do tarifario.

## 1. Criar tabela no Supabase

No Supabase, abra `SQL Editor` e rode:

```sql
create table if not exists public.app_state (
  key text primary key,
  payload jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.app_state enable row level security;

drop policy if exists "Public read app_state" on public.app_state;
create policy "Public read app_state"
on public.app_state
for select
to anon
using (true);

drop policy if exists "Public write app_state" on public.app_state;
create policy "Public write app_state"
on public.app_state
for insert
to anon
with check (true);

drop policy if exists "Public update app_state" on public.app_state;
create policy "Public update app_state"
on public.app_state
for update
to anon
using (true)
with check (true);
```

## 2. Variaveis na Vercel

No projeto da Vercel, adicione:

```text
VITE_SUPABASE_URL=https://SEU-PROJETO.supabase.co
VITE_SUPABASE_ANON_KEY=SUA_ANON_PUBLIC_KEY
```

Esses valores ficam no Supabase em:

`Project Settings -> API`

## 3. Configuracao da Vercel

O arquivo `vercel.json` ja configura:

- Build command: `corepack pnpm run build:client`
- Install command: `corepack pnpm install --frozen-lockfile`
- Output directory: `dist/public`

## Observacao

Sem as variaveis `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY`, o app continua usando a API local `/api/rate-sheet`, que funciona no seu computador com SQLite, mas nao salva dados online na Vercel.

