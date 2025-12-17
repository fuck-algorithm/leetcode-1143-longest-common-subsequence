import { useState } from 'react';
import { validateInput, filterToLowercase } from '../core/validation';
import './InputPanel.css';

// 内置样例数据
const EXAMPLES = [
  { name: '基础', text1: 'abcde', text2: 'ace', desc: '简单的LCS演示' },
  { name: '无公共', text1: 'abc', text2: 'xyz', desc: '完全不同的字符串' },
  { name: '相同', text1: 'hello', text2: 'hello', desc: '两个相同的字符串' },
  { name: '包含', text1: 'abcdef', text2: 'bdf', desc: '一个是另一个的子序列' },
  { name: '交错', text1: 'azbzcz', text2: 'abc', desc: '字符交错分布' },
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

interface InputPanelProps {
  onStart: (text1: string, text2: string) => void;
  disabled: boolean;
}

export function InputPanel({ onStart, disabled }: InputPanelProps) {
  const [text1, setText1] = useState('abcde');
  const [text2, setText2] = useState('ace');
  const [selectedExample, setSelectedExample] = useState(0);

  const handleText1Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = filterToLowercase(e.target.value).slice(0, 10);
    setText1(filtered);
    setSelectedExample(-1); // 用户自定义输入时取消样例选择
  };

  const handleText2Change = (e: React.ChangeEvent<HTMLInputElement>) => {
    const filtered = filterToLowercase(e.target.value).slice(0, 10);
    setText2(filtered);
    setSelectedExample(-1); // 用户自定义输入时取消样例选择
  };

  const handleExampleSelect = (index: number) => {
    if (disabled) return;
    const example = EXAMPLES[index];
    setText1(example.text1);
    setText2(example.text2);
    setSelectedExample(index);
  };

  const handleRandomGenerate = () => {
    if (disabled) return;
    setText1(generateRandomString());
    setText2(generateRandomString());
    setSelectedExample(-1);
  };

  const isValid = validateInput(text1) && validateInput(text2);

  const handleStart = () => {
    if (isValid && !disabled) {
      onStart(text1, text2);
    }
  };

  return (
    <div className="input-panel">
      {/* 样例选择区域 */}
      <div className="examples-section">
        <label>样例:</label>
        <div className="examples-list">
          {EXAMPLES.map((example, index) => (
            <button
              key={index}
              className={`example-btn ${selectedExample === index ? 'selected' : ''}`}
              onClick={() => handleExampleSelect(index)}
              disabled={disabled}
              title={example.desc}
            >
              {example.name}
            </button>
          ))}
          <button
            className="example-btn random-btn"
            onClick={handleRandomGenerate}
            disabled={disabled}
            title="随机生成两个字符串"
          >
            🎲 随机
          </button>
        </div>
      </div>

      {/* 输入区域 */}
      <div className="inputs-row">
        <div className="input-group">
          <label htmlFor="text1">字符串 1:</label>
          <input
            id="text1"
            type="text"
            value={text1}
            onChange={handleText1Change}
            disabled={disabled}
            placeholder="输入1-10个小写字母"
            maxLength={10}
          />
          {text1 && !validateInput(text1) && (
            <span className="error">请输入1-10个小写字母</span>
          )}
        </div>
        <div className="input-group">
          <label htmlFor="text2">字符串 2:</label>
          <input
            id="text2"
            type="text"
            value={text2}
            onChange={handleText2Change}
            disabled={disabled}
            placeholder="输入1-10个小写字母"
            maxLength={10}
          />
          {text2 && !validateInput(text2) && (
            <span className="error">请输入1-10个小写字母</span>
          )}
        </div>
        <button
          className="start-button"
          onClick={handleStart}
          disabled={!isValid || disabled}
        >
          开始演示
        </button>
      </div>
    </div>
  );
}
