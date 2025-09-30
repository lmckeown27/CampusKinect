import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
// import CookieConsentProvider from '../components/layout/CookieConsentProvider';
import { NavigationProvider } from '../components/layout/NavigationContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "CampusKinect - Connect with Your Campus Community",
  description: "Join your university's social network. Find events, roommates, study groups, buy/sell items, get tutoring, and connect with students at your campus. The ultimate student community platform.",
  keywords: [
    "campus social network",
    "university students",
    "college community",
    "student events",
    "campus housing",
    "tutoring services",
    "study groups",
    "student marketplace",
    "campus life",
    "college social app"
  ].join(", "),
  authors: [{ name: "CampusKinect Team" }],
  creator: "CampusKinect",
  publisher: "CampusKinect",
  applicationName: "CampusKinect",
  category: "social",
  classification: "Social Network",
  openGraph: {
    type: "website",
    url: "https://campuskinect.net",
    title: "CampusKinect - Connect with Your Campus Community",
    description: "Join your university's social network. Find events, roommates, study groups, and connect with students at your campus.",
    siteName: "CampusKinect",
    images: [
      {
        url: "https://campuskinect.net/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "CampusKinect - Campus Social Network"
      }
    ],
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "CampusKinect - Connect with Your Campus Community",
    description: "Join your university's social network. Find events, roommates, study groups, and connect with students.",
    images: ["https://campuskinect.net/twitter-image.jpg"],
    creator: "@campuskinect",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    google: "your-google-site-verification-code",
  },
  alternates: {
    canonical: "https://campuskinect.net",
  },
  other: {
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'default',
    'format-detection': 'telephone=no',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#708d81' },
    { media: '(prefers-color-scheme: dark)', color: '#708d81' }
  ],
  colorScheme: 'light',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        
        {/* Favicon and app icons */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Additional mobile optimization */}
        <meta name="format-detection" content="telephone=no, date=no, email=no, address=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="CampusKinect" />
        
        {/* Structured data for search engines */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "CampusKinect",
              "url": "https://campuskinect.net",
              "description": "Campus social network connecting university students through events, housing, tutoring, and community features.",
              "applicationCategory": "SocialNetworkingApplication",
              "operatingSystem": "Web Browser",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "author": {
                "@type": "Organization",
                "name": "CampusKinect Team"
              }
            })
          }}
        />
      </head>
      <body className={inter.className}>
        <NavigationProvider>
          {children}
          {/* <CookieConsentProvider /> */}
        </NavigationProvider>
      </body>
    </html>
  );
}
