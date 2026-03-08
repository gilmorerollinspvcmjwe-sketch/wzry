<template>
  <div class="gold-curve">
    <div class="curve-header">
      <h3>经济曲线</h3>
      <div class="legend">
        <div class="legend-item blue">
          <span class="legend-dot"></span>
          <span>蓝方</span>
        </div>
        <div class="legend-item red">
          <span class="legend-dot"></span>
          <span>红方</span>
        </div>
      </div>
    </div>

    <div class="curve-container" ref="chartRef">
      <svg class="curve-svg" :viewBox="`0 0 ${chartWidth} ${chartHeight}`">
        <defs>
          <linearGradient id="blueGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color: #3498db; stop-opacity: 0.3" />
            <stop offset="100%" style="stop-color: #3498db; stop-opacity: 0" />
          </linearGradient>
          <linearGradient id="redGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" style="stop-color: #e74c3c; stop-opacity: 0.3" />
            <stop offset="100%" style="stop-color: #e74c3c; stop-opacity: 0" />
          </linearGradient>
        </defs>

        <g class="grid-lines">
          <line
            v-for="i in gridLines"
            :key="'h' + i"
            :x1="padding.left"
            :y1="padding.top + (chartHeight - padding.top - padding.bottom) * (i / gridLines)"
            :x2="chartWidth - padding.right"
            :y2="padding.top + (chartHeight - padding.top - padding.bottom) * (i / gridLines)"
            class="grid-line"
          />
          <line
            v-for="minute in visibleMinutes"
            :key="'v' + minute"
            :x1="getXPosition(minute)"
            :y1="padding.top"
            :x2="getXPosition(minute)"
            :y2="chartHeight - padding.bottom"
            class="grid-line"
          />
        </g>

        <line
          class="zero-line"
          :x1="padding.left"
          :y1="getYPosition(0)"
          :x2="chartWidth - padding.right"
          :y2="getYPosition(0)"
        />

        <path
          v-if="blueAreaPath"
          :d="blueAreaPath"
          fill="url(#blueGradient)"
        />
        <path
          v-if="redAreaPath"
          :d="redAreaPath"
          fill="url(#redGradient)"
        />

        <path
          v-if="blueLinePath"
          :d="blueLinePath"
          class="curve-line blue"
          fill="none"
        />
        <path
          v-if="redLinePath"
          :d="redLinePath"
          class="curve-line red"
          fill="none"
        />

        <circle
          v-if="hoveredPoint"
          :cx="hoveredPoint.x"
          :cy="hoveredPoint.y"
          :r="6"
          :class="['hover-circle', hoveredPoint.team]"
        />

        <g class="x-axis-labels">
          <text
            v-for="minute in visibleMinutes"
            :key="minute"
            :x="getXPosition(minute)"
            :y="chartHeight - 10"
            class="axis-label"
            text-anchor="middle"
          >
            {{ minute }}分
          </text>
        </g>

        <g class="y-axis-labels">
          <text
            v-for="(value, i) in yAxisValues"
            :key="i"
            :x="padding.left - 10"
            :y="getYPosition(value) + 4"
            class="axis-label"
            text-anchor="end"
          >
            {{ formatGold(value) }}
          </text>
        </g>
      </svg>

      <div
        class="hover-overlay"
        @mousemove="handleMouseMove"
        @mouseleave="hoveredPoint = null"
      ></div>
    </div>

    <div v-if="hoveredData" class="hover-tooltip" :style="tooltipStyle">
      <div class="tooltip-time">{{ hoveredData.minute }} 分钟</div>
      <div class="tooltip-row blue">
        <span class="tooltip-label">蓝方经济</span>
        <span class="tooltip-value">{{ formatGold(hoveredData.blue) }}</span>
      </div>
      <div class="tooltip-row red">
        <span class="tooltip-label">红方经济</span>
        <span class="tooltip-value">{{ formatGold(hoveredData.red) }}</span>
      </div>
      <div class="tooltip-row diff">
        <span class="tooltip-label">经济差</span>
        <span :class="['tooltip-value', hoveredData.difference > 0 ? 'positive' : 'negative']">
          {{ hoveredData.difference > 0 ? '+' : '' }}{{ formatGold(hoveredData.difference) }}
        </span>
      </div>
    </div>

    <div class="curve-summary">
      <div class="summary-item">
        <span class="summary-label">最大经济差</span>
        <span :class="['summary-value', maxGoldDiff > 0 ? 'blue' : 'red']">
          {{ maxGoldDiff > 0 ? '+' : '' }}{{ formatGold(maxGoldDiff) }}
        </span>
      </div>
      <div class="summary-item">
        <span class="summary-label">平均经济差</span>
        <span :class="['summary-value', avgGoldDiff > 0 ? 'blue' : 'red']">
          {{ avgGoldDiff > 0 ? '+' : '' }}{{ formatGold(avgGoldDiff) }}
        </span>
      </div>
      <div class="summary-item">
        <span class="summary-label">领先时长</span>
        <span :class="['summary-value', blueLeadTime > 50 ? 'blue' : 'red']">
          蓝方 {{ blueLeadTime.toFixed(1) }}%
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { GoldCurve } from '@/types/matchVisualization';

