<script setup lang="ts">
import { computed, ref } from 'vue';
import { useRouter } from 'vue-router';
import { useClubStore } from '@/stores/club';
import { useHomeVenueStore } from '@/stores/homeVenue';
import {
  sellNamingRights,
  addAdvertisement,
  unlockCultureItem,
} from '@/core/services/homeVenueService';
import { AD_TYPE_NAMES, AD_POSITION_NAMES, type Advertisement } from '@/types/homeVenue';

const router = useRouter();
const clubStore = useClubStore();
const venueStore = useHomeVenueStore();

const activeTab = ref<'naming' | 'ads' | 'shop' | 'culture'>('naming');

const showNamingModal = ref(false);
const showAdModal = ref(false);
const showCultureModal = ref(false);

const namingForm = ref({
  sponsor: '',
  value: 500,
  duration: 12,
});

const adForm = ref({
  sponsor: '',
  type: 'led' as 'led' | 'static' | 'virtual',
  position: 'field' as 'field' | 'stands' | 'entrance',
  value: 50,
  duration: 6,
});

const cultureForm = ref({
  type: 'anthem' as 'anthem' | 'mascot',
  name: '',
  description: '',
});

const clubId = computed(() => clubStore.currentClub?.id || '');
const venue = computed(() => venueStore.getVenue(clubId.value));
const clubFunds = computed(() => clubStore.currentClub?.funds || 0);

const formatDate = (date: Date | string) => {
  const d = date instanceof Date ? date : new Date(date);
  if (isNaN(d.getTime())) return '未知日期';
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
};

const namingRightsValue = computed(() => {
  if (!venue.value) return 500;
  const baseValue = 500;
  const levelMultiplier = venue.value.level === 'xlarge' ? 2 : venue.value.level === 'large' ? 1.5 : venue.value.level === 'medium' ? 1.2 : 1;
  return Math.floor(baseValue * levelMultiplier);
});

const maxAds = computed(() => {
  if (!venue.value) return 0;
  return venue.value.facilities.mediaCenter.level * 2;
});

const handleSellNamingRights = () => {
  if (!namingForm.value.sponsor) {
    alert('请输入赞助商名称');
    return;
  }
  
  const result = sellNamingRights(
    clubId.value,
    namingForm.value.sponsor,
    namingForm.value.value,
    namingForm.value.duration
  );
  
  if (result.success) {
    alert(result.message);
    showNamingModal.value = false;
    namingForm.value = { sponsor: '', value: 500, duration: 12 };
  } else {
    alert(result.message);
  }
};

const handleAddAdvertisement = () => {
  if (!adForm.value.sponsor) {
    alert('请输入赞助商名称');
    return;
  }
  
  const result = addAdvertisement(clubId.value, {
    sponsor: adForm.value.sponsor,
    type: adForm.value.type,
    position: adForm.value.position,
    value: adForm.value.value,
    duration: adForm.value.duration,
    visibility: 50,
  });
  
  if (result.success) {
    alert(result.message);
    showAdModal.value = false;
    adForm.value = { sponsor: '', type: 'led', position: 'field', value: 50, duration: 6 };
  } else {
    alert(result.message);
  }
};

const handleUnlockCulture = () => {
  if (!cultureForm.value.name || !cultureForm.value.description) {
    alert('请填写完整信息');
    return;
  }
  
  const result = unlockCultureItem(
    clubId.value,
    cultureForm.value.type,
    cultureForm.value.name,
    cultureForm.value.description
  );
  
  if (result.success) {
    alert(result.message);
    showCultureModal.value = false;
    cultureForm.value = { type: 'anthem', name: '', description: '' };
  } else {
    alert(result.message);
  }
};

const removeAd = (adId: string) => {
  if (confirm('确定要移除此广告吗？')) {
    venueStore.removeAdvertisement(clubId.value, adId);
  }
};

const upgradeShop = () => {
  const cost = venue.value!.commercial.merchandiseShop.level * 100;
  if (clubFunds.value < cost) {
    alert(`资金不足，需要 ${cost} 万`);
    return;
  }
  clubStore.spendFunds(cost);
  venueStore.upgradeShop(clubId.value);
  alert('商店升级成功！');
};

