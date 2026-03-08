import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { 
  LeagueEcosystem, 
  League, 
  Cup, 
  InternationalEvent,
  ClubQualification 
} from '@/types/leagueEcosystem';
import type { LeagueMatchInfo } from '@/types/leagueEcosystem';
import { LeagueEcosystemService } from '@/core/services/leagueEcosystemService';
import { useClubStore } from './club';
import { getClubTotalPower } from '@/utils/clubUtils';

export const useLeagueEcosystemStore = defineStore('leagueEcosystem', () => {
  const ecosystem = ref<LeagueEcosystem | null>(null);
  const isLoading = ref(false);

  const currentSeason = computed(() => ecosystem.value?.currentSeason);
  const leagues = computed(() => ecosystem.value?.leagues || []);
  const cups = computed(() => ecosystem.value?.cups || []);
  const internationalEvents = computed(() => ecosystem.value?.internationalEvents || []);
  const developmentalLeagues = computed(() => ecosystem.value?.developmentalLeagues || []);

  const primaryLeague = computed(() => leagues.value.find(l => l.tier === 1) || leagues.value[0]);

  const myClubQualifications = computed((): ClubQualification | null => {
    if (!ecosystem.value) return null;
    const clubStore = useClubStore();
    const clubId = clubStore.currentClub?.id;
    if (!clubId) return null;
    return LeagueEcosystemService.getQualification(ecosystem.value, clubId);
  });

  const upcomingEvents = computed(() => {
    if (!ecosystem.value) return [];
    return LeagueEcosystemService.getUpcomingEvents(ecosystem.value, 14);
  });

  function initializeEcosystem(year: number, season: 'spring' | 'summer') {
    const clubStore = useClubStore();
    const allClubs = clubStore.clubs;

    if (allClubs.length < 2) {
      throw new Error('需要至少2个俱乐部才能创建联赛生态');
    }

    isLoading.value = true;
    try {
      ecosystem.value = LeagueEcosystemService.initializeSeason(year, season, allClubs);
    } finally {
      isLoading.value = false;
    }
  }

  function startLeague(leagueId: string) {
    const league = leagues.value.find(l => l.id === leagueId);
    if (!league) return;
    league.status = 'ongoing';
  }

  function startCup(cupId: string) {
    const cup = cups.value.find(c => c.id === cupId);
    if (!cup) return;
    cup.status = 'ongoing';
  }

  function simulateLeagueMatch(leagueId: string, matchId: string) {
    const league = leagues.value.find(l => l.id === leagueId);
    if (!league) return;

    const round = league.schedule.rounds.find(r => r.round === league.schedule.currentRound);
    if (!round) return;

    const match = round.matches.find(m => m.id === matchId);
    if (!match || match.isFinished) return;

    const homePower = getClubPower(match.homeTeamId);
    const awayPower = getClubPower(match.awayTeamId);

    const homeAdvantage = 5;
    const homeRoll = homePower + homeAdvantage + Math.random() * 20;
    const awayRoll = awayPower + Math.random() * 20;

    const winnerId = homeRoll > awayRoll ? match.homeTeamId : match.awayTeamId;
    const homeScore = homeRoll > awayRoll ? 3 : Math.floor(Math.random() * 2) + 1;
    const awayScore = homeRoll > awayRoll ? Math.floor(Math.random() * 2) + 1 : 3;

    match.isFinished = true;
    match.homeScore = homeScore;
    match.awayScore = awayScore;
    match.winnerId = winnerId;

    LeagueEcosystemService.updateStandings(league, match, homeScore, awayScore);

    const clubStore = useClubStore();
    clubStore.addFundsToClub(winnerId, 10);
  }

  function simulateCurrentLeagueRound(leagueId: string) {
    const league = leagues.value.find(l => l.id === leagueId);
    if (!league || league.status !== 'ongoing') return;

    const round = league.schedule.rounds.find(r => r.round === league.schedule.currentRound);
    if (!round) return;

    round.matches.forEach(match => {
      if (!match.isFinished) {
        simulateLeagueMatch(leagueId, match.id);
      }
    });

    LeagueEcosystemService.advanceLeagueRound(league);
  }

  function simulateCupMatch(cupId: string, matchId: string) {
    const cup = cups.value.find(c => c.id === cupId);
    if (!cup) return;

    const round = cup.bracket.rounds.find(r => r.round === cup.bracket.currentRound);
    if (!round) return;

    const match = round.matches.find(m => m.id === matchId);
    if (!match || match.isFinished) return;

    if (!match.homeTeamId || !match.awayTeamId) return;

    const homePower = getClubPower(match.homeTeamId);
    const awayPower = getClubPower(match.awayTeamId);

    const homeWins = Math.random() * (homePower + 5) > Math.random() * awayPower ? 2 : 0;
    const awayWins = homeWins === 0 ? 2 : Math.random() > 0.5 ? 1 : 0;

    match.isFinished = true;
    match.homeWins = homeWins;
    match.awayWins = awayWins;
    match.winnerId = homeWins > awayWins ? match.homeTeamId : match.awayTeamId;

    const participant = cup.participants.find(p => 
      p.clubId === (homeWins > awayWins ? match.awayTeamId : match.homeTeamId)
    );
    if (participant) {
      participant.eliminated = true;
    }

    const clubStore = useClubStore();
    if (match.winnerId) {
      clubStore.addFundsToClub(match.winnerId, 20);
    }
  }

  function simulateCurrentCupRound(cupId: string) {
    const cup = cups.value.find(c => c.id === cupId);
    if (!cup || cup.status !== 'ongoing') return;

    const round = cup.bracket.rounds.find(r => r.round === cup.bracket.currentRound);
    if (!round) return;

    round.matches.forEach(match => {
      if (!match.isFinished && match.homeTeamId && match.awayTeamId) {
        simulateCupMatch(cupId, match.id);
      }
    });

    LeagueEcosystemService.advanceCupRound(cup);
  }

  function getClubPower(clubId: string): number {
    const clubStore = useClubStore();
    const club = clubStore.getClub(clubId);
    return getClubTotalPower(club);
  }

  function getLeagueStandings(leagueId: string) {
    const league = leagues.value.find(l => l.id === leagueId);
    return league?.standings || [];
  }

  function getCupBracket(cupId: string) {
    const cup = cups.value.find(c => c.id === cupId);
    return cup?.bracket || null;
  }

  function getCurrentLeagueRoundMatches(leagueId: string): LeagueMatchInfo[] {
    const league = leagues.value.find(l => l.id === leagueId);
    if (!league) return [];

    const round = league.schedule.rounds.find(r => r.round === league.schedule.currentRound);
    return round?.matches || [];
  }

  function advanceSeasonPhase() {
    if (!ecosystem.value) return;

    const phase = ecosystem.value.currentSeason.phase;
    switch (phase) {
      case 'preparing':
        ecosystem.value.currentSeason.phase = 'regular';
        leagues.value.forEach(l => {
          if (l.status === 'upcoming') l.status = 'ongoing';
        });
        cups.value.forEach(c => {
          if (c.status === 'upcoming') c.status = 'ongoing';
        });
        break;
      case 'regular':
        const allLeaguesComplete = leagues.value.every(l => l.status === 'completed');
        const allCupsComplete = cups.value.every(c => c.status === 'completed');
        if (allLeaguesComplete && allCupsComplete) {
          ecosystem.value.currentSeason.phase = 'playoff';
        }
        break;
      case 'playoff':
        ecosystem.value.currentSeason.phase = 'offseason';
        break;
      case 'offseason':
        break;
    }
  }

  function distributeLeagueRewards(leagueId: string) {
    const league = leagues.value.find(l => l.id === leagueId);
    if (!league || !ecosystem.value) return;

    const clubStore = useClubStore();
    league.standings.forEach(standing => {
      const prize = league.prizes.distribution.find(d => d.rank === standing.rank);
      if (prize) {
        clubStore.addFundsToClub(standing.clubId, prize.amount);
      }
    });
  }

  function resetEcosystem() {
    ecosystem.value = null;
  }

  return {
    ecosystem,
    isLoading,
    currentSeason,
    leagues,
    cups,
    internationalEvents,
    developmentalLeagues,
    primaryLeague,
    myClubQualifications,
    upcomingEvents,
    initializeEcosystem,
    startLeague,
    startCup,
    simulateLeagueMatch,
    simulateCurrentLeagueRound,
    simulateCupMatch,
    simulateCurrentCupRound,
    getLeagueStandings,
    getCupBracket,
    getCurrentLeagueRoundMatches,
    advanceSeasonPhase,
    distributeLeagueRewards,
    resetEcosystem,
  };
});
