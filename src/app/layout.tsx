import type { Metadata } from "next";
import { Nunito } from "next/font/google";
import { Providers } from "@/providers";
import "./globals.css";

// Nunito is a variable font (weight axis 200-1000).
const nunito = Nunito({
  variable: "--font-nunito",
  subsets: ["latin"],
  weight: "variable",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000"),
  title: "Syncpair",
  description: "A shared focus and break timer, free forever.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${nunito.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
