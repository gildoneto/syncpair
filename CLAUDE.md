# Syncpair — Contexto do Projeto

> **Para uma nova conversa**: leia **Status atual** e **Próximos passos** abaixo. Resumo: o código do v1 está pronto (timer solo + sessão compartilhada + realtime), mas **ainda não há projeto Supabase nem deploy** — falta o usuário criar a conta Supabase e colar 3 valores no `.env.local` antes de qualquer coisa que toque o banco funcionar de verdade.

## O que é este projeto

Timer de foco/pausa compartilhado, **gratuito para sempre**. Sucessor espiritual do **cuckoo.team**, um timer Pomodoro compartilhado muito bonito que foi descontinuado — o domínio hoje só mostra uma página genérica de "Service Suspended" de hospedagem, sugerindo abandono silencioso (conta de servidor não paga), não um encerramento planejado. A ideia central: igualmente bonito, mas desenhado desde o início pra não morrer do mesmo jeito.

Nasceu de uma sessão `/grill-me` completa (pesquisa do cuckoo.team via Wayback Machine + 13 decisões de produto fechadas uma a uma, com verificação real de disponibilidade de domínio via API da Vercel). O plano completo original está em `~/.claude/plans/graceful-foraging-lamport.md` (pode não estar acessível em nova conversa — o essencial está aqui).

## Decisões técnicas

