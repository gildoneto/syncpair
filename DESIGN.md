---
name: Syncpair
description: Timer de foco e pausa compartilhado, gratuito para sempre — sucessor espiritual do cuckoo.team.
colors:
  brasa: "oklch(0.62 0.17 45)"
  chama: "oklch(0.75 0.18 55)"
  rescaldo: "oklch(0.6 0.06 50)"
  fundo: "oklch(0.98 0.012 70)"
  tinta: "oklch(0.22 0.025 50)"
  superficie: "oklch(0.995 0.008 70)"
  neutro-suave: "oklch(0.93 0.02 60)"
  neutro-texto: "oklch(0.5 0.035 50)"
  borda: "oklch(0.88 0.025 60)"
  alerta: "oklch(0.577 0.245 27.325)"
typography:
  display:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "clamp(3.5rem, 12vw, 6rem)"
    fontWeight: 800
    lineHeight: 1
    letterSpacing: "-0.02em"
  headline:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "1.5rem"
    fontWeight: 700
    lineHeight: 1.25
  body:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Nunito, system-ui, sans-serif"
    fontSize: "0.75rem"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.08em"
rounded:
  sm: "6px"
  md: "8px"
  lg: "10px"
  xl: "14px"
  2xl: "18px"
  full: "9999px"
components:
  button-primary:
    backgroundColor: "{colors.brasa}"
    textColor: "{colors.fundo}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  button-primary-hover:
    backgroundColor: "{colors.brasa}"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.tinta}"
    rounded: "{rounded.lg}"
    padding: "8px 16px"
  chip-selected:
    backgroundColor: "{colors.brasa}"
    textColor: "{colors.brasa}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
  chip-default:
    backgroundColor: "transparent"
    textColor: "{colors.neutro-texto}"
    rounded: "{rounded.full}"
    padding: "4px 10px"
---

# Design System: Syncpair

## 1. Overview

**Creative North Star: "A Vela de Trabalho"**

Syncpair é uma aplicação moderna, simples e funcional — no mesmo espírito do cuckoo.team que a inspirou — construída ao redor de uma vela que acende quando você foca e apaga quando você pausa. Nada aqui tenta parecer um painel corporativo de produtividade: é uma ferramenta pequena e gostosa de usar, que fica rodando de canto enquanto a pessoa trabalha em outra coisa, e que ela só espia de vez em quando. A tipografia precisa carregar esse clima sozinha, já que não há ilustração nenhuma além da própria vela — por isso a troca de uma sans técnica e neutra (Geist) para uma sans arredondada e calorosa (Nunito) é a mudança estrutural desta passada.

O sistema rejeita explicitamente: o roxo frio e distante do cuckoo.team original (decisão de marca já tomada: inspirado, não clonado); clichês de SaaS corporativo (gradiente decorativo, grid de cards idênticos, métrica gigante em destaque); e o tom clínico de ferramenta de gestão de projetos. Em troca, busca a sensação de um objeto físico pequeno e aconchegante — uma vela de mesa — não a de um dashboard.

**Key Characteristics:**
- Paleta inteiramente quente (âmbar sobre fundo claro ou escuro quentes), nunca neutra fria
- Uma família tipográfica só (Nunito), variando peso — não indecisão de múltiplas fontes
- Chato por padrão (sem sombra dura), com brilho difuso e quente só nos pontos que a vela "ilumina"
- Hierarquia carregada inteiramente por peso e tamanho, nunca por cor de destaque isolada

## 2. Colors

Paleta inteiramente quente — âmbar sobre uma base creme (claro) ou carvão aquecido (escuro) — nunca neutra fria. Todo valor é definido em OKLCH (`src/app/globals.css`); hex não é a fonte canônica deste projeto.

### Primary
- **Brasa** (`oklch(0.62 0.17 45)`, var(`--primary`); no escuro, `oklch(0.72 0.16 55)`): o âmbar/laranja que carrega toda ação primária — botão principal, chip selecionado, foco de input, link. Usado com moderação: é a única cor saturada do sistema, então sua raridade é o que faz ela significar algo quando aparece.

### Secondary
- **Chama** (`oklch(0.75 0.18 55)`, var(`--flame`); no escuro, `oklch(0.78 0.16 55)`): a cor exclusiva do motivo da vela (`LampMotif`). Deliberadamente isolada de Brasa (token próprio, não reaproveita `--primary`) — assim um ajuste de paleta geral nunca destina a cor do mascote sem querer, e vice-versa.
- **Rescaldo** (`oklch(0.6 0.06 50)`, var(`--flame-dim`); no escuro, `oklch(0.4 0.06 45)`): a chama apagando — baixa croma do mesmo matiz de Chama, nunca cinza puro. Usado só dentro do `LampMotif` nos estados de pausa/ocioso.

