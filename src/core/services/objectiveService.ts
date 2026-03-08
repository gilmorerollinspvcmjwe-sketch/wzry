import type { 
  SeasonObjective, 
  ObjectiveType, 
  ObjectiveDifficulty, 
  BoardExpectation,
  ExpectationLevel,
  SeasonEvaluation,
  ObjectiveReward,
  ObjectivePenalty,
  SeasonSummary,
  Milestone,
  MilestoneRecord,
  BoardExpectationItem,
  EvaluationRecord,
  ObjectiveCategory
} from '@/types/objective';

export class ObjectiveService {
  private objectives: SeasonObjective[] = [];
  private boardExpectation: BoardExpectation | null = null;
  private currentSeason: number = 1;
  private currentYear: number = new Date().getFullYear();
  private currentPhase: 'spring' | 'summer' = 'spring';
  private currentWeek: number = 1;
  private seasonHistory: SeasonSummary[] = [];
  private milestones: Milestone[] = [];
  private unlockedMilestones: MilestoneRecord[] = [];

  private defaultMilestones: Omit<Milestone, 'unlocked'>[] = [
    {
      id: 'milestone_first_win',
      title: '首胜',
      description: '获得第一场比赛胜利',
      type: 'achievement',
      condition: { metric: 'total_wins', target: 1 },
      rewards: { funds: 10, reputation: 2, fans: 500 },
    },
    {
      id: 'milestone_10_wins',
      title: '十胜里程碑',
      description: '累计获得10场比赛胜利',
      type: 'achievement',
      condition: { metric: 'total_wins', target: 10 },
      rewards: { funds: 50, reputation: 5, fans: 2000 },
    },
    {
      id: 'milestone_50_wins',
      title: '五十胜',
      description: '累计获得50场比赛胜利',
      type: 'record',
      condition: { metric: 'total_wins', target: 50 },
      rewards: { funds: 200, reputation: 15, fans: 10000 },
    },
    {
      id: 'milestone_100_wins',
      title: '百胜传奇',
      description: '累计获得100场比赛胜利',
      type: 'record',
      condition: { metric: 'total_wins', target: 100 },
      rewards: { funds: 500, reputation: 30, fans: 50000 },
    },
    {
      id: 'milestone_playoff',
      title: '季后赛之旅',
      description: '首次进入季后赛',
      type: 'achievement',
      condition: { metric: 'playoff_appearances', target: 1 },
      rewards: { funds: 100, reputation: 10, fans: 5000 },
    },
    {
      id: 'milestone_championship',
      title: '冠军荣耀',
      description: '获得第一个冠军',
      type: 'special',
      condition: { metric: 'championships', target: 1 },
      rewards: { funds: 300, reputation: 25, fans: 20000 },
    },
    {
      id: 'milestone_fans_10k',
      title: '万人迷',
      description: '粉丝数量达到10000',
      type: 'achievement',
      condition: { metric: 'fans', target: 10000 },
      rewards: { funds: 30, reputation: 3, fans: 1000 },
    },
    {
      id: 'milestone_fans_100k',
      title: '人气巨星',
      description: '粉丝数量达到100000',
      type: 'record',
      condition: { metric: 'fans', target: 100000 },
      rewards: { funds: 100, reputation: 10, fans: 5000 },
    },
    {
      id: 'milestone_reputation_50',
      title: '声名鹊起',
      description: '声望达到50',
      type: 'achievement',
      condition: { metric: 'reputation', target: 50 },
      rewards: { funds: 50, reputation: 5, fans: 2000 },
    },
    {
      id: 'milestone_reputation_80',
      title: '名震一方',
      description: '声望达到80',
      type: 'record',
      condition: { metric: 'reputation', target: 80 },
      rewards: { funds: 150, reputation: 15, fans: 8000 },
    },
  ];

