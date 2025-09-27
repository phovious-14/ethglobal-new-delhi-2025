import { createStream } from "@/src/api/routers/stream";
import { CreateStreamProps } from "@/src/types/streamTypes";
import { useMutation } from "@tanstack/react-query";

const createStreamFunction = async (stream: {
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
    const response = await createStream(stream);
    return response;
}

export const useCreateStream = () => {
    const { mutate: createStream, mutateAsync: createStreamAsync, isPending: isCreatingStream, isError: isErrorCreatingStream, isSuccess: isSuccessCreatingStream } = useMutation({
        mutationFn: (stream: {
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
        }) => createStreamFunction(stream),
        onSuccess: (data) => {
            return data;
        },
        onError: (error) => {
            console.error("error creating stream", error);
        }
    })

    return {
        createStream,
        createStreamAsync,
        isCreatingStream,
        isErrorCreatingStream,
        isSuccessCreatingStream,
    }
}