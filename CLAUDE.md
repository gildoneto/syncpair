# Syncpair — Contexto do Projeto

> **Para uma nova conversa**: leia **Status atual** e **Próximos passos** abaixo. Resumo: **v1 está no ar** — `https://syncpair.vercel.app` — com Supabase real por trás (GitHub, Supabase e Vercel todos criados e verificados end-to-end). Falta só: testar sync entre duas abas e testar o cron de expiração contra um registro real.

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
- **Fluxo de criar sessão é um wizard de 2 passos** (`NewSessionWizard.tsx`), não um formulário de tela única — inspirado na análise do fluxo original do cuckoo.team. Nome da sessão → seu nome → cria (stepper local, sem rota por passo). **Sem passo de duração**: a sessão nasce com os defaults da tabela (25min/5min) e a duração só é escolhida depois, na sala — ver bullet do `TimerControl` abaixo. Criar uma sessão não deveria exigir decidir quanto tempo de foco/pausa vai durar antes mesmo de existir.
- **Duração é escolhida por círculos de tamanho proporcional** (`DurationCircles.tsx` + `src/lib/circle-size.ts`, raiz quadrada do valor — área proporcional, não diâmetro), não por input numérico + chips. Tocar no círculo já aplica; já começa a contagem direto (sem botão de confirmação). Adicionar um valor customizado é uma ação secundária discreta (um "+" tracejado), nunca um input sempre visível.
- **`.npmrc` do projeto fixa `registry=https://registry.npmjs.org/`** — esta máquina também é usada pro trabalho, e o `~/.npmrc` global aponta pro Artifactory privado da Grainger. Isso **quebrou o primeiro deploy na Vercel**: o `package-lock.json` gerado localmente gravou 773 `resolved:` apontando pro registry privado, e o build remoto não consegue autenticar lá (erro `npm error code E401`). Corrigido regenerando o lockfile com `--registry=` explícito + `.npmrc` do projeto pra nunca mais depender do default global. **Todo projeto pessoal novo nesta máquina precisa desse mesmo `.npmrc`** (não existe equivalente ao `includeIf` do git pra isso — testado e confirmado que npm não lê `.npmrc` de pastas ancestrais, só da pasta exata do projeto + `~/.npmrc`).
- **`cacheComponents`/`partialPrefetching` removidos do `next.config.ts`** — vieram do scaffold inicial (create-next-app), mas iam contra a decisão original de não usar Cache Components (nada no app se beneficia: `/` e `/new` são 100% client, só `/[slug]` busca dado do servidor, e esse dado é sempre ao vivo, nunca deveria cachear). Com `cacheComponents: true`, o build de produção falhava tentando prerenderizar `/[slug]` estaticamente; sem ele, a rota é corretamente `ƒ Dynamic`.
- **`TimerControl` (`src/components/TimerControl.tsx`) é o motif+clock+menu+picker compartilhado entre timer solo E sala de sessão** — mesmo componente, não duas implementações paralelas. Idle sempre abre num menu de botões (nunca os dois conjuntos de círculos ao mesmo tempo): Focus/Break no timer solo e na sala (+ "Create a shared session" como `menuExtra`, só no solo). Clicar em Focus/Break revela só os círculos daquele tipo com um "Back"; `Stop` sempre volta pro menu, nunca direto pros círculos. Na sala, escolher a duração também já inicia a fase pra todo mundo (`startPhase(phase, minutes)`) — a duração deixou de ser fixada na criação da sessão, pode mudar a cada rodada. Mesmo princípio em toda a UI ("não mostrar opções demais a não ser que o usuário peça") — mais fiel ao cuckoo.team original, e evita duplicar essa lógica entre os dois modos.

## Infraestrutura (LIVE)

