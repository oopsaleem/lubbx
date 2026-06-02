import { AnalyticsScript } from "@analytics";
import { config } from "@repo/config";
import { ApiClientProvider } from "@shared/components/ApiClientProvider";
import { ConsentBanner } from "@shared/components/ConsentBanner";
import { ConsentProvider } from "@shared/components/ConsentProvider";
import { Toaster } from "@ui/components/toast";
import { cn } from "@ui/lib";
import { GeistSans } from "geist/font/sans";
import { Noto_Sans_Arabic } from "next/font/google";
import { DirectionProviderWrapper } from "@shared/components/DirectionProviderWrapper";
import { Provider as JotaiProvider } from "jotai";
import { ThemeProvider } from "@shared/components/ThemeProvider";
import { cookies } from "next/headers";
import NextTopLoader from "nextjs-toploader";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { PropsWithChildren } from "react";

const notoSansArabic = Noto_Sans_Arabic({
	variable: "--font-noto-sans-arabic",
	subsets: ["arabic"],
	display: "swap",
});

export async function Document({
	children,
	locale,
}: PropsWithChildren<{ locale: string }>) {
	const cookieStore = await cookies();
	const consentCookie = cookieStore.get("consent");
	const direction = locale === "ar" ? "rtl" : "ltr";

	return (
		<html
			lang={locale}
			dir={direction}
			suppressHydrationWarning
			className={cn(
				GeistSans.variable,
				direction === "rtl" && notoSansArabic.variable,
			)}
		>
			<head>
				<script
					id="theme-init"
					dangerouslySetInnerHTML={{
						__html: `(function(){try{var t=localStorage.getItem("theme")||"system";var e=t==="system"?window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light":t;document.documentElement.classList.remove("light","dark");document.documentElement.classList.add(e)}catch(e){}})()`,
					}}
				/>
			</head>
			<body
				suppressHydrationWarning
				className={cn(
					"min-h-screen bg-background text-foreground antialiased",
				)}
			>
				<DirectionProviderWrapper direction={direction}>
					<NuqsAdapter>
						<ConsentProvider
							initialConsent={consentCookie?.value === "true"}
						>
							<NextTopLoader color="var(--color-primary)" />
							<ThemeProvider
								defaultTheme={config.ui.defaultTheme}
							>
								<ApiClientProvider>
									<JotaiProvider>
										{children}
										<Toaster
											position={
												direction === "rtl"
													? "top-left"
													: "top-right"
											}
										/>
									</JotaiProvider>
								</ApiClientProvider>
							</ThemeProvider>
							<ConsentBanner />
							<AnalyticsScript />
						</ConsentProvider>
					</NuqsAdapter>
				</DirectionProviderWrapper>
			</body>
		</html>
	);
}
