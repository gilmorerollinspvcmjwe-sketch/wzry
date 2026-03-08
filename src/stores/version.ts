import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type {
  GameVersion,
  VersionAdaptation,
  VersionResearch,
  VersionAdaptationBonus,
} from '@/types/version';
import { DEFAULT_VERSION_ADAPTATION_BONUS, createDefaultVersionAdaptation } from '@/types/version';
import {
  getCurrentVersion,
  getVersionHistory,
  applyVersionUpdate,
  type VersionData,
  type HeroBalanceChange,
} from '@/core/services/versionUpdateService';
import { useHeroStore } from './hero';

export const useVersionStore = defineStore('version', () => {
  const currentVersion = ref<VersionData | null>(null);
  const versionHistory = ref<Array<{ version: string; date: Date; heroCount: number }>>([]);
  const hasUpdate = ref(false);
  
  const currentGameVersion = ref<GameVersion | null>(null);
  const pendingVersion = ref<GameVersion | null>(null);
  const adaptations = ref<Record<string, VersionAdaptation>>({});
  const researches = ref<Record<string, VersionResearch[]>>({});
  const notifications = ref<Array<{ version: GameVersion; showAt: Date; isRead: boolean }>>([]);

  const versionNumber = computed(() => currentGameVersion.value?.version || currentVersion.value?.version || '1.0.0');
  const releaseDate = computed(() => currentGameVersion.value?.releaseDate || currentVersion.value?.releaseDate || new Date());
  const description = computed(() => currentGameVersion.value?.characteristics?.description || currentVersion.value?.description || '初始版本');
  const heroChanges = computed(() => currentGameVersion.value?.heroChanges || []);
  const itemChanges = computed(() => currentGameVersion.value?.itemChanges || []);
  const mechanicChanges = computed(() => currentGameVersion.value?.mechanicChanges || []);
  const characteristics = computed(() => currentGameVersion.value?.characteristics || null);
  const patchNotes = computed(() => currentGameVersion.value?.patchNotes || '');

  const buffs = computed(() => heroChanges.value.filter(h => h.changeType === 'buff'));
  const nerfs = computed(() => heroChanges.value.filter(h => h.changeType === 'nerf'));
  const reworks = computed(() => heroChanges.value.filter(h => h.changeType === 'rework'));
  const newHeroes = computed(() => heroChanges.value.filter(h => h.changeType === 'new'));

  const hasPendingUpdate = computed(() => pendingVersion.value !== null);

  function refreshVersion(): void {
    const version = getCurrentVersion();
    if (version) {
      currentVersion.value = version;
    }
    versionHistory.value = getVersionHistory();
  }

  function checkForUpdate(): boolean {
    const latestVersion = getCurrentVersion();
    if (latestVersion && latestVersion.version !== currentVersion.value?.version) {
      hasUpdate.value = true;
      return true;
    }
    hasUpdate.value = false;
    return false;
  }

  function applyUpdate(
    version: string,
    description: string,
    heroChanges: HeroBalanceChange[]
  ): { patchNotes: string } {
    const result = applyVersionUpdate(
      [],
      version,
      description,
      heroChanges
    );
    refreshVersion();
    return result;
  }

  function clearUpdateFlag(): void {
    hasUpdate.value = false;
  }

  function setCurrentVersion(version: GameVersion): void {
    currentGameVersion.value = version;
    
    const heroStore = useHeroStore();
    if (version.heroChanges && version.heroChanges.length > 0) {
      version.heroChanges.forEach(change => {
        const newTier = Math.max(0, Math.min(5, change.tierChange)) as 0 | 1 | 2 | 3 | 4 | 5;
        heroStore.updateHeroTier(change.heroId, newTier, {
          version: version.version,
          changeType: change.changeType,
          description: change.description,
          date: new Date()
        });
      });
    }
    
    Object.keys(adaptations.value).forEach(clubId => {
      const adaptation = adaptations.value[clubId];
      if (adaptation && adaptation.currentVersion !== version.version) {
        adaptation.currentVersion = version.version;
        adaptation.adaptationLevel = Math.max(0, adaptation.adaptationLevel - 30);
        adaptation.researchProgress = Math.max(0, adaptation.researchProgress - 50);
      }
    });
  }

  function setPendingVersion(version: GameVersion): void {
    pendingVersion.value = version;
    hasUpdate.value = true;
  }

  function clearPendingVersion(): void {
    pendingVersion.value = null;
    hasUpdate.value = false;
  }

  function getAdaptation(clubId: string): VersionAdaptation | undefined {
    return adaptations.value[clubId];
  }

  function setAdaptation(clubId: string, adaptation: VersionAdaptation): void {
    adaptations.value[clubId] = adaptation;
  }

  function initAdaptation(clubId: string): VersionAdaptation {
    if (!adaptations.value[clubId]) {
      adaptations.value[clubId] = createDefaultVersionAdaptation(clubId);
      adaptations.value[clubId].currentVersion = versionNumber.value;
    }
    return adaptations.value[clubId];
  }

  function updateAdaptationLevel(clubId: string, level: number): void {
    if (adaptations.value[clubId]) {
      adaptations.value[clubId].adaptationLevel = Math.min(100, Math.max(0, level));
    }
  }

  function addKnownMetaHero(clubId: string, heroId: string): void {
    if (adaptations.value[clubId]) {
      if (!adaptations.value[clubId].knownMetaHeroes.includes(heroId)) {
        adaptations.value[clubId].knownMetaHeroes.push(heroId);
      }
    }
  }

  function addKnownComposition(clubId: string, compositionId: string): void {
    if (adaptations.value[clubId]) {
      if (!adaptations.value[clubId].knownCompositions.includes(compositionId)) {
        adaptations.value[clubId].knownCompositions.push(compositionId);
      }
    }
  }

  function getResearches(clubId: string): VersionResearch[] {
    return researches.value[clubId] || [];
  }

  function addResearch(clubId: string, research: VersionResearch): void {
    if (!researches.value[clubId]) {
      researches.value[clubId] = [];
    }
    researches.value[clubId].push(research);
  }

  function getAdaptationBonus(clubId: string): VersionAdaptationBonus {
    const adaptation = adaptations.value[clubId];
    return adaptation?.bonuses || { ...DEFAULT_VERSION_ADAPTATION_BONUS };
  }

  function getAdaptationLevel(clubId: string): number {
    return adaptations.value[clubId]?.adaptationLevel || 0;
  }

  function getKnownMetaHeroes(clubId: string): string[] {
    return adaptations.value[clubId]?.knownMetaHeroes || [];
  }

  function addNotification(version: GameVersion): void {
    notifications.value.push({
      version,
      showAt: new Date(),
      isRead: false,
    });
  }

  function markNotificationRead(index: number): void {
    if (notifications.value[index]) {
      notifications.value[index].isRead = true;
    }
  }

  function getUnreadNotifications(): Array<{ version: GameVersion; showAt: Date; isRead: boolean }> {
    return notifications.value.filter(n => !n.isRead);
  }

  function clearAdaptation(clubId: string): void {
    delete adaptations.value[clubId];
    delete researches.value[clubId];
  }

  return {
    currentVersion,
    versionHistory,
    hasUpdate,
    currentGameVersion,
    pendingVersion,
    adaptations,
    researches,
    notifications,
    versionNumber,
    releaseDate,
    description,
    heroChanges,
    itemChanges,
    mechanicChanges,
    characteristics,
    patchNotes,
    buffs,
    nerfs,
    reworks,
    newHeroes,
    hasPendingUpdate,
    refreshVersion,
    checkForUpdate,
    applyUpdate,
    clearUpdateFlag,
    setCurrentVersion,
    setPendingVersion,
    clearPendingVersion,
    getAdaptation,
    setAdaptation,
    initAdaptation,
    updateAdaptationLevel,
    addKnownMetaHero,
    addKnownComposition,
    getResearches,
    addResearch,
    getAdaptationBonus,
    getAdaptationLevel,
    getKnownMetaHeroes,
    addNotification,
    markNotificationRead,
    getUnreadNotifications,
    clearAdaptation,
  };
}, {
  persist: true,
});
