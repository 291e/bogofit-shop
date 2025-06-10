import { useQuery } from "@apollo/client";
import { User } from "@/graphql/types";
import { GET_MY_INFO } from "@/graphql/queries";

export function useUser() {
  const { data, loading, error } = useQuery<{ getMyInfo: User }>(GET_MY_INFO);

  return {
    user: data?.getMyInfo,
    loading,
    error,
  };
}
