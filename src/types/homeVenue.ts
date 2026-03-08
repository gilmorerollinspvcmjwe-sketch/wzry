export type VenueLevel = 'small' | 'medium' | 'large' | 'xlarge';

export type FacilityType = 'stands' | 'vipArea' | 'trainingRoom' | 'mediaCenter' | 'lockerRoom';

export type AtmosphereAspect = 'lighting' | 'sound' | 'screen' | 'fanZone';

export interface VenueFacility {
  stands: FacilityInfo;
  vipArea: FacilityInfo;
  trainingRoom: FacilityInfo;
  mediaCenter: FacilityInfo;
  lockerRoom: FacilityInfo;
}

export interface FacilityInfo {
  level: number;
  condition: number;
  upgradeCost: number;
  maintenanceCost: number;
}

export interface VenueAtmosphere {
  lighting: AtmosphereInfo;
  sound: AtmosphereInfo;
  screen: AtmosphereInfo;
  fanZone: AtmosphereInfo;
}

export interface AtmosphereInfo {
  level: number;
  quality: number;
  upgradeCost: number;
  effect: number;
}

export interface VenueCulture {
  anthem: CultureItem;
  mascot: CultureItem;
  traditions: string[];
  winStreak: number;
  historicalMoments: HistoricalMoment[];
}

export interface CultureItem {
  name: string;
  description: string;
  popularity: number;
  unlocked: boolean;
}

export interface HistoricalMoment {
  date: Date;
  event: string;
  significance: string;
  attendance: number;
}

export interface VenueCommercial {
  namingRights: NamingRights | null;
  advertisements: Advertisement[];
  merchandiseShop: ShopInfo;
  catering: CateringInfo;
}

export interface NamingRights {
  sponsor: string;
  value: number;
  duration: number;
  startDate: Date;
  endDate: Date;
  bonus: number;
}

export interface Advertisement {
  id: string;
  sponsor: string;
  type: 'led' | 'static' | 'virtual';
  position: 'field' | 'stands' | 'entrance';
  value: number;
  duration: number;
  visibility: number;
}

export interface ShopInfo {
  level: number;
  capacity: number;
  revenue: number;
  products: string[];
}

export interface CateringInfo {
  level: number;
  vendors: number;
  quality: number;
  revenue: number;
}

export interface MatchDayRevenue {
  tickets: number;
  vip: number;
  merchandise: number;
  catering: number;
  parking: number;
  total: number;
}

export interface HomeVenue {
  id: string;
  clubId: string;
  name: string;
  capacity: number;
  level: VenueLevel;
  facilities: VenueFacility;
  atmosphere: VenueAtmosphere;
  culture: VenueCulture;
  commercial: VenueCommercial;
  matchDay: MatchDayConfig;
  createdAt: Date;
  updatedAt: Date;
}

export interface MatchDayConfig {
  baseTicketPrice: number;
  vipTicketPrice: number;
  seasonTicketHolders: number;
  averageAttendance: number;
  lastMatchRevenue: MatchDayRevenue;
}

export const VENUE_LEVEL_NAMES: Record<VenueLevel, string> = {
  small: '小型场馆',
  medium: '中型场馆',
  large: '大型场馆',
  xlarge: '超大型场馆',
};

export const VENUE_LEVEL_CAPACITY: Record<VenueLevel, { min: number; max: number }> = {
  small: { min: 1000, max: 5000 },
  medium: { min: 5001, max: 15000 },
  large: { min: 15001, max: 30000 },
  xlarge: { min: 30001, max: 50000 },
};

export const FACILITY_TYPE_NAMES: Record<FacilityType, string> = {
  stands: '观众席',
  vipArea: 'VIP区域',
  trainingRoom: '训练室',
  mediaCenter: '媒体中心',
  lockerRoom: '更衣室',
};

export const ATMOSPHERE_ASPECT_NAMES: Record<AtmosphereAspect, string> = {
  lighting: '灯光系统',
  sound: '音响系统',
  screen: '大屏幕',
  fanZone: '粉丝互动区',
};

export const AD_TYPE_NAMES: Record<Advertisement['type'], string> = {
  led: 'LED广告',
  static: '静态广告',
  virtual: '虚拟广告',
};

export const AD_POSITION_NAMES: Record<Advertisement['position'], string> = {
  field: '场地',
  stands: '看台',
  entrance: '入口',
};

export interface VenueStats {
  totalCapacity: number;
  utilizationRate: number;
  facilityScore: number;
  atmosphereScore: number;
  commercialRevenue: number;
  homeAdvantage: number;
}
