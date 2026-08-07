import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron } from "next/font/google";
import "./globals.css";
import { CssParticles } from "./components/CssParticles";
import { PageTransition } from "./components/page-transition";
import { LangToggle } from "./components/LangToggle";

const orbitron = Orbitron({ subsets: ["latin"], variable: "--font-orbitron" });

const geistSans = Geist({
    variable: "--font-geist-sans",
    subsets: ["latin"],
});

const geistMono = Geist_Mono({
    variable: "--font-geist-mono",
    subsets: ["latin"],
});

export const metadata: Metadata = {
    title: "AiTest Halikov — O'quv markazlari uchun AI nazoratidagi platforma",
    description:
        "AiTest Halikov — O'quvchilar uchun sun'iy intellekt nazorati ostida onlayn test topshirish platformasi. O'quv markazlari uchun bilimni xolis va aniq baholash tizimi.",
    keywords: ["aitest-halikov", "aitest halikov", "aitest", "halikov test"],
    verification: {
        google: "xuh_Bj1w4NoxQDiNuuG1yIVzivjk60L0GcwNe0LKVf8",
    },
    icons: {
        icon: "/logo.png",
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
            className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} h-full antialiased`}
        >
            <body className="min-h-screen relative overflow-x-hidden bg-slate-950 text-slate-200">
                <CssParticles />
                {}
                <LangToggle />
                {}
                <div className="flex-grow flex flex-col relative z-10 w-full h-full">
                    <PageTransition>{children}</PageTransition>
                </div>
            </body>
        </html>
    );
}