| Serviço | Projeto | Status |
|---|---|---|
| GitHub | [`gildoneto/syncpair`](https://github.com/gildoneto/syncpair) | **Criado, público.** Repo local já tinha os commits; `gh repo create --source=. --push` criou e empurrou tudo de uma vez. |
| Supabase | org `Syncpair`, projeto `syncpair` (ref `slprofzcpcysfupziwkw`, região Americas) | **Criado.** CLI instalado via `brew install supabase/tap/supabase`, `supabase login` + `supabase link --project-ref slprofzcpcysfupziwkw`. Faltam só as 2 API keys no `.env.local` (ver abaixo). |
| Migration | `supabase/migrations/0001_init.sql` | **Rodada** via `supabase db push` (confirmado com `supabase migration list`: local=remote=`0001`). Verificado no dashboard: tabela `sessions` com as 10 colunas certas, 3 políticas RLS ativas, `sessions` presente na publication `supabase_realtime`. |
| Vercel | [`syncpair`](https://syncpair.vercel.app) | **No ar.** Criado via `vercel link --yes --project syncpair` (CLI, não pelo MCP do Vercel — ver nota abaixo), git-conectado ao repo GitHub (push em `main` já dispara deploy de produção). As 5 env vars estão setadas em Production + Preview. |
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
    TimerControl.tsx                 [PRONTO, verificado no browser via SoloTimer] motif+clock+menu+picker compartilhado solo+sessão
  features/
    solo-timer/{SoloTimer.tsx,useSoloTimer.ts}       [PRONTO, verificado no browser] só monta TimerControl (+ menuExtra "Create a shared session")
    session/
      NewSessionWizard.tsx / actions.ts               [PRONTO, verificado o caminho de erro — falta Supabase real] wizard de 2 passos (nome → seu nome → cria), sem duração
      NameGate.tsx / SessionRoom.tsx / useSessionRoom.ts [PRONTO, tsc/lint limpos, NÃO verificado end-to-end no browser — precisa de Supabase real] SessionRoom monta o mesmo TimerControl; useSessionRoom.startPhase(phase, minutes) grava a duração escolhida na hora
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
- Timer solo: homepage abre num menu (Focus/Break/Create a shared session); Focus/Break revelam só os círculos daquele tipo (tocam-e-começam, sem botão extra) com um "Back"; Stop sempre volta pro menu. Ciclo completo foco→pausa, zero chamada de rede pro Supabase, sobrevive a refresh via localStorage, tipografia Nunito + brilho quente confirmados em claro e escuro.
- `/new`: wizard de 2 passos completo (nome → seu nome → cria, sem passo de duração), voltar/continuar funcionando.
- Todo o texto voltado ao usuário em inglês (`lang="en"`).
- **Supabase end-to-end confirmado com dados reais, local E produção**: `createSession` grava de verdade; `/[slug]` busca a sessão real e renderiza; `NameGate` + localStorage funcionando; Presence mostra o participante na sala; `TimerControl` inicia e para a fase com escrita real no Supabase, eco via Realtime em ~1-2s, motif acendendo/apagando certo. Testado em `localhost:3001` e em `https://syncpair.vercel.app` (sessões de teste criadas e apagadas depois). **Testado numa aba só** — sync entre duas abas simultâneas ainda não verificado literalmente, mas o mecanismo (um channel por sessão, presence + postgres_changes) já está confirmado funcionando ponta a ponta.
- **`https://syncpair.vercel.app` está no ar**, git-conectado: todo push em `main` builda e promove pra produção automaticamente.

**Não verificado ainda**: sync entre duas abas simultâneas, cron de expiração rodando contra dado real.

**Ferramentas MCP do Vercel (`mcp__plugin_vercel_vercel__*`) estão sem permissão de escrita nesta conta** — qualquer chamada que não seja leitura (`create_git_project`, `create_deployment`, até `get_project`) retorna 403 "Not authorized... scope gildonetos-projects", mesmo com `list_projects`/`list_teams` funcionando. A conexão do plugin provavelmente precisa ser reautorizada pelo usuário. **Até lá, usar sempre o CLI (`vercel ...`) pra qualquer operação no Vercel deste projeto** — foi o que funcionou (login via terminal interativo, `vercel link`, `vercel env add --value ... --yes`, `vercel inspect <url> --wait`/`--logs`).

**Supabase criado e com a migration aplicada** (ver tabela de Infraestrutura acima) — via CLI (`brew install supabase/tap/supabase`, não pelo SQL editor do dashboard: digitar SQL longo lá corrompe por causa do auto-indent/auto-fechamento de parênteses do editor). `supabase/migrations/0001_init.sql` é a fonte da verdade; qualquer mudança de schema futura deve ser uma nova migration + `supabase db push`, nunca editada direto no dashboard. `.env.local` tem as 5 variáveis preenchidas com valores reais; as mesmas 5 estão setadas na Vercel (Production + Preview).

## Próximos passos

1. Abrir o mesmo link de sessão em duas abas e confirmar presença/timer sincronizando entre elas (o teste de uma aba só já passou, local e em produção).
2. Testar o cron de expiração contra um registro de teste antes de confiar nele em produção (ele já está deployado via `vercel.json`, só falta validar que dispara certo).
3. **v1.1** (fora de escopo agora, schema já comporta): Gravatar (hash de email local), sons de UI (hover, membro entrou, fim de foco/pausa — todos confirmados nos assets arquivados do original), ícones de convidar/feedback/editar sessão.

## Padrões estabelecidos

- **Slugs**: `src/lib/slug.ts` — `slugify()` pra normalizar entrada do usuário, `generateSlug()` (nanoid 8 chars) como fallback, `RESERVED_SLUGS` pra evitar colisão com rotas reais.
- **Timer compartilhado**: nunca duplicar lógica de transição entre solo e sessão — sempre via `src/lib/timer/state-machine.ts` + `src/hooks/use-countdown.ts`. Sessão converte `SessionRow` → `TimerState` via `sessionRowToTimerState` (`src/types/session.ts`).
- **UI do timer também é compartilhada**: `src/components/TimerControl.tsx` é o único lugar que desenha motif+clock+menu+picker — `SoloTimer` e `SessionRoom` só montam esse componente passando `state`/`presets`/`onStart`/`onStop`/`onAddPreset` (+ `menuExtra` opcional). Nunca recriar esse menu/picker num dos dois lados.
- **Realtime**: um único channel por sessão (`session:<slug>`), presence + postgres_changes juntos — nunca dois channels pra mesma sala. Chave de presença gerada num `useEffect` (nunca em `useRef` lido durante o render — colidiria entre visitantes se a página fosse pré-renderizada).
- **RLS**: `anon` pode select/insert/update (colunas específicas via `grant update (...) to anon`); delete só via `service_role` (só o cron usa). Ver `supabase/migrations/0001_init.sql`.
- **Hostname nunca hardcoded**: link compartilhável usa `window.location.origin` (correto em qualquer domínio/preview automaticamente); `metadataBase` usa `NEXT_PUBLIC_APP_URL` (troca de domínio é só variável de ambiente).
- **Presets de duração**: lista única compartilhada (`src/hooks/use-presets.ts`, localStorage) entre timer solo e sala de sessão (via `TimerControl`) — um preset salvo em qualquer lugar aparece clicável nos dois. Sempre renderizado via `DurationCircles`, nunca um input numérico solto.
- **Cursor pointer em todo elemento clicável**: regra global em `globals.css` (`button:not(:disabled), [role="button"]:not(:disabled) { cursor: pointer; }`), não uma classe `cursor-pointer` por componente — todo botão novo já nasce certo. Padrão esperado em qualquer projeto de frontend, não só aqui.

## Dev local

```bash
npm --prefix syncpair run dev -- -p 3001   # ou: cd syncpair && npm run dev
```

Validação: `npx tsc --noEmit && npm run lint` (rodar de dentro de `syncpair/`).

## Deploy

**No ar em [`https://syncpair.vercel.app`](https://syncpair.vercel.app).** Projeto Vercel `syncpair`, conectado ao repo GitHub — push em `main` builda e promove pra produção sozinho, sem passo manual. Ver "Padrões estabelecidos"/Status atual acima para os dois bugs que apareceram no primeiro deploy (registry do npm, `cacheComponents`) e a nota sobre usar CLI em vez do MCP pra operações no Vercel.
