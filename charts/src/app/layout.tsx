// import './globals.css'
import type { Metadata } from 'next'
// Instantiate server env variables
import '@/config/server'
import '../stylesheets/main.scss'

export const metadata: Metadata = {}

export default function RootLayout({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en">
            <body>
                <main className="container">{children}</main>
            </body>
        </html>
    )
}
