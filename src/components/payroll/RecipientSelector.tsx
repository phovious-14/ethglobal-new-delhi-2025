'use client';

import React, { useMemo, useState, useEffect } from 'react';
import { Button } from '@/src/components/ui/button';
import { Input } from '@/src/components/ui/input';
import { Label } from '@/src/components/ui/label';
import { Card, CardContent } from '@/src/components/ui/card';
import { RecipientCombobox, Recipient } from '@/src/components/ui/combobox';
import { Users, UserPlus, Save } from 'lucide-react';
import { useRecipients } from '@/src/hooks/use-recipients';
import { usePrivy } from '@privy-io/react-auth';
import { useToast } from '@/src/hooks/use-toast';
import { useQueryClient } from '@tanstack/react-query';
import { isAddress } from 'ethers/lib/utils';
import { invalidateUserQueries } from '@/src/utils/queryInvalidation';

interface RecipientSelectorProps {
    formData: {
        receiverName: string;
        walletAddress: string;
    };
    onFormDataChange: (field: 'receiverName' | 'walletAddress', value: string) => void;
    accessToken: string;
}

export const RecipientSelector: React.FC<RecipientSelectorProps> = ({
    formData,
    onFormDataChange,
    accessToken
}) => {
    const { toast } = useToast();
    const queryClient = useQueryClient();
    const { user: privyUser } = usePrivy();

    const [recipientMode, setRecipientMode] = useState<'select' | 'create'>('select');
    const [selectedRecipientId, setSelectedRecipientId] = useState<string>('');
    const [newlyAddedRecipient, setNewlyAddedRecipient] = useState<{ name: string, address: string } | null>(null);
    const [walletAddressError, setWalletAddressError] = useState<string>('');
    const [isDuplicateWallet, setIsDuplicateWallet] = useState<boolean>(false);

    const {
        addRecipientAsync,
        isAddingRecipient,
        recipients,
        isLoadingRecipients,
    } = useRecipients(privyUser?.id || '', accessToken || '');

    // Memoize recipients to prevent unnecessary re-renders
    const availableRecipients: Recipient[] = useMemo(() => {
        if (!recipients || !Array.isArray(recipients)) return [];

        return recipients.map((recipient: any) => ({
            value: recipient._id,
            label: recipient.name,
            description: recipient.walletAddress
        }));
    }, [recipients]);

    // Check for duplicate wallet addresses
    const checkDuplicateWallet = (address: string): boolean => {
        if (!address || !availableRecipients.length) return false;
        const normalizedAddress = address.toLowerCase();
        return availableRecipients.some((recipient: Recipient) =>
            recipient.description.toLowerCase() === normalizedAddress
        );
    };

    // Auto-select newly added recipient when the list updates
    useEffect(() => {
        if (newlyAddedRecipient && availableRecipients.length > 0) {
            const matchingRecipient = availableRecipients.find((r: Recipient) =>
                r.label === newlyAddedRecipient.name && r.description === newlyAddedRecipient.address
            );
            if (matchingRecipient) {
                setSelectedRecipientId(matchingRecipient.value);
                setNewlyAddedRecipient(null); // Clear the tracking
                // Switch to select mode after successful addition
                setRecipientMode('select');
            }
        }
    }, [availableRecipients, newlyAddedRecipient]);

    // Validate wallet address
    const validateWalletAddress = (address: string): boolean => {
        if (!address) {
            setWalletAddressError('');
            setIsDuplicateWallet(false);
            return false;
        }

        if (!isAddress(address)) {
            setWalletAddressError('Please enter a valid Ethereum wallet address');
            setIsDuplicateWallet(false);
            return false;
        }

        // Check for duplicate wallet
        const isDuplicate = checkDuplicateWallet(address);
        setIsDuplicateWallet(isDuplicate);
        if (isDuplicate) {
            setWalletAddressError('This wallet address is already in your recipients list');
            return false;
        }

        setWalletAddressError('');
        setIsDuplicateWallet(false);
        return true;
    };

    const saveRecipient = async () => {
        if (!formData.receiverName || !formData.walletAddress) return;

        // Validate wallet address before saving
        if (!validateWalletAddress(formData.walletAddress)) {
            return;
        }

        // Double-check for duplicates before saving
        if (checkDuplicateWallet(formData.walletAddress)) {
            toast({
                title: "Duplicate wallet address",
                description: "This wallet address is already in your recipients list.",
                variant: "destructive",
            });
            return;
        }

        try {
            const response = await addRecipientAsync({
                privyId: privyUser?.id || '',
                recipientAddress: formData.walletAddress,
                recipientName: formData.receiverName,
                accessToken: accessToken || ''
            });

            if (response) {
                invalidateUserQueries(queryClient);
                toast({
                    title: "Recipient added successfully",
                    description: "The recipient has been added to your list.",
                    variant: "default",
                });

                // Track the newly added recipient for auto-selection
                setNewlyAddedRecipient({
                    name: formData.receiverName,
                    address: formData.walletAddress
                });

                // Clear form data after successful addition
                onFormDataChange('receiverName', '');
                onFormDataChange('walletAddress', '');
            }
        } catch (error) {
            toast({
                title: "Recipient addition failed",
                description: "Please try again.",
                variant: "destructive",
            });
        }
    };

    const handleComboboxRecipientSelect = (value: string) => {
        const recipient = availableRecipients.find((r: Recipient) => r.value === value);
        if (recipient) {
            onFormDataChange('receiverName', recipient.label);
            onFormDataChange('walletAddress', recipient.description);
            setSelectedRecipientId(recipient.value);
        } else {
            // Clear selection if no recipient found
            onFormDataChange('receiverName', '');
            onFormDataChange('walletAddress', '');
            setSelectedRecipientId('');
        }
    };

    const clearSelection = () => {
        onFormDataChange('receiverName', '');
        onFormDataChange('walletAddress', '');
        setSelectedRecipientId('');
    };

    const handleModeSwitch = (mode: 'select' | 'create') => {
        setRecipientMode(mode);

        if (mode === 'select') {
            // When switching to select mode, try to find matching recipient
            if (formData.receiverName && formData.walletAddress) {
                const matchingRecipient = availableRecipients.find((r: Recipient) =>
                    r.label === formData.receiverName && r.description === formData.walletAddress
                );
                if (matchingRecipient) {
                    setSelectedRecipientId(matchingRecipient.value);
                } else {
                    // Clear form if no matching recipient found
                    clearSelection();
                }
            }
        } else {
            // When switching to create mode, clear any selected recipient
            setSelectedRecipientId('');
        }
    };

    return (
        <Card className="bg-white border border-gray-200 rounded-lg shadow-lg shadow-gray-500/10 hover:shadow-xl hover:shadow-gray-500/20 transition-all duration-300 hover:scale-[1.02]">
            <CardContent className="p-3">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center shadow-sm">
                            <Users className="w-3 h-3 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-sm text-gray-900">Recipient</h3>
                        </div>
                    </div>
                    <div className="flex bg-gradient-to-r from-blue-50 to-purple-50 p-1 rounded-lg border border-blue-200/50 shadow-sm">
                        <button
                            onClick={() => handleModeSwitch('select')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${recipientMode === 'select'
                                ? 'bg-white text-blue-700 shadow-md shadow-blue-100/50 border border-blue-200/50'
                                : 'text-gray-600 hover:text-blue-600 hover:bg-white/50'
                                }`}
                        >
                            <Users className={`w-3 h-3 ${recipientMode === 'select' ? 'text-blue-600' : 'text-gray-500'}`} />
                            Existing
                        </button>
                        <button
                            onClick={() => handleModeSwitch('create')}
                            className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-300 ${recipientMode === 'create'
                                ? 'bg-white text-purple-700 shadow-md shadow-purple-100/50 border border-purple-200/50'
                                : 'text-gray-600 hover:text-purple-600 hover:bg-white/50'
                                }`}
                        >
                            <UserPlus className={`w-3 h-3 ${recipientMode === 'create' ? 'text-purple-600' : 'text-gray-500'}`} />
                            New
                        </button>
                    </div>
                </div>

                {/* Recipient Selection Content */}
                {recipientMode === 'select' && availableRecipients.length > 0 ? (
                    <div className="space-y-2">
                        <RecipientCombobox
                            recipients={availableRecipients}
                            value={selectedRecipientId}
                            onValueChange={handleComboboxRecipientSelect}
                            placeholder="Search and select recipient..."
                            searchPlaceholder="Type name or wallet address..."
                            emptyText="No recipients found."
                        />
                        <div className="text-xs text-gray-500 flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            {availableRecipients.length} recipients available
                        </div>
                    </div>
                ) : recipientMode === 'select' ? (
                    <div className="text-xs text-gray-500 flex items-center gap-1">
                        <Users className="w-3 h-3" />
                        No recipients found.
                    </div>
                ) : null}

                {/* Create New Recipient */}
                {recipientMode === 'create' && (
                    <div className="space-y-3">
                        <div className="grid grid-cols-1 gap-2">
                            <div>
                                <Label htmlFor="receiverName" className="text-xs font-medium text-gray-700 mb-1 block">
                                    Full Name
                                </Label>
                                <Input
                                    id="receiverName"
                                    value={formData.receiverName}
                                    onChange={(e) => onFormDataChange('receiverName', e.target.value)}
                                    placeholder="Enter recipient's full name"
                                    className="h-9 rounded-lg border-gray-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all duration-300 text-sm"
                                />
                            </div>
                            <div>
                                <Label htmlFor="walletAddress" className="text-xs font-medium text-gray-700 mb-1 block">
                                    Wallet Address
                                </Label>
                                <Input
                                    id="walletAddress"
                                    value={formData.walletAddress}
                                    onChange={(e) => {
                                        onFormDataChange('walletAddress', e.target.value);
                                        validateWalletAddress(e.target.value);
                                    }}
                                    placeholder="0x..."
                                    className={`h-9 rounded-lg transition-all duration-300 text-sm ${walletAddressError
                                        ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
                                        : 'border-gray-200 focus:border-blue-500 focus:ring-blue-500/20'
                                        }`}
                                />
                                {walletAddressError && (
                                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                                        <span className="w-1 h-1 bg-red-600 rounded-full"></span>
                                        {walletAddressError}
                                    </p>
                                )}
                                {isDuplicateWallet && (
                                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                        <span className="w-1 h-1 bg-orange-600 rounded-full"></span>
                                        This wallet is already in your recipients list. Switch to "Existing" to select it.
                                    </p>
                                )}
                            </div>
                        </div>

                        {(formData.receiverName && formData.walletAddress && !walletAddressError && !isDuplicateWallet) ? (
                            <div className="flex justify-center pt-1">
                                <Button
                                    variant="outline"
                                    onClick={saveRecipient}
                                    className="rounded-lg border-green-200 text-green-600 hover:bg-green-50 transition-all duration-300 text-xs px-3 py-1.5 h-8"
                                    disabled={isAddingRecipient}
                                >
                                    <Save className="w-3 h-3 mr-1" />
                                    Save to Recipients List
                                </Button>
                            </div>
                        ) : null}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}; 