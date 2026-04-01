import type { Metadata } from "next";
import { Playfair_Display, Inter, Cormorant_Garamond, Source_Serif_4, Spectral } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { MusicProvider } from "@/components/MusicProvider";

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
  display: "swap",
});

const cormorant = Cormorant_Garamond({
  variable: "--font-cormorant",
  subsets: ["latin", "cyrillic"],
  weight: ["600"],
  display: "swap",
});

const sourceSerif4 = Source_Serif_4({
  variable: "--font-source-serif",
  subsets: ["latin", "cyrillic"],
  weight: ["300"],
  display: "swap",
});

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin", "cyrillic"],
  weight: ["200", "300"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "GenNarrative",
  description: "Интерактивная AI-новелла с умным нарратором",
  keywords: ["GenNarrative", "AI", "новелла", "история", "игра"],
  authors: [{ name: "Micropen Team" }],
  icons: {
    icon: [
      { url: "/logo.png", type: "image/png", sizes: "32x32" },
    ],
  },
  openGraph: {
    title: "GenNarrative",
    description: "Интерактивная AI-новелла с умным нарратором",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body
        className={`${playfair.variable} ${inter.variable} ${cormorant.variable} ${sourceSerif4.variable} ${spectral.variable} font-sans antialiased`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <TooltipProvider delayDuration={300}>
            <MusicProvider />
            {children}
            <Toaster />
          </TooltipProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
