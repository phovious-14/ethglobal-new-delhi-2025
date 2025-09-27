import React, { useEffect, useState, useMemo, memo } from 'react';
import { formatEther } from 'viem';
import { getDefaultTokenPair } from '@/src/utils/tokenRegistry';
import { motion } from 'framer-motion';
import { useChain } from '@/src/app/context/ChainContext';

// Constants
export const ANIMATION_MINIMUM_STEP_TIME = 40;

// Utility functions
export const absoluteValue = (n: bigint) => {
  return n >= BigInt(0) ? n : -n;
};

export function toFixedUsingString(numStr: string, decimalPlaces: number): string {
  const [wholePart, decimalPart] = numStr.split('.');

  if (!decimalPart || decimalPart.length <= decimalPlaces) {
    return numStr.padEnd(wholePart.length + 1 + decimalPlaces, '0');
  }

  const decimalPartBigInt = BigInt(`${decimalPart.slice(0, decimalPlaces)}${decimalPart[decimalPlaces] >= '5' ? '1' : '0'}`);

  return `${wholePart}.${decimalPartBigInt.toString().padStart(decimalPlaces, '0')}`;
}

// Hooks
export const useSignificantFlowingDecimal = (
  flowRate: bigint,
  animationStepTimeInMs: number,
): number | undefined => useMemo(() => {
  if (flowRate === BigInt(0)) {
    return undefined;
  }

  const ticksPerSecond = 1000 / animationStepTimeInMs;
  const flowRatePerTick = flowRate / BigInt(ticksPerSecond);

  const [beforeEtherDecimal, afterEtherDecimal] = formatEther(flowRatePerTick).split('.');

  const isFlowingInWholeNumbers = absoluteValue(BigInt(beforeEtherDecimal)) > BigInt(0);

  if (isFlowingInWholeNumbers) {
    return 0; // Flowing in whole numbers per tick.
  }
  const numberAfterDecimalWithoutLeadingZeroes = BigInt(afterEtherDecimal);

  const lengthToFirstSignificantDecimal = afterEtherDecimal
    .toString()
    .replace(numberAfterDecimalWithoutLeadingZeroes.toString(), '').length; // We're basically counting the zeroes.

  return Math.min(lengthToFirstSignificantDecimal + 2, 18); // Don't go over 18.
}, [flowRate, animationStepTimeInMs]);

const useFlowingBalance = (
  startingBalance: bigint,
  startingBalanceDate: Date,
  flowRate: bigint
) => {
  const [flowingBalance, setFlowingBalance] = useState(startingBalance);

  const startingBalanceTime = startingBalanceDate.getTime();
  useEffect(() => {
    if (flowRate === BigInt(0)) return;

    let lastAnimationTimestamp = 0;

    const animationStep = (currentAnimationTimestamp: number) => {
      const animationFrameId = window.requestAnimationFrame(animationStep);
      if (
        currentAnimationTimestamp - lastAnimationTimestamp >
        ANIMATION_MINIMUM_STEP_TIME
      ) {
        const elapsedTimeInMilliseconds = BigInt(
          Date.now() - startingBalanceTime
        );
        const flowingBalance_ =
          startingBalance + (flowRate * elapsedTimeInMilliseconds) / BigInt(1000);

        setFlowingBalance(flowingBalance_);

        lastAnimationTimestamp = currentAnimationTimestamp;
      }

      return () => window.cancelAnimationFrame(animationFrameId);
    };

    let animationFrameId = window.requestAnimationFrame(animationStep);

    return () => window.cancelAnimationFrame(animationFrameId);
  }, [startingBalance, startingBalanceTime, flowRate]);

  return flowingBalance;
};

// Helper for formatting based on decimals
function formatTokenBalance(balance: bigint, decimals: number, decimalPlaces: number) {
  const divisor = 10 ** decimals;
  const num = Number(balance) / divisor;
  return num.toFixed(decimalPlaces);
}

// FlowingBalance Component
interface FlowingBalanceProps {
  startingBalance: bigint;
  startingBalanceDate: Date;
  flowRate: bigint;
  decimals?: number;
  className?: string;
}

export const FlowingBalance: React.FC<FlowingBalanceProps> = ({
  startingBalance,
  startingBalanceDate,
  flowRate,
  className
}) => {
  const { activeChain } = useChain();

  const flowingBalance = useFlowingBalance(
    startingBalance,
    startingBalanceDate,
    flowRate
  );

  const decimalPlaces = useSignificantFlowingDecimal(
    flowRate,
    ANIMATION_MINIMUM_STEP_TIME
  );

  // Get decimals from config if not provided
  const tokenConfig = getDefaultTokenPair(activeChain.chainId);
  const usedDecimals = tokenConfig.superToken.decimals;

  return (
    <motion.span
      className="font-extrabold inline-block text-2xl sm:text-3xl md:text-4xl lg:text-5xl bg-clip-text text-transparent"
      style={{
        backgroundImage: 'linear-gradient(90deg, #38bdf8 0%, #6366f1 40%, #a21caf 80%, #38bdf8 100%)',
        backgroundSize: '200% 200%',
        textShadow: '0 2px 12px rgba(99,102,241,0.18), 0 1px 8px #a21caf44',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        filter: 'drop-shadow(0 0 8px #6366f144)'
      }}
      animate={{
        backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
        scale: [1, 1.01, 0.99, 1.01, 1],
        y: [0, -1, 0.5, 1, 0],
        rotate: [0, 0.2, -0.2, 0, 0],
        filter: [
          'drop-shadow(0 0 8px #6366f144)',
          'drop-shadow(0 0 12px #a21caf33)',
          'drop-shadow(0 0 8px #6366f144)'
        ]
      }}
      transition={{
        duration: 6,
        repeat: Infinity,
        ease: "easeInOut"
      }}
    >
      {(() => {
        const value = decimalPlaces !== undefined
          ? formatTokenBalance(flowingBalance, usedDecimals, decimalPlaces)
          : formatTokenBalance(flowingBalance, usedDecimals, 6);
        // Animate last digit for subtle effect
        const main = value.slice(0, -1);
        const last = value.slice(-1);
        const renderChar = (char: string, i: number) => (
          <span
            key={i}
            style={{
              WebkitTextStroke: '1px #222',
              textShadow: '0 1px 0 #222, 0 0px 8px #6366f1',
              display: 'inline-block',
            }}
          >{char}</span>
        );
        return <>
          {main.split('').map(renderChar)}
          <motion.span
            animate={{
              scale: [1, 1.04, 0.98, 1.02, 1],
              color: ["#6366f1", "#a21caf", "#38bdf8", "#6366f1"],
            }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            style={{
              display: 'inline-block',
              WebkitTextStroke: '1px #222',
              textShadow: '0 1px 0 #222, 0 0px 8px #6366f1',
            }}
          >{last}</motion.span>
        </>;
      })()}
      <br />
      <span className="mt-1 sm:mt-2 block text-sm sm:text-base md:text-lg font-semibold text-blue-700/80 tracking-wide" style={{ textShadow: 'none', WebkitTextFillColor: 'initial' }}>
        {tokenConfig.superToken.symbol} streaming
      </span>
    </motion.span>
  );
};

export default memo(FlowingBalance);
