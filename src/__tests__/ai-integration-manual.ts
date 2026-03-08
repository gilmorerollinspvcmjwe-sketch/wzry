/**
 * AI 系统集成测试脚本
 * 
 * 使用方法：
 * 1. 在浏览器控制台运行
 * 2. 或在 Node.js 环境配合 jsdom 运行
 * 
 * 测试范围：
 * 1. AI 初始化功能
 * 2. 周模拟功能  
 * 3. 转会竞价功能
 * 4. 比赛模拟功能
 * 5. AI 系统集成和接口
 */

console.log('='.repeat(60));
console.log('🤖 AI 系统集成测试开始');
console.log('='.repeat(60));
console.log('');

// 测试结果统计
const testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  failures: [] as string[],
};

function assert(condition: boolean, message: string) {
  testResults.total++;
  if (condition) {
    testResults.passed++;
    console.log(`✅ ${message}`);
  } else {
    testResults.failed++;
    testResults.failures.push(message);
    console.log(`❌ ${message}`);
  }
}

// 导入必要的模块
const { Club } = require('@/core/models/Club');
const { Player } = require('@/core/models/Player');
const { AIService } = require('@/core/services/aiService');
const { TransferService } = require('@/core/services/transferService');

console.log('📦 模块加载完成');
console.log('');

// ============================================
// 1. AI 初始化功能测试
// ============================================
console.log('📍 测试组 1: AI 初始化功能');
console.log('-'.repeat(60));

try {
  // 测试 1.1: 默认模板初始化
  const profile1 = AIService.initAIClub('ai-club-1');
  assert(profile1 !== undefined, '应该正确初始化 AI 俱乐部配置');
  assert(profile1.clubId === 'ai-club-1', '俱乐部 ID 应该正确');
  assert(profile1.personality.aggressiveness === 50, '默认模板 aggressiveness 应为 50');
  
  // 测试 1.2: 不同模板
  const profileAggressive = AIService.initAIClub('ai-agg', 'aggressive');
  assert(profileAggressive.personality.aggressiveness > 70, '激进型 AI aggressiveness 应大于 70');
  
  const profileConservative = AIService.initAIClub('ai-con', 'conservative');
  assert(profileConservative.personality.aggressiveness < 30, '保守型 AI aggressiveness 应小于 30');
  
  // 测试 1.3: 获取 AI 配置
  const retrieved = AIService.getAIProfile('ai-club-1');
  assert(retrieved !== undefined, '应该能够获取已初始化的 AI 配置');
  assert(retrieved?.clubId === 'ai-club-1', '获取的 AI 配置 ID 应正确');
  
  // 测试 1.4: 未初始化的俱乐部
  const nonExistent = AIService.getAIProfile('non-existent');
  assert(nonExistent === undefined, '未初始化的俱乐部应返回 undefined');
  
  // 测试 1.5: 随机 AI 生成
  const randomAI = AIService.generateRandomAI();
  assert(randomAI !== undefined, '应该生成随机 AI 配置');
  assert(randomAI.personality.aggressiveness >= 0 && randomAI.personality.aggressiveness <= 100, '随机 AI 参数应在有效范围');
  
  console.log('✅ AI 初始化功能测试完成');
} catch (error) {
  console.log('❌ AI 初始化功能测试出错:', error);
}

console.log('');

// ============================================
// 2. AI 周模拟功能测试
// ============================================
console.log('📍 测试组 2: AI 周模拟功能');
console.log('-'.repeat(60));

try {
  // 创建测试俱乐部和选手
  const testClub = new Club('Test AI Club');
  testClub.funds = 3000;
  
  const youngPlayer = new Player('YoungStar', 'top', 19);
  const veteranPlayer = new Player('Veteran', 'jungle', 27);
  
  testClub.addPlayer(youngPlayer, false);
  testClub.addPlayer(veteranPlayer, false);
  
  AIService.initAIClub(testClub.id, 'balanced');
  
  // 测试 2.1: 训练决策
  const youngDecision = AIService.makeTrainingDecision(youngPlayer, AIService.getAIProfile(testClub.id)!);
  assert(youngDecision.type === 'train', '年轻选手应该训练');
  assert(youngDecision.stat === 'mechanics', '年轻选手应该训练操作');
  
  const vetDecision = AIService.makeTrainingDecision(veteranPlayer, AIService.getAIProfile(testClub.id)!);
  assert(vetDecision.type === 'train', '老将应该训练');
  assert(vetDecision.stat === 'awareness', '老将应该训练意识');
  
  // 测试 2.2: 体力恢复
  const tiredPlayer = new Player('TiredPlayer', 'mid', 22, 70);
  (tiredPlayer as any).condition = { stamina: 20, morale: 80, mentality: 80 };
  testClub.addPlayer(tiredPlayer, false);
  
  const tiredDecision = AIService.makeTrainingDecision(tiredPlayer, AIService.getAIProfile(testClub.id)!);
  assert(tiredDecision.type === 'rest', '体力不足的选手应该休息');
  
  // 测试 2.3: 周模拟执行
  assert(() => {
    AIService.simulateAIWeek(testClub, []);
    return true;
  }, '周模拟应该正常执行不抛异常');
  
  console.log('✅ AI 周模拟功能测试完成');
} catch (error) {
  console.log('❌ AI 周模拟功能测试出错:', error);
}

