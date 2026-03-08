<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { useHomeVenueStore } from '@/stores/homeVenue';
import {
  upgradeFacility,
  upgradeAtmosphere,
  expandCapacity,
} from '@/core/services/homeVenueService';
import {
  FACILITY_TYPE_NAMES,
  ATMOSPHERE_ASPECT_NAMES,
  type FacilityType,
  type AtmosphereAspect,
} from '@/types/homeVenue';

const router = useRouter();
const clubStore = useClubStore();
const venueStore = useHomeVenueStore();

const activeTab = ref<'facilities' | 'atmosphere' | 'expansion'>('facilities');
const selectedFacility = ref<FacilityType | null>(null);
const selectedAtmosphere = ref<AtmosphereAspect | null>(null);
const targetLevel = ref(2);
const expansionSeats = ref(1000);

const clubId = computed(() => clubStore.currentClub?.id || '');
const venue = computed(() => venueStore.getVenue(clubId.value));
const clubFunds = computed(() => clubStore.currentClub?.funds || 0);

const facilityTypes: FacilityType[] = ['stands', 'vipArea', 'trainingRoom', 'mediaCenter', 'lockerRoom'];
const atmosphereAspects: AtmosphereAspect[] = ['lighting', 'sound', 'screen', 'fanZone'];

const calculateFacilityCost = (type: FacilityType, target: number): number => {
  if (!venue.value) return 0;
  const current = venue.value.facilities[type].level;
  if (target <= current) return 0;
  
  let cost = 0;
  for (let i = current + 1; i <= target; i++) {
    cost += 50 * i * i;
  }
  return cost;
};

const calculateAtmosphereCost = (aspect: AtmosphereAspect, target: number): number => {
  if (!venue.value) return 0;
  const current = venue.value.atmosphere[aspect].level;
  if (target <= current) return 0;
  
  let cost = 0;
  for (let i = current + 1; i <= target; i++) {
    cost += 30 * i * i;
  }
  return cost;
};

const calculateExpansionCost = (seats: number): number => {
  return Math.floor(seats * 0.5);
};

const handleUpgradeFacility = (type: FacilityType) => {
  selectedFacility.value = type;
  if (venue.value) {
    targetLevel.value = venue.value.facilities[type].level + 1;
  }
};

const handleUpgradeAtmosphere = (aspect: AtmosphereAspect) => {
  selectedAtmosphere.value = aspect;
  if (venue.value) {
    targetLevel.value = venue.value.atmosphere[aspect].level + 1;
  }
};

const confirmFacilityUpgrade = () => {
  if (!selectedFacility.value) return;
  
  const result = upgradeFacility(clubId.value, selectedFacility.value, targetLevel.value);
  if (result.success) {
    alert(result.message);
  } else {
    alert(result.message);
  }
  selectedFacility.value = null;
};

const confirmAtmosphereUpgrade = () => {
  if (!selectedAtmosphere.value) return;
  
  const result = upgradeAtmosphere(clubId.value, selectedAtmosphere.value, targetLevel.value);
  if (result.success) {
    alert(result.message);
  } else {
    alert(result.message);
  }
  selectedAtmosphere.value = null;
};

const confirmExpansion = () => {
  if (expansionSeats.value <= 0) {
    alert('请输入有效的座位数量');
    return;
  }
  
  const result = expandCapacity(clubId.value, expansionSeats.value);
  if (result.success) {
    alert(result.message);
    expansionSeats.value = 1000;
  } else {
    alert(result.message);
  }
};

const goBack = () => {
  router.push('/venue');
};

const getLevelColor = (level: number) => {
  if (level >= 8) return '#52c41a';
  if (level >= 5) return '#1890ff';
  if (level >= 3) return '#faad14';
  return '#ff4d4f';
};

const canAfford = (cost: number): boolean => {
  return clubFunds.value >= cost;
};
</script>

