
import { initTheme } from "@/lib/theme"
import type React from "react"

/**
 * Initialize dynamic global values such as the theme
 * client-side
 * 
 * To be loaded using "client:only" to avoid duplicating the side-effect on the server
 * 
 *   // TODO: how to avoid the redundancy with [...path].astro setup?
 *   // https://discord.com/channels/830184174198718474/1019713903481081876/threads/1228011232032849931
 */
export function GlobalClientLayout({ children }: { children: React.ReactNode }) {
    initTheme()
    return <>{children}</>
}