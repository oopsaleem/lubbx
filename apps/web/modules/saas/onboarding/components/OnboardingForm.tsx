"use client";
import { authClient } from "@repo/auth/client";
import { OnboardingStep2 } from "@saas/onboarding/components/OnboardingStep2";
import { useRouter } from "@shared/hooks/router";
import { clearCache } from "@shared/lib/cache";
import { Progress } from "@ui/components/progress";
import { useLocale, useTranslations } from "next-intl";
import { useSearchParams } from "next/navigation";
import { withQuery } from "ufo";
import { OnboardingStep1 } from "./OnboardingStep1";

export function OnboardingForm() {
	const locale = useLocale();
	const t = useTranslations();
	const router = useRouter();
	const searchParams = useSearchParams();

	const stepSearchParam = searchParams.get("step");
	const redirectTo = searchParams.get("redirectTo");
	const onboardingStep = stepSearchParam
		? Number.parseInt(stepSearchParam, 10)
		: 1;

	const setStep = (step: number) => {
		router.replace(
			withQuery(window.location.search ?? "", {
				step,
			}),
		);
	};

	const onCompleted = async () => {
		await authClient.updateUser({
			onboardingComplete: true,
		});

		await clearCache();
		router.replace(redirectTo ?? "/app");
	};

	const steps = [
		{
			component: <OnboardingStep1 onCompleted={() => setStep(2)} />,
		},
		{
			component: <OnboardingStep2 onCompleted={() => onCompleted()} />,
		},
	];

	return (
		<div dir={locale === "ar" ? "rtl" : "ltr"}>
			<h1 className="font-bold text-xl md:text-2xl">
				{onboardingStep === 1
					? t("onboarding.step1.title")
					: t("onboarding.step2.title")}
			</h1>
			<p className="mt-2 mb-6 text-foreground/60">
				{onboardingStep === 1
					? t("onboarding.step1.message")
					: t("onboarding.step2.message")}
			</p>

			{steps.length > 1 && (
				<div className="mb-6 flex items-center gap-3">
					<Progress
						value={(onboardingStep / steps.length) * 100}
						className="h-2"
					/>
					<span className="shrink-0 text-foreground/60 text-xs">
						{t("onboarding.step", {
							step: onboardingStep,
							total: steps.length,
						})}
					</span>
				</div>
			)}

			{steps[onboardingStep - 1].component}
		</div>
	);
}
