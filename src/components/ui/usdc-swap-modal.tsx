'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/src/components/ui/dialog';
import { Button } from '@/src/components/ui/button';
import { Coins, X, ArrowUpDown, Sparkles } from 'lucide-react';
import USDCSwap from './usdc-swap';

interface USDCSwapModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function USDCSwapModal({ isOpen, onClose }: USDCSwapModalProps) {
  const [isWrapMode, setIsWrapMode] = useState(true);

  const toggleMode = () => {
    setIsWrapMode(!isWrapMode);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg p-0 backdrop-blur-md bg-white/90 border border-white/60 rounded-3xl shadow-2xl shadow-blue-500/20">
        <DialogHeader className="border-b border-white/40 backdrop-blur-sm bg-white/30 p-8 rounded-t-3xl">
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-4 text-2xl font-light text-gray-900">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/40 rounded-xl flex items-center justify-center">
                <Coins className="w-6 h-6 text-blue-600" />
              </div>
              <span>
                {isWrapMode ? 'Wrap Your Tokens' : 'Unwrap Your Tokens'}
              </span>
            </DialogTitle>

            {/* Toggle Button */}
            <Button
              onClick={toggleMode}
              className="px-4 py-2 font-medium text-sm rounded-xl backdrop-blur-md bg-gradient-to-r from-purple-500 via-pink-500 to-violet-500 text-white border border-purple-300/50 hover:shadow-lg transition-all duration-300 relative overflow-hidden group"
              style={{
                backgroundSize: '200% 100%',
                animation: 'gradientShift 3s ease-in-out infinite'
              }}
            >
              <div className="flex items-center relative z-10">
                <ArrowUpDown className="w-4 h-4 mr-2" />
                {isWrapMode ? 'Switch to Unwrap' : 'Switch to Wrap'}
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-violet-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  backgroundSize: '200% 100%',
                  animation: 'gradientShift 2s ease-in-out infinite reverse'
                }}
              />
            </Button>
          </div>

          <p className="text-gray-600 font-light mt-4 leading-relaxed">
            {isWrapMode
              ? 'Convert USDC to USDCx Super Tokens to enable real-time streaming payments with second-by-second precision.'
              : 'Convert USDCx Super Tokens back to regular USDC for traditional wallet usage and transfers.'
            }
          </p>

          {/* Feature highlights */}
          <div className="flex flex-wrap gap-3 mt-4">
            <div className="flex items-center gap-2 px-3 py-1 backdrop-blur-sm bg-blue-100/50 border border-blue-200/60 rounded-full">
              <Sparkles className="w-3 h-3 text-blue-600" />
              <span className="text-xs font-medium text-blue-700">1:1 Ratio</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 backdrop-blur-sm bg-green-100/50 border border-green-200/60 rounded-full">
              <Sparkles className="w-3 h-3 text-green-600" />
              <span className="text-xs font-medium text-green-700">No Fees</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-1 backdrop-blur-sm bg-purple-100/50 border border-purple-200/60 rounded-full">
              <Sparkles className="w-3 h-3 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">Instant</span>
            </div>
          </div>
        </DialogHeader>

        <div className="p-8">
          <USDCSwap showHeader={false} isWrapMode={isWrapMode} />
        </div>
      </DialogContent>
    </Dialog>
  );
} 