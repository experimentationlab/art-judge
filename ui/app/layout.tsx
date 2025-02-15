import Header from "@/components/Header";
import type { Metadata } from "next";
import { Gamja_Flower } from "next/font/google";

import { Plausible } from "@/components/Plausible";
import { Providers } from "@/providers/Providers";
import "@rainbow-me/rainbowkit/styles.css";
import "./globals.css";

const title = "Scribbl";
const description =
    "Unleash your inner artist with Scribbl! Doodle your way to the top of the global leaderboard. Choose a theme, create your masterpiece, and let our AI judge decide. Join the fun!";
const ogImageUrl = process.env.OG_IMAGE_URL || "";
const twitterImageUrl = process.env.TWT_IMAGE_URL || ogImageUrl;
const webAppBaseUrl = process.env.WEB_APP_BASE_URL ?? "http://localhost:3000";
const appType = "website";

export const metadata: Metadata = {
    title,
    description,
    openGraph: {
        title,
        description,
        type: appType,
        url: webAppBaseUrl,
        siteName: title,
        images: [ogImageUrl],
    },
    twitter: {
        title,
        description,
        site: webAppBaseUrl,
        images: [twitterImageUrl],
        card: "summary",
    },
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
                <Plausible />
                <Providers>
                    <Header />
                    {children}
                </Providers>
            </body>
        </html>
    );
}
