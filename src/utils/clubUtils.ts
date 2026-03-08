import type { Club } from '@/types';
import { getPlayerTotalPower } from './playerUtils';

export function getClubTotalPower(club: Club | null | undefined): number {
  if (!club || !club.roster) return 0;
  
  const activePlayers = club.roster.slice(0, 5);
  if (activePlayers.length === 0) return 0;
  
  const totalPower = activePlayers.reduce((sum, player) => {
    return sum + getPlayerTotalPower(player);
  }, 0);
  
  return Math.round(totalPower / activePlayers.length);
}

export function getClubAverageRating(club: Club | null | undefined): number {
  if (!club || !club.roster) return 0;
  
  const roster = club.roster;
  if (roster.length === 0) return 0;
  
  const totalRating = roster.reduce((sum, player) => {
    const stats = player.stats;
    const avg = Object.values(stats).reduce((a, b) => a + b, 0) / Object.values(stats).length;
    return sum + avg;
  }, 0);
  
  return Math.round(totalRating / roster.length);
}
