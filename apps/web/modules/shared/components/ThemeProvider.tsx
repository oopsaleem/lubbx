"use client";

import Script from "next/script";
import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useState,
	useCallback,
	useMemo,
} from "react";

const THEME_STORAGE_KEY = "theme";

export type Theme = "light" | "dark" | "system";
type ResolvedTheme = "light" | "dark";

type ThemeContextValue = {
	theme: Theme;
	resolvedTheme: ResolvedTheme;
	setTheme: (theme: Theme) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function getResolvedTheme(theme: Theme): ResolvedTheme {
	if (theme === "system") {
		return window.matchMedia("(prefers-color-scheme: dark)").matches
			? "dark"
			: "light";
	}
	return theme;
}

function applyThemeClass(resolved: ResolvedTheme) {
	document.documentElement.classList.remove("light", "dark");
	document.documentElement.classList.add(resolved);
}

function getStoredTheme(): Theme {
	if (typeof window === "undefined") return "system";
	return (localStorage.getItem(THEME_STORAGE_KEY) as Theme) ?? "system";
}

const scriptContent = `(function(){try{var t=localStorage.getItem("${THEME_STORAGE_KEY}")||"system";var e=t==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":t;document.documentElement.classList.remove("light","dark");document.documentElement.classList.add(e)}catch(e){}})()`;

export function ThemeScript() {
	return (
		<Script
			id="theme-init"
			strategy="beforeInteractive"
			dangerouslySetInnerHTML={{ __html: scriptContent }}
		/>
	);
}

export function ThemeProvider({
	children,
	defaultTheme = "system",
	enableSystem = true,
}: {
	children: ReactNode;
	defaultTheme?: Theme;
	enableSystem?: boolean;
}) {
	const [theme, setThemeState] = useState<Theme>(defaultTheme);
	const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>("light");
	const [mounted, setMounted] = useState(false);

	useEffect(() => {
		const stored = getStoredTheme();
		const initial = enableSystem ? stored : (stored === "system" ? defaultTheme : stored);
		setThemeState(initial);
		setResolvedTheme(getResolvedTheme(initial));
		applyThemeClass(getResolvedTheme(initial));
		setMounted(true);
	}, [defaultTheme, enableSystem]);

	useEffect(() => {
		if (!enableSystem) return;
		const mq = window.matchMedia("(prefers-color-scheme: dark)");
		const handler = () => {
			if (theme === "system") {
				const resolved = getResolvedTheme("system");
				setResolvedTheme(resolved);
				applyThemeClass(resolved);
			}
		};
		mq.addEventListener("change", handler);
		return () => mq.removeEventListener("change", handler);
	}, [theme, enableSystem]);

	const setTheme = useCallback(
		(newTheme: Theme) => {
			if (typeof window === "undefined") return;
			if (!enableSystem && newTheme === "system") return;
			localStorage.setItem(THEME_STORAGE_KEY, newTheme);
			setThemeState(newTheme);
			const resolved = getResolvedTheme(newTheme);
			setResolvedTheme(resolved);
			applyThemeClass(resolved);
		},
		[enableSystem],
	);

	const value = useMemo(
		() => ({ theme, resolvedTheme, setTheme }),
		[theme, resolvedTheme, setTheme],
	);

	return (
		<ThemeContext.Provider value={value}>
			{children}
		</ThemeContext.Provider>
	);
}

export function useTheme(): ThemeContextValue {
	const ctx = useContext(ThemeContext);
	if (!ctx) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return ctx;
}
