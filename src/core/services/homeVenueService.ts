import type {
  HomeVenue,
  VenueLevel,
  FacilityType,
  AtmosphereAspect,
  VenueFacility,
  VenueAtmosphere,
  VenueCulture,
  VenueCommercial,
  MatchDayRevenue,
  MatchDayConfig,
  FacilityInfo,
  AtmosphereInfo,
  NamingRights,
  Advertisement,
} from '@/types/homeVenue';
import { useClubStore } from '@/stores/club';
import { useHomeVenueStore } from '@/stores/homeVenue';

const VENUE_NAMES = [
  '荣耀竞技场', '传奇体育馆', '王者之巅', '星辰大厅', '电竞圣殿',
  '荣耀殿堂', '梦想舞台', '巅峰竞技场', '英雄广场', '传奇中心',
];

function generateId(): string {
  return `venue_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function createDefaultFacility(level: number = 1): FacilityInfo {
  return {
    level,
    condition: 100,
    upgradeCost: 50 * level,
    maintenanceCost: 5 * level,
  };
}

function createDefaultFacilities(): VenueFacility {
  return {
    stands: createDefaultFacility(1),
    vipArea: createDefaultFacility(1),
    trainingRoom: createDefaultFacility(1),
    mediaCenter: createDefaultFacility(1),
    lockerRoom: createDefaultFacility(1),
  };
}

function createDefaultAtmosphereInfo(level: number = 1): AtmosphereInfo {
  return {
    level,
    quality: 50,
    upgradeCost: 30 * level,
    effect: level * 2,
  };
}

function createDefaultAtmosphere(): VenueAtmosphere {
  return {
    lighting: createDefaultAtmosphereInfo(1),
    sound: createDefaultAtmosphereInfo(1),
    screen: createDefaultAtmosphereInfo(1),
    fanZone: createDefaultAtmosphereInfo(1),
  };
}

function createDefaultCulture(): VenueCulture {
  return {
    anthem: {
      name: '',
      description: '',
      popularity: 0,
      unlocked: false,
    },
    mascot: {
      name: '',
      description: '',
      popularity: 0,
      unlocked: false,
    },
    traditions: [],
    winStreak: 0,
    historicalMoments: [],
  };
}

function createDefaultCommercial(): VenueCommercial {
  return {
    namingRights: null,
    advertisements: [],
    merchandiseShop: {
      level: 1,
      capacity: 100,
      revenue: 0,
      products: [],
    },
    catering: {
      level: 1,
      vendors: 5,
      quality: 50,
      revenue: 0,
    },
  };
}

function createDefaultMatchDayConfig(): MatchDayConfig {
  return {
    baseTicketPrice: 50,
    vipTicketPrice: 200,
    seasonTicketHolders: 0,
    averageAttendance: 0,
    lastMatchRevenue: {
      tickets: 0,
      vip: 0,
      merchandise: 0,
      catering: 0,
      parking: 0,
      total: 0,
    },
  };
}

function determineVenueLevel(capacity: number): VenueLevel {
  if (capacity <= 5000) return 'small';
  if (capacity <= 15000) return 'medium';
  if (capacity <= 30000) return 'large';
  return 'xlarge';
}

export function initializeVenue(clubId: string, name?: string): HomeVenue {
  const clubStore = useClubStore();
  const club = clubStore.getClub(clubId);
  
  const baseCapacity = club ? Math.floor(1000 + club.reputation * 50) : 3000;
  const capacity = Math.min(50000, baseCapacity);
  
  const venue: HomeVenue = {
    id: generateId(),
    clubId,
    name: name || VENUE_NAMES[Math.floor(Math.random() * VENUE_NAMES.length)],
    capacity,
    level: determineVenueLevel(capacity),
    facilities: createDefaultFacilities(),
    atmosphere: createDefaultAtmosphere(),
    culture: createDefaultCulture(),
    commercial: createDefaultCommercial(),
    matchDay: createDefaultMatchDayConfig(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
  
  return venue;
}

export function upgradeFacility(
  clubId: string,
  facilityType: FacilityType,
  targetLevel: number
): { success: boolean; message: string; cost: number } {
  const clubStore = useClubStore();
  const venueStore = useHomeVenueStore();
  
  const club = clubStore.getClub(clubId);
  if (!club) {
    return { success: false, message: '俱乐部不存在', cost: 0 };
  }
  
  const venue = venueStore.getVenue(clubId);
  if (!venue) {
    return { success: false, message: '主场不存在', cost: 0 };
  }
  
  const facility = venue.facilities[facilityType];
  const currentLevel = facility.level;
  
  if (targetLevel <= currentLevel) {
    return { success: false, message: '目标等级不能低于当前等级', cost: 0 };
  }
  
  if (targetLevel > 10) {
    return { success: false, message: '设施等级不能超过10级', cost: 0 };
  }
  
  let totalCost = 0;
  for (let i = currentLevel + 1; i <= targetLevel; i++) {
    totalCost += 50 * i * i;
  }
  
  if (club.funds < totalCost) {
    return { success: false, message: `资金不足，需要 ${totalCost} 万`, cost: totalCost };
  }
  
  club.funds -= totalCost;
  
  facility.level = targetLevel;
  facility.upgradeCost = 50 * targetLevel * targetLevel;
  facility.maintenanceCost = 5 * targetLevel;
  facility.condition = 100;
  
  venueStore.updateVenue(clubId, venue);
  
  return {
    success: true,
    message: `成功将${getFacilityTypeName(facilityType)}升级到 ${targetLevel} 级`,
    cost: totalCost,
  };
}

export function calculateTicketRevenue(
  clubId: string,
  matchImportance: 'regular' | 'playoff' | 'finals' = 'regular'
): MatchDayRevenue {
  const venueStore = useHomeVenueStore();
  const clubStore = useClubStore();
  
  const venue = venueStore.getVenue(clubId);
  const club = clubStore.getClub(clubId);
  
  if (!venue || !club) {
    return {
      tickets: 0,
      vip: 0,
      merchandise: 0,
      catering: 0,
      parking: 0,
      total: 0,
    };
  }
  
  const standsLevel = venue.facilities.stands.level;
  const vipLevel = venue.facilities.vipArea.level;
  const shopLevel = venue.commercial.merchandiseShop.level;
  const cateringLevel = venue.commercial.catering.level;
  
  const baseAttendance = venue.capacity * (0.6 + club.reputation * 0.004);
  const importanceMultiplier = matchImportance === 'playoff' ? 1.3 : matchImportance === 'finals' ? 1.5 : 1;
  
  const attendance = Math.min(venue.capacity, Math.floor(baseAttendance * importanceMultiplier));
  const vipSeats = Math.floor(attendance * 0.05 * (vipLevel / 10));
  const regularSeats = attendance - vipSeats;
  
  const ticketPrice = venue.matchDay.baseTicketPrice * (1 + standsLevel * 0.05);
  const vipPrice = venue.matchDay.vipTicketPrice * (1 + vipLevel * 0.1);
  
  const ticketsRevenue = Math.floor(regularSeats * ticketPrice);
  const vipRevenue = Math.floor(vipSeats * vipPrice);
  
  const merchandiseRevenue = Math.floor(attendance * 5 * shopLevel * 0.1);
  const cateringRevenue = Math.floor(attendance * 3 * cateringLevel * 0.1);
  const parkingRevenue = Math.floor(attendance * 2);
  
  const total = ticketsRevenue + vipRevenue + merchandiseRevenue + cateringRevenue + parkingRevenue;
  
  const revenue: MatchDayRevenue = {
    tickets: ticketsRevenue,
    vip: vipRevenue,
    merchandise: merchandiseRevenue,
    catering: cateringRevenue,
    parking: parkingRevenue,
    total,
  };
  
  venue.matchDay.lastMatchRevenue = revenue;
  venue.matchDay.averageAttendance = Math.floor((venue.matchDay.averageAttendance + attendance) / 2);
  venueStore.updateVenue(clubId, venue);
  
  return revenue;
}

export function calculateHomeAdvantage(clubId: string): number {
  const venueStore = useHomeVenueStore();
  const venue = venueStore.getVenue(clubId);
  
  if (!venue) return 0;
  
  let advantage = 0;
  
  const avgFacilityLevel = (
    venue.facilities.stands.level +
    venue.facilities.vipArea.level +
    venue.facilities.lockerRoom.level
  ) / 3;
  advantage += avgFacilityLevel * 0.5;
  
  const avgAtmosphereLevel = (
    venue.atmosphere.lighting.level +
    venue.atmosphere.sound.level +
    venue.atmosphere.screen.level +
    venue.atmosphere.fanZone.level
  ) / 4;
  advantage += avgAtmosphereLevel * 0.3;
  
  advantage += venue.culture.winStreak * 0.5;
  
  if (venue.culture.anthem.unlocked) {
    advantage += venue.culture.anthem.popularity * 0.02;
  }
  if (venue.culture.mascot.unlocked) {
    advantage += venue.culture.mascot.popularity * 0.02;
  }
  
  const capacityBonus = Math.log10(venue.capacity) * 0.5;
  advantage += capacityBonus;
  
  return Math.min(20, Math.round(advantage * 10) / 10);
}

export function upgradeAtmosphere(
  clubId: string,
  aspect: AtmosphereAspect,
  targetLevel: number
): { success: boolean; message: string; cost: number } {
  const clubStore = useClubStore();
  const venueStore = useHomeVenueStore();
  
  const club = clubStore.getClub(clubId);
  if (!club) {
    return { success: false, message: '俱乐部不存在', cost: 0 };
  }
  
  const venue = venueStore.getVenue(clubId);
  if (!venue) {
    return { success: false, message: '主场不存在', cost: 0 };
  }
  
  const atmosphereAspect = venue.atmosphere[aspect];
  const currentLevel = atmosphereAspect.level;
  
  if (targetLevel <= currentLevel) {
    return { success: false, message: '目标等级不能低于当前等级', cost: 0 };
  }
  
  if (targetLevel > 10) {
    return { success: false, message: '氛围等级不能超过10级', cost: 0 };
  }
  
  let totalCost = 0;
  for (let i = currentLevel + 1; i <= targetLevel; i++) {
    totalCost += 30 * i * i;
  }
  
  if (club.funds < totalCost) {
    return { success: false, message: `资金不足，需要 ${totalCost} 万`, cost: totalCost };
  }
  
  club.funds -= totalCost;
  
  atmosphereAspect.level = targetLevel;
  atmosphereAspect.upgradeCost = 30 * targetLevel * targetLevel;
  atmosphereAspect.effect = targetLevel * 2;
  atmosphereAspect.quality = Math.min(100, 50 + targetLevel * 5);
  
  venueStore.updateVenue(clubId, venue);
  
  return {
    success: true,
    message: `成功将${getAtmosphereAspectName(aspect)}升级到 ${targetLevel} 级`,
    cost: totalCost,
  };
}

export function sellNamingRights(
  clubId: string,
  sponsor: string,
  value: number,
  duration: number
): { success: boolean; message: string; namingRights: NamingRights | null } {
  const clubStore = useClubStore();
  const venueStore = useHomeVenueStore();
  
  const club = clubStore.getClub(clubId);
  if (!club) {
    return { success: false, message: '俱乐部不存在', namingRights: null };
  }
  
  const venue = venueStore.getVenue(clubId);
  if (!venue) {
    return { success: false, message: '主场不存在', namingRights: null };
  }
  
  if (venue.commercial.namingRights) {
    const existingEndDate = new Date(venue.commercial.namingRights.endDate);
    if (existingEndDate > new Date()) {
      return {
        success: false,
        message: `当前冠名权合同尚未到期，到期时间为 ${formatDate(existingEndDate)}`,
        namingRights: null,
      };
    }
  }
  
  const venueLevelBonus = venue.level === 'xlarge' ? 1.5 : venue.level === 'large' ? 1.3 : venue.level === 'medium' ? 1.1 : 1;
  const finalValue = Math.floor(value * venueLevelBonus);
  
  const namingRights: NamingRights = {
    sponsor,
    value: finalValue,
    duration,
    startDate: new Date(),
    endDate: new Date(Date.now() + duration * 30 * 24 * 60 * 60 * 1000),
    bonus: Math.floor(finalValue * 0.1),
  };
  
  venue.commercial.namingRights = namingRights;
  venueStore.updateVenue(clubId, venue);
  
  club.funds += finalValue;
  
  return {
    success: true,
    message: `成功与 ${sponsor} 签订冠名权合同，获得 ${finalValue} 万`,
    namingRights,
  };
}

export function addAdvertisement(
  clubId: string,
  advertisement: Omit<Advertisement, 'id'>
): { success: boolean; message: string; ad: Advertisement | null } {
  const clubStore = useClubStore();
  const venueStore = useHomeVenueStore();
  
  const club = clubStore.getClub(clubId);
  if (!club) {
    return { success: false, message: '俱乐部不存在', ad: null };
  }
  
  const venue = venueStore.getVenue(clubId);
  if (!venue) {
    return { success: false, message: '主场不存在', ad: null };
  }
  
  const maxAds = venue.facilities.mediaCenter.level * 2;
  if (venue.commercial.advertisements.length >= maxAds) {
    return {
      success: false,
      message: `广告位已满，最多可容纳 ${maxAds} 个广告`,
      ad: null,
    };
  }
  
  const ad: Advertisement = {
    ...advertisement,
    id: `ad_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
  };
  
  venue.commercial.advertisements.push(ad);
  venueStore.updateVenue(clubId, venue);
  
  club.funds += ad.value;
  
  return {
    success: true,
    message: `成功添加广告，获得 ${ad.value} 万`,
    ad,
  };
}

