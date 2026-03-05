// 趣味比赛战报系统服务

import type {
  BattleReport,
  PreMatchAnalysis,
  GamePhaseReport,
  BattleEvent,
  MatchConclusion,
  PlayerPerformance,
  GameState,
  KeyMatchup,
} from '@/types/battleReport';
import type { Club } from '@/core/models/Club';
import type { Player } from '@/core/models/Player';
import type { Position } from '@/types';

export class BattleReportService {
  // 生成完整战报
  static generateBattleReport(home: Club, away: Club, winner: 'home' | 'away'): BattleReport {
    const gameState: GameState = {
      currentTime: 0,
      homeMomentum: 50,
      awayMomentum: 50,
      homeGold: 0,
      awayGold: 0,
      homeKills: 0,
      awayKills: 0,
      eventHistory: [],
    };

    return {
      preMatch: this.generatePreMatchAnalysis(home, away),
      earlyGame: this.generatePhaseReport('early', home, away, gameState),
      midGame: this.generatePhaseReport('mid', home, away, gameState),
      lateGame: this.generatePhaseReport('late', home, away, gameState),
      conclusion: this.generateConclusion(home, away, winner, gameState),
    };
  }

  // 生成赛前分析
  private static generatePreMatchAnalysis(home: Club, away: Club): PreMatchAnalysis {
    const summary: string[] = [];
    
    // 实力对比（使用类型断言访问方法，Pinia持久化后方法会丢失）
    const homePower = (home as any).getTotalPower?.() || 0;
    const awayPower = (away as any).getTotalPower?.() || 0;
    const diff = Math.abs(homePower - awayPower);
    
    if (diff < 5) {
      summary.push(`🏟️ **焦点之战** | 两队实力接近（${homePower} vs ${awayPower}），这将是一场势均力敌的较量！`);
    } else if (homePower > awayPower) {
      summary.push(`📊 **实力差距** | ${home.name}整体实力占优（${homePower} vs ${awayPower}），但${away.name}能否爆冷？`);
    } else {
      summary.push(`📊 **实力差距** | ${away.name}实力更强（${awayPower} vs ${homePower}），${home.name}需要超水平发挥！`);
    }

    // 关键对位
    const keyMatchups = this.analyzeKeyMatchups(home, away);
    
    // 近期状态
    const homeForm = this.getRecentForm(home);
    const awayForm = this.getRecentForm(away);
    summary.push(`📈 **近期状态** | ${home.name}: ${homeForm} | ${away.name}: ${awayForm}`);

    // 预测
    const predictions = this.generatePredictions(home, away, homePower, awayPower);

    return {
      summary,
      keyMatchups,
      predictions,
    };
  }

  // 分析关键对位
  private static analyzeKeyMatchups(home: Club, away: Club): KeyMatchup[] {
    const positions: Position[] = ['top', 'jungle', 'mid', 'adc', 'support'];
    const matchups: KeyMatchup[] = [];

    positions.forEach(pos => {
      const homePlayer = home.roster.find(p => p.position === pos);
      const awayPlayer = away.roster.find(p => p.position === pos);

      if (homePlayer && awayPlayer) {
        const homeStat = (homePlayer as any).getTotalPower?.() || 0;
        const awayStat = (awayPlayer as any).getTotalPower?.() || 0;
        const diff = homeStat - awayStat;

        let prediction: string;
        if (Math.abs(diff) < 3) {
          prediction = '势均力敌的对决';
        } else if (diff > 0) {
          prediction = `${home.name}占优`;
        } else {
          prediction = `${away.name}占优`;
        }

        matchups.push({
          position: this.getPositionName(pos),
          homePlayer: homePlayer.name,
          awayPlayer: awayPlayer.name,
          homeStat,
          awayStat,
          prediction,
        });
      }
    });

    return matchups;
  }

  // 获取位置中文名
  private static getPositionName(pos: Position): string {
    const names: Record<Position, string> = {
      top: '对抗路',
      jungle: '打野',
      mid: '中路',
      adc: '发育路',
      support: '游走',
    };
    return names[pos];
  }

