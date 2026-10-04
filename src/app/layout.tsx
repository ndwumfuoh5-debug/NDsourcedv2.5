import "globals.css";

import { type Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { SWRProvider } from "@/components/SWRProvider";
import { ThemeProvider } from "@/components/ThemeProvider";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "Sourcing | Healthcare Ventures",
  description:
    "Submit your pitch to be considered for healthcare and health-tech investment.",
  icons: "https://zjxnv7e5voftnnlw.public.blob.vercel-storage.com/orgs/voOpL6opTLkHnCpQtivIXrTgWhKCLnyF/images/5e145a36-3ff0-4fff-9915-adb6b8d2c5a1-4b481293-740e-403a-9c76-b942a1dffbaa.png",
  robots: {
    index: false,
    follow: false,
    googleBot: { index: false, follow: false },
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${geistMono.variable} font-sans antialiased`}
    >
      <body className="min-h-screen">
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          <SWRProvider>
            {children}
          </SWRProvider>
          <Toaster richColors />
        </ThemeProvider>
      </body>
    </html>
  );
}