export function expandCapacity(
  clubId: string,
  additionalSeats: number
): { success: boolean; message: string; cost: number; newCapacity: number } {
  const clubStore = useClubStore();
  const venueStore = useHomeVenueStore();
  
  const club = clubStore.getClub(clubId);
  if (!club) {
    return { success: false, message: '俱乐部不存在', cost: 0, newCapacity: 0 };
  }
  
  const venue = venueStore.getVenue(clubId);
  if (!venue) {
    return { success: false, message: '主场不存在', cost: 0, newCapacity: 0 };
  }
  
  const newCapacity = venue.capacity + additionalSeats;
  if (newCapacity > 50000) {
    return { success: false, message: '场馆最大容量不能超过50000人', cost: 0, newCapacity: 0 };
  }
  
  const costPerSeat = 0.5;
  const totalCost = Math.floor(additionalSeats * costPerSeat);
  
  if (club.funds < totalCost) {
    return { success: false, message: `资金不足，需要 ${totalCost} 万`, cost: totalCost, newCapacity: 0 };
  }
  
  club.funds -= totalCost;
  venue.capacity = newCapacity;
  venue.level = determineVenueLevel(newCapacity);
  
  venueStore.updateVenue(clubId, venue);
  
  return {
    success: true,
    message: `成功扩建场馆，新增 ${additionalSeats} 个座位`,
    cost: totalCost,
    newCapacity,
  };
}

