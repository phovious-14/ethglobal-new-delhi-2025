'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Button } from '@/src/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion';
import {
  CheckCircle,
  Shield,
  ChevronDown,
  Play,
  Heart,
  Zap,
  DollarSign,
  Clock,
  Sparkles,
  Brain,
  ArrowRight,
  Users,
  Globe,
  TrendingUp,
  Wallet,
  Timer,
  CreditCard,
  BarChart3,
  Layers,
  Star,
  Waves,
} from 'lucide-react';
import Image from 'next/image';
import { getMainnetNetworks } from '@/src/utils/tokenRegistry';


// Reduced motion preference hook
const useReducedMotion = () => {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const media = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(media.matches);
    update();
    media.addEventListener?.('change', update);
    return () => media.removeEventListener?.('change', update);
  }, []);
  return reduced;
};

// Reveal-on-scroll animation wrapper
const Reveal: React.FC<{
  children: React.ReactNode;
  className?: string;
  delayMs?: number;
  yOffset?: number;
}> = ({ children, className, delayMs = 0, yOffset = 24 }) => {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      setVisible(true);
      return;
    }
    if (!ref.current || typeof window === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // delay entrance for subtle stagger
            const id = window.setTimeout(() => setVisible(true), delayMs);
            observer.unobserve(entry.target);
            return () => window.clearTimeout(id);
          }
        });
      },
      { rootMargin: '0px 0px -10% 0px', threshold: 0.1 }
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [delayMs, reduced]);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        opacity: visible ? 1 : 0,
        transform: visible ? 'translateY(0px)' : `translateY(${yOffset}px)`,
        transition: `opacity 700ms cubic-bezier(.21,1,.21,1) ${delayMs}ms, transform 700ms cubic-bezier(.21,1,.21,1) ${delayMs}ms`,
        willChange: 'opacity, transform',
      }}
    >
      {children}
    </div>
  );
};

// Top scroll progress bar
const ScrollProgressBar: React.FC<{ progress: number }> = ({ progress }) => (
  <div className="fixed top-0 left-0 right-0 h-1.5 z-50">
    <div className="relative h-full bg-transparent">
      <div
        className="absolute left-0 top-0 h-full bg-gradient-to-r from-blue-500 via-purple-600 to-cyan-400 shadow-[0_0_12px_2px_rgba(59,130,246,0.35)] transition-[width] duration-75"
        style={{ width: `${Math.min(100, Math.max(0, progress * 100))}%` }}
      />
    </div>
  </div>
);

// Parallax layer
const ParallaxLayer: React.FC<{
  children: React.ReactNode;
  speed?: number; // positive moves slower than scroll; negative moves opposite
  scrollY: number;
  className?: string;
  style?: React.CSSProperties;
}> = ({ children, speed = 0.2, scrollY, className, style }) => {
  const reduced = useReducedMotion();
  const translateY = reduced ? 0 : Math.round(scrollY * speed);
  return (
    <div
      className={className}
      style={{
        transform: `translate3d(0, ${translateY}px, 0)`,
        willChange: 'transform',
        ...style,
      }}
    >
      {children}
    </div>
  );
};

// Optimized particles with reduced computation
const FloatingParticles = () => {
  const reduced = useReducedMotion();

  // Skip expensive animations on mobile or reduced motion
  if (reduced || (typeof window !== 'undefined' && window.innerWidth < 1024)) {
    return (
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute top-20 left-20 w-2 h-2 bg-blue-400 rounded-full" />
        <div className="absolute bottom-32 right-40 w-1 h-1 bg-purple-400 rounded-full" />
        <div className="absolute top-60 left-1/2 w-2 h-2 bg-cyan-400 rounded-full" />
      </div>
    );
  }

  const [particles] = useState(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      x: Math.random() * 100,
      y: Math.random() * 100,
      size: Math.random() * 3 + 1,
      delay: Math.random() * 2,
    }))
  );

  return (
    <div className="absolute inset-0 pointer-events-none opacity-30">
      {particles.map(particle => (
        <div
          key={particle.id}
          className="absolute bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            animationDelay: `${particle.delay}s`,
            animationDuration: '3s',
          }}
        />
      ))}
    </div>
  );
};

