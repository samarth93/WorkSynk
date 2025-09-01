import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/contexts/AuthContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import ErrorBoundary from "@/components/ErrorBoundary";
import NetworkStatus from "@/components/NetworkStatus";
import ClientOnly from "@/components/ClientOnly";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "Workspace App",
  description: "Professional workspace application with chat and video call capabilities",
  keywords: ["workspace", "chat", "collaboration", "video calls", "team communication"],
  authors: [{ name: "Workspace App Team" }],
  creator: "Workspace App",
  openGraph: {
    title: "Workspace App",
    description: "Professional workspace application with chat and video call capabilities",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} antialiased min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-gray-900 dark:to-gray-800`}>
        <ErrorBoundary>
          <ThemeProvider>
            <AuthProvider>
              <ClientOnly>
                <NetworkStatus />
              </ClientOnly>
              {children}
            </AuthProvider>
          </ThemeProvider>
        </ErrorBoundary>
      </body>
    </html>
  );
}
