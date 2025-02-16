import type { NextConfig } from "next";

const ContentSecurityPolicy = `
  default-src 'self';
  script-src 'self';  
  font-src 'self';
  frame-ancestors 'self' https://app.safe.global;
`;

const nextConfig: NextConfig = {
    reactStrictMode: true,
    async headers() {
        return [
            {
                source: "/((?!api|_next/static|_next/image|favicon.ico).*)",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: `frame-ancestors 'self' https://app.safe.global;`,
                    },
                ],
            },
            {
                source: "/manifest.json",
                headers: [
                    {
                        key: "Content-Security-Policy",
                        value: ContentSecurityPolicy.replace(/\s{2,}/g, " ").trim(),
                    },
                ],
            },
        ];
    },
};

export default nextConfig;
