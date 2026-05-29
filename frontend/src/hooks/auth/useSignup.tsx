import { registerUser } from "@/lib/api/api"
import { useMutation } from "@tanstack/react-query"

export const useSignup = () => {
    return useMutation({
        mutationKey : ["register"],
        mutationFn : registerUser
    })
}