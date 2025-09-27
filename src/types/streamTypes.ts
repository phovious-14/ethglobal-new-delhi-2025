export interface CreateStreamProps {    
    streamName: string;
    senderName: string;
    senderWalletAddress: string;
    receiverName: string;
    receiverWalletAddress: string;
    amount: string;
    streamStartTime: string;
    streamEndTime: string;
    documentURL: string;
    accessToken: string;
    flowRate: string;
}

export interface UpdateStreamStatusProps {
    id: string;
    accessToken: string;
    status: string;
    txHash?: string;
}