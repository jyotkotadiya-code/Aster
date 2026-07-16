import type { Metadata } from "next";
import { Quicksand, Nunito_Sans, JetBrains_Mono } from "next/font/google";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "sonner";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

const quicksand = Quicksand({
  variable: "--font-quicksand",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

const nunito = Nunito_Sans({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["500"],
});

export const metadata: Metadata = {
  title: "Aster - A calmer way to learn",
  description: "Aster is a minimal, aesthetic, and distraction-free learning dashboard for studying from YouTube. Built-in Pomodoro, water reminders, and eye exercises help you build healthy learning habits.",
  keywords: ["Aster", "focused learning", "YouTube study", "calm study space", "Pomodoro timer", "study habit builder"],
  authors: [{ name: "Aster Team" }],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${quicksand.variable} ${nunito.variable} ${jetbrainsMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <ThemeProvider
          attribute="class"
          defaultTheme="bloom-light"
          enableSystem={false}
          themes={["bloom-light", "bloom-dark", "drift-light", "drift-dark"]}
        >
          {children}
          <Toaster richColors position="top-center" theme="system" />
          <SpeedInsights />
        </ThemeProvider>
      </body>
    </html>
  );
}
