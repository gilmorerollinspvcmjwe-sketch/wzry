import { defineStore } from 'pinia';
import type { Coach, CoachingStaff, CoachMeeting } from '@/types/coach';
import { calculateStaffChemistry } from '@/core/services/coachService';

interface CoachState {
  coachingStaffs: Record<string, CoachingStaff>;
}

function createEmptyCoachingStaff(): CoachingStaff {
  return {
    headCoach: null,
    assistantCoaches: [],
    analysts: [],
    psychologicalCoach: null,
    physicalCoach: null,
    chemistry: 0,
    meetings: [],
  };
}

export const useCoachStore = defineStore('coach', {
  state: (): CoachState => ({
    coachingStaffs: {},
  }),
  
  getters: {
    getCoachingStaff: (state) => (clubId: string): CoachingStaff => {
      return state.coachingStaffs[clubId] || createEmptyCoachingStaff();
    },
    
    getCoach: (state) => (clubId: string, coachId: string): Coach | undefined => {
      const staff = state.coachingStaffs[clubId];
      if (!staff) return undefined;
      
      if (staff.headCoach?.id === coachId) return staff.headCoach;
      if (staff.psychologicalCoach?.id === coachId) return staff.psychologicalCoach;
      if (staff.physicalCoach?.id === coachId) return staff.physicalCoach;
      
      const assistant = staff.assistantCoaches.find(c => c.id === coachId);
      if (assistant) return assistant;
      
      const analyst = staff.analysts.find(c => c.id === coachId);
      if (analyst) return analyst;
      
      return undefined;
    },
    
    getAllCoaches: (state) => (clubId: string): Coach[] => {
      const staff = state.coachingStaffs[clubId];
      if (!staff) return [];
      
      const coaches: Coach[] = [];
      if (staff.headCoach) coaches.push(staff.headCoach);
      coaches.push(...staff.assistantCoaches);
      coaches.push(...staff.analysts);
      if (staff.psychologicalCoach) coaches.push(staff.psychologicalCoach);
      if (staff.physicalCoach) coaches.push(staff.physicalCoach);
      
      return coaches;
    },
    
    getTotalSalary: (state) => (clubId: string): number => {
      const staff = state.coachingStaffs[clubId];
      if (!staff) return 0;
      
      let total = 0;
      if (staff.headCoach) total += staff.headCoach.contract.salary;
      staff.assistantCoaches.forEach(c => total += c.contract.salary);
      staff.analysts.forEach(c => total += c.contract.salary);
      if (staff.psychologicalCoach) total += staff.psychologicalCoach.contract.salary;
      if (staff.physicalCoach) total += staff.physicalCoach.contract.salary;
      
      return total;
    },
    
    getRecentMeetings: (state) => (clubId: string, limit: number = 5): CoachMeeting[] => {
      const staff = state.coachingStaffs[clubId];
      if (!staff || !staff.meetings.length) return [];
      
      return [...staff.meetings]
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
        .slice(0, limit);
    },
  },
  
  actions: {
    initCoachingStaff(clubId: string) {
      if (!this.coachingStaffs[clubId]) {
        this.coachingStaffs[clubId] = createEmptyCoachingStaff();
      }
    },
    
    addCoach(clubId: string, coach: Coach) {
      this.initCoachingStaff(clubId);
      const staff = this.coachingStaffs[clubId];
      
      switch (coach.type) {
        case 'head':
          staff.headCoach = coach;
          break;
        case 'assistant':
          staff.assistantCoaches.push(coach);
          break;
        case 'analyst':
          staff.analysts.push(coach);
          break;
        case 'psychological':
          staff.psychologicalCoach = coach;
          break;
        case 'physical':
          staff.physicalCoach = coach;
          break;
      }
      
      staff.chemistry = calculateStaffChemistry(staff);
    },
    
    removeCoach(clubId: string, coachId: string) {
      const staff = this.coachingStaffs[clubId];
      if (!staff) return;
      
      if (staff.headCoach?.id === coachId) {
        staff.headCoach = null;
      } else if (staff.psychologicalCoach?.id === coachId) {
        staff.psychologicalCoach = null;
      } else if (staff.physicalCoach?.id === coachId) {
        staff.physicalCoach = null;
      } else {
        staff.assistantCoaches = staff.assistantCoaches.filter(c => c.id !== coachId);
        staff.analysts = staff.analysts.filter(c => c.id !== coachId);
      }
      
      staff.chemistry = calculateStaffChemistry(staff);
    },
    
    addMeeting(clubId: string, meeting: CoachMeeting) {
      this.initCoachingStaff(clubId);
      this.coachingStaffs[clubId].meetings.push(meeting);
    },
    
    updateCoachContract(clubId: string, coachId: string, salary: number, years: number) {
      const coach = this.getCoach(clubId, coachId);
      if (coach) {
        coach.contract.salary = salary;
        coach.contract.endDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000 * years);
        coach.contract.buyoutClause = salary * 12;
      }
    },
    
    updateChemistry(clubId: string) {
      const staff = this.coachingStaffs[clubId];
      if (staff) {
        staff.chemistry = calculateStaffChemistry(staff);
      }
    },
    
    clearCoachingStaff(clubId: string) {
      this.coachingStaffs[clubId] = createEmptyCoachingStaff();
    },
  },
  
  persist: true,
});
