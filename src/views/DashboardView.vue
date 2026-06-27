<script setup lang="ts">
import { computed, ref } from 'vue'
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  Filler,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale,
  Tooltip,
  Legend,
  type ChartData,
  type ChartOptions,
} from 'chart.js'

import MetricCard from '../components/MetricCard.vue'
import metricsRaw from '../data/metrics.json'
import type {
  AggregateMetrics,
  AlertItem,
  DailyPeriod,
  Department,
  DepartmentDailyMetrics,
  DepartmentId,
  MetricsPayload,
  Severity,
} from '../types/metrics'

ChartJS.register(LineElement, LinearScale, PointElement, CategoryScale, Tooltip, Legend, Filler)

const metricsData = metricsRaw as MetricsPayload
const allValue = 'all'

type DepartmentFilter = DepartmentId | typeof allValue
type Trend = 'up' | 'down' | 'flat'

const selectedDepartment = ref<DepartmentFilter>(allValue)
const departments = computed<Department[]>(() => metricsData.departments)
const periods = computed<DailyPeriod[]>(() => metricsData.periods)
const alerts = computed<AlertItem[]>(() => metricsData.alerts)

const emptyAggregate: AggregateMetrics = {
  patientVolume: 0,
  occupancyPct: 0,
  avgWaitMinutes: 0,
  staffingCoveragePct: 0,
}

const roundToOne = (value: number): number => Math.round(value * 10) / 10

const selectedDepartmentIds = computed<DepartmentId[]>(() => {
  if (selectedDepartment.value === allValue) {
    return departments.value.map((dept) => dept.id)
  }
  return [selectedDepartment.value]
})

const aggregatePeriod = (
  departmentIds: DepartmentId[],
  departmentMetrics: Record<DepartmentId, DepartmentDailyMetrics>,
): AggregateMetrics => {
  const rows = departmentIds.map((deptId) => departmentMetrics[deptId])
  const totalVolume = rows.reduce((sum, row) => sum + row.patientVolume, 0)
  const safeVolume = totalVolume === 0 ? 1 : totalVolume

  const occupancyPct = rows.reduce((sum, row) => sum + row.occupancyPct * row.patientVolume, 0) / safeVolume
  const avgWaitMinutes = rows.reduce((sum, row) => sum + row.avgWaitMinutes * row.patientVolume, 0) / safeVolume
  const staffingCoveragePct = rows.reduce((sum, row) => sum + row.staffingCoveragePct, 0) / rows.length

  return {
    patientVolume: totalVolume,
    occupancyPct: roundToOne(occupancyPct),
    avgWaitMinutes: roundToOne(avgWaitMinutes),
    staffingCoveragePct: roundToOne(staffingCoveragePct),
  }
}

const filteredSeries = computed(() =>
  periods.value.map((period) => ({
    date: period.date,
    label: period.label,
    metrics: aggregatePeriod(selectedDepartmentIds.value, period.departments),
  })),
)

const currentMetrics = computed<AggregateMetrics>(() => {
  const latest = filteredSeries.value.at(-1)
  return latest?.metrics ?? emptyAggregate
})

const previousMetrics = computed<AggregateMetrics>(() => {
  const prior = filteredSeries.value.at(-2)
  return prior?.metrics ?? emptyAggregate
})

const metricCards = computed<
  Array<{
    label: string
    value: number
    unit: string
    trend: Trend
    delta: number
    deltaIsGood: boolean
  }>
>(() => {
  const current = currentMetrics.value
  const previous = previousMetrics.value

  const volumeDelta = roundToOne(current.patientVolume - previous.patientVolume)
  const occupancyDelta = roundToOne(current.occupancyPct - previous.occupancyPct)
  const waitDelta = roundToOne(current.avgWaitMinutes - previous.avgWaitMinutes)
  const staffingDelta = roundToOne(current.staffingCoveragePct - previous.staffingCoveragePct)

  return [
    {
      label: 'Patient Volume',
      value: current.patientVolume,
      unit: '',
      trend: volumeDelta === 0 ? 'flat' : volumeDelta > 0 ? 'up' : 'down',
      delta: volumeDelta,
      deltaIsGood: volumeDelta >= 0,
    },
    {
      label: 'Bed Occupancy',
      value: current.occupancyPct,
      unit: '%',
      trend: occupancyDelta === 0 ? 'flat' : occupancyDelta > 0 ? 'up' : 'down',
      delta: occupancyDelta,
      deltaIsGood: occupancyDelta <= 0,
    },
    {
      label: 'Avg Wait Time',
      value: current.avgWaitMinutes,
      unit: ' min',
      trend: waitDelta === 0 ? 'flat' : waitDelta > 0 ? 'up' : 'down',
      delta: waitDelta,
      deltaIsGood: waitDelta <= 0,
    },
    {
      label: 'Staffing Coverage',
      value: current.staffingCoveragePct,
      unit: '%',
      trend: staffingDelta === 0 ? 'flat' : staffingDelta > 0 ? 'up' : 'down',
      delta: staffingDelta,
      deltaIsGood: staffingDelta >= 0,
    },
  ]
})

