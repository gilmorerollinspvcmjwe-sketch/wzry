import type { 
  SeasonObjective, 
  ObjectiveType, 
  ObjectiveDifficulty, 
  BoardExpectation,
  ExpectationLevel,
  SeasonEvaluation,
  ObjectiveReward,
  SeasonSummary 
} from '@/types/objective';

export class SeasonObjectiveService {
  private objectives: SeasonObjective[] = [];
  private boardExpectation: BoardExpectation | null = null;
  private currentSeason: number = 1;
  private currentYear: number = new Date().getFullYear();
  private currentPhase: 'spring' | 'summer' = 'spring';
  private currentWeek: number = 1;
  private seasonHistory: SeasonSummary[] = [];

  initialize(season: number = 1, year: number = new Date().getFullYear(), phase: 'spring' | 'summer' = 'spring'): void {
    this.currentSeason = season;
    this.currentYear = year;
    this.currentPhase = phase;
    this.currentWeek = 1;
    this.objectives = this.generateSeasonObjectives();
    this.boardExpectation = this.generateBoardExpectation();
  }

  private generateSeasonObjectives(): SeasonObjective[] {
    const objectives: SeasonObjective[] = [];

    objectives.push({
      id: 'obj_ranking',
      type: 'ranking',
      title: '冲击季后赛',
      description: '常规赛进入前 8 名',
      difficulty: 'medium',
      condition: { metric: 'final_ranking', target: 8, current: 0 },
      rewards: { funds: 100, reputation: 5, fans: 5000 },
      isPrimary: true,
      completed: false,
      failed: false,
    });

    objectives.push({
      id: 'obj_wins',
      type: 'wins',
      title: '胜利之战',
      description: '常规赛获得 10 场胜利',
      difficulty: 'easy',
      condition: { metric: 'total_wins', target: 10, current: 0 },
      rewards: { funds: 50, reputation: 3, fans: 2000 },
      isPrimary: false,
      completed: false,
      failed: false,
    });

    objectives.push({
      id: 'obj_reputation',
      type: 'reputation',
      title: '声望提升',
      description: '声望等级达到 20',
      difficulty: 'easy',
      condition: { metric: 'reputation', target: 20, current: 0 },
      rewards: { funds: 30, reputation: 5, fans: 1000 },
      isPrimary: false,
      completed: false,
      failed: false,
    });

    objectives.push({
      id: 'obj_financial',
      type: 'financial',
      title: '财务健康',
      description: '赛季末资金达到 200 万',
      difficulty: 'medium',
      condition: { metric: 'funds', target: 200, current: 0 },
      rewards: { funds: 50, reputation: 2, fans: 1000 },
      isPrimary: false,
      completed: false,
      failed: false,
    });

    objectives.push({
      id: 'obj_development',
      type: 'development',
      title: '明日之星',
      description: '培养一名潜力 85+ 的选手',
      difficulty: 'hard',
      condition: { metric: 'player_potential', target: 85, current: 0 },
      rewards: { funds: 100, reputation: 8, fans: 3000 },
      isPrimary: false,
      completed: false,
      failed: false,
    });

    return objectives;
  }

  private generateBoardExpectation(): BoardExpectation {
    const levels: ExpectationLevel[] = ['survival', 'playoff', 'championship', 'dynasty'];
    const randomLevel = levels[Math.floor(Math.random() * 2)];

    return {
      expectationLevel: randomLevel,
      primaryObjective: this.objectives.find(o => o.isPrimary) || null,
      secondaryObjectives: this.objectives.filter(o => !o.isPrimary),
      patience: 80,
      lastEvaluationWeek: 0,
      evaluation: {
        performance: 50,
        trend: 'stable',
        comments: '期待新赛季的表现',
      },
    };
  }

  updateProgress(metric: string, value: number): void {
    this.objectives.forEach(objective => {
      if (objective.condition.metric === metric && !objective.completed && !objective.failed) {
        objective.condition.current = value;
        
        if (value >= objective.condition.target) {
          this.completeObjective(objective.id);
        }
      }
    });
  }

  incrementProgress(metric: string, amount: number = 1): void {
    this.objectives.forEach(objective => {
      if (objective.condition.metric === metric && !objective.completed && !objective.failed) {
        objective.condition.current += amount;
        
        if (objective.condition.current >= objective.condition.target) {
          this.completeObjective(objective.id);
        }
      }
    });
  }

  private completeObjective(objectiveId: string): void {
    const objective = this.objectives.find(o => o.id === objectiveId);
    if (!objective || objective.completed) return;

    objective.completed = true;
  }

  failObjective(objectiveId: string): void {
    const objective = this.objectives.find(o => o.id === objectiveId);
    if (!objective || objective.completed) return;

    objective.failed = true;
    if (this.boardExpectation) {
      this.boardExpectation.patience -= 10;
    }
  }

  advanceWeek(): void {
    this.currentWeek++;
    
    if (this.boardExpectation) {
      if (this.currentWeek % 5 === 0) {
        this.evaluatePerformance();
      }
    }
  }

