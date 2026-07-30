# Handoff: UpSkill Agentic Design System case study (Part 2)

Working brief for creating the new case study page `projects/upskill-agentic-design-system.html` (Part 2) and writing its prose. No site changes have been made yet; this brief plus the approved plan at `/Users/facundorosales/.claude/plans/reactive-greeting-quasar.md` are the full input for the implementation session. This file is Claude-only and stays out of the repo.

Source repo: https://github.com/F4cu/upskill-design-system
Live showcase: https://f4cu.github.io/upskill-design-system/

**Required reading before drafting prose:** the five narrative source docs in the repo at `docs/case-study-source/`, written specifically as case study material. Read them in full (fetch from GitHub or clone the repo) and treat them as the primary source for facts and stories; this brief provides the structure, angle, and tone on top of them.

1. `01-token-pipeline-narrative.md` — code-as-source-of-truth reversal story (feeds Approach 5 and Solution)
2. `02-automation-vs-agents.md` — scripts vs agents vs subagents split, rejected parallel-swarm blueprint (feeds Approach 2 and 3)
3. `03-airtable-governance-flow.md` — bidirectional governance, ownership per column (feeds Solution: governance)
4. `04-benefits-by-audience.md` — benefits by maintainer/consumer/reviewer (feeds Impact)
5. `05-rejected-alternatives.md` — five rejected designs with plan-specific reasons (feeds Approach 3 and 4, honesty thread throughout)

Also worth pulling if more depth is needed: `docs/06-agentic-moments.md`, `docs/09-context-engineering.md`, and the ADRs cited in section 4.
Part 1 page (design foundations): `/projects/upskill-design-system.html`, retitled "UpSkill Design Foundations".

---

## 1. Positioning

**USP statement.** A product designer who engineers the system that makes AI output trustworthy and affordable: machine-readable components, measured evals, cost-aware agent architecture, and enforced governance, proven by one person operating a full multi-brand design system solo.

**Target reader.** Recruiters and hiring managers screening for design systems roles in 2026. Market research (job postings, Into Design Systems conference, Brad Frost, Nathan Curtis) shows four capabilities are rare and actively hired for, and this repo demonstrates all four:

