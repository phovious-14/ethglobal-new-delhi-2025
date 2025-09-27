import React, { useState } from 'react';
import Image from 'next/image';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/src/components/ui/table';
import { Button } from '@/src/components/ui/button';
import { Avatar, AvatarFallback } from '@/src/components/ui/avatar';
import { Badge } from '@/src/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/src/components/ui/tooltip';
import { Dialog, DialogContent, DialogTrigger } from '@/src/components/ui/dialog';
import { Download, ExternalLink, Copy, Waves, CheckCircle, Clock, RefreshCw, AlertCircle, Play, Pause, StopCircle, MoreVertical, Search, Filter, ArrowUpDown, Calendar, DollarSign, Activity, ArrowDown, ArrowUp, X, ChevronDown } from 'lucide-react';
import { formatTokenAmount, getTokenConfig } from '@/src/utils/tokenConfig';
import { getCurrencyLogo } from '@/src/utils/getCurrencyLogo';
import { StreamRecord } from '@/src/hooks/use-records';
import { StreamVisualizer } from '@/src/components/USDCStreamVisualizer';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem } from '@/src/components/ui/dropdown-menu';
import { calculateStreamAmountSimple } from '@/src/utils/calculateStreamAmount';
import { Input } from '@/src/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useChain } from '@/src/app/context/ChainContext';

interface StreamPayrollTableProps {
    records: StreamRecord[];
    isSenderMode: boolean;
    onDownloadInvoice: (record: StreamRecord) => void;
    onCopy: (text: string) => void;
    onViewTx?: (txHash: string) => void;
    uploadInvoiceToIPFS?: (invoice: any) => Promise<any>;
    pendingInvoice?: any;
    accessToken: string;
}