const occupancyChartData = computed<ChartData<'line'>>(() => ({
  labels: filteredSeries.value.map((point) => point.label),
  datasets: [
    {
      label: 'Bed Occupancy %',
      data: filteredSeries.value.map((point) => point.metrics.occupancyPct),
      borderColor: '#0F766E',
      backgroundColor: 'rgba(15, 118, 110, 0.18)',
      fill: true,
      borderWidth: 2,
      tension: 0.3,
      pointRadius: 2,
      pointHoverRadius: 4,
    },
  ],
}))

const occupancyChartOptions: ChartOptions<'line'> = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      callbacks: {
        label: (ctx) => `${ctx.parsed.y}%`,
      },
    },
  },
  scales: {
    y: {
      grid: {
        color: '#E2E6EB',
      },
      ticks: {
        callback: (value) => `${value}%`,
      },
    },
    x: {
      grid: {
        display: false,
      },
    },
  },
}

const currentPeriod = computed(() => periods.value.at(-1))

const departmentRows = computed(() => {
  const latest = currentPeriod.value
  if (!latest) {
    return []
  }

  const scopedDepartments =
    selectedDepartment.value === allValue
      ? departments.value
      : departments.value.filter((department) => department.id === selectedDepartment.value)

  return scopedDepartments.map((department) => {
    const details = latest.departments[department.id]
    const severity: Severity =
      details.occupancyPct >= 100 ? 'Critical' : details.occupancyPct >= 90 ? 'Watch' : 'Normal'

    return {
      id: department.id,
      name: department.name,
      volume: details.patientVolume,
      occupancyPct: details.occupancyPct,
      severity,
    }
  })
})

const filteredAlerts = computed(() => {
  return alerts.value
    .filter((alert) => {
      if (selectedDepartment.value === allValue) {
        return true
      }
      return alert.departmentId === selectedDepartment.value
    })
    .sort((a, b) => (a.date < b.date ? 1 : -1))
})

const departmentName = (departmentId: DepartmentId): string => {
  return departments.value.find((department) => department.id === departmentId)?.name ?? departmentId
}

const severityColor = (severity: Severity): string => {
  if (severity === 'Critical') return 'error'
  if (severity === 'Watch') return 'warning'
  return 'success'
}

const departmentFilterItems = computed(() => [
  { title: 'All Departments', value: allValue },
  ...departments.value.map((department) => ({ title: department.name, value: department.id })),
])
</script>

<template>
  <div class="dashboard-wrapper">
    <header class="dashboard-header">
      <div class="shell header-content">
        <div class="header-left">
          <p class="eyebrow">Operational Dashboard</p>
          <h1 class="app-title">Mercy General - Clinical Operations</h1>
        </div>
        <v-select
          v-model="selectedDepartment"
          :items="departmentFilterItems"
          item-title="title"
          item-value="value"
          label="Department"
          density="comfortable"
          hide-details
          variant="outlined"
          class="department-select"
        />
      </div>
    </header>

    <main class="dashboard-main">
      <div class="shell">
        <section class="kpi-section">
          <div class="kpi-grid">
            <MetricCard
              v-for="card in metricCards"
              :key="card.label"
              :label="card.label"
              :value="card.value"
              :unit="card.unit"
              :trend="card.trend"
              :delta="card.delta"
              :delta-is-good="card.deltaIsGood"
              class="kpi-tile"
            />
          </div>
        </section>

        <section class="content-section">
          <div class="content-grid">
            <div class="chart-panel">
              <v-card class="panel-card pa-5" border>
                <div class="panel-heading">
                  <h2>Bed Occupancy Trend</h2>
                  <span>Last 14 days</span>
                </div>
                <div class="chart-wrap">
                  <Line :data="occupancyChartData" :options="occupancyChartOptions" />
                </div>
              </v-card>
            </div>

            <div class="table-panel">
              <v-card class="panel-card pa-5" border>
                <div class="panel-heading">
                  <h2>Department Performance</h2>
                  <span>Today</span>
                </div>
                <v-table density="compact" class="dept-table">
                  <thead>
                    <tr>
                      <th>Department</th>
                      <th class="text-right">Volume</th>
                      <th class="text-right">Occupancy</th>
                      <th class="text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="row in departmentRows" :key="row.id">
                      <td>{{ row.name }}</td>
                      <td class="text-right">{{ row.volume }}</td>
                      <td class="text-right">{{ row.occupancyPct.toFixed(1) }}%</td>
                      <td class="text-right">
                        <v-chip
                          :color="severityColor(row.severity)"
                          size="small"
                          variant="tonal"
                          label
                        >
                          {{ row.severity }}
                        </v-chip>
                      </td>
                    </tr>
                  </tbody>
                </v-table>
              </v-card>
            </div>
          </div>
        </section>

        <section class="alerts-section">
          <v-card class="panel-card pa-5" border>
            <div class="panel-heading">
              <h2>Active Alerts</h2>
              <span>{{ filteredAlerts.length }} items</span>
            </div>
            <div v-if="filteredAlerts.length === 0" class="empty-state">
              <p>No active alerts for this department.</p>
            </div>
            <v-table v-else density="compact" class="alerts-table">
              <thead>
                <tr>
                  <th>Alert ID</th>
                  <th>Date</th>
                  <th>Department</th>
                  <th>Type</th>
                  <th>Details</th>
                  <th class="text-right">Severity</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="alert in filteredAlerts" :key="alert.id">
                  <td><span class="id-chip">{{ alert.id }}</span></td>
                  <td>{{ alert.date }}</td>
                  <td>{{ departmentName(alert.departmentId) }}</td>
                  <td>{{ alert.type }}</td>
                  <td>{{ alert.message }}</td>
                  <td class="text-right">
                    <v-chip
                      :color="severityColor(alert.severity)"
                      size="small"
                      variant="tonal"
                      label
                    >
                      {{ alert.severity }}
                    </v-chip>
                  </td>
                </tr>
              </tbody>
            </v-table>
          </v-card>
        </section>
      </div>
    </main>
  </div>
