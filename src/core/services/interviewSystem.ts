import type {
  Interview,
  InterviewQuestion,
  InterviewOption,
  InterviewImpact,
  MediaOutlet,
  InterviewType,
  InterviewTone,
  InterviewConfig,
} from '@/types/media';
import { DEFAULT_INTERVIEW_CONFIG } from '@/types/media';

/**
 * 媒体采访系统
 * 负责管理采访的生成、处理和结果
 */
export class InterviewSystem {
  private pendingInterviews: Interview[] = [];
  private completedInterviews: Interview[] = [];
  private lastInterviewDay: number = -1;
  private config: InterviewConfig;

  constructor(config: InterviewConfig = DEFAULT_INTERVIEW_CONFIG) {
    this.config = config;
  }

  /**
   * 检查并触发赛后采访
   */
  triggerPostMatchInterview(
    won: boolean,
    isImportant: boolean,
    clubState: ClubState,
    day: number
  ): Interview | null {
    // 检查是否在冷却期
    if (day - this.lastInterviewDay < this.config.minDaysBetweenInterviews) {
      return null;
    }

    // 计算触发概率
    let triggerChance = this.config.postMatchTriggerChance;
    if (isImportant) {
      triggerChance *= this.config.importantMatchMultiplier;
    }

    if (Math.random() > triggerChance) {
      return null;
    }

    // 生成采访
    const interview = this.generateInterview('post_match', won, clubState, day);
    if (interview) {
      this.pendingInterviews.push(interview);
      this.lastInterviewDay = day;
    }

    return interview;
  }

  /**
   * 生成采访
   */
  private generateInterview(
    type: InterviewType,
    won?: boolean,
    clubState?: ClubState,
    day?: number
  ): Interview | null {
    const media = this.getRandomMediaOutlet();
    if (!media) return null;

    const questions = this.generateQuestions(type, won, clubState);
    if (questions.length === 0) return null;

    const deadline = new Date();
    deadline.setDate(deadline.getDate() + 2); // 2 天截止

    return {
      id: `interview_${Date.now()}`,
      type,
      media,
      questions,
      impact: this.calculateImpact(type, won, media),
      createdAt: new Date(),
      deadline,
      status: 'pending',
    };
  }

  /**
   * 生成采访问题
   */
  private generateQuestions(
    type: InterviewType,
    won?: boolean,
    clubState?: ClubState
  ): InterviewQuestion[] {
    switch (type) {
      case 'post_match':
        return this.generatePostMatchQuestions(won);
      case 'pre_playoff':
        return this.generatePrePlayoffQuestions(clubState);
      case 'transfer':
        return this.generateTransferQuestions(clubState);
      default:
        return this.generateRandomQuestions();
    }
  }

  /**
   * 生成赛后采访问题
   */
  private generatePostMatchQuestions(won?: boolean): InterviewQuestion[] {
    if (won) {
      return [
        {
          id: 'q1',
          question: '恭喜获胜！请问您认为获胜的关键是什么？',
          options: [
            {
              id: 'a',
              text: '我们的准备更充分，选手发挥出色',
              tone: 'humble',
              consequences: {
                fanChange: 50,
                reputationChange: 0.5,
                playerMoraleChange: 5,
                mediaRelationChange: 3,
              },
            },
            {
              id: 'b',
              text: '对手太弱了，我们还没尽全力',
              tone: 'confident',
              consequences: {
                fanChange: 100,
                reputationChange: 1,
                playerMoraleChange: -3,
                mediaRelationChange: -2,
              },
            },
            {
              id: 'c',
              text: '这是团队共同努力的结果',
              tone: 'diplomatic',
              consequences: {
                fanChange: 30,
                reputationChange: 0.3,
                playerMoraleChange: 10,
                mediaRelationChange: 5,
              },
            },
          ],
        },
      ];
    } else {
      return [
        {
          id: 'q1',
          question: '很遗憾输掉了比赛，您认为问题出在哪里？',
          options: [
            {
              id: 'a',
              text: '我们的状态不好，需要调整',
              tone: 'humble',
              consequences: {
                fanChange: -20,
                reputationChange: -0.2,
                playerMoraleChange: -3,
                mediaRelationChange: 2,
              },
            },
            {
              id: 'b',
              text: '裁判有些判罚值得商榷',
              tone: 'aggressive',
              consequences: {
                fanChange: 30,
                reputationChange: -1,
                playerMoraleChange: 2,
                mediaRelationChange: -5,
              },
            },
            {
              id: 'c',
              text: '对手发挥更好，恭喜他们',
              tone: 'diplomatic',
              consequences: {
                fanChange: -10,
                reputationChange: 0.5,
                playerMoraleChange: -2,
                mediaRelationChange: 3,
              },
            },
          ],
        },
      ];
    }
  }

