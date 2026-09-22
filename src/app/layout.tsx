import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#000000",
  viewportFit: "cover",
};

export const metadata: Metadata = {
  metadataBase: new URL("https://www.solashaven.com"),
  title: {
    default: "Solas Haven | The Celestial Sanctuary of Unspoken Words & Silent Prayers",
    template: "%s | Solas Haven",
  },
  description:
    "Solas Haven is a sacred, anonymous digital cosmos where unspoken grief, unsaid goodbyes, secret confessions, and silent prayers ascend into permanent starlight across 195+ nations.",
  applicationName: "Solas Haven",
  keywords: [
    // Brand & Identity
    "solas haven",
    "solashaven",
    "solas haven sanctuary",
    "sanctuary of light",
    "letters to eternity",
    // Letters to Heaven & Grief
    "letters to heaven",
    "letters to heaven online",
    "letters to deceased loved ones",
    "letters to lost loved ones",
    "write to heaven",
    "grief healing",
    "grief healing community",
    "bereavement support online",
    "coping with grief and loss",
    "unspoken grief",
    "child loss memorial",
    "pet loss memorial online",
    "digital memorial wall",
    "online memorial star",
    "grief therapy writing",
    // Unspoken Words & Unsent Letters
    "unsent letters",
    "unsent letters project",
    "unspoken words",
    "unsaid goodbyes",
    "things i never told you",
    "unrequited love letters",
    "letters to my ex",
    "secret confessions",
    "anonymous confession wall",
    "expressive writing healing",
    "emotional catharsis platform",
    // Silent Prayers & Spiritual Healing
    "silent prayers",
    "online prayer wall",
    "anonymous prayer requests",
    "spiritual solace",
    "peaceful sanctuary",
    "432hz sound healing",
    "vagus nerve relaxation",
    "sacred digital space",
  ],
  authors: [{ name: "Solas Haven Sanctuary", url: "https://www.solashaven.com" }],
  creator: "Zaviyan",
  publisher: "Solas Haven",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "https://www.solashaven.com",
  },
  openGraph: {
    title: "Solas Haven | The Celestial Sanctuary of Unspoken Words & Silent Prayers",
    description:
      "Where unspoken grief, unsaid goodbyes, and silent prayers become permanent stars in a living 3D cosmos across 195+ nations.",
    url: "https://www.solashaven.com",
    siteName: "Solas Haven",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Solas Haven | The Celestial Sanctuary of Unspoken Words",
    description:
      "Where unsaid goodbyes, silent prayers, and secret truths become permanent stars in a living cosmos.",
    creator: "@solashaven",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  category: "Emotional & Spiritual Well-being",
};

import Script from "next/script";
import StarCursorTrail from "../components/StarCursorTrail";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Solas Haven",
    "alternateName": ["SolasHaven", "Solas Haven Sanctuary", "Letters to Eternity"],
    "url": "https://www.solashaven.com",
    "description": "The sacred celestial cosmos of unspoken words, silent prayers, and emotional catharsis.",
    "inLanguage": "en-US",
  };

  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "Solas Haven",
    "url": "https://www.solashaven.com",
    "logo": "https://www.solashaven.com/globe.svg",
    "founder": {
      "@type": "Person",
      "name": "Zaviyan",
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "email": "business@zaviyanllc.com",
      "contactType": "Support & Ethics Desk",
    },
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${playfair.variable} dark h-full bg-black text-white antialiased`}
    >
      <head>
        <meta name="google-site-verification" content="google042113ed54845edd" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(orgSchema) }}
        />
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3405098265613384"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full flex flex-col font-sans selection:bg-amber-400/30 selection:text-amber-100 bg-black text-white">
        {/* Google Analytics 4 */}
        <Script
          strategy="afterInteractive"
          src="https://www.googletagmanager.com/gtag/js?id=G-KXYQTHGKCJ"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              window.dataLayer = window.dataLayer || [];
              function gtag(){dataLayer.push(arguments);}
              gtag('js', new Date());
              gtag('config', 'G-KXYQTHGKCJ');
            `,
          }}
        />

        {children}
        {/* Site-wide celestial star cursor trail (all pages) */}
        <StarCursorTrail />
      </body>
    </html>
  );
}