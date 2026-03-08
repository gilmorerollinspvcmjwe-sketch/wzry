import type {
  GameVersion,
  VersionAdaptation,
  VersionAdaptationBonus,
  HeroChange,
  ItemChange,
  MechanicChange,
  VersionCharacteristics,
  VersionResearch,
  ResearchFinding,
  ChangeType,
  MetaType,
  DominantRole,
} from '@/types/version';
import {
  DEFAULT_VERSION_CHARACTERISTICS,
  DEFAULT_VERSION_ADAPTATION_BONUS,
  createDefaultVersionAdaptation,
  calculateAdaptationBonuses,
} from '@/types/version';
import { useVersionStore } from '@/stores/version';
import { useHeroStore } from '@/stores/hero';
import { useCoachStore } from '@/stores/coach';
import { useClubStore } from '@/stores/club';
import { useTacticsStore } from '@/stores/tactics';

function generateId(): string {
  return `ver_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

const HERO_NAMES: Record<string, string> = {
  'hero_001': '亚瑟',
  'hero_002': '妲己',
  'hero_003': '鲁班七号',
  'hero_004': '庄周',
  'hero_005': '孙尚香',
  'hero_006': '貂蝉',
  'hero_007': '吕布',
  'hero_008': '赵云',
  'hero_009': '镜',
  'hero_010': '澜',
};

function getHeroName(heroId: string): string {
  return HERO_NAMES[heroId] || heroId;
}

export function generateNewVersion(previousVersion?: string): GameVersion {
  const versionStore = useVersionStore();
  const heroStore = useHeroStore();
  
  const prevVersion = previousVersion || versionStore.versionNumber;
  const versionParts = prevVersion.split('.').map(Number);
  versionParts[2] = (versionParts[2] || 0) + 1;
  if (versionParts[2] > 20) {
    versionParts[2] = 0;
    versionParts[1] = (versionParts[1] || 0) + 1;
  }
  if (versionParts[1] > 10) {
    versionParts[1] = 0;
    versionParts[0] = (versionParts[0] || 1) + 1;
  }
  const newVersion = versionParts.join('.');
  
  const heroChanges = generateHeroChanges(heroStore.allHeroes);
  const itemChanges = generateItemChanges();
  const mechanicChanges = generateMechanicChanges();
  const characteristics = generateVersionCharacteristics(heroChanges);
  const patchNotes = generatePatchNotes(newVersion, heroChanges, itemChanges, mechanicChanges, characteristics);
  
  return {
    version: newVersion,
    releaseDate: new Date(),
    heroChanges,
    itemChanges,
    mechanicChanges,
    characteristics,
    patchNotes,
  };
}

function generateHeroChanges(heroes: any[]): HeroChange[] {
  const changes: HeroChange[] = [];
  const changeCount = Math.floor(Math.random() * 8) + 3;
  const shuffled = [...heroes].sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < Math.min(changeCount, shuffled.length); i++) {
    const hero = shuffled[i];
    const changeType = getRandomChangeType();
    const tierChange = generateTierChange(hero.tier, changeType);
    
    changes.push({
      heroId: hero.id,
      heroName: hero.name || getHeroName(hero.id),
      changeType,
      tierChange,
      description: generateHeroChangeDescription(changeType),
      details: generateHeroChangeDetails(changeType),
    });
  }
  
  return changes;
}

function getRandomChangeType(): ChangeType {
  const rand = Math.random();
  if (rand < 0.4) return 'buff';
  if (rand < 0.75) return 'nerf';
  if (rand < 0.9) return 'rework';
  return 'new';
}

function generateTierChange(currentTier: number, changeType: ChangeType): { from: number; to: number } {
  const from = currentTier;
  let to = currentTier;
  
  if (changeType === 'buff') {
    to = Math.max(0, currentTier - Math.floor(Math.random() * 2) - 1);
  } else if (changeType === 'nerf') {
    to = Math.min(5, currentTier + Math.floor(Math.random() * 2) + 1);
  } else if (changeType === 'new') {
    to = Math.floor(Math.random() * 3);
  }
  
  return { from, to };
}

function generateHeroChangeDescription(changeType: ChangeType): string {
  const descriptions: Record<ChangeType, string[]> = {
    buff: [
      '技能伤害提升，整体强度上升',
      '冷却时间缩短，机动性增强',
      '基础属性加强，对线能力提升',
      '技能机制优化，操作手感改善',
    ],
    nerf: [
      '技能伤害下调，强度回归正常',
      '冷却时间增加，节奏放缓',
      '基础属性削弱，需要更多发育',
      '技能机制调整，容错率降低',
    ],
    rework: [
      '技能重做，玩法全面革新',
      '被动技能重新设计',
      '技能组调整，定位更加明确',
    ],
    new: [
      '新英雄加入峡谷',
      '全新机制英雄登场',
    ],
  };
  
  const options = descriptions[changeType];
  return options[Math.floor(Math.random() * options.length)];
}

function generateHeroChangeDetails(changeType: ChangeType): string[] {
  const detailTemplates: Record<ChangeType, string[][]> = {
    buff: [
      ['基础攻击力 +15', '技能1伤害 +50'],
      ['技能冷却时间 -2秒', '大招范围 +10%'],
      ['被动触发概率 +5%', '移速 +10'],
      ['生命回复 +5/秒', '护盾值 +200'],
    ],
    nerf: [
      ['技能伤害 -10%', '大招冷却 +10秒'],
      ['基础生命值 -150', '护甲 -20'],
      ['技能范围 -15%', '移速 -5'],
      ['被动持续时间 -1秒', '伤害系数 -0.1'],
    ],
    rework: [
      ['被动：重新设计被动效果', '技能1：全新机制', '大招：范围控制技能'],
      ['技能组全面重做', '定位从战士调整为坦克', '新增位移技能'],
    ],
    new: [
      ['定位：刺客/打野', '特点：高机动性', '技能：多段位移'],
      ['定位：法师/中路', '特点：远程消耗', '技能：范围控制'],
    ],
  };
  
  const options = detailTemplates[changeType];
  return options[Math.floor(Math.random() * options.length)];
}

function generateItemChanges(): ItemChange[] {
  const items = [
    { id: 'item_001', name: '破军' },
    { id: 'item_002', name: '无尽战刃' },
    { id: 'item_003', name: '宗师之力' },
    { id: 'item_004', name: '暗影战斧' },
    { id: 'item_005', name: '痛苦面具' },
  ];
  
  const changes: ItemChange[] = [];
  const changeCount = Math.floor(Math.random() * 3) + 1;
  const shuffled = items.sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < changeCount; i++) {
    const item = shuffled[i];
    const changeType = Math.random() < 0.5 ? 'buff' : 'nerf';
    
    changes.push({
      itemId: item.id,
      itemName: item.name,
      changeType,
      description: changeType === 'buff' 
        ? '属性提升，性价比提高' 
        : '属性下调，价格调整',
    });
  }
  
  return changes;
}

function generateMechanicChanges(): MechanicChange[] {
  const possibleChanges: MechanicChange[] = [
    { name: '防御塔护盾机制', description: '防御塔护盾值调整，前期防守更稳固', impact: 'minor' },
    { name: '野区资源刷新', description: '野怪刷新时间微调，打野节奏变化', impact: 'minor' },
    { name: '兵线经济', description: '补刀经济小幅调整', impact: 'minor' },
    { name: '龙坑机制', description: '暴君/主宰刷新时间和属性调整', impact: 'major' },
    { name: '装备系统', description: '新增传说装备，部分装备属性调整', impact: 'major' },
  ];
  
  const changes: MechanicChange[] = [];
  const changeCount = Math.floor(Math.random() * 2) + 1;
  const shuffled = possibleChanges.sort(() => Math.random() - 0.5);
  
  for (let i = 0; i < changeCount; i++) {
    changes.push(shuffled[i]);
  }
  
  return changes;
}

function generateVersionCharacteristics(heroChanges: HeroChange[]): VersionCharacteristics {
  const paces: Array<'fast' | 'normal' | 'slow'> = ['fast', 'normal', 'slow'];
  const metas: MetaType[] = ['early-game', 'mid-game', 'late-game', 'teamfight', 'split'];
  const roles: DominantRole[] = ['tank', 'fighter', 'assassin', 'mage', 'marksman', 'support'];
  
  const buffCount = heroChanges.filter(h => h.changeType === 'buff').length;
  const nerfCount = heroChanges.filter(h => h.changeType === 'nerf').length;
  
  let pace: 'fast' | 'normal' | 'slow' = 'normal';
  if (buffCount > nerfCount + 2) pace = 'fast';
  else if (nerfCount > buffCount + 2) pace = 'slow';
  
  const meta = metas[Math.floor(Math.random() * metas.length)];
  
  const dominantRoles: DominantRole[] = [];
  const roleCount = Math.floor(Math.random() * 2) + 2;
  const shuffledRoles = roles.sort(() => Math.random() - 0.5);
  for (let i = 0; i < roleCount; i++) {
    dominantRoles.push(shuffledRoles[i]);
  }
  
  return {
    pace,
    meta,
    dominantRoles,
    description: generateVersionDescription(pace, meta, dominantRoles),
  };
}

function generateVersionDescription(
  pace: 'fast' | 'normal' | 'slow',
  meta: MetaType,
  dominantRoles: DominantRole[]
): string {
  const paceDesc = pace === 'fast' ? '快节奏' : pace === 'slow' ? '慢节奏' : '均衡节奏';
  const metaDesc = meta === 'early-game' ? '前期' : meta === 'late-game' ? '后期' : '中期';
  
  return `${paceDesc}版本，${metaDesc}发力，${dominantRoles.slice(0, 2).join('、')}位置强势`;
}

function generatePatchNotes(
  version: string,
  heroChanges: HeroChange[],
  itemChanges: ItemChange[],
  mechanicChanges: MechanicChange[],
  characteristics: VersionCharacteristics
): string {
  let notes = `## 版本 ${version} 更新公告\n\n`;
  notes += `**发布日期**: ${new Date().toLocaleDateString('zh-CN')}\n\n`;
  notes += `**版本特点**: ${characteristics.description}\n\n`;
  
  const buffs = heroChanges.filter(h => h.changeType === 'buff');
  const nerfs = heroChanges.filter(h => h.changeType === 'nerf');
  const reworks = heroChanges.filter(h => h.changeType === 'rework');
  const newHeroes = heroChanges.filter(h => h.changeType === 'new');
  
  if (buffs.length > 0) {
    notes += `### 📈 英雄加强\n\n`;
    buffs.forEach(change => {
      notes += `- **${change.heroName}**: ${change.description}\n`;
    });
    notes += `\n`;
  }
  
  if (nerfs.length > 0) {
    notes += `### 📉 英雄削弱\n\n`;
    nerfs.forEach(change => {
      notes += `- **${change.heroName}**: ${change.description}\n`;
    });
    notes += `\n`;
  }
  
  if (reworks.length > 0) {
    notes += `### 🔄 英雄重做\n\n`;
    reworks.forEach(change => {
      notes += `- **${change.heroName}**: ${change.description}\n`;
    });
    notes += `\n`;
  }
  
  if (newHeroes.length > 0) {
    notes += `### ✨ 新英雄\n\n`;
    newHeroes.forEach(change => {
      notes += `- **${change.heroName}**: ${change.description}\n`;
    });
    notes += `\n`;
  }
  
  if (itemChanges.length > 0) {
    notes += `### 🛡️ 装备调整\n\n`;
    itemChanges.forEach(change => {
      notes += `- **${change.itemName}**: ${change.description}\n`;
    });
    notes += `\n`;
  }
  
  if (mechanicChanges.length > 0) {
    notes += `### ⚙️ 机制调整\n\n`;
    mechanicChanges.forEach(change => {
      notes += `- **${change.name}**: ${change.description}\n`;
    });
    notes += `\n`;
  }
  
  return notes;
}

