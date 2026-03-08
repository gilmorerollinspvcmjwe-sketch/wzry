<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { useYouthAcademyStore } from '@/stores/youthAcademy';
import { upgradeFacility } from '@/core/services/youthAcademyService';
import type { YouthFacility } from '@/types/youthAcademy';
import { FACILITY_NAMES, FACILITY_LEVELS } from '@/types/youthAcademy';

const router = useRouter();
const clubStore = useClubStore();
const academyStore = useYouthAcademyStore();

const selectedFacility = ref<keyof YouthFacility | null>(null);
const showUpgradeConfirm = ref(false);

const clubId = computed(() => clubStore.currentClub?.id || '');
const club = computed(() => clubStore.currentClub);
const academy = computed(() => academyStore.getAcademy(clubId.value));
const facilities = computed(() => academyStore.getFacilities(clubId.value));

const facilityDescriptions: Record<keyof YouthFacility, { icon: string; desc: string; benefits: string[] }> = {
  trainingGround: {
    icon: '🏟️',
    desc: '提供专业的训练场地，提升球员训练效率',
    benefits: ['训练速度提升', '属性成长加速', '减少受伤风险'],
  },
  dormitory: {
    icon: '🏠',
    desc: '为青训球员提供舒适的住宿环境',
    benefits: ['体力恢复加速', '士气提升', '幸福度增加'],
  },
  medicalCenter: {
    icon: '🏥',
    desc: '专业的医疗设施，保障球员健康',
    benefits: ['受伤恢复加速', '预防伤病', '体能监测'],
  },
  analysisRoom: {
    icon: '📊',
    desc: '数据分析设施，帮助球员提升意识',
    benefits: ['意识成长加速', '战术理解提升', '比赛分析'],
  },
};

const getFacilityLevelInfo = (level: number) => {
  return FACILITY_LEVELS.find(l => l.level === level) || FACILITY_LEVELS[0]!;
};

const getUpgradeCost = (currentLevel: number) => {
  const nextLevel = FACILITY_LEVELS.find(l => l.level === currentLevel + 1);
  return nextLevel?.upgradeCost || 0;
};

const canUpgrade = (facility: keyof YouthFacility) => {
  const currentLevel = facilities.value[facility];
  return currentLevel < 5 && club.value && club.value.funds >= getUpgradeCost(currentLevel);
};

const openUpgradeConfirm = (facility: keyof YouthFacility) => {
  if (!canUpgrade(facility)) return;
  selectedFacility.value = facility;
  showUpgradeConfirm.value = true;
};

const confirmUpgrade = () => {
  if (!selectedFacility.value) return;
  
  const currentLevel = facilities.value[selectedFacility.value];
  const result = upgradeFacility(clubId.value, selectedFacility.value, currentLevel + 1);
  
  if (result.success) {
    alert(result.message);
  } else {
    alert(result.message);
  }
  
  showUpgradeConfirm.value = false;
  selectedFacility.value = null;
};

const goBack = () => {
  router.push('/youth');
};
</script>

