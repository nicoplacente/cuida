import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { PwaRegistration } from "@/components/pwa-registration";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Cuida | Cuidado compartido para familias",
  description:
    "Organiza medicamentos, turnos, tareas y cuidados diarios de tus seres queridos en un solo lugar.",
  applicationName: "Cuida",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Cuida",
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="es"
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col text-[17px] leading-relaxed">
        <PwaRegistration />
        {children}
      </body>
    </html>
  );
}
