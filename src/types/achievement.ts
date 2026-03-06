export type AchievementCategory = 
  | 'career'        
  | 'competition'   
  | 'management'    
  | 'development'   
  | 'social'        
  | 'special';

export type AchievementRarity = 
  | 'common'      
  | 'uncommon'    
  | 'rare'        
  | 'epic'        
  | 'legendary';

export type AchievementConditionType =
  | 'total_wins'
  | 'total_matches'
  | 'championships'
  | 'playoff_wins'
  | 'streak_wins'
  | 'streak_losses'
  | 'mvp_count'
  | 'kill_record'
  | 'assist_record'
  | 'win_rate'
  | 'star_players_developed'
  | 'youth_signings'
  | 'total_fans'
  | 'reputation_level'
  | 'funds_earned'
  | 'sponsors_signed'
  | 'matches_coached'
  | 'pentakill'
  | 'perfect_game'
  | 'first_blood_rate'
  | 'comeback_win';

export interface AchievementReward {
  funds?: number;
  reputation?: number;
  fans?: number;
  unlock?: string;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  category: AchievementCategory;
  rarity: AchievementRarity;
  
  condition: {
    type: AchievementConditionType;
    target: number;
  };
  
  rewards: AchievementReward;
  
  completed: boolean;
  completedAt?: Date;
  progress: number;
}

export interface AchievementProgress {
  achievementId: string;
  progress: number;
  target: number;
  percentage: number;
  isCompleted: boolean;
}

export interface AchievementMilestone {
  percentage: number;
  description: string;
  reached: boolean;
  reachedAt?: Date;
}

export interface AchievementNotification {
  achievementId: string;
  achievementName: string;
  achievementDescription: string;
  rarity: AchievementRarity;
  rewards: AchievementReward;
  timestamp: Date;
}
