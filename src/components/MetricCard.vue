<script setup lang="ts">
import { computed } from 'vue'

type Trend = 'up' | 'down' | 'flat'

const props = withDefaults(
  defineProps<{
    label: string
    value: number
    unit?: string
    trend: Trend
    delta: number
    deltaIsGood: boolean
  }>(),
  {
    unit: '',
  },
)

const displayValue = computed(() => {
  const formatter = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: Number.isInteger(props.value) ? 0 : 1,
    maximumFractionDigits: Number.isInteger(props.value) ? 0 : 1,
  })
  return `${formatter.format(props.value)}${props.unit}`
})

const trendIcon = computed(() => {
  if (props.trend === 'up') return 'mdi-arrow-up-right'
  if (props.trend === 'down') return 'mdi-arrow-down-right'
  return 'mdi-arrow-right'
})

const trendClass = computed(() => {
  if (props.trend === 'flat') return 'neutral'
  return props.deltaIsGood ? 'good' : 'bad'
})

const deltaText = computed(() => {
  const sign = props.delta > 0 ? '+' : ''
  return `${sign}${props.delta.toFixed(1)}`
})
</script>

<template>
  <v-card class="metric-card pa-5" border>
    <p class="metric-label">{{ label }}</p>
    <p class="metric-value">{{ displayValue }}</p>
    <div class="metric-delta" :class="trendClass">
      <v-icon :icon="trendIcon" size="18" />
      <span>{{ deltaText }} vs prior day</span>
    </div>
  </v-card>
</template>

<style scoped>
.metric-card {
  background: #ffffff;
  border-color: #e2e6eb;
  min-height: 132px;
}

.metric-label {
  margin: 0;
  color: #5d6a75;
  font-size: 0.83rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}

.metric-value {
  margin: 0.6rem 0;
  color: #1b2733;
  font-size: 2rem;
  line-height: 1.1;
  font-weight: 800;
}

.metric-delta {
  display: inline-flex;
  align-items: center;
  gap: 0.3rem;
  font-size: 0.82rem;
  font-weight: 600;
}

.good {
  color: #2e7d32;
}

.bad {
  color: #d32f2f;
}

.neutral {
  color: #5d6a75;
}
</style>
