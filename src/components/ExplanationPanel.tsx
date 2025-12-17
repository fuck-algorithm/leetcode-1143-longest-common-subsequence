import type { AnimationStep } from '../types';
import './ExplanationPanel.css';

interface ExplanationPanelProps {
  currentStep: AnimationStep | null;
  isComplete: boolean;
  lcsResult: string;
  lcsLength: number;
}

export function ExplanationPanel({
  currentStep,
  isComplete,
  lcsResult,
  lcsLength,
}: ExplanationPanelProps) {
  const getExplanation = () => {
    if (!currentStep) {
      return '点击"开始演示"开始观看LCS算法的动态规划过程。';
    }

    const { row, col, char1, char2, value, transitionType } = currentStep;

    if (transitionType === 'match') {
      return (
        <>
          <p className="step-info">
            正在计算 <code>dp[{row}][{col}]</code>
          </p>
          <p className="comparison">
            比较: <span className="char match">'{char1}'</span> 和{' '}
            <span className="char match">'{char2}'</span>
          </p>
          <p className="result match">
            ✓ 字符相等！
          </p>
          <p className="formula">
            <code>dp[{row}][{col}] = dp[{row-1}][{col-1}] + 1 = {value}</code>
          </p>
          <p className="explanation">
            因为两个字符相等，所以当前LCS长度等于左上角的值加1。
          </p>
        </>
      );
    } else {
      const direction = transitionType === 'fromTop' ? '上方' : '左方';
      const compInfo = currentStep.comparisonInfo;
      
      return (
        <>
          <p className="step-info">
            正在计算 <code>dp[{row}][{col}]</code>
          </p>
          <p className="comparison">
            比较: <span className="char">'{char1}'</span> 和{' '}
            <span className="char">'{char2}'</span>
          </p>
          <p className="result mismatch">
            ❌ 字符不相等
          </p>
          {compInfo && (
            <div className="max-comparison">
              <p className="comparison-title">🔍 比较两个候选值:</p>
              <div className="comparison-values">
                <span className={`value-box ${transitionType === 'fromTop' ? 'winner' : 'loser'}`}>
                  上方 dp[{row-1}][{col}] = <strong>{compInfo.topValue}</strong>
                  {transitionType === 'fromTop' && ' ✓'}
                </span>
                <span className="vs">vs</span>
                <span className={`value-box ${transitionType === 'fromLeft' ? 'winner' : 'loser'}`}>
                  左方 dp[{row}][{col-1}] = <strong>{compInfo.leftValue}</strong>
                  {transitionType === 'fromLeft' && ' ✓'}
                </span>
              </div>
            </div>
          )}
          <p className="formula">
            <code>dp[{row}][{col}] = max({compInfo?.topValue ?? '?'}, {compInfo?.leftValue ?? '?'}) = {value}</code>
          </p>
          <p className="explanation">
            因为字符不相等，比较上方和左方的值，取较大者（{direction}的 {value}）。
          </p>
        </>
      );
    }
  };

  return (
    <div className="explanation-panel">
      <h3>📖 步骤解释</h3>
      <div className="explanation-content">
        {isComplete ? (
          <div className="complete-result">
            <p className="complete-title">🎉 演示完成！</p>
            <p className="lcs-length">
              最长公共子序列长度: <strong>{lcsLength}</strong>
            </p>
            {lcsResult && (
              <p className="lcs-string">
                LCS: <code className="lcs-code">{lcsResult}</code>
              </p>
            )}
            <p className="hint">点击"显示回溯"查看如何找出LCS字符串。</p>
          </div>
        ) : (
          getExplanation()
        )}
      </div>
    </div>
  );
}
