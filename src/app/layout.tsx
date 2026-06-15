import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/context/ThemeContext";
import { CarbonProvider } from "@/context/CarbonContext";
import { ToastProvider } from "@/components/ui/Toast";
import OnboardingModal from "@/components/OnboardingModal";
import ErrorBoundary from "@/components/ErrorBoundary";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CarbonWise AI | Premium Carbon Tracker & Sustainability Coach",
  description: "Understand, track, and reduce your carbon footprint with real-time analytics and personalized AI-powered coaching.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 transition-colors duration-300 min-h-screen flex flex-col`}>
        <ErrorBoundary>
          <ThemeProvider>
            <CarbonProvider>
              <ToastProvider>
                {children}
                <OnboardingModal />
              </ToastProvider>
            </CarbonProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