  // 获取近期状态
  private static getRecentForm(_club: Club): string {
    // 模拟近期战绩
    const winRate = Math.random() * 100;
    if (winRate > 70) return '🔥 火热（近5场4胜）';
    if (winRate > 50) return '✅ 稳定（近5场3胜）';
    if (winRate > 30) return '⚠️ 起伏（近5场2胜）';
    return '❄️ 低迷（近5场1胜）';
  }

  // 生成预测
  private static generatePredictions(home: Club, away: Club, homePower: number, awayPower: number): string {
    const diff = homePower - awayPower;
    
    if (Math.abs(diff) < 5) {
      return '专家预测：胜负难料，可能打满五局';
    } else if (diff > 10) {
      return `专家预测：${home.name}大概率3-0或3-1获胜`;
    } else if (diff > 0) {
      return `专家预测：${home.name}稍占优势，预计3-2险胜`;
    } else if (diff < -10) {
      return `专家预测：${away.name}优势明显，可能速战速决`;
    } else {
      return `专家预测：${away.name}略占上风，比赛可能很胶着`;
    }
  }

  // 生成阶段战报
  private static generatePhaseReport(
    phase: 'early' | 'mid' | 'late',
    home: Club,
    away: Club,
    gameState: GameState
  ): GamePhaseReport {
    const narrative: string[] = [];
    const keyEvents: BattleEvent[] = [];
    
    // 根据阶段生成不同数量的事件
    const eventCount = phase === 'early' ? 2 : phase === 'mid' ? 3 : 2;
    
    for (let i = 0; i < eventCount; i++) {
      const event = this.generateBattleEvent(phase, home, away, gameState);
      keyEvents.push(event);
      narrative.push(event.description);
      
      // 更新游戏状态
      gameState.currentTime += Math.floor(Math.random() * 300) + 180; // 3-8分钟
      if (event.winner === 'home') {
        gameState.homeMomentum += event.momentumShift;
        gameState.awayMomentum -= event.momentumShift;
        gameState.homeGold += event.goldSwing;
        gameState.homeKills += Math.floor(Math.random() * 3) + 1;
      } else {
        gameState.awayMomentum += event.momentumShift;
        gameState.homeMomentum -= event.momentumShift;
        gameState.awayGold += event.goldSwing;
        gameState.awayKills += Math.floor(Math.random() * 3) + 1;
      }
      gameState.eventHistory.push(event);
    }

    return {
      phase,
      duration: phase === 'early' ? 900 : phase === 'mid' ? 900 : 600, // 15min / 15min / 10min
      narrative,
      keyEvents,
      phaseStats: {
        homeKills: gameState.homeKills,
        awayKills: gameState.awayKills,
        homeGold: gameState.homeGold,
        awayGold: gameState.awayGold,
        homeTowers: Math.floor(gameState.homeGold / 3000),
        awayTowers: Math.floor(gameState.awayGold / 3000),
      },
    };
  }

  // 生成比赛事件
  private static generateBattleEvent(
    phase: 'early' | 'mid' | 'late',
    home: Club,
    away: Club,
    gameState: GameState
  ): BattleEvent {
    // 根据阶段选择事件类型
    const eventTypes: Record<string, string[]> = {
      early: ['solo_kill', 'gank', 'first_blood'],
      mid: ['teamfight', 'dragon', 'objective'],
      late: ['teamfight', 'baron', 'turnaround'],
    };
    
    const types = eventTypes[phase] || ['solo_kill'];
    const type = types[Math.floor(Math.random() * types.length)] || 'solo_kill';

    switch (type) {
      case 'solo_kill':
        return this.generateSoloKillEvent(home, away, gameState);
      case 'teamfight':
        return this.generateTeamfightEvent(home, away, gameState);
      case 'first_blood':
        return this.generateFirstBloodEvent(home, away, gameState);
      default:
        return this.generateSoloKillEvent(home, away, gameState);
    }
  }

