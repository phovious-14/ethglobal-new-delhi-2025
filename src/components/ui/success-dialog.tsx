'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent } from '@/src/components/ui/dialog';
import { CheckCircle, Zap, Waves } from 'lucide-react';
import { motion } from 'framer-motion';

interface SuccessDialogProps {
    isOpen: boolean;
    onClose: () => void;
    type: 'instant' | 'stream';
    message: string;
    autoClose?: boolean;
    autoCloseDelay?: number;
}

export const SuccessDialog: React.FC<SuccessDialogProps> = ({
    isOpen,
    onClose,
    type,
    message,
    autoClose = true,
    autoCloseDelay = 3500
}) => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (isOpen) {
            setIsVisible(true);

            // Auto-close after delay
            if (autoClose) {
                const timer = setTimeout(() => {
                    setIsVisible(false);
                    setTimeout(() => {
                        onClose();
                    }, 300); // Wait for fade out animation
                }, autoCloseDelay);

                return () => clearTimeout(timer);
            }
        } else {
            setIsVisible(false);
        }
    }, [isOpen, autoClose, autoCloseDelay, onClose]);

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-md bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200/60 rounded-3xl shadow-2xl overflow-hidden">
                <div className="text-center p-6">
                    {/* Success Icon */}
                    <motion.div
                        initial={{ scale: 0, rotate: -180 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ duration: 0.6, ease: "backOut" }}
                        className="mx-auto mb-4 w-16 h-16 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                    >
                        <CheckCircle className="w-8 h-8 text-white" />
                    </motion.div>

                    {/* Success Title */}
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.2 }}
                        className="text-2xl font-bold text-green-800 mb-2"
                    >
                        {type === 'instant' ? 'Payment Sent!' : 'Stream Started!'}
                    </motion.h2>

                    {/* Success Message */}
                    <motion.p
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                        className="text-gray-700 mb-4 text-sm sm:text-base"
                    >
                        {message}
                    </motion.p>

                    {/* Type-specific Icon */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 0.4, delay: 0.6 }}
                        className="mx-auto mb-4 w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-lg"
                    >
                        {type === 'instant' ? (
                            <Zap className="w-5 h-5 text-white" />
                        ) : (
                            <Waves className="w-5 h-5 text-white" />
                        )}
                    </motion.div>

                    {/* Simple Sparkles */}
                    <div className="flex justify-center gap-2 mb-4">
                        {[...Array(5)].map((_, i) => (
                            <motion.div
                                key={i}
                                className="w-2 h-2 bg-yellow-400 rounded-full"
                                initial={{ scale: 0, opacity: 0 }}
                                animate={{ scale: [0, 1, 0], opacity: [0, 1, 0] }}
                                transition={{
                                    duration: 1,
                                    repeat: Infinity,
                                    delay: i * 0.2,
                                    ease: "easeInOut"
                                }}
                            />
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
}; 