<template>
  <div class="facilities-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">←</button>
      <h2 class="page-title">设施管理</h2>
      <div class="header-spacer"></div>
    </div>
    
    <div class="summary-bar">
      <div class="summary-item">
        <span class="summary-label">俱乐部资金</span>
        <span class="summary-value">{{ club?.funds || 0 }}万</span>
      </div>
      <div class="summary-item">
        <span class="summary-label">平均等级</span>
        <span class="summary-value">
          {{ ((facilities.trainingGround + facilities.dormitory + facilities.medicalCenter + facilities.analysisRoom) / 4).toFixed(1) }}
        </span>
      </div>
    </div>
    
    <div class="facilities-list">
      <div 
        v-for="(level, facility) in facilities" 
        :key="facility"
        class="facility-card"
      >
        <div class="facility-header">
          <span class="facility-icon">{{ facilityDescriptions[facility as keyof YouthFacility].icon }}</span>
          <div class="facility-title">
            <h3>{{ FACILITY_NAMES[facility as keyof YouthFacility] }}</h3>
            <span class="facility-level">Lv.{{ level }}</span>
          </div>
        </div>
        
        <p class="facility-desc">{{ facilityDescriptions[facility as keyof YouthFacility].desc }}</p>
        
        <div class="level-display">
          <div class="level-dots">
            <span 
              v-for="i in 5" 
              :key="i" 
              class="level-dot"
              :class="{ active: i <= level, current: i === level }"
            ></span>
          </div>
          <span class="level-name">{{ getFacilityLevelInfo(level).name }}</span>
        </div>
        
        <div class="benefits-section">
          <h4>设施效果</h4>
          <ul class="benefits-list">
            <li v-for="(benefit, idx) in facilityDescriptions[facility as keyof YouthFacility].benefits" :key="idx">
              {{ benefit }}
            </li>
          </ul>
          <div v-if="level > 1" class="current-bonus">
            <span class="bonus-label">当前加成:</span>
            <span class="bonus-value">
              +{{ getFacilityLevelInfo(level).benefits[0]?.value || 0 }}% 训练速度
            </span>
          </div>
        </div>
        
        <div class="upgrade-section" v-if="level < 5">
          <div class="upgrade-info">
            <div class="upgrade-cost">
              <span class="cost-label">升级费用</span>
              <span class="cost-value">{{ getUpgradeCost(level) }}万</span>
            </div>
            <div class="upgrade-benefit">
              <span class="benefit-label">下一级加成</span>
              <span class="benefit-value">+{{ getFacilityLevelInfo(level + 1).benefits[0]?.value || 0 }}% 训练速度</span>
            </div>
          </div>
          <button 
            class="upgrade-btn"
            :class="{ disabled: !canUpgrade(facility as keyof YouthFacility) }"
            @click="openUpgradeConfirm(facility as keyof YouthFacility)"
          >
            {{ canUpgrade(facility as keyof YouthFacility) ? '升级' : '资金不足' }}
          </button>
        </div>
        <div v-else class="max-level">
          <span class="max-badge">已满级</span>
          <span class="max-text">设施已达到最高等级</span>
        </div>
      </div>
    </div>
    
    <div class="tips-section">
      <h3>💡 升级建议</h3>
      <ul>
        <li>训练场是最重要的设施，优先升级可大幅提升训练效率</li>
        <li>医疗中心可减少球员受伤风险，保障球员健康</li>
        <li>宿舍影响球员恢复速度和士气，间接影响训练效果</li>
        <li>分析室对意识类属性成长有显著加成</li>
      </ul>
    </div>
    
    <div v-if="showUpgradeConfirm && selectedFacility" class="modal-overlay" @click="showUpgradeConfirm = false">
      <div class="confirm-modal" @click.stop>
        <h3>确认升级</h3>
        <div class="confirm-content">
          <p>确定要升级 <strong>{{ FACILITY_NAMES[selectedFacility] }}</strong> 吗？</p>
          <div class="upgrade-preview">
            <div class="preview-row">
              <span class="preview-label">当前等级</span>
              <span class="preview-value">Lv.{{ facilities[selectedFacility] }}</span>
            </div>
            <div class="preview-row">
              <span class="preview-label">升级后等级</span>
              <span class="preview-value highlight">Lv.{{ facilities[selectedFacility] + 1 }}</span>
            </div>
            <div class="preview-row">
              <span class="preview-label">升级费用</span>
              <span class="preview-value cost">{{ getUpgradeCost(facilities[selectedFacility]) }}万</span>
            </div>
            <div class="preview-row">
              <span class="preview-label">新增加成</span>
              <span class="preview-value bonus">
                +{{ getFacilityLevelInfo(facilities[selectedFacility] + 1).benefits[0]?.value || 0 }}% 训练速度
              </span>
            </div>
          </div>
        </div>
        <div class="confirm-actions">
          <button class="cancel-btn" @click="showUpgradeConfirm = false">取消</button>
          <button class="confirm-btn" @click="confirmUpgrade">确认升级</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.facilities-page {
  padding: 15px;
  padding-bottom: 80px;
}

.page-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.back-btn {
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: #f5f5f5;
  font-size: 18px;
  cursor: pointer;
}