  // 生成单杀事件
  private static generateSoloKillEvent(home: Club, away: Club, gameState: GameState): BattleEvent {
    const positions: Position[] = ['top', 'mid'];
    const position = positions[Math.floor(Math.random() * positions.length)] || 'top';
    
    const homePlayer = home.roster.find(p => p.position === position);
    const awayPlayer = away.roster.find(p => p.position === position);
    
    if (!homePlayer || !awayPlayer) {
      // 如果找不到选手，返回一个默认事件
      return {
        time: gameState.currentTime,
        type: 'solo_kill',
        title: '💥 单杀！',
        description: '一名选手完成单杀！',
        highlight: '比赛局势发生变化！',
        statBreakdown: [],
        winner: 'home',
        goldSwing: 300,
        momentumShift: 15,
      };
    }

    // 计算单杀概率
    const homeScore = (homePlayer.stats.mechanics + homePlayer.stats.awareness + homePlayer.condition.mentality) / 3;
    const awayScore = (awayPlayer.stats.mechanics + awayPlayer.stats.awareness + awayPlayer.condition.mentality) / 3;

    // 加入随机性
    const homeRoll = homeScore + Math.random() * 20;
    const awayRoll = awayScore + Math.random() * 20;

    const winner = homeRoll > awayRoll ? 'home' : 'away';
    const winnerPlayer = winner === 'home' ? homePlayer : awayPlayer;
    const loserPlayer = winner === 'home' ? awayPlayer : homePlayer;

    return {
      time: gameState.currentTime,
      type: 'solo_kill',
      title: `💥 ${this.getPositionName(position)}单杀！`,
      description: `${winnerPlayer.name}抓住机会完成单杀！`,
      highlight: winner === 'home' 
        ? `${home.name}的${this.getPositionName(position)}路开始建立优势！`
        : `${away.name}的${this.getPositionName(position)}路压制力十足！`,
      statBreakdown: [
        {
          player: winnerPlayer.name,
          relevantStat: '操作',
          statValue: winnerPlayer.stats.mechanics,
          impact: `操作${winnerPlayer.stats.mechanics}带来精准技能释放`,
          rollResult: winner === 'home' ? homeRoll : awayRoll,
        },
        {
          player: loserPlayer.name,
          relevantStat: '心态',
          statValue: loserPlayer.condition.mentality,
          impact: `心态${loserPlayer.condition.mentality}导致关键时刻失误`,
          rollResult: winner === 'home' ? awayRoll : homeRoll,
        },
      ],
      winner,
      goldSwing: 300 + Math.floor(Math.random() * 200),
      momentumShift: 15,
    };
  }

