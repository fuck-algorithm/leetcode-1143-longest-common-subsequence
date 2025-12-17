import { describe, it, expect } from 'vitest';
import * as fc from 'fast-check';
import { initializeDPTable, computeCell } from './lcs';

// 生成有效的小写字母字符串 (1-10字符)
const validStringArb = fc.stringOf(
  fc.constantFrom(...'abcdefghijklmnopqrstuvwxyz'.split('')),
  { minLength: 1, maxLength: 10 }
);

describe('LCS Algorithm Core', () => {
  // **Feature: lcs-visualization, Property 3: DP Table Initialization Correctness**
  // **Validates: Requirements 2.1, 2.4**
  describe('Property 3: DP Table Initialization Correctness', () => {
    it('should create table with dimensions (m+1) × (n+1)', () => {
      fc.assert(
        fc.property(
          validStringArb,
          validStringArb,
          (text1, text2) => {
            const m = text1.length;
            const n = text2.length;
            const dp = initializeDPTable(m, n);
            
            // 验证行数
            expect(dp.length).toBe(m + 1);
            // 验证每行的列数
            for (let i = 0; i <= m; i++) {
              expect(dp[i].length).toBe(n + 1);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should set first row to all zeros', () => {
      fc.assert(
        fc.property(
          validStringArb,
          validStringArb,
          (text1, text2) => {
            const m = text1.length;
            const n = text2.length;
            const dp = initializeDPTable(m, n);
            
            // 验证第一行全为0
            for (let j = 0; j <= n; j++) {
              expect(dp[0][j]).toBe(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should set first column to all zeros', () => {
      fc.assert(
        fc.property(
          validStringArb,
          validStringArb,
          (text1, text2) => {
            const m = text1.length;
            const n = text2.length;
            const dp = initializeDPTable(m, n);
            
            // 验证第一列全为0
            for (let i = 0; i <= m; i++) {
              expect(dp[i][0]).toBe(0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  // **Feature: lcs-visualization, Property 4: DP State Transition Correctness**
  // **Validates: Requirements 3.2, 3.3**
  describe('Property 4: DP State Transition Correctness', () => {
    it('should compute dp[i][j] = dp[i-1][j-1] + 1 when characters match', () => {
      fc.assert(
        fc.property(
          validStringArb,
          validStringArb,
          (text1, text2) => {
            const m = text1.length;
            const n = text2.length;
            const dp = initializeDPTable(m, n);
            
            // 填充DP表并验证匹配情况
            for (let i = 1; i <= m; i++) {
              for (let j = 1; j <= n; j++) {
                const result = computeCell(text1, text2, dp, i, j);
                dp[i][j] = result.value;
                
                if (text1[i - 1] === text2[j - 1]) {
                  expect(result.value).toBe(dp[i - 1][j - 1] + 1);
                  expect(result.transitionType).toBe('match');
                }
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should compute dp[i][j] = max(dp[i-1][j], dp[i][j-1]) when characters differ', () => {
      fc.assert(
        fc.property(
          validStringArb,
          validStringArb,
          (text1, text2) => {
            const m = text1.length;
            const n = text2.length;
            const dp = initializeDPTable(m, n);
            
            // 填充DP表并验证不匹配情况
            for (let i = 1; i <= m; i++) {
              for (let j = 1; j <= n; j++) {
                const topValue = dp[i - 1][j];
                const leftValue = dp[i][j - 1];
                const result = computeCell(text1, text2, dp, i, j);
                dp[i][j] = result.value;
                
                if (text1[i - 1] !== text2[j - 1]) {
                  expect(result.value).toBe(Math.max(topValue, leftValue));
                  expect(['fromTop', 'fromLeft']).toContain(result.transitionType);
                }
              }
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Known Examples', () => {
    it('should compute LCS length 3 for "abcde" and "ace"', () => {
      const text1 = 'abcde';
      const text2 = 'ace';
      const m = text1.length;
      const n = text2.length;
      const dp = initializeDPTable(m, n);
      
      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          const result = computeCell(text1, text2, dp, i, j);
          dp[i][j] = result.value;
        }
      }
      
      expect(dp[m][n]).toBe(3);
    });

    it('should compute LCS length 3 for "abc" and "abc"', () => {
      const text1 = 'abc';
      const text2 = 'abc';
      const m = text1.length;
      const n = text2.length;
      const dp = initializeDPTable(m, n);
      
      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          const result = computeCell(text1, text2, dp, i, j);
          dp[i][j] = result.value;
        }
      }
      
      expect(dp[m][n]).toBe(3);
    });

    it('should compute LCS length 0 for "abc" and "def"', () => {
      const text1 = 'abc';
      const text2 = 'def';
      const m = text1.length;
      const n = text2.length;
      const dp = initializeDPTable(m, n);
      
      for (let i = 1; i <= m; i++) {
        for (let j = 1; j <= n; j++) {
          const result = computeCell(text1, text2, dp, i, j);
          dp[i][j] = result.value;
        }
      }
      
      expect(dp[m][n]).toBe(0);
    });
  });
});


import { generateSteps, generateBacktrace, computeFullDPTable } from './lcs';

/**
 * 检查字符串是否是另一个字符串的子序列
 */
function isSubsequence(sub: string, str: string): boolean {
  let subIndex = 0;
  for (let i = 0; i < str.length && subIndex < sub.length; i++) {
    if (str[i] === sub[subIndex]) {
      subIndex++;
    }
  }
  return subIndex === sub.length;
}

describe('Step Generator', () => {
  it('should generate correct number of assignment steps', () => {
    fc.assert(
      fc.property(
        validStringArb,
        validStringArb,
        (text1, text2) => {
          const steps = generateSteps(text1, text2);
          // 赋值步骤数量应该等于 m * n
          const assignSteps = steps.filter(s => 
            s.codePhase === 'match-assign' || s.codePhase === 'mismatch-assign'
          );
          expect(assignSteps.length).toBe(text1.length * text2.length);
        }
      ),
      { numRuns: 100 }
    );
  });

  it('should have correct final DP value', () => {
    const steps = generateSteps('abcde', 'ace');
    const lastStep = steps[steps.length - 1];
    // 最后一步是return步骤
    expect(lastStep.codePhase).toBe('return');
    expect(lastStep.variables.dpValue).toBe(3);
  });
});

describe('Backtrace', () => {
  // **Feature: lcs-visualization, Property 5: LCS Result Validity**
  // **Validates: Requirements 5.3**
  describe('Property 5: LCS Result Validity', () => {
    it('LCS should be a valid subsequence of text1', () => {
      fc.assert(
        fc.property(
          validStringArb,
          validStringArb,
          (text1, text2) => {
            const dp = computeFullDPTable(text1, text2);
            const result = generateBacktrace(text1, text2, dp);
            expect(isSubsequence(result.lcs, text1)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('LCS should be a valid subsequence of text2', () => {
      fc.assert(
        fc.property(
          validStringArb,
          validStringArb,
          (text1, text2) => {
            const dp = computeFullDPTable(text1, text2);
            const result = generateBacktrace(text1, text2, dp);
            expect(isSubsequence(result.lcs, text2)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });

    it('LCS length should equal dp[m][n]', () => {
      fc.assert(
        fc.property(
          validStringArb,
          validStringArb,
          (text1, text2) => {
            const dp = computeFullDPTable(text1, text2);
            const result = generateBacktrace(text1, text2, dp);
            expect(result.lcs.length).toBe(dp[text1.length][text2.length]);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  it('should find LCS "ace" for "abcde" and "ace"', () => {
    const dp = computeFullDPTable('abcde', 'ace');
    const result = generateBacktrace('abcde', 'ace', dp);
    expect(result.lcs).toBe('ace');
    expect(result.text1Indices).toEqual([0, 2, 4]);
    expect(result.text2Indices).toEqual([0, 1, 2]);
  });
});
