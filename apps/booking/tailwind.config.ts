import type { Config } from "tailwindcss";

const config: Config = {
    darkMode: ["class"],
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
        "./lib/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    theme: {
        container: {
            center: true,
            padding: "2rem",
            screens: {
                "2xl": "1400px",
            },
        },
        extend: {
            colors: {
                brand: {
                    primary: "var(--brand-primary)",
                    secondary: "var(--brand-secondary)",
                    accent: "var(--brand-accent)",
                    background: "var(--brand-background)",
                    surface: "var(--brand-surface)",
                    text: "var(--brand-text)",
                    "text-muted": "var(--brand-text-muted)",
                },
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
                card: {
                    DEFAULT: "hsl(var(--card))",
                    foreground: "hsl(var(--card-foreground))",
                },
                popover: {
                    DEFAULT: "hsl(var(--popover))",
                    foreground: "hsl(var(--popover-foreground))",
                },
                primary: {
                    DEFAULT: "var(--brand-primary)", // Mapped to brand
                    foreground: "var(--brand-background)",
                },
                secondary: {
                    DEFAULT: "var(--brand-secondary)", // Mapped to brand
                    foreground: "var(--brand-background)",
                },
                muted: {
                    DEFAULT: "hsl(var(--muted))",
                    foreground: "hsl(var(--muted-foreground))",
                },
                accent: {
                    DEFAULT: "var(--brand-accent)", // Mapped to brand
                    foreground: "var(--brand-background)",
                },
                destructive: {
                    DEFAULT: "hsl(var(--destructive))",
                    foreground: "hsl(var(--destructive-foreground))",
                },
                border: "hsl(var(--border))",
                input: "hsl(var(--input))",
                ring: "hsl(var(--ring))",
                chart: {
                    "1": "hsl(var(--chart-1))",
                    "2": "hsl(var(--chart-2))",
                    "3": "hsl(var(--chart-3))",
                    "4": "hsl(var(--chart-4))",
                    "5": "hsl(var(--chart-5))",
                },
                luxury: {
                    black: "#030712",
                    gold: "#F4D03F",
                    "deep-blue": "#00BFFF",
                },
            },
            borderRadius: {
                lg: "var(--radius)",
                md: "calc(var(--radius) - 2px)",
                sm: "calc(var(--radius) - 4px)",
            },
            backgroundImage: {
                "gradient-luxury": "var(--gradient-luxury)",
                "gradient-gold": "var(--gradient-gold)",
                "gradient-blue": "var(--gradient-blue)",
                "gradient-subtle": "var(--gradient-subtle)",
            },
            boxShadow: {
                glowGold: "0 0 45px rgba(244,208,63,0.25)",
                glowCyan: "0 0 40px rgba(0,191,255,0.3)",
                panel: "0 0 60px rgba(0,0,0,0.45)",
                "glow-gold": "var(--glow-gold)",
                "glow-blue": "var(--glow-blue)",
                "shadow-luxury": "var(--shadow-luxury)",
            },
            fontFamily: {
                sans: ["var(--font-inter)", "'Inter'", "ui-sans-serif", "system-ui", "sans-serif"],
                display: ["'Chivo'", "'Inter'", "ui-sans-serif", "system-ui"],
                cormorant: ["var(--font-cormorant)", "'Cormorant Garamond'", "serif"],
                poppins: ["var(--font-poppins)", "Poppins", "sans-serif"],
                inter: ["var(--font-inter)", "'Inter'", "sans-serif"],
                orbitron: ["var(--font-orbitron)", "Orbitron", "sans-serif"],
            },
            keyframes: {
                "accordion-down": {
                    from: { height: "0" },
                    to: { height: "var(--radix-accordion-content-height)" },
                },
                "accordion-up": {
                    from: { height: "var(--radix-accordion-content-height)" },
                    to: { height: "0" },
                },
                "fade-in": {
                    "0%": { opacity: "0", transform: "translateY(20px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                "slide-up": {
                    "0%": { opacity: "0", transform: "translateY(40px)" },
                    "100%": { opacity: "1", transform: "translateY(0)" },
                },
                "glow-pulse": {
                    "0%, 100%": { boxShadow: "0 0 20px hsl(var(--luxury-gold) / 0.3)" },
                    "50%": { boxShadow: "0 0 40px hsl(var(--luxury-gold) / 0.5)" },
                },
            },
            animation: {
                "accordion-down": "accordion-down 0.2s ease-out",
                "accordion-up": "accordion-up 0.2s ease-out",
                "fade-in": "fade-in 0.6s ease-out",
                "slide-up": "slide-up 0.6s ease-out",
                "glow-pulse": "glow-pulse 2s ease-in-out infinite",
            },
        },
    },
    plugins: [require("tailwindcss-animate")],
};

export default config;
