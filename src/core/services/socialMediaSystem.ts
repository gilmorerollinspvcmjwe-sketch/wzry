import type {
  SocialPost,
  SocialPostType,
  SocialSentiment,
  SocialMediaState,
  WeiboState,
  StreamingState,
  MediaNews,
  SocialMediaConfig,
} from '@/types/media';
import { DEFAULT_SOCIAL_MEDIA_CONFIG } from '@/types/media';

/**
 * 社交媒体系统
 * 负责管理微博、直播等社交媒体平台
 */
export class SocialMediaSystem {
  private state: SocialMediaState;
  private config: SocialMediaConfig;
  private newsFeed: MediaNews[] = [];

  constructor(config: SocialMediaConfig = DEFAULT_SOCIAL_MEDIA_CONFIG) {
    this.config = config;
    this.state = this.initializeState();
  }

  /**
   * 初始化状态
   */
  private initializeState(): SocialMediaState {
    return {
      weibo: {
        followers: 10000, // 初始 1 万粉丝
        posts: [],
        isTrending: false,
        sentiment: 'neutral',
      },
      streaming: {
        viewers: 5000,
        subscribers: 1000,
        revenue: 0,
      },
    };
  }

  /**
   * 发布比赛结果帖子
   */
  postMatchResult(won: boolean, opponent: string, score: string): SocialPost {
    const content = won
      ? `🎉 比赛胜利！我们以 ${score} 战胜 ${opponent}！感谢选手们的精彩表现！#胜利#`
      : `💪 虽败犹荣！我们以 ${score} 惜败 ${opponent}，继续努力！#加油#`;

    const sentiment: SocialSentiment = won ? 'positive' : 'negative';
    const engagement = this.calculateEngagement(won);

    const post: SocialPost = {
      id: `post_${Date.now()}`,
      content,
      type: 'match_result',
      likes: engagement.likes,
      comments: engagement.comments,
      shares: engagement.shares,
      sentiment,
      createdAt: new Date(),
      isHot: won && Math.random() < 0.3, // 胜利有 30% 概率上热搜
    };

    this.addPost(post);
    this.updateFollowerGrowth(won);
    this.updateSentiment(won ? 'positive' : 'negative');

    if (post.isHot) {
      this.triggerHotTopic(`#${opponent}#`);
    }

    return post;
  }

  /**
   * 发布选手高光帖子
   */
  postPlayerHighlight(playerName: string, achievement: string): SocialPost {
    const content = `⭐ 选手高光时刻！${playerName}${achievement}！太棒了！#选手# #高光#`;

    const engagement = this.calculateEngagement(true, true);

    const post: SocialPost = {
      id: `post_${Date.now()}`,
      content,
      type: 'player_highlight',
      likes: engagement.likes,
      comments: engagement.comments,
      shares: engagement.shares,
      sentiment: 'positive',
      createdAt: new Date(),
      isHot: Math.random() < 0.4, // 40% 概率上热搜
    };

    this.addPost(post);
    this.updateFollowerGrowth(true);

    if (post.isHot) {
      this.triggerHotTopic(`#${playerName}#${achievement}`);
    }

    return post;
  }

  /**
   * 发布官方公告
   */
  postAnnouncement(title: string, content: string): SocialPost {
    const post: SocialPost = {
      id: `post_${Date.now()}`,
      content: `📢 ${title}\n\n${content}`,
      type: 'announcement',
      likes: 0,
      comments: 0,
      shares: 0,
      sentiment: 'neutral',
      createdAt: new Date(),
      isHot: false,
    };

    this.addPost(post);
    return post;
  }

  /**
   * 发布转会官宣
   */
  postTransfer(playerName: string, isSigning: boolean, fromClub?: string): SocialPost {
    const content = isSigning
      ? `🎊 欢迎${playerName}加入我们的大家庭！#转会# #新援#`
      : `💔 感谢${playerName}为俱乐部的付出，祝未来一切顺利！#转会#`;

    const engagement = this.calculateEngagement(true, true, true);

    const post: SocialPost = {
      id: `post_${Date.now()}`,
      content,
      type: 'transfer',
      likes: engagement.likes,
      comments: engagement.comments,
      shares: engagement.shares,
      sentiment: isSigning ? 'positive' : 'neutral',
      createdAt: new Date(),
      isHot: true, // 转会必定上热搜
    };

    this.addPost(post);
    this.updateFollowerGrowth(isSigning);
    this.triggerHotTopic(`#${playerName}转会#`);

    return post;
  }

