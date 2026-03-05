import type { Sponsor } from '@/types';

// 赞助商数据
export const sponsors: Sponsor[] = [
  // 运动品牌
  {
    id: 'nike',
    name: '耐克 Nike',
    logo: '👟',
    weeklyPayment: 80,
    bonus: 200,
    requirements: [
      { type: 'ranking', target: 3 }, // 联赛排名前 3
    ],
  },
  {
    id: 'adidas',
    name: '阿迪达斯 Adidas',
    logo: '👕',
    weeklyPayment: 70,
    bonus: 180,
    requirements: [
      { type: 'ranking', target: 5 },
    ],
  },
  {
    id: 'anta',
    name: '安踏 Anta',
    logo: '🎽',
    weeklyPayment: 50,
    bonus: 120,
    requirements: [
      { type: 'ranking', target: 8 },
    ],
  },
  
  // 电子设备
  {
    id: 'razer',
    name: '雷蛇 Razer',
    logo: '🖱️',
    weeklyPayment: 60,
    bonus: 150,
    requirements: [
      { type: 'win_rate', target: 0.6 }, // 胜率 60%
    ],
  },
  {
    id: 'logitech',
    name: '罗技 Logitech',
    logo: '⌨️',
    weeklyPayment: 55,
    bonus: 140,
    requirements: [
      { type: 'win_rate', target: 0.55 },
    ],
  },
  {
    id: 'corsair',
    name: '海盗船 Corsair',
    logo: '🖥️',
    weeklyPayment: 45,
    bonus: 100,
    requirements: [
      { type: 'win_rate', target: 0.5 },
    ],
  },
  
  // 能量饮料
  {
    id: 'redbull',
    name: '红牛 Red Bull',
    logo: '🥤',
    weeklyPayment: 90,
    bonus: 250,
    requirements: [
      { type: 'ranking', target: 2 },
      { type: 'fans', target: 100000 },
    ],
  },
  {
    id: 'monster',
    name: '魔爪 Monster',
    logo: '☕',
    weeklyPayment: 65,
    bonus: 160,
    requirements: [
      { type: 'ranking', target: 6 },
    ],
  },
  
  // 汽车品牌
  {
    id: 'mercedes',
    name: '梅赛德斯 - 奔驰',
    logo: '🚗',
    weeklyPayment: 120,
    bonus: 400,
    requirements: [
      { type: 'ranking', target: 1 }, // 联赛第一
      { type: 'fans', target: 200000 },
    ],
  },
  {
    id: 'bmw',
    name: '宝马 BMW',
    logo: '🏎️',
    weeklyPayment: 100,
    bonus: 350,
    requirements: [
      { type: 'ranking', target: 2 },
      { type: 'fans', target: 150000 },
    ],
  },
  {
    id: 'audi',
    name: '奥迪 Audi',
    logo: '🚙',
    weeklyPayment: 85,
    bonus: 280,
    requirements: [
      { type: 'ranking', target: 4 },
    ],
  },
  
  // 手机品牌
  {
    id: 'huawei',
    name: '华为 Huawei',
    logo: '📱',
    weeklyPayment: 110,
    bonus: 320,
    requirements: [
      { type: 'ranking', target: 3 },
      { type: 'fans', target: 120000 },
    ],
  },
  {
    id: 'xiaomi',
    name: '小米 Xiaomi',
    logo: '📞',
    weeklyPayment: 75,
    bonus: 200,
    requirements: [
      { type: 'ranking', target: 6 },
    ],
  },
  {
    id: 'oppo',
    name: 'OPPO',
    logo: '📲',
    weeklyPayment: 70,
    bonus: 180,
    requirements: [
      { type: 'ranking', target: 8 },
    ],
  },
  
  // 其他
  {
    id: 'kfc',
    name: '肯德基 KFC',
    logo: '🍗',
    weeklyPayment: 40,
    bonus: 80,
    requirements: [
      { type: 'fans', target: 50000 },
    ],
  },
  {
    id: 'coca_cola',
    name: '可口可乐',
    logo: '🥤',
    weeklyPayment: 95,
    bonus: 300,
    requirements: [
      { type: 'ranking', target: 4 },
      { type: 'fans', target: 100000 },
    ],
  },
];

// 根据声望匹配赞助商
export function matchSponsorsByReputation(reputation: number): Sponsor[] {
  if (reputation >= 80) {
    // 高声望：可以匹配顶级赞助商
    return sponsors.filter(s => s.weeklyPayment >= 80);
  } else if (reputation >= 60) {
    // 中等声望：匹配中级赞助商
    return sponsors.filter(s => s.weeklyPayment >= 50 && s.weeklyPayment < 80);
  } else {
    // 低声望：匹配基础赞助商
    return sponsors.filter(s => s.weeklyPayment < 50);
  }
}

// 根据排名匹配赞助商
export function matchSponsorsByRanking(ranking: number): Sponsor[] {
  return sponsors.filter(s => 
    s.requirements.every(req => {
      if (req.type === 'ranking') {
        return ranking <= req.target;
      }
      return true;
    })
  );
}

// 检查是否满足赞助商要求
export function checkSponsorRequirements(
  sponsor: Sponsor,
  currentRanking: number,
  winRate: number,
  fans: number
): boolean {
  return sponsor.requirements.every(req => {
    switch (req.type) {
      case 'ranking':
        return currentRanking <= req.target;
      case 'win_rate':
        return winRate >= req.target;
      case 'fans':
        return fans >= req.target;
      default:
        return true;
    }
  });
}

// 获取赞助商奖金
export function getSponsorBonus(sponsor: Sponsor, requirementsMet: boolean): number {
  return requirementsMet ? sponsor.bonus : 0;
}