  initialize(season: number = 1, year: number = new Date().getFullYear(), phase: 'spring' | 'summer' = 'spring'): void {
    this.currentSeason = season;
    this.currentYear = year;
    this.currentPhase = phase;
    this.currentWeek = 1;
    this.objectives = this.generateSeasonObjectives(season);
    this.boardExpectation = this.generateBoardExpectation(season);
    this.initializeMilestones();
  }

  private initializeMilestones(): void {
    this.milestones = this.defaultMilestones.map(m => ({
      ...m,
      unlocked: this.unlockedMilestones.some(um => um.milestoneId === m.id),
    }));
  }

  generateSeasonObjectives(season: number): SeasonObjective[] {
    const objectives: SeasonObjective[] = [];
    const difficulty = this.getDifficultyForSeason(season);

    objectives.push({
      id: 'obj_primary_ranking',
      type: 'ranking',
      title: '冲击季后赛',
      description: '常规赛进入前 8 名',
      difficulty: difficulty.primary,
      category: 'primary',
      condition: { metric: 'final_ranking', target: 8, current: 0 },
      rewards: { funds: 150, reputation: 8, fans: 8000 },
      penalty: { funds: -50, reputation: -5, patience: -15 },
      isPrimary: true,
      completed: false,
      failed: false,
      deadline: 16,
    });

    objectives.push({
      id: 'obj_wins',
      type: 'wins',
      title: '胜利之战',
      description: '常规赛获得 10 场胜利',
      difficulty: 'easy',
      category: 'secondary',
      condition: { metric: 'total_wins', target: 10, current: 0 },
      rewards: { funds: 60, reputation: 4, fans: 3000 },
      penalty: { patience: -5 },
      isPrimary: false,
      completed: false,
      failed: false,
    });

    objectives.push({
      id: 'obj_reputation',
      type: 'reputation',
      title: '声望提升',
      description: '声望等级达到 25',
      difficulty: 'easy',
      category: 'secondary',
      condition: { metric: 'reputation', target: 25, current: 0 },
      rewards: { funds: 40, reputation: 6, fans: 1500 },
      isPrimary: false,
      completed: false,
      failed: false,
    });

    objectives.push({
      id: 'obj_financial',
      type: 'financial',
      title: '财务健康',
      description: '赛季末资金达到 300 万',
      difficulty: 'medium',
      category: 'secondary',
      condition: { metric: 'funds', target: 300, current: 0 },
      rewards: { funds: 80, reputation: 3, fans: 2000 },
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
      category: 'secondary',
      condition: { metric: 'player_potential', target: 85, current: 0 },
      rewards: { funds: 120, reputation: 10, fans: 5000 },
      isPrimary: false,
      completed: false,
      failed: false,
    });

    objectives.push({
      id: 'obj_special_upset',
      type: 'championship',
      title: '黑马奇迹',
      description: '击败一支排名前 3 的队伍',
      difficulty: 'hard',
      category: 'special',
      condition: { metric: 'upset_wins', target: 1, current: 0 },
      rewards: { funds: 100, reputation: 12, fans: 6000, special: '黑马称号' },
      isPrimary: false,
      completed: false,
      failed: false,
    });

    objectives.push({
      id: 'obj_special_fans',
      type: 'fans',
      title: '粉丝狂欢',
      description: '单赛季粉丝增长 10000',
      difficulty: 'medium',
      category: 'special',
      condition: { metric: 'fans_growth', target: 10000, current: 0 },
      rewards: { funds: 50, reputation: 5, fans: 2000 },
      isPrimary: false,
      completed: false,
      failed: false,
    });

    return objectives;
  }

  private getDifficultyForSeason(season: number): { primary: ObjectiveDifficulty; secondary: ObjectiveDifficulty } {
    if (season <= 2) {
      return { primary: 'medium', secondary: 'easy' };
    } else if (season <= 4) {
      return { primary: 'hard', secondary: 'medium' };
    } else {
      return { primary: 'legend', secondary: 'hard' };
    }
  }