  // 生成团战事件
  private static generateTeamfightEvent(home: Club, away: Club, gameState: GameState): BattleEvent {
    // 计算团队属性
    const homeTeamwork = this.getAverageStat(home, 'teamwork');
    const awayTeamwork = this.getAverageStat(away, 'teamwork');
    const homeMechanics = this.getAverageStat(home, 'mechanics');
    const awayMechanics = this.getAverageStat(away, 'mechanics');

    // 团战是多轮对抗
    const rounds = 3 + Math.floor(Math.random() * 2);
    let homeWins = 0;
    let awayWins = 0;

    const roundDescriptions: string[] = [];

    for (let i = 0; i < rounds; i++) {
      if (i === 0) {
        // 第一轮：开团（意识+心态）
        const homeInitiate = (this.getAverageStat(home, 'awareness') + this.getAverageMentality(home)) / 2;
        const awayInitiate = (this.getAverageStat(away, 'awareness') + this.getAverageMentality(away)) / 2;

        if (homeInitiate + Math.random() * 15 > awayInitiate) {
          homeWins++;
          roundDescriptions.push(`第${i + 1}轮：${home.name}抓住机会先手开团！`);
        } else {
          awayWins++;
          roundDescriptions.push(`第${i + 1}轮：${away.name}反打成功！`);
        }
      } else {
        // 后续轮次：操作+配合
        const homePower = homeMechanics * 0.6 + homeTeamwork * 0.4;
        const awayPower = awayMechanics * 0.6 + awayTeamwork * 0.4;

        if (homePower + Math.random() * 10 > awayPower) {
          homeWins++;
          roundDescriptions.push(`第${i + 1}轮：${home.name}配合默契，打出精彩连招！`);
        } else {
          awayWins++;
          roundDescriptions.push(`第${i + 1}轮：${away.name}操作拉满，完成收割！`);
        }
      }
    }

    const winner = homeWins > awayWins ? 'home' : 'away';

    return {
      time: gameState.currentTime,
      type: 'teamfight',
      title: `⚔️ 大规模团战！`,
      description: roundDescriptions.join('\n'),
      highlight: winner === 'home'
        ? `${home.name}团战配合更胜一筹，${homeWins}:${awayWins}拿下团战！`
        : `${away.name}个人操作碾压，${awayWins}:${homeWins}赢得团战！`,
      statBreakdown: [
        {
          player: `${home.name}团队`,
          relevantStat: '团队配合',
          statValue: homeTeamwork,
          impact: `配合度${homeTeamwork}，${homeWins}轮胜出`,
          rollResult: homeWins,
        },
        {
          player: `${away.name}团队`,
          relevantStat: '个人操作',
          statValue: awayMechanics,
          impact: `平均操作${awayMechanics}，${awayWins}轮胜出`,
          rollResult: awayWins,
        },
      ],
      winner,
      goldSwing: (homeWins + awayWins) * 200 + Math.floor(Math.random() * 300),
      momentumShift: 25,
    };
  }

  // 生成一血事件
  private static generateFirstBloodEvent(home: Club, away: Club, gameState: GameState): BattleEvent {
    const homeJungler = home.roster.find(p => p.position === 'jungle');
    const awayJungler = away.roster.find(p => p.position === 'jungle');
    
    // 如果找不到打野，返回默认事件
    if (!homeJungler || !awayJungler) {
      return {
        time: gameState.currentTime,
        type: 'first_blood',
        title: '🩸 First Blood！',
        description: '一名选手拿到一血！',
        highlight: '开局就爆发激烈对抗！',
        statBreakdown: [],
        winner: 'home',
        goldSwing: 400,
        momentumShift: 20,
      };
    }

    // 打野gank成功率
    const homeGank = homeJungler.stats.awareness * 0.6 + homeJungler.stats.mechanics * 0.4;
    const awayGank = awayJungler.stats.awareness * 0.6 + awayJungler.stats.mechanics * 0.4;

    const homeRoll = homeGank + Math.random() * 15;
    const awayRoll = awayGank + Math.random() * 15;

    const winner = homeRoll > awayRoll ? 'home' : 'away';
    const winnerJungler = winner === 'home' ? homeJungler : awayJungler;

    return {
      time: gameState.currentTime,
      type: 'first_blood',
      title: `🩸 First Blood！`,
      description: `${winnerJungler.name}成功gank，拿到一血！`,
      highlight: `${winner === 'home' ? home.name : away.name}开局取得优势！`,
      statBreakdown: [
        {
          player: winnerJungler.name,
          relevantStat: '意识',
          statValue: winnerJungler.stats.awareness,
          impact: `意识${winnerJungler.stats.awareness}精准判断gank时机`,
          rollResult: winner === 'home' ? homeRoll : awayRoll,
        },
      ],
      winner,
      goldSwing: 400,
      momentumShift: 20,
    };
  }

  // 获取平均属性
  private static getAverageStat(club: Club, stat: keyof Player['stats']): number {
    if (!club.roster || club.roster.length === 0) return 0;
    const total = club.roster.reduce((sum, p) => sum + (p.stats?.[stat] || 0), 0);
    return total / club.roster.length;
  }

  // 获取平均心态
  private static getAverageMentality(club: Club): number {
    if (!club.roster || club.roster.length === 0) return 0;
    const total = club.roster.reduce((sum, p) => sum + (p.condition?.mentality || 0), 0);
    return total / club.roster.length;
  }