### Neutral
- **Fundo** (`oklch(0.98 0.012 70)`, var(`--background`); no escuro, `oklch(0.16 0.015 40)`): base da página. **Nota de risco, não mudança aplicada agora**: o tom claro atual cai perto do "quase-branco creme" que é hoje um clichê reconhecível de design gerado por IA — ver Do's and Don'ts.
- **Tinta** (`oklch(0.22 0.025 50)`, var(`--foreground`); no escuro, `oklch(0.96 0.012 70)`): texto principal, levemente aquecido (nunca cinza puro).
- **Superfície** (`oklch(0.995 0.008 70)`, var(`--card`); no escuro, `oklch(0.21 0.02 45)`): fundo de cards/popovers, quase imperceptível do Fundo no claro — a separação vem de sombra/borda, não de contraste de cor.
- **Neutro Suave** (`oklch(0.93 0.02 60)`, var(`--muted`); no escuro, `oklch(0.26 0.02 45)`): preenchimento de elementos secundários (ex: chip não selecionado).
- **Neutro Texto** (`oklch(0.5 0.035 50)`, var(`--muted-foreground`); no escuro, `oklch(0.68 0.035 55)`): texto secundário/rótulo — **atenção**: verificar contraste contra Fundo antes de usar em texto de corpo (ver regra abaixo).
- **Borda** (`oklch(0.88 0.025 60)`, var(`--border`); no escuro, `oklch(0.9 0.02 60 / 12%)`): toda borda de 1px do sistema.

### Status
- **Alerta** (`oklch(0.577 0.245 27.325)`, var(`--destructive`); no escuro, `oklch(0.704 0.191 22.216)`): erro de validação (ex: slug já em uso). Hue (~27°) já cai dentro da mesma família quente do resto da paleta — não é um vermelho frio destoante.

### Named Rules
**A Regra da Chama Isolada.** `--flame`/`--flame-dim` nunca referenciam `--primary`. Um ajuste de paleta de botões/links não pode, sem querer, mudar a cor do mascote — e vice-versa.

**A Regra da Cor Rara.** Brasa aparece em no máximo um elemento de destaque por tela (o botão primário, OU o chip selecionado, nunca empilhados como "toda ação é laranja"). A raridade é o que dá peso a ela.

## 3. Typography

**Display Font:** Nunito (com fallback `system-ui, sans-serif`)
**Body Font:** Nunito (mesma família, pesos mais leves)
**Label/Mono Font:** nenhuma — o contador usa Nunito ExtraBold + `font-variant-numeric: tabular-nums`, não uma fonte monoespaçada separada (ver regra abaixo)

**Character:** Uma sans arredondada e calorosa, substituindo a Geist (técnica, neutra, fria) que o `create-next-app` deixou como padrão sem nenhuma escolha deliberada. Nunito tem terminações suaves que carregam o "aconchegante e amigável" sozinhas, mantendo excelente legibilidade de numerais — essencial pro contador gigante, que é o elemento mais olhado do produto inteiro.

### Hierarchy
- **Display** (ExtraBold 800, `clamp(3.5rem, 12vw, 6rem)`, line-height 1): o contador mm:ss — o único elemento que justifica esse peso/tamanho. Letter-spacing -0.02em (nunca mais apertado que -0.04em, ou os dígitos se tocam).
- **Headline** (Bold 700, 1.5rem, line-height 1.25): título de tela ("Criar uma sessão compartilhada").
- **Title** (SemiBold 600, 1rem, line-height 1.4): rótulos de campo de formulário, nome de participante.
- **Body** (Regular 400, 1rem, line-height 1.5): texto corrido, placeholder, texto de botão. Nenhuma tela deste produto tem parágrafo longo — 65-75ch não é uma restrição ativa aqui, mas vale manter caso apareça.
- **Label** (Bold 700, 0.75rem, letter-spacing 0.08em, maiúsculo): o rótulo FOCO/PAUSA acima do contador, e rótulos de chip de preset. É um indicador de estado funcional (não um "eyebrow" decorativo de marketing) — uso permitido.

### Named Rules
**A Regra do Dígito Tabular.** O contador usa `font-variant-numeric: tabular-nums`, nunca uma fonte monoespaçada à parte. Nunito já resolve a largura fixa dos dígitos nativamente — introduzir uma segunda família só pra isso violaria o teto de famílias e não adicionaria nada.

**A Regra do Peso Único.** Hierarquia vem de variar o peso (400 a 800) de uma família só, nunca de introduzir uma segunda ou terceira fonte. Nunito tem peso suficiente nos dois extremos pra isso funcionar sozinha.

## 4. Elevation

Sistema majoritariamente chato — sem sombra dura em nenhum elemento — com uma exceção deliberada: **brilho difuso e quente**, não sombra estrutural, aplicado só onde a narrativa da vela justifica ("a vela ilumina algumas coisas"). Isso não é elevação no sentido Material (camadas empilhadas); é luz ambiente ao redor de 1-2 elementos por tela, no máximo.

### Shadow Vocabulary
- **glow-motif** (`box-shadow: 0 0 48px oklch(0.75 0.18 55 / 0.35)`): halo ao redor do `LampMotif` quando a chama está acesa (foco rodando). Já existe hoje como uma div borrada separada (`blur-2xl`) — mantém a mesma ideia, formalizada como token.
- **glow-primary** (`box-shadow: 0 0 24px oklch(0.62 0.17 45 / 0.25)`): halo sutil no hover/focus do botão primário — a única outra superfície que "acende".