  private generateBoardExpectation(season: number): BoardExpectation {
    let level: ExpectationLevel;
    if (season <= 2) {
      level = 'survival';
    } else if (season <= 4) {
      level = 'playoff';
    } else if (season <= 6) {
      level = 'championship';
    } else {
      level = 'dynasty';
    }

    const expectations = this.generateExpectations(level);

    return {
      expectationLevel: level,
      primaryObjective: this.objectives.find(o => o.isPrimary) || null,
      secondaryObjectives: this.objectives.filter(o => o.category === 'secondary'),
      specialObjectives: this.objectives.filter(o => o.category === 'special'),
      patience: 80,
      lastEvaluationWeek: 0,
      evaluation: {
        performance: 50,
        trend: 'stable',
        comments: '期待新赛季的表现',
      },
      expectations,
      evaluations: [],
      fireRisk: 0,
    };
  }

  private generateExpectations(level: ExpectationLevel): BoardExpectationItem[] {
    const expectations: BoardExpectationItem[] = [];

    switch (level) {
      case 'survival':
        expectations.push({
          id: 'exp_survival',
          type: 'ranking',
          description: '避免降级（排名不低于第12名）',
          weight: 50,
          target: 12,
          current: 0,
          status: 'pending',
        });
        expectations.push({
          id: 'exp_wins',
          type: 'wins',
          description: '获得至少5场胜利',
          weight: 30,
          target: 5,
          current: 0,
          status: 'pending',
        });
        expectations.push({
          id: 'exp_financial',
          type: 'financial',
          description: '保持财务稳定',
          weight: 20,
          target: 100,
          current: 0,
          status: 'pending',
        });
        break;

      case 'playoff':
        expectations.push({
          id: 'exp_playoff',
          type: 'playoff',
          description: '进入季后赛（排名前8）',
          weight: 40,
          target: 8,
          current: 0,
          status: 'pending',
        });
        expectations.push({
          id: 'exp_wins',
          type: 'wins',
          description: '获得至少10场胜利',
          weight: 30,
          target: 10,
          current: 0,
          status: 'pending',
        });
        expectations.push({
          id: 'exp_reputation',
          type: 'reputation',
          description: '提升俱乐部声望',
          weight: 30,
          target: 10,
          current: 0,
          status: 'pending',
        });
        break;

      case 'championship':
        expectations.push({
          id: 'exp_championship',
          type: 'championship',
          description: '争夺冠军',
          weight: 50,
          target: 1,
          current: 0,
          status: 'pending',
        });
        expectations.push({
          id: 'exp_ranking',
          type: 'ranking',
          description: '常规赛排名前3',
          weight: 30,
          target: 3,
          current: 0,
          status: 'pending',
        });
        expectations.push({
          id: 'exp_fans',
          type: 'fans',
          description: '粉丝增长20%',
          weight: 20,
          target: 20,
          current: 0,
          status: 'pending',
        });
        break;

      case 'dynasty':
        expectations.push({
          id: 'exp_dynasty',
          type: 'championship',
          description: '建立王朝（连续夺冠）',
          weight: 60,
          target: 2,
          current: 0,
          status: 'pending',
        });
        expectations.push({
          id: 'exp_perfect',
          type: 'wins',
          description: '常规赛胜率超过70%',
          weight: 25,
          target: 70,
          current: 0,
          status: 'pending',
        });
        expectations.push({
          id: 'exp_legend',
          type: 'reputation',
          description: '声望达到传奇级别',
          weight: 15,
          target: 90,
          current: 0,
          status: 'pending',
        });
        break;
    }

    return expectations;
  }

  updateProgress(objectiveId: string, progress: number): SeasonObjective | null {
    const objective = this.objectives.find(o => o.id === objectiveId);
    if (!objective || objective.completed || objective.failed) return null;

    objective.condition.current = progress;
    objective.progress = Math.min(100, (progress / objective.condition.target) * 100);

    if (progress >= objective.condition.target) {
      this.completeObjective(objectiveId);
    }

    return objective;
  }

