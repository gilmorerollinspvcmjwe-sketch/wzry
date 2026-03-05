import type { Group, TournamentType, TournamentStatus, Reward } from '@/types';
import { Match } from './Match';

export interface Standing {
  clubId: string;
  group: Group;
  wins: number;
  losses: number;
  points: number;
  gameDiff: number;
  rank: number;
}

export class Tournament {
  id: string;
  name: string;
  type: TournamentType;
  season: number;
  year: number;
  
  // 参赛队伍
  participants: Standing[];
  
  // 赛程
  schedule: Match[];
  
  // 状态
  status: TournamentStatus;
  
  // 时间
  startDate: Date;
  endDate: Date;
  
  // 奖励
  rewards: {
    champion: Reward;
    runnerUp: Reward;
    semifinal: Reward;
    participant: Reward;
  };
  
  // 当前轮次
  currentRound: number;
  totalRounds: number;
  
  constructor(
    name: string,
    type: TournamentType,
    season: number,
    year: number,
    clubs: string[]
  ) {
    this.id = `tournament_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.name = name;
    this.type = type;
    this.season = season;
    this.year = year;
    
    // 初始化参赛队伍
    this.participants = clubs.map((clubId, index) => ({
      clubId,
      group: this.assignGroup(index),
      wins: 0,
      losses: 0,
      points: 0,
      gameDiff: 0,
      rank: index + 1,
    }));
    
    this.schedule = [];
    this.status = 'upcoming';
    this.startDate = new Date();
    this.endDate = new Date();
    this.currentRound = 1;
    this.totalRounds = 10;
    
    // 设置奖励
    this.rewards = this.generateRewards(type);
  }
  
  // 分配分组
  private assignGroup(index: number): Group {
    // S组: 0-5, A组: 6-11, B组: 12-17
    if (index < 6) return 'S';
    if (index < 12) return 'A';
    return 'B';
  }
  
  // 生成奖励
  private generateRewards(type: TournamentType): {
    champion: Reward;
    runnerUp: Reward;
    semifinal: Reward;
    participant: Reward;
  } {
    const baseRewards = {
      spring: { champion: 300, runnerUp: 150, semifinal: 80, participant: 20 },
      autumn: { champion: 300, runnerUp: 150, semifinal: 80, participant: 20 },
      playoff: { champion: 500, runnerUp: 250, semifinal: 120, participant: 50 },
      finals: { champion: 1000, runnerUp: 500, semifinal: 200, participant: 100 },
      worlds: { champion: 2000, runnerUp: 1000, semifinal: 500, participant: 200 },
    };
    
    const rewards = baseRewards[type];
    
    return {
      champion: {
        money: rewards.champion,
        reputation: type === 'worlds' ? 200 : 100,
        fans: type === 'worlds' ? 100000 : 50000,
      },
      runnerUp: {
        money: rewards.runnerUp,
        reputation: type === 'worlds' ? 100 : 50,
        fans: type === 'worlds' ? 50000 : 25000,
      },
      semifinal: {
        money: rewards.semifinal,
        reputation: type === 'worlds' ? 50 : 30,
        fans: type === 'worlds' ? 25000 : 15000,
      },
      participant: {
        money: rewards.participant,
        reputation: 10,
        fans: 5000,
      },
    };
  }
  
  // 开始赛事
  start(): void {
    this.status = 'ongoing';
    this.startDate = new Date();
  }
  
  // 结束赛事
  finish(): void {
    this.status = 'completed';
    this.endDate = new Date();
  }
  
  // 更新排名
  updateStandings(): void {
    // 按积分排序，积分相同按净胜分排序
    this.participants.sort((a, b) => {
      if (b.points !== a.points) {
        return b.points - a.points;
      }
      return b.gameDiff - a.gameDiff;
    });
    
    // 更新排名
    this.participants.forEach((p, index) => {
      p.rank = index + 1;
    });
  }
  
  // 获取某组的队伍
  getGroupTeams(group: Group): Standing[] {
    return this.participants.filter(p => p.group === group);
  }
  
  // 获取晋级队伍（每组前 4 名）
  getQualifiedTeams(): Standing[] {
    const qualified: Standing[] = [];
    ['S', 'A', 'B'].forEach(group => {
      const teams = this.getGroupTeams(group as Group);
      qualified.push(...teams.slice(0, 4));
    });
    return qualified;
  }
  
  // 获取冠军
  getChampion(): Standing | null {
    if (this.status !== 'completed') return null;
    return this.participants[0] || null;
  }
  
  // 添加比赛结果
  addMatchResult(match: Match): void {
    if (match.result === 'pending') return;
    
    const homeTeam = this.participants.find(p => p.clubId === match.homeTeam.clubId);
    const awayTeam = this.participants.find(p => p.clubId === match.awayTeam.clubId);
    
    if (!homeTeam || !awayTeam) return;
    
    if (match.result === 'win') {
      homeTeam.wins++;
      homeTeam.points += 3;
      awayTeam.losses++;
    } else {
      awayTeam.wins++;
      awayTeam.points += 3;
      homeTeam.losses++;
    }
    
    // 更新净胜分
    const diff = match.homeTeam.score - match.awayTeam.score;
    homeTeam.gameDiff += diff;
    awayTeam.gameDiff -= diff;
    
    // 更新排名
    this.updateStandings();
  }
  
  // 升降级
  promoteAndRelegate(): { promoted: string[]; relegated: string[] } {
    const promoted: string[] = [];
    const relegated: string[] = [];
    
    // S组后 2 名降级到 A组
    const sGroup = this.getGroupTeams('S');
    relegated.push(...sGroup.slice(-2).map(p => p.clubId));
    
    // A组前 2 名升级到 S组
    const aGroup = this.getGroupTeams('A');
    promoted.push(...aGroup.slice(0, 2).map(p => p.clubId));
    
    // A组后 2 名降级到 B组
    relegated.push(...aGroup.slice(-2).map(p => p.clubId));
    
    // B组前 2 名升级到 A组
    const bGroup = this.getGroupTeams('B');
    promoted.push(...bGroup.slice(0, 2).map(p => p.clubId));
    
    return { promoted, relegated };
  }
}
