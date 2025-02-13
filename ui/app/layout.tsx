import Header from "@/components/Header";
import { gamjaFlowerRegular } from "@/styles/fonts";
import type { Metadata } from "next";
import { headers } from "next/headers";

import { Providers } from "@/providers/Providers";
import { getWalletConfig } from "@/providers/wallet.config";
import { cookieToInitialState } from "wagmi";
import "./globals.css";

export const metadata: Metadata = {
  title: "Coprocessor Exp",
  description: "Unbiased art judge",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookie = (await headers()).get("cookie");
  const initialState = cookieToInitialState(getWalletConfig(), cookie);

  return (
    <html lang="en">
      <body
        className={`${gamjaFlowerRegular.className} antialiased custom text-foreground bg-background  bg-gradient-to-br from-primary-100 to-secondary-500`}
      >
        <Providers initialState={initialState}>
          <Header />
          {children}
        </Providers>
      </body>
    </html>
  );
}