### Named Rules
**A Regra do Brilho, Nunca da Sombra-Fantasma.** Nenhum elemento combina borda de 1px **e** sombra difusa ao mesmo tempo — esse par é o "ghost card" que lê como gerado por IA, não como decisão. Onde há brilho (botão primário, motivo da vela), não há borda. Onde há borda (input, card, chip não selecionado), não há brilho.

## 5. Components

### Buttons
- **Shape:** cantos arredondados (10px, `{rounded.lg}`) — nunca full-pill em botão retangular.
- **Primary:** fundo Brasa, texto Fundo (claro sobre escuro), sem borda. Em hover/focus, ganha `glow-primary` (ver Elevation) em vez de escurecer o fundo — reforça a metáfora "acende ao interagir".
- **Outline/Ghost:** fundo transparente, borda Borda (outline) ou nenhuma borda (ghost), texto Tinta. Usado pra ação secundária (ex: "Começar pausa" ao lado do primário "Começar foco").

### Chips (presets de duração)
- **Style:** full-pill (`{rounded.full}`), padding compacto (4px 10px), texto Label (0.75rem).
- **State:** não-selecionado = borda Borda + texto Neutro Texto; selecionado = borda Brasa + fundo Brasa a 10% de opacidade + texto Brasa. Nunca preenchimento sólido de Brasa num chip (reservado pro botão primário, pela Regra da Cor Rara).

### Cards / Containers
- **Corner Style:** 10px (`{rounded.lg}`).
- **Background:** Superfície sobre Fundo — a diferença é quase imperceptível no claro, o que é intencional (ver Elevation: separação vem da borda, nunca de sombra aqui).
- **Shadow Strategy:** nenhuma — cards ficam fora da exceção de brilho (ver Regra do Brilho acima).
- **Border:** 1px Borda.
- **Internal Padding:** escala padrão do Tailwind (sem token customizado), tipicamente `gap-4`–`gap-6` entre campos.

### Inputs / Fields
- **Style:** fundo transparente, borda Borda, 10px de raio.
- **Focus:** anel de foco (`ring-3 ring-ring/50`) + borda muda pra Brasa — sem brilho (ver Regra do Brilho).
- **Error:** borda e anel mudam pra Alerta.

### LampMotif (componente de assinatura)
O motivo central do produto (`src/components/motifs/LampMotif.tsx`): uma vela cujo pavio acende (Chama, com flicker sutil via `@keyframes flame-flicker`) durante o foco e apaga (Rescaldo, estático) na pausa. É o único lugar do sistema com animação contínua (as outras só têm transição de estado) e o único lugar com brilho formal (`glow-motif`). Ocioso, a chama fica baixa e na cor da fase que vem a seguir — um aceno discreto do que será o próximo passo.

## 6. Do's and Don'ts

### Do:
- **Do** usar Nunito em todo o produto, variando só o peso (400/600/700/800) pra hierarquia — nunca introduzir uma segunda família.
- **Do** manter Brasa restrita a um elemento de destaque por tela (Regra da Cor Rara).
- **Do** aplicar `font-variant-numeric: tabular-nums` em todo número que muda (contador, inputs de minuto) — nunca trocar de fonte só por causa disso.
- **Do** respeitar `prefers-reduced-motion` em toda animação, incluindo o flicker da chama (crossfade estático no lugar do flicker).

### Don't:
- **Don't** reintroduzir a paleta roxa fria do cuckoo.team original — "inspirado, não clonado" é uma decisão de marca já fechada.
- **Don't** usar gradiente decorativo, grid de cards idênticos, ou métrica gigante em destaque — clichês de SaaS corporativo que o produto rejeita explicitamente.
- **Don't** combinar borda de 1px com sombra difusa (box-shadow blur ≥16px) no mesmo elemento — o par "ghost card" (ver Regra do Brilho, Nunca da Sombra-Fantasma).
- **Don't** deixar a letra do contador mais apertada que -0.04em de letter-spacing, nem o tamanho passar de 6rem/96px — vira "gritando", não "bold".
- **Don't** usar `--flame`/`--flame-dim` em nada fora do `LampMotif` — são a cor do mascote, não um atalho de paleta geral.

**Risco aberto, não resolvido nesta passada:** o tom "Fundo" claro (`oklch(0.98 0.012 70)`, um quase-branco com leve calor) cai dentro da faixa que hoje lê como clichê de design gerado por IA (bg creme/sand/pergaminho quase-branco). A decisão de manter esse tom foi tomada antes desta sessão de design (ver `PRODUCT.md`/`CLAUDE.md`, decisão "totalmente aconchegante"); não foi revertida aqui porque está fora do escopo pedido (tipografia). Vale uma passada futura dedicada a isso — opção (a) uma cor de marca mais saturada como fundo, ou (c) um neutro mid-tone mais escuro — se o usuário quiser diferenciar ainda mais do padrão.
