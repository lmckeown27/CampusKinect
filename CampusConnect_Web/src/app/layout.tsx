import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// import CookieConsentProvider from '../components/layout/CookieConsentProvider';
import { NavigationProvider } from '../components/layout/NavigationContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "CampusKinect - Student Community Hub",
  description: "Connect with your campus community. Share events, find roommates, get tutoring, and more.",
  keywords: "campus, student, community, events, housing, tutoring, university",
  authors: [{ name: "CampusKinect Team" }],
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#708d81',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NavigationProvider>
          {children}
          {/* <CookieConsentProvider /> */}
        </NavigationProvider>
      </body>
    </html>
  );
}
