import { describe, it, expect } from 'vitest';
import { validateInput } from './validation';
import { generateSteps, generateBacktrace, computeFullDPTable } from './lcs';

/**
 * 集成测试：测试完整的LCS计算流程
 * 注意：新的步骤生成逻辑包含更细粒度的代码执行步骤
 */
describe('Integration Tests', () => {
  describe('Complete flow: input → animation → backtrace', () => {
    it('should correctly process "abcde" and "ace"', () => {
      const text1 = 'abcde';
      const text2 = 'ace';

      // 1. 验证输入
      expect(validateInput(text1)).toBe(true);
      expect(validateInput(text2)).toBe(true);

      // 2. 生成动画步骤
      const steps = generateSteps(text1, text2);
      // 新的步骤包括：3个初始化 + 循环步骤 + 比较步骤 + 赋值步骤 + 1个返回
      expect(steps.length).toBeGreaterThan(0);

      // 3. 验证最终DP表（最后一步是return步骤）
      const finalStep = steps[steps.length - 1];
      expect(finalStep.codePhase).toBe('return');
      expect(finalStep.variables.dpValue).toBe(3); // LCS长度为3

      // 4. 生成回溯
      const fullDp = computeFullDPTable(text1, text2);
      const backtrace = generateBacktrace(text1, text2, fullDp);
      
      expect(backtrace.lcs).toBe('ace');
      expect(backtrace.lcs.length).toBe(3);
      expect(backtrace.text1Indices).toEqual([0, 2, 4]); // a, c, e 在 text1 中的位置
      expect(backtrace.text2Indices).toEqual([0, 1, 2]); // a, c, e 在 text2 中的位置
    });

    it('should correctly process identical strings "abc" and "abc"', () => {
      const text1 = 'abc';
      const text2 = 'abc';

      const steps = generateSteps(text1, text2);
      const finalStep = steps[steps.length - 1];
      
      expect(finalStep.codePhase).toBe('return');
      expect(finalStep.variables.dpValue).toBe(3);

      const fullDp = computeFullDPTable(text1, text2);
      const backtrace = generateBacktrace(text1, text2, fullDp);
      
      expect(backtrace.lcs).toBe('abc');
      expect(backtrace.matchCells.length).toBe(3);
    });

    it('should correctly process strings with no common subsequence', () => {
      const text1 = 'abc';
      const text2 = 'def';

      const steps = generateSteps(text1, text2);
      const finalStep = steps[steps.length - 1];
      
      expect(finalStep.codePhase).toBe('return');
      expect(finalStep.variables.dpValue).toBe(0);

      const fullDp = computeFullDPTable(text1, text2);
      const backtrace = generateBacktrace(text1, text2, fullDp);
      
      expect(backtrace.lcs).toBe('');
      expect(backtrace.matchCells.length).toBe(0);
    });

    it('should track correct transition types during animation', () => {
      const text1 = 'ab';
      const text2 = 'ab';

      const steps = generateSteps(text1, text2);
      
      // 找到赋值步骤（match-assign 或 mismatch-assign）
      const assignSteps = steps.filter(s => 
        s.codePhase === 'match-assign' || s.codePhase === 'mismatch-assign'
      );
      
      // 应该有4个赋值步骤（2x2矩阵）
      expect(assignSteps.length).toBe(4);
      
      // 第一个赋值: dp[1][1], 比较 'a' 和 'a' - 匹配
      expect(assignSteps[0].codePhase).toBe('match-assign');
      expect(assignSteps[0].variables.char1).toBe('a');
      expect(assignSteps[0].variables.char2).toBe('a');
      
      // 第二个赋值: dp[1][2], 比较 'a' 和 'b' - 不匹配
      expect(assignSteps[1].codePhase).toBe('mismatch-assign');
      
      // 第四个赋值: dp[2][2], 比较 'b' 和 'b' - 匹配
      expect(assignSteps[3].codePhase).toBe('match-assign');
      expect(assignSteps[3].value).toBe(2);
    });
  });

  describe('Edge cases', () => {
    it('should handle single character strings', () => {
      const text1 = 'a';
      const text2 = 'a';

      const steps = generateSteps(text1, text2);
      expect(steps.length).toBeGreaterThan(0);
      
      // 找到赋值步骤
      const assignSteps = steps.filter(s => 
        s.codePhase === 'match-assign' || s.codePhase === 'mismatch-assign'
      );
      expect(assignSteps.length).toBe(1);
      expect(assignSteps[0].value).toBe(1);
      expect(assignSteps[0].codePhase).toBe('match-assign');

      const fullDp = computeFullDPTable(text1, text2);
      const backtrace = generateBacktrace(text1, text2, fullDp);
      expect(backtrace.lcs).toBe('a');
    });

    it('should handle single character with no match', () => {
      const text1 = 'a';
      const text2 = 'b';

      const steps = generateSteps(text1, text2);
      expect(steps.length).toBeGreaterThan(0);
      
      // 找到赋值步骤
      const assignSteps = steps.filter(s => 
        s.codePhase === 'match-assign' || s.codePhase === 'mismatch-assign'
      );
      expect(assignSteps.length).toBe(1);
      expect(assignSteps[0].value).toBe(0);
      expect(assignSteps[0].codePhase).toBe('mismatch-assign');

      const fullDp = computeFullDPTable(text1, text2);
      const backtrace = generateBacktrace(text1, text2, fullDp);
      expect(backtrace.lcs).toBe('');
    });

    it('should handle maximum length strings (10 chars)', () => {
      const text1 = 'abcdefghij';
      const text2 = 'aeiou';

      expect(validateInput(text1)).toBe(true);
      expect(validateInput(text2)).toBe(true);

      const steps = generateSteps(text1, text2);
      expect(steps.length).toBeGreaterThan(0);
      
      // 找到赋值步骤
      const assignSteps = steps.filter(s => 
        s.codePhase === 'match-assign' || s.codePhase === 'mismatch-assign'
      );
      expect(assignSteps.length).toBe(50); // 10 * 5

      const fullDp = computeFullDPTable(text1, text2);
      const backtrace = generateBacktrace(text1, text2, fullDp);
      
      // LCS should be 'aei' (a, e, i are common)
      expect(backtrace.lcs.length).toBe(fullDp[10][5]);
    });
  });
});
