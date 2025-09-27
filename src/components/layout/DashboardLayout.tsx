"use client";

import React, { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import {
    Home,
    BarChart3,
    Users,
    FileText,
    Activity,
    Database,
    Shield,
    Zap,
    Bell,
    Settings,
    Sun,
    User,
    Search,
    Filter,
    Download,
    RefreshCw,
    TrendingUp,
    TrendingDown,
    DollarSign,
    Eye,
    Heart,
    Calendar,
    Menu,
    ChevronLeft,
    Waves,
    X,
    Send,
    Plus,
    Timer,
    SendIcon,
    ArrowDown,
    Gift,
    Package,
} from "lucide-react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";
import { useDistribution } from "../../app/context/DistributionContext";
import { AuthButton } from "./AuthButton";
import { ChainSelector } from "../ChainSelector";

interface DashboardLayoutProps {
    children?: React.ReactNode;
}

const DashboardLayout = ({ children }: DashboardLayoutProps) => {
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { isInstantDistribution, setIsInstantDistribution, isSenderMode, setIsSenderMode } = useDistribution();
    const [isPricingModalOpen, setIsPricingModalOpen] = useState(false);
    const [isTerminologiesModalOpen, setIsTerminologiesModalOpen] = useState(false);
    const navigationItems = [
        { id: "dashboard", label: "Dashboard", icon: Home, href: "/dashboard" },
        { id: "create-payroll", label: "Create Payroll", icon: Plus, href: "/create-payroll" },
        { id: "payroll", label: "Payrolls", icon: Users, href: "/payroll" },
        { id: "transfer", label: "Transfer", icon: Send, href: "/transfer" },
    ];

    // Function to check if a navigation item is active
    const isActiveTab = (href: string) => {
        if (href === "/") {
            return pathname === "/";
        }
        return pathname.startsWith(href);
    };

    // Close mobile menu when route changes
    useEffect(() => {
        setMobileMenuOpen(false);
    }, [pathname]);

    return (
        <div className="flex min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* Left Sidebar - Desktop */}
            <div className={`hidden fixed top-0 left-0 h-screen z-50 lg:block bg-white border-r border-white/60 shadow-xl transition-all duration-300 ease-in-out ${sidebarCollapsed ? 'w-16' : 'w-64'
                }`}>

                {/* Logo */}
                <div className={`${sidebarCollapsed ? 'p-4' : 'p-6'} border-b border-white/40`}>
                    <Link href="/" className={`flex items-center group cursor-pointer ${sidebarCollapsed ? 'justify-center' : 'space-x-3'}`}>
                        <div className="relative">
                            <Image
                                src="/img/drippay.png"
                                alt="drippay"
                                width={32}
                                height={32}
                                className="rounded-lg w-8 h-8 flex-shrink-0 transition-transform duration-300 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-green-500/20 rounded-full blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        </div>
                        {!sidebarCollapsed && (
                            <div className="min-w-0">
                                <div className="text-xl font-display font-black tracking-tighter text-black uppercase">
                                    <span className="bg-black text-white px-3 py-1 rounded-lg shadow-lg">Drip</span>
                                    <span className="text-black ml-1">Pay</span>
                                </div>
                            </div>
                        )}
                    </Link>
                </div>

                {/* Sidebar Toggle Button - Positioned after logo */}
                <div className="px-4 py-2 border-b border-white/20">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                        className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-xl text-sm font-medium transition-all duration-300 group text-gray-600 hover:backdrop-blur-md hover:bg-gradient-to-r hover:from-white/50 hover:to-blue-50/30 hover:text-gray-900 hover:shadow-md hover:scale-105`}
                        title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                    >
                        <div className={`${sidebarCollapsed ? 'p-2' : 'p-1.5'} rounded-lg transition-all duration-300 bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-blue-500/20 group-hover:to-purple-500/20 group-hover:text-blue-600`}>
                            {sidebarCollapsed ? <ChevronLeft className="w-4 h-4 flex-shrink-0" /> : <ChevronLeft className="w-4 h-4 flex-shrink-0 rotate-180" />}
                        </div>
                    </Button>
                </div>

                {/* Navigation */}
                <div className="p-4">
                    <nav className="space-y-2">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = isActiveTab(item.href);
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-xl text-sm font-medium transition-all duration-300 group ${isActive
                                        ? "backdrop-blur-md bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 border border-blue-300/50 shadow-lg shadow-blue-500/20"
                                        : "text-gray-600 hover:backdrop-blur-md hover:bg-gradient-to-r hover:from-white/50 hover:to-blue-50/30 hover:text-gray-900 hover:shadow-md hover:scale-105"
                                        }`}
                                    title={sidebarCollapsed ? item.label : undefined}
                                >
                                    <div className={`${sidebarCollapsed ? 'p-2' : 'p-1.5'} rounded-lg transition-all duration-300 ${isActive
                                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                                        : "bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-blue-500/20 group-hover:to-purple-500/20 group-hover:text-blue-600"
                                        }`}>
                                        <Icon className="w-4 h-4 flex-shrink-0" />
                                    </div>
                                    {!sidebarCollapsed && <span className="flex flex-row justify-center items-center gap-x-2">{item.label} {item.id === "dashboard" && <span className="text-[10px] text-black bg-orange-400 px-[6px] py-[0.5px] rounded-md">New</span>}</span>}
                                </Link>
                            );
                        })}
                        {/* <button
                            onClick={() => setIsPricingModalOpen(true)}
                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-xl text-sm font-medium transition-all duration-300 group text-gray-600 hover:backdrop-blur-md hover:bg-gradient-to-r hover:from-white/50 hover:to-blue-50/30 hover:text-gray-900 hover:shadow-md hover:scale-105`}
                            title={sidebarCollapsed ? "Pricing" : undefined}
                        >
                            <div className={`${sidebarCollapsed ? 'p-2' : 'p-1.5'} rounded-lg transition-all duration-300 bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-blue-500/20 group-hover:to-purple-500/20 group-hover:text-blue-600`}>
                                <DollarSign className="w-4 h-4 flex-shrink-0" />
                            </div>
                            {!sidebarCollapsed && <span>Pricing</span>}
                        </button> */}
                        {/* <button
                            onClick={() => setIsTerminologiesModalOpen(true)}
                            className={`w-full flex items-center ${sidebarCollapsed ? 'justify-center px-2' : 'space-x-3 px-4'} py-3 rounded-xl text-sm font-medium transition-all duration-300 group text-gray-600 hover:backdrop-blur-md hover:bg-gradient-to-r hover:from-white/50 hover:to-blue-50/30 hover:text-gray-900 hover:shadow-md hover:scale-105`}
                            title={sidebarCollapsed ? "Terminologies" : undefined}
                        >
                            <div className={`${sidebarCollapsed ? 'p-2' : 'p-1.5'} rounded-lg transition-all duration-300 bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-blue-500/20 group-hover:to-purple-500/20 group-hover:text-blue-600`}>
                                <Package className="w-4 h-4 flex-shrink-0" />
                            </div>
                            {!sidebarCollapsed && <span>Terminologies</span>}
                        </button> */}
                    </nav>
                </div>

                {/* Bottom Section */}
                <div className="absolute bottom-0 left-0 w-full p-4 border-t border-white/40">
                    <div className="flex items-center justify-center flex-col gap-y-2">
                        <Link
                            href="https://x.com/_DripPay"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="group"
                            title="Follow us on X"
                        >
                            <div className="w-8 h-8 bg-black rounded-lg flex items-center justify-center hover:bg-gray-800 transition-all duration-300 group-hover:scale-110 shadow-lg">
                                <svg className="w-4 h-4 text-white" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                </svg>
                            </div>
                        </Link>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <div className={`w-full flex flex-col ${sidebarCollapsed ? 'lg:ml-16' : 'lg:ml-64'}`}>
                {/* Top Header */}
                <div className="flex items-center justify-between fixed top-4 left-0 right-6 z-[49] bg-transparent lg:left-0">
                    <div className="flex items-center space-x-4">
                        {/* Mobile Menu Button - Removed since we have bottom nav */}
                    </div>

                    <div className="flex items-center space-x-2 sm:space-x-4">
                        {/* Chain Selector */}
                        <div className="hidden sm:block">
                            <ChainSelector variant="compact" className="bg-white/95 backdrop-blur-xl border border-white/60 shadow-xl" />
                        </div>

                        {/* Unified Mode Control */}
                        <div className="flex items-center gap-2 sm:gap-3 frosted-glass-light border border-white/60 rounded-xl sm:rounded-2xl p-0.5 sm:p-1 shadow-xl shadow-blue-500/10 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 bg-white/95 backdrop-blur-xl">
                            {/* Distribution Type Toggle */}
                            <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                                <div className="relative flex items-center bg-slate-100 rounded-lg sm:rounded-xl p-0.5 sm:p-1 shadow-inner">
                                    {/* Sliding Background */}
                                    <div
                                        className={`absolute top-0.5 sm:top-1 bottom-0.5 sm:bottom-1 w-[calc(50%-1px)] sm:w-[calc(50%-2px)] rounded-md sm:rounded-lg transition-transform duration-500 ease-out ${isInstantDistribution
                                            ? 'translate-x-[calc(100%+1px)] sm:translate-x-[calc(100%+2px)] bg-gradient-to-r from-purple-500 to-pink-500'
                                            : 'translate-x-0 bg-gradient-to-r from-blue-500 to-indigo-500'
                                            }`}
                                    />
                                    <button
                                        onClick={() => setIsInstantDistribution(false)}
                                        className={`relative px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-1 sm:gap-1.5 z-10 ${!isInstantDistribution
                                            ? 'text-white'
                                            : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                    >
                                        <Waves className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                        <span className="hidden sm:inline">Stream</span>
                                    </button>
                                    <button
                                        onClick={() => setIsInstantDistribution(true)}
                                        className={`relative px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-1 sm:gap-1.5 z-10 ${isInstantDistribution
                                            ? 'text-white'
                                            : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                    >
                                        <Zap className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                        <span className="hidden sm:inline">Instant</span>
                                    </button>
                                </div>
                            </div>

                            {/* Separator */}
                            <div className="w-px h-10 sm:h-12 bg-gradient-to-b from-transparent via-gray-300 to-transparent"></div>

                            {/* Role Type Toggle */}
                            <div className="flex flex-col items-center gap-0.5 sm:gap-1">
                                <div className="relative flex items-center bg-slate-100 rounded-lg sm:rounded-xl p-0.5 sm:p-1 shadow-inner">
                                    {/* Sliding Background */}
                                    <div
                                        className={`absolute top-0.5 sm:top-1 bottom-0.5 sm:bottom-1 w-[calc(50%-1px)] sm:w-[calc(50%-2px)] rounded-md sm:rounded-lg transition-transform duration-500 ease-out ${isSenderMode
                                            ? 'translate-x-0 bg-gradient-to-r from-green-500 to-emerald-500'
                                            : 'translate-x-[calc(100%+1px)] sm:translate-x-[calc(100%+2px)] bg-gradient-to-r from-orange-500 to-red-500'
                                            }`}
                                    />
                                    <button
                                        onClick={() => setIsSenderMode(true)}
                                        className={`relative px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-1 sm:gap-1.5 z-10 ${isSenderMode
                                            ? 'text-white'
                                            : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                    >
                                        <SendIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                        <span className="hidden sm:inline">Sending</span>
                                    </button>
                                    <button
                                        onClick={() => setIsSenderMode(false)}
                                        className={`relative px-2 py-1 sm:px-3 sm:py-1.5 rounded-md sm:rounded-lg text-xs font-semibold transition-all duration-300 flex items-center gap-1 sm:gap-1.5 z-10 ${!isSenderMode
                                            ? 'text-white'
                                            : 'text-gray-600 hover:text-gray-800'
                                            }`}
                                    >
                                        <ArrowDown className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                                        <span className="hidden sm:inline">Receiving</span>
                                    </button>
                                </div>
                            </div>
                        </div>

                        <AuthButton className="!ml-2 sm:!ml-4" />
                    </div>
                </div>

                {/* Dashboard Content pass props to children */}
                <div className={`p-1 pt-4 overflow-auto ${sidebarCollapsed ? 'lg:pb-20' : 'lg:pb-6'} pb-20`}>
                    {children}
                </div>

                {/* Mobile Bottom Navigation */}
                <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-xl border-t border-white/60 shadow-2xl">
                    {/* Chain selector for mobile - shown above navigation */}
                    <div className="flex justify-center py-2 border-b border-white/40">
                        <ChainSelector variant="compact" />
                    </div>
                    <div className="flex items-center justify-around px-1 sm:px-2 py-1 sm:py-2">
                        {navigationItems.map((item) => {
                            const Icon = item.icon;
                            const isActive = isActiveTab(item.href);
                            return (
                                <Link
                                    key={item.id}
                                    href={item.href}
                                    className={`flex flex-col items-center justify-center p-2 sm:p-3 rounded-xl sm:rounded-2xl transition-all duration-300 group min-w-0 flex-1 mx-0.5 sm:mx-1 ${isActive
                                        ? "bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-700 border border-blue-300/50 shadow-lg"
                                        : "text-gray-600 hover:text-gray-900 hover:bg-gradient-to-r hover:from-white/50 hover:to-blue-50/30"
                                        }`}
                                >
                                    <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-all duration-300 ${isActive
                                        ? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-lg"
                                        : "bg-gray-100 group-hover:bg-gradient-to-r group-hover:from-blue-500/20 group-hover:to-purple-500/20 group-hover:text-blue-600"
                                        }`}>
                                        <Icon className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

        </div>
    );
};

export default DashboardLayout;
