import { defineStore } from 'pinia';
import { Player } from '@/core/models/Player';
import type { Position } from '@/types';

interface PlayerState {
  allPlayers: Player[];
  transferList: Player[];
  youthPlayers: Player[];
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
    // 生成随机选手
    generatePlayer(ageRange: [number, number], potentialRange: [number, number]): Player {
      const age = ageRange[0] + Math.floor(Math.random() * (ageRange[1] - ageRange[0] + 1));
      const potential = potentialRange[0] + Math.floor(Math.random() * (potentialRange[1] - potentialRange[0] + 1));
      const positions: Position[] = ['top', 'jungle', 'mid', 'adc', 'support'];
      const position = positions[Math.floor(Math.random() * positions.length)]!;
      const names = ['选手 A', '选手 B', '选手 C', '选手 D', '选手 E'];
      const name = names[Math.floor(Math.random() * names.length)]! + Math.floor(Math.random() * 100);
      
      return new Player(name, age, position, potential);
    },
    
    // 生成青训选手
    generateYouthPlayer(): Player {
      const player = this.generatePlayer([16, 18], [60, 95]);
      player.contract.salary = 5;
      return player;
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
    addPlayer(player: Player, toTransfer: boolean = false) {
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

    // 获取选手
    getPlayer(playerId: string): Player | undefined {
      return this.allPlayers.find(p => p.id === playerId);
    },
  },
  
  persist: true,
});
