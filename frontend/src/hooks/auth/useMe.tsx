import { getUser } from "@/lib/api/api";
import { useQuery } from "@tanstack/react-query";

export const useMe = () => {
  return useQuery({
    queryKey: ["me"],
    queryFn: getUser,
  });
};