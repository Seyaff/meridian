import { fetchUserByUsername } from "@/lib/api/api"
import { useQuery } from "@tanstack/react-query"



export default function useUserByUsername(username: string) {
  return useQuery({
    queryKey: ["user", username],
    queryFn: () => fetchUserByUsername(username),
    enabled: !!username,
  })
}