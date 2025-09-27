'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card';
import { Input } from '@/src/components/ui/input';
import { Button } from '@/src/components/ui/button';
import { Label } from '@/src/components/ui/label';
import { Badge } from '@/src/components/ui/badge';
import {
    Plus,
    X,
    Waves,
    DollarSign,
    User,
    CheckCircle,
    Activity,
    Users,
    Pause,
    ChevronRight,
    ChevronLeft,
    Home,
    ChevronUp,
    ChevronDown,
    Copy
} from 'lucide-react';
import { useSpring, animated, useTrail } from '@react-spring/web';
import { useWallets } from "@privy-io/react-auth";
import { useSigner } from "@/src/hooks/use-signer";
import { DndContext, closestCenter } from '@dnd-kit/core';
import { arrayMove, SortableContext, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/src/components/ui/tabs';
import { Progress } from '@/src/components/ui/progress';
import { Switch } from '@/src/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { Textarea } from '@/src/components/ui/textarea';

interface StreamData {
    workTag: string;
    recipientName: string;
    sender: string;
    receiver: string;
    startDate: string;
    endDate: string;
    amount: string;
}

interface Recipient {
    id: string;
    name: string;
    walletAddress: string;
    avatar?: string;
    status?: 'active' | 'inactive';
}

interface Stream {
    id: string;
    name: string;
    recipient: Recipient;
    amount: number;
    duration: number;
    status: 'active' | 'paused' | 'completed';
    startDate: string;
    endDate: string;
}

const StreamingAnimation = ({ isActive, endDate, sender, receiver, onClose }: {
    isActive: boolean;
    endDate: string;
    sender: string;
    receiver: string;
    onClose: () => void;
}) => {
    const [tokens, setTokens] = useState<Array<{
        id: number;
        progress: number;
        startTime: number;
    }>>([]);

    const containerAnimation = useSpring({
        opacity: isActive ? 1 : 0,
        config: { tension: 300, friction: 25 }
    });

    const getTimeRemaining = () => {
        if (!endDate) return '';
        const now = new Date();
        const end = new Date(endDate);
        const diff = end.getTime() - now.getTime();

        if (diff <= 0) return 'Stream completed';

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

        return `${days}d ${hours}h ${minutes}m remaining`;
    };

    useEffect(() => {
        if (isActive) {
            const interval = setInterval(() => {
                const newToken = {
                    id: Date.now() + Math.random(),
                    progress: 0,
                    startTime: Date.now()
                };
                setTokens(prev => [...prev, newToken]);
            }, 1000);

            return () => clearInterval(interval);
        } else {
            setTokens([]);
        }
    }, [isActive]);

    useEffect(() => {
        if (!isActive) return;

        const interval = setInterval(() => {
            setTokens(prev =>
                prev.map(token => ({
                    ...token,
                    progress: Math.min((Date.now() - token.startTime) / 4000, 1)
                })).filter(token => token.progress < 1)
            );
        }, 16);

        return () => clearInterval(interval);
    }, [isActive]);

    const tunnelPath = `M 100 300 Q ${window.innerWidth / 2} 200 ${window.innerWidth - 100} 300`;

    return (
        <animated.div
            style={containerAnimation}
            className="fixed inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-green-500/10 backdrop-blur-sm z-50 overflow-hidden"
        >
            {/* Close Button */}
            <button
                onClick={onClose}
                className="absolute top-6 right-6 z-50 w-12 h-12 bg-white/90 backdrop-blur-md border border-white/60 rounded-xl flex items-center justify-center shadow-xl hover:bg-white/80 transition-all"
            >
                <X className="w-6 h-6 text-gray-700" />
            </button>

            <svg className="absolute inset-0 w-full h-full">
                <defs>
                    <linearGradient id="tunnelGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="rgba(34, 197, 94, 0.4)" />
                        <stop offset="50%" stopColor="rgba(59, 130, 246, 0.6)" />
                        <stop offset="100%" stopColor="rgba(34, 197, 94, 0.4)" />
                    </linearGradient>
                    <filter id="tunnelGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur" />
                        <feMerge>
                            <feMergeNode in="coloredBlur" />
                            <feMergeNode in="SourceGraphic" />
                        </feMerge>
                    </filter>
                </defs>
                <path
                    d={tunnelPath}
                    stroke="url(#tunnelGradient)"
                    strokeWidth="12"
                    fill="none"
                    strokeLinecap="round"
                    opacity="0.8"
                    filter="url(#tunnelGlow)"
                />
            </svg>

            <div className="absolute left-20 top-1/2 transform -translate-y-1/2">
                <div className="backdrop-blur-md bg-white/90 border border-white/60 rounded-xl p-4 shadow-xl">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 backdrop-blur-sm border border-white/40 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">Sender</p>
                        <p className="text-xs text-gray-600 truncate max-w-24">{sender}</p>
                    </div>
                </div>
            </div>

            <div className="absolute right-20 top-1/2 transform -translate-y-1/2">
                <div className="backdrop-blur-md bg-white/90 border border-white/60 rounded-xl p-4 shadow-xl">
                    <div className="text-center">
                        <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-white/40 rounded-xl flex items-center justify-center mx-auto mb-2">
                            <User className="w-6 h-6 text-green-600" />
                        </div>
                        <p className="text-sm font-medium text-gray-900">Receiver</p>
                        <p className="text-xs text-gray-600 truncate max-w-24">{receiver}</p>
                    </div>
                </div>
            </div>

            {tokens.map((token) => {
                const startX = 100;
                const endX = window.innerWidth - 100;
                const easedProgress = token.progress < 0.5
                    ? 2 * token.progress * token.progress
                    : 1 - Math.pow(-2 * token.progress + 2, 2) / 2;
                const currentX = startX + (endX - startX) * easedProgress;
                const curve1 = Math.sin(easedProgress * Math.PI) * 80;
                const curve2 = Math.sin(easedProgress * Math.PI * 2) * 20;
                const currentY = 300 - curve1 - curve2;

                return (
                    <div
                        key={token.id}
                        style={{
                            position: 'absolute',
                            left: `${currentX}px`,
                            top: `${currentY}px`,
                            width: '36px',
                            height: '36px',
                            borderRadius: '50%',
                            background: 'radial-gradient(circle, rgba(34, 197, 94, 0.95) 0%, rgba(34, 197, 94, 0.8) 70%, rgba(34, 197, 94, 0.6) 100%)',
                            border: '3px solid rgba(59, 130, 246, 0.9)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 0 25px rgba(34, 197, 94, 0.9), inset 0 0 10px rgba(255, 255, 255, 0.3)',
                            transform: 'translate(-50%, -50%)',
                            opacity: token.progress < 0.05 ? token.progress * 20 : token.progress > 0.95 ? (1 - token.progress) * 20 : 1,
                            zIndex: 10,
                            transition: 'all 0.016s ease-out'
                        }}
                    >
                        <span className="text-white font-bold text-base">$</span>
                    </div>
                );
            })}

            <div className="absolute top-8 right-24 backdrop-blur-md bg-white/90 border border-white/60 rounded-2xl p-6 shadow-2xl">
                <div className="text-center">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Waves className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-xl font-medium text-gray-900 mb-2">Streaming Active</h3>
                    <p className="text-gray-600 mb-2">1 USDC per second</p>
                    <p className="text-sm text-blue-600 font-medium">{getTimeRemaining()}</p>
                </div>
            </div>

            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full border-2 border-green-400/30 animate-ping"
                    style={{ animationDuration: '2s' }}
                />
            </div>
        </animated.div>
    );
};

// Mock data
const initialRecipients: Recipient[] = [
    { id: '1', name: 'Alex Chen', walletAddress: '0x1234567890abcdef1234567890abcdef12345678', status: 'active' },
    { id: '2', name: 'Sarah Kim', walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12', status: 'active' },
    { id: '3', name: 'Mike Johnson', walletAddress: '0x567890abcdef1234567890abcdef1234567890ab', status: 'active' },
];

const initialStreams: Stream[] = [
    {
        id: '1',
        name: 'Monthly Salary',
        recipient: { id: '1', name: 'Alex Chen', walletAddress: '0x1234567890abcdef1234567890abcdef12345678' },
        amount: 5000,
        duration: 30,
        status: 'active',
        startDate: '2024-01-01',
        endDate: '2024-01-31'
    },
    {
        id: '2',
        name: 'Freelance Payment',
        recipient: { id: '2', name: 'Sarah Kim', walletAddress: '0xabcdef1234567890abcdef1234567890abcdef12' },
        amount: 2500,
        duration: 15,
        status: 'active',
        startDate: '2024-01-15',
        endDate: '2024-01-30'
    }
];

export default function StreamDashboard() {
    // State management
    const [activeTab, setActiveTab] = useState('overview');
    const [recipients, setRecipients] = useState<Recipient[]>(initialRecipients);
    const [streams, setStreams] = useState<Stream[]>(initialStreams);
    const [streamModalOpen, setStreamModalOpen] = useState(false);
    const [createStreamModalOpen, setCreateStreamModalOpen] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    const [streamConfig, setStreamConfig] = useState({
        name: '',
        recipient: null as Recipient | null,
        amount: '',
        duration: '',
        startDate: '',
        endDate: '',
        description: ''
    });
    const [selectedStream, setSelectedStream] = useState<Stream | null>(null);
    // 1. Add pagination and search state
    const [streamSearch, setStreamSearch] = useState('');
    const [streamPage, setStreamPage] = useState(1);
    const [recipientSearch, setRecipientSearch] = useState('');
    const [recipientPage, setRecipientPage] = useState(1);
    const [expandedStreamId, setExpandedStreamId] = useState<string | null>(null);
    const STREAMS_PER_PAGE = 10;
    const RECIPIENTS_PER_PAGE = 10;

    // Form handlers
    const handleCreateStream = () => {
        if (!streamConfig.recipient || !streamConfig.amount || !streamConfig.duration) return;

        const newStream: Stream = {
            id: Date.now().toString(),
            name: streamConfig.name || `Stream to ${streamConfig.recipient.name}`,
            recipient: streamConfig.recipient,
            amount: parseFloat(streamConfig.amount),
            duration: parseInt(streamConfig.duration),
            status: 'active',
            startDate: streamConfig.startDate || new Date().toISOString().split('T')[0],
            endDate: streamConfig.endDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };

        setStreams(prev => [...prev, newStream]);
        setCreateStreamModalOpen(false);
        setStreamConfig({ name: '', recipient: null, amount: '', duration: '', startDate: '', endDate: '', description: '' });
        setCurrentStep(1);
    };

    const handleStreamAction = (streamId: string, action: 'pause' | 'resume' | 'stop') => {
        setStreams(prev => prev.map(stream =>
            stream.id === streamId
                ? { ...stream, status: action === 'pause' ? 'paused' : action === 'resume' ? 'active' : 'completed' }
                : stream
        ));
    };

    const handleStreamClick = (stream: Stream) => {
        setSelectedStream(stream);
        setStreamModalOpen(true);
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
    };

    // 2. Filtered and paginated streams/recipients
    const filteredStreams = streams.filter(s =>
        s.name.toLowerCase().includes(streamSearch.toLowerCase()) ||
        s.recipient.name.toLowerCase().includes(streamSearch.toLowerCase()) ||
        s.recipient.walletAddress.toLowerCase().includes(streamSearch.toLowerCase())
    );
    const paginatedStreams = filteredStreams.slice((streamPage - 1) * STREAMS_PER_PAGE, streamPage * STREAMS_PER_PAGE);
    const filteredRecipients = recipients.filter(r =>
        r.name.toLowerCase().includes(recipientSearch.toLowerCase()) ||
        r.walletAddress.toLowerCase().includes(recipientSearch.toLowerCase())
    );
    const paginatedRecipients = filteredRecipients.slice((recipientPage - 1) * RECIPIENTS_PER_PAGE, recipientPage * RECIPIENTS_PER_PAGE);

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30">
            {/* Main Content */}
            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header with New Stream Button */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">Stream Dashboard</h1>
                        <p className="text-gray-600 mt-2">Manage your payment streams and recipients</p>
                    </div>
                    <Button
                        onClick={() => setCreateStreamModalOpen(true)}
                        className="bg-gradient-to-r from-green-600 to-blue-600 text-white hover:shadow-lg transition-all px-6 py-3 rounded-xl"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        New Stream
                    </Button>
                </div>

                {/* Modern Tabs */}
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
                    <TabsList className="grid w-full grid-cols-3 bg-white/80 backdrop-blur border border-white/60 rounded-xl p-1">
                        <TabsTrigger value="overview" className="flex items-center gap-2">
                            <Home className="w-4 h-4" />
                            Overview
                        </TabsTrigger>
                        <TabsTrigger value="streams" className="flex items-center gap-2">
                            <Waves className="w-4 h-4" />
                            Streams
                        </TabsTrigger>
                        <TabsTrigger value="recipients" className="flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            Recipients
                        </TabsTrigger>
                    </TabsList>

                    {/* Overview Tab */}
                    <TabsContent value="overview" className="space-y-6">
                        {/* Quick Stats */}
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <Card className="backdrop-blur-md bg-white/80 border border-white/60 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Active Streams</p>
                                            <p className="text-3xl font-bold text-blue-600">{streams.filter(s => s.status === 'active').length}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                                            <Waves className="w-6 h-6 text-blue-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="backdrop-blur-md bg-white/80 border border-white/60 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Total Recipients</p>
                                            <p className="text-3xl font-bold text-green-600">{recipients.length}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                                            <Users className="w-6 h-6 text-green-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="backdrop-blur-md bg-white/80 border border-white/60 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Paused Streams</p>
                                            <p className="text-3xl font-bold text-orange-600">{streams.filter(s => s.status === 'paused').length}</p>
                                        </div>
                                        <div className="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center">
                                            <Pause className="w-6 h-6 text-orange-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="backdrop-blur-md bg-white/80 border border-white/60 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-medium text-gray-600">Monthly Volume</p>
                                            <p className="text-3xl font-bold text-purple-600">
                                                ${streams.reduce((acc, stream) => acc + stream.amount, 0).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                                            <DollarSign className="w-6 h-6 text-purple-600" />
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Recent Activity */}
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            <Card className="backdrop-blur-md bg-white/80 border border-white/60 rounded-2xl shadow-xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-blue-600" />
                                        Recent Streams
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {streams.slice(0, 3).map(stream => (
                                            <div
                                                key={stream.id}
                                                className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-white/40 cursor-pointer hover:bg-white/80 transition-all"
                                                onClick={() => handleStreamClick(stream)}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500/20 to-green-500/20 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-blue-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{stream.name}</p>
                                                        <p className="text-sm text-gray-600">{stream.recipient.name}</p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <p className="font-medium text-gray-900">${stream.amount}</p>
                                                    <Badge variant={stream.status === 'active' ? 'default' : 'secondary'}>
                                                        {stream.status}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            <Card className="backdrop-blur-md bg-white/80 border border-white/60 rounded-2xl shadow-xl">
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="w-5 h-5 text-green-600" />
                                        Recipients
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {recipients.slice(0, 3).map(recipient => (
                                            <div key={recipient.id} className="flex items-center justify-between p-4 bg-white/60 rounded-xl border border-white/40">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-full flex items-center justify-center">
                                                        <User className="w-5 h-5 text-green-600" />
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{recipient.name}</p>
                                                        <p className="text-sm text-gray-600 font-mono">{recipient.walletAddress.slice(0, 8)}...{recipient.walletAddress.slice(-6)}</p>
                                                    </div>
                                                </div>
                                                <Badge variant="outline">{recipient.status}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    {/* Streams Tab */}
                    <TabsContent value="streams" className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search streams or recipients..."
                                    value={streamSearch}
                                    onChange={e => { setStreamSearch(e.target.value); setStreamPage(1); }}
                                    className="w-full max-w-xs bg-white/80 border border-white/40 rounded-xl"
                                />
                            </div>
                            <div className="flex items-center gap-2">
                                <Button onClick={() => setCreateStreamModalOpen(true)} className="bg-gradient-to-r from-green-600 to-blue-600 text-white hover:shadow-lg transition-all">
                                    <Plus className="w-4 h-4 mr-2" /> New Stream
                                </Button>
                            </div>
                        </div>
                        <div className="grid gap-6">
                            {paginatedStreams.map(stream => (
                                <div key={stream.id} className="relative">
                                    <Card
                                        className={`backdrop-blur-md bg-white/80 border border-white/60 rounded-2xl shadow-xl hover:shadow-2xl transition-all cursor-pointer ${expandedStreamId === stream.id ? 'ring-2 ring-blue-400' : ''}`}
                                        onClick={() => setExpandedStreamId(expandedStreamId === stream.id ? null : stream.id)}
                                    >
                                        <CardContent className="p-6 flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-green-500/20 rounded-xl flex items-center justify-center">
                                                    <Waves className="w-6 h-6 text-blue-600" />
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{stream.name}</h3>
                                                    <p className="text-sm text-gray-600">To: {stream.recipient.name}</p>
                                                    <div className="flex items-center gap-4 mt-2">
                                                        <span className="text-sm text-gray-500">${stream.amount}/month</span>
                                                        <Badge variant={stream.status === 'active' ? 'default' : 'secondary'}>{stream.status}</Badge>
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" onClick={e => { e.stopPropagation(); setExpandedStreamId(expandedStreamId === stream.id ? null : stream.id); }}>
                                                {expandedStreamId === stream.id ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                                            </Button>
                                        </CardContent>
                                    </Card>
                                    {expandedStreamId === stream.id && (
                                        <div className="w-full bg-white/90 border border-blue-100 rounded-2xl shadow-xl mt-2 p-0 overflow-hidden">
                                            <StreamingAnimation
                                                isActive={true}
                                                endDate={stream.endDate}
                                                sender={'Your Wallet (0x123...abc)'}
                                                receiver={stream.recipient.walletAddress}
                                                onClose={() => setExpandedStreamId(null)}
                                            />
                                        </div>
                                    )}
                                </div>
                            ))}
                            {paginatedStreams.length === 0 && <div className="text-gray-400 text-center py-8">No streams found.</div>}
                        </div>
                        {/* Pagination Controls */}
                        <div className="flex justify-center mt-6 gap-2">
                            <Button variant="outline" size="sm" disabled={streamPage === 1} onClick={() => setStreamPage(p => Math.max(1, p - 1))}>Prev</Button>
                            <span className="px-2 text-gray-600">Page {streamPage} of {Math.max(1, Math.ceil(filteredStreams.length / STREAMS_PER_PAGE))}</span>
                            <Button variant="outline" size="sm" disabled={streamPage >= Math.ceil(filteredStreams.length / STREAMS_PER_PAGE)} onClick={() => setStreamPage(p => p + 1)}>Next</Button>
                        </div>
                    </TabsContent>

                    {/* Recipients Tab */}
                    <TabsContent value="recipients" className="space-y-6">
                        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
                            <div className="flex-1">
                                <Input
                                    placeholder="Search recipients..."
                                    value={recipientSearch}
                                    onChange={e => { setRecipientSearch(e.target.value); setRecipientPage(1); }}
                                    className="w-full max-w-xs bg-white/80 border border-white/40 rounded-xl"
                                />
                            </div>
                        </div>
                        <div className="grid gap-6">
                            {paginatedRecipients.map(recipient => (
                                <Card key={recipient.id} className="backdrop-blur-md bg-white/80 border border-white/60 rounded-2xl shadow-xl hover:shadow-2xl transition-all">
                                    <CardContent className="p-6 flex items-center justify-between">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-xl flex items-center justify-center">
                                                <User className="w-6 h-6 text-green-600" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-gray-900">{recipient.name}</h3>
                                                <div className="flex items-center gap-2 mt-1">
                                                    <span className="text-sm font-mono text-gray-600">{recipient.walletAddress}</span>
                                                    <Button variant="ghost" size="sm" onClick={() => copyToClipboard(recipient.walletAddress)} className="h-6 w-6 p-0"><Copy className="w-3 h-3" /></Button>
                                                </div>
                                            </div>
                                        </div>
                                        <Badge variant={recipient.status === 'active' ? 'default' : 'secondary'}>{recipient.status}</Badge>
                                    </CardContent>
                                </Card>
                            ))}
                            {paginatedRecipients.length === 0 && <div className="text-gray-400 text-center py-8">No recipients found.</div>}
                        </div>
                        {/* Pagination Controls */}
                        <div className="flex justify-center mt-6 gap-2">
                            <Button variant="outline" size="sm" disabled={recipientPage === 1} onClick={() => setRecipientPage(p => Math.max(1, p - 1))}>Prev</Button>
                            <span className="px-2 text-gray-600">Page {recipientPage} of {Math.max(1, Math.ceil(filteredRecipients.length / RECIPIENTS_PER_PAGE))}</span>
                            <Button variant="outline" size="sm" disabled={recipientPage >= Math.ceil(filteredRecipients.length / RECIPIENTS_PER_PAGE)} onClick={() => setRecipientPage(p => p + 1)}>Next</Button>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>

            {/* Create Stream Modal - Modern Design */}
            <Dialog open={createStreamModalOpen} onOpenChange={setCreateStreamModalOpen}>
                <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-2xl border border-white/60 rounded-3xl shadow-2xl">
                    <DialogHeader className="text-center">
                        <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                            <Waves className="w-8 h-8 text-white" />
                        </div>
                        <DialogTitle className="text-2xl font-semibold text-gray-900">Create New Stream</DialogTitle>
                        <p className="text-gray-600">Set up a new payment stream to your recipient</p>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Progress Steps */}
                        <div className="flex items-center justify-between">
                            {[1, 2, 3].map((step) => (
                                <div key={step} className="flex items-center">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-all ${currentStep >= step
                                        ? 'bg-gradient-to-r from-blue-600 to-green-600 text-white shadow-lg'
                                        : 'bg-gray-200 text-gray-600'
                                        }`}>
                                        {step}
                                    </div>
                                    {step < 3 && (
                                        <div className={`w-20 h-1 mx-3 rounded-full transition-all ${currentStep > step ? 'bg-gradient-to-r from-blue-600 to-green-600' : 'bg-gray-200'
                                            }`} />
                                    )}
                                </div>
                            ))}
                        </div>

                        {/* Step Content */}
                        {currentStep === 1 && (
                            <div className="space-y-6">
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Stream Name</Label>
                                    <Input
                                        placeholder="Enter a descriptive name for your stream"
                                        value={streamConfig.name}
                                        onChange={(e) => setStreamConfig(prev => ({ ...prev, name: e.target.value }))}
                                        className="mt-2 bg-white/80 backdrop-blur border border-white/40 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Description (Optional)</Label>
                                    <Textarea
                                        placeholder="Add a description for this stream"
                                        value={streamConfig.description}
                                        onChange={(e) => setStreamConfig(prev => ({ ...prev, description: e.target.value }))}
                                        className="mt-2 bg-white/80 backdrop-blur border border-white/40 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                                        rows={3}
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Recipient Name</Label>
                                    <Input
                                        placeholder="Recipient's name"
                                        value={streamConfig.recipient?.name || ''}
                                        onChange={e => setStreamConfig(prev => ({ ...prev, recipient: { ...prev.recipient, name: e.target.value, walletAddress: prev.recipient?.walletAddress || '', id: prev.recipient?.id || Date.now().toString(), status: prev.recipient?.status } }))}
                                        className="mt-2 bg-white/80 backdrop-blur border border-white/40 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                                    />
                                </div>
                                <div>
                                    <Label className="text-sm font-medium text-gray-700">Wallet Address</Label>
                                    <Input
                                        placeholder="0x..."
                                        value={streamConfig.recipient?.walletAddress || ''}
                                        onChange={e => setStreamConfig(prev => ({ ...prev, recipient: { ...prev.recipient, name: prev.recipient?.name || '', walletAddress: e.target.value, id: prev.recipient?.id || Date.now().toString(), status: prev.recipient?.status } }))}
                                        className="mt-2 bg-white/80 backdrop-blur border border-white/40 rounded-xl focus:ring-2 focus:ring-blue-500/20 font-mono"
                                    />
                                </div>
                            </div>
                        )}

                        {currentStep === 2 && (
                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Monthly Amount (USDC)</Label>
                                        <Input
                                            type="number"
                                            placeholder="0.00"
                                            value={streamConfig.amount}
                                            onChange={(e) => setStreamConfig(prev => ({ ...prev, amount: e.target.value }))}
                                            className="mt-2 bg-white/80 backdrop-blur border border-white/40 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Duration (days)</Label>
                                        <Input
                                            type="number"
                                            placeholder="30"
                                            value={streamConfig.duration}
                                            onChange={(e) => setStreamConfig(prev => ({ ...prev, duration: e.target.value }))}
                                            className="mt-2 bg-white/80 backdrop-blur border border-white/40 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">Start Date</Label>
                                        <Input
                                            type="date"
                                            value={streamConfig.startDate}
                                            onChange={(e) => setStreamConfig(prev => ({ ...prev, startDate: e.target.value }))}
                                            className="mt-2 bg-white/80 backdrop-blur border border-white/40 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                    <div>
                                        <Label className="text-sm font-medium text-gray-700">End Date</Label>
                                        <Input
                                            type="date"
                                            value={streamConfig.endDate}
                                            onChange={(e) => setStreamConfig(prev => ({ ...prev, endDate: e.target.value }))}
                                            className="mt-2 bg-white/80 backdrop-blur border border-white/40 rounded-xl focus:ring-2 focus:ring-blue-500/20"
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {currentStep === 3 && (
                            <div className="space-y-6">
                                <div className="p-6 bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl border border-blue-200">
                                    <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                                        <CheckCircle className="w-5 h-5" />
                                        Stream Summary
                                    </h4>
                                    <div className="space-y-3 text-sm text-blue-800">
                                        <div className="flex justify-between">
                                            <span>Stream Name:</span>
                                            <span className="font-medium">{streamConfig.name || 'Untitled Stream'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Recipient:</span>
                                            <span className="font-medium">{streamConfig.recipient?.name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Wallet Address:</span>
                                            <span className="font-mono text-xs">{streamConfig.recipient?.walletAddress}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Monthly Amount:</span>
                                            <span className="font-medium">${streamConfig.amount} USDC</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span>Duration:</span>
                                            <span className="font-medium">{streamConfig.duration} days</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
                                    <CheckCircle className="w-5 h-5 text-green-600" />
                                    <div>
                                        <p className="font-medium text-green-900">Auto-start enabled</p>
                                        <p className="text-sm text-green-700">Stream will begin immediately after creation</p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Navigation */}
                        <div className="flex gap-3 pt-6">
                            {currentStep > 1 && (
                                <Button
                                    variant="outline"
                                    onClick={() => setCurrentStep(prev => prev - 1)}
                                    className="flex-1 h-12 rounded-xl border-2"
                                >
                                    <ChevronLeft className="w-4 h-4 mr-2" />
                                    Previous
                                </Button>
                            )}
                            {currentStep < 3 ? (
                                <Button
                                    onClick={() => setCurrentStep(prev => prev + 1)}
                                    className="flex-1 h-12 bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                                >
                                    Next
                                    <ChevronRight className="w-4 h-4 ml-2" />
                                </Button>
                            ) : (
                                <Button
                                    onClick={handleCreateStream}
                                    className="flex-1 h-12 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl shadow-lg hover:shadow-xl transition-all"
                                >
                                    <Waves className="w-4 h-4 mr-2" />
                                    Create Stream
                                </Button>
                            )}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Full Screen Stream Animation */}
            {streamModalOpen && selectedStream && (
                <StreamingAnimation
                    isActive={true}
                    endDate={selectedStream.endDate}
                    sender={'Your Wallet (0x123...abc)'}
                    receiver={selectedStream.recipient.walletAddress}
                    onClose={() => setStreamModalOpen(false)}
                />
            )}
        </div>
    );
} 