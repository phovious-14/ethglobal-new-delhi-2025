import axios from "axios";
import { env } from "@/src/env.mjs";

const baseUrl = env.NEXT_PUBLIC_BACKEND_BASE_URL;

export const createInstant = async (instant: {
    payrollName: string;
    senderWalletAddress: string;
    receiverName: string; 
    receiverWalletAddress: string;
    amount: string; //wie
    accessToken: string;
    chainId: string;
    txHash: string;
    documentUrl: string;
    invoiceNumber: string;
    tokenSymbol: "USDCx" | "USDTx" | "ETHx" | "DAIx" | "PYUSDx";
}) => {
    const url = `${baseUrl}/api/instant/create`;
    try {
        const response = await axios.post(url, instant, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${instant.accessToken}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error creating instant:", error);
        throw error;
    }
}

export const getInstant = async (accessToken: string, walletAddress: string, type: 'sender' | 'receiver', chainId: string) => {
    const url = `${baseUrl}/api/instant/get/${walletAddress}/${type}/${chainId}`;
    try {
        const response = await axios.get(url, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            }
        });
        return response.data;
    } catch (error) {
        console.error("Error getting instant:", error);
        throw error;
    }
}
