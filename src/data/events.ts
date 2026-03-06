import { EventCategory, EventRarity } from '@/types/events';
import type { GameEvent, EventTriggerCondition, EventOption } from '@/types/events';

// 辅助函数：创建事件
function createEvent(
  id: string,
  title: string,
  description: string,
  category: EventCategory,
  rarity: EventRarity,
  weight: number,
  triggerConditions: EventTriggerCondition,
  options: EventOption[]
): GameEvent {
  return {
    id,
    title,
    description,
    category,
    rarity,
    weight,
    triggerConditions,
    options,
    createdAt: new Date(),
  };
}

// 事件库
export const events: GameEvent[] = [
  // ==================== 商业活动 (BUSINESS) ====================
  createEvent(
    'business_001',
    '商业合作邀约',
    '某知名品牌希望与俱乐部建立合作关系，提供赞助费用。',
    EventCategory.BUSINESS,
    EventRarity.COMMON,
    1.0,
    { minFunds: 0 },
    [
      {
        id: 'accept',
        text: '接受合作',
        consequences: {
          fundsChange: 50,
          reputationChange: 5,
          fanChange: 100,
        },
        preview: '获得 50 万资金，声望 +5，粉丝 +100',
      },
      {
        id: 'reject',
        text: '拒绝合作',
        consequences: {
          reputationChange: -2,
        },
        preview: '声望 -2',
      },
    ]
  ),

  createEvent(
    'business_002',
    '主场门票热销',
    '本赛季主场门票销售火爆，俱乐部收入大幅增加。',
    EventCategory.BUSINESS,
    EventRarity.UNCOMMON,
    0.8,
    { minFans: 5000 },
    [
      {
        id: 'celebrate',
        text: '庆祝成功',
        consequences: {
          fundsChange: 30,
          moraleChange: 5,
        },
        preview: '获得 30 万收入，士气 +5',
      },
      {
        id: 'invest',
        text: '投资设施',
        consequences: {
          fundsChange: 20,
          reputationChange: 3,
        },
        preview: '获得 20 万收入，声望 +3',
      },
    ]
  ),

  createEvent(
    'business_003',
    '周边商品大卖',
    '俱乐部官方周边商品销量暴涨，带来额外收入。',
    EventCategory.BUSINESS,
    EventRarity.COMMON,
    1.0,
    {},
    [
      {
        id: 'take_profit',
        text: '收取利润',
        consequences: {
          fundsChange: 25,
        },
        preview: '获得 25 万收入',
      },
      {
        id: 'expand',
        text: '扩大生产',
        consequences: {
          fundsChange: 15,
          fanChange: 200,
        },
        preview: '获得 15 万收入，粉丝 +200',
      },
    ]
  ),

  createEvent(
    'business_004',
    '直播平台签约',
    '某直播平台提出高额签约费，希望俱乐部选手入驻直播。',
    EventCategory.BUSINESS,
    EventRarity.RARE,
    0.5,
    { minReputation: 50 },
    [
      {
        id: 'sign',
        text: '同意签约',
        consequences: {
          fundsChange: 100,
          playerMoraleChange: 3,
        },
        preview: '获得 100 万收入，选手士气 +3',
      },
      {
        id: 'decline',
        text: '拒绝打扰',
        consequences: {
          playerMoraleChange: -2,
        },
        preview: '选手士气 -2',
      },
    ]
  ),

  createEvent(
    'business_005',
    '商业代言机会',
    '俱乐部明星选手获得知名品牌代言邀请。',
    EventCategory.BUSINESS,
    EventRarity.UNCOMMON,
    0.7,
    { hasPlayer: 'star' },
    [
      {
        id: 'approve',
        text: '批准代言',
        consequences: {
          fundsChange: 40,
          reputationChange: 8,
          fanChange: 300,
        },
        preview: '获得 40 万收入，声望 +8，粉丝 +300',
      },
      {
        id: 'focus_training',
        text: '专注训练',
        consequences: {
          playerMoraleChange: -5,
        },
        preview: '选手士气 -5',
      },
    ]
  ),

  // ==================== 选手转会 (TRANSFER) ====================
  createEvent(
    'transfer_001',
    '选手寻求转会',
    '队内一名选手表达了离队意愿，希望寻求新的挑战。',
    EventCategory.TRANSFER,
    EventRarity.UNCOMMON,
    0.8,
    { playerCount: 6 },
    [
      {
        id: 'allow',
        text: '允许离队',
        consequences: {
          fundsChange: 20,
          moraleChange: -3,
        },
        preview: '获得 20 万转会费，士气 -3',
      },
      {
        id: 'retain',
        text: '挽留选手',
        consequences: {
          fundsChange: -10,
          playerMoraleChange: 5,
        },
        preview: '加薪 10 万，选手士气 +5',
      },
    ]
  ),

  createEvent(
    'transfer_002',
    '青训选手崭露头角',
    '青训营中一名年轻选手表现出色，引起其他俱乐部关注。',
    EventCategory.TRANSFER,
    EventRarity.RARE,
    0.5,
    {},
    [
      {
        id: 'promote',
        text: '提拔到一线队',
        consequences: {
          moraleChange: 5,
          reputationChange: 3,
        },
        preview: '士气 +5，声望 +3',
      },
      {
        id: 'sell',
        text: '出售给其他俱乐部',
        consequences: {
          fundsChange: 35,
          reputationChange: -2,
        },
        preview: '获得 35 万收入，声望 -2',
      },
    ]
  ),

  createEvent(
    'transfer_003',
    '豪门俱乐部挖角',
    '某豪门俱乐部对队内核心选手开出高价报价。',
    EventCategory.TRANSFER,
    EventRarity.RARE,
    0.4,
    { minReputation: 60 },
    [
      {
        id: 'accept',
        text: '接受报价',
        consequences: {
          fundsChange: 150,
          moraleChange: -10,
          fanChange: -500,
        },
        preview: '获得 150 万，士气 -10，粉丝 -500',
      },
      {
        id: 'reject',
        text: '拒绝报价',
        consequences: {
          playerMoraleChange: -3,
        },
        preview: '选手士气 -3',
      },
    ]
  ),

  createEvent(
    'transfer_004',
    '自由选手试训',
    '一名经验丰富的自由选手希望来队试训。',
    EventCategory.TRANSFER,
    EventRarity.COMMON,
    1.0,
    { playerCount: 4 },
    [
      {
        id: 'invite',
        text: '邀请试训',
        consequences: {
          fundsChange: -5,
        },
        preview: '花费 5 万试训费用',
      },
      {
        id: 'ignore',
        text: '忽略',
        consequences: {},
        preview: '无影响',
      },
    ]
  ),

  createEvent(
    'transfer_005',
    '退役选手转型教练',
    '队内一名老将考虑退役并转型为教练。',
    EventCategory.TRANSFER,
    EventRarity.EPIC,
    0.2,
    { minWeek: 20 },
    [
      {
        id: 'retain_as_coach',
        text: '留任教练',
        consequences: {
          moraleChange: 8,
          reputationChange: 5,
        },
        preview: '士气 +8，声望 +5',
      },
      {
        id: 'let_retire',
        text: '让其退役',
        consequences: {
          moraleChange: -5,
          fundsChange: -20,
        },
        preview: '士气 -5，支付 20 万退役金',
      },
    ]
  ),

  // ==================== 伤病意外 (INJURY) ====================
  createEvent(
    'injury_001',
    '选手训练受伤',
    '一名选手在训练中不慎受伤，需要休息恢复。',
    EventCategory.INJURY,
    EventRarity.COMMON,
    1.0,
    {},
    [
      {
        id: 'rest',
        text: '安排休息',
        consequences: {
          playerMoraleChange: -3,
          staminaChange: 10,
        },
        preview: '选手士气 -3，体力恢复 +10',
      },
      {
        id: 'continue',
        text: '继续训练',
        consequences: {
          playerMoraleChange: -8,
          staminaChange: -10,
        },
        preview: '选手士气 -8，体力 -10',
      },
    ]
  ),

  createEvent(
    'injury_002',
    '选手身体不适',
    '多名选手反映身体不适，可能是过度训练导致。',
    EventCategory.INJURY,
    EventRarity.UNCOMMON,
    0.7,
    {},
    [
      {
        id: 'cancel_training',
        text: '取消训练',
        consequences: {
          staminaChange: 20,
          moraleChange: 5,
        },
        preview: '体力 +20，士气 +5',
      },
      {
        id: 'reduce_training',
        text: '减少训练量',
        consequences: {
          staminaChange: 10,
        },
        preview: '体力 +10',
      },
    ]
  ),

  createEvent(
    'injury_003',
    '严重伤病',
    '队内核心选手遭遇严重伤病，可能需要长期休养。',
    EventCategory.INJURY,
    EventRarity.RARE,
    0.3,
    {},
    [
      {
        id: 'surgery',
        text: '手术治疗',
        consequences: {
          fundsChange: -50,
          playerMoraleChange: 5,
        },
        preview: '花费 50 万，选手士气 +5',
      },
      {
        id: 'conservative',
        text: '保守治疗',
        consequences: {
          fundsChange: -20,
          playerMoraleChange: -5,
        },
        preview: '花费 20 万，选手士气 -5',
      },
    ]
  ),

  createEvent(
    'injury_004',
    '队医建议',
    '队医建议加强选手的健康管理。',
    EventCategory.INJURY,
    EventRarity.COMMON,
    1.0,
    {},
    [
      {
        id: 'invest_medical',
        text: '投资医疗设施',
        consequences: {
          fundsChange: -30,
          staminaChange: 15,
        },
        preview: '花费 30 万，体力恢复 +15',
      },
      {
        id: 'ignore',
        text: '暂不考虑',
        consequences: {},
        preview: '无影响',
      },
    ]
  ),

  createEvent(
    'injury_005',
    '选手康复归来',
    '受伤的选手已经康复，可以重返赛场。',
    EventCategory.INJURY,
    EventRarity.UNCOMMON,
    0.8,
    {},
    [
      {
        id: 'welcome',
        text: '欢迎归来',
        consequences: {
          moraleChange: 8,
          playerMoraleChange: 10,
        },
        preview: '士气 +8，选手士气 +10',
      },
      {
        id: 'cautious',
        text: '谨慎使用',
        consequences: {
          playerMoraleChange: 3,
        },
        preview: '选手士气 +3',
      },
    ]
  ),

  // ==================== 内部矛盾 (INTERNAL) ====================
  createEvent(
    'internal_001',
    '选手间发生争执',
    '队内两名选手因训练问题发生争执。',
    EventCategory.INTERNAL,
    EventRarity.UNCOMMON,
    0.8,
    { playerCount: 5 },
    [
      {
        id: 'mediate',
        text: '调解矛盾',
        consequences: {
          moraleChange: 3,
        },
        preview: '士气 +3',
      },
      {
        id: 'punish',
        text: '惩罚双方',
        consequences: {
          moraleChange: -5,
          playerMoraleChange: -8,
        },
        preview: '士气 -5，涉事选手士气 -8',
      },
    ]
  ),

  createEvent(
    'internal_002',
    '主力与替补矛盾',
    '主力选手和替补选手之间出现隔阂。',
    EventCategory.INTERNAL,
    EventRarity.RARE,
    0.5,
    {},
    [
      {
        id: 'team_building',
        text: '组织团建',
        consequences: {
          fundsChange: -10,
          moraleChange: 8,
        },
        preview: '花费 10 万，士气 +8',
      },
      {
        id: 'ignore',
        text: '任其发展',
        consequences: {
          moraleChange: -10,
        },
        preview: '士气 -10',
      },
    ]
  ),

  createEvent(
    'internal_003',
    '教练与选手分歧',
    '教练与某位核心选手在战术上存在分歧。',
    EventCategory.INTERNAL,
    EventRarity.UNCOMMON,
    0.7,
    {},
    [
      {
        id: 'support_coach',
        text: '支持教练',
        consequences: {
          playerMoraleChange: -10,
          moraleChange: 3,
        },
        preview: '选手士气 -10，士气 +3',
      },
      {
        id: 'support_player',
        text: '支持选手',
        consequences: {
          playerMoraleChange: 5,
          moraleChange: -5,
        },
        preview: '选手士气 +5，士气 -5',
      },
    ]
  ),

  createEvent(
    'internal_004',
    '团队凝聚力提升',
    '通过近期比赛，团队凝聚力显著提升。',
    EventCategory.INTERNAL,
    EventRarity.COMMON,
    1.0,
    {},
    [
      {
        id: 'celebrate',
        text: '庆祝团建',
        consequences: {
          fundsChange: -15,
          moraleChange: 10,
        },
        preview: '花费 15 万，士气 +10',
      },
      {
        id: 'maintain',
        text: '保持状态',
        consequences: {
          moraleChange: 5,
        },
        preview: '士气 +5',
      },
    ]
  ),

  createEvent(
    'internal_005',
    '老将退役仪式',
    '队内功勋老将即将退役，俱乐部准备举办退役仪式。',
    EventCategory.INTERNAL,
    EventRarity.EPIC,
    0.2,
    { minWeek: 30 },
    [
      {
        id: 'grand_ceremony',
        text: '盛大仪式',
        consequences: {
          fundsChange: -40,
          reputationChange: 15,
          moraleChange: 10,
          fanChange: 500,
        },
        preview: '花费 40 万，声望 +15，士气 +10，粉丝 +500',
      },
      {
        id: 'simple_ceremony',
        text: '简单仪式',
        consequences: {
          fundsChange: -10,
          reputationChange: 5,
          moraleChange: 5,
        },
        preview: '花费 10 万，声望 +5，士气 +5',
      },
    ]
  ),

  // ==================== 媒体事件 (MEDIA) ====================
  createEvent(
    'media_001',
    '媒体采访邀请',
    '某知名体育媒体希望对俱乐部进行专访。',
    EventCategory.MEDIA,
    EventRarity.COMMON,
    1.0,
    {},
    [
      {
        id: 'accept_interview',
        text: '接受采访',
        consequences: {
          reputationChange: 5,
          fanChange: 200,
        },
        preview: '声望 +5，粉丝 +200',
      },
      {
        id: 'decline',
        text: '婉拒',
        consequences: {},
        preview: '无影响',
      },
    ]
  ),

  createEvent(
    'media_002',
    '负面新闻报道',
    '某媒体发布了对俱乐部不利的负面报道。',
    EventCategory.MEDIA,
    EventRarity.UNCOMMON,
    0.6,
    {},
    [
      {
        id: 'respond',
        text: '公开回应',
        consequences: {
          fundsChange: -10,
          reputationChange: 3,
        },
        preview: '花费 10 万公关，声望 +3',
      },
      {
        id: 'ignore',
        text: '不予理会',
        consequences: {
          reputationChange: -8,
          fanChange: -200,
        },
        preview: '声望 -8，粉丝 -200',
      },
    ]
  ),

  createEvent(
    'media_003',
    '纪录片拍摄',
    '某视频平台希望拍摄俱乐部日常训练纪录片。',
    EventCategory.MEDIA,
    EventRarity.RARE,
    0.4,
    { minReputation: 50 },
    [
      {
        id: 'cooperate',
        text: '配合拍摄',
        consequences: {
          fundsChange: 30,
          reputationChange: 10,
          fanChange: 400,
        },
        preview: '获得 30 万，声望 +10，粉丝 +400',
      },
      {
        id: 'decline',
        text: '拒绝打扰',
        consequences: {
          playerMoraleChange: -3,
        },
        preview: '选手士气 -3',
      },
    ]
  ),

  createEvent(
    'media_004',
    '选手登上热搜',
    '队内某选手因精彩表现登上社交媒体热搜。',
    EventCategory.MEDIA,
    EventRarity.UNCOMMON,
    0.7,
    {},
    [
      {
        id: 'promote',
        text: '借势营销',
        consequences: {
          fundsChange: -5,
          fanChange: 600,
          reputationChange: 5,
        },
        preview: '花费 5 万，粉丝 +600，声望 +5',
      },
      {
        id: 'low_profile',
        text: '保持低调',
        consequences: {
          fanChange: 200,
        },
        preview: '粉丝 +200',
      },
    ]
  ),

  createEvent(
    'media_005',
    '最佳阵容评选',
    '媒体发起最佳阵容评选，邀请粉丝投票。',
    EventCategory.MEDIA,
    EventRarity.RARE,
    0.5,
    {},
    [
      {
        id: 'campaign',
        text: '组织拉票',
        consequences: {
          fundsChange: -20,
          fanChange: 500,
          reputationChange: 8,
        },
        preview: '花费 20 万，粉丝 +500，声望 +8',
      },
      {
        id: 'natural',
        text: '顺其自然',
        consequences: {
          fanChange: 100,
        },
        preview: '粉丝 +100',
      },
    ]
  ),

  // ==================== 赞助商相关 (SPONSOR) ====================
  createEvent(
    'sponsor_001',
    '赞助商满意',
    '当前赞助商对俱乐部表现非常满意，考虑增加投入。',
    EventCategory.SPONSOR,
    EventRarity.UNCOMMON,
    0.8,
    {},
    [
      {
        id: 'negotiate',
        text: '谈判加薪',
        consequences: {
          salaryChange: 5,
          reputationChange: 3,
        },
        preview: '周薪 +5 万，声望 +3',
      },
      {
        id: 'thank',
        text: '感谢支持',
        consequences: {
          fundsChange: 20,
        },
        preview: '获得 20 万奖金',
      },
    ]
  ),

  createEvent(
    'sponsor_002',
    '赞助商不满',
    '赞助商对俱乐部近期表现不满，威胁要减少投入。',
    EventCategory.SPONSOR,
    EventRarity.RARE,
    0.4,
    {},
    [
      {
        id: 'promise',
        text: '承诺改进',
        consequences: {
          moraleChange: -5,
        },
        preview: '士气 -5',
      },
      {
        id: 'ignore',
        text: '不予理会',
        consequences: {
          salaryChange: -10,
          reputationChange: -5,
        },
        preview: '周薪 -10 万，声望 -5',
      },
    ]
  ),

  createEvent(
    'sponsor_003',
    '新赞助商接触',
    '某新兴品牌希望成为俱乐部新赞助商。',
    EventCategory.SPONSOR,
    EventRarity.COMMON,
    1.0,
    {},
    [
      {
        id: 'sign',
        text: '签约',
        consequences: {
          salaryChange: 8,
          reputationChange: 5,
        },
        preview: '周薪 +8 万，声望 +5',
      },
      {
        id: 'reject',
        text: '拒绝',
        consequences: {},
        preview: '无影响',
      },
    ]
  ),

  createEvent(
    'sponsor_004',
    '赞助商活动邀请',
    '赞助商邀请俱乐部参加品牌推广活动。',
    EventCategory.SPONSOR,
    EventRarity.COMMON,
    1.0,
    {},
    [
      {
        id: 'participate',
        text: '参加',
        consequences: {
          fundsChange: 15,
          staminaChange: -10,
          fanChange: 300,
        },
        preview: '获得 15 万，体力 -10，粉丝 +300',
      },
      {
        id: 'decline',
        text: '婉拒',
        consequences: {
          reputationChange: -3,
        },
        preview: '声望 -3',
      },
    ]
  ),

  createEvent(
    'sponsor_005',
    '赞助商续约',
    '当前赞助合同即将到期，赞助商提出续约。',
    EventCategory.SPONSOR,
    EventRarity.UNCOMMON,
    0.7,
    { minWeek: 10 },
    [
      {
        id: 'renew',
        text: '续约',
        consequences: {
          salaryChange: 10,
          reputationChange: 5,
        },
        preview: '周薪 +10 万，声望 +5',
      },
      {
        id: 'renegotiate',
        text: '重新谈判',
        consequences: {
          salaryChange: 15,
          reputationChange: -2,
        },
        preview: '周薪 +15 万，声望 -2',
      },
    ]
  ),

  // ==================== 竞争对手动向 (COMPETITOR) ====================
  createEvent(
    'competitor_001',
    '对手俱乐部引援',
    '某竞争对手俱乐部签下强力选手，实力大增。',
    EventCategory.COMPETITOR,
    EventRarity.COMMON,
    1.0,
    {},
    [
      {
        id: 'respond',
        text: '跟进引援',
        consequences: {
          fundsChange: -50,
          moraleChange: 3,
        },
        preview: '花费 50 万，士气 +3',
      },
      {
        id: 'focus_training',
        text: '专注训练',
        consequences: {
          moraleChange: 5,
        },
        preview: '士气 +5',
      },
    ]
  ),

  createEvent(
    'competitor_002',
    '对手内讧',
    '某竞争对手俱乐部爆发内讧，实力受损。',
    EventCategory.COMPETITOR,
    EventRarity.UNCOMMON,
    0.7,
    {},
    [
      {
        id: 'celebrate',
        text: '幸灾乐祸',
        consequences: {
          moraleChange: 5,
        },
        preview: '士气 +5',
      },
      {
        id: 'prepare',
        text: '准备趁势追击',
        consequences: {
          staminaChange: -5,
          moraleChange: 8,
        },
        preview: '体力 -5，士气 +8',
      },
    ]
  ),

  createEvent(
    'competitor_003',
    '强队连败',
    '联赛强队遭遇连败，排名下滑。',
    EventCategory.COMPETITOR,
    EventRarity.RARE,
    0.4,
    {},
    [
      {
        id: 'analyze',
        text: '分析原因',
        consequences: {
          moraleChange: 5,
        },
        preview: '士气 +5',
      },
      {
        id: 'ignore',
        text: '专注自己',
        consequences: {
          staminaChange: 5,
        },
        preview: '体力 +5',
      },
    ]
  ),

  createEvent(
    'competitor_004',
    '黑马崛起',
    '一支新晋俱乐部表现亮眼，成为联赛黑马。',
    EventCategory.COMPETITOR,
    EventRarity.UNCOMMON,
    0.6,
    {},
    [
      {
        id: 'study',
        text: '研究战术',
        consequences: {
          moraleChange: 3,
        },
        preview: '士气 +3',
      },
      {
        id: 'ignore',
        text: '不足为惧',
        consequences: {
          moraleChange: -3,
        },
        preview: '士气 -3',
      },
    ]
  ),

  createEvent(
    'competitor_005',
    '宿敌对决预热',
    '媒体开始预热与宿敌俱乐部的即将到来的比赛。',
    EventCategory.COMPETITOR,
    EventRarity.EPIC,
    0.2,
    {},
    [
      {
        id: 'hype',
        text: '造势',
        consequences: {
          fundsChange: -10,
          moraleChange: 10,
          fanChange: 400,
        },
        preview: '花费 10 万，士气 +10，粉丝 +400',
      },
      {
        id: 'focus',
        text: '专注备战',
        consequences: {
          staminaChange: -5,
          moraleChange: 8,
        },
        preview: '体力 -5，士气 +8',
      },
    ]
  ),

  // ==================== 联赛政策 (LEAGUE_POLICY) ====================
  createEvent(
    'league_policy_001',
    '联赛奖金调整',
    '联赛官方调整本赛季奖金分配方案。',
    EventCategory.LEAGUE_POLICY,
    EventRarity.UNCOMMON,
    0.7,
    {},
    [
      {
        id: 'adapt',
        text: '适应变化',
        consequences: {
          moraleChange: 3,
        },
        preview: '士气 +3',
      },
      {
        id: 'complain',
        text: '表达不满',
        consequences: {
          reputationChange: -5,
        },
        preview: '声望 -5',
      },
    ]
  ),

  createEvent(
    'league_policy_002',
    '工资帽政策',
    '联赛出台工资帽政策，限制选手薪资总额。',
    EventCategory.LEAGUE_POLICY,
    EventRarity.RARE,
    0.4,
    {},
    [
      {
        id: 'comply',
        text: '遵守规定',
        consequences: {
          salaryChange: -15,
          reputationChange: 5,
        },
        preview: '周薪 -15 万，声望 +5',
      },
      {
        id: 'find_loophole',
        text: '寻找漏洞',
        consequences: {
          reputationChange: -10,
          fundsChange: 20,
        },
        preview: '声望 -10，节省 20 万',
      },
    ]
  ),

  createEvent(
    'league_policy_003',
    '青训补贴',
    '联赛推出青训补贴政策，鼓励俱乐部培养新人。',
    EventCategory.LEAGUE_POLICY,
    EventRarity.COMMON,
    1.0,
    {},
    [
      {
        id: 'apply',
        text: '申请补贴',
        consequences: {
          fundsChange: 25,
          reputationChange: 3,
        },
        preview: '获得 25 万，声望 +3',
      },
      {
        id: 'ignore',
        text: '不感兴趣',
        consequences: {},
        preview: '无影响',
      },
    ]
  ),

  createEvent(
    'league_policy_004',
    '赛制改革',
    '联赛宣布下赛季将进行赛制改革。',
    EventCategory.LEAGUE_POLICY,
    EventRarity.RARE,
    0.5,
    {},
    [
      {
        id: 'prepare',
        text: '提前准备',
        consequences: {
          staminaChange: -10,
          moraleChange: 5,
        },
        preview: '体力 -10，士气 +5',
      },
      {
        id: 'wait',
        text: '静观其变',
        consequences: {},
        preview: '无影响',
      },
    ]
  ),

  createEvent(
    'league_policy_005',
    '转会窗口调整',
    '联赛调整转会窗口开放时间。',
    EventCategory.LEAGUE_POLICY,
    EventRarity.UNCOMMON,
    0.6,
    {},
    [
      {
        id: 'adapt',
        text: '调整计划',
        consequences: {
          fundsChange: -5,
        },
        preview: '花费 5 万调整费用',
      },
      {
        id: 'ignore',
        text: '维持原计划',
        consequences: {},
        preview: '无影响',
      },
    ]
  ),

  // ==================== 突发事件 (EMERGENCY) ====================
  createEvent(
    'emergency_001',
    '设备故障',
    '训练基地设备出现故障，需要紧急维修。',
    EventCategory.EMERGENCY,
    EventRarity.COMMON,
    1.0,
    {},
    [
      {
        id: 'repair',
        text: '立即维修',
        consequences: {
          fundsChange: -15,
          staminaChange: 5,
        },
        preview: '花费 15 万，体力 +5',
      },
      {
        id: 'delay',
        text: '延迟处理',
        consequences: {
          staminaChange: -10,
        },
        preview: '体力 -10',
      },
    ]
  ),

  createEvent(
    'emergency_002',
    '基地停电',
    '训练基地突发停电，影响正常训练。',
    EventCategory.EMERGENCY,
    EventRarity.UNCOMMON,
    0.7,
    {},
    [
      {
        id: 'cancel',
        text: '取消训练',
        consequences: {
          staminaChange: 15,
        },
        preview: '体力 +15',
      },
      {
        id: 'relocate',
        text: '转移场地',
        consequences: {
          fundsChange: -10,
          staminaChange: -5,
        },
        preview: '花费 10 万，体力 -5',
      },
    ]
  ),

  createEvent(
    'emergency_003',
    '选手突发疾病',
    '多名选手突发流感，需要隔离治疗。',
    EventCategory.EMERGENCY,
    EventRarity.RARE,
    0.3,
    {},
    [
      {
        id: 'treat',
        text: '积极治疗',
        consequences: {
          fundsChange: -30,
          staminaChange: 20,
        },
        preview: '花费 30 万，体力 +20',
      },
      {
        id: 'rest',
        text: '自然恢复',
        consequences: {
          staminaChange: -20,
          moraleChange: -5,
        },
        preview: '体力 -20，士气 -5',
      },
    ]
  ),

  createEvent(
    'emergency_004',
    '网络攻击',
    '俱乐部系统遭到网络攻击，数据安全受威胁。',
    EventCategory.EMERGENCY,
    EventRarity.EPIC,
    0.1,
    {},
    [
      {
        id: 'hire_security',
        text: '聘请安全团队',
        consequences: {
          fundsChange: -50,
          reputationChange: 5,
        },
        preview: '花费 50 万，声望 +5',
      },
      {
        id: 'handle_internal',
        text: '内部处理',
        consequences: {
          fundsChange: -20,
          reputationChange: -5,
        },
        preview: '花费 20 万，声望 -5',
      },
    ]
  ),

  createEvent(
    'emergency_005',
    '疫情爆发',
    '当地爆发疫情，联赛暂停。',
    EventCategory.EMERGENCY,
    EventRarity.EPIC,
    0.05,
    {},
    [
      {
        id: 'protect',
        text: '加强防护',
        consequences: {
          fundsChange: -40,
          staminaChange: 10,
        },
        preview: '花费 40 万，体力 +10',
      },
      {
        id: 'wait',
        text: '等待通知',
        consequences: {
          staminaChange: -15,
          moraleChange: -10,
        },
        preview: '体力 -15，士气 -10',
      },
    ]
  ),

  // ==================== 荣誉庆典 (HONOR) ====================
  createEvent(
    'honor_001',
    '赛季冠军',
    '恭喜！俱乐部获得本赛季联赛冠军！',
    EventCategory.HONOR,
    EventRarity.EPIC,
    0.1,
    { minRanking: 1, maxRanking: 1 },
    [
      {
        id: 'celebrate',
        text: '盛大庆祝',
        consequences: {
          fundsChange: 100,
          reputationChange: 30,
          moraleChange: 20,
          fanChange: 2000,
        },
        preview: '奖金 100 万，声望 +30，士气 +20，粉丝 +2000',
      },
      {
        id: 'simple',
        text: '简单庆祝',
        consequences: {
          fundsChange: 100,
          reputationChange: 20,
          moraleChange: 15,
          fanChange: 1000,
        },
        preview: '奖金 100 万，声望 +20，士气 +15，粉丝 +1000',
      },
    ]
  ),

  createEvent(
    'honor_002',
    '季后赛资格',
    '俱乐部成功获得季后赛资格！',
    EventCategory.HONOR,
    EventRarity.UNCOMMON,
    0.5,
    { minRanking: 1, maxRanking: 8 },
    [
      {
        id: 'prepare',
        text: '积极备战',
        consequences: {
          staminaChange: -10,
          moraleChange: 10,
        },
        preview: '体力 -10，士气 +10',
      },
      {
        id: 'celebrate',
        text: '庆祝一下',
        consequences: {
          fundsChange: -10,
          moraleChange: 8,
        },
        preview: '花费 10 万，士气 +8',
      },
    ]
  ),

  createEvent(
    'honor_003',
    '选手获得 MVP',
    '队内选手获得本赛季常规赛 MVP！',
    EventCategory.HONOR,
    EventRarity.RARE,
    0.3,
    {},
    [
      {
        id: 'celebrate',
        text: '表彰选手',
        consequences: {
          fundsChange: -20,
          reputationChange: 15,
          moraleChange: 10,
          fanChange: 800,
        },
        preview: '花费 20 万奖金，声望 +15，士气 +10，粉丝 +800',
      },
      {
        id: 'encourage',
        text: '口头鼓励',
        consequences: {
          playerMoraleChange: 10,
          moraleChange: 5,
        },
        preview: '选手士气 +10，士气 +5',
      },
    ]
  ),

  createEvent(
    'honor_004',
    '年度最佳俱乐部',
    '俱乐部被评为年度最佳俱乐部！',
    EventCategory.HONOR,
    EventRarity.EPIC,
    0.1,
    { minReputation: 80 },
    [
      {
        id: 'accept',
        text: '接受荣誉',
        consequences: {
          reputationChange: 25,
          fundsChange: 50,
          fanChange: 1500,
        },
        preview: '声望 +25，奖金 50 万，粉丝 +1500',
      },
      {
        id: 'humble',
        text: '谦虚回应',
        consequences: {
          reputationChange: 20,
          moraleChange: 10,
        },
        preview: '声望 +20，士气 +10',
      },
    ]
  ),

  createEvent(
    'honor_005',
    '里程碑成就',
    '俱乐部达成重要里程碑（100 胜/1000 场等）！',
    EventCategory.HONOR,
    EventRarity.UNCOMMON,
    0.6,
    {},
    [
      {
        id: 'celebrate',
        text: '庆祝活动',
        consequences: {
          fundsChange: -15,
          reputationChange: 10,
          fanChange: 500,
        },
        preview: '花费 15 万，声望 +10，粉丝 +500',
      },
      {
        id: 'announce',
        text: '官方宣布',
        consequences: {
          reputationChange: 8,
          fanChange: 300,
        },
        preview: '声望 +8，粉丝 +300',
      },
    ]
  ),
];

// 按类别筛选事件
export function getEventsByCategory(category: EventCategory): GameEvent[] {
  return events.filter(e => e.category === category);
}

// 按稀有度筛选事件
export function getEventsByRarity(rarity: EventRarity): GameEvent[] {
  return events.filter(e => e.rarity === rarity);
}

// 获取可用事件（基于条件）
export function getAvailableEvents(conditions: Partial<EventTriggerCondition>): GameEvent[] {
  return events.filter(event => {
    const trigger = event.triggerConditions;
    
    // 检查所有条件
    if (conditions.minReputation !== undefined && trigger.minReputation !== undefined && conditions.minReputation < trigger.minReputation) {
      return false;
    }
    if (conditions.maxReputation !== undefined && trigger.maxReputation !== undefined && conditions.maxReputation > trigger.maxReputation) {
      return false;
    }
    if (conditions.minFunds !== undefined && trigger.minFunds !== undefined && conditions.minFunds < trigger.minFunds) {
      return false;
    }
    // 更多条件检查...
    
    return true;
  });
}
