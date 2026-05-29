import { loginUser } from "@/lib/api/api"
import { useMutation } from "@tanstack/react-query"

export const useLogin = () => {
    return useMutation({
        mutationKey : ["login"],
        mutationFn : loginUser
    })
}