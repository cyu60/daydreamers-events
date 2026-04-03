import type { Metadata } from "next";
import { DM_Serif_Display, DM_Sans, DM_Mono } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";

const dmSerif = DM_Serif_Display({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-display",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-body",
});

const dmMono = DM_Mono({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "DayDreamers Events",
  description:
    "Hands-on events in AI, no-code, design, and engineering. Learn by doing with expert instructors.",
  metadataBase: new URL("https://events.daydreamers-academy.com"),
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "DayDreamers",
  },
  other: {
    "mobile-web-app-capable": "yes",
  },
  openGraph: {
    title: "DayDreamers Events — Learn by Doing",
    description:
      "Hands-on events in AI, vibe coding, automation, and engineering. Small groups, expert instructors, real projects.",
    siteName: "DayDreamers Academy",
    url: "https://events.daydreamers-academy.com",
    type: "website",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "DayDreamers Events",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "DayDreamers Events — Learn by Doing",
    description:
      "Hands-on events in AI, vibe coding, automation, and engineering.",
    images: ["/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${dmSerif.variable} ${dmSans.variable} ${dmMono.variable}`}
    >
      <head>
        <meta name="theme-color" content="#2652e6" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className="min-h-screen flex flex-col">
        <script
          dangerouslySetInnerHTML={{
            __html: `if('serviceWorker' in navigator){navigator.serviceWorker.register('/sw.js')}`,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "DayDreamers Academy",
              url: "https://events.daydreamers-academy.com",
              logo: "https://events.daydreamers-academy.com/icon.svg",
              description:
                "Hands-on events in AI, vibe coding, automation, and engineering.",
              sameAs: ["https://www.daydreamers-academy.com"],
            }),
          }}
        />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
