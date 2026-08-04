import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PwaProvider } from "@/components/pwa-registration";
import { ToastProvider } from "@/components/toast-provider";
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  getSiteUrl,
} from "@/utils/seo";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  metadataBase: new URL(getSiteUrl()),
  title: {
    default: SITE_TITLE,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  applicationName: SITE_NAME,
  authors: [{ name: "Codeluxe", url: "https://codeluxe.tech" }],
  creator: "Codeluxe",
  publisher: "Codeluxe",
  category: "health",
  manifest: "/manifest.json",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: SITE_NAME,
  },
};

export const viewport = {
  themeColor: "#0b1f3a",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es-AR"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-[17px] leading-relaxed">
        <PwaProvider>
          <ToastProvider />
          {children}
        </PwaProvider>
      </body>
    </html>
  );
}
