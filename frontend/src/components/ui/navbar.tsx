"use client"

import {motion} from "motion/react"

export default function Navbar () {
    return (
        <motion.nav initial={{opacity: 0 , y: -100}} animate={{x:100, opacity:1 , transition : {duration: 1}} } className="max-w-md bg-zinc-300 ">
            this is me

        </motion.nav>
    )


}