export function initializeAdaptation(clubId: string): VersionAdaptation {
  const versionStore = useVersionStore();
  const existingAdaptation = versionStore.getAdaptation(clubId);
  
  if (existingAdaptation) {
    return existingAdaptation;
  }
  
  const adaptation = createDefaultVersionAdaptation(clubId);
  adaptation.currentVersion = versionStore.versionNumber;
  
  versionStore.setAdaptation(clubId, adaptation);
  
  return adaptation;
}

export function updateAdaptation(clubId: string): VersionAdaptation {
  const versionStore = useVersionStore();
  const coachStore = useCoachStore();
  const clubStore = useClubStore();
  
  let adaptation = versionStore.getAdaptation(clubId);
  if (!adaptation) {
    adaptation = initializeAdaptation(clubId);
  }
  
  const currentVersion = versionStore.versionNumber;
  if (adaptation.currentVersion !== currentVersion) {
    adaptation.currentVersion = currentVersion;
    adaptation.adaptationLevel = Math.max(0, adaptation.adaptationLevel - 30);
    adaptation.knownMetaHeroes = [];
    adaptation.knownCompositions = [];
    adaptation.researchProgress = Math.max(0, adaptation.researchProgress - 50);
  }
  
  const staff = coachStore.getCoachingStaff(clubId);
  const club = clubStore.getClub(clubId);
  
  let dailyIncrease = 2;
  
  if (staff.headCoach) {
    dailyIncrease += staff.headCoach.abilities.analysis * 0.05;
  }
  
  const analystBonus = staff.analysts.reduce((sum, a) => sum + a.abilities.analysis, 0) * 0.03;
  dailyIncrease += analystBonus;
  
  if (club?.facilities) {
    dailyIncrease += club.facilities.analysis * 0.02;
  }
  
  adaptation.adaptationLevel = Math.min(100, adaptation.adaptationLevel + dailyIncrease);
  adaptation.bonuses = calculateAdaptationBonuses(adaptation.adaptationLevel);
  
  versionStore.setAdaptation(clubId, adaptation);
  
  return adaptation;
}