1. Machine-readable components-as-data (Curtis's 2026 thesis; Indeed's JSON metadata case study)
2. Eval discipline applied to design tooling (Spotify's MCP eval framework is the cited frontier)
3. LLM token-economy awareness (Indeed: 80% token cost reduction made conference headlines)
4. Governance automation for AI-generated output (named in job postings, almost never demonstrated)

Multi-brand architecture is a fifth sought-after experience and gets its own Approach subsection.

Commodity skills (do not pitch these as differentiators, use as supporting texture only): Figma variables, tokens in general, Storybook, dark mode, Airtable, CLI tooling.

**Role label.** Senior Product Designer, matching the other case studies. The narrative voice is design-led; the engineering depth reads as a differentiator on top, not as the identity.

**Angle.** "AI-ready design system, honestly engineered." The problem is the market's own: AI can generate UI, but without a machine-readable, governed system it fabricates token names, drifts off-brand, and burns money. The solo/consumer-budget constraint is the proof of leverage, not the headline.

---

## 2. Tone of voice

Match the existing case studies (Awin, Patagonia, UpSkill Part 1). Observed style:

- Plain declarative sentences. First person light: "I built", "I adopted", "I explored", roughly once or twice per paragraph, not every sentence.
- Bold sparingly, on system nouns the reader should retain: "<strong>semantic spacing system</strong>", "<strong>modular ratios</strong>".
- Concrete over abstract: name the exact mechanism ("a CI gate rejects the pull request") instead of the quality ("robust quality enforcement").
- Paragraphs of 3 to 5 sentences. Subsections open with the decision or the problem, then the mechanism, then what it buys.
- H4 "Objectives" and "Key decisions" lists with 3 to 4 bullets are an established pattern; reuse them.

Hard rules:
- **No em dashes.** Use commas, colons, or split the sentence. (Part 1 currently contains a few; do not imitate them.)
- **No claudisms:** never "delve", "seamless", "robust", "leverage" (verb), "empower", "streamline", "elevate", "crucial", "comprehensive", "holistic".
- No "not just X but Y", "more than a component library", or similar rhetorical constructions.
- No hype adjectives before nouns ("powerful pipeline", "cutting-edge agents"). Let the numbers carry the weight.
- Write "AI" plainly; avoid "GenAI", "AI-powered", "supercharged".

---

## 3. Narrative outline (mapped to the 7-section template)

### Intro (lead paragraph, ~40 to 60 words like other pages)

Message: this is the second chapter of UpSkill. Part 1 designed the foundations; this part turns them into a working system in code where AI agents operate under the same governance as everything else. One sentence on what it is, one on what makes it different (machine-readable, governed, cost-aware).

In-page metadata: Role "Senior Product Designer", Main Goal "Agentic design system". The scaffold includes the link to Part 1 here.

### Challenge: "Trustworthy AI output at solo scale" (~200-300 words + Objectives list)

Two intertwined problems:
1. The industry problem: LLMs generating UI without a machine-readable system fabricate token names, drift from brand, and lose context between sessions. A design system only constrains AI output if the AI can actually read it.
2. The personal constraint: one person must maintain the whole system (tokens, 27 components, docs, governance) on a consumer AI plan with a shared usage window, so every agent workflow competes for the same budget. No team, no API invoices to hide behind.

Objectives bullets (suggested):
- Make every part of the system readable by machines as well as people
- Keep AI involvement governed: agents propose, checks and humans decide
- Fit all automation inside a fixed, shared LLM usage budget
- Support two brands, two themes, and three breakpoints from one token source

### Approach: "Five decisions that shaped the system" (5 H3 subsections, ~150-250 words each)

**1. Machine-readable by contract.** Every component ships a JSON metadata file validated against a JSON Schema in CI, alongside its code, styles, and stories. A layout grammar maps structural levels (Page, Header, Section, Container, Column, Component, Footer) one-to-one to HTML landmarks and is validated deterministically by script. Evidence to cite: the Indeed benchmark (1,056 prompts, 8 MCP configs) found JSON metadata cuts LLM token cost ~80% versus Markdown with equal or better accuracy; this study is the documented reason the metadata is JSON, not prose. This aligns with the "components as data" direction the design systems field is moving toward.

**2. Nine agentic moments, not an agent mesh.** Rejected the always-on multi-agent pattern. AI runs only as nine developer-triggered "moments" (component scaffold, token deprecation pass, Figma variable audit, layout generation, docs sync, adversarial review, learning extraction, etc.). Exactly two subagents exist, and the reviewer is read-only by tool grant, not by instruction: it literally has no write tools, so "reviewer reports, never fixes" is enforced at the permission layer. Reviews route findings back into component metadata and token conventions via an extract-learnings step, so the system improves from its own review history.

**3. Context economics as an architecture constraint.** The system runs on a seat-based consumer plan where all agents share one rolling usage window, so context is treated like a budget. Agents never call Airtable, Figma, or GitHub live; scripts freeze external state into committed JSON snapshots that agents read instead (reproducible, rate-limit-proof, small context). The always-loaded instruction file is capped at 200 lines by a CI gate after it once grew to 289 lines and instruction-following degraded. Instructions load through a five-rung ladder from always-on rules to on-demand snapshots. A costed proposal for a parallel agent swarm was evaluated and rejected because parallelism multiplies usage-window drain without improving outcomes at this scale.

**4. Measured, not assumed.** Before feeding cross-component pattern data into generation tasks, a purpose-built harness tested whether it actually helps, with the honest-outcome rule pre-registered in the results file: if it does not help, say so and do not ship it. Result: pattern context roughly halved violations in layout tasks but made component scaffolds worse (11 to 17 violations), so it ships only where it helps. Accessibility works the same way: a manual audit found 12 failing contrast pairs in light theme and 6 in dark, which led to token-level contrast math in CI; waiver ledgers are only allowed to shrink and the a11y backlog is now empty.

**5. Multi-brand from one source.** Four ordered token layers (primitives, brand, theme, device), each referencing only the layer before it. Two brands (UpSkill and Horizon) and two themes switch at runtime via `data-brand` and `data-theme` attributes; three breakpoints come from the device layer. A single Style Dictionary build is the only bridge between token source and consumers: components never import raw JSON, only generated CSS custom properties, so brand and theme swapping cannot be bypassed. Note the reversal story: Figma as source of truth failed on plan limits (Variables REST API is Enterprise-only), so code became the source of truth and Figma the downstream mirror, recorded as a superseded ADR rather than rewritten history.

### Solution: "One governed pipeline from token to component" (~3 H3 subsections, ~150-250 words each)

**The verified component loop.** Walk through /add-component end to end: a sensing script snapshots current state, the main session scaffolds from schema plus Figma context, deterministic gates check metadata, types, build, and accessibility, a human approves a visual checkpoint, a fresh read-only subagent reviews adversarially, and only then a PR. AI does the labor, scripts and humans hold the gates.

**Governance without meetings.** Airtable is the governance surface, but ownership is per column: token status and deprecation are human-authored in Airtable and pulled to code; component maturity is code-owned and pushed; terminal pipeline states set by a human are never overwritten (the sync script checks before writing, the "don't downgrade done" guard). Deprecation state is mirrored into the token source itself so the committed code, not Airtable, is the durable record. Twenty ADRs, some amended or superseded in the open, apply the same rule to decisions: no process silently overwrites another's record.

**Everything observable.** The live showcase (GitHub Pages) includes a pipeline health dashboard rendering the whole system as a DAG, built from the same frozen snapshots, with real generated pages (Homepage, Course Overview, User Settings) proving the components compose. Storybook documents every component and token set with brand and theme toolbars. CTAs here: live showcase, GitHub repo, Storybook if deployed.

### Impact: "A team-scale system, one maintainer" (~100-150 words)

Verifiable numbers, let them carry it:
- 27 production components and 2 hooks, each with schema-validated metadata, stories, and a11y coverage
- 2 brands x 2 themes x 3 breakpoints rendered from one token source
- 20 ADRs recording every reversal and amendment in the open
- 54/54 screenshot baselines passing at 0.000% diff after the latest refactor
- Accessibility backlog: empty; contrast checked mathematically in CI over built CSS
- Pattern harness: 13% violation reduction overall, shipped only for the task types where it measured positive
- Instruction file CI-capped at 200 lines; all automation inside one consumer-plan usage window

Close with one sentence on what this proves: governance, quality, and multi-brand consistency do not require a systems team when the system itself is machine-readable and self-checking.

### Result / Screens

Showcase pages and dashboard screenshots (see image list below).

---

## 4. Evidence inventory (claim -> source in the repo)

| Claim | Source |
|---|---|
| JSON metadata per component, schema-validated in CI | `packages/components/component.schema.json`, `components-check.yml`, ADR-001 |
| Indeed study as rationale for JSON metadata | ADR/docs citing Diana Wolosin, "Into Design Systems 2025" |
| Layout grammar with deterministic validation | ADR-011, `scripts/validate-layout.js`, `docs/04-layout-grammar.md` |
| Nine agentic moments, no schedulers | `CLAUDE.md`, `docs/06-agentic-moments.md`, `.claude/commands/` |
| Reviewer read-only by tool grant | `.claude/agents/adversarial-reviewer.md` |
| Self-improvement via extract-learnings | `/extract-learnings` command, `docs/06-agentic-moments.md` |
| Frozen-memory snapshots, no live API calls in agents/CI | `CLAUDE.md`, snapshot JSONs in `packages/tokens/` and `.claude/` |
| CLAUDE.md 200-line CI budget after 289-line failure | ADR-017, `scripts/claude-md-check.js`, `docs/09-context-engineering.md` |
| Five-rung progressive disclosure ladder | `docs/09-context-engineering.md` |
| Costed rejection of parallel agent swarm | `docs/case-study-source/05-rejected-alternatives.md`, `docs/strategy/ai-capability-assessment.md` |
| Pattern harness pre-registered honest outcome, 32->28 | `scripts/pattern-accuracy-harness/results.md`, ADR-013 |
| Pattern context excluded from component scaffolds (11->17) | ADR-013 amendment, harness results |
| 12+6 failing contrast pairs found, token-level contrast math added | issue #20, `scripts/token-contrast-check.js`, `docs/03-accessibility.md` |
| Waiver ledgers only shrink, a11y backlog empty | `a11y-backlog.json`, `token-contrast-waivers.json`, `docs/03-accessibility.md` |
| Four-layer token model, runtime data-brand/data-theme | `packages/tokens/src/`, ADR-002 + amendments, ADR on brand layer |
| Style Dictionary build as sole bridge | `packages/tokens/build.js`, `CLAUDE.md` |
| Figma source-of-truth reversal on plan limits | ADR-002 supersession, `docs/01-token-pipeline.md` |
| Verified /add-component loop | ADR-007, `docs/06-agentic-moments.md` |
| Airtable ownership per column, "don't downgrade done" | ADR-010, `scripts/airtable-sync.js`, `docs/05-governance.md` |
| Deprecation mirrored into DTCG `$deprecated` | `scripts/token-deprecation-mirror.js` (since 2026-07-13) |
| 27 components + 2 hooks, frozen set, three-question test | ADR-009, `docs/02-component-lifecycle.md` |
| 54/54 screenshot pass at 0.000% diff | ADR-020, ADR-019, `packages/components/screenshots/` |
| Pipeline dashboard from frozen snapshots | `apps/showcase` `/dashboard`, `/pipeline` |
| 20 ADRs with amend/supersede discipline | `docs/decisions/` |

---

## 5. Image plan (placeholder names wired into the scaffold)

All slots use the site convention: `data-src-light` / `data-src-dark` on `img.theme-image`, inside `figure.p-4.bg-neutral-300.dark:bg-neutral-800`. Add `lightbox-trigger cursor-zoom-in` classes for zoomable detail shots. Files go in `/images/`.

| Placeholder file | What to capture | Slot |
|---|---|---|
| `upskill-agentic-hero.png` | Pipeline DAG from the live showcase `/pipeline` page (the strongest single image: the whole system at a glance) | Intro hero |
| `upskill-agentic-tokens-layers.png` | Diagram of the four token layers with the Style Dictionary build as the single bridge (draw this one; a simple boxes-and-arrows diagram in site style) | Approach bento, large left |
| `upskill-agentic-brand-switch.png` | Same showcase screen side by side in UpSkill and Horizon brands (and/or light vs dark) to show runtime switching | Approach bento, large left |
| `upskill-agentic-metadata.png` | A component's metadata JSON beside the rendered component in Storybook | Approach bento, small right |
| `upskill-agentic-moments.png` | The nine agentic moments, e.g. the showcase dashboard's moment list or a cropped commands directory view | Approach bento, small right |
| `upskill-agentic-airtable.png` | Airtable governance table showing the human vs code owned columns | Approach bento, small right |
| `upskill-agentic-ci.png` | A PR with the token-diff bot comment and green CI gates | Approach bento, small right |
| `upskill-agentic-harness.png` | Eval harness results (results.md or a chart of 32 vs 28 violations by task type) | Solution area or bento |
| `upskill-agentic-dashboard.png` | Pipeline health dashboard full view | Result, full width |
| `upskill-agentic-showcase-screens.png` | Generated showcase pages (Homepage, Course Overview, User Settings) across breakpoints | Result, half width |
| `upskill-agentic-storybook.png` | Storybook with brand/theme toolbar visible on a component | Result, half width |

Screenshot sources: live showcase at https://f4cu.github.io/upskill-design-system/, local Storybook (`npm run storybook` in the repo; there is a `run-storybook` skill with a headless screenshot driver), Airtable base, a real GitHub PR.

---

## 6. Links to include in the page

- Part 1: `/projects/upskill-design-system.html` ("UpSkill Design Foundations"), linked from the intro (already scaffolded)
- Live showcase: https://f4cu.github.io/upskill-design-system/ (CTA in Solution)
- GitHub repo: https://github.com/F4cu/upskill-design-system (CTA in Solution)
- Existing Figma preview page `/projects/upskill-preview.html` stays linked from Part 1 only

## 7. Checklist for the implementation session

Site changes (none done yet; details in the approved plan file):

- [x] Create `projects/upskill-agentic-design-system.html` by copying the template structure from `projects/upskill-design-system.html` (same head/GA/theme setup, header, mobile nav, footer, More Projects grid with Patagonia/Awin/Data Viz cards). Sections per the outline in section 3, image slots per section 5, `[placeholder]` copy where prose is pending. Include the Part 1 link in the intro and showcase/GitHub CTAs in Solution.
- [x] Retitle Part 1 (`projects/upskill-design-system.html`): `<title>` and H1 to "UpSkill Design Foundations", adjust lead paragraph to the foundations/theming scope, add a short "Part 1 of 2, read Part 2" link near the intro. Content otherwise untouched.
- [x] `vite.config.js`: add `upskillAgentic: './projects/upskill-agentic-design-system.html'` to `rollupOptions.input`.
- [x] `index.html` UpSkill card (lines ~217-248): point link to the new Part 2 page, title "UpSkill Agentic Design System", refresh description/tags (e.g. Agentic, Machine readable, AI infrastructure). Keep the "Upcoming" label until prose is done.
- [x] Update UpSkill references on other pages to point to Part 2 with the new title: mobile-nav entries and More Projects cards in `awin-design-system.html` (~lines 127, 525), `data-visualization-guide.html` (~123, 475), `patagonia-ai-agent.html` (~123, 1207). Ignore the "* copy.html" backup files.
- [x] Save a memory (already existed: case-study-writing-style.md): user's writing-style preference (match existing case-study voice, no em dashes, no claudisms).

Writing and publishing:

- [x] Write the prose per sections 2 and 3, replacing every `[placeholder]`
- [ ] Capture/create the images in section 5 and drop them in `/images/`
- [x] Re-read against the tone rules in section 2 (especially: no em dashes)
- [x] Verify: `npm run build` passes with the new entry; check homepage card, Part 1/Part 2 cross-links, mobile nav, theme toggle on the new page
- [ ] When ready to publish: in `index.html`, replace the `<p class="text-neutral-500">Upcoming</p>` under the UpSkill card with a "To Case Study" CTA link like the other cards
