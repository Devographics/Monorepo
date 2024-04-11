import { initTheme } from "@/lib/theme"
import type React from "react"

/**
 * Initialize dynamic global values such as the theme
 * client-side
 */
export function ClientLayout({ children }: { children: React.ReactNode }) {
    console.log("THEME INIT")
    // TODO: how to avoid the redundancy with [...path].astro setup?
    // https://discord.com/channels/830184174198718474/1019713903481081876/threads/1228011232032849931
    initTheme()
    return <>{children}</>
}