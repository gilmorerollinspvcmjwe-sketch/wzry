import type { MediaNews, SocialSentiment } from '@/types/media';
import type { Club } from '@/core/models/Club';
import type { Player } from '@/core/models/Player';
import { mediaRelationsSystem } from './mediaRelationsSystem';

/**
 * AI 新闻生成器
 * 根据 AI 俱乐部行为自动生成新闻
 */
export class AINewsGenerator {
  private static newsCountPerSeason: Record<string, number> = {};
  private static readonly MAX_NEWS_PER_SEASON = 40;
  private static readonly MIN_NEWS_PER_SEASON = 20;

  /**
   * 生成转会新闻
   */
  static generateTransferNews(club: Club, player: Player, transferFee: number): MediaNews | null {
    if (!this.shouldGenerateNews(club.id)) return null;

    const templates = [
      {
        title: `${club.name} 成功签约 ${player.name}！`,
        content: `${club.name} 官方宣布，选手${player.name}正式加盟。这位${player.age}岁的${player.position}选手实力值为${player.getTotalPower()}，转会费为${transferFee}万。俱乐部表示，此次引援将显著提升战队竞争力。`,
        sentiment: 'positive' as SocialSentiment,
        impact: { fanChange: 50, reputationChange: 0.5 }
      },
      {
        title: `重磅！${player.name} 转会${club.name}`,
        content: `转会市场传来消息，${player.name}已正式加盟${club.name}。这位实力选手的加入将为战队带来新的活力。`,
        sentiment: 'positive' as SocialSentiment,
        impact: { fanChange: 30, reputationChange: 0.3 }
      }
    ];

    const template = templates[Math.floor(Math.random() * templates.length)];
    if (!template) return null;
    
    return this.publishNews(
      club.id,
      template.title,
      template.content,
      template.sentiment,
      template.impact
    );
  }

  /**
   * 生成比赛新闻
   */
  static generateMatchNews(club: Club, won: boolean, streak: number = 0): MediaNews | null {
    if (!this.shouldGenerateNews(club.id)) return null;

    let template: { title: string; content: string; sentiment: SocialSentiment; impact: any } | null = null;

    if (won) {
      const templates = [
        {
          title: streak > 1 ? `${club.name} 豪取${streak}连胜！` : `${club.name} 斩获胜利`,
          content: streak > 1 
            ? `在今天的比赛中，${club.name} 再次展现强大实力，豪取${streak}连胜。战队成员配合默契，战术执行到位，延续了良好的竞技状态。`
            : `${club.name} 在今天的比赛中发挥出色，通过完美的团队配合和精湛的个人操作，成功击败对手。`,
          sentiment: 'positive' as SocialSentiment,
          impact: { fanChange: 30, reputationChange: 0.3 }
        },
        {
          title: `势如破竹！${club.name} 赢得比赛`,
          content: `${club.name} 以优异的表现赢得今天的比赛，选手们的精彩操作赢得了观众的阵阵掌声。`,
          sentiment: 'positive' as SocialSentiment,
          impact: { fanChange: 25, reputationChange: 0.2 }
        }
      ];
      template = templates[Math.floor(Math.random() * templates.length)] || null;
    } else {
      const templates = [
        {
          title: streak > 1 ? `${club.name} 遭遇${streak}连败，教练面临下课危机` : `${club.name} 遗憾落败`,
          content: streak > 1
            ? `${club.name} 在今天的比赛中再次失利，遭遇${streak}连败。战队状态低迷，战术执行混乱，教练组的排兵布阵受到质疑。`
            : `${club.name} 在今天的比赛中未能发挥最佳水平，最终遗憾落败。教练组表示会认真总结问题，调整状态。`,
          sentiment: 'negative' as SocialSentiment,
          impact: { fanChange: -30, reputationChange: -0.3 }
        },
        {
          title: `状态不佳！${club.name} 惜败对手`,
          content: `${club.name} 遭遇对手强力阻击，最终未能取得胜利。战队需要尽快调整状态，迎接接下来的挑战。`,
          sentiment: 'negative' as SocialSentiment,
          impact: { fanChange: -20, reputationChange: -0.2 }
        }
      ];
      template = templates[Math.floor(Math.random() * templates.length)] || null;
    }

    if (!template) return null;

    return this.publishNews(
      club.id,
      template.title,
      template.content,
      template.sentiment,
      template.impact
    );
  }

  /**
   * 生成经营新闻
   */
  static generateManagementNews(club: Club, eventType: 'facility' | 'youth' | 'financial'): MediaNews | null {
    if (!this.shouldGenerateNews(club.id)) return null;

    const templates: Record<string, Array<{ title: string; content: string; sentiment: SocialSentiment; impact: any }>> = {
      facility: [
        {
          title: `${club.name} 投资升级训练设施`,
          content: `${club.name} 宣布投资数千万升级训练基地，引入先进的训练设备和数据分析系统。俱乐部管理层表示，此举将大幅提升选手训练效率和比赛表现。`,
          sentiment: 'positive' as SocialSentiment,
          impact: { fanChange: 20, reputationChange: 0.2 }
        }
      ],
      youth: [
        {
          title: `${club.name} 青训体系再结硕果`,
          content: `${club.name} 青训营又一名年轻选手晋升一队。俱乐部多年来坚持青训投入，已培养出多名优秀选手，成为联赛青训标杆。`,
          sentiment: 'positive' as SocialSentiment,
          impact: { fanChange: 25, reputationChange: 0.3 }
        }
      ],
      financial: [
        {
          title: `${club.name} 面临财政危机`,
          content: `据悉，${club.name} 因前期过度引援导致财政紧张，俱乐部可能需要在转会窗口出售部分选手以平衡收支。`,
          sentiment: 'negative' as SocialSentiment,
          impact: { fanChange: -40, reputationChange: -0.4 }
        }
      ]
    };

    const categoryTemplates = templates[eventType];
    if (!categoryTemplates || categoryTemplates.length === 0) return null;

    const template = categoryTemplates[0];
    if (!template) return null;

    return this.publishNews(
      club.id,
      template.title,
      template.content,
      template.sentiment,
      template.impact
    );
  }

  /**
   * 发布新闻
   */
  private static publishNews(
    clubId: string,
    title: string,
    content: string,
    sentiment: SocialSentiment,
    impact: { fanChange?: number; reputationChange?: number }
  ): MediaNews {
    // 增加新闻计数
    this.newsCountPerSeason[clubId] = (this.newsCountPerSeason[clubId] || 0) + 1;

    // 发布到媒体系统
    return mediaRelationsSystem.publishNews(title, content, 'ai-news', sentiment, impact);
  }

  /**
   * 检查是否应该生成新闻
   */
  private static shouldGenerateNews(clubId: string): boolean {
    const count = this.newsCountPerSeason[clubId] || 0;
    
    // 确保每个 AI 每赛季至少 20 条，最多 40 条
    if (count >= this.MAX_NEWS_PER_SEASON) {
      return false;
    }

    // 如果低于最小值，提高生成概率
    if (count < this.MIN_NEWS_PER_SEASON) {
      return Math.random() < 0.7; // 70% 概率
    }

    // 超过最小值后降低概率
    return Math.random() < 0.3; // 30% 概率
  }

  /**
   * 重置赛季计数
   */
  static resetSeasonCounters() {
    this.newsCountPerSeason = {};
  }
}

// 导出单例
export const aiNewsGenerator = AINewsGenerator;
