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


## 4. API para agente

O projeto tambem tem uma API protegida para um agente consultar e alterar dados.

Adicione estas variaveis de ambiente na Vercel:

```text
SUPABASE_URL=https://SEU-PROJETO.supabase.co
SUPABASE_SERVICE_ROLE_KEY=SUA_SERVICE_ROLE_KEY
AGENT_API_KEY=uma-chave-secreta-grande
```

Importante:

- `SUPABASE_SERVICE_ROLE_KEY` fica somente na Vercel. Nao coloque essa chave no frontend e nao publique no GitHub.
- `AGENT_API_KEY` e a senha que o agente precisa enviar no header `Authorization`.
- Depois de adicionar as variaveis, faca um novo deploy na Vercel.

### Consultar diarias

```bash
curl https://aldeia-tarifario.vercel.app/api/rates \
  -H "Authorization: Bearer SUA_AGENT_API_KEY"
```

Filtros opcionais:

```bash
curl "https://aldeia-tarifario.vercel.app/api/rates?unit=lion&season=high" \
  -H "Authorization: Bearer SUA_AGENT_API_KEY"
```

### Alterar diaria

```bash
curl -X PATCH https://aldeia-tarifario.vercel.app/api/rates \
  -H "Authorization: Bearer SUA_AGENT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"unitId":"lion","seasonId":"high","net":7200}'
```

Tambem aceita `floor`, `minStay`, `discountPercent` e `authorization`.

### Consultar concorrentes

```bash
curl https://aldeia-tarifario.vercel.app/api/competitors \
  -H "Authorization: Bearer SUA_AGENT_API_KEY"
```

Filtro por grupo:

```bash
curl "https://aldeia-tarifario.vercel.app/api/competitors?group=A" \
  -H "Authorization: Bearer SUA_AGENT_API_KEY"
```

### Alterar pesquisa de concorrente

```bash
curl -X PATCH https://aldeia-tarifario.vercel.app/api/competitors \
  -H "Authorization: Bearer SUA_AGENT_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"group":"A","competitor":"Vila Alala Jeri","month":"Mar","value":2400}'
```

Para deixar um mes sem valor, envie `"value": null`.
