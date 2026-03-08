export type RetirementType = 'voluntary' | 'advised' | 'forced';

export type RetirementReasonPrimary = 'age' | 'injury' | 'performance' | 'personal';

export type PostCareerPath = 'coach' | 'analyst' | 'streamer' | 'manager' | 'retired' | 'youth_coach';

export interface RetirementReason {
  primary: RetirementReasonPrimary;
  details: string;
}

export interface RetirementCeremony {
  farewellMatch: boolean;
  fanEvent: boolean;
  hallOfFame: boolean;
  retiredNumber: boolean;
}

export interface PostCareer {
  path: PostCareerPath;
  details: string;
}

export interface Legacy {
  successorId?: string;
  successorName?: string;
  attributesTransferred: {
    mechanics: number;
    awareness: number;
    mentality: number;
    teamwork: number;
  };
  heroProficiencyTransferred: string[];
  captaincyTransferred: boolean;
  numberRetired: boolean;
  jerseyNumber?: number;
}

export interface Retirement {
  id: string;
  playerId: string;
  playerName: string;
  type: RetirementType;
  reason: RetirementReason;
  ceremony: RetirementCeremony;
  postCareer: PostCareer;
  legacy: Legacy;
  careerHighlights: CareerHighlight[];
  stats: RetirementStats;
  retiredAt: Date;
  createdAt: Date;
}

export interface CareerHighlight {
  type: 'championship' | 'mvp' | 'record' | 'milestone' | 'achievement';
  title: string;
  description: string;
  date: Date;
}

export interface RetirementStats {
  totalMatches: number;
  wins: number;
  losses: number;
  winRate: number;
  mvpCount: number;
  championships: number;
  yearsActive: number;
  clubsPlayed: number;
}

export interface HallOfFameMember {
  id: string;
  playerId: string;
  playerName: string;
  position: string;
  inductionDate: Date;
  careerStats: RetirementStats;
  highlights: CareerHighlight[];
  retiredNumber?: number;
  legacy: Legacy;
  biography: string;
}

export interface RetiredNumber {
  number: number;
  playerId: string;
  playerName: string;
  retiredAt: Date;
  reason: string;
}

export interface Legend {
  id: string;
  playerId: string;
  playerName: string;
  title: string;
  description: string;
  era: string;
  achievements: string[];
  impact: 'legendary' | 'great' | 'notable';
}

export interface ClubHallOfFame {
  members: HallOfFameMember[];
  retiredNumbers: RetiredNumber[];
  legends: Legend[];
}

export interface RetirementEligibility {
  eligible: boolean;
  reasons: string[];
  recommendations: string[];
  suggestedType: RetirementType;
}

export interface RetirementCeremonyOptions {
  farewellMatch: {
    available: boolean;
    cost: number;
    fanImpact: number;
  };
  fanEvent: {
    available: boolean;
    cost: number;
    fanImpact: number;
  };
  hallOfFame: {
    eligible: boolean;
    requirements: string[];
  };
  retiredNumber: {
    eligible: boolean;
    requirements: string[];
  };
}

export const RETIREMENT_TYPE_NAMES: Record<RetirementType, string> = {
  voluntary: '自愿退役',
  advised: '建议退役',
  forced: '强制退役',
};

export const RETIREMENT_REASON_NAMES: Record<RetirementReasonPrimary, string> = {
  age: '年龄原因',
  injury: '伤病困扰',
  performance: '状态下滑',
  personal: '个人原因',
};

export const POST_CAREER_PATH_NAMES: Record<PostCareerPath, string> = {
  coach: '主教练',
  analyst: '数据分析师',
  streamer: '主播/解说',
  manager: '战队经理',
  retired: '完全退役',
  youth_coach: '青训教练',
};

export const CAREER_HIGHLIGHT_TYPE_NAMES: Record<CareerHighlight['type'], string> = {
  championship: '冠军荣誉',
  mvp: 'MVP奖项',
  record: '纪录创造',
  milestone: '里程碑',
  achievement: '特殊成就',
};

export const LEGEND_IMPACT_NAMES: Record<Legend['impact'], string> = {
  legendary: '传奇',
  great: '伟大',
  notable: '杰出',
};

export const DEFAULT_LEGACY: Legacy = {
  successorId: undefined,
  successorName: undefined,
  attributesTransferred: {
    mechanics: 0,
    awareness: 0,
    mentality: 0,
    teamwork: 0,
  },
  heroProficiencyTransferred: [],
  captaincyTransferred: false,
  numberRetired: false,
  jerseyNumber: undefined,
};

export const DEFAULT_RETIREMENT_CEREMONY: RetirementCeremony = {
  farewellMatch: false,
  fanEvent: false,
  hallOfFame: false,
  retiredNumber: false,
};

export const DEFAULT_CLUB_HALL_OF_FAME: ClubHallOfFame = {
  members: [],
  retiredNumbers: [],
  legends: [],
};

export const HALL_OF_FAME_REQUIREMENTS = {
  minYearsActive: 3,
  minWinRate: 55,
  minChampionships: 1,
  minMvpCount: 5,
};

export const RETIRED_NUMBER_REQUIREMENTS = {
  minYearsAtClub: 3,
  minChampionships: 2,
  legendaryStatus: true,
};
