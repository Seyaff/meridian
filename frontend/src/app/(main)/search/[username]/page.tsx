"use client"

import { useRouter } from "next/navigation"
import { useParams } from "next/navigation"

import useUserByUsername from "@/hooks/auth/useGetUserByUsername"
import useCreateConversation from "@/hooks/chat/useCreateConversation"


export default function Username() {
  const router = useRouter()

  const params = useParams()

  const username = params?.username as string
  console.log(username)

  const {
    data: user,
    isPending,
    isError,
  } = useUserByUsername(username)

  const {
    mutate: startConversation,
    isPending: isCreatingConversation,
  } = useCreateConversation()

  const handleStartConversation = () => {
    console.log("bhaiyaa")

    if (!user?.id) return
    console.log("ggg")

    

    startConversation(user.id, {
      onSuccess: (conversation) => {
        console.log(conversation)
        router.push(`/chat/inbox/${conversation.id}`)
      },
    })
  }

 if (isPending) {
  return <main>Loading...</main>
}

if (isError) {
  return <main>Error</main>
}

if (!user) {
  return <main>User not found</main>
}

  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="p-6 rounded-2xl border bg-white shadow-sm">
        <h1 className="text-2xl font-bold">
          {user.name}
        </h1>

        <p className="text-zinc-500">
          @{user.username}
        </p>

        <button
          onClick={handleStartConversation}
          disabled={isCreatingConversation}
          className="mt-5 px-5 py-2 rounded-xl bg-black text-white"
        >
          {isCreatingConversation
            ? "Starting..."
            : "Message"}
        </button>
      </div>
    </main>
  )
}