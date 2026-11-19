import type { Metadata, Viewport } from "next";
import { Nunito, Quicksand } from "next/font/google";
import "./globals.css";
import { LanguageProvider } from "@/lib/i18n/context";
import { OfflineIndicator } from "@/components/OfflineIndicator";
import { AccessibilityToolbar } from "@/components/AccessibilityToolbar";

const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
});

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SchemeSaathi - Find Your Govt Schemes",
  description: "AI-powered assistant to discover and apply for Indian government welfare schemes.",
  manifest: "/manifest.json",
};

export const viewport: Viewport = {
  themeColor: "#2D4A22",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} ${quicksand.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <LanguageProvider>
          <AccessibilityToolbar />
          {children}
          <OfflineIndicator />
        </LanguageProvider>
      </body>
    </html>
  );
}
