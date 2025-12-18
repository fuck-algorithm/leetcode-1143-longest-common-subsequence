import { useState, useCallback, useMemo } from 'react';
import type { AnimationStep, AppPhase, BacktraceResult, CellPosition } from '../types';
import { generateSteps, generateBacktrace, initializeDPTable, computeFullDPTable } from '../core/lcs';
import { useAnimationController } from './useAnimationController';

interface UseLCSVisualizationReturn {
  // 状态
  text1: string;
  text2: string;
  phase: AppPhase;
  dpTable: number[][];
  currentStep: AnimationStep | null;
  currentStepIndex: number;
  totalSteps: number;
  backtraceResult: BacktraceResult | null;
  backtrackPath: CellPosition[];
  backtrackMatchCells: CellPosition[];
  
  // 动画控制
  isPlaying: boolean;
  speed: number;
  canStepForward: boolean;
  canStepBackward: boolean;
  canShowBacktrace: boolean;
  
  // 操作
  start: (t1: string, t2: string) => void;
  playPause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  goToStep: (index: number) => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  showBacktrace: () => void;
}

export function useLCSVisualization(): UseLCSVisualizationReturn {
  const [text1, setText1] = useState('');
  const [text2, setText2] = useState('');
  const [phase, setPhase] = useState<AppPhase>('input');
  const [steps, setSteps] = useState<AnimationStep[]>([]);
  const [dpTable, setDpTable] = useState<number[][]>([]);
  const [currentStep, setCurrentStep] = useState<AnimationStep | null>(null);
  const [backtraceResult, setBacktraceResult] = useState<BacktraceResult | null>(null);

  // 用于标记是否正在重置，避免 handleStepChange 覆盖 reset 的状态
  const [isResetting, setIsResetting] = useState(false);

  const handleStepChange = useCallback((step: AnimationStep | null, index: number) => {
    // 如果正在重置，不处理步骤变化
    if (isResetting) {
      return;
    }
    
    setCurrentStep(step);
    if (step) {
      setDpTable(step.dpTableSnapshot);
      // 如果从完成状态回退，恢复到动画状态
      setPhase('animating');
      setBacktraceResult(null);
    } else if (index === -1) {
      // 回到初始状态，重新初始化DP表
      if (text1 && text2) {
        const initialDp = initializeDPTable(text1.length, text2.length);
        setDpTable(initialDp);
        setPhase('animating');
        setBacktraceResult(null);
      }
    }
    // 检查是否完成
    if (index === steps.length - 1 && steps.length > 0) {
      setPhase('complete');
    }
  }, [steps.length, text1, text2, isResetting]);

  const controller = useAnimationController(steps, handleStepChange);

  const start = useCallback((t1: string, t2: string) => {
    setText1(t1);
    setText2(t2);
    
    // 生成步骤
    const newSteps = generateSteps(t1, t2);
    setSteps(newSteps);
    
    // 初始化空DP表
    const initialDp = initializeDPTable(t1.length, t2.length);
    setDpTable(initialDp);
    
    setPhase('animating');
    setCurrentStep(null);
    setBacktraceResult(null);
    controller.reset();
  }, [controller]);

  const playPause = useCallback(() => {
    if (controller.isPlaying) {
      controller.pause();
    } else {
      controller.play();
    }
  }, [controller]);

  const reset = useCallback(() => {
    // 标记正在重置，防止 handleStepChange 覆盖状态
    setIsResetting(true);
    setText1('');
    setText2('');
    setPhase('input');
    setSteps([]);
    setDpTable([]);
    setCurrentStep(null);
    setBacktraceResult(null);
    controller.reset();
    // 重置完成后清除标记
    // 使用 setTimeout 确保在下一个事件循环中清除，避免竞态条件
    setTimeout(() => setIsResetting(false), 0);
  }, [controller]);

  const showBacktrace = useCallback(() => {
    if (phase === 'complete' && text1 && text2) {
      const fullDp = computeFullDPTable(text1, text2);
      const result = generateBacktrace(text1, text2, fullDp);
      setBacktraceResult(result);
      setPhase('backtracing');
    }
  }, [phase, text1, text2]);

  const canShowBacktrace = phase === 'complete';

  const backtrackPath = useMemo(() => 
    backtraceResult?.path ?? [], 
    [backtraceResult]
  );

  const backtrackMatchCells = useMemo(() => 
    backtraceResult?.matchCells ?? [], 
    [backtraceResult]
  );

  return {
    text1,
    text2,
    phase,
    dpTable,
    currentStep,
    currentStepIndex: controller.currentStepIndex,
    totalSteps: steps.length,
    backtraceResult,
    backtrackPath,
    backtrackMatchCells,
    isPlaying: controller.isPlaying,
    speed: controller.speed,
    canStepForward: controller.canStepForward,
    canStepBackward: controller.canStepBackward,
    canShowBacktrace,
    start,
    playPause,
    stepForward: controller.stepForward,
    stepBackward: controller.stepBackward,
    goToStep: controller.goToStep,
    reset,
    setSpeed: controller.setSpeed,
    showBacktrace,
  };
}
