// KPL电竞选手分析服务

import type { Player } from '@/core/models/Player';

export interface PlayerReport {
  playerId: string;
  playerName: string;
  position: string;
  age: number;
  
  estimatedAttributes: {
    mechanics: number;
    awareness: number;
    teamwork: number;
    mentality: number;
  };
  
  estimatedPotential: number;
  personalityTraits: string[];
  
  summary: string;
  recommendation: 'highly_recommended' | 'recommended' | 'not_recommended';
  confidenceLevel: number;
  
  cost: number;
  expiresAt: Date;
}

export interface Analyst {
  id: string;
  name: string;
  level: number;
  specialty: string[];
  cost: number;
  accuracy: {
    attributes: number;
    potential: number;
    personality: number;
  };
}

const ANALYSTS: Analyst[] = [
  {
    id: 'analyst_1',
    name: '初级分析师',
    level: 1,
    specialty: ['all'],
    cost: 10,
    accuracy: { attributes: 0.6, potential: 0.5, personality: 0.4 },
  },
  {
    id: 'analyst_2',
    name: '中级分析师',
    level: 2,
    specialty: ['top', 'jungle'],
    cost: 25,
    accuracy: { attributes: 0.75, potential: 0.65, personality: 0.55 },
  },
  {
    id: 'analyst_3',
    name: '高级分析师',
    level: 3,
    specialty: ['mid', 'adc', 'support'],
    cost: 50,
    accuracy: { attributes: 0.85, potential: 0.75, personality: 0.7 },
  },
  {
    id: 'analyst_4',
    name: '顶级分析师',
    level: 4,
    specialty: ['all'],
    cost: 100,
    accuracy: { attributes: 0.92, potential: 0.85, personality: 0.8 },
  },
  {
    id: 'analyst_5',
    name: '传奇分析师',
    level: 5,
    specialty: ['all'],
    cost: 200,
    accuracy: { attributes: 0.98, potential: 0.95, personality: 0.9 },
  },
];

class AnalystService {
  private reports: Map<string, PlayerReport> = new Map();

  getAnalysts(): Analyst[] {
    return [...ANALYSTS];
  }

  getAnalystById(id: string): Analyst | undefined {
    return ANALYSTS.find(a => a.id === id);
  }

  hireAnalyst(analystId: string): Analyst | null {
    return this.getAnalystById(analystId) || null;
  }

  generateReport(player: Player, analystId: string): PlayerReport | null {
    const analyst = this.getAnalystById(analystId);
    if (!analyst) return null;

    const accuracy = analyst.accuracy;
    
    const addError = (value: number, errorRate: number) => {
      const error = (Math.random() - 0.5) * 2 * errorRate * 100;
      return Math.max(0, Math.min(100, value + error));
    };

    const mechanics = addError(player.attributes.mechanics, 1 - accuracy.attributes);
    const awareness = addError(player.attributes.awareness, 1 - accuracy.attributes);
    const teamwork = addError(player.attributes.teamwork, 1 - accuracy.attributes);
    const mentality = addError(player.attributes.mentality, 1 - accuracy.attributes);

    const potential = addError((player as any).potential || 70, 1 - accuracy.potential);

    const personalityTraits = this.generatePersonalityTraits(player, accuracy.personality);

    const avgPower = (mechanics + awareness + teamwork + mentality) / 4;
    const recommendation: 'highly_recommended' | 'recommended' | 'not_recommended' = 
      avgPower >= 75 && potential >= 80 ? 'highly_recommended' :
      avgPower >= 60 && potential >= 65 ? 'recommended' : 'not_recommended';

    const summary = this.generateSummary(player, avgPower, potential, recommendation);

    const report: PlayerReport = {
      playerId: player.id,
      playerName: player.name,
      position: player.position,
      age: (player as any).age || 20,
      estimatedAttributes: {
        mechanics: Math.round(mechanics),
        awareness: Math.round(awareness),
        teamwork: Math.round(teamwork),
        mentality: Math.round(mentality),
      },
      estimatedPotential: Math.round(potential),
      personalityTraits,
      summary,
      recommendation,
      confidenceLevel: Math.round((accuracy.attributes + accuracy.potential + accuracy.personality) / 3 * 100),
      cost: analyst.cost,
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    };

    this.reports.set(player.id, report);
    return report;
  }

  private generatePersonalityTraits(player: Player, accuracy: number): string[] {
    const traits = (player as any).personality?.traits || [];
    const estimatedTraits = traits.map((t: string) => 
      Math.random() < accuracy ? t : '未知'
    );
    return estimatedTraits.slice(0, 3);
  }

  private generateSummary(player: Player, avgPower: number, potential: number, rec: string): string {
    const name = player.name;
    const position = player.position;
    
    if (rec === 'highly_recommended') {
      return `${name}是一名极具潜力的${position}选手，当前实力出众，未来上限极高，建议立即签下！`;
    } else if (rec === 'recommended') {
      return `${name}是一名实力不错的${position}选手，具有一定的发展空间，可以考虑签下。`;
    } else {
      return `${name}是一名${position}选手，目前实力有限，建议观望。`;
    }
  }

  getReport(playerId: string): PlayerReport | undefined {
    const report = this.reports.get(playerId);
    if (report && report.expiresAt > new Date()) {
      return report;
    }
    return undefined;
  }

  clearExpiredReports(): void {
    const now = new Date();
    for (const [playerId, report] of this.reports.entries()) {
      if (report.expiresAt <= now) {
        this.reports.delete(playerId);
      }
    }
  }
}

export const analystService = new AnalystService();