const props = defineProps<{
  goldCurve: GoldCurve[];
}>();

const chartRef = ref<HTMLElement | null>(null);
const hoveredPoint = ref<{ x: number; y: number; team: 'blue' | 'red' } | null>(null);
const hoveredData = ref<GoldCurve | null>(null);
const tooltipStyle = ref<Record<string, string>>({});

const chartWidth = 400;
const chartHeight = 250;
const padding = { top: 20, right: 20, bottom: 40, left: 60 };
const gridLines = 5;

const maxGold = computed(() => {
  if (props.goldCurve.length === 0) return 50000;
  return Math.max(
    ...props.goldCurve.map(d => Math.max(d.blue, d.red))
  );
});

const minGold = computed(() => {
  if (props.goldCurve.length === 0) return 0;
  return Math.min(
    ...props.goldCurve.map(d => Math.min(d.blue, d.red))
  );
});

const goldRange = computed(() => maxGold.value - minGold.value);

const visibleMinutes = computed(() => {
  if (props.goldCurve.length === 0) return [];
  const maxMinute = Math.max(...props.goldCurve.map(d => d.minute));
  const step = Math.ceil(maxMinute / 10);
  const minutes = [];
  for (let i = 0; i <= maxMinute; i += step) {
    minutes.push(i);
  }
  return minutes;
});

const yAxisValues = computed(() => {
  const step = goldRange.value / gridLines;
  const values = [];
  for (let i = 0; i <= gridLines; i++) {
    values.push(Math.floor(minGold.value + step * (gridLines - i)));
  }
  return values;
});

function getXPosition(minute: number): number {
  if (props.goldCurve.length === 0) return padding.left;
  const maxMinute = Math.max(...props.goldCurve.map(d => d.minute));
  const chartAreaWidth = chartWidth - padding.left - padding.right;
  return padding.left + (minute / maxMinute) * chartAreaWidth;
}

function getYPosition(gold: number): number {
  const chartAreaHeight = chartHeight - padding.top - padding.bottom;
  const normalizedValue = (gold - minGold.value) / goldRange.value;
  return padding.top + chartAreaHeight * (1 - normalizedValue);
}

function formatGold(gold: number): string {
  if (Math.abs(gold) >= 10000) {
    return (gold / 10000).toFixed(1) + '万';
  }
  return gold.toLocaleString();
}

function createLinePath(team: 'blue' | 'red'): string {
  if (props.goldCurve.length === 0) return '';
  
  const points = props.goldCurve.map(d => ({
    x: getXPosition(d.minute),
    y: getYPosition(d[team]),
  }));
  
  return points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ');
}

function createAreaPath(team: 'blue' | 'red'): string {
  if (props.goldCurve.length === 0) return '';
  
  const linePath = createLinePath(team);
  const chartBottom = chartHeight - padding.bottom;
  const firstX = getXPosition(props.goldCurve[0].minute);
  const lastX = getXPosition(props.goldCurve[props.goldCurve.length - 1].minute);
  
  return `${linePath} L ${lastX} ${chartBottom} L ${firstX} ${chartBottom} Z`;
}

const blueLinePath = computed(() => createLinePath('blue'));
const redLinePath = computed(() => createLinePath('red'));
const blueAreaPath = computed(() => createAreaPath('blue'));
const redAreaPath = computed(() => createAreaPath('red'));

const maxGoldDiff = computed(() => {
  if (props.goldCurve.length === 0) return 0;
  return Math.max(...props.goldCurve.map(d => Math.abs(d.difference))) * 
    (props.goldCurve.reduce((max, d) => Math.abs(d.difference) > Math.abs(max.difference) ? d : max).difference > 0 ? 1 : -1);
});