export function researchVersion(
  clubId: string,
  investment: number
): { success: boolean; message: string; research?: VersionResearch; findings?: ResearchFinding[] } {
  const versionStore = useVersionStore();
  const clubStore = useClubStore();
  const coachStore = useCoachStore();
  const heroStore = useHeroStore();
  
  const club = clubStore.getClub(clubId);
  if (!club) {
    return { success: false, message: '俱乐部不存在' };
  }
  
  if (club.funds < investment) {
    return { success: false, message: '资金不足' };
  }
  
  if (investment < 10) {
    return { success: false, message: '最低研究投资为10万' };
  }
  
  club.funds -= investment;
  
  const adaptation = versionStore.getAdaptation(clubId) || initializeAdaptation(clubId);
  const staff = coachStore.getCoachingStaff(clubId);
  
  const baseProgress = investment * 0.5;
  const analystBonus = staff.analysts.length * 5;
  const facilityBonus = (club.facilities?.analysis || 0) * 0.2;
  
  const progressGain = Math.min(100 - adaptation.researchProgress, baseProgress + analystBonus + facilityBonus);
  
  adaptation.researchProgress = Math.min(100, adaptation.researchProgress + progressGain);
  adaptation.researchInvestment += investment;
  adaptation.lastResearchDate = new Date();
  
  const findings = generateResearchFindings(heroStore.allHeroes, progressGain);
  
  findings.forEach(finding => {
    if (finding.type === 'hero' && !adaptation.knownMetaHeroes.includes(finding.targetId)) {
      adaptation.knownMetaHeroes.push(finding.targetId);
    }
  });
  
  const levelIncrease = progressGain * 0.3;
  adaptation.adaptationLevel = Math.min(100, adaptation.adaptationLevel + levelIncrease);
  adaptation.bonuses = calculateAdaptationBonuses(adaptation.adaptationLevel);
  
  versionStore.setAdaptation(clubId, adaptation);
  
  const research: VersionResearch = {
    id: generateId(),
    clubId,
    version: versionStore.versionNumber,
    investment,
    progress: progressGain,
    startDate: new Date(),
    completedDate: new Date(),
    findings,
  };
  
  return {
    success: true,
    message: `研究完成，版本理解度提升 ${progressGain.toFixed(1)}%`,
    research,
    findings,
  };
}