  /**
   * 生成季后赛前采访问题
   */
  private generatePrePlayoffQuestions(clubState?: ClubState): InterviewQuestion[] {
    return [
      {
        id: 'q1',
        question: '季后赛即将开始，您对球队有什么期望？',
        options: [
          {
            id: 'a',
            text: '我们会全力以赴，争取冠军',
            tone: 'confident',
            consequences: {
              fanChange: 100,
              reputationChange: 1,
              playerMoraleChange: 5,
              mediaRelationChange: 3,
            },
          },
          {
            id: 'b',
            text: '先做好自己，一场一场打',
            tone: 'humble',
            consequences: {
              fanChange: 50,
              reputationChange: 0.5,
              playerMoraleChange: 3,
              mediaRelationChange: 5,
            },
          },
          {
            id: 'c',
            text: '季后赛充满变数，我们会做好准备',
            tone: 'diplomatic',
            consequences: {
              fanChange: 60,
              reputationChange: 0.8,
              playerMoraleChange: 4,
              mediaRelationChange: 4,
            },
          },
        ],
      },
    ];
  }

  /**
   * 生成转会采访问题
   */
  private generateTransferQuestions(clubState?: ClubState): InterviewQuestion[] {
    return [
      {
        id: 'q1',
        question: '对于这次的转会操作，您有什么想说的？',
        options: [
          {
            id: 'a',
            text: '我们引进了优秀的选手，实力大增',
            tone: 'confident',
            consequences: {
              fanChange: 150,
              reputationChange: 2,
              playerMoraleChange: 3,
              mediaRelationChange: 5,
            },
          },
          {
            id: 'b',
            text: '这是俱乐部的正常引援计划',
            tone: 'diplomatic',
            consequences: {
              fanChange: 80,
              reputationChange: 1,
              playerMoraleChange: 2,
              mediaRelationChange: 3,
            },
          },
        ],
      },
    ];
  }

  /**
   * 生成随机采访问题
   */
  private generateRandomQuestions(): InterviewQuestion[] {
    return [
      {
        id: 'q1',
        question: '最近俱乐部有什么计划？',
        options: [
          {
            id: 'a',
            text: '我们会专注于训练，提升实力',
            tone: 'humble',
            consequences: {
              fanChange: 30,
              reputationChange: 0.5,
              playerMoraleChange: 3,
              mediaRelationChange: 2,
            },
          },
          {
            id: 'b',
            text: '敬请期待我们的表现',
            tone: 'confident',
            consequences: {
              fanChange: 50,
              reputationChange: 0.8,
              playerMoraleChange: 2,
              mediaRelationChange: 3,
            },
          },
        ],
      },
    ];
  }

  /**
   * 获取随机媒体机构
   */
  private getRandomMediaOutlet(): MediaOutlet | null {
    const mediaOutlets: MediaOutlet[] = [
      {
        id: 'm1',
        name: '电竞之家',
        type: 'esports_media',
        influence: 8,
        relation: 0,
      },
      {
        id: 'm2',
        name: '腾讯电竞',
        type: 'mainstream_media',
        influence: 10,
        relation: 0,
      },
      {
        id: 'm3',
        name: '贴吧',
        type: 'fan_community',
        influence: 6,
        relation: 0,
      },
      {
        id: 'm4',
        name: 'NGA 电竞版',
        type: 'fan_community',
        influence: 7,
        relation: 0,
      },
      {
        id: 'm5',
        name: '玩加电竞',
        type: 'esports_media',
        influence: 7,
        relation: 0,
      },
    ];

    const availableMedia = mediaOutlets.filter(m => m.relation > -50);
    if (availableMedia.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * availableMedia.length);
    return availableMedia[randomIndex] || null;
  }