const upgradeCatering = () => {
  const cost = venue.value!.commercial.catering.level * 80;
  if (clubFunds.value < cost) {
    alert(`资金不足，需要 ${cost} 万`);
    return;
  }
  clubStore.spendFunds(cost);
  venueStore.upgradeCatering(clubId.value);
  alert('餐饮设施升级成功！');
};

const goBack = () => {
  router.push('/venue');
};

const getAdTypeColor = (type: string) => {
  const colors: Record<string, string> = {
    led: '#007bff',
    static: '#28a745',
    virtual: '#6f42c1',
  };
  return colors[type] || '#999';
};
</script>

<template>
  <div class="commercial-page">
    <div class="page-header">
      <button class="back-btn" @click="goBack">← 返回</button>
      <h2 class="page-title">商业运营</h2>
      <div class="funds-display">
        资金: <span class="funds-value">{{ clubFunds.toLocaleString() }}万</span>
      </div>
    </div>

    <div v-if="venue" class="commercial-content">
      <div class="tab-bar">
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'naming' }"
          @click="activeTab = 'naming'"
        >
          冠名权
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'ads' }"
          @click="activeTab = 'ads'"
        >
          广告位
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'shop' }"
          @click="activeTab = 'shop'"
        >
          商店餐饮
        </button>
        <button
          class="tab-btn"
          :class="{ active: activeTab === 'culture' }"
          @click="activeTab = 'culture'"
        >
          文化建设
        </button>
      </div>

      <div v-if="activeTab === 'naming'" class="naming-section">
        <div class="section-intro">
          出售场馆冠名权可以获得大量资金，但会影响场馆文化
        </div>
        
        <div v-if="venue.commercial.namingRights" class="naming-card active">
          <div class="naming-header">
            <span class="naming-sponsor">{{ venue.commercial.namingRights.sponsor }}</span>
            <span class="naming-status">合作中</span>
          </div>
          <div class="naming-details">
            <div class="detail-item">
              <span class="detail-label">合同金额</span>
              <span class="detail-value">{{ venue.commercial.namingRights.value }}万</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">合同期限</span>
              <span class="detail-value">{{ venue.commercial.namingRights.duration }}个月</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">开始日期</span>
              <span class="detail-value">{{ formatDate(venue.commercial.namingRights.startDate) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">结束日期</span>
              <span class="detail-value">{{ formatDate(venue.commercial.namingRights.endDate) }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">额外加成</span>
              <span class="detail-value">+{{ venue.commercial.namingRights.bonus }}%</span>
            </div>
          </div>
        </div>
        
        <div v-else class="naming-card empty">
          <div class="empty-icon">🏟️</div>
          <p>暂无冠名权合作</p>
          <button class="sell-btn" @click="showNamingModal = true">
            出售冠名权
          </button>
        </div>
        
        <div class="naming-tips">
          <h4>冠名权价值参考</h4>
          <div class="tips-list">
            <div class="tip-item">
              <span>小型场馆</span>
              <span>约 500万</span>
            </div>
            <div class="tip-item">
              <span>中型场馆</span>
              <span>约 600万</span>
            </div>
            <div class="tip-item">
              <span>大型场馆</span>
              <span>约 750万</span>
            </div>
            <div class="tip-item">
              <span>超大型场馆</span>
              <span>约 1000万</span>
            </div>
          </div>
        </div>
      </div>

      <div v-else-if="activeTab === 'ads'" class="ads-section">
        <div class="section-intro">
          出售广告位可以获得稳定收入，广告位数量受媒体中心等级限制
        </div>
        
        <div class="ads-header">
          <span>已售广告位: {{ venue.commercial.advertisements.length }} / {{ maxAds }}</span>
          <button
            class="add-ad-btn"
            :disabled="venue.commercial.advertisements.length >= maxAds"
            @click="showAdModal = true"
          >
            添加广告
          </button>
        </div>
        
        <div v-if="venue.commercial.advertisements.length > 0" class="ads-list">
          <div
            v-for="ad in venue.commercial.advertisements"
            :key="ad.id"
            class="ad-card"
          >
            <div class="ad-header">
              <span class="ad-sponsor">{{ ad.sponsor }}</span>
              <span class="ad-type" :style="{ backgroundColor: getAdTypeColor(ad.type) }">
                {{ AD_TYPE_NAMES[ad.type] }}
              </span>
            </div>
            <div class="ad-details">
              <span>{{ AD_POSITION_NAMES[ad.position] }}</span>
              <span>{{ ad.value }}万</span>
              <span>{{ ad.duration }}个月</span>
            </div>
            <button class="remove-ad-btn" @click="removeAd(ad.id)">
              移除
            </button>
          </div>
        </div>
        
        <div v-else class="no-ads">
          <p>暂无广告</p>
        </div>
      </div>

      <div v-else-if="activeTab === 'shop'" class="shop-section">
        <div class="section-intro">
          升级商店和餐饮设施可以增加比赛日收入
        </div>
        
        <div class="shop-card">
          <div class="shop-header">
            <span class="shop-name">周边商店</span>
            <span class="shop-level">Lv.{{ venue.commercial.merchandiseShop.level }}</span>
          </div>
          <div class="shop-details">
            <div class="detail-item">
              <span class="detail-label">容量</span>
              <span class="detail-value">{{ venue.commercial.merchandiseShop.capacity }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">产品数量</span>
              <span class="detail-value">{{ venue.commercial.merchandiseShop.products.length }}</span>
            </div>
          </div>
          <button
            class="upgrade-btn"
            :disabled="venue.commercial.merchandiseShop.level >= 10"
            @click="upgradeShop"
          >
            升级 ({{ venue.commercial.merchandiseShop.level * 100 }}万)
          </button>
        </div>
        
        <div class="shop-card">
          <div class="shop-header">
            <span class="shop-name">餐饮服务</span>
            <span class="shop-level">Lv.{{ venue.commercial.catering.level }}</span>
          </div>
          <div class="shop-details">
            <div class="detail-item">
              <span class="detail-label">供应商数量</span>
              <span class="detail-value">{{ venue.commercial.catering.vendors }}</span>
            </div>
            <div class="detail-item">
              <span class="detail-label">服务质量</span>
              <span class="detail-value">{{ venue.commercial.catering.quality }}%</span>
            </div>
          </div>
          <button
            class="upgrade-btn"
            :disabled="venue.commercial.catering.level >= 10"
            @click="upgradeCatering"
          >
            升级 ({{ venue.commercial.catering.level * 80 }}万)
          </button>
        </div>
      </div>

      <div v-else-if="activeTab === 'culture'" class="culture-section">
        <div class="section-intro">
          建设场馆文化可以增加主场优势和粉丝忠诚度
        </div>
        
        <div class="culture-cards">
          <div class="culture-card">
            <div class="culture-header">
              <span class="culture-name">队歌</span>
              <span :class="['culture-status', venue.culture.anthem.unlocked ? 'unlocked' : 'locked']">
                {{ venue.culture.anthem.unlocked ? '已解锁' : '未解锁' }}
              </span>
            </div>
            <div v-if="venue.culture.anthem.unlocked" class="culture-content">
              <div class="culture-title">{{ venue.culture.anthem.name }}</div>
              <div class="culture-desc">{{ venue.culture.anthem.description }}</div>
              <div class="culture-pop">人气度: {{ venue.culture.anthem.popularity }}%</div>
            </div>
            <button
              v-else
              class="unlock-btn"
              @click="cultureForm.type = 'anthem'; showCultureModal = true"
            >
              解锁 (100万)
            </button>
          </div>
          
          <div class="culture-card">
            <div class="culture-header">
              <span class="culture-name">吉祥物</span>
              <span :class="['culture-status', venue.culture.mascot.unlocked ? 'unlocked' : 'locked']">
                {{ venue.culture.mascot.unlocked ? '已解锁' : '未解锁' }}
              </span>
            </div>
            <div v-if="venue.culture.mascot.unlocked" class="culture-content">
              <div class="culture-title">{{ venue.culture.mascot.name }}</div>
              <div class="culture-desc">{{ venue.culture.mascot.description }}</div>
              <div class="culture-pop">人气度: {{ venue.culture.mascot.popularity }}%</div>
            </div>
            <button
              v-else
              class="unlock-btn"
              @click="cultureForm.type = 'mascot'; showCultureModal = true"
            >
              解锁 (80万)
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-if="showNamingModal" class="modal-overlay" @click="showNamingModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>出售冠名权</h3>
          <button class="close-btn" @click="showNamingModal = false">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>赞助商名称</label>
            <input type="text" v-model="namingForm.sponsor" class="input-field" placeholder="输入赞助商名称" />
          </div>
          
          <div class="form-group">
            <label>合同金额 (万)</label>
            <input type="number" v-model.number="namingForm.value" class="input-field" :placeholder="String(namingRightsValue)" />
            <div class="form-hint">建议金额: {{ namingRightsValue }}万</div>
          </div>
          
          <div class="form-group">
            <label>合同期限 (月)</label>
            <input type="number" v-model.number="namingForm.duration" class="input-field" min="6" max="36" />
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="cancel-btn" @click="showNamingModal = false">取消</button>
          <button class="confirm-btn" @click="handleSellNamingRights">确认出售</button>
        </div>
      </div>
    </div>

    <div v-if="showAdModal" class="modal-overlay" @click="showAdModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>添加广告</h3>
          <button class="close-btn" @click="showAdModal = false">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>赞助商名称</label>
            <input type="text" v-model="adForm.sponsor" class="input-field" placeholder="输入赞助商名称" />
          </div>
          
          <div class="form-group">
            <label>广告类型</label>
            <div class="radio-group">
              <label class="radio-item">
                <input type="radio" v-model="adForm.type" value="led" />
                <span>LED广告</span>
              </label>
              <label class="radio-item">
                <input type="radio" v-model="adForm.type" value="static" />
                <span>静态广告</span>
              </label>
              <label class="radio-item">
                <input type="radio" v-model="adForm.type" value="virtual" />
                <span>虚拟广告</span>
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label>广告位置</label>
            <div class="radio-group">
              <label class="radio-item">
                <input type="radio" v-model="adForm.position" value="field" />
                <span>场地</span>
              </label>
              <label class="radio-item">
                <input type="radio" v-model="adForm.position" value="stands" />
                <span>看台</span>
              </label>
              <label class="radio-item">
                <input type="radio" v-model="adForm.position" value="entrance" />
                <span>入口</span>
              </label>
            </div>
          </div>
          
          <div class="form-group">
            <label>广告费用 (万)</label>
            <input type="number" v-model.number="adForm.value" class="input-field" min="10" />
          </div>
          
          <div class="form-group">
            <label>广告期限 (月)</label>
            <input type="number" v-model.number="adForm.duration" class="input-field" min="1" max="12" />
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="cancel-btn" @click="showAdModal = false">取消</button>
          <button class="confirm-btn" @click="handleAddAdvertisement">确认添加</button>
        </div>
      </div>
    </div>

    <div v-if="showCultureModal" class="modal-overlay" @click="showCultureModal = false">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3>解锁{{ cultureForm.type === 'anthem' ? '队歌' : '吉祥物' }}</h3>
          <button class="close-btn" @click="showCultureModal = false">×</button>
        </div>
        
        <div class="modal-body">
          <div class="form-group">
            <label>{{ cultureForm.type === 'anthem' ? '队歌名称' : '吉祥物名称' }}</label>
            <input type="text" v-model="cultureForm.name" class="input-field" :placeholder="cultureForm.type === 'anthem' ? '输入队歌名称' : '输入吉祥物名称'" />
          </div>
          
          <div class="form-group">
            <label>描述</label>
            <textarea v-model="cultureForm.description" class="textarea-field" :placeholder="cultureForm.type === 'anthem' ? '描述队歌的含义和特点' : '描述吉祥物的形象和寓意'"></textarea>
          </div>
          
          <div class="cost-info">
            解锁费用: {{ cultureForm.type === 'anthem' ? 100 : 80 }}万
          </div>
        </div>
        
        <div class="modal-footer">
          <button class="cancel-btn" @click="showCultureModal = false">取消</button>
          <button class="confirm-btn" @click="handleUnlockCulture">确认解锁</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.commercial-page {
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
  gap: 8px;
  margin-bottom: 15px;
}

.tab-btn {
  flex: 1;
  padding: 10px;
  border: none;
  border-radius: 8px;
  background: #f5f5f5;
  color: #666;
  font-size: 13px;
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

.naming-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 15px;
}

.naming-card.active {
  border-left: 4px solid #52c41a;
}

.naming-card.empty {
  text-align: center;
  padding: 40px 20px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.naming-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.naming-sponsor {
  font-size: 18px;
  font-weight: bold;
  color: #333;
}

.naming-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  background: #52c41a;
  color: white;
}

.naming-details {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.detail-item {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
}

.detail-label {
  color: #999;
}

.detail-value {
  color: #333;
  font-weight: 500;
}

.sell-btn {
  padding: 12px 30px;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 15px;
}

.naming-tips {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.naming-tips h4 {
  font-size: 14px;
  color: #333;
  margin-bottom: 12px;
}

.tips-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tip-item {
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #666;
}

.ads-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
  font-size: 14px;
  color: #666;
}

.add-ad-btn {
  padding: 8px 16px;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  font-size: 13px;
  cursor: pointer;
}

.add-ad-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.ads-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.ad-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  position: relative;
}

.ad-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.ad-sponsor {
  font-size: 15px;
  font-weight: bold;
  color: #333;
}

.ad-type {
  padding: 2px 8px;
  border-radius: 4px;
  font-size: 11px;
  color: white;
}

.ad-details {
  display: flex;
  gap: 15px;
  font-size: 12px;
  color: #999;
}

.remove-ad-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  background: #ff4d4f;
  color: white;
  font-size: 11px;
  cursor: pointer;
}

.no-ads {
  text-align: center;
  padding: 40px;
  color: #999;
  background: white;
  border-radius: 12px;
}

.shop-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 15px;
}

.shop-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.shop-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.shop-level {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
  background: #007bff;
  color: white;
}

.shop-details {
  margin-bottom: 15px;
}

.upgrade-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #28a745;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.upgrade-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.culture-cards {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.culture-card {
  background: white;
  border-radius: 12px;
  padding: 15px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.culture-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}

.culture-name {
  font-size: 16px;
  font-weight: bold;
  color: #333;
}

.culture-status {
  padding: 4px 12px;
  border-radius: 12px;
  font-size: 12px;
}

.culture-status.unlocked {
  background: #52c41a;
  color: white;
}

.culture-status.locked {
  background: #f5f5f5;
  color: #999;
}

.culture-content {
  text-align: center;
  padding: 10px 0;
}

.culture-title {
  font-size: 18px;
  font-weight: bold;
  color: #333;
  margin-bottom: 8px;
}

.culture-desc {
  font-size: 13px;
  color: #666;
  margin-bottom: 8px;
}

.culture-pop {
  font-size: 12px;
  color: #999;
}

.unlock-btn {
  width: 100%;
  padding: 12px;
  border: none;
  border-radius: 8px;
  background: #6f42c1;
  color: white;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
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

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  color: #666;
  margin-bottom: 8px;
}

.input-field,
.textarea-field {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
  box-sizing: border-box;
}

.textarea-field {
  min-height: 80px;
  resize: vertical;
}

.form-hint {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.radio-group {
  display: flex;
  gap: 15px;
}

.radio-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #666;
  cursor: pointer;
}

.cost-info {
  text-align: center;
  padding: 15px;
  background: #f9f9f9;
  border-radius: 8px;
  font-size: 16px;
  font-weight: bold;
  color: #ff6b6b;
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
</style>
