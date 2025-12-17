import { useState, useEffect, useCallback, useRef } from 'react';
import type { AnimationStep } from '../types';

interface UseAnimationControllerReturn {
  currentStepIndex: number;
  isPlaying: boolean;
  speed: number;
  play: () => void;
  pause: () => void;
  stepForward: () => void;
  stepBackward: () => void;
  goToStep: (index: number) => void;
  reset: () => void;
  setSpeed: (speed: number) => void;
  canStepForward: boolean;
  canStepBackward: boolean;
}

export function useAnimationController(
  steps: AnimationStep[],
  onStepChange?: (step: AnimationStep | null, index: number) => void
): UseAnimationControllerReturn {
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeedState] = useState(1);
  const intervalRef = useRef<number | null>(null);

  const canStepForward = currentStepIndex < steps.length - 1;
  const canStepBackward = currentStepIndex > -1;

  const clearTimer = useCallback(() => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const goToStep = useCallback((index: number) => {
    const clampedIndex = Math.max(-1, Math.min(steps.length - 1, index));
    setCurrentStepIndex(clampedIndex);
    onStepChange?.(clampedIndex >= 0 ? steps[clampedIndex] : null, clampedIndex);
  }, [steps, onStepChange]);

  const stepForward = useCallback(() => {
    if (currentStepIndex < steps.length - 1) {
      goToStep(currentStepIndex + 1);
    } else {
      setIsPlaying(false);
      clearTimer();
    }
  }, [currentStepIndex, steps.length, goToStep, clearTimer]);

  const stepBackward = useCallback(() => {
    if (currentStepIndex > -1) {
      goToStep(currentStepIndex - 1);
    }
  }, [currentStepIndex, goToStep]);

  const play = useCallback(() => {
    if (canStepForward) {
      setIsPlaying(true);
    }
  }, [canStepForward]);

  const pause = useCallback(() => {
    setIsPlaying(false);
    clearTimer();
  }, [clearTimer]);

  const reset = useCallback(() => {
    setIsPlaying(false);
    clearTimer();
    setCurrentStepIndex(-1);
    onStepChange?.(null, -1);
  }, [clearTimer, onStepChange]);

  const setSpeed = useCallback((newSpeed: number) => {
    const clampedSpeed = Math.max(0.5, Math.min(3, newSpeed));
    setSpeedState(clampedSpeed);
  }, []);

  // 自动播放逻辑
  useEffect(() => {
    if (isPlaying && canStepForward) {
      const interval = 1000 / speed;
      intervalRef.current = window.setInterval(() => {
        stepForward();
      }, interval);
    } else {
      clearTimer();
      if (!canStepForward) {
        setIsPlaying(false);
      }
    }

    return clearTimer;
  }, [isPlaying, canStepForward, speed, stepForward, clearTimer]);

  return {
    currentStepIndex,
    isPlaying,
    speed,
    play,
    pause,
    stepForward,
    stepBackward,
    goToStep,
    reset,
    setSpeed,
    canStepForward,
    canStepBackward,
  };
}
