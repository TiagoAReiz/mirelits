@AGENTS.md

# Arquitectura do Projecto

## Stack

- **Vercel** — hosting do Next.js completo (frontend + backend via Server Components, Server Actions e Route Handlers)
- **Supabase** — base de dados PostgreSQL gerida, acedida exclusivamente via Prisma. Nenhuma funcionalidade do Supabase é usada além do PostgreSQL: sem RLS, sem Supabase Auth, sem Edge Functions, sem Realtime.

## Regras de arquitectura

### Base de dados
- Toda a interacção com a DB passa por Prisma. Nunca aceder ao Supabase directamente do cliente.
- `POSTGRES_PRISMA_URL` usa pgbouncer em transaction mode — obrigatório para serverless na Vercel.
- `POSTGRES_URL_NON_POOLING` usa ligação directa — usar exclusivamente para `prisma migrate deploy` em CI/CD.
- Nunca correr migrações com `POSTGRES_PRISMA_URL` — o pgbouncer não as suporta.
- **Deploy aplica schema automaticamente:** o script de build é `prisma generate && prisma db push --accept-data-loss && next build`. Alterações ao `schema.prisma` são aplicadas ao banco no deploy via Vercel — não é necessário criar migration files nem rodar migrações localmente. Nunca tentar rodar `prisma migrate dev` localmente sem credenciais de DB configuradas.

### Autorização e lógica de negócio
- Toda a autorização e lógica de negócio vive no servidor: Server Actions, Route Handlers ou Server Components.
- Nenhuma query Prisma nem lógica de acesso a dados pertence a Client Components.
- Não há RLS no Supabase — a protecção de dados é responsabilidade do código Next.js no servidor.

### Variáveis de ambiente
- `.env.local` para desenvolvimento local (não commitado).
- Variáveis de produção/preview geridas na Vercel.
- Usar `vercel env pull` para sincronizar variáveis localmente quando necessário.