- **Stack**: Next.js 16 (App Router, Turbopack) + React 19 + TypeScript strict + Tailwind v4 CSS-first. npm (padrão de todo o workspace).
- **UI**: shadcn/ui com **Base UI** (`@base-ui/react`, não Radix) + preset `base-nova`. Primeiro projeto do workspace nessa combinação (os irmãos usam shadcn clássico).
- **Realtime**: Supabase (Realtime + Presence) — a Presence API é feita sob medida pra "quem tá na sala agora", o mecanismo central do produto. Primeiro projeto Supabase do workspace (os irmãos usam Firebase).
- **Sem `@supabase/ssr`, de propósito**: Syncpair não tem Supabase Auth (zero contas, decisão #4 abaixo), então não existe sessão de login pra sincronizar entre servidor e navegador — o pacote de cookie-bridging não tem o que fazer aqui. `src/lib/supabase/server.ts` e `admin.ts` são clientes `@supabase/supabase-js` simples, diferindo só na key (anon vs. service-role).
- **Dois modos genuinamente separados** (decisão do usuário, não a recomendação original): timer solo zero-backend (`/`, offline, sem nenhum import de `@/lib/supabase/*`) e sessão compartilhada (`/[slug]`, Supabase-backed). Compartilham só a lógica pura do timer (`src/lib/timer/state-machine.ts`) — nunca persistência/transporte.
- **Ciclo foco/pausa: reset manual** entre blocos — não autopilota. Qualquer participante pode avançar (não só quem criou a sessão): não existe jeito durável de distinguir "o criador" sem reintroduzir contas, e criador-only travaria o grupo se ele saísse.
- **Sem tabela `participants`** — presença é 100% Supabase Presence (efêmera, limpa sozinha ao fechar o socket). `created_by_name` é a única coisa persistida, e é só um rótulo cosmético, nunca uma identidade.
- **Slugs**: a pessoa escolhe um nome customizado (tipo o `cuckoo.team/collabcafe` original); em branco cai pra um código aleatório de 8 caracteres (nanoid, sem 0/O/1/l/i). Colisão num nome escolhido vira erro de validação, nunca substituição silenciosa.
- **Countdown nunca sincroniza por tick** — cada cliente computa localmente a partir de um `phase_ends_at`/`endsAt` compartilhado (`useCountdown`, usado por solo E sessão). Realtime só carrega transições de estado raras, nunca um tick por segundo.
- **Expiração: cron diário** (Vercel Cron no Hobby = 1x/dia, não dá pra mais) apaga sessões com `last_active_at` > 48h. O mesmo cron também evita a pausa automática do Supabase free tier (projetos pausam após 7 dias de baixa atividade) — a mesma chamada resolve as duas coisas.
- **Sustentabilidade é restrição permanente**: sem ads, sem tier pago, nunca. Toda escolha de infra prioriza ficar dentro do free tier pra sempre.
- **Identidade**: nome salvo em `localStorage` por dispositivo, zero conta/senha. Gravatar é v1.1 (não construído ainda, mas o payload de presence aceita JSON arbitrário, então um `avatar_hash` encaixa sem mudar schema).
- **Visual**: inspirado, não clonado — mascote próprio (luminária/vela que acende no foco e apaga na pausa), substituindo o passarinho-no-ovo original. Paleta totalmente aconchegante (âmbar/laranja, fundo escuro quente), tanto no claro quanto no escuro — ver tokens `--flame`/`--flame-dim` isolados de `--primary` em `globals.css`.
- **Nome do projeto**: "Syncpair" — verificado via API de domínio da Vercel que `syncpair.team`/`.work`/`.dev` estão disponíveis de verdade, e que `syncpair.vercel.app` está livre (confirmado via 404 real da própria Vercel, não só lookup de registro). Dois candidatos anteriores (Pairly, Focusprint) foram descartados por já serem produtos reais ocupando o nome E o subdomínio `.vercel.app` exato.
- **Lint**: `react-hooks/set-state-in-effect` rebaixado pra `warn` em `eslint.config.mjs` (mesmo padrão do gastos-imovel) — seedar state a partir de uma leitura não-determinística/browser-only (`Date.now()`, `localStorage`, `window.location`, `crypto.randomUUID()`) é legítimo, e essa regra nova do `eslint-config-next` sinaliza isso como erro.
- **Idioma da UI: inglês** (`lang="en"`, decisão explícita do usuário) — todo texto voltado ao usuário (telas, mensagens de erro, metadata) é em inglês. Documentação do projeto (este arquivo, `PRODUCT.md`, `DESIGN.md`) continua em português, pelo mesmo motivo que esta conversa é em português: é a língua do usuário, não do produto.
- **Tipografia**: Nunito (variável, sem `weight` array — ver comentário em `layout.tsx`: Next 16/Turbopack quebra se você tentar passar pesos discretos num Google Font variável). Substituiu a Geist padrão do create-next-app.
- **Fluxo de criar sessão é um wizard de 3 passos** (`NewSessionWizard.tsx`), não um formulário de tela única — inspirado na análise do fluxo original do cuckoo.team (homepage de um campo só → gate de nome → tela de duração). Nome da sessão → seu nome → duração, stepper local (sem rota por passo).
- **Duração é escolhida por círculos de tamanho proporcional** (`DurationCircles.tsx` + `src/lib/circle-size.ts`, raiz quadrada do valor — área proporcional, não diâmetro), não por input numérico + chips. Tocar no círculo já aplica; no timer solo, já começa a contagem direto (sem botão de confirmação). Adicionar um valor customizado é uma ação secundária discreta (um "+" tracejado), nunca um input sempre visível.

## Infraestrutura (LIVE)

| Serviço | Projeto | Status |
|---|---|---|
| Supabase | — | **Não criado ainda.** Usuário precisa criar o projeto e colar `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` no `.env.local` |
| Migration | `supabase/migrations/0001_init.sql` | Escrita, **não rodada** — aplicar via SQL editor do Supabase assim que o projeto existir |
| Vercel | `syncpair` | **Não criado ainda.** Nome confirmado disponível; falta `vercel link`/criar o projeto depois que o Supabase existir |
| Dev local | `npm --prefix syncpair run dev -- -p 3001` (via `~/workspace/personal/.claude/launch.json`, entry `syncpair-dev`) | Funciona — porta 3001 porque 3000 já é do recoffee no mesmo workspace |

## Estrutura de código

```
src/
  app/
    page.tsx                         [PRONTO] timer solo (root) — zero import de Supabase
    new/page.tsx                     [PRONTO] hospeda o NewSessionWizard
    [slug]/page.tsx                  [PRONTO] fetch da sessão (Server Component) + not-found state
    api/cron/expire-sessions/route.ts [PRONTO, não testado em prod] expira sessões com >48h de inatividade
    layout.tsx                       [PRONTO] Nunito, Providers (theme + toaster), metadataBase, lang="en"
    globals.css                      [PRONTO] paleta quente OKLCH + tokens --flame/--flame-dim/--shadow-glow-* + keyframes do motif
  components/
    ui/                              shadcn primitives (button, input, label)
    motifs/LampMotif.tsx             [PRONTO, 1ª versão] contrato visual — arte final é um passe de design separado
    DurationCircles.tsx              [PRONTO] círculos de duração — ver "Padrões estabelecidos"
  features/
    solo-timer/{SoloTimer.tsx,useSoloTimer.ts}       [PRONTO, verificado no browser] círculos tocam-e-começa
    session/
      NewSessionWizard.tsx / actions.ts               [PRONTO, verificado o caminho de erro — falta Supabase real] wizard de 3 passos
      NameGate.tsx / SessionRoom.tsx / useSessionRoom.ts [PRONTO, NÃO verificado end-to-end — precisa de Supabase real]
  lib/
    supabase/{client.ts,server.ts,admin.ts}  [PRONTO] — ver nota "Sem @supabase/ssr" acima
    timer/{state-machine.ts,format.ts}       [PRONTO, compartilhado solo+sessão]
    slug.ts                                   [PRONTO]
    circle-size.ts                            [PRONTO] escala raiz-quadrada pro DurationCircles
    constants.ts                              [PRONTO] SESSION_EXPIRY_HOURS
  providers/index.tsx                [PRONTO] ThemeProvider (next-themes) + Toaster (sonner)
  types/session.ts                   [PRONTO] SessionRow + sessionRowToTimerState
  hooks/{use-countdown.ts,use-presets.ts} [PRONTO, compartilhado solo+sessão]
supabase/migrations/0001_init.sql    [ESCRITO, NÃO RODADO]
vercel.json                          [PRONTO] cron 1x/dia (10h UTC)
PRODUCT.md / DESIGN.md / .impeccable/design.json  [PRONTO] gerados via skill impeccable — contexto estratégico/visual, em português
```

## Status atual (out/2026)

**Código do v1 completo e passando `tsc`/`lint` limpos.** Verificado no browser:
- Timer solo: círculos de duração tocam-e-começam (sem botão extra), ciclo completo foco→pausa, zero chamada de rede pro Supabase, sobrevive a refresh via localStorage, tipografia Nunito + brilho quente confirmados em claro e escuro.
- `/new`: wizard de 3 passos completo (nome → seu nome → duração), voltar/continuar funcionando, adicionar preset customizado funcionando; submissão final falha com erro claro e esperado (`supabaseUrl is required`) — confirma que o caminho de código está certo, só falta credencial real.
- Todo o texto voltado ao usuário em inglês (`lang="en"`).

**Não verificado ainda** (precisa do Supabase real existir): criar sessão de verdade, `/[slug]` servindo uma sessão real, sync de presença/timer entre duas abas, o cron de expiração rodando contra dados reais, deploy na Vercel.

## Próximos passos

1. **Usuário**: criar projeto Supabase (free tier), rodar `supabase/migrations/0001_init.sql` no SQL editor, colar as 3 keys no `.env.local` (copiar de `.env.local.example`).
2. Com credenciais em mãos: testar criar sessão → abrir o link em duas abas → confirmar presença e timer sincronizando.
3. Criar projeto Vercel chamado exatamente `syncpair`, configurar as env vars (Produção + Preview), confirmar `syncpair.vercel.app` no ar.
4. Testar o cron de expiração contra um registro de teste antes de confiar nele em produção.
5. **v1.1** (fora de escopo agora, schema já comporta): Gravatar (hash de email local), sons de UI (hover, membro entrou, fim de foco/pausa — todos confirmados nos assets arquivados do original), ícones de convidar/feedback/editar sessão.

## Padrões estabelecidos

- **Slugs**: `src/lib/slug.ts` — `slugify()` pra normalizar entrada do usuário, `generateSlug()` (nanoid 8 chars) como fallback, `RESERVED_SLUGS` pra evitar colisão com rotas reais.
- **Timer compartilhado**: nunca duplicar lógica de transição entre solo e sessão — sempre via `src/lib/timer/state-machine.ts` + `src/hooks/use-countdown.ts`. Sessão converte `SessionRow` → `TimerState` via `sessionRowToTimerState` (`src/types/session.ts`).
- **Realtime**: um único channel por sessão (`session:<slug>`), presence + postgres_changes juntos — nunca dois channels pra mesma sala. Chave de presença gerada num `useEffect` (nunca em `useRef` lido durante o render — colidiria entre visitantes se a página fosse pré-renderizada).
- **RLS**: `anon` pode select/insert/update (colunas específicas via `grant update (...) to anon`); delete só via `service_role` (só o cron usa). Ver `supabase/migrations/0001_init.sql`.
- **Hostname nunca hardcoded**: link compartilhável usa `window.location.origin` (correto em qualquer domínio/preview automaticamente); `metadataBase` usa `NEXT_PUBLIC_APP_URL` (troca de domínio é só variável de ambiente).
- **Presets de duração**: lista única compartilhada (`src/hooks/use-presets.ts`, localStorage) entre timer solo e wizard — um preset salvo em qualquer lugar aparece clicável nos dois. Sempre renderizado via `DurationCircles`, nunca um input numérico solto.

## Dev local

```bash
npm --prefix syncpair run dev -- -p 3001   # ou: cd syncpair && npm run dev
```

Validação: `npx tsc --noEmit && npm run lint` (rodar de dentro de `syncpair/`).

## Deploy

Ainda não feito — ver **Próximos passos** acima. Quando criar o projeto Vercel, usar exatamente o nome `syncpair` pra reservar `syncpair.vercel.app` (já confirmado livre).
