import { searchUsers } from "@/lib/api/api";
import { useQuery } from "@tanstack/react-query";

export default function useSearchUsers(query: string) {
  return useQuery({
    queryKey: ["search-users", query],
    queryFn: () => searchUsers(query.trim() || undefined),
    staleTime: 30_000,
  });
}
