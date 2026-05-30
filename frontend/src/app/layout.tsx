import type { Metadata } from "next";
import { DM_Sans, Instrument_Serif } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/providers/theme-provider";
import QueryProvider from "@/components/providers/querProvider";


import { TooltipProvider } from "@/components/ui/tooltip";
import AuthContextProvider from "@/components/providers/auth-provider";
import { Toaster } from "sonner";

const dmSans = DM_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
  display: 'swap',
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-serif",
  subsets: ["latin"],
  weight: "400",
  display: 'swap',
});

export const metadata: Metadata = {
  title: "Meridian — Chat",
  description: "Thoughtful conversations, without the noise.",
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
      className={` ${dmSans.variable} ${instrumentSerif.variable} h-full`}
    >
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <AuthContextProvider>
            {/* <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            > */}
              <TooltipProvider>{children}</TooltipProvider>
            {/* </ThemeProvider> */}
            <Toaster />
          </AuthContextProvider>
        </QueryProvider>
      </body>
    </html>
  );
}