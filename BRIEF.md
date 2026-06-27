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
