import type { Metadata } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { AdSenseScript } from "@/components/AdSense";
import { I18nProvider } from "@/lib/i18n";
import { SITE_URL } from "@/lib/site";

const display = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const OG_TITLE = "Pixly — Free, Private Image Converter (No Upload)";
const OG_DESCRIPTION =
  "Convert HEIC, PNG, JPG and WebP images for free. 100% in your browser — your files never leave your device. No upload, no sign-up.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: OG_TITLE,
    template: "%s",
  },
  description: OG_DESCRIPTION,
  applicationName: "Pixly",
  keywords: [
    "HEIC to JPG",
    "image converter",
    "convert HEIC",
    "compress image",
    "crop image",
    "PNG to JPG",
    "WebP converter",
    "free image converter",
    "이미지 변환",
    "HEIC 변환",
    "사진 용량 줄이기",
  ],
  // og:image and twitter:image are injected automatically from
  // app/opengraph-image.tsx and app/twitter-image.tsx — do not set images here.
  openGraph: {
    type: "website",
    siteName: "Pixly",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    url: "/",
    locale: "ko_KR",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
  },
  // icon.svg / apple-icon.tsx auto-emit the <link> tags; this adds the iOS
  // web-app niceties for home-screen installs.
  appleWebApp: {
    capable: true,
    title: "Pixly",
    statusBarStyle: "default",
  },
};

// Runs before paint so the saved theme applies with no flash.
const THEME_INIT = `(function(){try{var t=localStorage.getItem('pixly-theme');if(t==='dark'||t==='light'){document.documentElement.setAttribute('data-theme',t);}}catch(e){}})();`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${display.variable} ${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-bg text-ink">
        <script dangerouslySetInnerHTML={{ __html: THEME_INIT }} />
        <I18nProvider>
          <SiteHeader />
          {children}
          <SiteFooter />
        </I18nProvider>
        <AdSenseScript />
      </body>
    </html>
  );
}
