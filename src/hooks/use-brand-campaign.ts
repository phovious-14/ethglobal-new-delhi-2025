// import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// import {
//   createCampaign,
//   getCampaignById,
//   getCampaignsByStatus,
//   addCreatorToCampaign,
//   approveCreatorToCampaign,
// } from "@/src/api/routers/campaign";    

// const fetchActiveCampaigns = async (
//   status: string,
//   privyId: string | undefined,
//   accessToken: string | undefined
// ) => {
//   if (!accessToken || !privyId) return null;
//   const brand = await getCampaignsByStatus(status, privyId, accessToken);
//   return brand;
// };

// const addCreator = async (campaignId: string, username: string, name: string, profilePictureUrl: string) => {
//   const campaign: any = await addCreatorToCampaign(campaignId, username, name, profilePictureUrl);
//   return campaign;  
// };

// const fetchCampaignById = async (campaignId: string) => {
//   const campaign = await getCampaignById(campaignId);
//   return campaign;
// };

// const approveCreator = async (campaignId: string, requestId: string) => {
//   const campaign = await approveCreatorToCampaign(campaignId, requestId);
//   return campaign;
// };

// export const useBrandCampaign = ({
//   privyId,
//   accessToken,
//   campaignId
// }:
// {
//   privyId?: string | undefined;
//   accessToken?: string | undefined;
//   campaignId?: string | undefined;
// }) => {
//   const queryClient = useQueryClient();

//   const {
//     mutateAsync: createCampaignMutation,
//     isPending: isCreatingCampaign,
//     error,
//     reset,
//   } = useMutation({
//     mutationFn: (campaign: any) => createCampaign(campaign, privyId || ""),
//     onSuccess: () => {
//       queryClient.invalidateQueries({
//         queryKey: ["get-campaign-by-status", privyId],
//       });
//     },
//     onError: (error) => {
//       console.error("Error creating campaign:", error);
//       reset();
//     },
//   });

//   const { 
//     data: activeCampaigns, 
//     isLoading: isActiveCampaignsLoading, 
//     error: activeCampaignsError,
//     refetch: refetchActiveCampaigns
//   } = useQuery({
//       queryKey: ["get-campaign-by-status", privyId],
//       queryFn: () => fetchActiveCampaigns("true", privyId, accessToken),
//       enabled: !!privyId && !!accessToken,
//     });

//   const { 
//     data: campaignById, 
//     isLoading: isCampaignByIdLoading, 
//     error: campaignByIdError,
//     refetch: refetchCampaignById
//   } = useQuery({
//       queryKey: ["get-campaign-by-id", campaignId],
//       queryFn: () => fetchCampaignById(campaignId || ""), // TODO: check if this is correct
//       enabled: !!campaignId,
//     });

//   const { mutateAsync: addCreatorMutation, isPending: isAddingCreator, error: addCreatorError } = useMutation({
//     mutationFn: ({ campaignId, username, name, profilePictureUrl }: { campaignId: string, username: string, name: string, profilePictureUrl: string }) => addCreator(campaignId, username, name, profilePictureUrl),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["get-campaign-by-id", campaignId] });
//       queryClient.invalidateQueries({ queryKey: ["get-campaign-by-status", privyId] });
//     },
//   });

//   const { mutateAsync: approveCreatorMutation, isPending: isApprovingCreator, error: approveCreatorError } = useMutation({
//     mutationFn: ({ campaignId, requestId }: { campaignId: string, requestId: string }) => approveCreator(campaignId, requestId),
//     onSuccess: () => {
//       queryClient.invalidateQueries({ queryKey: ["get-campaign-by-id", campaignId] });
//       queryClient.invalidateQueries({ queryKey: ["get-campaign-by-status", privyId] });
//     },
//   });
    
//   return {
//     createCampaign: createCampaignMutation,
//     isCreatingCampaign,
//     error,
//     reset,
//     activeCampaigns,
//     isActiveCampaignsLoading,
//     activeCampaignsError,
//     refetchActiveCampaigns,
//     campaignById,
//     isCampaignByIdLoading,
//     campaignByIdError,
//     refetchCampaignById,
//     addCreator: addCreatorMutation,
//     isAddingCreator,
//     addCreatorError,
//     approveCreator: approveCreatorMutation,
//     isApprovingCreator,
//     approveCreatorError,
//   };
// };
