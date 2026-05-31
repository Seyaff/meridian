import { listConversations } from "@/lib/api/api"
import {useQuery} from "@tanstack/react-query"

export const useGetConversations = () => {
    return useQuery({
        queryKey : ["conversations"],
        queryFn : listConversations
    })
}