import type { 
  Coach, 
  CoachType, 
  CoachStyle, 
  CoachingStaff, 
  CoachMeeting,
  TrainingBonus,
  BPBonus,
  MeetingOutcome
} from '@/types/coach';
import type { Position } from '@/types';
import type { Player } from '@/core/models/Player';
import { useClubStore } from '@/stores/club';
import { useCoachStore } from '@/stores/coach';

const COACH_NAMES = [
  '张伟', '李明', '王强', '刘洋', '陈杰', '杨帆', '赵磊', '周涛',
  '吴昊', '郑宇', '孙浩', '马超', '朱俊', '胡斌', '林峰', '何勇',
  '郭威', '徐明', '高远', '梁军', '谢峰', '韩冰', '唐亮', '冯刚'
];

const COACH_SURNAMES = ['张', '李', '王', '刘', '陈', '杨', '赵', '周', '吴', '郑', '孙', '马', '朱', '胡', '林', '何', '郭', '徐', '高', '梁', '谢', '韩', '唐', '冯'];

const COACH_GIVEN_NAMES = ['伟', '明', '强', '洋', '杰', '帆', '磊', '涛', '昊', '宇', '浩', '超', '俊', '斌', '峰', '勇', '威', '军', '远', '冰', '亮', '刚', '辉', '鹏'];

function generateCoachName(): string {
  const surname = COACH_SURNAMES[Math.floor(Math.random() * COACH_SURNAMES.length)];
  const givenName = COACH_GIVEN_NAMES[Math.floor(Math.random() * COACH_GIVEN_NAMES.length)];
  const givenName2 = COACH_GIVEN_NAMES[Math.floor(Math.random() * COACH_GIVEN_NAMES.length)];
  return surname + givenName + (Math.random() > 0.5 ? givenName2 : '');
}

