import type { AnimationStep, CodeExecutionPhase, VariableState } from '../types';
import './CodePanel.css';

interface CodePanelProps {
  currentStep: AnimationStep | null;
  isComplete: boolean;
  phase: 'input' | 'animating' | 'complete' | 'backtracing';
  text1?: string;
  text2?: string;
}

// Java LCS 解题代码 - 每行对应一个执行步骤（使用2空格缩进）
const javaCode = [
  { line: 1, code: 'class Solution {', indent: 0, type: 'class' },
  { line: 2, code: '  public int lcs(String text1, String text2) {', indent: 1, type: 'method' },
  { line: 3, code: '    int m = text1.length();', indent: 2, type: 'init-m' },
  { line: 4, code: '    int n = text2.length();', indent: 2, type: 'init-n' },
  { line: 5, code: '    int[][] dp = new int[m+1][n+1];', indent: 2, type: 'init-dp' },
  { line: 6, code: '', indent: 0, type: 'empty' },
  { line: 7, code: '    for (int i = 1; i <= m; i++) {', indent: 2, type: 'loop-i' },
  { line: 8, code: '      for (int j = 1; j <= n; j++) {', indent: 3, type: 'loop-j' },
  { line: 9, code: '        if (text1.charAt(i-1) == text2.charAt(j-1)) {', indent: 4, type: 'compare' },
  { line: 10, code: '          dp[i][j] = dp[i-1][j-1] + 1;', indent: 5, type: 'match-assign' },
  { line: 11, code: '        } else {', indent: 4, type: 'else' },
  { line: 12, code: '          dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1]);', indent: 5, type: 'mismatch-assign' },
  { line: 13, code: '        }', indent: 4, type: 'close' },
  { line: 14, code: '      }', indent: 3, type: 'close' },
  { line: 15, code: '    }', indent: 2, type: 'close' },
  { line: 16, code: '    return dp[m][n];', indent: 2, type: 'return' },
  { line: 17, code: '  }', indent: 1, type: 'close' },
  { line: 18, code: '}', indent: 0, type: 'close' },
];

// 根据代码阶段获取高亮类型
function getHighlightType(codePhase: CodeExecutionPhase): string {
  switch (codePhase) {
    case 'init-m':
    case 'init-n':
    case 'init-dp':
      return 'init';
    case 'loop-i':
    case 'loop-j':
      return 'loop';
    case 'compare':
      return 'compare';
    case 'match-assign':
      return 'match';
    case 'mismatch-assign':
      return 'mismatch';
    case 'return':
      return 'return';
    default:
      return 'init';
  }
}

