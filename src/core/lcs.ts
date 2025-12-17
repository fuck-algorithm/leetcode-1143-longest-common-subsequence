import type { CellPosition, CellComputation, AnimationStep, BacktraceResult, ComparisonInfo } from '../types';

/**
 * 初始化DP表
 * 创建 (m+1) × (n+1) 的表格，第一行和第一列设为0
 * @param m text1的长度
 * @param n text2的长度
 * @returns 初始化后的DP表
 */
export function initializeDPTable(m: number, n: number): number[][] {
  const dp: number[][] = [];
  for (let i = 0; i <= m; i++) {
    dp[i] = [];
    for (let j = 0; j <= n; j++) {
      dp[i][j] = 0;
    }
  }
  return dp;
}

/**
 * 单元格计算结果（扩展版，包含比较信息）
 */
export interface CellComputationExtended extends CellComputation {
  comparisonInfo?: ComparisonInfo;
}

/**
 * 计算单个单元格的值
 * @param text1 第一个字符串
 * @param text2 第二个字符串
 * @param dpTable 当前DP表
 * @param i 行索引 (1-based for text1)
 * @param j 列索引 (1-based for text2)
 * @returns 单元格计算结果
 */
export function computeCell(
  text1: string,
  text2: string,
  dpTable: number[][],
  i: number,
  j: number
): CellComputationExtended {
  const char1 = text1[i - 1];
  const char2 = text2[j - 1];
  
  if (char1 === char2) {
    // 字符匹配，从对角线转移
    return {
      value: dpTable[i - 1][j - 1] + 1,
      transitionType: 'match',
      sourceCells: [{ row: i - 1, col: j - 1 }]
    };
  } else {
    // 字符不匹配，取上方或左方的最大值
    const fromTop = dpTable[i - 1][j];
    const fromLeft = dpTable[i][j - 1];
    const topCell: CellPosition = { row: i - 1, col: j };
    const leftCell: CellPosition = { row: i, col: j - 1 };
    
    // 比较信息：同时记录两个单元格的值
    const comparisonInfo: ComparisonInfo = {
      topValue: fromTop,
      leftValue: fromLeft,
      topCell,
      leftCell
    };
    
    if (fromTop >= fromLeft) {
      return {
        value: fromTop,
        transitionType: 'fromTop',
        sourceCells: [topCell, leftCell], // 同时包含两个单元格用于高亮
        comparisonInfo
      };
    } else {
      return {
        value: fromLeft,
        transitionType: 'fromLeft',
        sourceCells: [topCell, leftCell], // 同时包含两个单元格用于高亮
        comparisonInfo
      };
    }
  }
}


/**
 * 深拷贝DP表
 */
function cloneDPTable(dp: number[][]): number[][] {
  return dp.map(row => [...row]);
}

/**
 * 生成所有动画步骤 - 细粒度版本，每一步对应代码中的一行
 * @param text1 第一个字符串
 * @param text2 第二个字符串
 * @returns 动画步骤数组
 */
export function generateSteps(text1: string, text2: string): AnimationStep[] {
  const m = text1.length;
  const n = text2.length;
  const dp = initializeDPTable(m, n);
  const steps: AnimationStep[] = [];
  
  // 辅助函数：创建基础步骤
  const createStep = (
    codePhase: AnimationStep['codePhase'],
    highlightLine: number,
    variables: AnimationStep['variables'],
    row: number = 0,
    col: number = 0,
    value: number = 0,
    transitionType: AnimationStep['transitionType'] = 'match',
    sourceCells: CellPosition[] = [],
    comparisonInfo?: ComparisonInfo
  ): AnimationStep => ({
    row,
    col,
    value,
    transitionType,
    char1: row > 0 ? text1[row - 1] : '',
    char2: col > 0 ? text2[col - 1] : '',
    sourceCells,
    dpTableSnapshot: cloneDPTable(dp),
    codePhase,
    variables: { ...variables },
    highlightLine,
    comparisonInfo
  });
  
  // 步骤1: int m = text1.length()
  steps.push(createStep('init-m', 3, { m }));
  
  // 步骤2: int n = text2.length()
  steps.push(createStep('init-n', 4, { m, n }));
  
  // 步骤3: int[][] dp = new int[m+1][n+1]
  steps.push(createStep('init-dp', 5, { m, n }));
  
  // 主循环
  for (let i = 1; i <= m; i++) {
    // 步骤: for (int i = 1; i <= m; i++)
    steps.push(createStep('loop-i', 7, { m, n, i }));
    
    for (let j = 1; j <= n; j++) {
      // 步骤: for (int j = 1; j <= n; j++)
      steps.push(createStep('loop-j', 8, { m, n, i, j }));
      
      const char1 = text1[i - 1];
      const char2 = text2[j - 1];
      const isMatch = char1 === char2;
      
      // 步骤: if (text1.charAt(i-1) == text2.charAt(j-1))
      steps.push(createStep('compare', 9, { 
        m, n, i, j, 
        char1, 
        char2 
      }, i, j, 0, 'match'));
      
      if (isMatch) {
        // 字符匹配
        const diagValue = dp[i - 1][j - 1];
        const newValue = diagValue + 1;
        dp[i][j] = newValue;
        
        // 步骤: dp[i][j] = dp[i-1][j-1] + 1
        steps.push(createStep('match-assign', 10, {
          m, n, i, j,
          char1,
          char2,
          diagValue,
          dpValue: newValue
        }, i, j, newValue, 'match', [{ row: i - 1, col: j - 1 }]));
      } else {
        // 字符不匹配
        const topValue = dp[i - 1][j];
        const leftValue = dp[i][j - 1];
        const newValue = Math.max(topValue, leftValue);
        const transitionType = topValue >= leftValue ? 'fromTop' : 'fromLeft';
        dp[i][j] = newValue;
        
        const comparisonInfo: ComparisonInfo = {
          topValue,
          leftValue,
          topCell: { row: i - 1, col: j },
          leftCell: { row: i, col: j - 1 }
        };
        
        // 步骤: dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])
        steps.push(createStep('mismatch-assign', 12, {
          m, n, i, j,
          char1,
          char2,
          topValue,
          leftValue,
          dpValue: newValue
        }, i, j, newValue, transitionType, 
          [{ row: i - 1, col: j }, { row: i, col: j - 1 }],
          comparisonInfo
        ));
      }
    }
  }
  
  // 最后一步: return dp[m][n]
  const finalValue = dp[m][n];
  steps.push(createStep('return', 16, { 
    m, n, 
    dpValue: finalValue 
  }, m, n, finalValue, 'match'));
  
  return steps;
}

