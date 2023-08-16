import './globals.css'
import type { Metadata } from 'next'
// Instantiate server env variables
import '@/config/server'

export const metadata: Metadata = {}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