  /**
   * 添加帖子
   */
  private addPost(post: SocialPost): void {
    this.state.weibo.posts.unshift(post);
    
    // 限制帖子数量（只保留最近 50 条）
    if (this.state.weibo.posts.length > 50) {
      this.state.weibo.posts = this.state.weibo.posts.slice(0, 50);
    }
  }

  /**
   * 计算互动数据
   */
  private calculateEngagement(
    isPositive: boolean,
    isHighlight: boolean = false,
    isMajor: boolean = false
  ): { likes: number; comments: number; shares: number } {
    const baseLikes = isPositive ? 1000 : 500;
    const baseComments = isPositive ? 200 : 100;
    const baseShares = isPositive ? 100 : 50;

    const highlightMultiplier = isHighlight ? 2 : 1;
    const majorMultiplier = isMajor ? 3 : 1;

    const multiplier = highlightMultiplier * majorMultiplier;

    // 添加随机波动
    const randomFactor = 0.8 + Math.random() * 0.4; // 0.8-1.2

    return {
      likes: Math.floor(baseLikes * multiplier * randomFactor),
      comments: Math.floor(baseComments * multiplier * randomFactor),
      shares: Math.floor(baseShares * multiplier * randomFactor),
    };
  }

  /**
   * 更新粉丝增长
   */
  private updateFollowerGrowth(won: boolean): void {
    let growth = this.config.baseFollowerGrowth;
    
    if (won) {
      growth *= this.config.winBonusMultiplier;
    }

    // 添加随机波动
    growth *= (0.8 + Math.random() * 0.4);

    this.state.weibo.followers += Math.floor(growth);
  }

  /**
   * 更新情感倾向
   */
  private updateSentiment(sentiment: SocialSentiment): void {
    // 简单的情感更新逻辑
    this.state.weibo.sentiment = sentiment;
  }

  /**
   * 触发热搜
   */
  private triggerHotTopic(topic: string): void {
    this.state.weibo.isTrending = true;
    this.state.weibo.trendingTopic = topic;

    // 热搜持续配置天数
    setTimeout(() => {
      this.state.weibo.isTrending = false;
      this.state.weibo.trendingTopic = undefined;
    }, this.config.hotTopicDuration * 24 * 60 * 60 * 1000);
  }

  /**
   * 添加媒体新闻
   */
  addNews(news: MediaNews): void {
    this.newsFeed.unshift(news);
    
    // 限制新闻数量（只保留最近 20 条）
    if (this.newsFeed.length > 20) {
      this.newsFeed = this.newsFeed.slice(0, 20);
    }

    // 应用新闻影响
    if (news.impact.fanChange) {
      this.state.weibo.followers += news.impact.fanChange;
    }
  }

  /**
   * 获取状态
   */
  getState(): SocialMediaState {
    return { ...this.state };
  }

  /**
   * 获取微博状态
   */
  getWeiboState(): WeiboState {
    return { ...this.state.weibo };
  }

  /**
   * 获取直播状态
   */
  getStreamingState(): StreamingState {
    return { ...this.state.streaming };
  }

  /**
   * 获取新闻列表
   */
  getNewsFeed(limit: number = 10): MediaNews[] {
    return this.newsFeed.slice(0, limit);
  }

  /**
   * 获取帖子列表
   */
  getPosts(limit: number = 10): SocialPost[] {
    return this.state.weibo.posts.slice(0, limit);
  }

  /**
   * 获取粉丝数
   */
  getFollowers(): number {
    return this.state.weibo.followers;
  }

  /**
   * 更新直播数据
   */
  updateStreamingData(viewers: number, subscribers: number, revenue: number): void {
    this.state.streaming = {
      viewers: Math.max(0, viewers),
      subscribers: Math.max(0, subscribers),
      revenue: Math.max(0, revenue),
    };
  }

  /**
   * 每周更新
   */
  onWeekAdvance(): void {
    // 自然粉丝增长
    const naturalGrowth = Math.floor(this.state.weibo.followers * 0.01); // 1% 自然增长
    this.state.weibo.followers += naturalGrowth;

    // 直播收入
    const weeklyRevenue = this.state.streaming.viewers * 0.1; // 每个观众贡献 0.1
    this.state.streaming.revenue += weeklyRevenue;
  }

  /**
   * 重置系统
   */
  reset(): void {
    this.state = this.initializeState();
    this.newsFeed = [];
  }
}

// 导出单例
export const socialMediaSystem = new SocialMediaSystem();
