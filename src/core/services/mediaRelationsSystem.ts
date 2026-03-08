import type { MediaOutlet, MediaRelationsState, MediaNews, SocialSentiment } from '@/types/media';

/**
 * 媒体关系系统
 * 负责管理与各媒体机构的关系
 */
export class MediaRelationsSystem {
  private mediaOutlets: MediaOutlet[] = [];
  private newsFeed: MediaNews[] = [];
  private lastNewsUpdateDay: number = -1;

  constructor() {
    this.initializeMediaOutlets();
  }

  /**
   * 初始化媒体机构
   */
  private initializeMediaOutlets(): void {
    this.mediaOutlets = [
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
      {
        id: 'm6',
        name: 'Score 赛高',
        type: 'esports_media',
        influence: 6,
        relation: 0,
      },
      {
        id: 'm7',
        name: '哔哩哔哩电竞',
        type: 'mainstream_media',
        influence: 9,
        relation: 0,
      },
      {
        id: 'm8',
        name: '虎扑电竞',
        type: 'fan_community',
        influence: 8,
        relation: 0,
      },
    ];
  }

  /**
   * 更新媒体关系
   */
  updateRelation(mediaId: string, change: number): void {
    const outlet = this.mediaOutlets.find(m => m.id === mediaId);
    if (!outlet) return;

    outlet.relation += change;
    
    // 限制在 -100 到 100 之间
    outlet.relation = Math.max(-100, Math.min(100, outlet.relation));
  }

  /**
   * 发布媒体新闻
   */
  publishNews(
    title: string,
    content: string,
    mediaId: string,
    sentiment: SocialSentiment,
    impact?: { fanChange?: number; reputationChange?: number }
  ): MediaNews {
    const news: MediaNews = {
      id: `news_${Date.now()}`,
      title,
      content,
      mediaId,
      sentiment,
      impact: impact || {},
      createdAt: new Date(),
    };

    this.newsFeed.unshift(news);
    
    // 限制新闻数量
    if (this.newsFeed.length > 30) {
      this.newsFeed = this.newsFeed.slice(0, 30);
    }

    // 更新媒体关系
    const outlet = this.mediaOutlets.find(m => m.id === mediaId);
    if (outlet) {
      // 正面新闻增加关系，负面新闻减少关系
      const relationChange = sentiment === 'positive' ? 2 : sentiment === 'negative' ? -3 : 0;
      this.updateRelation(mediaId, relationChange);
    }

    return news;
  }

  /**
   * 根据表现生成媒体新闻
   */
  generateNewsFromPerformance(
    won: boolean,
    isImportant: boolean,
    ranking: number,
    day: number
  ): void {
    // 检查是否在冷却期
    if (day - this.lastNewsUpdateDay < 2) {
      return;
    }

    // 选择随机媒体
    const randomIndex = Math.floor(Math.random() * this.mediaOutlets.length);
    const media = this.mediaOutlets[randomIndex];
    if (!media) return;

    if (won) {
      // 胜利新闻
      const titles = [
        '势如破竹！战队斩获胜利',
        '精彩操作！战队赢得比赛',
        '团队配合完美！战队取得胜利',
      ];
      
      const title = titles[Math.floor(Math.random() * titles.length)];
      const content = isImportant
        ? `在今天的焦点战中，战队展现出了强大的实力，通过出色的团队配合和精湛的个人操作，成功击败对手。这场胜利对于战队的季后赛征程至关重要。`
        : `在今天的常规赛中，战队稳定发挥，最终以优异的表现赢得比赛。`;

      this.publishNews(
        title,
        content,
        media.id,
        'positive',
        { fanChange: 50, reputationChange: 0.5 }
      );
    } else {
      // 失败新闻
      const titles = [
        '遗憾落败！战队惜败对手',
        '状态不佳！战队遭遇失利',
        '需要调整！战队需要总结',
      ];

      const title = titles[Math.floor(Math.random() * titles.length)];
      const content = isImportant
        ? `在今天的焦点战中，战队未能发挥出最佳水平，最终遗憾落败。教练组表示会认真总结问题，调整状态迎接接下来的比赛。`
        : `在今天的常规赛中，战队遭遇对手强力阻击，最终未能取得胜利。`;

      this.publishNews(
        title,
        content,
        media.id,
        'negative',
        { fanChange: -30, reputationChange: -0.3 }
      );
    }

    this.lastNewsUpdateDay = day;
  }

