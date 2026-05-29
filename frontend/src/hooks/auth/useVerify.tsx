import { verifyUserEmail } from "@/lib/api/api"
import { useMutation } from "@tanstack/react-query"

export const useVerify = () => {
    return useMutation({
        mutationKey : ["verify"],
        mutationFn : verifyUserEmail
    })
}