  /**
   * 计算采访影响
   */
  private calculateImpact(
    type: InterviewType,
    won?: boolean,
    media?: MediaOutlet
  ): InterviewImpact {
    const baseImpact: InterviewImpact = {
      fanChange: 0,
      reputationChange: 0,
      playerMoraleChange: 0,
      mediaRelations: [],
    };

    if (media) {
      baseImpact.mediaRelations.push({
        mediaId: media.id,
        relationChange: 0,
      });
    }

    return baseImpact;
  }

  /**
   * 回答采访问题
   */
  answerInterview(
    interviewId: string,
    answers: { questionId: string; optionId: string }[]
  ): InterviewImpact | null {
    const interviewIndex = this.pendingInterviews.findIndex(i => i.id === interviewId);
    if (interviewIndex === -1) return null;

    const interview = this.pendingInterviews[interviewIndex];
    if (!interview) return null;

    // 验证答案
    const validAnswers = answers.filter(answer => {
      const question = interview.questions.find(q => q.id === answer.questionId);
      return question && question.options.some(o => o.id === answer.optionId);
    });

    if (validAnswers.length !== answers.length) {
      return null; // 无效答案
    }

    // 计算总影响
    const totalImpact: InterviewImpact = {
      fanChange: 0,
      reputationChange: 0,
      playerMoraleChange: 0,
      mediaRelations: interview.impact.mediaRelations.map(mr => ({ ...mr })),
    };

    validAnswers.forEach(answer => {
      const question = interview.questions.find(q => q.id === answer.questionId);
      const option = question?.options.find(o => o.id === answer.optionId);
      
      if (option) {
        totalImpact.fanChange += option.consequences.fanChange;
        totalImpact.reputationChange += option.consequences.reputationChange;
        totalImpact.playerMoraleChange += option.consequences.playerMoraleChange;
        
        // 更新媒体关系
        totalImpact.mediaRelations.forEach(mr => {
          mr.relationChange += option.consequences.mediaRelationChange;
        });
      }
    });

    // 更新采访状态
    interview.selectedAnswers = answers;
    interview.status = 'completed';

    // 移到已完成列表
    this.pendingInterviews.splice(interviewIndex, 1);
    this.completedInterviews.push(interview);

    return totalImpact;
  }

  /**
   * 拒绝采访
   */
  declineInterview(interviewId: string): void {
    const interviewIndex = this.pendingInterviews.findIndex(i => i.id === interviewId);
    if (interviewIndex === -1) return;

    const interview = this.pendingInterviews[interviewIndex];
    if (!interview) return;

    interview.status = 'expired';
    this.pendingInterviews.splice(interviewIndex, 1);
    this.completedInterviews.push(interview);
  }

  /**
   * 获取待处理采访
   */
  getPendingInterviews(): Interview[] {
    return [...this.pendingInterviews];
  }

  /**
   * 获取已完成采访
   */
  getCompletedInterviews(): Interview[] {
    return [...this.completedInterviews];
  }

  /**
   * 清除过期采访
   */
  clearExpiredInterviews(currentDay: number): void {
    const now = new Date();
    this.pendingInterviews = this.pendingInterviews.filter(interview => {
      if (!interview.deadline) return true;
      return interview.deadline.getTime() > now.getTime();
    });
  }

  /**
   * 重置系统
   */
  reset(): void {
    this.pendingInterviews = [];
    this.completedInterviews = [];
    this.lastInterviewDay = -1;
  }
}

// 俱乐部状态接口（用于采访触发）
export interface ClubState {
  reputation: number;
  fans: number;
  ranking: number;
  winRate: number;
  recentForm: boolean[]; // 最近比赛胜负
}

// 导出单例
export const interviewSystem = new InterviewSystem();