// Optimized USDC Stream Animation
const USDCStreamAnimation = () => {
  const reduced = useReducedMotion();

  // Skip on mobile/tablets or reduced motion for better performance
  if (reduced || (typeof window !== 'undefined' && window.innerWidth < 1024)) {
    return null;
  }

  return (
    <div className="absolute inset-0 pointer-events-none opacity-40">
      {/* CSS-only animated tokens for better performance */}
      <div className="absolute left-10 top-32 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold rounded-full flex items-center justify-center text-xs animate-bounce" style={{ animationDelay: '0s', animationDuration: '2s' }}>
        $
      </div>
      <div className="absolute left-32 top-48 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold rounded-full flex items-center justify-center text-xs animate-bounce" style={{ animationDelay: '0.5s', animationDuration: '2s' }}>
        $
      </div>
      <div className="absolute left-20 top-64 w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-500 text-white font-bold rounded-full flex items-center justify-center text-xs animate-bounce" style={{ animationDelay: '1s', animationDuration: '2s' }}>
        $
      </div>
    </div>
  );
};

export default function Home() {

  // Scroll state for parallax + progress
  const [scrollY, setScrollY] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Throttle scroll handling more aggressively for performance
    let timeoutId: NodeJS.Timeout;
    const handleScroll = () => {
      if (ticking.current) return;
      ticking.current = true;

      // Use setTimeout instead of RAF for less frequent updates
      timeoutId = setTimeout(() => {
        const y = window.scrollY || window.pageYOffset || 0;
        setScrollY(y);
        const doc = document.documentElement;
        const max = (doc.scrollHeight || 0) - (window.innerHeight || 1);
        setScrollProgress(max > 0 ? y / max : 0);
        ticking.current = false;
      }, 16); // ~60fps max
    };

    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative">
      <ScrollProgressBar progress={scrollProgress} />
      {/* Background Effects */}
      <FloatingParticles />

      {/* Gradient Orbs */}
      <div className="absolute inset-0">
        <ParallaxLayer scrollY={scrollY} speed={0.15} className="absolute">
          <div className="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-full blur-3xl animate-pulse" />
        </ParallaxLayer>
        <ParallaxLayer scrollY={scrollY} speed={0.3} className="absolute">
          <div
            className="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-green-500/20 to-cyan-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '2s' }}
          />
        </ParallaxLayer>
        <ParallaxLayer scrollY={scrollY} speed={-0.08} className="absolute">
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-pink-500/20 to-orange-500/20 rounded-full blur-3xl animate-pulse"
            style={{ animationDelay: '4s' }}
          />
        </ParallaxLayer>
      </div>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 pb-10 w-full">
        <USDCStreamAnimation />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center space-y-12">

            {/* Main Hero Content */}
            <Reveal className="space-y-8" yOffset={18}>

              <h1 className="text-5xl sm:text-6xl lg:text-8xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent text-4xl sm:text-5xl lg:text-6xl">
                  Stream Salaries Every Second
                </span>
              </h1>

              <h2 className="text-xl sm:text-2xl text-gray-300 max-w-5xl mx-auto leading-relaxed">
                The world's first real-time payroll powered by <span className="text-blue-400 font-semibold">PYUSD</span> and <span className="text-green-400 font-semibold">Self,</span> <span className="text-purple-400 font-semibold">Superfluid</span>.
                <br />Pay employees continuously as they work
              </h2>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative py-32 bg-gradient-to-b from-transparent to-gray-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Section Header */}
          <Reveal className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              Why Choose <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">PayPulse</span>?
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Revolutionary payroll features that transform how businesses pay their workforce
            </p>
          </Reveal>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">

            {/* Real-time Streaming */}
            <Reveal className="group" delayMs={100}>
              <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10">
                <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Waves className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Real-time Streaming</h3>
                <p className="text-gray-300 leading-relaxed">
                  Employees get paid every second they work. Watch salaries flow continuously instead of waiting for monthly paychecks.
                </p>
              </div>
            </Reveal>

            {/* Instant Payments */}
            <Reveal className="group" delayMs={200}>
              <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm hover:border-purple-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-purple-500/10">
                <div className="w-12 h-12 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Zap className="w-6 h-6 text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Instant Settlements</h3>
                <p className="text-gray-300 leading-relaxed">
                  One-click payments for bonuses, contractors, and project completions. Instant, transparent, and cost-effective.
                </p>
              </div>
            </Reveal>

            {/* PYUSD Integration */}
            <Reveal className="group" delayMs={300}>
              <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm hover:border-green-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-green-500/10">
                <div className="w-12 h-12 bg-gradient-to-r from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <DollarSign className="w-6 h-6 text-green-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">PYUSD Powered</h3>
                <p className="text-gray-300 leading-relaxed">
                  Built on PayPal's USD stablecoin with easy off-ramps to traditional banking. Stable, regulated, and trusted.
                </p>
              </div>
            </Reveal>

            {/* Global Reach */}
            <Reveal className="group" delayMs={400}>
              <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm hover:border-cyan-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-cyan-500/10">
                <div className="w-12 h-12 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <Globe className="w-6 h-6 text-cyan-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Global Workforce</h3>
                <p className="text-gray-300 leading-relaxed">
                  Pay anyone, anywhere, instantly. No banks, no borders, no delays. Perfect for remote teams and international contractors.
                </p>
              </div>
            </Reveal>

            {/* Automated Invoicing */}
            <Reveal className="group" delayMs={500}>
              <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm hover:border-orange-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-orange-500/10">
                <div className="w-12 h-12 bg-gradient-to-r from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <CreditCard className="w-6 h-6 text-orange-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Smart Invoicing</h3>
                <p className="text-gray-300 leading-relaxed">
                  Automatic invoice generation, PDF exports, and payment tracking. Streamline your accounting and compliance.
                </p>
              </div>
            </Reveal>

            {/* Transparent Analytics */}
            <Reveal className="group" delayMs={600}>
              <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 border border-gray-700/50 rounded-2xl p-8 backdrop-blur-sm hover:border-pink-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-pink-500/10">
                <div className="w-12 h-12 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6 text-pink-400" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4">Real-time Analytics</h3>
                <p className="text-gray-300 leading-relaxed">
                  Complete transparency with on-chain records, flow visualizations, and comprehensive payroll analytics.
                </p>
              </div>
            </Reveal>

          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="relative py-32">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <Reveal className="text-center mb-20">
            <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
              How It <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Works</span>
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Three simple steps to revolutionize your payroll
            </p>
          </Reveal>

          <div className="grid md:grid-cols-3 gap-12">

            {/* Step 1 */}
            <Reveal className="text-center" delayMs={100}>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-blue-500/25">
                  <Wallet className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  1
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Connect & Setup</h3>
              <p className="text-gray-300 leading-relaxed">
                Connect your wallet, add employee addresses, and configure payment preferences. Setup takes less than 5 minutes.
              </p>
            </Reveal>

            {/* Step 2 */}
            <Reveal className="text-center" delayMs={200}>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-purple-500/25">
                  <Timer className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-purple-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  2
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Start Streaming</h3>
              <p className="text-gray-300 leading-relaxed">
                Launch salary streams or send instant payments. Watch money flow in real-time with beautiful visualizations.
              </p>
            </Reveal>

            {/* Step 3 */}
            <Reveal className="text-center" delayMs={300}>
              <div className="relative">
                <div className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-green-500/25">
                  <CheckCircle className="w-10 h-10 text-white" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center text-white font-bold text-sm">
                  3
                </div>
              </div>
              <h3 className="text-2xl font-bold text-white mb-4">Track & Manage</h3>
              <p className="text-gray-300 leading-relaxed">
                Monitor all payments, generate invoices, and access comprehensive analytics. Full transparency and control.
              </p>
            </Reveal>

          </div>
        </div>
      </section>

      {/* Demo CTA Section */}
      <section className="relative py-32 bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-cyan-500/10 border-y border-gray-700/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">

          <Reveal>
            <div className="space-y-8">
              <h2 className="text-4xl sm:text-5xl font-bold text-white">
                Ready to Experience the Future of Payroll?
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                Join the revolution. Start streaming salaries today and give your employees the financial freedom they deserve.
              </p>

              {/* Trust Indicators */}
              <div className="flex flex-wrap justify-center items-center gap-8 pt-12 opacity-60">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  <span className="text-sm text-gray-400">Secure & Audited</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Star className="w-5 h-5 text-yellow-400" />
                  <span className="text-sm text-gray-400">ETHGlobal Winner</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Layers className="w-5 h-5 text-blue-400" />
                  <span className="text-sm text-gray-400">Multi-chain Ready</span>
                </div>
              </div>
            </div>
          </Reveal>

        </div>
      </section>
    </div>
  );
}
