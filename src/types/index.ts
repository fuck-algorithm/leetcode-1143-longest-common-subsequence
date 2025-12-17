/**
 * 单元格位置
 */
export interface CellPosition {
  row: number;
  col: number;
}

/**
 * 状态转移类型
 * - match: 字符匹配，从对角线转移
 * - fromTop: 从上方单元格转移
 * - fromLeft: 从左方单元格转移
 */
export type TransitionType = 'match' | 'fromTop' | 'fromLeft';

/**
 * 代码执行阶段 - 对应代码中的每一行
 * - init-m: 执行 int m = text1.length()
 * - init-n: 执行 int n = text2.length()
 * - init-dp: 执行 int[][] dp = new int[m+1][n+1]
 * - loop-i: 执行 for (int i = 1; i <= m; i++)
 * - loop-j: 执行 for (int j = 1; j <= n; j++)
 * - compare: 执行 if (text1.charAt(i-1) == text2.charAt(j-1))
 * - match-assign: 执行 dp[i][j] = dp[i-1][j-1] + 1
 * - mismatch-assign: 执行 dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])
 * - return: 执行 return dp[m][n]
 */
export type CodeExecutionPhase = 
  | 'init-m' 
  | 'init-n' 
  | 'init-dp' 
  | 'loop-i' 
  | 'loop-j' 
  | 'compare' 
  | 'match-assign' 
  | 'mismatch-assign'
  | 'return';

/**
 * 变量状态 - 当前所有变量的值
 */
export interface VariableState {
  m?: number;
  n?: number;
  i?: number;
  j?: number;
  char1?: string;
  char2?: string;
  dpValue?: number;
  topValue?: number;
  leftValue?: number;
  diagValue?: number;
}

/**
 * 单元格计算结果
 */
export interface CellComputation {
  value: number;
  transitionType: TransitionType;
  sourceCells: CellPosition[];
}

/**
 * 比较信息（字符不匹配时的max比较）
 */
export interface ComparisonInfo {
  topValue: number;      // dp[i-1][j]的值
  leftValue: number;     // dp[i][j-1]的值
  topCell: CellPosition; // 上方单元格位置
  leftCell: CellPosition; // 左方单元格位置
}

/**
 * 动画步骤
 */
export interface AnimationStep {
  // 当前计算的单元格位置
  row: number;
  col: number;
  
  // 计算结果
  value: number;
  
  // 状态转移类型
  transitionType: TransitionType;
  
  // 比较的两个字符
  char1: string;
  char2: string;
  
  // 来源单元格（用于高亮）
  sourceCells: CellPosition[];
  
  // 当前DP表状态（填充到当前步骤）
  dpTableSnapshot: number[][];
  
  // 比较信息（仅当字符不相等时使用）
  comparisonInfo?: ComparisonInfo;
  
  // 代码执行阶段 - 对应当前高亮的代码行
  codePhase: CodeExecutionPhase;
  
  // 当前变量状态
  variables: VariableState;
  
  // 当前高亮的代码行号
  highlightLine: number;
}

/**
 * 回溯结果
 */
export interface BacktraceResult {
  // 回溯路径上的所有单元格
  path: CellPosition[];
  
  // 匹配的单元格（对角线移动）
  matchCells: CellPosition[];
  
  // LCS字符串
  lcs: string;
  
  // text1中LCS字符的索引
  text1Indices: number[];
  
  // text2中LCS字符的索引
  text2Indices: number[];
}

/**
 * 应用阶段
 */
export type AppPhase = 'input' | 'animating' | 'complete' | 'backtracing';

/**
 * 应用状态
 */
export interface AppState {
  // 输入字符串
  text1: string;
  text2: string;
  
  // 当前阶段
  phase: AppPhase;
  
  // 所有动画步骤
  steps: AnimationStep[];
  
  // 当前步骤索引
  currentStepIndex: number;
  
  // 完整的DP表
  dpTable: number[][];
  
  // 回溯结果
  backtraceResult: BacktraceResult | null;
  
  // 动画控制
  isPlaying: boolean;
  speed: number; // 0.5 - 3.0
}
