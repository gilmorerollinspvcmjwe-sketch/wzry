import { EventRarity, DEFAULT_EVENT_CONFIG } from '@/types/events';
import type { GameEvent, ActiveEvent, EventHistory, EventTriggerCondition, EventConsequences } from '@/types/events';
import { events } from '@/data/events';

/**
 * 事件触发系统
 */
export class EventTriggerSystem {
  // 当前进行中的事件
  private activeEvents: ActiveEvent[] = [];
  
  // 事件历史
  private eventHistory: EventHistory[] = [];
  
  // 上次触发事件的天数
  private lastTriggerDay: number = -1;
  
  // 配置
  private config = DEFAULT_EVENT_CONFIG;
  
  /**
   * 检查并触发每日事件
   */
  triggerDailyEvent(currentDay: number, clubState: ClubState): ActiveEvent[] {
    // 检查是否到了新的一天
    if (currentDay === this.lastTriggerDay) {
      return [];
    }
    this.lastTriggerDay = currentDay;
    
    // 检查是否可以进行新事件
    if (this.activeEvents.length >= this.config.maxActiveEvents) {
      return [];
    }
    
    // 检查距离上次事件是否过了足够天数
    const daysSinceLastEvent = currentDay - this.lastTriggerDay;
    if (daysSinceLastEvent < this.config.minDaysBetweenEvents) {
      return [];
    }
    
    // 基于概率决定是否触发事件
    if (Math.random() > this.config.baseTriggerChance) {
      return [];
    }
    
    // 筛选可用事件
    const availableEvents = this.filterAvailableEvents(clubState);
    
    if (availableEvents.length === 0) {
      return [];
    }
    
    // 根据稀有度权重选择事件
    const selectedEvent = this.selectEventByRarity(availableEvents);
    
    if (!selectedEvent) {
      return [];
    }
    
    // 创建进行中的事件
    const activeEvent: ActiveEvent = {
      ...selectedEvent,
      triggeredAt: new Date(),
    };
    
    // 添加到进行中的事件列表
    this.activeEvents.push(activeEvent);
    
    return [activeEvent];
  }
  
  /**
   * 筛选可用事件
   */
  private filterAvailableEvents(clubState: ClubState): GameEvent[] {
    return events.filter(event => {
      // 检查是否已经触发过（避免重复）
      const alreadyTriggered = this.eventHistory.some(h => h.eventId === event.id);
      if (alreadyTriggered && event.rarity !== EventRarity.COMMON) {
        return false; // 稀有事件不重复触发
      }
      
      // 检查触发条件
      return this.checkTriggerConditions(event.triggerConditions, clubState);
    });
  }
  
  /**
   * 检查触发条件
   */
  private checkTriggerConditions(conditions: EventTriggerCondition, clubState: ClubState): boolean {
    // 俱乐部条件
    if (conditions.minReputation !== undefined && clubState.reputation < conditions.minReputation) {
      return false;
    }
    if (conditions.maxReputation !== undefined && clubState.reputation > conditions.maxReputation) {
      return false;
    }
    if (conditions.minFunds !== undefined && clubState.funds < conditions.minFunds) {
      return false;
    }
    if (conditions.maxFunds !== undefined && clubState.funds > conditions.maxFunds) {
      return false;
    }
    if (conditions.minFans !== undefined && clubState.fans < conditions.minFans) {
      return false;
    }
    
    // 赛季条件
    if (conditions.seasonPhase !== undefined && clubState.seasonPhase !== conditions.seasonPhase) {
      return false;
    }
    if (conditions.minWeek !== undefined && clubState.week < conditions.minWeek) {
      return false;
    }
    if (conditions.maxWeek !== undefined && clubState.week > conditions.maxWeek) {
      return false;
    }
    
    // 成绩条件
    if (conditions.minRanking !== undefined && clubState.ranking > conditions.minRanking) {
      return false;
    }
    if (conditions.maxRanking !== undefined && clubState.ranking < conditions.maxRanking) {
      return false;
    }
    if (conditions.minWinRate !== undefined && clubState.winRate < conditions.minWinRate) {
      return false;
    }
    
    // 选手条件
    if (conditions.hasPlayer !== undefined && !clubState.hasPlayer(conditions.hasPlayer)) {
      return false;
    }
    if (conditions.playerCount !== undefined && clubState.playerCount !== conditions.playerCount) {
      return false;
    }
    
    return true;
  }
  
