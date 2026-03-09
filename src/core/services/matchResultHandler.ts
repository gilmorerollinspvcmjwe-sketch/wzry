// 比赛结果处理服务 - 处理比赛后的各种数据更新

import type { Match } from '@/core/models/Match';
import type { MatchContext } from '@/types/matchCallback';
import { usePlayerStore } from '@/stores/player';
import { useClubStore } from '@/stores/club';
import { useAchievementStore } from '@/stores/achievement';
import { useSeasonObjectiveStore } from '@/stores/seasonObjective';
import { useLeagueStatisticsStore } from '@/stores/leagueStatistics';

export class MatchResultHandler {
  // 处理比赛结束后的所有数据更新
  static async handleMatchEnd(match: Match, context: MatchContext): Promise<void> {
    await this.updatePlayerData(match, context);
    await this.updateAchievements(match, context);
    await this.updateSeasonObjectives(match, context);
    await this.updateLeagueStatistics(match, context);
  }

  // 更新选手数据
  private static async updatePlayerData(match: Match, context: MatchContext): Promise<void> {
    const playerStore = usePlayerStore();
    const clubStore = useClubStore();
    
    const playerClubId = clubStore.club?.id || '';
    const isPlayerMatch = match.homeTeam.clubId === playerClubId || match.awayTeam.clubId === playerClubId;
    
    if (!isPlayerMatch) return;
    
    const playerTeam = match.homeTeam.clubId === playerClubId ? match.homeTeam : match.awayTeam;
    const opponentTeam = match.homeTeam.clubId === playerClubId ? match.awayTeam : match.homeTeam;
    
    const playerWon = context.playerWon;
    
    // 更新每位选手的数据
    for (const matchPlayer of playerTeam.players) {
      const player = playerStore.getPlayer(matchPlayer.id);
      if (!player) continue;
      
      // 增加经验值
      if (player.develop) {
        const expGain = playerWon ? 3 : 1;
        player.develop.addExperience(expGain);
      }
      
      // 更新生涯统计
      if ((player as any).careerStats) {
        (player as any).careerStats.matches++;
        if (playerWon) {
          (player as any).careerStats.wins++;
        } else {
          (player as any).careerStats.losses++;
        }
      }
      
      // 更新疲劳度
      const matchDuration = match.stats?.duration || 1200;
      const fatigueGain = Math.floor(matchDuration / 300);
      if ((player as any).condition) {
        (player as any).condition.stamina = Math.max(0, (player as any).condition.stamina - fatigueGain);
      }
    }
  }

  // 更新成就进度
  private static async updateAchievements(match: Match, context: MatchContext): Promise<void> {
    const achievementStore = useAchievementStore();
    
    if (!context.isPlayerMatch) return;
    
    // 更新胜场成就
    if (context.playerWon) {
      achievementStore.incrementProgress('total_wins', 1);
      
      // 检查5连胜、10连胜
      const totalWins = achievementStore.achievements.find(a => a.id === 'ten_wins')?.progress || 0;
      if (totalWins >= 5) {
        achievementStore.incrementProgress('streak_wins', 1);
      }
    }
    
    // 更新总比赛场次
    achievementStore.incrementProgress('total_matches', 1);
    achievementStore.incrementProgress('matches_coached', 1);
  }

  // 更新赛季目标进度
  private static async updateSeasonObjectives(match: Match, context: MatchContext): Promise<void> {
    const objectiveStore = useSeasonObjectiveStore();
    
    if (!context.isPlayerMatch) return;
    
    // 更新胜场数目标
    if (context.playerWon) {
      objectiveStore.incrementProgress('total_wins', 1);
    }
    
    // 更新财务目标（基于比赛收入）
    const clubStore = useClubStore();
    const matchRevenue = context.playerWon ? 50 : 20;
    if (clubStore.club) {
      const currentFunds = clubStore.club.funds;
      objectiveStore.updateProgress('funds', currentFunds);
    }
  }

  // 更新联赛统计
  private static async updateLeagueStatistics(match: Match, context: MatchContext): Promise<void> {
    const statisticsStore = useLeagueStatisticsStore();
    
    if (!statisticsStore.isInitialized) {
      statisticsStore.initialize();
    }
    
    // 记录比赛数据
    statisticsStore.recordMatch(match, []);
  }
}

// 注册到回调系统
import { matchCallbackService } from '@/core/services/matchCallbackService';
import { PRIORITY } from '@/types/matchCallback';

matchCallbackService.register(
  'match_end',
  MatchResultHandler.handleMatchEnd,
  'MatchResultHandler',
  PRIORITY.HIGH
);