  /**
   * 发布转会新闻
   */
  publishTransferNews(playerName: string, isSigning: boolean, clubName?: string): void {
    const randomIndex = Math.floor(Math.random() * this.mediaOutlets.length);
    const media = this.mediaOutlets[randomIndex];
    if (!media) return;

    const title = isSigning
      ? `${playerName}正式加盟${clubName || '我队'}！`
      : `${playerName}离开${clubName || '我队'}，寻求新挑战！`;

    const content = isSigning
      ? `俱乐部官方宣布，选手${playerName}正式加盟。这位实力选手的加入将为战队带来新的活力和竞争力。`
      : `俱乐部官方宣布，选手${playerName}离队。感谢他为战队做出的贡献，祝未来一切顺利。`;

    this.publishNews(
      title,
      content,
      media.id,
      isSigning ? 'positive' : 'neutral',
      { fanChange: isSigning ? 100 : -50, reputationChange: isSigning ? 1 : -0.5 }
    );
  }

  /**
   * 获取媒体关系状态
   */
  getState(): MediaRelationsState {
    const averageRelation = this.mediaOutlets.length > 0
      ? this.mediaOutlets.reduce((sum, m) => sum + m.relation, 0) / this.mediaOutlets.length
      : 0;

    return {
      outlets: [...this.mediaOutlets],
      averageRelation,
      recentNews: [...this.newsFeed.slice(0, 10)],
    };
  }

  /**
   * 获取媒体机构列表
   */
  getMediaOutlets(): MediaOutlet[] {
    return [...this.mediaOutlets];
  }

  /**
   * 获取特定媒体机构
   */
  getMediaOutlet(mediaId: string): MediaOutlet | undefined {
    return this.mediaOutlets.find(m => m.id === mediaId);
  }

  /**
   * 获取媒体关系值
   */
  getMediaRelation(mediaId: string): number {
    const outlet = this.mediaOutlets.find(m => m.id === mediaId);
    return outlet ? outlet.relation : 0;
  }

  /**
   * 获取新闻列表
   */
  getNewsFeed(limit: number = 10): MediaNews[] {
    return this.newsFeed.slice(0, limit);
  }

  /**
   * 获取新闻历史（全部）
   */
  getNewsHistory(): MediaNews[] {
    return [...this.newsFeed];
  }

  /**
   * 获取平均关系值
   */
  getAverageRelation(): number {
    return this.mediaOutlets.reduce((sum, m) => sum + m.relation, 0) / this.mediaOutlets.length;
  }

  /**
   * 获取关系最好的媒体
   */
  getBestRelationMedia(): MediaOutlet | undefined {
    return this.mediaOutlets.reduce((best, current) => 
      current.relation > (best?.relation || -100) ? current : best
    , undefined as MediaOutlet | undefined);
  }

  /**
   * 获取关系最差的媒体
   */
  getWorstRelationMedia(): MediaOutlet | undefined {
    return this.mediaOutlets.reduce((worst, current) => 
      current.relation < (worst?.relation || 100) ? current : worst
    , undefined as MediaOutlet | undefined);
  }

  /**
   * 检查是否有媒体关系恶劣
   */
  hasHostileMedia(): boolean {
    return this.mediaOutlets.some(m => m.relation < -50);
  }

  /**
   * 检查是否有媒体关系友好
   */
  hasFriendlyMedia(): boolean {
    return this.mediaOutlets.some(m => m.relation > 50);
  }

  /**
   * 每周更新
   */
  onWeekAdvance(): void {
    // 自然关系恢复（轻微）
    this.mediaOutlets.forEach(outlet => {
      if (outlet.relation < 0) {
        outlet.relation = Math.min(0, outlet.relation + 1); // 每周恢复 1 点
      }
    });
  }

  /**
   * 重置系统
   */
  reset(): void {
    this.initializeMediaOutlets();
    this.newsFeed = [];
    this.lastNewsUpdateDay = -1;
  }
}

// 导出单例
export const mediaRelationsSystem = new MediaRelationsSystem();