<template>
  <div class="construction-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h2 class="page-title">设施建设</h2>
      <div class="funds-display">
        资金: <span class="funds-value">{{ clubFunds.toLocaleString() }}万</span>
      </div>
    </div>

    <div v-if="venue" class="construction-content">
      <div class="tab-bar">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'facilities' }"
          @click="activeTab = 'facilities'"
        >
          设施升级
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'atmosphere' }"
          @click="activeTab = 'atmosphere'"
        >
          氛围升级
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'expansion' }"
          @click="activeTab = 'expansion'"
        >
          场馆扩建
        </button>
      </div>

      <div v-if="activeTab === 'facilities'" class="facilities-section">
        <div class="section-intro">
          升级设施可以提升场馆功能，增加比赛日收入和主场优势
        </div>
        
        <div
          v-for="type in facilityTypes"
          :key="type"
          class="upgrade-card"
        >
          <div class="upgrade-header">
            <div class="upgrade-info">
              <span class="upgrade-name">{{ FACILITY_TYPE_NAMES[type] }}</span>
              <span class="current-level" :style="{ color: getLevelColor(venue.facilities[type].level) }">
                当前等级: Lv.{{ venue.facilities[type].level }}
              </span>
            </div>
            <div class="upgrade-cost">
              升级费用: {{ calculateFacilityCost(type, venue.facilities[type].level + 1) }}万
            </div>
          </div>
          
          <div class="upgrade-details">
            <div class="detail-row">
              <span>状态: {{ venue.facilities[type].condition }}%</span>
              <span>维护费: {{ venue.facilities[type].maintenanceCost }}万/周</span>
            </div>
          </div>
          
          <div class="upgrade-actions">
            <button
              class="upgrade-btn"
              :class="{ disabled: venue.facilities[type].level >= 10 || !canAfford(calculateFacilityCost(type, venue.facilities[type].level + 1)) }"
              :disabled="venue.facilities[type].level >= 10"
              @click="handleUpgradeFacility(type)"
            >
              {{ venue.facilities[type].level >= 10 ? '已满级' : '升级' }}
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'atmosphere'" class="atmosphere-section">
        <div class="section-intro">
          升级氛围系统可以提升比赛体验，增加主场优势
        </div>
        
        <div
          v-for="aspect in atmosphereAspects"
          :key="aspect"
          class="upgrade-card"
        >
          <div class="upgrade-header">
            <div class="upgrade-info">
              <span class="upgrade-name">{{ ATMOSPHERE_ASPECT_NAMES[aspect] }}</span>
              <span class="current-level" :style="{ color: getLevelColor(venue.atmosphere[aspect].level) }">
                当前等级: Lv.{{ venue.atmosphere[aspect].level }}
              </span>
            </div>
            <div class="upgrade-cost">
              升级费用: {{ calculateAtmosphereCost(aspect, venue.atmosphere[aspect].level + 1) }}万
            </div>
          </div>
          
          <div class="upgrade-details">
            <div class="detail-row">
              <span>质量: {{ venue.atmosphere[aspect].quality }}%</span>
              <span>效果加成: +{{ venue.atmosphere[aspect].effect }}%</span>
            </div>
          </div>
          
          <div class="upgrade-actions">
            <button
              class="upgrade-btn"
              :class="{ disabled: venue.atmosphere[aspect].level >= 10 || !canAfford(calculateAtmosphereCost(aspect, venue.atmosphere[aspect].level + 1)) }"
              :disabled="venue.atmosphere[aspect].level >= 10"
              @click="handleUpgradeAtmosphere(aspect)"
            >
              {{ venue.atmosphere[aspect].level >= 10 ? '已满级' : '升级' }}
            </button>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'expansion'" class="expansion-section">
        <div class="section-intro">
          扩建场馆可以增加座位数量，提升比赛日门票收入
        </div>
        
        <div class="current-capacity">
          <div class="capacity-label">当前容量</div>
          <div class="capacity-value">{{ venue.capacity.toLocaleString() }}</div>
          <div class="capacity-max">最大容量: 50,000</div>
        </div>
        
        <div class="expansion-form">
          <div class="form-group">
            <label>新增座位数量</label>
            <input
              type="number"
              v-model.number="expansionSeats"
              min="100"
              max="10000"
              step="100"
              class="input-field"
            />
          </div>
          
          <div class="expansion-preview">
            <div class="preview-item">
              <span>扩建费用</span>
              <span class="preview-value">{{ calculateExpansionCost(expansionSeats) }}万</span>
            </div>
            <div class="preview-item">
              <span>扩建后容量</span>
              <span class="preview-value">{{ (venue.capacity + expansionSeats).toLocaleString() }}</span>
            </div>
          </div>
          
          <button
            class="expand-btn"
            :class="{ disabled: !canAfford(calculateExpansionCost(expansionSeats)) || venue.capacity + expansionSeats > 50000 }"
            :disabled="!canAfford(calculateExpansionCost(expansionSeats)) || venue.capacity + expansionSeats > 50000"
            @click="confirmExpansion"
          >
            确认扩建
          </button>
        </div>
      </div>
    </div>

    <div v-if="selectedFacility" class="modal-overlay" @click="selectedFacility = null">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>升级{{ FACILITY_TYPE_NAMES[selectedFacility] }}</h3>
          <button class="close-btn" @click="selectedFacility = null">×</button>
        </div>
        
        <div class="modal-body">
          <div class="level-selector">
            <label>目标等级</label>
            <div class="level-buttons">
              <button
                v-for="lvl in 10"
                :key="lvl"
                class="level-btn"
                :class="{ active: targetLevel === lvl, disabled: lvl <= venue!.facilities[selectedFacility].level }"
                :disabled="lvl <= venue!.facilities[selectedFacility].level"
                @click="targetLevel = lvl"
              >
                Lv.{{ lvl }}
              </button>
            </div>
          </div>
          
          <div class="cost-summary">
            <div class="summary-row">
              <span>当前等级</span>
              <span>Lv.{{ venue!.facilities[selectedFacility].level }}</span>
            </div>
            <div class="summary-row">
              <span>目标等级</span>
              <span>Lv.{{ targetLevel }}</span>
            </div>
            <div class="summary-row total">
              <span>总费用</span>
              <span>{{ calculateFacilityCost(selectedFacility, targetLevel) }}万</span>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="cancel-btn" @click="selectedFacility = null">取消</button>
          <button
            class="confirm-btn"
            :class="{ disabled: !canAfford(calculateFacilityCost(selectedFacility, targetLevel)) }"
            @click="confirmFacilityUpgrade"
          >
            确认升级
          </button>
        </div>
      </div>
    </div>

    <div v-if="selectedAtmosphere" class="modal-overlay" @click="selectedAtmosphere = null">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>升级{{ ATMOSPHERE_ASPECT_NAMES[selectedAtmosphere] }}</h3>
          <button class="close-btn" @click="selectedAtmosphere = null">×</button>
        </div>
        
        <div class="modal-body">
          <div class="level-selector">
            <label>目标等级</label>
            <div class="level-buttons">
              <button
                v-for="lvl in 10"
                :key="lvl"
                class="level-btn"
                :class="{ active: targetLevel === lvl, disabled: lvl <= venue!.atmosphere[selectedAtmosphere].level }"
                :disabled="lvl <= venue!.atmosphere[selectedAtmosphere].level"
                @click="targetLevel = lvl"
              >
                Lv.{{ lvl }}
              </button>
            </div>
          </div>
          
          <div class="cost-summary">
            <div class="summary-row">
              <span>当前等级</span>
              <span>Lv.{{ venue!.atmosphere[selectedAtmosphere].level }}</span>
            </div>
            <div class="summary-row">
              <span>目标等级</span>
              <span>Lv.{{ targetLevel }}</span>
            </div>
            <div class="summary-row total">
              <span>总费用</span>
              <span>{{ calculateAtmosphereCost(selectedAtmosphere, targetLevel) }}万</span>
            </div>
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="cancel-btn" @click="selectedAtmosphere = null">取消</button>
          <button
            class="confirm-btn"
            :class="{ disabled: !canAfford(calculateAtmosphereCost(selectedAtmosphere, targetLevel)) }"
            @click="confirmAtmosphereUpgrade"
          >
            确认升级
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.construction-page {
  padding: 15px;
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.back-btn {
  padding: 8px 12px;
  border: none;
  border-radius: 8px;
  background: #f5f5f5;
  color: #666;
  font-size: 14px;
  cursor: pointer;
}

.page-title {
  flex: 1;
  font-size: 20px;
  font-weight: bold;
  color: #333;
  margin: 0;
}

.funds-display {
  font-size: 14px;
  color: #666;
}

.funds-value {
  color: #52c41a;
  font-weight: bold;
}

.tab-bar {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.tab-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #f5f5f5;
  color: #666;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.tab-btn.active {
  background: #007bff;
  color: white;
}

.section-intro {
  background: #f9f9f9;
  padding: 12px;
  border-radius: 8px;
  font-size: 13px;
  color: #666;
  margin-bottom: 15px;
}

.upgrade-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 12px;
}

