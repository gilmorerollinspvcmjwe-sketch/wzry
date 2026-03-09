// 比赛回调系统服务

import type { Match } from '@/core/models/Match';
import type { MatchContext, CallbackRegistration, PlayerMatchData, MatchResultCallback } from '@/types/matchCallback';
import { PRIORITY } from '@/types/matchCallback';

class MatchCallbackService {
  private callbacks: Map<string, CallbackRegistration[]> = new Map();
  private enabled: boolean = true;

  constructor() {
    this.callbacks.set('match_end', []);
    this.callbacks.set('player_performance', []);
    this.callbacks.set('achievement_check', []);
    this.callbacks.set('objective_update', []);
    this.callbacks.set('media_update', []);
    this.callbacks.set('statistics_update', []);
  }

  register(eventType: string, callback: MatchResultCallback, name: string, priority: number = PRIORITY.NORMAL): string {
    const id = `cb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const registration: CallbackRegistration = {
      id,
      name,
      callback,
      priority,
      enabled: true,
    };

    const eventCallbacks = this.callbacks.get(eventType) || [];
    eventCallbacks.push(registration);
    
    eventCallbacks.sort((a, b) => b.priority - a.priority);
    
    this.callbacks.set(eventType, eventCallbacks);
    
    return id;
  }

  unregister(eventType: string, callbackId: string): boolean {
    const eventCallbacks = this.callbacks.get(eventType);
    if (!eventCallbacks) return false;

    const index = eventCallbacks.findIndex(cb => cb.id === callbackId);
    if (index === -1) return false;

    eventCallbacks.splice(index, 1);
    return true;
  }

  async trigger(eventType: string, match: Match, context: MatchContext): Promise<void> {
    if (!this.enabled) return;

    const eventCallbacks = this.callbacks.get(eventType);
    if (!eventCallbacks) return;

    for (const registration of eventCallbacks) {
      if (!registration.enabled) continue;

      try {
        await registration.callback(match, context);
      } catch (error) {
        console.error(`[MatchCallback] Error in ${registration.name}:`, error);
      }
    }
  }

  enable(): void {
    this.enabled = true;
  }

  disable(): void {
    this.enabled = false;
  }

  isEnabled(): boolean {
    return this.enabled;
  }

  getCallbacks(eventType: string): CallbackRegistration[] {
    return this.callbacks.get(eventType) || [];
  }

  clear(eventType?: string): void {
    if (eventType) {
      this.callbacks.set(eventType, []);
    } else {
      for (const key of this.callbacks.keys()) {
        this.callbacks.set(key, []);
      }
    }
  }
}

export const matchCallbackService = new MatchCallbackService();
