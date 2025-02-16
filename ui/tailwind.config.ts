import { heroui } from "@heroui/react";
import type { Config } from "tailwindcss";

export default {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            fontSize: {
                tiny: "1rem",
                small: "1.2rem",
                medium: "1.5rem",
                large: "2rem",
            },
            colors: {
                background: "var(--background)",
                foreground: "var(--foreground)",
            },
        },
    },
    darkMode: "class",
    plugins: [
        heroui({
            addCommonColors: true,
            themes: {
                custom: {
                    extend: "light",
                    colors: {
                        secondary: {
                            "50": "#FDF1DB",
                            "100": "#FDF1DB",
                            "200": "#FCE0B7",
                            "300": "#F8C992",
                            "400": "#F1B176",
                            "500": "#E98E4A",
                            "600": "#C86C36",
                            "700": "#A74E25",
                            "800": "#873417",
                            "900": "#6F210E",
                            DEFAULT: "#E98E4A",
                            foreground: "#000000",
                        },
                        primary: {
                            "50": "#EDFDF8",
                            "100": "#EDFDF8",
                            "200": "#DDFBF4",
                            "300": "#C8F4EE",
                            "400": "#B5EAE7",
                            "500": "#9ADBDD",
                            "600": "#70B5BE",
                            "700": "#4D8E9F",
                            "800": "#316980",
                            "900": "#1D4D6A",
                            DEFAULT: "#9ADBDD",
                            foreground: "#000000",
                        },
                    },
                },
            },
        }),
    ],
} satisfies Config;