.upgrade-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.upgrade-name {
  display: block;
  font-size: 16px;
  font-weight: bold;
  color: #333;
  margin-bottom: 4px;
}

.current-level {
  font-size: 13px;
}

.upgrade-cost {
  font-size: 14px;
  color: #ff6b6b;
  font-weight: 500;
}

.upgrade-details {
  margin-bottom: 12px;
}

.detail-row {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #999;
}

.upgrade-actions {
  display: flex;
  justify-content: flex-end;
}

.upgrade-btn {
  padding: 10px 24px;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upgrade-btn.disabled {
  background: #ccc;
  cursor: not-allowed;
}

.current-capacity {
  background: white;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 15px;
}

.capacity-label {
  font-size: 14px;
  color: #999;
  margin-bottom: 8px;
}

.capacity-value {
  font-size: 36px;
  font-weight: bold;
  color: #333;
}

.capacity-max {
  font-size: 12px;
  color: #999;
  margin-top: 8px;
}

.expansion-form {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.input-field {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 16px;
  box-sizing: border-box;
}

.expansion-preview {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 20px;
}

.preview-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 8px;
}

.preview-item:last-child {
  margin-bottom: 0;
}

.preview-value {
  font-weight: bold;
  color: #333;
}

.expand-btn {
  width: 100%;
  padding: 14px;
  border: none;
  border-radius: 8px;
  background: #28a745;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.expand-btn.disabled {
  background: #ccc;
  cursor: not-allowed;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 1000;
}

@media (min-width: 768px) {
  .modal-overlay {
    align-items: center;
  }
}

.modal-content {
  background: white;
  border-radius: 20px 20px 0 0;
  width: 100%;
  max-width: 500px;
  max-height: 80vh;
  overflow-y: auto;
}

@media (min-width: 768px) {
  .modal-content {
    border-radius: 16px;
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #eee;
}

.modal-header h3 {
  margin: 0;
  font-size: 18px;
  color: #333;
}

.close-btn {
  background: #f5f5f5;
  border: none;
  font-size: 20px;
  color: #666;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
}

.modal-body {
  padding: 20px;
}

.level-selector {
  margin-bottom: 20px;
}

.level-selector label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 10px;
}

.level-buttons {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 8px;
}

.level-btn {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #333;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.level-btn.active {
  background: #007bff;
  color: white;
  border-color: #007bff;
}

.level-btn.disabled {
  background: #f5f5f5;
  color: #ccc;
  cursor: not-allowed;
}

.cost-summary {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 15px;
}

.summary-row {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  margin-bottom: 8px;
  color: #666;
}

.summary-row.total {
  padding-top: 8px;
  border-top: 1px solid #ddd;
  font-weight: bold;
  color: #333;
  margin-bottom: 0;
}

.modal-footer {
  display: flex;
  gap: 10px;
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 14px;
  border: none;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: #007bff;
  color: white;
}

.confirm-btn.disabled {
  background: #ccc;
  cursor: not-allowed;
}
</style>