const StreamPayrollTable: React.FC<StreamPayrollTableProps> = ({
    records,
    isSenderMode,
    onDownloadInvoice,
    onCopy,
    onViewTx,
    accessToken,
}) => {
    const { activeChain } = useChain();
    const [selectedStream, setSelectedStream] = useState<StreamRecord | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    // Search, sort, filter state
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'completed' | 'inactive' | 'failed'>('all');
    const [sortBy, setSortBy] = useState<'date' | 'amount' | 'status'>('date');
    const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
    const [showFilters, setShowFilters] = useState(false);
    // Pagination state
    const [currentPage, setCurrentPage] = useState(1);
    const recordsPerPage = 5;

    const getStatusBadge = (streamStatus: string) => {
        switch (streamStatus) {
            case 'active':
                return (
                    <Badge className="bg-gradient-to-r w-full from-blue-500 to-purple-600 text-white border-0 px-2 py-1 rounded-full shadow-sm">
                        <div className="flex items-center w-full">
                            <div className="relative w-full h-1.5 sm:h-2 overflow-hidden">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full h-1 bg-white/30 rounded-full overflow-hidden">
                                        <div className="w-full h-full bg-white rounded-full animate-[flowWave_1.5s_ease-in-out_infinite]"></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <style jsx>{`
                            @keyframes flowWave {
                                0% {
                                    transform: translateX(-100%);
                                    width: 100%;
                                }
                                50% {
                                    transform: translateX(0%);
                                    width: 100%;
                                }
                                100% {
                                    transform: translateX(100%);
                                    width: 100%;
                                }
                            }
                        `}</style>
                    </Badge>
                );
            case 'inactive':
                return (
                    <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-200 border-gray-200 flex items-center gap-1 justify-center text-xs px-2 py-1">
                        <Pause className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span className="hidden sm:inline">Inactive</span>
                        <span className="sm:hidden">Paused</span>
                    </Badge>
                );
            case 'completed':
                return (
                    <Badge className="bg-green-100 text-green-800 hover:bg-green-200 border-green-200 flex items-center gap-1 justify-center text-xs px-2 py-1">
                        <CheckCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span className="hidden sm:inline">Completed</span>
                        <span className="sm:hidden">Done</span>
                    </Badge>
                );
            case 'failed':
                return (
                    <Badge className="bg-red-100 text-red-800 hover:bg-red-200 border-red-200 flex items-center gap-1 justify-center text-xs px-2 py-1">
                        <AlertCircle className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                        <span className="hidden sm:inline">Failed</span>
                        <span className="sm:hidden">Fail</span>
                    </Badge>
                );
            default:
                return null;
        }
    };

    const truncateAddress = (address: string) => {
        return `${address.slice(0, 6)}...${address.slice(-4)}`;
    };

    const formatDateTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

        if (diffInHours < 24) {
            return {
                date: diffInHours < 1 ? 'Just now' : `${Math.floor(diffInHours)}h ago`,
                time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
        } else if (diffInHours < 48) {
            return {
                date: 'Yesterday',
                time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
        } else {
            return {
                date: date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
                time: date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
        }
    };

    const handleRowClick = (record: StreamRecord) => {
        setSelectedStream(record);
        setDialogOpen(true);
    };

    const handleCloseVisualizer = () => {
        setDialogOpen(false);
        setSelectedStream(null);
    };



    // Filter, search, and sort logic
    const filteredRecords = records
        .filter(record => {
            // Status filter
            if (statusFilter !== 'all' && record.streamStatus !== statusFilter) return false;
            // Search filter
            const searchLower = search.toLowerCase();
            const name = isSenderMode ? record.receiverName : record.senderWalletAddress;
            const wallet = isSenderMode ? record.receiverWalletAddress : record.senderWalletAddress;
            return (
                record.payrollName.toLowerCase().includes(searchLower) ||
                name.toLowerCase().includes(searchLower) ||
                wallet.toLowerCase().includes(searchLower)
            );
        })
        .sort((a, b) => {
            if (sortBy === 'date') {
                const aTime = new Date(a.streamStartTime).getTime();
                const bTime = new Date(b.streamStartTime).getTime();
                return sortDir === 'desc' ? bTime - aTime : aTime - bTime;
            } else if (sortBy === 'amount') {
                const aAmt = Number(a.amount);
                const bAmt = Number(b.amount);
                return sortDir === 'desc' ? bAmt - aAmt : aAmt - bAmt;
            } else if (sortBy === 'status') {
                return sortDir === 'desc'
                    ? b.streamStatus.localeCompare(a.streamStatus)
                    : a.streamStatus.localeCompare(b.streamStatus);
            }
            return 0;
        });

    // Pagination logic
    const totalPages = Math.ceil(filteredRecords.length / recordsPerPage);
    const startIndex = (currentPage - 1) * recordsPerPage;
    const endIndex = startIndex + recordsPerPage;
    const paginatedRecords = filteredRecords.slice(startIndex, endIndex);

    // Reset to first page when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [search, statusFilter, sortBy, sortDir]);

    const handlePageChange = (page: number) => {
        setCurrentPage(page);
    };

    return (
        <>
            {/* Collapsible Controls */}
            <div className="bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl sm:rounded-3xl mb-4 sm:mb-6 overflow-hidden">
                {/* Header with Toggle */}
                <div className="flex items-center justify-between p-3 sm:p-4 cursor-pointer hover:bg-gray-50/50 transition-colors duration-200" onClick={() => setShowFilters(!showFilters)}>
                    <div className="flex items-center gap-2 sm:gap-3">
                        <div className="p-1.5 sm:p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg sm:rounded-xl shadow-lg">
                            <Filter className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
                        </div>
                        <div>
                            <h3 className="text-base sm:text-lg font-bold text-gray-900">Search & Filters</h3>
                            <p className="text-xs sm:text-sm text-gray-600">
                                {(search || statusFilter !== 'all') ? `${filteredRecords.length} of ${records.length} records` : 'Click to search and filter records'}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-3">
                        {/* Active Filters Indicator */}
                        {(search || statusFilter !== 'all') && (
                            <div className="flex gap-1">
                                {search && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-blue-500 rounded-full"></div>}
                                {statusFilter !== 'all' && <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-purple-500 rounded-full"></div>}
                            </div>
                        )}
                        <div className={`p-1.5 sm:p-2 rounded-lg sm:rounded-xl transition-transform duration-300 ${showFilters ? 'rotate-180 bg-blue-100' : 'bg-gray-100'}`}>
                            <ChevronDown className="w-4 h-4 sm:w-5 sm:h-5 text-gray-600" />
                        </div>
                    </div>
                </div>

                {/* Collapsible Content */}
                <div className={`transition-all duration-300 ease-in-out ${showFilters ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'}`}>
                    <div className="p-4 sm:p-6 pt-0 border-t border-gray-200">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-4 sm:gap-6">
                            {/* Search Section */}
                            <div className="flex-1">
                                <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                                    <Search className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                                    Search Records
                                </label>
                                <Input
                                    type="text"
                                    placeholder="Search by payroll name, recipient/sender name, or wallet address..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                    className="w-full bg-white/80 border border-white/60 shadow-lg rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-blue-200 focus:border-blue-300 transition-all duration-300 text-xs sm:text-sm"
                                />
                            </div>

                            {/* Filters Section */}
                            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
                                {/* Status Filter */}
                                <div className="min-w-[140px] sm:min-w-[160px]">
                                    <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                                        <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600" />
                                        Status
                                    </label>
                                    <Select value={statusFilter} onValueChange={v => setStatusFilter(v as any)}>
                                        <SelectTrigger className="w-full bg-white/80 border border-white/60 shadow-lg rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-purple-200 focus:border-purple-300 transition-all duration-300 text-xs sm:text-sm">
                                            <SelectValue placeholder="Filter by status" />
                                        </SelectTrigger>
                                        <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl">
                                            <SelectItem value="all" className="hover:bg-blue-50 rounded-xl">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                                                    All Statuses
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="active" className="hover:bg-green-50 rounded-xl">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                    Active Streams
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="completed" className="hover:bg-blue-50 rounded-xl">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                                                    Completed
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="inactive" className="hover:bg-gray-50 rounded-xl">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-gray-500 rounded-full"></div>
                                                    Inactive
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="failed" className="hover:bg-red-50 rounded-xl">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                                                    Failed
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* Sort Controls */}
                                <div className="flex gap-2 sm:gap-3">
                                    <div className="min-w-[120px] sm:min-w-[140px]">
                                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                                            <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4 text-indigo-600" />
                                            Sort By
                                        </label>
                                        <Select value={sortBy} onValueChange={v => setSortBy(v as any)}>
                                            <SelectTrigger className="w-full bg-white/80 border border-white/60 shadow-lg rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-indigo-200 focus:border-indigo-300 transition-all duration-300 text-xs sm:text-sm">
                                                <SelectValue placeholder="Sort by field" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl">
                                                <SelectItem value="date" className="hover:bg-indigo-50 rounded-xl">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-indigo-600" />
                                                        Start Date
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="amount" className="hover:bg-indigo-50 rounded-xl">
                                                    <div className="flex items-center gap-2">
                                                        <DollarSign className="w-4 h-4 text-indigo-600" />
                                                        Amount
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="status" className="hover:bg-indigo-50 rounded-xl">
                                                    <div className="flex items-center gap-2">
                                                        <Activity className="w-4 h-4 text-indigo-600" />
                                                        Status
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className="min-w-[100px] sm:min-w-[120px]">
                                        <label className="block text-xs sm:text-sm font-semibold text-gray-700 mb-1 sm:mb-2 flex items-center gap-1 sm:gap-2">
                                            <ArrowUpDown className="w-3 h-3 sm:w-4 sm:h-4 text-emerald-600" />
                                            Order
                                        </label>
                                        <Select value={sortDir} onValueChange={v => setSortDir(v as any)}>
                                            <SelectTrigger className="w-full bg-white/80 border border-white/60 shadow-lg rounded-xl sm:rounded-2xl focus:ring-2 focus:ring-emerald-200 focus:border-emerald-300 transition-all duration-300 text-xs sm:text-sm">
                                                <SelectValue placeholder="Sort order" />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl">
                                                <SelectItem value="desc" className="hover:bg-emerald-50 rounded-xl">
                                                    <div className="flex items-center gap-2">
                                                        <ArrowDown className="w-4 h-4 text-emerald-600" />
                                                        Newest First
                                                    </div>
                                                </SelectItem>
                                                <SelectItem value="asc" className="hover:bg-emerald-50 rounded-xl">
                                                    <div className="flex items-center gap-2">
                                                        <ArrowUp className="w-4 h-4 text-emerald-600" />
                                                        Oldest First
                                                    </div>
                                                </SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Active Filters Display */}
                        {(search || statusFilter !== 'all') && (
                            <div className="mt-4 sm:mt-6 pt-3 sm:pt-4 border-t border-gray-200">
                                <div className="flex items-center gap-1 sm:gap-2 text-xs sm:text-sm text-gray-600">
                                    <Filter className="w-3 h-3 sm:w-4 sm:h-4" />
                                    Active filters:
                                </div>
                                <div className="flex flex-wrap gap-1 sm:gap-2 mt-1 sm:mt-2">
                                    {search && (
                                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
                                            Search: "{search}"
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0 ml-1 hover:bg-blue-200"
                                                onClick={() => setSearch('')}
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </Badge>
                                    )}
                                    {statusFilter !== 'all' && (
                                        <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
                                            Status: {statusFilter}
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-4 w-4 p-0 ml-1 hover:bg-purple-200"
                                                onClick={() => setStatusFilter('all')}
                                            >
                                                <X className="w-3 h-3" />
                                            </Button>
                                        </Badge>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Quick Actions */}
                        <div className="mt-3 sm:mt-4 flex items-center justify-between">
                            <span className="text-xs sm:text-sm text-gray-600">
                                Showing <span className="font-semibold text-gray-900">{filteredRecords.length}</span> of <span className="font-semibold text-gray-900">{records.length}</span> records
                            </span>
                            <div className="flex gap-1 sm:gap-2">
                                {(search || statusFilter !== 'all') && (
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => {
                                            setSearch('');
                                            setStatusFilter('all');
                                        }}
                                        className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-xs"
                                    >
                                        <RefreshCw className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                        <span className="hidden sm:inline">Clear all</span>
                                        <span className="sm:hidden">Clear</span>
                                    </Button>
                                )}
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => setShowFilters(false)}
                                    className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 text-xs"
                                >
                                    <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                    Close
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div className="rounded-xl overflow-hidden">
                <div className="h-full flex flex-col">
                    <Table className="h-full w-full">
                        <TableHeader>
                            <TableRow className="bg-gradient-to-r from-slate-50 via-blue-50/50 to-indigo-50/50 backdrop-blur-sm border-b border-slate-200 rounded-t-xl sticky top-0 z-10">
                                <TableHead className="w-8 sm:w-12 text-xs">#</TableHead>
                                <TableHead className="font-sans font-semibold text-gray-700 uppercase text-xs tracking-wide px-2 sm:px-4">Payroll Name</TableHead>
                                <TableHead className="font-sans font-semibold text-gray-700 uppercase text-xs tracking-wide px-2 sm:px-4">{isSenderMode ? 'Receiver' : 'Sender'} & Wallet</TableHead>
                                <TableHead className="font-sans font-semibold text-gray-700 uppercase text-xs tracking-wide px-2 sm:px-4">Amount</TableHead>
                                <TableHead className="font-sans font-semibold text-gray-700 uppercase text-xs tracking-wide px-2 sm:px-4">Flowrate Unit</TableHead>
                                <TableHead className="font-sans font-semibold text-gray-700 uppercase text-xs tracking-wide px-2 sm:px-4">Token</TableHead>
                                {/* Status and date columns */}
                                <TableHead className="font-sans font-semibold text-gray-700 uppercase text-xs tracking-wide px-2 sm:px-4">Status</TableHead>
                                <TableHead className="font-sans font-semibold text-gray-700 uppercase text-xs tracking-wide px-2 sm:px-4">Start Date</TableHead>
                                {records.some(r => r.streamStatus === 'completed') && (
                                    <>
                                        <TableHead className="font-sans font-semibold text-gray-700 uppercase text-xs tracking-wide px-2 sm:px-4">End Date</TableHead>
                                        <TableHead className="font-sans font-semibold text-gray-700 uppercase text-xs tracking-wide px-2 sm:px-4">Total Sent</TableHead>
                                    </>
                                )}
                                <TableHead className="font-sans font-semibold text-gray-700 uppercase text-xs tracking-wide px-2 sm:px-4">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {paginatedRecords
                                .map((record, index) => (
                                    <TableRow
                                        key={record._id}
                                        className={`hover:bg-gradient-to-r hover:from-blue-50 hover:to-indigo-50 transition-all duration-300 ${index % 2 === 0 ? 'bg-white' : 'bg-slate-50/30'} cursor-pointer`}
                                        onClick={() => handleRowClick(record)}
                                    >
                                        <TableCell className="px-2 sm:px-4">{startIndex + index + 1}</TableCell>
                                        <TableCell className="px-2 sm:px-4">
                                            <div className="font-sans font-semibold text-slate-700 text-xs sm:text-sm leading-tight">
                                                {record.payrollName}
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-2 sm:px-4">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <Avatar className="h-6 w-6 sm:h-8 sm:w-8 rounded-lg">
                                                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-purple-600 text-white text-xs rounded-lg">
                                                        {record.receiverName.split(' ').map(n => n[0]).join('')}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="text-slate-700 text-xs sm:text-sm font-sans font-medium">{record.receiverName}</div>
                                                    <div className="text-xs text-slate-500 flex items-center gap-1 sm:gap-2 font-sans font-medium">
                                                        {truncateAddress(isSenderMode ? record.receiverWalletAddress : record.senderWalletAddress)}
                                                        <TooltipProvider>
                                                            <Tooltip>
                                                                <TooltipTrigger asChild>
                                                                    <Button
                                                                        variant="ghost"
                                                                        size="sm"
                                                                        className="h-4 w-4 sm:h-5 sm:w-5 p-0 hover:bg-gray-100"
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            onCopy(isSenderMode ? record.receiverWalletAddress : record.senderWalletAddress);
                                                                        }}
                                                                    >
                                                                        <Copy className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                                                                    </Button>
                                                                </TooltipTrigger>
                                                                <TooltipContent>
                                                                    <p>Copy address</p>
                                                                </TooltipContent>
                                                            </Tooltip>
                                                        </TooltipProvider>
                                                    </div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-2 sm:px-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-heading font-semibold text-sm sm:text-base text-slate-800 tracking-tight">
                                                    {formatTokenAmount(record.amount?.toString() || '0', getTokenConfig(activeChain.chainId).superToken.decimals)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-2 sm:px-4">
                                            <div className="flex items-center gap-2">
                                                <span className="font-sans font-semibold text-xs sm:text-sm text-slate-700">
                                                    / {record.flowRateUnit}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-2 sm:px-4">
                                            <div className="flex items-center gap-2 sm:gap-3">
                                                <Image src={getCurrencyLogo(record.tokenSymbol)} alt="Currency Logo" width={16} height={16} className="w-4 h-4 sm:w-5 sm:h-5 lg:w-5 lg:h-5 rounded-full" />
                                            </div>
                                        </TableCell>
                                        {/* Status and date columns */}
                                        <TableCell className="px-2 sm:px-4">
                                            {getStatusBadge(record.streamStatus)}
                                        </TableCell>
                                        <TableCell className="px-2 sm:px-4">
                                            <div className="flex flex-col">
                                                <span className="font-sans font-medium text-xs sm:text-sm text-slate-700">
                                                    {new Date(record.streamStartTime).toLocaleDateString()}
                                                </span>
                                                <span className="text-xs text-slate-500">
                                                    {new Date(record.streamStartTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </TableCell>
                                        {records.some(r => r.streamStatus === 'completed') && (
                                            record.streamStatus === 'completed' ? (
                                                <>
                                                    <TableCell className="px-2 sm:px-4">
                                                        <div className="flex flex-col">
                                                            <span className="font-sans font-medium text-xs sm:text-sm text-slate-700">
                                                                {record.streamEndTime ? new Date(record.streamEndTime).toLocaleDateString() : '-'}
                                                            </span>
                                                            <span className="text-xs text-slate-500">
                                                                {record.streamEndTime ? new Date(record.streamEndTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-'}
                                                            </span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-2 sm:px-4">
                                                        <span className="text-xs sm:text-sm">
                                                            {calculateStreamAmountSimple(record.flowRate, new Date(record.streamStartTime), new Date(record.streamEndTime), activeChain.chainId).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 8 })}
                                                        </span>
                                                    </TableCell>
                                                </>
                                            ) : (
                                                <>
                                                    <TableCell className="px-2 sm:px-4" />
                                                    <TableCell className="px-2 sm:px-4" />
                                                </>
                                            )
                                        )}
                                        <TableCell className="px-2 sm:px-4">
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button size="icon" variant="ghost" className="h-6 w-6 sm:h-8 sm:w-8 p-0 flex items-center justify-center">
                                                        <MoreVertical className="h-4 w-4 sm:h-5 sm:w-5 text-slate-600" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={e => {
                                                            e.stopPropagation();
                                                            onDownloadInvoice(record);
                                                        }}
                                                        className="flex items-center gap-2"
                                                    >
                                                        <Download className="h-4 w-4" /> Download Invoice
                                                    </DropdownMenuItem>
                                                    {record.streamStartTxHash && onViewTx && (
                                                        <DropdownMenuItem
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                onViewTx(record.streamStartTxHash);
                                                            }}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <ExternalLink className="h-4 w-4" /> Start Tx
                                                        </DropdownMenuItem>
                                                    )}
                                                    {record?.streamStoppedTxHash && onViewTx && (
                                                        <DropdownMenuItem
                                                            onClick={e => {
                                                                e.stopPropagation();
                                                                onViewTx(record?.streamStoppedTxHash || '');
                                                            }}
                                                            className="flex items-center gap-2"
                                                        >
                                                            <ExternalLink className="h-4 w-4" /> End Tx
                                                        </DropdownMenuItem>
                                                    )}
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </TableCell>
                                    </TableRow>
                                ))}
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* Pagination Controls */}
            {totalPages > 1 && (
                <div className="mt-4 sm:mt-6 bg-white/95 backdrop-blur-xl border border-white/60 shadow-2xl rounded-2xl sm:rounded-3xl p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                            <span className="text-xs sm:text-sm text-gray-600">
                                Showing <span className="font-semibold text-gray-900">{startIndex + 1}</span> to <span className="font-semibold text-gray-900">{Math.min(endIndex, filteredRecords.length)}</span> of <span className="font-semibold text-gray-900">{filteredRecords.length}</span> records
                            </span>
                            <span className="text-xs sm:text-sm text-gray-500">
                                Page <span className="font-semibold text-gray-900">{currentPage}</span> of <span className="font-semibold text-gray-900">{totalPages}</span>
                            </span>
                        </div>

                        <div className="flex items-center gap-1 sm:gap-2">
                            {/* Previous Page Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/80 border border-white/60 shadow-lg rounded-lg sm:rounded-xl hover:bg-white hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                            >
                                <ChevronLeft className="w-3 h-3 sm:w-4 sm:h-4" />
                                <span className="hidden sm:inline">Previous</span>
                                <span className="sm:hidden">Prev</span>
                            </Button>

                            {/* Page Numbers */}
                            <div className="flex items-center gap-0.5 sm:gap-1">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                                    // Show first page, last page, current page, and pages around current
                                    const shouldShow =
                                        page === 1 ||
                                        page === totalPages ||
                                        Math.abs(page - currentPage) <= 1;

                                    if (!shouldShow) {
                                        // Show ellipsis if there's a gap
                                        if (page === currentPage - 2 || page === currentPage + 2) {
                                            return (
                                                <span key={`ellipsis-${page}`} className="px-1 sm:px-2 text-gray-400 text-xs sm:text-sm">
                                                    ...
                                                </span>
                                            );
                                        }
                                        return null;
                                    }

                                    return (
                                        <Button
                                            key={page}
                                            variant={currentPage === page ? "default" : "outline"}
                                            size="sm"
                                            onClick={() => handlePageChange(page)}
                                            className={`w-8 h-8 sm:w-10 sm:h-10 p-0 rounded-lg sm:rounded-xl transition-all duration-300 text-xs sm:text-sm ${currentPage === page
                                                ? 'bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-lg hover:shadow-xl'
                                                : 'bg-white/80 border border-white/60 shadow-lg hover:bg-white hover:shadow-xl'
                                                }`}
                                        >
                                            {page}
                                        </Button>
                                    );
                                })}
                            </div>

                            {/* Next Page Button */}
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="flex items-center gap-1 sm:gap-2 px-2 sm:px-3 py-1.5 sm:py-2 bg-white/80 border border-white/60 shadow-lg rounded-lg sm:rounded-xl hover:bg-white hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed text-xs sm:text-sm"
                            >
                                <span className="hidden sm:inline">Next</span>
                                <span className="sm:hidden">Next</span>
                                <ChevronRight className="w-3 h-3 sm:w-4 sm:h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* USDC Stream Visualizer Dialog */}
            <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogContent className="max-w-7xl h-[700px] p-0 border-0 bg-transparent rounded-3xl">
                    {selectedStream && (
                        <div className="relative">
                            {/* Dialog Title */}
                            <div className="absolute top-4 left-4 z-10">
                                <h2 className="text-xl font-bold text-black backdrop-blur-sm px-4 py-2 rounded-lg">
                                    {selectedStream.payrollName}
                                </h2>
                            </div>
                            <StreamVisualizer
                                id={selectedStream._id}
                                accessToken={accessToken}
                                payrollName={selectedStream.payrollName}
                                sender={{
                                    address: selectedStream.senderWalletAddress,
                                    name: isSenderMode ? 'You' : selectedStream.payrollName
                                }}
                                receiver={{
                                    address: selectedStream.receiverWalletAddress,
                                    name: selectedStream.receiverName
                                }}
                                startDate={new Date(selectedStream.streamStartTime)}
                                amount={selectedStream.flowRate}
                                isActive={selectedStream.streamStatus === 'active'}
                                isCompleted={selectedStream.streamStatus === 'completed'}
                                onClose={handleCloseVisualizer}
                                flowRateUnit={selectedStream.flowRateUnit as 'hour' | 'day' | 'week' | 'month'}
                                endDate={selectedStream.streamEndTime ? new Date(selectedStream.streamEndTime) : undefined}
                            />
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </>
    );
};

export default StreamPayrollTable; 