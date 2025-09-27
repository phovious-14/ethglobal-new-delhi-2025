'use client'
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, ArrowRight, Zap, DollarSign } from 'lucide-react';
import { FaEthereum } from 'react-icons/fa';

interface InstantTransferVisualizerProps {
    sender: { address: string; name?: string };
    receiver: { address: string; name?: string };
    amount: string;
    onClose?: () => void;
    onComplete?: () => void;
}

export const InstantTransferVisualizer: React.FC<InstantTransferVisualizerProps> = ({
    sender,
    receiver,
    amount,
    onClose,
    onComplete,
}) => {
    const [transferStage, setTransferStage] = useState<'preparing' | 'sending' | 'confirming' | 'completed'>('preparing');
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Progress through transfer stages
    useEffect(() => {
        const timer1 = setTimeout(() => setTransferStage('sending'), 1000);
        const timer2 = setTimeout(() => setTransferStage('confirming'), 3000);
        const timer3 = setTimeout(() => {
            setTransferStage('completed');
            if (onComplete) onComplete();
        }, 5000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [onComplete]);

    // Create burst particles for completion
    useEffect(() => {
        if (transferStage === 'completed') {
            const newParticles = Array.from({ length: 20 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                delay: Math.random() * 0.5
            }));
            setParticles(newParticles);
        }
    }, [transferStage]);

    const getStageMessage = () => {
        switch (transferStage) {
            case 'preparing':
                return 'Preparing Transfer...';
            case 'sending':
                return 'Sending USDC...';
            case 'confirming':
                return 'Confirming Transaction...';
            case 'completed':
                return 'Transfer Complete!';
            default:
                return '';
        }
    };

    const getStageColor = () => {
        switch (transferStage) {
            case 'preparing':
                return 'text-blue-400';
            case 'sending':
                return 'text-purple-400';
            case 'confirming':
                return 'text-orange-400';
            case 'completed':
                return 'text-green-400';
            default:
                return 'text-blue-400';
        }
    };

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 overflow-hidden p-6">
            {/* Animated Background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                {/* Gradient layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-indigo-600/10 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-tl from-emerald-600/5 via-teal-600/5 to-cyan-600/5 animate-pulse" style={{ animationDelay: '1s' }}></div>

                {/* Floating elements */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-32 h-32 bg-blue-500/15 rounded-full blur-3xl"
                        animate={{
                            y: [-15, 15, -15],
                            x: [-10, 10, -10],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 6,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div
                        className="absolute top-3/4 right-1/4 w-40 h-40 bg-purple-500/15 rounded-full blur-3xl"
                        animate={{
                            y: [15, -15, 15],
                            x: [10, -10, 10],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            duration: 8,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2
                        }}
                    />
                </div>

                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-3">
                    <div className="w-full h-full" style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.05) 1px, transparent 1px),
                                        radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                        backgroundSize: '40px 40px'
                    }} />
                </div>
            </div>

            {/* Close Button */}
            <motion.button
                onClick={onClose}
                className="absolute top-3 right-3 z-50 w-12 h-12 bg-white/95 backdrop-blur-md border border-white/60 rounded-2xl flex items-center justify-center shadow-2xl hover:bg-white/90 transition-all hover:scale-110 hover:shadow-3xl"
                aria-label="Close overlay"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
            >
                <X className="w-6 h-6 text-gray-700" />
            </motion.button>

            {/* Main Content Container */}
            <div className="relative z-10 w-full max-w-4xl px-4">
                {/* Header with sender and receiver */}
                <div className="flex justify-between items-center mb-8 w-full">
                    <motion.div
                        className="flex flex-col items-center space-y-3"
                        initial={{ opacity: 0, x: -50, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        {/* Sender Avatar */}
                        <div className="relative">
                            <motion.div
                                className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-xl opacity-60"
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.6, 0.8, 0.6]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut"
                                }}
                            />
                            <motion.div
                                className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/60 text-2xl font-extrabold bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600"
                                whileHover={{ scale: 1.05 }}
                            >
                                {sender.name ? sender.name[0].toUpperCase() : '?'}
                            </motion.div>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-blue-300 mb-2 tracking-wide">SENDER</p>
                            <div className="bg-white/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/20 shadow-lg">
                                <p className="text-xs font-mono text-gray-200">
                                    {sender.address.slice(0, 6)}...{sender.address.slice(-4)}
                                </p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Transfer Arrow */}
                    <motion.div
                        className="flex-1 mx-6 flex items-center justify-center"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ duration: 1, delay: 0.5 }}
                    >
                        <motion.div
                            className="relative"
                            animate={{
                                x: transferStage === 'sending' ? [0, 20, 0] : 0
                            }}
                            transition={{
                                duration: 1,
                                repeat: transferStage === 'sending' ? Infinity : 0,
                                ease: "easeInOut"
                            }}
                        >
                            <div className="w-16 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-emerald-500 rounded-full relative">
                                <motion.div
                                    className="absolute top-0 left-0 w-4 h-1 bg-white rounded-full"
                                    animate={{
                                        x: transferStage === 'sending' ? [0, "100%"] : 0
                                    }}
                                    transition={{
                                        duration: 2,
                                        repeat: transferStage === 'sending' ? Infinity : 0,
                                        ease: "linear"
                                    }}
                                />
                            </div>
                            <motion.div
                                className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center"
                                animate={{
                                    scale: transferStage === 'sending' ? [1, 1.3, 1] : 1,
                                    opacity: transferStage === 'sending' ? [0.7, 1, 0.7] : 1
                                }}
                                transition={{
                                    duration: 1,
                                    repeat: transferStage === 'sending' ? Infinity : 0,
                                    ease: "easeInOut"
                                }}
                            >
                                <ArrowRight className="w-3 h-3 text-white" />
                            </motion.div>
                        </motion.div>
                    </motion.div>

                    <motion.div
                        className="flex flex-col items-center space-y-3"
                        initial={{ opacity: 0, x: 50, scale: 0.8 }}
                        animate={{ opacity: 1, x: 0, scale: 1 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                    >
                        {/* Receiver Avatar */}
                        <div className="relative">
                            <motion.div
                                className="absolute inset-0 w-16 h-16 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-2xl blur-xl opacity-60"
                                animate={{
                                    scale: [1, 1.1, 1],
                                    opacity: [0.6, 0.8, 0.6]
                                }}
                                transition={{
                                    duration: 2,
                                    repeat: Infinity,
                                    ease: "easeInOut",
                                    delay: 1
                                }}
                            />
                            <motion.div
                                className="relative w-16 h-16 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/60 text-2xl font-extrabold bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-600"
                                whileHover={{ scale: 1.05 }}
                                animate={{
                                    scale: transferStage === 'completed' ? [1, 1.1, 1] : 1
                                }}
                                transition={{
                                    duration: 0.5,
                                    repeat: transferStage === 'completed' ? 3 : 0,
                                    ease: "easeInOut"
                                }}
                            >
                                {receiver.name ? receiver.name[0].toUpperCase() : '?'}
                            </motion.div>
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-bold text-emerald-300 mb-2 tracking-wide">RECEIVER</p>
                            <div className="bg-white/10 backdrop-blur-sm px-3 py-2 rounded-xl border border-white/20 shadow-lg">
                                <p className="text-xs font-mono text-gray-200">
                                    {receiver.address.slice(0, 6)}...{receiver.address.slice(-4)}
                                </p>
                            </div>
                        </div>
                    </motion.div>
                </div>

                {/* Transfer Amount Display */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3 }}
                >
                    <motion.div
                        className="inline-flex items-center space-x-3 bg-white/15 backdrop-blur-sm px-6 py-3 rounded-2xl border border-white/30 shadow-2xl mb-4"
                        animate={{
                            boxShadow: [
                                "0 0 20px rgba(255, 255, 255, 0.1)",
                                "0 0 30px rgba(255, 255, 255, 0.2)",
                                "0 0 20px rgba(255, 255, 255, 0.1)"
                            ]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <motion.div
                            className="w-3 h-3 bg-emerald-400 rounded-full shadow-lg"
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                        <span className="text-sm font-bold text-white tracking-wide">INSTANT TRANSFER</span>
                    </motion.div>

                    <motion.div
                        className="text-4xl font-black bg-gradient-to-r from-emerald-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-lg"
                        animate={{
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                            scale: transferStage === 'completed' ? [1, 1.05, 1] : 1
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            backgroundSize: "200% 200%",
                            backgroundImage: "linear-gradient(90deg, #34d399, #60a5fa, #a78bfa, #34d399)"
                        }}
                    >
                        {amount} USDC
                    </motion.div>
                    <p className="text-sm text-gray-300 font-medium mt-2 tracking-wide">One-time transfer</p>
                </motion.div>

                {/* Transfer Status */}
                <motion.div
                    className="text-center mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                >
                    <motion.div
                        className="inline-flex items-center space-x-3 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 shadow-lg"
                        animate={{
                            y: [0, -2, 0]
                        }}
                        transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    >
                        <motion.div
                            className={`w-2 h-2 rounded-full ${getStageColor().replace('text-', 'bg-')} shadow-lg`}
                            animate={{
                                scale: [1, 1.5, 1],
                                opacity: [0.5, 1, 0.5]
                            }}
                            transition={{
                                duration: 2,
                                repeat: Infinity,
                                ease: "easeInOut"
                            }}
                        />
                        <span className="text-sm font-medium text-gray-300 tracking-wide">
                            {getStageMessage()}
                        </span>
                    </motion.div>
                </motion.div>

                {/* Completion Animation */}
                <AnimatePresence>
                    {transferStage === 'completed' && (
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Success burst */}
                            <motion.div
                                className="w-32 h-32 bg-gradient-to-br from-emerald-400 to-green-600 rounded-full flex items-center justify-center shadow-2xl"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 0.6, ease: "easeOut" }}
                            >
                                <CheckCircle className="w-16 h-16 text-white" />
                            </motion.div>

                            {/* Burst particles */}
                            {particles.map((particle) => (
                                <motion.div
                                    key={particle.id}
                                    className="absolute w-2 h-2 bg-yellow-400 rounded-full"
                                    style={{
                                        left: `${particle.x}%`,
                                        top: `${particle.y}%`,
                                    }}
                                    initial={{ scale: 0, opacity: 0 }}
                                    animate={{
                                        scale: [0, 1, 0],
                                        opacity: [0, 1, 0],
                                        x: [0, (Math.random() - 0.5) * 100],
                                        y: [0, (Math.random() - 0.5) * 100],
                                    }}
                                    transition={{
                                        duration: 1.5,
                                        delay: particle.delay,
                                        ease: "easeOut"
                                    }}
                                />
                            ))}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default InstantTransferVisualizer; 