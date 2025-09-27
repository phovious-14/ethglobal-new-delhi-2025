'use client';

import React from 'react';
import { Switch } from '@/src/components/ui/switch';
import { Label } from '@/src/components/ui/label';
import { Card, CardContent } from '@/src/components/ui/card';
import { Badge } from '@/src/components/ui/badge';
import { Waves, Zap, Coins } from 'lucide-react';

interface DistributionToggleProps {
    isInstantDistribution: boolean;
    onToggle: (isInstant: boolean) => void;
    className?: string;
}

const DistributionToggle = ({ isInstantDistribution, onToggle, className }: DistributionToggleProps) => {
    return (
        <Card className={`bg-white/80 backdrop-blur-md border border-white/60 rounded-xl shadow-lg ${className}`}>
            <CardContent className="p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <Waves className="w-5 h-5 text-blue-600" />
                            <Label htmlFor="distribution-mode" className="text-sm font-medium text-gray-700">
                                Distribution Mode
                            </Label>
                        </div>
                        <Badge
                            variant={isInstantDistribution ? "default" : "secondary"}
                            className="ml-2"
                        >
                            {isInstantDistribution ? "Instant" : "Stream"}
                        </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1">
                                <Waves className="w-4 h-4 text-blue-500" />
                                <span className="text-xs text-gray-600">Stream</span>
                            </div>
                            <Switch
                                id="distribution-mode"
                                checked={isInstantDistribution}
                                onCheckedChange={onToggle}
                                className="data-[state=checked]:bg-green-600"
                            />
                            <div className="flex items-center gap-1">
                                <Zap className="w-4 h-4 text-green-500" />
                                <span className="text-xs text-gray-600">Instant</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                    {isInstantDistribution ? (
                        <div className="flex items-center gap-2">
                            <Coins className="w-3 h-3" />
                            <span>Instant distribution to multiple recipients</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Waves className="w-3 h-3" />
                            <span>Continuous payment streams over time</span>
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};

export default DistributionToggle; 