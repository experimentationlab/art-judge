import Header from "@/components/Header";
import { gamjaFlowerRegular } from "@/styles/fonts";
import type { Metadata } from "next";

import { Providers } from "@/providers/Providers";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";

export const metadata: Metadata = {
    title: "Coprocessor Exp",
    description: "Unbiased art judge",
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body
                className={`${gamjaFlowerRegular.className} antialiased custom text-foreground bg-background  bg-gradient-to-br from-primary-100 to-secondary-500`}
            >
                <Providers>
                    <Header />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