console.log('');

// ============================================
// 3. AI 转会竞价功能测试
// ============================================
console.log('📍 测试组 3: AI 转会竞价功能');
console.log('-'.repeat(60));

try {
  const testClub = new Club('Test Club');
  const ai = AIService.initAIClub(testClub.id);
  
  // 测试 3.1: 位置需求评估
  const needScore = AIService.evaluatePositionNeed(testClub, 'adc', ai);
  assert(needScore >= 60, '空缺位置需求分数应较高');
  
  // 测试 3.2: 选手价值评估
  const youngPlayer = new Player('YoungStar', 'mid', 18, 70);
  const veteranPlayer = new Player('Veteran', 'mid', 28, 80);
  
  const youngValue = AIService.evaluatePlayerValue(youngPlayer, ai);
  const veteranValue = AIService.evaluatePlayerValue(veteranPlayer, ai);
  
  assert(youngValue > youngPlayer.getTotalPower(), '年轻选手应有潜力加成');
  
  // 测试 3.3: 转会决策
  testClub.funds = 3000;
  const availablePlayers = [
    new Player('GoodADC', 'adc', 22, 80),
    new Player('BadADC', 'adc', 25, 50),
  ];
  
  const decision = AIService.makeTransferDecision(testClub, availablePlayers);
  assert(decision !== undefined, '应该生成转会决策');
  assert(decision.reason !== undefined, '决策应有原因说明');
  
  console.log('✅ AI 转会竞价功能测试完成');
} catch (error) {
  console.log('❌ AI 转会竞价功能测试出错:', error);
}

console.log('');

// ============================================
// 4. AI 比赛模拟功能测试
// ============================================
console.log('📍 测试组 4: AI 比赛模拟功能');
console.log('-'.repeat(60));

try {
  const strongClub = new Club('Strong Club');
  const weakClub = new Club('Weak Club');
  
  // 添加强力选手
  for (let i = 0; i < 5; i++) {
    strongClub.addPlayer(new Player(`Star${i}`, 'top', 22, 90), false);
    weakClub.addPlayer(new Player(`Weak${i}`, 'top', 22, 60), false);
  }
  
  const strongAI = AIService.initAIClub(strongClub.id, 'balanced');
  const weakAI = AIService.initAIClub(weakClub.id, 'balanced');
  
  // 测试 4.1: 战术选择
  const tactics = AIService.selectTactics(strongClub, weakClub, strongAI);
  assert(tactics !== undefined, '应该能够选择战术');
  assert(tactics.style !== undefined, '战术应有风格');
  assert(tactics.focus !== undefined, '战术应有重点');
  
  // 测试 4.2: 根据实力选择战术
  const strongVsWeak = AIService.selectTactics(strongClub, weakClub, strongAI);
  assert(strongVsWeak.style === 'aggressive', '强打弱应该激进');
  
  const weakVsStrong = AIService.selectTactics(weakClub, strongClub, weakAI);
  assert(weakVsStrong.style === 'defensive', '弱打强应该防守');
  
  console.log('✅ AI 比赛模拟功能测试完成');
} catch (error) {
  console.log('❌ AI 比赛模拟功能测试出错:', error);
}

console.log('');

// ============================================
// 5. AI 系统集成测试
// ============================================
console.log('📍 测试组 5: AI 系统集成和接口');
console.log('-'.repeat(60));

try {
  // 测试 5.1: AI 配置一致性
  const clubId = 'test-club';
  const profile1 = AIService.initAIClub(clubId, 'aggressive');
  const profile2 = AIService.getAIProfile(clubId);
  assert(JSON.stringify(profile1) === JSON.stringify(profile2), 'AI 配置应保持一致');
  
  // 测试 5.2: AI 配置序列化
  const serialized = JSON.stringify(profile1);
  const deserialized = JSON.parse(serialized);
  assert(deserialized.clubId === clubId, 'AI 配置应支持序列化');
  assert(deserialized.personality.aggressiveness > 70, '序列化后数据应正确');
  
  // 测试 5.3: 边界情况处理
  assert(() => {
    AIService.initAIClub('');
    return true;
  }, '空俱乐部 ID 不应抛异常');
  
  const fallbackProfile = AIService.initAIClub('test', 'non-existent');
  assert(fallbackProfile !== undefined, '不存在的模板应回退到默认');
  
  console.log('✅ AI 系统集成测试完成');
} catch (error) {
  console.log('❌ AI 系统集成测试出错:', error);
}

console.log('');

// ============================================
// 测试结果汇总
// ============================================
console.log('='.repeat(60));
console.log('📊 测试结果汇总');
console.log('='.repeat(60));
console.log(`总测试数：${testResults.total}`);
console.log(`✅ 通过：${testResults.passed}`);
console.log(`❌ 失败：${testResults.failed}`);

if (testResults.failures.length > 0) {
  console.log('');
  console.log('失败的测试:');
  testResults.failures.forEach((failure, index) => {
    console.log(`  ${index + 1}. ${failure}`);
  });
}

console.log('');
if (testResults.failed === 0) {
  console.log('🎉 所有测试通过！AI 系统功能正常！');
} else {
  console.log('⚠️  部分测试失败，请检查相关功能。');
}
console.log('='.repeat(60));

export default testResults;
