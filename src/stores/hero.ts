import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Hero, VersionChange } from '@/core/models/Hero'
import { heroes } from '@/data/heroes'

export const useHeroStore = defineStore('hero', () => {
  // State
  const allHeroes = ref<Hero[]>(heroes)
  const isLoading = ref(false)
  const error = ref<string | null>(null)

  // Getters
  const getHeroById = computed(() => {
    return (heroId: string) => allHeroes.value.find(h => h.id === heroId)
  })

  const getHeroesByRole = computed(() => {
    return (role: string) => allHeroes.value.filter(h => h.role === role)
  })

  const getMetaHeroes = computed(() => {
    return allHeroes.value.filter(h => h.tier <= 2)
  })

  const getHeroesByTag = computed(() => {
    return (tag: string) => allHeroes.value.filter(h => h.tags.includes(tag))
  })

  // 获取克制某英雄的英雄列表
  const getCounters = computed(() => {
    return (heroId: string) => {
      const hero = allHeroes.value.find(h => h.id === heroId)
      return hero ? allHeroes.value.filter(h => hero.counteredBy.includes(h.id)) : []
    }
  })

  // 获取被某英雄克制的英雄列表
  const getCounteredBy = computed(() => {
    return (heroId: string) => {
      const hero = allHeroes.value.find(h => h.id === heroId)
      return hero ? allHeroes.value.filter(h => hero.counters.includes(h.id)) : []
    }
  })

  // 获取某英雄的版本变化历史
  const getVersionHistory = computed(() => {
    return (heroId: string) => {
      const hero = allHeroes.value.find(h => h.id === heroId)
      return hero?.versionHistory || []
    }
  })

  // Actions
  function getHeroTierColor(tier: number): string {
    const colors: Record<number, string> = {
      0: '#ff4d4f', // T0 - 红色
      1: '#ff7a45', // T1 - 橙色
      2: '#ffa940', // T2 - 黄色
      3: '#73d13d', // T3 - 绿色
      4: '#40a9ff', // T4 - 蓝色
      5: '#8c8c8c'  // T5 - 灰色
    }
    return colors[tier] || '#8c8c8c'
  }

  function getRoleIcon(role: string): string {
    const icons: Record<string, string> = {
      tank: '🛡️',
      fighter: '⚔️',
      assassin: '🗡️',
      mage: '🔮',
      marksman: '🏹',
      support: '💚'
    }
    return icons[role] || '❓'
  }

  function getRoleName(role: string): string {
    const names: Record<string, string> = {
      tank: '坦克',
      fighter: '战士',
      assassin: '刺客',
      mage: '法师',
      marksman: '射手',
      support: '辅助'
    }
    return names[role] || role
  }

  // 获取版本变化类型文本
  function getChangeTypeText(type: VersionChange['change']): string {
    const texts: Record<VersionChange['change'], string> = {
      'buff': '增强',
      'nerf': '削弱',
      'adjust': '调整',
      'rework': '重做'
    }
    return texts[type]
  }

  // 获取版本变化类型颜色
  function getChangeTypeColor(type: VersionChange['change']): string {
    const colors: Record<VersionChange['change'], string> = {
      'buff': '#52c41a',
      'nerf': '#ff4d4f',
      'adjust': '#faad14',
      'rework': '#722ed1'
    }
    return colors[type]
  }

  // 获取所有标签列表
  const allTags = computed(() => {
    const tagSet = new Set<string>()
    allHeroes.value.forEach(hero => {
      hero.tags.forEach(tag => tagSet.add(tag))
    })
    return Array.from(tagSet)
  })

  // 更新英雄强度（版本更新时调用）
  function updateHeroTier(heroId: string, _newTier: 0 | 1 | 2 | 3 | 4 | 5, change: VersionChange) {
    const hero = allHeroes.value.find(h => h.id === heroId)
    if (hero) {
      hero.addVersionChange(change)
    }
  }

  return {
    // State
    allHeroes,
    isLoading,
    error,
    
    // Getters
    getHeroById,
    getHeroesByRole,
    getMetaHeroes,
    getHeroesByTag,
    getCounters,
    getCounteredBy,
    getVersionHistory,
    allTags,
    
    // Actions
    getHeroTierColor,
    getRoleIcon,
    getRoleName,
    getChangeTypeText,
    getChangeTypeColor,
    updateHeroTier
  }
})
