import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AiTest — O'quv markazlari uchun AI nazoratidagi onlayn test platformasi",
  description: "O'quvchilar uchun sun'iy intellekt nazorati ostida onlayn test topshirish platformasi. O'quv markazlari uchun bilimni xolis va aniq baholash tizimi.",
  verification: {
    google: "OuRjXr0lK6lZxY7k-Z7QzgPqJxuFh6J58h81AhO4MXs",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
