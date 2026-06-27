# P300 One-Shot Build Runbook — Operational Dashboard Case Study

**Purpose:** Build a complete, deployable P301 case study (operational dashboard) in as few
round-trips as possible. This is a single end-to-end spec. Hand the whole thing to Copilot
agent mode in stages, but each stage is large and self-contained to minimize back-and-forth.

**Pre-decided choices (so there's no discovery loop):**
- **Case study chosen:** P301 — Operational Dashboard (most reusable, leverages everything from P200).
- **Industry:** Healthcare — Clinical Operations. (Distinct enough from FastForward logistics
  that it won't look like a copy; rich enough to tell a story.)
- **User:** Clinical Operations Lead at a mid-size hospital, reviewing department health in the morning.
- **Stack:** Vue 3 + Vuetify 3 + Vite + TypeScript + Vue Router (same as P200). No Pinia/testing/eslint/prettier.
- **Design language:** Clean clinical — calm neutral base, one confident accent (deep medical teal
  #0F766E), semantic status (green healthy / amber watch / red critical). Inter for UI, mono for IDs.

> If you want a different industry, swap the BRIEF content in Stage 1 and the data in Stage 3.
> Everything else stays identical.

---

## STAGE 0 — Bootstrap (run by hand in terminal)

```bash
# Prereqs check
node --version && npm --version && git --version && gh --version

# Create project folder as a SIBLING of your other protogen repos
cd ~/Developer            # the folder that holds your other protogen repos
mkdir protogen-300s && cd protogen-300s
# Confirm sibling: `ls ..` should show protogen-300s alongside the others, NOT nested.

# Create the repo on GitHub (browser): New repo named protogen-300s, Private, NO README/.gitignore.
# Then save the BRIEF.md from Stage 1 into this folder, and:
git init
git add -A && git commit -m "Add project brief (clinical ops dashboard plan)"
git remote add origin https://github.com/<YOUR-ORG>/protogen-300s.git
git branch -M main
git push -u origin main
```

---

## STAGE 1 — BRIEF.md (save this to repo root, commit as first commit)

```markdown
# BRIEF.md — Mercy General: Clinical Operations Dashboard

## Summary
An internal dashboard for the Clinical Operations Lead at Mercy General, a mid-size hospital.
She reviews it each morning and in operations huddles to see how the hospital is running right
now: patient volume, bed occupancy, average wait times, and staffing coverage. It must answer,
at a glance: how busy are we, are we over capacity anywhere, how long are patients waiting, and
are we staffed for it. Audience: one senior clinical-ops leader under time pressure. Clarity
beats cleverness everywhere.

## Users & context
- Primary user: Clinical Operations Lead. Reviews on a laptop/large screen, mornings + huddles.
- Needs: fast triage ("anything critical?") plus a performance read for the team.
- Not for: deep analysis or EHR-level detail. One-screen operational read.

## Layout (top to bottom)
1. App bar: "Mercy General — Clinical Operations" + a department filter control.
2. KPI tile row (4 tiles): Patient Volume (today), Bed Occupancy %, Avg Wait Time (min),
   Staffing Coverage %. Each shows value + trend vs prior day (up/down + delta, semantic color).
3. Trend chart: Bed Occupancy % over the last ~14 days (line/area), filtered by scope.
4. Department performance: breakdown by department (ED, ICU, Med-Surg, Maternity, Pediatrics) —
   patient volume + occupancy % per dept, so strained departments are obvious.
5. Active alerts list: items needing attention (e.g. "ICU over capacity", "ED wait > 4h",
   "Med-Surg understaffed"), with department, type, severity (Critical/Watch/Normal).

## Interactions (required — the graded element)
- Department filter: selecting a department (or "All Departments") updates ALL panels
  (tiles, chart, department view, alerts). "All" shows hospital-wide aggregate.

## Data (mock, realistic, with a story)
- src/data/metrics.json. Realistic clinical numbers AND a subtle story:
  - 5 departments: ED, ICU, Med-Surg, Maternity, Pediatrics.
  - One department clearly strained: ICU running over capacity (occupancy >100%, rising),
    so filtering to it tells a story.
  - Hospital-wide occupancy creeps up over the recent few days (a visible upward trend).
  - Alerts concentrated in ICU + ED + recent days; mix of Critical/Watch/Normal (most lower).
  - Plausible magnitudes: volumes in dozens-to-hundreds/dept/day, occupancy 70-105%,
    waits 20-240 min, staffing 80-100%.
  - 14 daily periods, most recent last, dated labels.

## Tech
- Vue 3 + Vuetify 3, Vite, TypeScript, Vue Router. No Pinia/testing/jsx/eslint/prettier.
- Chart: vue-chartjs + Chart.js (or ApexCharts), kept simple.
- Deployed on Vercel. Local JSON, no backend.

## Components
- Custom reusable component: MetricCard, props: label, value, unit?, trend ('up'|'down'|'flat'),
  delta, deltaIsGood (drives good/bad color). Used for all 4 KPI tiles.

## Style
- Clean clinical: calm neutral base (#FFFFFF / #F7F8FA surfaces, #1B2733 text, #E2E6EB borders).
- One accent: deep medical teal #0F766E (active filter, primary action, key highlights).
- Semantic status: healthy #2E7D32 / watch #F9A825 / critical #D32F2F. Color = meaning.
- Strong hierarchy: big KPI values, clear section titles, quiet captions. Generous page margins,
  content in a centered max-width container, tiles in one filled row, chart + dept table side by
  side filling the row, alerts full width below.
- Inter for UI; mono (JetBrains Mono) for any IDs. Responsive (laptop + large screen).

## AI scaffolding
- This BRIEF.md + a /docs context note + descriptive commit history serve as the AI scaffolding.

## Definition of Done
- Live on Vercel; department filter drives all panels; data tells the ICU-strain story;
  MetricCard is a real reusable component; reads as a real clinical ops tool; password-gated.
```

---

## STAGE 2 — Scaffold + Vuetify + dashboard shell (one big Copilot increment)

> Paste this whole block to Copilot agent mode. Approve terminal commands as it asks.

```markdown
# P300 Stage 2 — Scaffold Vue+Vuetify and build the dashboard shell. Read BRIEF.md first.

## 1. Scaffold IN THE REPO ROOT
- Scaffold Vue 3 + Vite + TypeScript + Vue Router. Say NO to Pinia/testing/jsx/eslint/prettier.
- CRITICAL: scaffold into the CURRENT folder (repo root). If it nests into a subfolder, MOVE
  everything back to root and delete the empty subfolder. package.json/src/index.html must be at root.
- Delete any Vue starter cruft (HelloWorld/TheWelcome/WelcomeItem/starter icons).
- Commit: "Scaffold Vue project (Vite + TS + Vue Router)"

## 2. Add Vuetify 3
- Install Vuetify 3, set up the plugin in main.ts, import styles + MDI icons. Confirm app runs.
- Configure the theme per BRIEF: neutral base, teal #0F766E accent, semantic colors.
- Commit: "Add Vuetify 3 with clinical theme"

## 3. Build the dashboard shell + data + MetricCard + filter (full build, per BRIEF)
- Create src/data/metrics.json EXACTLY per the BRIEF's Data section: 5 departments, 14 daily
  periods, ICU strained/over-capacity, hospital-wide occupancy creeping up, alerts clustered in
  ICU+ED+recent days, realistic magnitudes. Numbers must be internally consistent (tiles derive from data).
- Create src/components/MetricCard.vue: typed props (label, value, unit?, trend, delta, deltaIsGood);
  computed displayValue (Intl.NumberFormat), trendIcon, trendClass; semantic good/bad colors.
  deltaIsGood semantics: occupancy UP = bad (over capacity), wait UP = bad, staffing UP = good,
  volume UP = neutral/good. Render all 4 KPI tiles via MetricCard with props.
- Build the full layout per BRIEF: app bar with title + department filter; KPI tile row (4-up,
  fills width, gutters); chart (Bed Occupancy 14-day) + Department table SIDE BY SIDE filling the
  row; Active Alerts table FULL WIDTH below. Content in a centered max-width container with
  generous page margins; header title left-aligned with content's left edge; filter right-aligned.
- Wire the department filter to drive ALL panels (tiles, chart, dept table, alerts), computing each
  department's own values AND its own day-over-day deltas (not a shared global delta). "All
  Departments" = hospital-wide aggregate. Verify each department gives DISTINCT tiles + chart.
- Style per BRIEF: clean clinical, semantic status badges (Critical/Watch/Normal), mono for any IDs,
  strong hierarchy, compact tables with clear column spacing.
- Set tab <title> to "Mercy General — Clinical Operations" and add a simple favicon (teal cross or
  "M" monogram) in public/, replacing the Vite default.

## Acceptance — done when:
- [ ] Scaffold at repo root (not nested); no starter cruft.
- [ ] metrics.json realistic with the ICU-strain story; 14 daily periods.
- [ ] MetricCard is a real reusable component; all 4 tiles use it; semantic delta colors correct.
- [ ] Department filter changes ALL panels AND deltas distinctly per department; "All" aggregates.
- [ ] Chart shows occupancy trend; dept table + chart side by side; alerts full width.
- [ ] Layout filled and aligned (centered container, header flush left, tiles fill row).
- [ ] Tab title + favicon set. npm run dev AND npm run build both pass clean.
- [ ] Commits made with descriptive messages.
```

---

## STAGE 3 — Password gate + deploy + scaffolding doc (one increment)

```markdown
# P300 Stage 3 — Password gate, AI-scaffolding doc, README/LICENSE.

## 1. Simple client-side password gate
- Add a centered (horizontal + vertical) access-code gate before the dashboard. In-memory state
  (NOT localStorage). ACCESS_CODE constant — set a real non-sensitive word (note in a code comment:
  client-side demo gate over mock data, not real auth; visible in bundle). Teal "Unlock" button.

## 2. AI scaffolding doc
- Create /docs/context.md: a short note describing the project, the user, the data model, and the
  key decisions (so the repo shows organized AI scaffolding beyond just BRIEF.md).

## 3. Root files
- README.md: project name, what it is, stack, live URL, how to run locally.
- LICENSE: internal/all-rights-reserved notice (NOT open source):
  "Copyright (c) 2026 [Your Name]. All rights reserved. Internal Protogen (Slalom) training project."

## Acceptance — done when:
- [ ] Centered password gate works; ACCESS_CODE is a real word (not a placeholder).
- [ ] /docs/context.md, README.md, LICENSE all present and in sensible locations.
- [ ] npm run build passes. Commit each: descriptive messages.
```

Then deploy by hand:
```bash
# Vercel: import the protogen-300s repo, framework auto-detected (Vite), deploy.
# After deploy, open the live URL and verify (see Stage 4).
```

---

## STAGE 4 — Final verification checklist (do this on the LIVE site, not localhost)

- [ ] Live URL loads; password gate unlocks with your code.
- [ ] Department filter changes ALL panels AND the deltas, distinctly per department (test ICU vs Maternity vs All).
- [ ] ICU shows the over-capacity story; chart shape differs per department.
- [ ] Layout is filled and aligned at full desktop width (no big empty voids; header flush with content).
- [ ] Tab title + favicon correct.
- [ ] On GitHub: BRIEF.md, README.md, LICENSE, /docs/context.md all in the repo; commit history descriptive.
- [ ] npm run build passed before final deploy.

When all checked → submit the live URL + GitHub repo via the Workday/Forms link. Done.

---

## Rubric mapping (why this passes)

- **Does it work?** Live + gated, department filter drives everything, build reflects the clinical
  industry/user from BRIEF.md. ✓ (Go-further: responsive + the alerts empty-states.)
- **Repo set up right?** BRIEF.md + /docs context + README + LICENSE in root, clean structure,
  descriptive multi-commit history. ✓ (Go-further: scaffolding shows real staged work.)
- **Looks right / shows thinking?** Clinical design language fits the industry, data tells a story,
  BRIEF.md reads as a plan that matches the build. ✓ (Go-further: intentional hierarchy + semantic color.)
