import { useMutation } from "@tanstack/react-query";
import { usePrivy } from "@privy-io/react-auth";
import { verifyUser } from "../api/routers/user";

export const useSelfVerify = () => {
    const { user } = usePrivy();

    const { mutate: selfVerify } = useMutation({
        mutationFn: async (accessToken: string) => {
            const response = await verifyUser(user?.wallet?.address || "", accessToken);
            return response;
        },
    });

    return { selfVerify };
};