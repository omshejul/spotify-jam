import type { Metadata } from "next"
import { Figtree, Geist, Geist_Mono } from "next/font/google"
import Providers from './components/Providers'
import "./globals.css"

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const figtree = Figtree({
  variable: "--font-figtree",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Spotify Jam Links",
  description: "Share and manage Spotify Jam links for different locations",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${figtree.variable} antialiased`}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