  updateProgressByMetric(metric: string, value: number): SeasonObjective[] {
    const updatedObjectives: SeasonObjective[] = [];

    this.objectives.forEach(objective => {
      if (objective.condition.metric === metric && !objective.completed && !objective.failed) {
        objective.condition.current = value;
        objective.progress = Math.min(100, (value / objective.condition.target) * 100);

        if (value >= objective.condition.target) {
          this.completeObjective(objective.id);
        }

        updatedObjectives.push(objective);
      }
    });

    this.checkMilestones(metric, value);

    return updatedObjectives;
  }

  incrementProgress(metric: string, amount: number = 1): SeasonObjective[] {
    const updatedObjectives: SeasonObjective[] = [];

    this.objectives.forEach(objective => {
      if (objective.condition.metric === metric && !objective.completed && !objective.failed) {
        objective.condition.current += amount;
        objective.progress = Math.min(100, (objective.condition.current / objective.condition.target) * 100);

        if (objective.condition.current >= objective.condition.target) {
          this.completeObjective(objective.id);
        }

        updatedObjectives.push(objective);
      }
    });

    return updatedObjectives;
  }

  checkCompletion(objectiveId: string): { completed: boolean; failed: boolean; progress: number } {
    const objective = this.objectives.find(o => o.id === objectiveId);
    if (!objective) {
      return { completed: false, failed: false, progress: 0 };
    }

    return {
      completed: objective.completed,
      failed: objective.failed,
      progress: objective.progress || 0,
    };
  }

  private completeObjective(objectiveId: string): void {
    const objective = this.objectives.find(o => o.id === objectiveId);
    if (!objective || objective.completed) return;

    objective.completed = true;
    objective.failed = false;

    if (this.boardExpectation) {
      this.boardExpectation.patience = Math.min(100, this.boardExpectation.patience + 5);
    }
  }

  failObjective(objectiveId: string): void {
    const objective = this.objectives.find(o => o.id === objectiveId);
    if (!objective || objective.completed) return;

    objective.failed = true;
    objective.completed = false;

    if (this.boardExpectation && objective.penalty) {
      if (objective.penalty.patience) {
        this.boardExpectation.patience = Math.max(0, this.boardExpectation.patience + objective.penalty.patience);
      }
    }
  }

  evaluateBoardExpectations(clubId: string): BoardExpectation {
    if (!this.boardExpectation) {
      throw new Error('Board expectation not initialized');
    }

    const wins = this.objectives.find(o => o.type === 'wins')?.condition.current || 0;
    const ranking = this.objectives.find(o => o.type === 'ranking')?.condition.current || 10;

    let performance = 50;

    if (wins >= 12) performance += 25;
    else if (wins >= 8) performance += 15;
    else if (wins >= 5) performance += 5;
    else if (wins < 3) performance -= 20;

    if (ranking <= 4) performance += 25;
    else if (ranking <= 8) performance += 15;
    else if (ranking <= 10) performance += 5;
    else if (ranking > 12) performance -= 20;

    const completedCount = this.objectives.filter(o => o.completed).length;
    const totalCount = this.objectives.length;
    performance += (completedCount / totalCount) * 20;

    performance = Math.max(0, Math.min(100, performance));

    const previousPerformance = this.boardExpectation.evaluation.performance;
    const trend = performance > previousPerformance + 10 
      ? 'up' 
      : performance < previousPerformance - 10 
        ? 'down' 
        : 'stable';

    const comment = this.generateEvaluationComment(performance, trend);

    const evaluationRecord: EvaluationRecord = {
      week: this.currentWeek,
      performance,
      trend,
      comment,
      patienceChange: 0,
    };

    let patienceChange = 0;
    if (performance < 30) {
      patienceChange = -20;
    } else if (performance < 50) {
      patienceChange = -10;
    } else if (performance > 70) {
      patienceChange = 5;
    } else if (performance > 85) {
      patienceChange = 10;
    }

    evaluationRecord.patienceChange = patienceChange;

    this.boardExpectation.evaluation = {
      performance,
      trend,
      comments: comment,
    };
    this.boardExpectation.lastEvaluationWeek = this.currentWeek;
    this.boardExpectation.patience = Math.max(0, Math.min(100, this.boardExpectation.patience + patienceChange));
    this.boardExpectation.evaluations.push(evaluationRecord);

    this.boardExpectation.fireRisk = this.calculateFireRisk(clubId);

    this.updateExpectationStatus();

    return this.boardExpectation;
  }