/**
 * 生成回溯路径
 * @param text1 第一个字符串
 * @param text2 第二个字符串
 * @param dpTable 完整的DP表
 * @returns 回溯结果
 */
export function generateBacktrace(
  text1: string,
  text2: string,
  dpTable: number[][]
): BacktraceResult {
  const path: CellPosition[] = [];
  const matchCells: CellPosition[] = [];
  const text1Indices: number[] = [];
  const text2Indices: number[] = [];
  let lcs = '';
  
  let i = text1.length;
  let j = text2.length;
  
  // 从右下角开始回溯
  while (i > 0 && j > 0) {
    path.push({ row: i, col: j });
    
    if (text1[i - 1] === text2[j - 1]) {
      // 字符匹配，对角线移动
      matchCells.push({ row: i, col: j });
      text1Indices.unshift(i - 1);
      text2Indices.unshift(j - 1);
      lcs = text1[i - 1] + lcs;
      i--;
      j--;
    } else if (dpTable[i - 1][j] >= dpTable[i][j - 1]) {
      // 向上移动
      i--;
    } else {
      // 向左移动
      j--;
    }
  }
  
  // 添加剩余路径到边界
  while (i > 0) {
    path.push({ row: i, col: 0 });
    i--;
  }
  while (j > 0) {
    path.push({ row: 0, col: j });
    j--;
  }
  path.push({ row: 0, col: 0 });
  
  return {
    path,
    matchCells,
    lcs,
    text1Indices,
    text2Indices
  };
}

/**
 * 计算完整的DP表
 * @param text1 第一个字符串
 * @param text2 第二个字符串
 * @returns 完整的DP表
 */
export function computeFullDPTable(text1: string, text2: string): number[][] {
  const m = text1.length;
  const n = text2.length;
  const dp = initializeDPTable(m, n);
  
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const computation = computeCell(text1, text2, dp, i, j);
      dp[i][j] = computation.value;
    }
  }
  
  return dp;
}

/**
 * 获取某个格子对应的LCS子序列
 * 从格子(i,j)回溯到(0,0)，找出对应的LCS
 * @param text1 第一个字符串
 * @param text2 第二个字符串
 * @param dpTable 完整的DP表
 * @param targetRow 目标行
 * @param targetCol 目标列
 * @returns LCS子序列及其在两个字符串中的位置
 */
export function getLCSAtCell(
  text1: string,
  text2: string,
  dpTable: number[][],
  targetRow: number,
  targetCol: number
): { lcs: string; text1Indices: number[]; text2Indices: number[] } {
  const text1Indices: number[] = [];
  const text2Indices: number[] = [];
  let lcs = '';
  
  let i = targetRow;
  let j = targetCol;
  
  // 从目标格子回溯到(0,0)
  while (i > 0 && j > 0) {
    if (text1[i - 1] === text2[j - 1]) {
      // 字符匹配，对角线移动
      text1Indices.unshift(i - 1);
      text2Indices.unshift(j - 1);
      lcs = text1[i - 1] + lcs;
      i--;
      j--;
    } else if (dpTable[i - 1][j] >= dpTable[i][j - 1]) {
      // 向上移动
      i--;
    } else {
      // 向左移动
      j--;
    }
  }
  
  return { lcs, text1Indices, text2Indices };
}
