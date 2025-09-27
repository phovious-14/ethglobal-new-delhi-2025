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

// Network Showcase Component
const NetworkShowcase = () => {
  const allNetworks = getMainnetNetworks();

  const getChainLogo = (chainId: number): string => {
    switch (chainId) {
      case 534352: // Scroll Mainnet
        return '/img/scroll.png';
      case 8453: // Base Mainnet
        return '/img/base.png';
      default:
        return '/img/eth.png';
    }
  };

  const getTokenLogo = (symbol: string): string => {
    switch (symbol) {
      case 'USDC':
        return '/img/usdc.png';
      case 'USDT':
        return '/img/usdt.png';
      case 'DAI':
        return '/img/dai.png'; 
      case 'ETH':
        return '/img/eth.png';
      case 'USDCx':
        return '/img/usdcx.png';
      case 'USDTx':
        return '/img/usdtx.png';
      case 'DAIx':
        return '/img/daix.png'; 
      case 'ETH':
        return '/img/eth.png';
      default:
        return '/img/usdc.png';
    }
  };

  return (
    <div className="space-y-8">

      {/* Networks Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {allNetworks.map((network) => (
          <div
            key={network.chainId}
            className="group relative bg-gradient-to-br from-gray-800/30 to-gray-900/30 border border-gray-700/50 rounded-2xl backdrop-blur-sm p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-blue-500/10"
          >
            {/* Network Header */}
            <div className="flex items-center space-x-4 mb-6">
              <div className="relative">
                <Image
                  src={getChainLogo(network.chainId)}
                  alt={network.name}
                  width={48}
                  height={48}
                  className="rounded-xl group-hover:scale-110 transition-transform duration-300"
                />
              </div>
              <div className="flex-1">
                <h4 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300">
                  {network.name}
                </h4>
              </div>
            </div>

            {/* Tokens Section */}
            <div className="space-y-4">
              <h5 className="text-sm font-semibold text-gray-300 uppercase tracking-wide">
                Available Tokens
              </h5>
              <div className="space-y-3">
                {Object.entries(network.tokens).map(([symbol, tokenPair]) => (
                  <div
                    key={symbol}
                    className="bg-gradient-to-r from-gray-800/50 to-gray-700/50 border border-gray-600/30 rounded-xl p-4 hover:border-blue-500/30 transition-all duration-300 group-hover:shadow-lg"
                  >
                    <div className="flex items-center justify-between">
                      {/* Native Token */}
                      <div className="flex items-center space-x-3">
                        <div className="relative">
                          <Image
                            src={getTokenLogo(symbol)}
                            alt={tokenPair.nativeToken.name}
                            width={32}
                            height={32}
                            className="rounded-full"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-white">{symbol}</p>
                          <p className="text-xs text-gray-400">{tokenPair.nativeToken.name}</p>
                        </div>
                      </div>

                      {/* Arrow */}
                      <div className="flex items-center space-x-2">
                        <ArrowRight className="w-4 h-4 text-gray-500" />
                        <div className="text-xs text-gray-500 font-medium">Wrap to</div>
                      </div>

                      {/* Super Token */}
                      <div className="flex items-center space-x-3">
                        <div className="text-right">
                          <p className="text-sm font-semibold text-blue-400">{tokenPair.superToken.symbol}</p>
                          <p className="text-xs text-gray-400">Super Token</p>
                        </div>
                        <div className="relative">
                          <Image
                            src={getTokenLogo(tokenPair.superToken.symbol)}
                            alt={tokenPair.superToken.name}
                            width={28}
                            height={28}
                            className="rounded-full"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Info Section */}
      <div className="mt-8 p-6 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-2xl backdrop-blur-sm">
        <div className="flex items-start space-x-4">
          <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
            <ArrowRight className="w-4 h-4 text-blue-400" />
          </div>
          <div>
            <h4 className="text-lg font-semibold text-white mb-2">How Token Wrapping Works</h4>
            <p className="text-gray-300 text-sm leading-relaxed">
              Convert your native stablecoins (USDC, USDT, DAI) to their Super Token equivalents (USDCx, USDTx, DAIx)
              to enable streaming payments. Super Tokens are required for real-time payroll flows and can be unwrapped back
              to native stablecoins at any time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Enhanced FAQ data
const faqData = [
  {
    question: 'What is DripPay?',
    answer: 'DripPay is the most secure multi-chain stablecoin payroll platform designed for Web3 teams and DAOs. Our comprehensive stablecoin payment solution enables both instant stablecoin transfers and real-time streaming crypto payroll across multiple networks, perfect for managing stablecoin invoicing, employee salaries, and contributor rewards globally.'
  },
  {
    question: 'What payment types does DripPay support?',
    answer: 'DripPay supports instant stablecoin payments for one-time transfers and streaming crypto payroll for continuous real-time flows. Our dual-mode platform makes it perfect for both immediate stablecoin invoicing and ongoing streaming payments to employees worldwide.'
  },
  {
    question: 'How do I get started with DripPay?',
    answer: 'Getting started is easy! Connect your wallet using Privy, switch to your preferred network, and ensure you have stablecoin tokens. For streaming payments, you\'ll need to wrap your stablecoins to their Super Token equivalents first. Then you can create payroll pools, add recipients, and start making payments instantly or set up streaming flows.'
  },
  {
    question: 'What wallets are supported?',
    answer: 'DripPay supports all major Web3 wallets through Privy integration, including MetaMask, WalletConnect, Coinbase Wallet, and more. You can also link multiple wallets to your account for convenience and backup purposes.'
  },
  {
    question: 'How do I wrap/unwrap stablecoin tokens?',
    answer: 'Use the Wrap/Unwrap component in your Profile icon to convert between stablecoins and their Super Token equivalents. Simply enter the amount, choose the direction (wrap stablecoin→Super Token or unwrap Super Token→stablecoin), and confirm the transaction. The component automatically validates your balance before processing.'
  },
  {
    question: 'What networks and tokens are supported?',
    answer: 'DripPay supports multiple networks including Scroll, Base, and others. Each network supports various stablecoins like USDC, USDT, DAI, and their Super Token equivalents. The platform automatically detects your network and shows the appropriate token options.'
  },
  {
    question: 'How do streaming payments work?',
    answer: 'Streaming crypto payroll uses real-time stablecoin streaming technology powered by Superfluid. Instead of traditional lump sum payments, you create continuous stablecoin flows that recipients can access at any time. This revolutionary approach to streaming payments is perfect for employee salaries, contractor payments, or any recurring stablecoin payment scenario.'
  },
  {
    question: 'What are the gas fees?',
    answer: 'Gas fees depend on the network conditions and transaction type. Instant payments have a one-time gas fee, while streaming payments require an initial setup fee plus minimal ongoing fees. Most supported networks have much lower gas fees compared to Ethereum mainnet, making them cost-effective for regular payroll operations.'
  },
  {
    question: 'Is DripPay secure?',
    answer: 'Yes! DripPay uses industry-standard security practices. All transactions are executed on-chain through smart contracts, ensuring transparency and immutability. We use Privy for secure wallet authentication and never store your private keys. All payment data is encrypted and stored securely.'
  },
  {
    question: 'Can I use DripPay for international payments?',
    answer: 'Absolutely! DripPay is the perfect multi-chain stablecoin payroll platform for global teams. Since we use stablecoins, you can send instant stablecoin payments to employees and freelancers worldwide without currency conversion or traditional banking delays. Recipients just need a Web3 wallet, making our platform ideal for international crypto payroll and cross-border stablecoin invoicing.'
  },
  {
    question: 'What happens if a transaction fails?',
    answer: 'If a transaction fails due to insufficient gas fees or network issues, your tokens remain safe in your wallet. You can retry the transaction, and DripPay will show you the specific error message to help troubleshoot the issue.'
  },
  {
    question: 'How do I track my payment history?',
    answer: 'All your payment history is available in the "Payroll" section. You can view transaction details, recipient information, amounts, and timestamps. All data is also recorded on-chain, so you can verify transactions using blockchain explorers.'
  },
  {
    question: 'What if I need to stop a streaming payment?',
    answer: 'You can stop a streaming payment at any time from the Record. Simply navigate to the active streams section and click "Stop Stream." The remaining funds in the stream will be in your wallet, and the recipient will no longer receive new tokens from that stream.'
  },
  {
    question: 'Is there a limit on payment amounts?',
    answer: 'There are no hard limits on payment amounts in DripPay.'
  },
  {
    question: 'Can I use DripPay for business expenses?',
    answer: 'Yes! DripPay is perfect for business expenses, vendor payments, contractor fees, and any other business-related transactions.'
  },
  {
    question: 'What support is available if I need help?',
    answer: 'We offer comprehensive support through our Telegram community. For technical issues, you can reach out to our team directly. We also provide video tutorials and guides to help you get the most out of DripPay.'
  },
  {
    question: 'Is DripPay free to use?',
    answer: 'DripPay is currently free to use! You only pay for the gas fees required for blockchain transactions, which are minimal on the Scroll network. We may introduce premium features in the future.'
  },
  {
    question: 'What makes DripPay different from traditional payroll?',
    answer: 'DripPay eliminates the need for traditional banking, reduces processing times from days to seconds, provides transparent on-chain records, supports global payments without issues, and offers real-time streaming payments that traditional systems can\'t match. Plus, you maintain full control over your funds at all times.'
  },
  {
    question: 'How can I stay updated with DripPay news and updates?',
    answer: 'Follow our LinkedIn company page at https://www.linkedin.com/company/drippay/ for the latest updates, product announcements, and insights into the future of Web3 payroll. We regularly share content about USDC payroll innovations, streaming payment technology, and how we\'re transforming the decentralized workforce payment experience. You can also follow us on X (Twitter) @_DripPay for real-time updates.'
  }
];

// Feature cards data
const features = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Instant Stablecoin Payments",
    description: "Send secure stablecoin payments instantly to employees worldwide. Our instant payment system eliminates traditional banking delays for Web3 teams.",
    gradient: "from-yellow-400 to-orange-500"
  },
  {
    icon: <Clock className="w-6 h-6" />,
    title: "Streaming Payroll",
    description: "Set up continuous streaming payments for stablecoin payroll. Real-time payment intelligence and seamless crypto payroll management for Web3 teams.",
    gradient: "from-blue-400 to-purple-500"
  },
  {
    icon: <DollarSign className="w-6 h-6" />,
    title: "Multi-Chain Payment Intelligence",
    description: "Built natively for stablecoin payroll across multiple networks. Secure, transparent streaming payments with real-time payment intelligence for Web3 businesses.",
    gradient: "from-pink-400 to-rose-500"
  }
];

// Future Vision data
const futureVisionFeatures = [
  {
    icon: <Zap className="w-6 h-6" />,
    title: "Smart Contract Automation",
    description: "Programmable payment triggers based on milestones, performance metrics, or external data feeds—making payments truly autonomous.",
    gradient: "from-cyan-400 to-blue-500",
    status: "In Future"
  },
  {
    icon: <Shield className="w-6 h-6" />,
    title: "Multi-Signature Security",
    description: "Enterprise-grade multi-signature wallet integration requiring multiple approvals for large transactions. Enhanced security with customizable approval thresholds, time-locks, and role-based access controls for team-based payment management.",
    gradient: "from-red-400 to-pink-500",
    status: "In Future"
  },
  {
    icon: <Brain className="w-6 h-6" />,
    title: "AI-Powered Payment Intelligence & Analytics",
    description: "Advanced AI systems that predict payment patterns, optimize cash flow, and automatically adjust streaming rates. Comprehensive analytics dashboard that forecasts payment needs, identifies optimization opportunities, and provides actionable insights for financial planning.",
    gradient: "from-emerald-400 to-teal-500",
    status: "In Future"
  },

];

export default function Home() {
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

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
          <div className="text-center space-y-8">
            {/* Main Hero Content */}
            <Reveal className="space-y-6" yOffset={18}>
              <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-full text-blue-400 text-sm font-medium backdrop-blur-sm">
                Not like traditional payrolls
              </div>

              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold leading-tight">
                <span className="bg-gradient-to-r from-white via-blue-100 to-purple-100 bg-clip-text text-transparent mr-5">
                  Stablecoin Payroll
                </span>
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  & Invoicing
                </span>
              </h1>

              <h2 className="text-xl sm:text-2xl text-gray-300 max-w-4xl mx-auto leading-relaxed">
                The most secure multi-chain stablecoin payroll platform for Web3 teams and DAOs. Make instant stablecoin payments or stream crypto payroll with real-time flows.
              </h2>
            </Reveal>

            
          </div>
        </div>
      </section>
    </div>
  );
}
