import Header from "@/components/Header";
import type { Metadata } from "next";
import { Gamja_Flower } from "next/font/google";

import { Providers } from "@/providers/Providers";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";

export const metadata: Metadata = {
    title: "Scribbl",
    description: "Unbiased art judge",
};

const gamjamRegular = Gamja_Flower({
    weight: "400",
    style: "normal",
    preload: true,
    subsets: ["latin"],
});

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${gamjamRegular.className} antialiased custom text-foreground bg-background  bg-gradient-to-br from-primary-100 to-secondary-500`}
            >
                <Providers>
                    <Header />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