export function unlockCultureItem(
  clubId: string,
  type: 'anthem' | 'mascot',
  name: string,
  description: string
): { success: boolean; message: string; cost: number } {
  const clubStore = useClubStore();
  const venueStore = useHomeVenueStore();
  
  const club = clubStore.getClub(clubId);
  if (!club) {
    return { success: false, message: '俱乐部不存在', cost: 0 };
  }
  
  const venue = venueStore.getVenue(clubId);
  if (!venue) {
    return { success: false, message: '主场不存在', cost: 0 };
  }
  
  const cost = type === 'anthem' ? 100 : 80;
  
  if (club.funds < cost) {
    return { success: false, message: `资金不足，需要 ${cost} 万`, cost };
  }
  
  club.funds -= cost;
  
  venue.culture[type] = {
    name,
    description,
    popularity: 50,
    unlocked: true,
  };
  
  venueStore.updateVenue(clubId, venue);
  
  return {
    success: true,
    message: `成功解锁${type === 'anthem' ? '队歌' : '吉祥物'}：${name}`,
    cost,
  };
}

export function updateWinStreak(clubId: string, isWin: boolean): void {
  const venueStore = useHomeVenueStore();
  const venue = venueStore.getVenue(clubId);
  
  if (!venue) return;
  
  if (isWin) {
    venue.culture.winStreak++;
  } else {
    venue.culture.winStreak = 0;
  }
  
  venueStore.updateVenue(clubId, venue);
}

