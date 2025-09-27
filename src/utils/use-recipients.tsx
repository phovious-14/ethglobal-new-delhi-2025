import { useMutation, useQuery } from "@tanstack/react-query";
import { addRecipient, getRecipients } from "@/src/api/routers/user";

export const useRecipients = (privyId: string, accessToken: string) => {

    //create mutation that adds a recipient to the database
    const { mutate: addRecipientMutation, mutateAsync: addRecipientAsync, isPending: isAddingRecipient, isError: isErrorAddingRecipient, isSuccess: isSuccessAddingRecipient } = useMutation({
        mutationFn: async (recipient: {
            privyId: string;
            recipientAddress: string;
            recipientName: string;
            accessToken: string;
        }) => {
            const response = await addRecipient(recipient);
            return response;
        },
        onError: (error) => {
            console.error("Error adding recipient", error);
        },
    });

    const { data: recipients, isLoading: isLoadingRecipients, isError: isErrorLoadingRecipients } = useQuery({
        queryKey: ["recipients", privyId, accessToken],
        queryFn: async () => {
            const response = await getRecipients(privyId, accessToken);
            return response;
        },
    });

    return {
        addRecipientAsync,
        isAddingRecipient,
        isErrorAddingRecipient,
        isSuccessAddingRecipient,
        recipients,
        isLoadingRecipients,
        isErrorLoadingRecipients,
    };
}