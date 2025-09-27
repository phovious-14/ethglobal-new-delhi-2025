'use client'
import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, ArrowRight, Users, DollarSign, Zap } from 'lucide-react';

interface InstantPayrollVisualizerProps {
    sender: { address: string; name?: string };
    recipients: Array<{ address: string; name?: string; amount: string }>;
    totalAmount: string;
    onClose?: () => void;
    onComplete?: () => void;
}

export const InstantPayrollVisualizer: React.FC<InstantPayrollVisualizerProps> = ({
    sender,
    recipients,
    totalAmount,
    onClose,
    onComplete,
}) => {
    const [payrollStage, setPayrollStage] = useState<'preparing' | 'processing' | 'distributing' | 'completed'>('preparing');
    const [currentRecipientIndex, setCurrentRecipientIndex] = useState(0);
    const [particles, setParticles] = useState<Array<{ id: number; x: number; y: number; delay: number }>>([]);
    const containerRef = useRef<HTMLDivElement>(null);

    // Progress through payroll stages
    useEffect(() => {
        const timer1 = setTimeout(() => setPayrollStage('processing'), 1000);
        const timer2 = setTimeout(() => setPayrollStage('distributing'), 3000);
        const timer3 = setTimeout(() => {
            setPayrollStage('completed');
            if (onComplete) onComplete();
        }, 8000);

        return () => {
            clearTimeout(timer1);
            clearTimeout(timer2);
            clearTimeout(timer3);
        };
    }, [onComplete]);

    // Animate through recipients during distribution
    useEffect(() => {
        if (payrollStage === 'distributing') {
            const interval = setInterval(() => {
                setCurrentRecipientIndex(prev =>
                    prev < recipients.length - 1 ? prev + 1 : prev
                );
            }, 1000);

            return () => clearInterval(interval);
        }
    }, [payrollStage, recipients.length]);

    // Create burst particles for completion
    useEffect(() => {
        if (payrollStage === 'completed') {
            const newParticles = Array.from({ length: 30 }, (_, i) => ({
                id: i,
                x: Math.random() * 100,
                y: Math.random() * 100,
                delay: Math.random() * 0.8
            }));
            setParticles(newParticles);
        }
    }, [payrollStage]);

    const getStageMessage = () => {
        switch (payrollStage) {
            case 'preparing':
                return 'Preparing Payroll...';
            case 'processing':
                return 'Processing Payments...';
            case 'distributing':
                return `Distributing to ${recipients.length} recipients...`;
            case 'completed':
                return 'Payroll Complete!';
            default:
                return '';
        }
    };

    const getStageColor = () => {
        switch (payrollStage) {
            case 'preparing':
                return 'text-blue-400';
            case 'processing':
                return 'text-purple-400';
            case 'distributing':
                return 'text-orange-400';
            case 'completed':
                return 'text-green-400';
            default:
                return 'text-blue-400';
        }
    };

    return (
        <div className="relative w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 overflow-hidden p-6">
            {/* Animated Background */}
            <div className="absolute inset-0 -z-10 overflow-hidden">
                {/* Gradient layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 via-indigo-600/10 to-blue-600/10 animate-pulse"></div>
                <div className="absolute inset-0 bg-gradient-to-tl from-pink-600/5 via-purple-600/5 to-indigo-600/5 animate-pulse" style={{ animationDelay: '1s' }}></div>

                {/* Floating elements */}
                <div className="absolute top-0 left-0 w-full h-full">
                    <motion.div
                        className="absolute top-1/4 left-1/4 w-36 h-36 bg-purple-500/15 rounded-full blur-3xl"
                        animate={{
                            y: [-20, 20, -20],
                            x: [-15, 15, -15],
                            scale: [1, 1.1, 1]
                        }}
                        transition={{
                            duration: 7,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                    />
                    <motion.div
                        className="absolute top-3/4 right-1/4 w-44 h-44 bg-indigo-500/15 rounded-full blur-3xl"
                        animate={{
                            y: [20, -20, 20],
                            x: [15, -15, 15],
                            scale: [1, 1.2, 1]
                        }}
                        transition={{
                            duration: 9,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 2
                        }}
                    />
                    <motion.div
                        className="absolute top-1/2 left-1/2 w-28 h-28 bg-pink-500/15 rounded-full blur-3xl"
                        animate={{
                            y: [-10, 10, -10],
                            x: [-5, 5, -5],
                            scale: [1, 1.15, 1]
                        }}
                        transition={{
                            duration: 11,
                            repeat: Infinity,
                            ease: "easeInOut",
                            delay: 4
                        }}
                    />
                </div>

                {/* Grid pattern */}
                <div className="absolute inset-0 opacity-3">
                    <div className="w-full h-full" style={{
                        backgroundImage: `radial-gradient(circle at 25% 25%, rgba(255,255,255,0.05) 1px, transparent 1px),
                                        radial-gradient(circle at 75% 75%, rgba(255,255,255,0.05) 1px, transparent 1px)`,
                        backgroundSize: '45px 45px'
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
            <div className="relative z-10 w-full max-w-5xl px-4">
                {/* Header with sender */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ opacity: 0, y: -30, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                >
                    {/* Sender Avatar */}
                    <div className="relative inline-block mb-4">
                        <motion.div
                            className="absolute inset-0 w-20 h-20 bg-gradient-to-r from-purple-500 to-indigo-600 rounded-2xl blur-xl opacity-60"
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
                            className="relative w-20 h-20 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/60 text-3xl font-extrabold bg-gradient-to-br from-purple-600 via-indigo-600 to-pink-600"
                            whileHover={{ scale: 1.05 }}
                        >
                            {sender.name ? sender.name[0].toUpperCase() : '?'}
                        </motion.div>
                    </div>
                    <div className="text-center">
                        <p className="text-lg font-bold text-purple-300 mb-2 tracking-wide">PAYROLL SENDER</p>
                        <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-xl border border-white/20 shadow-lg inline-block">
                            <p className="text-sm font-mono text-gray-200">
                                {sender.address.slice(0, 6)}...{sender.address.slice(-4)}
                            </p>
                        </div>
                    </div>
                </motion.div>

                {/* Recipients Grid */}
                <motion.div
                    className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.3 }}
                >
                    {recipients.map((recipient, index) => (
                        <motion.div
                            key={index}
                            className="relative"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: payrollStage === 'distributing' && index <= currentRecipientIndex ? [-5, 0, -5] : 0
                            }}
                            transition={{
                                duration: 0.5,
                                delay: index * 0.1,
                                repeat: payrollStage === 'distributing' && index <= currentRecipientIndex ? Infinity : 0,
                                repeatType: "reverse"
                            }}
                        >
                            {/* Recipient Avatar */}
                            <div className="relative">
                                <motion.div
                                    className={`absolute inset-0 w-12 h-12 rounded-xl blur-lg opacity-60 ${payrollStage === 'distributing' && index <= currentRecipientIndex
                                            ? 'bg-green-500'
                                            : 'bg-gray-500'
                                        }`}
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
                                    className={`relative w-12 h-12 rounded-xl flex items-center justify-center shadow-lg border-2 border-white/60 text-lg font-extrabold ${payrollStage === 'distributing' && index <= currentRecipientIndex
                                            ? 'bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600'
                                            : 'bg-gradient-to-br from-gray-600 via-slate-600 to-zinc-600'
                                        }`}
                                    animate={{
                                        scale: payrollStage === 'distributing' && index === currentRecipientIndex ? [1, 1.2, 1] : 1
                                    }}
                                    transition={{
                                        duration: 0.5,
                                        repeat: payrollStage === 'distributing' && index === currentRecipientIndex ? Infinity : 0,
                                        ease: "easeInOut"
                                    }}
                                >
                                    {recipient.name ? recipient.name[0].toUpperCase() : '?'}
                                </motion.div>
                            </div>
                            <div className="text-center mt-2">
                                <p className="text-xs text-gray-300 font-medium">
                                    {recipient.amount} USDC
                                </p>
                                <p className="text-xs text-gray-400 font-mono">
                                    {recipient.address.slice(0, 4)}...{recipient.address.slice(-4)}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>

                {/* Payroll Amount Display */}
                <motion.div
                    className="text-center mb-6"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1, delay: 0.5 }}
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
                            className="w-3 h-3 bg-purple-400 rounded-full shadow-lg"
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
                        <span className="text-sm font-bold text-white tracking-wide">INSTANT PAYROLL</span>
                    </motion.div>

                    <motion.div
                        className="text-3xl font-black bg-gradient-to-r from-purple-400 via-indigo-400 to-pink-400 bg-clip-text text-transparent drop-shadow-lg"
                        animate={{
                            backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                            scale: payrollStage === 'completed' ? [1, 1.05, 1] : 1
                        }}
                        transition={{
                            duration: 4,
                            repeat: Infinity,
                            ease: "linear"
                        }}
                        style={{
                            backgroundSize: "200% 200%",
                            backgroundImage: "linear-gradient(90deg, #a78bfa, #818cf8, #ec4899, #a78bfa)"
                        }}
                    >
                        {totalAmount} USDC
                    </motion.div>
                    <p className="text-sm text-gray-300 font-medium mt-2 tracking-wide">
                        Distributed to {recipients.length} recipients
                    </p>
                </motion.div>

                {/* Payroll Status */}
                <motion.div
                    className="text-center mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, delay: 0.7 }}
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
                    {payrollStage === 'completed' && (
                        <motion.div
                            className="absolute inset-0 flex items-center justify-center pointer-events-none"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                        >
                            {/* Success burst */}
                            <motion.div
                                className="w-40 h-40 bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl"
                                initial={{ scale: 0, rotate: -180 }}
                                animate={{ scale: 1, rotate: 0 }}
                                transition={{ duration: 0.8, ease: "easeOut" }}
                            >
                                <Users className="w-20 h-20 text-white" />
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
                                        x: [0, (Math.random() - 0.5) * 120],
                                        y: [0, (Math.random() - 0.5) * 120],
                                    }}
                                    transition={{
                                        duration: 2,
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

export default InstantPayrollVisualizer; 