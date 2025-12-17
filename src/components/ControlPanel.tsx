import './ControlPanel.css';

interface ControlPanelProps {
  isPlaying: boolean;
  speed: number;
  canStepForward: boolean;
  canShowBacktrace: boolean;
  onPlayPause: () => void;
  onStepForward: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onShowBacktrace: () => void;
}

export function ControlPanel({
  isPlaying,
  speed,
  canStepForward,
  canShowBacktrace,
  onPlayPause,
  onStepForward,
  onReset,
  onSpeedChange,
  onShowBacktrace,
}: ControlPanelProps) {
  return (
    <div className="control-panel">
      <button
        className={`control-button ${isPlaying ? 'pause' : 'play'}`}
        onClick={onPlayPause}
        disabled={!canStepForward && !isPlaying}
      >
        {isPlaying ? '⏸ 暂停' : '▶ 播放'}
      </button>
      
      <button
        className="control-button step"
        onClick={onStepForward}
        disabled={!canStepForward || isPlaying}
      >
        ⏭ 下一步
      </button>
      
      <button className="control-button reset" onClick={onReset}>
        ↺ 重置
      </button>
      
      <div className="speed-control">
        <label>速度: {speed.toFixed(1)}x</label>
        <input
          type="range"
          min="0.5"
          max="3"
          step="0.5"
          value={speed}
          onChange={(e) => onSpeedChange(parseFloat(e.target.value))}
        />
      </div>
      
      {canShowBacktrace && (
        <button className="control-button backtrace" onClick={onShowBacktrace}>
          🔍 显示回溯
        </button>
      )}
    </div>
  );
}