.page-title {
  flex: 1;
  text-align: center;
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.header-spacer {
  width: 36px;
}

.summary-bar {
  display: flex;
  gap: 15px;
  margin-bottom: 15px;
  padding: 12px 15px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.summary-item {
  display: flex;
  flex-direction: column;
}

.summary-label {
  font-size: 12px;
  color: #999;
}

.summary-value {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.facilities-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.facility-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.facility-header {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 10px;
}

.facility-icon {
  font-size: 32px;
}

.facility-title {
  flex: 1;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.facility-title h3 {
  font-size: 16px;
  color: #333;
  margin: 0;
}

.facility-level {
  padding: 4px 10px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
}

.facility-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 15px;
  line-height: 1.5;
}

.level-display {
  display: flex;
  align-items: center;
  gap: 15px;
  margin-bottom: 15px;
}

.level-dots {
  display: flex;
  gap: 6px;
}

.level-dot {
  width: 30px;
  height: 10px;
  border-radius: 5px;
  background: #e0e0e0;
  transition: all 0.3s ease;
}

.level-dot.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}

.level-dot.current {
  box-shadow: 0 0 0 2px rgba(102, 126, 234, 0.3);
}

.level-name {
  font-size: 14px;
  color: #666;
  font-weight: 600;
}

.benefits-section {
  padding: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 15px;
}

.benefits-section h4 {
  font-size: 13px;
  color: #333;
  margin-bottom: 8px;
}

.benefits-list {
  margin: 0;
  padding-left: 18px;
}

.benefits-list li {
  font-size: 12px;
  color: #666;
  margin-bottom: 4px;
}

.current-bonus {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #eee;
}

.bonus-label {
  font-size: 12px;
  color: #999;
}

.bonus-value {
  font-size: 12px;
  color: #52c41a;
  font-weight: 600;
}

.upgrade-section {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 15px;
}

.upgrade-info {
  flex: 1;
}

.upgrade-cost,
.upgrade-benefit {
  display: flex;
  justify-content: space-between;
  margin-bottom: 5px;
}

.cost-label,
.benefit-label {
  font-size: 12px;
  color: #999;
}

.cost-value {
  font-size: 14px;
  color: #fa8c16;
  font-weight: 600;
}

.benefit-value {
  font-size: 12px;
  color: #52c41a;
  font-weight: 600;
}

.upgrade-btn {
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.upgrade-btn:active {
  transform: scale(0.95);
}

.upgrade-btn.disabled {
  background: #d9d9d9;
  cursor: not-allowed;
}

.max-level {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  background: #f6ffed;
  border-radius: 8px;
}

.max-badge {
  padding: 4px 10px;
  background: #52c41a;
  color: white;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
}

.max-text {
  font-size: 13px;
  color: #52c41a;
}

.tips-section {
  margin-top: 20px;
  padding: 15px;
  background: #fffbe6;
  border-radius: 12px;
  border-left: 4px solid #faad14;
}

.tips-section h3 {
  font-size: 14px;
  color: #d48806;
  margin-bottom: 10px;
}

.tips-section ul {
  margin: 0;
  padding-left: 20px;
}

.tips-section li {
  font-size: 12px;
  color: #8c6e00;
  margin-bottom: 5px;
  line-height: 1.5;
}

.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.confirm-modal {
  background: white;
  border-radius: 16px;
  padding: 20px;
  width: 90%;
  max-width: 350px;
}

.confirm-modal h3 {
  text-align: center;
  margin-bottom: 15px;
  color: #333;
}

.confirm-content p {
  text-align: center;
  color: #666;
  margin-bottom: 15px;
}

.upgrade-preview {
  background: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 15px;
}

.preview-row {
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.preview-row:last-child {
  border-bottom: none;
}

.preview-label {
  font-size: 13px;
  color: #999;
}

.preview-value {
  font-size: 13px;
  font-weight: 600;
  color: #333;
}

.preview-value.highlight {
  color: #722ed1;
}

.preview-value.cost {
  color: #fa8c16;
}

.preview-value.bonus {
  color: #52c41a;
}

.confirm-actions {
  display: flex;
  gap: 10px;
}

.cancel-btn,
.confirm-btn {
  flex: 1;
  padding: 12px;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  cursor: pointer;
}

.cancel-btn {
  background: #f5f5f5;
  color: #666;
}

.confirm-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-weight: 600;
}
</style>
