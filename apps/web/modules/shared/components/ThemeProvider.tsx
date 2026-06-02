"use client";

import {
	type ReactNode,
	createContext,
	useContext,
	useEffect,
	useRef,
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
	const resolvedRef = useRef(resolvedTheme);
	resolvedRef.current = resolvedTheme;

	useEffect(() => {
		const stored = getStoredTheme();
		const initial = enableSystem
			? stored
			: stored === "system"
				? defaultTheme
				: stored;
		setThemeState(initial);
		const resolved = getResolvedTheme(initial);
		setResolvedTheme(resolved);
		applyThemeClass(resolved);
		setMounted(true);
	}, [defaultTheme, enableSystem]);

	useEffect(() => {
		const observer = new MutationObserver(() => {
			const expected = resolvedRef.current;
			if (!document.documentElement.classList.contains(expected)) {
				applyThemeClass(expected);
			}
		});
		observer.observe(document.documentElement, {
			attributes: true,
			attributeFilter: ["class"],
		});
		return () => observer.disconnect();
	}, []);

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
		<ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
	);
}

export function useTheme(): ThemeContextValue {
	const ctx = useContext(ThemeContext);
	if (!ctx) {
		throw new Error("useTheme must be used within a ThemeProvider");
	}
	return ctx;
}
