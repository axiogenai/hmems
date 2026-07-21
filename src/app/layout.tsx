import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import Script from "next/script";
import React from "react";

import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { siteConfig } from "@/config/site.config";

import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  preload: false,
});

export const viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#FAFAFA",
};

const titleStr = `${siteConfig.schoolName} — ${siteConfig.tagline}`;
const descStr = siteConfig.description;

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.siteUrl),
  title: {
    default: titleStr,
    template: `%s | ${siteConfig.schoolName}`,
  },
  description: descStr,
  keywords: [
    "Holy Mother School",
    "Nagpur English School",
    "Maharashtra SCC School",
    "Admissions 2026-27",
  ],
  authors: [{ name: siteConfig.schoolName }],
  alternates: {
    canonical: siteConfig.siteUrl,
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: titleStr,
    description: descStr,
    url: siteConfig.siteUrl,
    siteName: siteConfig.schoolName,
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: `${siteConfig.siteUrl}${siteConfig.ogImage}`,
        width: 1200,
        height: 630,
        alt: siteConfig.schoolName,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: titleStr,
    description: descStr,
    images: [`${siteConfig.siteUrl}${siteConfig.ogImage}`],
  },
  robots: {
    index: true,
    follow: true,
  },
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  "name": siteConfig.schoolName,
  "url": siteConfig.siteUrl,
  "logo": `${siteConfig.siteUrl}${siteConfig.logo}`,
  "description": siteConfig.description,
  "foundingDate": String(siteConfig.foundedYear),
  "address": {
    "@type": "PostalAddress",
    "streetAddress": siteConfig.address,
    "addressLocality": siteConfig.city,
    "addressRegion": siteConfig.state,
    "postalCode": siteConfig.pincode,
    "addressCountry": "India"
  },
  "telephone": siteConfig.phone,
  "email": siteConfig.email,
  "sameAs": [
    siteConfig.socialLinks.facebook,
    siteConfig.socialLinks.instagram,
    siteConfig.socialLinks.youtube,
    siteConfig.socialLinks.twitter
  ].filter(Boolean)
};

const gaId = (siteConfig as any).gaTrackingId || "G-DEMOTRACKING";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" dir="ltr" className={dmSans.variable} suppressHydrationWarning>
      <head>

        {/* Google Analytics 4 Script */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`}
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', '${gaId}');
          `}
        </Script>
        {/* Injecting Organization Structured Data Schema */}
        <Script id="ld-json" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify(jsonLd)}
        </Script>
      </head>
      <body className="min-h-screen flex flex-col antialiased" suppressHydrationWarning>
        <LayoutWrapper>{children}</LayoutWrapper>
      </body>
    </html>
  );
}
