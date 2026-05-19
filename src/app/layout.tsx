import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "@/styles/globals.css";
import { RootProviders } from "@/components/providers/root-providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Smart Attendance & Leave Management System",
  description:
    "Advanced facial recognition-based attendance and leave management system for educational institutions",
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#000000" />
        {/* Load face-api models */}
        <script async src="https://cdn.jsdelivr.net/npm/@vladmandic/face-api/dist/face-api.js"></script>
      </head>
      <body className={inter.className}>
        <RootProviders>{children}</RootProviders>
      </body>
    </html>
  );
}
