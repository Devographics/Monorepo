import "~/stylesheets/main.scss";
import { Metadata } from "next";
import Link from "next/link";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <head />
      <body>
        <div>
          <Link href="/">Back to home</Link>
        </div>
        {children}
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "Devographics Admin",
  description: "Admin app for the Devographics surveys",
  viewport: {
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
  },
  // /app/favicon.ico is automatically used as icon
};