export function calculateWeeklyMaintenance(clubId: string): number {
  const venueStore = useHomeVenueStore();
  const venue = venueStore.getVenue(clubId);
  
  if (!venue) return 0;
  
  let maintenance = 0;
  
  Object.values(venue.facilities).forEach(facility => {
    maintenance += facility.maintenanceCost;
  });
  
  maintenance += venue.capacity * 0.001;
  
  return Math.floor(maintenance);
}

export function calculateVenueStats(clubId: string) {
  const venueStore = useHomeVenueStore();
  const venue = venueStore.getVenue(clubId);
  
  if (!venue) {
    return {
      totalCapacity: 0,
      utilizationRate: 0,
      facilityScore: 0,
      atmosphereScore: 0,
      commercialRevenue: 0,
      homeAdvantage: 0,
    };
  }
  
  const facilityScore = Math.round(
    (Object.values(venue.facilities) as FacilityInfo[]).reduce((sum, f) => sum + f.level, 0) /
    Object.keys(venue.facilities).length * 10
  );
  
  const atmosphereScore = Math.round(
    (Object.values(venue.atmosphere) as AtmosphereInfo[]).reduce((sum, a) => sum + a.level, 0) /
    Object.keys(venue.atmosphere).length * 10
  );
  
  const utilizationRate = venue.matchDay.averageAttendance / venue.capacity * 100;
  
  const commercialRevenue = venue.matchDay.lastMatchRevenue.total;
  
  return {
    totalCapacity: venue.capacity,
    utilizationRate: Math.round(utilizationRate),
    facilityScore,
    atmosphereScore,
    commercialRevenue,
    homeAdvantage: calculateHomeAdvantage(clubId),
  };
}

function getFacilityTypeName(type: FacilityType): string {
  const names: Record<FacilityType, string> = {
    stands: '观众席',
    vipArea: 'VIP区域',
    trainingRoom: '训练室',
    mediaCenter: '媒体中心',
    lockerRoom: '更衣室',
  };
  return names[type];
}

function getAtmosphereAspectName(aspect: AtmosphereAspect): string {
  const names: Record<AtmosphereAspect, string> = {
    lighting: '灯光系统',
    sound: '音响系统',
    screen: '大屏幕',
    fanZone: '粉丝互动区',
  };
  return names[aspect];
}

function formatDate(date: Date): string {
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, '0')}-${d.getDate().toString().padStart(2, '0')}`;
}