function generateResearchFindings(heroes: any[], progressGain: number): ResearchFinding[] {
  const findings: ResearchFinding[] = [];
  const findingCount = Math.min(5, Math.ceil(progressGain / 10));
  
  const metaHeroes = heroes
    .filter(h => h.tier <= 2)
    .sort(() => Math.random() - 0.5)
    .slice(0, findingCount);
  
  metaHeroes.forEach(hero => {
    const insights = [
      `当前版本强势英雄，建议优先练习`,
      `与当前版本节奏契合度高`,
      `BP阶段高优先级选择`,
      `可作为阵容核心点`,
    ];
    
    findings.push({
      type: 'hero',
      targetId: hero.id,
      targetName: hero.name,
      insight: insights[Math.floor(Math.random() * insights.length)],
      value: (5 - hero.tier) * 10,
    });
  });
  
  return findings;
}

export function applyVersionChanges(version: GameVersion): { success: boolean; message: string } {
  const heroStore = useHeroStore();
  const versionStore = useVersionStore();
  
  version.heroChanges.forEach(change => {
    const hero = heroStore.allHeroes.find(h => h.id === change.heroId);
    if (hero) {
      hero.tier = change.tierChange.to as 0 | 1 | 2 | 3 | 4 | 5;
      hero.versionHistory.unshift({
        version: version.version,
        date: version.releaseDate,
        change: change.changeType === 'new' ? 'buff' : change.changeType,
        description: change.description,
        tierBefore: change.tierChange.from as 0 | 1 | 2 | 3 | 4 | 5,
        tierAfter: change.tierChange.to as 0 | 1 | 2 | 3 | 4 | 5,
      });
    }
  });
  
  versionStore.setCurrentVersion(version);
  
  return { success: true, message: `版本 ${version.version} 已应用` };
}

