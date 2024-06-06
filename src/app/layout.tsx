import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from 'next/link';


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Dota Danger",
  description: "Jeopardy Style Dota Trivia game",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="z-10 w-full h-10 text-center">
        <Link key={'Home'} href={'/'}>
            <span className="font-serif text-5xl text-transparent bg-clip-text bg-gradient-to-b from-zinc-600 via-amber-300 to-amber-950">
              Dota Danger
            </span>
          </Link>
        </div>
        {children}
      </body>
    </html>
  );
}
