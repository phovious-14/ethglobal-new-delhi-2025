import {
  useQuery,
} from "@tanstack/react-query";
import { getUserByPrivyId } from "@/src/api/routers/user";

const fetchUserByPrivyId = async (
  privyId: string | undefined,
  accessToken: string | undefined,
) => {
  if (!accessToken || !privyId) return null;

  try {
    const user = await getUserByPrivyId(privyId, accessToken);
    return user;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
};

export const useUser = ({
  accessToken,
  userId,
}: {
  accessToken: string | undefined;
  userId: string | undefined;
}) => {
  const {
    data: user,
    isLoading,
    refetch,
    error,
  } = useQuery({
    queryKey: ["user", userId, accessToken],
    queryFn: () => fetchUserByPrivyId(userId, accessToken),
    enabled: !!accessToken && !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: 2,
    retryDelay: 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });

  return {
    user,
    isLoading,
    refetch,
    error,
  };
};
