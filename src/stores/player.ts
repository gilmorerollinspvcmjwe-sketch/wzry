import { defineStore } from 'pinia';
import { PlayerClass } from '@/core/models/Player';
import type { Position } from '@/types';
import { generatePlayer as generatePlayerService, generateYouthPlayer as generateYouthPlayerService } from '@/core/services/playerGenerator';

// 使用PlayerClass类型
interface PlayerState {
  allPlayers: PlayerClass[];
  transferList: PlayerClass[];
  youthPlayers: PlayerClass[];
}

export const usePlayerStore = defineStore('player', {
  state: (): PlayerState => ({
    allPlayers: [],
    transferList: [],
    youthPlayers: [],
  }),
  
  getters: {
    // 按位置筛选
    playersByPosition: (state) => {
      return (position: Position) => state.allPlayers.filter(p => p.position === position);
    },
    
    // 可签约选手
    availablePlayers: (state) => {
      return state.transferList.filter(p => p.contract.endDate <= new Date());
    },
    
    // 明星选手
    starPlayers: (state) => {
      return state.allPlayers.filter(p => p.getAverageStats() > 80);
    },
  },
  
  actions: {
    // 生成随机选手 - 复用 playerGenerator 服务
    generatePlayer(ageRange: [number, number], potentialRange: [number, number]): PlayerClass {
      const player = generatePlayerService({
        age: ageRange[0] + Math.floor(Math.random() * (ageRange[1] - ageRange[0] + 1)),
        potential: potentialRange[0] + Math.floor(Math.random() * (potentialRange[1] - potentialRange[0] + 1)),
      });
      return player as PlayerClass;
    },
    
    // 生成青训选手 - 复用 playerGenerator 服务
    generateYouthPlayer(): PlayerClass {
      return generateYouthPlayerService() as PlayerClass;
    },
    
    // 更新选手状态
    updatePlayerConditions() {
      this.allPlayers.forEach(player => {
        player.recover();
      });
    },
    
    // 训练选手
    trainPlayer(playerId: string, statType: keyof import('@/types').PlayerStats) {
      const player = this.allPlayers.find(p => p.id === playerId);
      if (!player || player.condition.stamina < 20) return false;
      
      player.consumeStamina(20);
      player.trainStat(statType, 2);
      return true;
    },
    
    // 添加选手到列表
    addPlayer(player: PlayerClass, toTransfer: boolean = false) {
      this.allPlayers.push(player);
      if (toTransfer) {
        this.transferList.push(player);
      }
    },
    
    // 移除选手
    removePlayer(playerId: string) {
      this.allPlayers = this.allPlayers.filter(p => p.id !== playerId);
      this.transferList = this.transferList.filter(p => p.id !== playerId);
      this.youthPlayers = this.youthPlayers.filter(p => p.id !== playerId);
    },

    // 恢复选手状态
    recoverPlayer(playerId: string) {
      const player = this.allPlayers.find(p => p.id === playerId);
      if (player) {
        player.recover();
      }
    },

    // 获取选手 - 返回any类型因为Pinia持久化后类型会丢失
    getPlayer(playerId: string): any {
      return this.allPlayers.find(p => p.id === playerId);
    },
  },
  
  persist: true,
});
