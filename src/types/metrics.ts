export type DepartmentId = 'ed' | 'icu' | 'med_surg' | 'maternity' | 'pediatrics'

export type Severity = 'Critical' | 'Watch' | 'Normal'

export interface Department {
  id: DepartmentId
  name: string
}

export interface DepartmentDailyMetrics {
  patientVolume: number
  occupancyPct: number
  avgWaitMinutes: number
  staffingCoveragePct: number
}

export interface DailyPeriod {
  date: string
  label: string
  departments: Record<DepartmentId, DepartmentDailyMetrics>
}

export interface AlertItem {
  id: string
  date: string
  departmentId: DepartmentId
  type: string
  severity: Severity
  message: string
}

export interface MetricsPayload {
  departments: Department[]
  periods: DailyPeriod[]
  alerts: AlertItem[]
}

export interface AggregateMetrics {
  patientVolume: number
  occupancyPct: number
  avgWaitMinutes: number
  staffingCoveragePct: number
}