export function CodePanel({ currentStep, isComplete, phase, text1 = '', text2 = '' }: CodePanelProps) {
  // 获取当前高亮行和类型
  const getHighlightInfo = (): { line: number; type: string; variables: VariableState } => {
    if (phase === 'input') {
      return { line: 0, type: 'init', variables: {} };
    }
    
    if (currentStep) {
      return {
        line: currentStep.highlightLine,
        type: getHighlightType(currentStep.codePhase),
        variables: currentStep.variables
      };
    }
    
    if (isComplete) {
      return { line: 16, type: 'return', variables: {} };
    }
    
    return { line: 0, type: 'init', variables: {} };
  };

  const { line: highlightLine, type: highlightType, variables } = getHighlightInfo();

  // 语法高亮
  const highlightSyntax = (code: string): JSX.Element => {
    if (!code) return <span></span>;
    
    let result = code;
    
    // 关键字
    const keywords = ['class', 'public', 'int', 'String', 'for', 'if', 'else', 'return', 'new'];
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'g');
      result = result.replace(regex, `<span class="kw">${kw}</span>`);
    });

    // 类名和方法名
    result = result.replace(/\b(Solution|Math)\b/g, '<span class="cls">$1</span>');
    result = result.replace(/\b(longestCommonSubsequence|length|charAt|max)\b/g, '<span class="fn">$1</span>');
    
    // 数字
    result = result.replace(/\b(\d+)\b/g, '<span class="num">$1</span>');
    
    // 变量名高亮
    const varNames = ['text1', 'text2', 'dp', 'm', 'n', 'i', 'j'];
    varNames.forEach(varName => {
      const regex = new RegExp(`\\b${varName}\\b`, 'g');
      result = result.replace(regex, `<span class="var">${varName}</span>`);
    });

    return <span dangerouslySetInnerHTML={{ __html: result }} />;
  };

  // 获取每行的 inline 变量值显示（像调试器一样）
  const getInlineValues = (lineNum: number): JSX.Element | null => {
    if (phase === 'input') return null;
    
    const v = variables;
    
    // 根据行号显示相关变量的当前值
    switch (lineNum) {
      case 2: // public int lcs(String text1, String text2)
        // 显示输入参数（截断过长的字符串）
        if (text1 && text2) {
          const maxLen = 8;
          const t1Display = text1.length > maxLen ? text1.slice(0, maxLen) + '...' : text1;
          const t2Display = text2.length > maxLen ? text2.slice(0, maxLen) + '...' : text2;
          return (
            <span className="inline-values param-values">
              <span className="inline-var param">text1=<span className="inline-val str">"{t1Display}"</span></span>
              <span className="inline-var param">text2=<span className="inline-val str">"{t2Display}"</span></span>
            </span>
          );
        }
        return null;
      
      case 3: // int m = text1.length()
        if (v.m !== undefined) {
          return (
            <span className="inline-values">
              <span className="inline-var">m=<span className="inline-val">{v.m}</span></span>
            </span>
          );
        }
        return null;
      
      case 4: // int n = text2.length()
        if (v.n !== undefined) {
          return (
            <span className="inline-values">
              <span className="inline-var">n=<span className="inline-val">{v.n}</span></span>
            </span>
          );
        }
        return null;
      
      case 5: // int[][] dp = new int[m+1][n+1]
        if (v.m !== undefined && v.n !== undefined) {
          return (
            <span className="inline-values">
              <span className="inline-var dim">dp[<span className="inline-val">{v.m + 1}</span>][<span className="inline-val">{v.n + 1}</span>]</span>
            </span>
          );
        }
        return null;
      
      case 7: // for (int i = 1; i <= m; i++)
        if (v.i !== undefined && v.m !== undefined) {
          return (
            <span className="inline-values">
              <span className="inline-var loop-var">i=<span className="inline-val">{v.i}</span></span>
              <span className="inline-condition">{v.i <= v.m ? '✓' : '✗'} {v.i}≤{v.m}</span>
            </span>
          );
        }
        return null;
      
      case 8: // for (int j = 1; j <= n; j++)
        if (v.j !== undefined && v.n !== undefined) {
          return (
            <span className="inline-values">
              <span className="inline-var loop-var">j=<span className="inline-val">{v.j}</span></span>
              <span className="inline-condition">{v.j <= v.n ? '✓' : '✗'} {v.j}≤{v.n}</span>
            </span>
          );
        }
        return null;
      
      case 9: // if (text1.charAt(i-1) == text2.charAt(j-1))
        if (v.char1 && v.char2 && v.i !== undefined && v.j !== undefined) {
          const isMatch = v.char1 === v.char2;
          return (
            <span className="inline-values compare-values">
              <span className="inline-var char-var">
                text1[{v.i - 1}]=<span className="inline-val char">'{v.char1}'</span>
              </span>
              <span className="inline-var char-var">
                text2[{v.j - 1}]=<span className="inline-val char">'{v.char2}'</span>
              </span>
              <span className={`inline-result ${isMatch ? 'match' : 'mismatch'}`}>
                {isMatch ? '✓ 相等' : '✗ 不等'}
              </span>
            </span>
          );
        }
        return null;
      
      case 10: // dp[i][j] = dp[i-1][j-1] + 1
        if (v.i !== undefined && v.j !== undefined && v.dpValue !== undefined && v.diagValue !== undefined) {
          return (
            <span className="inline-values assign-values">
              <span className="inline-var source-var">
                dp[{v.i-1}][{v.j-1}]=<span className="inline-val">{v.diagValue}</span>
              </span>
              <span className="inline-op">+1</span>
              <span className="inline-assign">
                → dp[{v.i}][{v.j}]=<span className="inline-val result">{v.dpValue}</span>
              </span>
            </span>
          );
        }
        return null;
      
      case 12: // dp[i][j] = Math.max(dp[i-1][j], dp[i][j-1])
        if (v.i !== undefined && v.j !== undefined && v.dpValue !== undefined) {
          const topVal = v.topValue ?? 0;
          const leftVal = v.leftValue ?? 0;
          const isTopWinner = topVal >= leftVal;
          return (
            <span className="inline-values max-values">
              <span className="inline-max-label">max(</span>
              <span className={`inline-var ${isTopWinner ? 'winner' : 'loser'}`}>
                <span className="cell-label">上</span>dp[{v.i-1}][{v.j}]=<span className="inline-val">{topVal}</span>
              </span>
              <span className="inline-comma">,</span>
              <span className={`inline-var ${!isTopWinner ? 'winner' : 'loser'}`}>
                <span className="cell-label">左</span>dp[{v.i}][{v.j-1}]=<span className="inline-val">{leftVal}</span>
              </span>
              <span className="inline-max-label">)</span>
              <span className="inline-assign">
                → dp[{v.i}][{v.j}]=<span className="inline-val result">{v.dpValue}</span>
              </span>
            </span>
          );
        }
        return null;
      
      case 16: // return dp[m][n]
        if (v.m !== undefined && v.n !== undefined && v.dpValue !== undefined) {
          return (
            <span className="inline-values return-values">
              <span className="inline-var">
                dp[{v.m}][{v.n}]=<span className="inline-val result final">{v.dpValue}</span>
              </span>
              <span className="inline-result-label">← LCS长度</span>
            </span>
          );
        }
        return null;
      
      default:
        return null;
    }
  };

  // 获取执行指针（断点标记）
  const getBreakpoint = (lineNum: number): JSX.Element | null => {
    if (lineNum === highlightLine && phase !== 'input') {
      return <span className="breakpoint">●</span>;
    }
    return null;
  };

  return (
    <div className="code-panel">
      <div className="code-header">
        <span className="code-icon">☕</span>
        <span className="code-title">Java 代码</span>
      </div>
      
      <div className="code-body">
        <pre className="code-pre">
          {javaCode.map(({ line, code }) => {
            const isHighlighted = line === highlightLine;
            const inlineValues = getInlineValues(line);
            const breakpoint = getBreakpoint(line);
            const lineClass = isHighlighted 
              ? `line hl hl-${highlightType}` 
              : 'line';
            
            return (
              <div key={line} className={lineClass}>
                <span className="bp-area">{breakpoint}</span>
                <span className="ln">{line}</span>
                <span className="lc">{highlightSyntax(code)}</span>
                {inlineValues}
              </div>
            );
          })}
        </pre>
      </div>
      
      {/* 底部状态栏 */}
      <div className="code-footer">
        {phase === 'input' && <span className="status">📝 等待输入...</span>}
        {phase === 'animating' && currentStep && (
          <span className="status">
            🔍 执行第 {currentStep.highlightLine} 行 - {getPhaseDescription(currentStep.codePhase)}
          </span>
        )}
        {isComplete && <span className="status">🎉 算法执行完成</span>}
      </div>
    </div>
  );
}

// 获取阶段描述
function getPhaseDescription(phase: CodeExecutionPhase): string {
  switch (phase) {
    case 'init-m': return '初始化 m';
    case 'init-n': return '初始化 n';
    case 'init-dp': return '创建 DP 数组';
    case 'loop-i': return '外层循环';
    case 'loop-j': return '内层循环';
    case 'compare': return '比较字符';
    case 'match-assign': return '字符匹配赋值';
    case 'mismatch-assign': return '字符不匹配赋值';
    case 'return': return '返回结果';
    default: return '';
  }
}
