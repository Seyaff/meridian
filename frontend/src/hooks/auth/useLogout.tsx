import { logout as logoutApi } from "@/lib/api/api"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

export const useLogout = () => {
    const router = useRouter()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: logoutApi,
    onSuccess: () => {
      
      queryClient.clear() 
      router.replace("/login")
      toast.success("Logged out successfully")
    },
    onError: (error) => {
      console.error("Logout failed:", error)
    }
  })
}