  // 生成赛后总结
  private static generateConclusion(
    home: Club,
    away: Club,
    winner: 'home' | 'away',
    gameState: GameState
  ): MatchConclusion {
    const winnerClub = winner === 'home' ? home : away;

    const highlights: string[] = [];

    // 找出MVP
    const mvp = this.selectMVP(winnerClub);
    highlights.push(`🏆 **MVP** | ${mvp.name} - 关键表现带领队伍获胜`);

    // 关键转折点
    const turningPoint = gameState.eventHistory.find(e => Math.abs(e.momentumShift) > 20);
    if (turningPoint) {
      highlights.push(`🔄 **转折点** | ${Math.floor(turningPoint.time / 60)}分钟 - ${turningPoint.title}`);
    }

    // 数据亮点
    highlights.push(`📊 **数据之最** | 总击杀 ${gameState.homeKills + gameState.awayKills}，经济差 ${Math.abs(gameState.homeGold - gameState.awayGold)}`);

    // 胜负分析
    const analysis = winner === 'home'
      ? `${winnerClub.name}凭借更出色的团队配合和关键选手的发挥，成功拿下比赛！`
      : `${winnerClub.name}在关键时刻抓住机会，完成逆转！`;

    return {
      winner: winnerClub.name,
      score: winner === 'home' ? '3-2' : '2-3',
      duration: this.formatDuration(gameState.currentTime),
      highlights,
      analysis,
    };
  }

  // 选择MVP
  private static selectMVP(club: Club): Player {
    // 简单选择：选评分最高的
    if (!club.roster || club.roster.length === 0) {
      throw new Error('Club has no players');
    }
    return club.roster.reduce((best, p) => 
      ((p as any).getTotalPower?.() || 0) > ((best as any).getTotalPower?.() || 0) ? p : best
    );
  }

  // 格式化时长
  private static formatDuration(seconds: number): string {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  }

  // 生成选手表现数据
  static generatePlayerPerformances(home: Club, away: Club): PlayerPerformance[] {
    const performances: PlayerPerformance[] = [];

    [...home.roster, ...away.roster].forEach(player => {
      const kills = Math.floor(Math.random() * 8) + 1;
      const deaths = Math.floor(Math.random() * 6);
      const assists = Math.floor(Math.random() * 12) + 3;
      const gold = (kills * 300 + assists * 150 + Math.floor(Math.random() * 5000)) + 8000;
      const damage = gold * 1.5 + Math.floor(Math.random() * 10000);

      performances.push({
        playerId: player.id,
        playerName: player.name,
        position: this.getPositionName(player.position),
        kills,
        deaths,
        assists,
        gold,
        damage,
        rating: (kills * 3 + assists - deaths * 2) + ((player as any).getTotalPower?.() || 0) / 10,
        description: this.generatePerformanceDescription(player, kills, deaths, assists),
        impact: this.generateImpactDescription(player, kills, deaths),
      });
    });

    return performances.sort((a, b) => b.rating - a.rating);
  }

  // 生成表现描述
  private static generatePerformanceDescription(_player: Player, kills: number, deaths: number, assists: number): string {
    if (kills >= 6 && deaths <= 2) return 'carry全场，完美表现';
    if (kills >= 4 && assists >= 8) return '输出与助攻兼备，团队核心';
    if (deaths >= 5) return '被针对严重，但仍在努力';
    if (assists >= 10) return '默默奉献的幕后英雄';
    return '表现稳定，完成任务';
  }

  // 生成影响描述
  private static generateImpactDescription(_player: Player, kills: number, deaths: number): string {
    const kda = deaths > 0 ? (kills + Math.floor(kills * 0.5)) / deaths : kills;
    if (kda >= 4) return '关键先生';
    if (kda >= 2) return '稳定输出';
    if (kda >= 1) return '表现一般';
    return '需要调整';
  }
}