  /**
   * 根据稀有度权重选择事件
   */
  private selectEventByRarity(availableEvents: GameEvent[]): GameEvent | null {
    // 按稀有度分组
    const eventsByRarity: Record<EventRarity, GameEvent[]> = {
      [EventRarity.COMMON]: [],
      [EventRarity.UNCOMMON]: [],
      [EventRarity.RARE]: [],
      [EventRarity.EPIC]: [],
    };
    
    availableEvents.forEach(event => {
      eventsByRarity[event.rarity].push(event);
    });
    
    // 根据权重随机选择稀有度
    const random = Math.random();
    let cumulative = 0;
    let selectedRarity: EventRarity = EventRarity.COMMON;
    
    for (const [rarity, weight] of Object.entries(this.config.rarityWeights)) {
      cumulative += weight;
      if (random < cumulative) {
        selectedRarity = rarity as EventRarity;
        break;
      }
    }
    
    // 从选中的稀有度中随机选择一个事件
    const selectedEvents = eventsByRarity[selectedRarity];
    if (selectedEvents.length === 0) {
      // 如果该稀有度没有可用事件，降级到下一个稀有度
      return this.selectNextRarityEvent(eventsByRarity, selectedRarity);
    }
    
    const randomIndex = Math.floor(Math.random() * selectedEvents.length);
    return selectedEvents[randomIndex] || null;
  }
  
  /**
   * 选择下一个稀有度的事件
   */
  private selectNextRarityEvent(
    eventsByRarity: Record<EventRarity, GameEvent[]>,
    currentRarity: EventRarity
  ): GameEvent | null {
    const rarityOrder: EventRarity[] = [
      EventRarity.COMMON,
      EventRarity.UNCOMMON,
      EventRarity.RARE,
      EventRarity.EPIC,
    ];
    
    const currentIndex = rarityOrder.indexOf(currentRarity);
    for (let i = currentIndex - 1; i >= 0; i--) {
      const nextRarity = rarityOrder[i];
      if (nextRarity) {
        const nextEvents = eventsByRarity[nextRarity];
        if (nextEvents && nextEvents.length > 0) {
          const randomIndex = Math.floor(Math.random() * nextEvents.length);
          return nextEvents[randomIndex] || null;
        }
      }
    }
    
    return null;
  }
  
  /**
   * 选择事件选项
   */
  selectEventOption(eventId: string, optionId: string): EventConsequences | null {
    const eventIndex = this.activeEvents.findIndex(e => e.id === eventId);
    if (eventIndex === -1) {
      return null;
    }
    
    const event = this.activeEvents[eventIndex];
    if (!event) {
      return null;
    }
    
    const option = event.options.find(o => o.id === optionId);
    
    if (!option) {
      return null;
    }
    
    // 更新事件状态
    event.selectedOptionId = optionId;
    event.resolvedAt = new Date();
    
    // 记录到历史
    this.eventHistory.push({
      eventId: event.id,
      title: event.title,
      category: event.category,
      triggeredAt: event.triggeredAt!,
      resolvedAt: event.resolvedAt,
      selectedOption: option.text,
      consequences: option.consequences,
    });
    
    // 从进行中的事件移除
    this.activeEvents.splice(eventIndex, 1);
    
    return option.consequences;
  }
  
  /**
   * 获取进行中的事件
   */
  getActiveEvents(): ActiveEvent[] {
    return [...this.activeEvents];
  }
  
  /**
   * 获取事件历史
   */
  getEventHistory(limit: number = 50): EventHistory[] {
    return this.eventHistory.slice(-limit);
  }
  
  /**
   * 清除过期事件
   */
  clearExpiredEvents(currentDay: number): void {
    this.activeEvents = this.activeEvents.filter(event => {
      if (!event.duration || !event.triggeredAt) {
        return true;
      }
      
      const daysSinceTrigger = currentDay - Math.floor(event.triggeredAt.getTime() / (1000 * 60 * 60 * 24));
      return daysSinceTrigger < event.duration;
    });
  }
  
  /**
   * 重置系统
   */
  reset(): void {
    this.activeEvents = [];
    this.eventHistory = [];
    this.lastTriggerDay = -1;
  }
}

/**
 * 俱乐部状态接口（用于事件触发条件检查）
 */
export interface ClubState {
  // 基础数据
  funds: number;
  reputation: number;
  fans: number;
  week: number;
  ranking: number;
  winRate: number;
  seasonPhase: 'regular' | 'playoff' | 'offseason';
  playerCount: number;
  
  // 方法
  hasPlayer: (playerType: string) => boolean;
}

// 导出单例
export const eventTriggerSystem = new EventTriggerSystem();
