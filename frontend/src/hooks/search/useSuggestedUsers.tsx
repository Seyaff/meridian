import { suggestedUsers } from "@/lib/api/api";
import { useQuery } from "@tanstack/react-query";

export default function useSuggestedUsers ( ) {
    return useQuery({
        queryKey : ["suggested-users"],
        queryFn : suggestedUsers
    })
}