function generateId(): string {
  return `coach_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateAbilities(type: CoachType): Coach['abilities'] {
  const baseValue = type === 'head' ? 60 : type === 'assistant' ? 50 : 45;
  const variance = 20;
  
  const randomStat = (base: number) => Math.min(99, Math.max(30, base + randomInt(-variance, variance)));
  
  switch (type) {
    case 'head':
      return {
        tactics: randomStat(baseValue + 10),
        drafting: randomStat(baseValue + 5),
        motivation: randomStat(baseValue),
        development: randomStat(baseValue - 5),
        analysis: randomStat(baseValue - 10),
      };
    case 'assistant':
      return {
        tactics: randomStat(baseValue + 5),
        drafting: randomStat(baseValue),
        motivation: randomStat(baseValue + 5),
        development: randomStat(baseValue + 10),
        analysis: randomStat(baseValue),
      };
    case 'analyst':
      return {
        tactics: randomStat(baseValue),
        drafting: randomStat(baseValue + 5),
        motivation: randomStat(baseValue - 10),
        development: randomStat(baseValue - 5),
        analysis: randomStat(baseValue + 20),
      };
    case 'psychological':
      return {
        tactics: randomStat(baseValue - 15),
        drafting: randomStat(baseValue - 10),
        motivation: randomStat(baseValue + 25),
        development: randomStat(baseValue),
        analysis: randomStat(baseValue + 5),
      };
    case 'physical':
      return {
        tactics: randomStat(baseValue - 10),
        drafting: randomStat(baseValue - 15),
        motivation: randomStat(baseValue + 5),
        development: randomStat(baseValue + 15),
        analysis: randomStat(baseValue - 5),
      };
    default:
      return {
        tactics: randomStat(baseValue),
        drafting: randomStat(baseValue),
        motivation: randomStat(baseValue),
        development: randomStat(baseValue),
        analysis: randomStat(baseValue),
      };
  }
}

function generateStyle(): CoachStyle {
  const styles: CoachStyle[] = ['aggressive', 'defensive', 'balanced', 'development'];
  return styles[Math.floor(Math.random() * styles.length)];
}

function generateSpecialties(type: CoachType): Coach['specialties'] {
  const specialties: Coach['specialties'] = [];
  const numSpecialties = randomInt(1, 3);
  
  const positionOptions: Position[] = ['top', 'jungle', 'mid', 'adc', 'support'];
  const strategyOptions = ['early_game', 'late_game', 'teamfight', 'split_push', 'objective'];
  const heroPoolOptions = ['assassin', 'mage', 'tank', 'marksman', 'support'];
  
  for (let i = 0; i < numSpecialties; i++) {
    const specialtyTypes: Coach['specialties'][0]['type'][] = 
      type === 'psychological' ? ['mental'] :
      type === 'physical' ? ['physical'] :
      type === 'analyst' ? ['strategy', 'hero_pool'] :
      ['hero_pool', 'position', 'strategy', 'youth'];
    
    const specialtyType = specialtyTypes[Math.floor(Math.random() * specialtyTypes.length)];
    
    let value = '';
    switch (specialtyType) {
      case 'position':
        value = positionOptions[Math.floor(Math.random() * positionOptions.length)];
        break;
      case 'strategy':
        value = strategyOptions[Math.floor(Math.random() * strategyOptions.length)];
        break;
      case 'hero_pool':
        value = heroPoolOptions[Math.floor(Math.random() * heroPoolOptions.length)];
        break;
      default:
        value = 'general';
    }
    
    specialties.push({
      type: specialtyType,
      value,
      bonus: randomInt(5, 15),
    });
  }
  
  return specialties;
}

function calculateSalary(type: CoachType, abilities: Coach['abilities']): number {
  const avgAbility = Object.values(abilities).reduce((a, b) => a + b, 0) / 5;
  const typeMultiplier = type === 'head' ? 2 : type === 'assistant' ? 1.5 : 1;
  return Math.round(avgAbility * 0.3 * typeMultiplier);
}

function calculateBuyoutClause(salary: number): number {
  return salary * 12;
}

export function generateCoach(type: CoachType): Coach {
  const abilities = generateAbilities(type);
  const salary = calculateSalary(type, abilities);
  
  return {
    id: generateId(),
    name: generateCoachName(),
    type,
    abilities,
    style: generateStyle(),
    specialties: generateSpecialties(type),
    contract: {
      salary,
      endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * randomInt(1, 3)),
      buyoutClause: calculateBuyoutClause(salary),
    },
    experience: randomInt(1, 20),
    reputation: randomInt(40, 90),
    achievements: [],
  };
}

export function hireCoach(clubId: string, coach: Coach): { success: boolean; message: string } {
  const clubStore = useClubStore();
  const coachStore = useCoachStore();
  
  const club = clubStore.getClub(clubId);
  if (!club) {
    return { success: false, message: '俱乐部不存在' };
  }
  
  if (club.funds < coach.contract.buyoutClause) {
    return { success: false, message: `资金不足，需要 ${coach.contract.buyoutClause} 万` };
  }
  
  const currentStaff = coachStore.getCoachingStaff(clubId);
  
  if (coach.type === 'head' && currentStaff.headCoach) {
    return { success: false, message: '已有主教练，请先解雇现任主教练' };
  }
  
  if (coach.type === 'psychological' && currentStaff.psychologicalCoach) {
    return { success: false, message: '已有心理教练，请先解雇现任心理教练' };
  }
  
  if (coach.type === 'physical' && currentStaff.physicalCoach) {
    return { success: false, message: '已有体能教练，请先解雇现任体能教练' };
  }
  
  club.funds -= coach.contract.buyoutClause;
  
  coachStore.addCoach(clubId, coach);
  
  return { success: true, message: `成功聘请 ${coach.name} 为${coach.type === 'head' ? '主教练' : coach.type === 'assistant' ? '助理教练' : coach.type === 'analyst' ? '分析师' : coach.type === 'psychological' ? '心理教练' : '体能教练'}` };
}

export function fireCoach(clubId: string, coachId: string): { success: boolean; message: string; cost: number } {
  const clubStore = useClubStore();
  const coachStore = useCoachStore();
  
  const club = clubStore.getClub(clubId);
  if (!club) {
    return { success: false, message: '俱乐部不存在', cost: 0 };
  }
  
  const coach = coachStore.getCoach(clubId, coachId);
  if (!coach) {
    return { success: false, message: '教练不存在', cost: 0 };
  }
  
  const penalty = Math.floor(coach.contract.buyoutClause * 0.3);
  
  if (club.funds < penalty) {
    return { success: false, message: `资金不足，解约需要 ${penalty} 万`, cost: penalty };
  }
  
  club.funds -= penalty;
  coachStore.removeCoach(clubId, coachId);
  
  return { success: true, message: `已解雇 ${coach.name}，支付违约金 ${penalty} 万`, cost: penalty };
}

export function calculateTrainingBonus(coach: Coach, player: Player): TrainingBonus[] {
  const bonuses: TrainingBonus[] = [];
  
  const developmentBonus = coach.abilities.development * 0.02;
  bonuses.push({
    statType: 'all',
    bonus: developmentBonus,
    reason: `${coach.name} 的培养能力加成`,
  });
  
  coach.specialties.forEach(specialty => {
    if (specialty.type === 'position' && specialty.value === player.position) {
      bonuses.push({
        statType: 'all',
        bonus: specialty.bonus * 0.01,
        reason: `${coach.name} 的 ${player.position} 位置专精`,
      });
    }
    
    if (specialty.type === 'youth' && player.age <= 20) {
      bonuses.push({
        statType: 'all',
        bonus: specialty.bonus * 0.015,
        reason: `${coach.name} 的青训专精`,
      });
    }
  });
  
  if (coach.style === 'development') {
    bonuses.push({
      statType: 'all',
      bonus: 0.05,
      reason: '培养型教练风格加成',
    });
  }
  
  return bonuses;
}

export function calculateBPBonus(headCoach: Coach | null): BPBonus {
  if (!headCoach) {
    return {
      phase: 'ban',
      bonus: 0,
      heroSuggestions: [],
    };
  }
  
  const tacticsBonus = headCoach.abilities.tactics * 0.005;
  const draftingBonus = headCoach.abilities.drafting * 0.005;
  const totalBonus = tacticsBonus + draftingBonus;
  
  const suggestions: string[] = [];
  headCoach.specialties.forEach(specialty => {
    if (specialty.type === 'hero_pool') {
      suggestions.push(`建议优先考虑 ${specialty.value} 类型英雄`);
    }
    if (specialty.type === 'strategy') {
      suggestions.push(`建议采用 ${specialty.value} 策略`);
    }
  });
  
  return {
    phase: 'pick',
    bonus: totalBonus,
    heroSuggestions: suggestions,
  };
}

export function holdMeeting(
  clubId: string, 
  type: CoachMeeting['type'],
  topic: string
): { success: boolean; meeting: CoachMeeting | null; message: string } {
  const coachStore = useCoachStore();
  const clubStore = useClubStore();
  
  const staff = coachStore.getCoachingStaff(clubId);
  
  if (!staff.headCoach) {
    return { success: false, meeting: null, message: '没有主教练，无法召开会议' };
  }
  
  const attendees: string[] = [staff.headCoach.id];
  staff.assistantCoaches.forEach(c => attendees.push(c.id));
  staff.analysts.forEach(c => attendees.push(c.id));
  if (staff.psychologicalCoach) attendees.push(staff.psychologicalCoach.id);
  if (staff.physicalCoach) attendees.push(staff.physicalCoach.id);
  
  const outcomes: MeetingOutcome[] = generateMeetingOutcomes(type, staff);
  
  const moraleChange = calculateMoraleChange(outcomes);
  
  const meeting: CoachMeeting = {
    id: `meeting_${Date.now()}`,
    type,
    date: new Date(),
    attendees,
    topic,
    outcomes,
    moraleChange,
  };
  
  coachStore.addMeeting(clubId, meeting);
  
  const club = clubStore.getClub(clubId);
  if (club) {
    club.roster.forEach((player: any) => {
      if (player.condition) {
        player.condition.morale = Math.min(100, Math.max(0, player.condition.morale + moraleChange));
      }
    });
  }
  
  return { 
    success: true, 
    meeting, 
    message: `会议成功召开，团队士气${moraleChange >= 0 ? '提升' : '下降'} ${Math.abs(moraleChange)} 点` 
  };
}

function generateMeetingOutcomes(type: CoachMeeting['type'], staff: CoachingStaff): MeetingOutcome[] {
  const outcomes: MeetingOutcome[] = [];
  
  const headCoach = staff.headCoach!;
  
  switch (type) {
    case 'tactical':
      outcomes.push({
        type: 'insight',
        description: `${headCoach.name} 提出了新的战术思路`,
        impact: { type: 'tactics', value: headCoach.abilities.tactics * 0.1 },
      });
      if (staff.analysts.length > 0) {
        outcomes.push({
          type: 'suggestion',
          description: '数据分析团队提供了对手弱点报告',
          impact: { type: 'drafting', value: 5 },
        });
      }
      break;
      
    case 'player_review':
      outcomes.push({
        type: 'insight',
        description: '对选手近期表现进行了全面评估',
        impact: { type: 'training', value: 3 },
      });
      if (staff.psychologicalCoach) {
        outcomes.push({
          type: 'suggestion',
          description: `${staff.psychologicalCoach.name} 提供了心理状态建议`,
          impact: { type: 'morale', value: staff.psychologicalCoach.abilities.motivation * 0.1 },
        });
      }
      break;
      
    case 'draft_prep':
      outcomes.push({
        type: 'decision',
        description: '确定了 BP 策略和优先级英雄',
        impact: { type: 'drafting', value: headCoach.abilities.drafting * 0.1 },
      });
      if (staff.analysts.length > 0) {
        outcomes.push({
          type: 'insight',
          description: '分析师提供了版本强势英雄数据',
          impact: { type: 'drafting', value: 3 },
        });
      }
      break;
      
    case 'team_building':
      outcomes.push({
        type: 'insight',
        description: '团队凝聚力得到提升',
        impact: { type: 'morale', value: headCoach.abilities.motivation * 0.15 },
      });
      if (staff.psychologicalCoach) {
        outcomes.push({
          type: 'insight',
          description: '心理教练组织了团建活动',
          impact: { type: 'morale', value: 5 },
        });
      }
      break;
      
    case 'performance':
      outcomes.push({
        type: 'issue',
        description: '分析了近期比赛中的问题',
        impact: { type: 'tactics', value: 2 },
      });
      outcomes.push({
        type: 'suggestion',
        description: '制定了改进计划',
        impact: { type: 'training', value: 5 },
      });
      break;
  }
  
  if (Math.random() > 0.7) {
    outcomes.push({
      type: 'issue',
      description: '部分选手对训练强度有意见',
      impact: { type: 'morale', value: -3 },
    });
  }
  
  return outcomes;
}

function calculateMoraleChange(outcomes: MeetingOutcome[]): number {
  let totalChange = 0;
  outcomes.forEach(outcome => {
    if (outcome.impact && outcome.impact.type === 'morale') {
      totalChange += outcome.impact.value;
    }
  });
  
  totalChange += outcomes.filter(o => o.type === 'insight').length * 2;
  totalChange -= outcomes.filter(o => o.type === 'issue').length * 2;
  
  return Math.round(totalChange);
}

export function calculateStaffChemistry(staff: CoachingStaff): number {
  if (!staff.headCoach) return 0;
  
  let chemistry = 50;
  
  const totalCoaches = 1 + 
    staff.assistantCoaches.length + 
    staff.analysts.length + 
    (staff.psychologicalCoach ? 1 : 0) + 
    (staff.physicalCoach ? 1 : 0);
  
  chemistry += totalCoaches * 5;
  
  const headCoachStyle = staff.headCoach.style;
  
  staff.assistantCoaches.forEach(coach => {
    if (coach.style === headCoachStyle) {
      chemistry += 5;
    }
  });
  
  const avgAbilities = staff.headCoach.abilities.motivation;
  chemistry += avgAbilities * 0.2;
  
  return Math.min(100, Math.max(0, Math.round(chemistry)));
}

export function getAvailableCoaches(type: CoachType, count: number = 5): Coach[] {
  const coaches: Coach[] = [];
  for (let i = 0; i < count; i++) {
    coaches.push(generateCoach(type));
  }
  return coaches;
}

export function renewCoachContract(clubId: string, coachId: string, years: number): { success: boolean; message: string } {
  const coachStore = useCoachStore();
  const clubStore = useClubStore();
  
  const coach = coachStore.getCoach(clubId, coachId);
  if (!coach) {
    return { success: false, message: '教练不存在' };
  }
  
  const club = clubStore.getClub(clubId);
  if (!club) {
    return { success: false, message: '俱乐部不存在' };
  }
  
  const newSalary = Math.round(coach.contract.salary * (1 + years * 0.1));
  const bonus = newSalary * 2;
  
  if (club.funds < bonus) {
    return { success: false, message: `资金不足，续约奖金需要 ${bonus} 万` };
  }
  
  club.funds -= bonus;
  
  coach.contract.endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * years);
  coach.contract.salary = newSalary;
  coach.contract.buyoutClause = newSalary * 12;
  
  return { success: true, message: `成功与 ${coach.name} 续约 ${years} 年` };
}
