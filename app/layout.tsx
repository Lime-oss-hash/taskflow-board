import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClerkProvider } from "@clerk/nextjs";
import SupabaseProvider from "@/lib/supabase/SupabaseProvider";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TaskFlow Board - Modern Task Management",
  description:
    "The visual workspace where teams plan, organize, and collaborate on any project. Simple, flexible, and powerful task management.",

  // Keywords for SEO
  keywords: [
    "task management",
    "project management",
    "kanban board",
    "team collaboration",
    "productivity",
    "workflow",
  ],

  // Open Graph - for Facebook, LinkedIn, Discord link previews
  openGraph: {
    title: "TaskFlow Board - Modern Task Management",
    description:
      "The visual workspace where teams plan, organize, and collaborate on any project.",
    type: "website",
    siteName: "TaskFlow Board",
  },

  // Twitter/X card - for when people share your link
  twitter: {
    card: "summary",
    title: "TaskFlow Board - Modern Task Management",
    description:
      "The visual workspace where teams plan, organize, and collaborate on any project.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en" suppressHydrationWarning>
        <body
          className={`${geistSans.variable} ${geistMono.variable} antialiased`}
          suppressHydrationWarning
        >
          <SupabaseProvider>{children}</SupabaseProvider>
          <SpeedInsights />
        </body>
      </html>
    </ClerkProvider>
  );
}