  private evaluatePerformance(): void {
    if (!this.boardExpectation) return;

    const wins = this.objectives.find(o => o.type === 'wins')?.condition.current || 0;
    const ranking = this.objectives.find(o => o.type === 'ranking')?.condition.current || 10;
    
    let performance = 50;
    
    if (wins >= 8) performance += 20;
    else if (wins >= 5) performance += 10;
    else if (wins < 3) performance -= 15;

    if (ranking <= 4) performance += 20;
    else if (ranking <= 8) performance += 10;
    else if (ranking > 10) performance -= 15;

    const trend = performance > this.boardExpectation.evaluation.performance + 10 
      ? 'up' 
      : performance < this.boardExpectation.evaluation.performance - 10 
        ? 'down' 
        : 'stable';

    this.boardExpectation.evaluation.performance = performance;
    this.boardExpectation.evaluation.trend = trend;
    this.boardExpectation.evaluation.comments = this.generateComment(performance, trend);
    this.boardExpectation.lastEvaluationWeek = this.currentWeek;

    if (performance < 30) {
      this.boardExpectation.patience -= 15;
    } else if (performance < 50) {
      this.boardExpectation.patience -= 5;
    } else if (performance > 70) {
      this.boardExpectation.patience += 5;
    }

    this.boardExpectation.patience = Math.max(0, Math.min(100, this.boardExpectation.patience));
  }

  private generateComment(performance: number, trend: 'up' | 'stable' | 'down'): string {
    if (performance >= 80) {
      return '表现非常出色！董事会非常满意';
    } else if (performance >= 60) {
      return '表现良好，继续保持';
    } else if (performance >= 40) {
      return '表现一般，需要更加努力';
    } else if (performance >= 20) {
      return '表现不佳，董事会已经开始担忧';
    } else {
      return '表现极差，可能面临解雇风险';
    }
  }

  evaluateSeason(finalRanking: number, totalWins: number, totalMatches: number, funds: number, reputation: number): SeasonSummary {
    const wins = totalWins;
    const losses = totalMatches - totalWins;
    const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

    const completedObjectives = this.objectives.filter(o => o.completed).length;
    const totalObjectives = this.objectives.length;

    let evaluation: SeasonEvaluation = 'C';
    if (this.boardExpectation && this.boardExpectation.patience >= 80 && completedObjectives >= totalObjectives * 0.8) {
      evaluation = 'S';
    } else if (this.boardExpectation && this.boardExpectation.patience >= 60 && completedObjectives >= totalObjectives * 0.6) {
      evaluation = 'A';
    } else if (this.boardExpectation && this.boardExpectation.patience >= 40 && completedObjectives >= totalObjectives * 0.4) {
      evaluation = 'B';
    } else if (this.boardExpectation && this.boardExpectation.patience < 20) {
      evaluation = 'D';
    }

    const rewards = this.calculateSeasonRewards(evaluation, completedObjectives);

    const summary: SeasonSummary = {
      season: this.currentSeason,
      year: this.currentYear,
      phase: this.currentPhase,
      evaluation,
      totalMatches,
      wins,
      losses,
      winRate,
      finalRanking,
      objectivesCompleted: completedObjectives,
      totalObjectives,
      rewards,
      boardComment: this.boardExpectation?.evaluation.comments || '',
    };

    this.seasonHistory.push(summary);
    return summary;
  }

  private calculateSeasonRewards(evaluation: SeasonEvaluation, completedObjectives: number): { funds: number; reputation: number; fans: number } {
    let funds = 0;
    let reputation = 0;
    let fans = 0;

    switch (evaluation) {
      case 'S':
        funds = 500;
        reputation = 30;
        fans = 20000;
        break;
      case 'A':
        funds = 300;
        reputation = 20;
        fans = 10000;
        break;
      case 'B':
        funds = 100;
        reputation = 10;
        fans = 5000;
        break;
      case 'C':
        funds = 50;
        reputation = 5;
        fans = 1000;
        break;
      case 'D':
        funds = 0;
        reputation = -10;
        fans = -5000;
        break;
    }

    funds += completedObjectives * 50;
    reputation += completedObjectives * 2;
    fans += completedObjectives * 1000;

    return { funds, reputation, fans };
  }

  getObjectives(): SeasonObjective[] {
    return [...this.objectives];
  }

  getPrimaryObjective(): SeasonObjective | null {
    return this.objectives.find(o => o.isPrimary) || null;
  }

  getSecondaryObjectives(): SeasonObjective[] {
    return this.objectives.filter(o => !o.isPrimary);
  }

  getBoardExpectation(): BoardExpectation | null {
    return this.boardExpectation;
  }

  getSeasonHistory(): SeasonSummary[] {
    return [...this.seasonHistory];
  }

  getCurrentWeek(): number {
    return this.currentWeek;
  }

  nextSeason(): void {
    this.currentSeason++;
    if (this.currentSeason % 2 === 1) {
      this.currentPhase = 'spring';
    } else {
      this.currentPhase = 'summer';
    }
    this.currentWeek = 1;
    this.objectives = this.generateSeasonObjectives();
    this.boardExpectation = this.generateBoardExpectation();
  }

  reset(): void {
    this.objectives = [];
    this.boardExpectation = null;
    this.seasonHistory = [];
    this.currentWeek = 1;
  }
}

export const seasonObjectiveService = new SeasonObjectiveService();
