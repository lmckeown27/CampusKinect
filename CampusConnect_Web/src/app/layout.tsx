import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CampusKinect - Student Community Hub",
  description: "Connect with your campus community. Share events, find roommates, get tutoring, and more.",
  keywords: "campus, student, community, events, housing, tutoring, university",
  authors: [{ name: "CampusKinect Team" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#2563eb",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        {children}
      </body>
    </html>
  );
}