</template>

<style scoped>
.dashboard-wrapper {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: #f7f8fa;
}

.dashboard-header {
  background: #ffffff;
  border-bottom: 1px solid #e2e6eb;
  position: sticky;
  top: 0;
  z-index: 10;
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  padding-bottom: 1rem;
  gap: 2rem;
}

.header-left {
  flex: 1;
  min-width: 0;
}

.eyebrow {
  margin: 0;
  font-size: 0.78rem;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: #48606f;
  font-weight: 700;
}

.app-title {
  margin: 0.35rem 0 0;
  color: #1b2733;
  font-size: clamp(1.2rem, 1.8vw, 1.7rem);
  font-weight: 800;
  line-height: 1.15;
}

.department-select {
  flex-shrink: 0;
  width: 260px;
  background: #ffffff;
  border-radius: 4px;
}

.department-select :deep(.v-field) {
  background: #ffffff;
  border: 1px solid #e2e6eb;
}

.department-select :deep(.v-field--focused) {
  border-color: #0c62fb;
  box-shadow: 0 0 0 3px rgba(12, 98, 251, 0.1);
}

.shell {
  max-width: 1280px;
  margin: 0 auto;
  padding-left: 2rem;
  padding-right: 2rem;
  width: 100%;
  box-sizing: border-box;
}

.dashboard-main {
  flex: 1;
  padding-top: 2rem;
  padding-bottom: 2rem;
}

.kpi-section {
  margin-bottom: 2rem;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem;
}

.kpi-tile {
  width: 100%;
}

.content-section {
  margin-bottom: 2rem;
}

.content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.chart-panel {
  width: 100%;
}

.table-panel {
  width: 100%;
}

.alerts-section {
  width: 100%;
}

.panel-card {
  background: #ffffff;
  border-color: #e2e6eb;
  width: 100%;
}

.panel-heading {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 1rem;
}

.panel-heading h2 {
  margin: 0;
  font-size: 1.02rem;
  color: #1b2733;
  font-weight: 700;
}

.panel-heading span {
  color: #5d6a75;
  font-size: 0.8rem;
  font-weight: 600;
}

.chart-wrap {
  height: 320px;
}

.dept-table th,
.alerts-table th {
  color: #4c616f;
  font-size: 0.74rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.id-chip {
  font-family: 'JetBrains Mono', monospace;
  font-size: 0.8rem;
  color: #0f766e;
  font-weight: 600;
}

.empty-state {
  padding: 2rem 1rem;
  text-align: center;
  color: #5d6a75;
  font-size: 0.95rem;
}

/* Tablet (768px - 1023px) */
@media (max-width: 1023px) {
  .shell {
    padding-left: 1.5rem;
    padding-right: 1.5rem;
  }

  .header-content {
    flex-direction: column;
    align-items: stretch;
    gap: 1rem;
  }

  .header-left {
    width: 100%;
  }

  .department-select {
    width: 100%;
  }

  .kpi-grid {
    grid-template-columns: repeat(2, 1fr);
  }

  .content-grid {
    grid-template-columns: 1fr;
  }

  .chart-wrap {
    height: 280px;
  }
}

/* Mobile (< 768px) */
@media (max-width: 767px) {
  .shell {
    padding-left: 1rem;
    padding-right: 1rem;
  }

  .dashboard-main {
    padding-top: 1rem;
    padding-bottom: 1rem;
  }

  .kpi-section {
    margin-bottom: 1.5rem;
  }

  .kpi-grid {
    grid-template-columns: 1fr;
    gap: 0.75rem;
  }

  .content-section {
    margin-bottom: 1.5rem;
  }

  .panel-heading {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.25rem;
  }

  .chart-wrap {
    height: 250px;
  }

  .eyebrow {
    font-size: 0.7rem;
  }

  .app-title {
    font-size: 1.2rem;
    margin-top: 0.25rem;
  }
}
</style>