  private updateExpectationStatus(): void {
    if (!this.boardExpectation) return;

    this.boardExpectation.expectations.forEach(exp => {
      const objective = this.objectives.find(o => o.type === exp.type);
      if (objective) {
        exp.current = objective.condition.current;
        if (objective.completed) {
          exp.status = 'completed';
        } else if (objective.failed) {
          exp.status = 'failed';
        } else if (exp.current > 0) {
          exp.status = 'in_progress';
        }
      }
    });
  }

  calculateFireRisk(clubId: string): number {
    if (!this.boardExpectation) return 0;

    let risk = 0;

    if (this.boardExpectation.patience < 20) {
      risk += 60;
    } else if (this.boardExpectation.patience < 40) {
      risk += 30;
    } else if (this.boardExpectation.patience < 60) {
      risk += 10;
    }

    if (this.boardExpectation.evaluation.trend === 'down') {
      risk += 15;
    }

    const primaryFailed = this.objectives.find(o => o.isPrimary)?.failed;
    if (primaryFailed) {
      risk += 25;
    }

    const completedRate = this.objectives.filter(o => o.completed).length / this.objectives.length;
    if (completedRate < 0.3) {
      risk += 20;
    }

    return Math.min(100, risk);
  }

  private generateEvaluationComment(performance: number, trend: 'up' | 'stable' | 'down'): string {
    const trendText = trend === 'up' ? '呈上升趋势' : trend === 'down' ? '呈下降趋势' : '保持稳定';

    if (performance >= 85) {
      return `表现卓越！${trendText}，董事会非常满意`;
    } else if (performance >= 70) {
      return `表现优秀，${trendText}，继续保持`;
    } else if (performance >= 55) {
      return `表现良好，${trendText}，还有提升空间`;
    } else if (performance >= 40) {
      return `表现一般，${trendText}，需要更加努力`;
    } else if (performance >= 25) {
      return `表现不佳，${trendText}，董事会已经开始担忧`;
    } else {
      return `表现极差，${trendText}，面临解雇风险`;
    }
  }

  private checkMilestones(metric: string, value: number): Milestone[] {
    const newlyUnlocked: Milestone[] = [];

    this.milestones.forEach(milestone => {
      if (!milestone.unlocked && milestone.condition.metric === metric && value >= milestone.condition.target) {
        milestone.unlocked = true;
        milestone.unlockedAt = Date.now();
        milestone.season = this.currentSeason;

        const record: MilestoneRecord = {
          milestoneId: milestone.id,
          title: milestone.title,
          unlockedAt: milestone.unlockedAt,
          season: this.currentSeason,
        };
        this.unlockedMilestones.push(record);
        newlyUnlocked.push(milestone);
      }
    });

    return newlyUnlocked;
  }

  advanceWeek(): void {
    this.currentWeek++;

    if (this.boardExpectation && this.currentWeek % 4 === 0) {
      this.evaluateBoardExpectations('player');
    }

    this.objectives.forEach(objective => {
      if (objective.deadline && this.currentWeek > objective.deadline && !objective.completed) {
        this.failObjective(objective.id);
      }
    });
  }

