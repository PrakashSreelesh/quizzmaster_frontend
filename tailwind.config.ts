import type { Config } from "tailwindcss";

const config: Config = {
    content: [
        "./pages/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        extend: {
            colors: {
                primary: "rgb(var(--primary))",
                "primary-foreground": "rgb(var(--primary-foreground))",
                secondary: "rgb(var(--secondary))",
                "secondary-foreground": "rgb(var(--secondary-foreground))",
                muted: "rgb(var(--muted))",
                "muted-foreground": "rgb(var(--muted-foreground))",
                card: "rgb(var(--card))",
                "card-foreground": "rgb(var(--card-foreground))",
                accent: "rgb(var(--accent))",
                "accent-foreground": "rgb(var(--accent-foreground))",
                destructive: "rgb(var(--destructive))",
                "destructive-foreground": "rgb(var(--destructive-foreground))",
                border: "rgb(var(--border))",
                input: "rgb(var(--input))",
                ring: "rgb(var(--ring))",
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                shimmer: "shimmer 1.5s infinite",
            },
        },
    },
    plugins: [],
};
export default config;
