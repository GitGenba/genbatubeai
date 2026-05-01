import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import Link from "next/link";
import HeaderAuth from "@/components/HeaderAuth";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "YouTube Research Tool",
  description: "Research YouTube competitors by keywords",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col bg-[#0f0f0f]">
          <header className="border-b border-[#1e1e1e] bg-[#0f0f0f]">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
              <Link href="/" className="text-white font-semibold text-sm hover:text-gray-300 transition-colors">
                Research
              </Link>
              <HeaderAuth />
            </div>
          </header>
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
