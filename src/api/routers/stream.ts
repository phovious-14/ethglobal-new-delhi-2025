import axios from "axios";
import { env } from "@/src/env.mjs";
import { StopStream } from "@/src/hooks/use-stream";

const baseUrl = env.NEXT_PUBLIC_BACKEND_BASE_URL;

export const createStream = async (stream: {
    payrollName: string;
    senderWalletAddress: string;
    receiverName: string;
    receiverWalletAddress: string;
    amount: string;
    flowRate: string;
    streamStartTime: string;
    accessToken: string;
    streamStartTxHash: string;
    flowRateUnit: string;
    tokenSymbol: "PYUSDx";
    chainId: string;
}) => {
    const url = `${baseUrl}/api/streams/create`;
    try {
        const response = await axios.post(
            url,
            stream,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${stream.accessToken}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error creating stream:", error);
        throw error;
    }
};

export const getStream = async (accessToken: string, walletAddress: string, type: 'sender' | 'receiver', chainId: string) => {
    const url = `${baseUrl}/api/streams/get/${walletAddress}/${type}/${chainId}`;
    try {
        const response = await axios.get(url, {
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${accessToken}`,
            },
        });
        return response.data;
    } catch (error) {
        console.error("Error getting stream:", error);
        throw error;
    }
};

export const stopStream = async (stream: StopStream) => {
    const url = `${baseUrl}/api/streams/stop-stream`;
    try {
        const response = await axios.post(
            url,
            stream,
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${stream.accessToken}`,
                },
            }
        );
        return response.data;
    } catch (error) {
        console.error("Error stopping stream:", error);
        throw error;
    }
};