export function calculateAdaptationBonus(clubId: string): VersionAdaptationBonus {
  const versionStore = useVersionStore();
  const adaptation = versionStore.getAdaptation(clubId);
  
  if (!adaptation) {
    return { ...DEFAULT_VERSION_ADAPTATION_BONUS };
  }
  
  return adaptation.bonuses;
}

export function getVersionMetaHeroes(clubId: string): { heroId: string; heroName: string; tier: number; insight?: string }[] {
  const versionStore = useVersionStore();
  const heroStore = useHeroStore();
  const adaptation = versionStore.getAdaptation(clubId);
  
  const metaHeroes = heroStore.getMetaHeroes;
  
  if (!adaptation || adaptation.adaptationLevel < 30) {
    return metaHeroes.slice(0, 3).map(h => ({
      heroId: h.id,
      heroName: h.name,
      tier: h.tier,
    }));
  }
  
  const knownSet = new Set(adaptation.knownMetaHeroes);
  
  return metaHeroes
    .filter(h => adaptation.adaptationLevel >= 60 || knownSet.has(h.id))
    .map(h => ({
      heroId: h.id,
      heroName: h.name,
      tier: h.tier,
      insight: knownSet.has(h.id) ? '已研究' : undefined,
    }));
}

export function getVersionBonusForMatch(clubId: string): {
  heroBonus: number;
  compositionBonus: number;
  bpInsight: number;
} {
  const bonuses = calculateAdaptationBonus(clubId);
  
  return {
    heroBonus: bonuses.heroMastery * 0.01,
    compositionBonus: bonuses.compositionBonus * 0.01,
    bpInsight: bonuses.bpInsight * 0.01,
  };
}

export function checkVersionUpdate(): { hasUpdate: boolean; version?: GameVersion } {
  const versionStore = useVersionStore();
  
  if (versionStore.hasPendingUpdate) {
    return {
      hasUpdate: true,
      version: versionStore.pendingVersion || undefined,
    };
  }
  
  return { hasUpdate: false };
}

export function triggerVersionUpdate(): GameVersion {
  const versionStore = useVersionStore();
  const newVersion = generateNewVersion();
  
  versionStore.setPendingVersion(newVersion);
  
  return newVersion;
}

export function getVersionHighlights(version: GameVersion): string[] {
  const highlights: string[] = [];
  
  const majorChanges = version.heroChanges.filter(h => 
    Math.abs(h.tierChange.to - h.tierChange.from) >= 2
  );
  
  majorChanges.slice(0, 3).forEach(change => {
    const direction = change.tierChange.to < change.tierChange.from ? '大幅加强' : '大幅削弱';
    highlights.push(`${change.heroName}${direction}`);
  });
  
  const majorMechanics = version.mechanicChanges.filter(m => m.impact === 'major');
  majorMechanics.forEach(m => {
    highlights.push(`${m.name}机制调整`);
  });
  
  highlights.push(`版本特点：${version.characteristics.description}`);
  
  return highlights;
}
