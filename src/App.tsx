import { useState, useEffect, useCallback } from 'react';
import { useLCSVisualization } from './hooks/useLCSVisualization';
import { validateInput, filterToLowercase } from './core/validation';
import { DPTable } from './components/DPTable';
import { CodePanel } from './components/CodePanel';
import './App.css';

// 内置样例数据
const EXAMPLES = [
  { name: '基础', text1: 'abcde', text2: 'ace' },
  { name: '无公共', text1: 'abc', text2: 'xyz' },
  { name: '相同', text1: 'hello', text2: 'hello' },
  { name: '包含', text1: 'abcdef', text2: 'bdf' },
  { name: '交错', text1: 'azbzcz', text2: 'abc' },
];

// 生成随机小写字母字符串
function generateRandomString(minLen: number = 3, maxLen: number = 8): string {
  const length = Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen;
  let result = '';
  for (let i = 0; i < length; i++) {
    result += String.fromCharCode(97 + Math.floor(Math.random() * 26)); // a-z
  }
  return result;
}

function App() {
  const [inputText1, setInputText1] = useState('abcde');
  const [inputText2, setInputText2] = useState('ace');

  const {
    text1,
    text2,
    phase,
    dpTable,
    currentStep,
    currentStepIndex,
    totalSteps,
    backtraceResult,
    backtrackPath,
    backtrackMatchCells,
    isPlaying,
    speed,
    canStepForward,
    canStepBackward,
    canShowBacktrace,
    start,
    playPause,
    stepForward,
    stepBackward,
    goToStep,
    reset,
    setSpeed,
    showBacktrace,
  } = useLCSVisualization();

  const isAnimating = phase !== 'input';
  const isComplete = phase === 'complete' || phase === 'backtracing';
  const lcsLength = dpTable.length > 0 ? dpTable[text1.length]?.[text2.length] ?? 0 : 0;

  const handleStart = () => {
    if (validateInput(inputText1) && validateInput(inputText2)) {
      start(inputText1, inputText2);
    }
  };

  const displayStepNum = currentStepIndex + 1;

  // 键盘快捷键处理
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // 如果焦点在输入框中，不处理快捷键
    if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
      return;
    }

    // 只在动画状态下处理快捷键
    if (!isAnimating) {
      return;
    }

    switch (e.key) {
      case 'ArrowLeft':
        // 左方向键：上一步
        e.preventDefault();
        if (canStepBackward && !isPlaying) {
          stepBackward();
        }
        break;
      case 'ArrowRight':
        // 右方向键：下一步
        e.preventDefault();
        if (canStepForward && !isPlaying) {
          stepForward();
        }
        break;
      case ' ':
        // 空格键：播放/暂停
        e.preventDefault();
        if (canStepForward || isPlaying) {
          playPause();
        }
        break;
    }
  }, [isAnimating, canStepBackward, canStepForward, isPlaying, stepBackward, stepForward, playPause]);

  // 注册键盘事件监听
  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);

  // 内联样式确保三栏布局
  const appStyle: React.CSSProperties = {
    width: '100vw',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    background: '#f5f5f5',
  };

  const headerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 20px',
    background: 'linear-gradient(135deg, #2196F3 0%, #1565C0 100%)',
    color: 'white',
    height: '50px',
    flexShrink: 0,
  };

  const mainStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'row',
    overflow: 'hidden',
  };

  const codeSectionStyle: React.CSSProperties = {
    width: '630px',
    minWidth: '630px',
    height: '100%',
    background: '#1e1e1e',
    flexShrink: 0,
    overflow: 'hidden',
  };

  const tableSectionStyle: React.CSSProperties = {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    background: 'white',
    borderLeft: '1px solid #ddd',
    borderRight: '1px solid #ddd',
    minWidth: 0,
  };

  const infoSectionStyle: React.CSSProperties = {
    width: '280px',
    minWidth: '280px',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    padding: '12px',
    background: '#fafafa',
    overflowY: 'auto',
    flexShrink: 0,
  };

  return (
    <div style={appStyle}>
      {/* 顶部标题栏 */}
      <header style={headerStyle}>
        <a 
          href="https://leetcode.cn/problems/longest-common-subsequence/" 
          target="_blank" 
          rel="noopener noreferrer"
          style={{ fontSize: '18px', fontWeight: 600, color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          🧬 1143. 最长公共子序列
          <span style={{ fontSize: '12px', opacity: 0.8 }}>↗</span>
        </a>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* 样例按钮直接展示 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12px', opacity: 0.8 }}>样例:</span>
            {EXAMPLES.map((ex, i) => {
              const isSelected = inputText1 === ex.text1 && inputText2 === ex.text2;
              return (
                <button
                  key={i}
                  onClick={() => {
                    setInputText1(ex.text1);
                    setInputText2(ex.text2);
                  }}
                  disabled={isAnimating}
                  title={`${ex.text1} / ${ex.text2}`}
                  style={{
                    padding: '4px 10px',
                    fontSize: '12px',
                    border: 'none',
                    borderRadius: '12px',
                    cursor: isAnimating ? 'not-allowed' : 'pointer',
                    background: isSelected ? 'rgba(255,255,255,0.9)' : 'rgba(255,255,255,0.15)',
                    color: isSelected ? '#1565C0' : 'white',
                    fontWeight: isSelected ? 600 : 400,
                    opacity: isAnimating ? 0.5 : 1,
                    transition: 'all 0.2s',
                  }}
                >
                  {ex.name}
                </button>
              );
            })}
            <button
              onClick={() => {
                setInputText1(generateRandomString());
                setInputText2(generateRandomString());
              }}
              disabled={isAnimating}
              title="随机生成两个字符串"
              style={{
                padding: '4px 10px',
                fontSize: '12px',
                border: 'none',
                borderRadius: '12px',
                cursor: isAnimating ? 'not-allowed' : 'pointer',
                background: '#ff9800',
                color: 'white',
                fontWeight: 500,
                opacity: isAnimating ? 0.5 : 1,
                transition: 'all 0.2s',
              }}
            >
              🎲 随机
            </button>
          </div>
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.3)' }} />
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '13px' }}>S1:</label>
            <input
              type="text"
              value={inputText1}
              onChange={(e) => setInputText1(filterToLowercase(e.target.value).slice(0, 10))}
              disabled={isAnimating}
              style={{ width: '80px', padding: '5px 8px', fontSize: '13px', fontFamily: 'Consolas, monospace', border: 'none', borderRadius: '4px' }}
            />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <label style={{ fontSize: '13px' }}>S2:</label>
            <input
              type="text"
              value={inputText2}
              onChange={(e) => setInputText2(filterToLowercase(e.target.value).slice(0, 10))}
              disabled={isAnimating}
              style={{ width: '80px', padding: '5px 8px', fontSize: '13px', fontFamily: 'Consolas, monospace', border: 'none', borderRadius: '4px' }}
            />
          </div>
          <button
            onClick={isAnimating ? reset : handleStart}
            disabled={!isAnimating && (!validateInput(inputText1) || !validateInput(inputText2))}
            style={{ padding: '6px 16px', fontSize: '13px', fontWeight: 600, border: 'none', borderRadius: '4px', cursor: 'pointer', background: isAnimating ? 'rgba(255,255,255,0.2)' : '#27ae60', color: 'white' }}
          >
            {isAnimating ? '🔄 重置' : '▶ 开始'}
          </button>
          <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.3)' }} />
          <a
            href="https://github.com/fuck-algorithm/leetcode-1143-longest-common-subsequence"
            target="_blank"
            rel="noopener noreferrer"
            title="View on GitHub"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.3)'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.15)'}
          >
            <svg height="20" width="20" viewBox="0 0 16 16" fill="currentColor">
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
            </svg>
          </a>
        </div>
      </header>

      {/* 主内容区：三栏布局 */}
      <main style={mainStyle}>
        {/* 左侧：代码面板 */}
        <section style={codeSectionStyle}>
          <CodePanel 
            currentStep={currentStep} 
            isComplete={isComplete}
            phase={phase}
            text1={text1}
            text2={text2}
          />
        </section>

        {/* 中间：DP表格 */}
        <section style={tableSectionStyle}>
          <div className="section-header">
            <span className="section-title">📊 DP表格</span>
            {isAnimating && totalSteps > 0 && (
              <span className="step-badge">步骤 {displayStepNum} / {totalSteps}</span>
            )}
          </div>
          <div className="table-area">
            {isAnimating ? (
              <DPTable
                text1={text1}
                text2={text2}
                dpTable={dpTable}
                currentStep={currentStep}
                backtrackPath={backtrackPath}
                backtrackMatchCells={backtrackMatchCells}
              />
            ) : (
              <div className="welcome-box">
                <div className="welcome-icon">📝</div>
                <p className="welcome-title">输入两个字符串，点击"开始演示"</p>
                <p className="welcome-sub">观看动态规划算法如何一步步填充表格</p>
              </div>
            )}
          </div>
        </section>

        {/* 右侧：控制和解释 */}
        <section style={infoSectionStyle}>
          {/* 字符串显示 */}
          {isAnimating && (
            <div className="strings-box">
              <div className="string-row">
                <span className="str-label">S1</span>
                <div className="chars">
                  {text1.split('').map((char, i) => (
                    <span 
                      key={i} 
                      className={`char ${
                        backtraceResult?.text1Indices.includes(i) ? 'lcs' : 
                        currentStep && i === currentStep.row - 1 ? 'active' : ''
                      }`}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
              <div className="string-row">
                <span className="str-label">S2</span>
                <div className="chars">
                  {text2.split('').map((char, i) => (
                    <span 
                      key={i} 
                      className={`char ${
                        backtraceResult?.text2Indices.includes(i) ? 'lcs' : 
                        currentStep && i === currentStep.col - 1 ? 'active' : ''
                      }`}
                    >
                      {char}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* 控制面板 */}
          {isAnimating && (
            <div className="controls-box">
              <div className="btn-row">
                <button className="ctrl-btn with-shortcut" onClick={stepBackward} disabled={!canStepBackward || isPlaying} title="上一步 (←)">
                  <span className="btn-icon">⏮</span>
                  <span className="shortcut-hint">←</span>
                </button>
                <button className={`ctrl-btn with-shortcut ${isPlaying ? 'pause' : 'play'}`} onClick={playPause} disabled={!canStepForward && !isPlaying} title={isPlaying ? '暂停 (空格)' : '播放 (空格)'}>
                  <span className="btn-icon">{isPlaying ? '⏸' : '▶'}</span>
                  <span className="shortcut-hint">空格</span>
                </button>
                <button className="ctrl-btn with-shortcut" onClick={stepForward} disabled={!canStepForward || isPlaying} title="下一步 (→)">
                  <span className="btn-icon">⏭</span>
                  <span className="shortcut-hint">→</span>
                </button>
                {canShowBacktrace && <button className="ctrl-btn trace" onClick={showBacktrace} title="显示回溯路径">🔍</button>}
              </div>
              <div className="progress-row">
                <input type="range" min="0" max={totalSteps} value={displayStepNum} onChange={(e) => goToStep(parseInt(e.target.value) - 1)} disabled={isPlaying} className="progress" />
                <div className="speed-box">
                  <span className="speed-val">{speed.toFixed(1)}x</span>
                  <input type="range" min="0.5" max="3" step="0.5" value={speed} onChange={(e) => setSpeed(parseFloat(e.target.value))} className="speed" />
                </div>
              </div>
            </div>
          )}

          {/* 解释面板 */}
          <div className="explain-box">
            <div className="explain-header">💡 步骤解释</div>
            
            {!isAnimating && (
              <div className="intro">
                <p className="intro-title">LCS = 最长公共子序列</p>
                <p className="intro-example">"abcde" 和 "ace" → LCS 是 "ace"，长度为 3</p>
                <div className="rules">
                  <div className="rule match">
                    <span className="rule-icon">✅</span>
                    <div><strong>字符相等</strong><p>dp[i][j] = dp[i-1][j-1] + 1</p></div>
                  </div>
                  <div className="rule mismatch">
                    <span className="rule-icon">❌</span>
                    <div><strong>字符不等</strong><p>dp[i][j] = max(dp[i-1][j], dp[i][j-1])</p></div>
                  </div>
                </div>
              </div>
            )}

            {isAnimating && !currentStep && !isComplete && (
              <div className="waiting"><p>点击 ▶ 播放 或 ⏭ 单步执行</p></div>
            )}

            {currentStep && !isComplete && (
              <div className="step-explain">
                <div className="compare-box">
                  <span className={`compare-char ${currentStep.transitionType === 'match' ? 'match' : ''}`}>{currentStep.char1}</span>
                  <span className="compare-op">{currentStep.transitionType === 'match' ? '=' : '≠'}</span>
                  <span className={`compare-char ${currentStep.transitionType === 'match' ? 'match' : ''}`}>{currentStep.char2}</span>
                </div>
                {currentStep.transitionType === 'match' ? (
                  <div className="result-box match">
                    <span className="result-icon">✅</span>
                    <div className="result-text"><strong>字符相等！</strong><p>dp[{currentStep.row}][{currentStep.col}] = 左上角 + 1 = <strong>{currentStep.value}</strong></p></div>
                  </div>
                ) : (
                  <div className="result-box mismatch">
                    <span className="result-icon">❌</span>
                    <div className="result-text"><strong>字符不等</strong><p>dp[{currentStep.row}][{currentStep.col}] = max(上, 左) = <strong>{currentStep.value}</strong></p></div>
                  </div>
                )}
                <div className="hint">👀 观察左侧代码高亮行 和 表格中的箭头</div>
              </div>
            )}

            {isComplete && (
              <div className="complete">
                <div className="complete-icon">🎉</div>
                <div className="complete-title">演示完成！</div>
                <div className="lcs-result">
                  <div className="lcs-len">LCS 长度: <strong>{lcsLength}</strong></div>
                  {backtraceResult && <div className="lcs-str">LCS: <code>{backtraceResult.lcs || '(空)'}</code></div>}
                </div>
                {!backtraceResult && <p className="trace-hint">点击 🔍 查看 LCS 路径</p>}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export default App;
