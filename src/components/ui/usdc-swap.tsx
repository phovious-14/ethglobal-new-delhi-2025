'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Badge } from '@/src/components/ui/badge';
import { ArrowRight, Coins, Zap, CheckCircle, AlertCircle, ArrowDown, ArrowUp, Sparkles } from 'lucide-react';

interface USDCSwapProps {
  className?: string;
  showHeader?: boolean;
  isWrapMode?: boolean;
}

export default function USDCSwap({ className = '', showHeader = true, isWrapMode = true }: USDCSwapProps) {
  const [amount, setAmount] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [txStatus, setTxStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleSwap = async () => {
    if (!amount || parseFloat(amount) <= 0) return;

    setIsLoading(true);
    setTxStatus('idle');

    try {
      // Simulate swap transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      setTxStatus('success');
      setAmount('');
    } catch (error) {
      setTxStatus('error');
    } finally {
      setIsLoading(false);
    }
  };

  const resetStatus = () => {
    setTxStatus('idle');
  };

  const fromToken = isWrapMode ? 'USDC' : 'USDCx';
  const toToken = isWrapMode ? 'USDCx' : 'USDC';
  const fromBadge = isWrapMode ? 'Standard Token' : 'Super Token';
  const toBadge = isWrapMode ? 'Super Token' : 'Standard Token';
  const successMessage = isWrapMode
    ? 'Wrap successful! USDCx is ready for streaming payments.'
    : 'Unwrap successful! USDC has been returned to your wallet.';
  const actionText = isWrapMode ? 'Wrap' : 'Unwrap';

  return (
    <div className={`${showHeader ? 'backdrop-blur-md bg-white/40 border border-white/60 rounded-3xl shadow-xl' : ''} flex flex-col ${className}`}>
      {showHeader && (
        <div className="border-b border-white/40 backdrop-blur-sm bg-white/30 p-6 rounded-t-3xl">
          <div className="flex items-center gap-4 text-xl font-light text-gray-900">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/40 rounded-xl flex items-center justify-center">
              <Coins className="w-5 h-5 text-blue-600" />
            </div>
            <span>{fromToken} → {toToken}</span>
            <Badge className={`${isWrapMode ? 'bg-blue-100/80 text-blue-700 border-blue-200/60' : 'bg-green-100/80 text-green-700 border-green-200/60'} backdrop-blur-sm border rounded-full font-medium px-3 py-1`}>
              {isWrapMode ? 'Streamable' : 'Redeemable'}
            </Badge>
          </div>
        </div>
      )}

      <div className={`${showHeader ? 'p-6' : ''} flex-grow flex flex-col space-y-6`}>
        {/* From Token Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 ${isWrapMode ? 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20' : 'bg-gradient-to-br from-green-500/20 to-emerald-500/20'} backdrop-blur-sm border border-white/40 rounded-xl flex items-center justify-center`}>
                {isWrapMode ? (
                  <span className="text-sm font-bold text-blue-600">$</span>
                ) : (
                  <Zap className="w-4 h-4 text-green-600" />
                )}
              </div>
              <span className="font-medium text-gray-800">From: {fromToken}</span>
            </div>
            <Badge className="backdrop-blur-sm bg-gray-100/80 text-gray-700 border border-gray-200/60 rounded-full font-medium px-3 py-1">
              {fromBadge}
            </Badge>
          </div>

          <Input
            type="number"
            placeholder="0.00"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="text-2xl font-light backdrop-blur-sm bg-white/50 border border-white/60 rounded-2xl text-gray-900 placeholder:text-gray-400 h-16 focus:bg-white/70 focus:border-blue-300/60 transition-all duration-300"
            disabled={isLoading}
          />
        </div>

        {/* Arrow Indicator */}
        <div className="flex justify-center py-2">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-white/40 rounded-full flex items-center justify-center">
            {isWrapMode ? (
              <ArrowDown className="w-5 h-5 text-blue-600" />
            ) : (
              <ArrowUp className="w-5 h-5 text-purple-600" />
            )}
          </div>
        </div>

        {/* To Token Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 ${isWrapMode ? 'bg-gradient-to-br from-green-500/20 to-emerald-500/20' : 'bg-gradient-to-br from-blue-500/20 to-cyan-500/20'} backdrop-blur-sm border border-white/40 rounded-xl flex items-center justify-center`}>
                {isWrapMode ? (
                  <Zap className="w-4 h-4 text-green-600" />
                ) : (
                  <span className="text-sm font-bold text-blue-600">$</span>
                )}
              </div>
              <span className="font-medium text-gray-800">To: {toToken}</span>
            </div>
            <Badge className="backdrop-blur-sm bg-gray-100/80 text-gray-700 border border-gray-200/60 rounded-full font-medium px-3 py-1">
              {toBadge}
            </Badge>
          </div>

          <div className="text-2xl font-light backdrop-blur-sm bg-gray-50/80 border border-gray-200/60 rounded-2xl text-gray-800 h-16 flex items-center px-4">
            {amount || '0.00'}
          </div>
        </div>

        {/* Status Messages */}
        {txStatus === 'success' && (
          <div className="flex items-center gap-3 p-4 backdrop-blur-md bg-green-100/80 border border-green-200/60 rounded-2xl">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span className="font-medium text-green-800">{successMessage}</span>
          </div>
        )}

        {txStatus === 'error' && (
          <div className="flex items-center gap-3 p-4 backdrop-blur-md bg-red-100/80 border border-red-200/60 rounded-2xl">
            <AlertCircle className="w-5 h-5 text-red-600" />
            <span className="font-medium text-red-800">{actionText} failed! Please try again.</span>
          </div>
        )}

        {/* Action Button */}
        <Button
          onClick={txStatus === 'idle' ? handleSwap : resetStatus}
          disabled={isLoading || !amount || parseFloat(amount) <= 0}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium text-lg py-6 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <div className="flex items-center gap-3">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
              {actionText}ping tokens...
            </div>
          ) : txStatus === 'success' ? (
            `${actionText} Another Amount`
          ) : txStatus === 'error' ? (
            'Try Again'
          ) : (
            `${actionText} ${amount || '0'} ${fromToken}`
          )}
        </Button>
      </div>
    </div>
  );
} 