const avgGoldDiff = computed(() => {
  if (props.goldCurve.length === 0) return 0;
  const sum = props.goldCurve.reduce((acc, d) => acc + d.difference, 0);
  return sum / props.goldCurve.length;
});

const blueLeadTime = computed(() => {
  if (props.goldCurve.length === 0) return 50;
  const blueLead = props.goldCurve.filter(d => d.difference > 0).length;
  return (blueLead / props.goldCurve.length) * 100;
});

function handleMouseMove(event: MouseEvent) {
  if (!chartRef.value || props.goldCurve.length === 0) return;
  
  const rect = chartRef.value.getBoundingClientRect();
  const x = event.clientX - rect.left;
  
  const maxMinute = Math.max(...props.goldCurve.map(d => d.minute));
  const chartAreaWidth = chartWidth - padding.left - padding.right;
  const minuteRatio = (x - padding.left) / chartAreaWidth;
  const minute = Math.round(minuteRatio * maxMinute);
  
  const data = props.goldCurve.find(d => d.minute === minute) || 
    props.goldCurve.reduce((prev, curr) => 
      Math.abs(curr.minute - minute) < Math.abs(prev.minute - minute) ? curr : prev
    );
  
  hoveredData.value = data;
  
  const blueY = getYPosition(data.blue);
  const redY = getYPosition(data.red);
  
  const isBlueCloser = Math.abs(event.clientY - rect.top - blueY) < Math.abs(event.clientY - rect.top - redY);
  
  hoveredPoint.value = {
    x: getXPosition(data.minute),
    y: isBlueCloser ? blueY : redY,
    team: isBlueCloser ? 'blue' : 'red',
  };
  
  const tooltipX = Math.min(x + 10, chartWidth - 150);
  const tooltipY = Math.min(Math.max(y => y, 10), chartHeight - 100);
  
  tooltipStyle.value = {
    left: `${tooltipX}px`,
    top: `${hoveredPoint.value.y - 60}px`,
  };
}

onMounted(() => {
  if (props.goldCurve.length > 0) {
    hoveredData.value = props.goldCurve[props.goldCurve.length - 1];
  }
});
</script>

<style scoped>
.gold-curve {
  background: white;
  border-radius: 12px;
  padding: 16px;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.curve-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.curve-header h3 {
  margin: 0;
  font-size: 16px;
  color: #333;
}

.legend {
  display: flex;
  gap: 16px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #666;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
}

.legend-item.blue .legend-dot {
  background: #3498db;
}

.legend-item.red .legend-dot {
  background: #e74c3c;
}

.curve-container {
  flex: 1;
  position: relative;
  min-height: 200px;
}

.curve-svg {
  width: 100%;
  height: 100%;
}

.grid-line {
  stroke: #f0f0f0;
  stroke-width: 1;
}

.zero-line {
  stroke: #999;
  stroke-width: 1;
  stroke-dasharray: 4, 4;
}

.curve-line {
  stroke-width: 2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.curve-line.blue {
  stroke: #3498db;
}

.curve-line.red {
  stroke: #e74c3c;
}

.hover-circle {
  stroke: white;
  stroke-width: 2;
}

.hover-circle.blue {
  fill: #3498db;
}

.hover-circle.red {
  fill: #e74c3c;
}

.axis-label {
  font-size: 10px;
  fill: #999;
}

.hover-overlay {
  position: absolute;
  inset: 0;
  cursor: crosshair;
}

.hover-tooltip {
  position: absolute;
  background: rgba(0, 0, 0, 0.85);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 11px;
  pointer-events: none;
  z-index: 10;
  min-width: 120px;
}

.tooltip-time {
  font-weight: bold;
  margin-bottom: 6px;
  padding-bottom: 4px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.tooltip-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 4px;
}

.tooltip-label {
  opacity: 0.8;
}

.tooltip-value {
  font-weight: bold;
}

.tooltip-row.blue .tooltip-value {
  color: #5dade2;
}

.tooltip-row.red .tooltip-value {
  color: #ec7063;
}

.tooltip-value.positive {
  color: #5dade2;
}

.tooltip-value.negative {
  color: #ec7063;
}

.curve-summary {
  display: flex;
  gap: 16px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #eee;
}

.summary-item {
  flex: 1;
  text-align: center;
}

.summary-label {
  display: block;
  font-size: 10px;
  color: #999;
  margin-bottom: 4px;
}

.summary-value {
  font-size: 14px;
  font-weight: bold;
  color: #333;
}

.summary-value.blue {
  color: #3498db;
}

.summary-value.red {
  color: #e74c3c;
}
</style>
