import { useState } from "react";
import { Button } from "./ui/button";
import { ArrowLeftRight } from "lucide-react";
import { Loader2 } from "lucide-react";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/src/hooks/use-toast";
import { useWallets } from "@privy-io/react-auth";
import { useSigner } from "@/src/hooks/use-signer";
import { useBalances } from "@/src/hooks/use-balances";
import { useQueryClient } from "@tanstack/react-query";
import { ethers } from "ethers";
import { env } from "@/src/env.mjs";
import { getTokenConfig, parseTokenAmount } from "@/src/utils/tokenConfig";
import { useToken } from "@/src/app/context/TokenContext";

export const WrapUnwrapToken = () => {

    const { wallets, ready: walletsReady } = useWallets();
    const { signer } = useSigner(wallets);
    const provider = signer?.provider;
    const { activeSymbol, tokenPair } = useToken();
    const balances = useBalances(activeSymbol);
    const queryClient = useQueryClient();

    const { toast: toastPopup } = useToast();

    // Swap state
    const [swapAmount, setSwapAmount] = useState("");
    const [isSwapping, setIsSwapping] = useState(false);
    const [swapDirection, setSwapDirection] = useState<'native-to-super' | 'super-to-native'>('native-to-super');
    const [isValidating, setIsValidating] = useState(false);
    const [isDiagnosing, setIsDiagnosing] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [validationError, setValidationError] = useState<string | null>(null);
    const [showShake, setShowShake] = useState(false);

    // Validate balance on input change
    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newAmount = e.target.value;
        setSwapAmount(newAmount);

        // Clear validation error if input is empty
        if (!newAmount || parseFloat(newAmount) <= 0) {
            setValidationError(null);
            return;
        }

        const amount = parseFloat(newAmount);

        // Validate balance in real-time
        if (swapDirection === 'native-to-super') {
            const nativeBalance = parseFloat(balances?.nativeToken || '0');
            if (amount > nativeBalance) {
                if (!validationError) {
                    setShowShake(true);
                    setTimeout(() => setShowShake(false), 500);
                }
                setValidationError(`Insufficient balance`);
            } else {
                setValidationError(null);
            }
        } else {
            const superTokenBalance = parseFloat(balances?.superToken || '0');
            if (amount > superTokenBalance) {
                if (!validationError) {
                    setShowShake(true);
                    setTimeout(() => setShowShake(false), 500);
                }
                setValidationError(`Insufficient balance`);
            } else {
                setValidationError(null);
            }
        }
    };

    const handleDirectionChange = () => {
        setSwapDirection(swapDirection === 'native-to-super' ? 'super-to-native' : 'native-to-super');

        // Re-validate current amount with new direction
        if (swapAmount && parseFloat(swapAmount) > 0) {
            const amount = parseFloat(swapAmount);
            const newDirection = swapDirection === 'native-to-super' ? 'super-to-native' : 'native-to-super';

            if (newDirection === 'native-to-super') {
                const nativeBalance = parseFloat(balances?.nativeToken || '0');
                if (amount > nativeBalance) {
                    if (!validationError) {
                        setShowShake(true);
                        setTimeout(() => setShowShake(false), 500);
                    }
                    setValidationError(`Insufficient balance`);
                } else {
                    setValidationError(null);
                }
            } else {
                const superTokenBalance = parseFloat(balances?.superToken || '0');
                if (amount > superTokenBalance) {
                    if (!validationError) {
                        setShowShake(true);
                        setTimeout(() => setShowShake(false), 500);
                    }
                    setValidationError(`Insufficient balance`);
                } else {
                    setValidationError(null);
                }
            }
        } else {
            setValidationError(null);
        }
    };

    const wrapUnwrapToken = async () => {
        if (!signer) return;
        if (!swapAmount || parseFloat(swapAmount) <= 0) {
            setValidationError("Please enter a valid amount greater than 0");
            return;
        }

        // If there's a validation error, don't proceed
        if (validationError) {
            return;
        }

        setIsSwapping(true);

        try {
            const superTokenAddress = tokenPair.superToken.address;

            if (swapDirection === 'native-to-super') {
                if (tokenPair.nativeToken.symbol === 'ETH') {
                    // Wrapping ETH to ETHx (Native Super Token)
                    const superTokenAbi = [
                        'function upgradeByETH() external payable',
                        'function upgradeByETHTo(address to) external payable'
                    ];
                    const superTokenContract = new ethers.Contract(superTokenAddress, superTokenAbi, signer);

                    // Convert amount to wei
                    const amountInWei = ethers.utils.parseEther(swapAmount);

                    // Use upgradeByETH for native ETH to ETHx conversion
                    const upgradeTx = await superTokenContract.upgradeByETH({
                        value: amountInWei
                    });
                    await upgradeTx.wait();

                    toastPopup({
                        title: "Wrap Successful",
                        description: `Successfully wrapped ${swapAmount} ${tokenPair.nativeToken.symbol} to ${tokenPair.superToken.symbol}`,
                    });
                } else {
                    // Wrapping USDC to USDx (ERC20 Super Token)

                    // Get the user's address
                    const userAddress = await signer.getAddress();

                    // Validate input amount
                    if (!swapAmount || parseFloat(swapAmount) <= 0) {
                        throw new Error("Please enter a valid amount greater than 0");
                    }

                    // Convert amount to smallest unit using ethers for precision
                    // For USDC: 1 USDC = 1,000,000 smallest units (6 decimals)
                    const amountInSmallestUnit = ethers.utils.parseUnits(swapAmount, tokenPair.nativeToken.decimals);

                    // Check if amount is zero
                    if (amountInSmallestUnit.isZero()) {
                        throw new Error("Amount cannot be zero. Please enter a valid amount.");
                    }

                    // ERC20 token contract
                    const erc20Address = tokenPair.nativeToken.address;
                    const erc20Abi = ['function approve(address spender, uint256 amount) public returns (bool)'];
                    const erc20Contract = new ethers.Contract(erc20Address, erc20Abi, signer);

                    // Super Token contract
                    const superTokenContractAddress = tokenPair.superToken.address;
                    const superTokenAbi = ['function upgrade(uint256 amount) external'];
                    const superTokenContract = new ethers.Contract(superTokenContractAddress, superTokenAbi, signer);

                    // Approve the Super Token contract to spend ERC20 tokens
                    const approveTx = await erc20Contract.approve(superTokenContractAddress, ethers.utils.parseUnits(swapAmount, tokenPair.nativeToken.decimals));
                    await approveTx.wait();

                    // Upgrade (wrap) ERC20 to Super Token
                    const upgradeTx = await superTokenContract.upgrade(ethers.utils.parseUnits(swapAmount, tokenPair.superToken.decimals));
                    await upgradeTx.wait();

                    toastPopup({
                        title: "Wrap Successful",
                        description: `Successfully wrapped ${swapAmount} ${tokenPair.nativeToken.symbol} to ${tokenPair.superToken.symbol}`,
                    });
                }

                // Invalidate balances cache after successful wrap
                setTimeout(() => {
                    queryClient.invalidateQueries({ queryKey: ['balances', signer?.getAddress?.(), provider?.connection?.url, env.NEXT_PUBLIC_NETWORK, activeSymbol] });
                }, 500); // Wait 0.5 seconds for blockchain confirmation
            } else {
                if (tokenPair.nativeToken.symbol === 'ETH') {
                    // Unwrapping ETHx to ETH (Native Super Token)
                    const superTokenAbi = [
                        'function downgradeToETH(uint256 amount) external'
                    ];
                    const superTokenContract = new ethers.Contract(superTokenAddress, superTokenAbi, signer);

                    // Convert amount to wei
                    const amountInWei = ethers.utils.parseEther(swapAmount);

                    // Use downgradeToETH for ETHx to ETH conversion
                    const downgradeTx = await superTokenContract.downgradeToETH(amountInWei);
                    await downgradeTx.wait();

                    toastPopup({
                        title: "Unwrap Successful",
                        description: `Successfully unwrapped ${swapAmount} ${tokenPair.superToken.symbol} to ${tokenPair.nativeToken.symbol}`,
                    });
                } else {
                    // Unwrapping USDx to USDC (ERC20 Super Token)
                    const superTokenAbi = [
                        'function downgrade(uint256 amount) external'
                    ];
                    const superTokenContract = new ethers.Contract(superTokenAddress, superTokenAbi, signer);

                    // Convert amount to smallest unit using ethers for precision
                    // Super Token has 18 decimals, not 6
                    const amountInSmallestUnit = ethers.utils.parseUnits(swapAmount, tokenPair.superToken.decimals);

                    // Use downgrade for Super Token to ERC20 conversion
                    const downgradeTx = await superTokenContract.downgrade(amountInSmallestUnit);
                    const receipt = await downgradeTx.wait();

                    toastPopup({
                        title: "Unwrap Successful",
                        description: `Successfully unwrapped ${swapAmount} ${tokenPair.superToken.symbol} to ${tokenPair.nativeToken.symbol}`,
                    });
                }

                // Invalidate balances cache after successful unwrap
                setTimeout(() => {
                    queryClient.invalidateQueries({ queryKey: ['balances', signer?.getAddress?.(), provider?.connection?.url, env.NEXT_PUBLIC_NETWORK, activeSymbol] });
                }, 500); // Wait 0.5 seconds for blockchain confirmation
            }

            setIsSwapping(false);
            setSwapAmount("");
        } catch (error) {
            console.error('Wrap/Unwrap error:', error);
            setIsSwapping(false);
            toastPopup({
                title: "Error",
                description: "Failed to wrap/unwrap tokens",
                variant: "destructive"
            });
        }
    }

    return (
        <div className="bg-gradient-to-br from-green-50/90 via-emerald-50/80 to-teal-50/90 rounded-xl p-3 border border-white/80 shadow-lg shadow-green-500/20 backdrop-blur-sm relative overflow-hidden">
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-emerald-500/5 rounded-xl"></div>
            <div className="relative z-10">
                {/* Direction Toggle with Sophisticated Bidirectional Arrow */}
                <div className="flex items-center justify-center px-4 py-1 bg-white/30 rounded-lg border border-white/40">
                    <div className="flex items-center gap-x-4 gap-y-2">
                        <div className="flex flex-col items-center">
                            <span className="text-sm font-medium text-gray-700 mb-1">
                                {swapDirection === 'native-to-super' ? balances?.nativeTokenSymbol || 'ETH' : balances?.superTokenSymbol || 'ETHx'}
                            </span>
                        </div>

                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={handleDirectionChange}
                            className="h-8 w-8 p-0 hover:bg-white/20 transition-all duration-500 rounded-full group relative overflow-hidden"
                            title="Click to change swap direction"
                        >
                            {/* Rotating arrow with gradient background */}
                            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-full group-hover:from-blue-500/20 group-hover:to-purple-500/20 transition-all duration-300"></div>
                            <ArrowLeftRight className={`w-4 h-4 text-gray-600 transition-all duration-500 group-hover:scale-110 ${swapDirection === 'super-to-native' ? 'rotate-180' : ''
                                }`} />
                        </Button>

                        <div className="flex flex-col items-center">
                            <span className="text-sm font-medium text-gray-700 mb-1">
                                {swapDirection === 'native-to-super' ? balances?.superTokenSymbol || 'ETHx' : balances?.nativeTokenSymbol || 'ETH'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Amount Input */}
                <div className={`flex items-center justify-between p-3 bg-white/30 rounded-lg border transition-all duration-300 ${validationError
                    ? 'border-red-300 bg-red-50/20 shadow-sm'
                    : 'border-white/40'
                    } ${showShake ? 'animate-pulse' : ''}`}>
                    <div className="flex flex-col">
                        <span className="text-sm text-gray-600">Amount</span>
                    </div>
                    <input
                        type="number"
                        value={swapAmount}
                        onChange={handleAmountChange}
                        placeholder="0.00"
                        className={`w-24 outline-none text-right text-sm font-bold bg-transparent border-none ring-0 focus:ring-0 placeholder-gray-400 transition-colors duration-300 ${validationError ? 'text-red-700' : 'text-gray-900'
                            }`}
                    />
                </div>

                {/* Validation Error Display */}
                <div className={`mt-2 transition-all duration-300 ease-in-out transform ${validationError
                    ? 'opacity-100 translate-y-0 max-h-20'
                    : 'opacity-0 -translate-y-2 max-h-0 overflow-hidden'
                    }`}>
                    {validationError && (
                        <div className="p-2 bg-red-50 border border-red-200 rounded-lg shadow-sm">
                            <span className="text-sm text-red-600 font-medium flex items-center gap-2">
                                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                </svg>
                                {validationError}
                            </span>
                        </div>
                    )}
                </div>


                {/* Swap Button */}
                <Button
                    onClick={wrapUnwrapToken}
                    disabled={!swapAmount || isSwapping}
                    className={`w-full px-4 py-2 font-medium text-sm rounded-lg text-white shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed ${swapDirection === 'native-to-super'
                        ? 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700'
                        : 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                        }`}
                >
                    {isSwapping ? (
                        <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Swapping...</span>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <ArrowRight className="w-4 h-4" />
                            <span>
                                {swapDirection === 'native-to-super'
                                    ? `Wrap ${balances?.nativeTokenSymbol || 'ETH'} to ${balances?.superTokenSymbol || 'ETHx'}`
                                    : `Unwrap ${balances?.superTokenSymbol || 'ETHx'} to ${balances?.nativeTokenSymbol || 'ETH'}`
                                }
                            </span>
                        </div>
                    )}
                </Button>
            </div>
        </div>
    )
}