  evaluateSeason(finalRanking: number, totalWins: number, totalMatches: number, funds: number, reputation: number): SeasonSummary {
    const wins = totalWins;
    const losses = totalMatches - totalWins;
    const winRate = totalMatches > 0 ? (wins / totalMatches) * 100 : 0;

    const completedObjectives = this.objectives.filter(o => o.completed);
    const totalObjectives = this.objectives.length;
    const primaryCompleted = this.objectives.find(o => o.isPrimary)?.completed || false;
    const secondaryCompleted = completedObjectives.filter(o => o.category === 'secondary').length;
    const specialCompleted = completedObjectives.filter(o => o.category === 'special').length;

    let evaluation: SeasonEvaluation = 'C';
    if (this.boardExpectation) {
      if (this.boardExpectation.patience >= 80 && completedObjectives.length >= totalObjectives * 0.8) {
        evaluation = 'S';
      } else if (this.boardExpectation.patience >= 60 && completedObjectives.length >= totalObjectives * 0.6) {
        evaluation = 'A';
      } else if (this.boardExpectation.patience >= 40 && completedObjectives.length >= totalObjectives * 0.4) {
        evaluation = 'B';
      } else if (this.boardExpectation.patience < 20) {
        evaluation = 'D';
      }
    }

    const rewards = this.calculateSeasonRewards(evaluation, completedObjectives.length);
    const penalty = this.calculateSeasonPenalty(evaluation, primaryCompleted);

    const seasonMilestones = this.unlockedMilestones.filter(m => m.season === this.currentSeason);

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
      objectivesCompleted: completedObjectives.length,
      totalObjectives,
      primaryCompleted,
      secondaryCompleted,
      specialCompleted,
      rewards,
      penalty,
      boardComment: this.boardExpectation?.evaluation.comments || '',
      milestones: seasonMilestones,
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
        funds = 600;
        reputation = 35;
        fans = 25000;
        break;
      case 'A':
        funds = 400;
        reputation = 25;
        fans = 15000;
        break;
      case 'B':
        funds = 150;
        reputation = 12;
        fans = 6000;
        break;
      case 'C':
        funds = 50;
        reputation: 5;
        fans = 1000;
        break;
      case 'D':
        funds = 0;
        reputation = -15;
        fans = -8000;
        break;
    }

    funds += completedObjectives * 60;
    reputation += completedObjectives * 3;
    fans += completedObjectives * 1500;

    return { funds, reputation, fans };
  }

  private calculateSeasonPenalty(evaluation: SeasonEvaluation, primaryCompleted: boolean): ObjectivePenalty {
    const penalty: ObjectivePenalty = {};

    if (evaluation === 'D') {
      penalty.funds = -100;
      penalty.reputation = -20;
      penalty.patience = -30;
    } else if (evaluation === 'C') {
      penalty.patience = -15;
    }

    if (!primaryCompleted) {
      penalty.patience = (penalty.patience || 0) - 20;
    }

    return penalty;
  }

  getObjectives(): SeasonObjective[] {
    return [...this.objectives];
  }

  getPrimaryObjective(): SeasonObjective | null {
    return this.objectives.find(o => o.isPrimary) || null;
  }

  getSecondaryObjectives(): SeasonObjective[] {
    return this.objectives.filter(o => o.category === 'secondary');
  }

  getSpecialObjectives(): SeasonObjective[] {
    return this.objectives.filter(o => o.category === 'special');
  }

  getBoardExpectation(): BoardExpectation | null {
    return this.boardExpectation;
  }

  getSeasonHistory(): SeasonSummary[] {
    return [...this.seasonHistory];
  }

  getMilestones(): Milestone[] {
    return [...this.milestones];
  }

  getUnlockedMilestones(): MilestoneRecord[] {
    return [...this.unlockedMilestones];
  }

  getCurrentWeek(): number {
    return this.currentWeek;
  }

  getCurrentSeason(): number {
    return this.currentSeason;
  }

  nextSeason(): void {
    this.currentSeason++;
    if (this.currentSeason % 2 === 1) {
      this.currentPhase = 'spring';
    } else {
      this.currentPhase = 'summer';
    }
    this.currentWeek = 1;
    this.objectives = this.generateSeasonObjectives(this.currentSeason);
    this.boardExpectation = this.generateBoardExpectation(this.currentSeason);
  }

  reset(): void {
    this.objectives = [];
    this.boardExpectation = null;
    this.seasonHistory = [];
    this.currentWeek = 1;
    this.unlockedMilestones = [];
    this.milestones = [];
  }
}

export const objectiveService = new ObjectiveService();
