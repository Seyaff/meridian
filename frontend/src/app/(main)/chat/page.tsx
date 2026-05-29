"use client"

import { useSocket } from "@/components/providers/socket-provider"
import { useEffect } from "react"

export default function Chat () {

  const socket = useSocket()

  useEffect(() => {

    function onConnect () {
      console.log("socket")
    }

    socket.on("connect" , onConnect)
  } , [])


  return (
    <main>me</main>
  )
}