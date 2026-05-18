"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useFormErrors } from "@shared/hooks/form-errors";
import { Button } from "@ui/components/button";
import { Form } from "@ui/components/form";
import { ArrowRightIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { z } from "zod";

// 1. Define your form schema
const formSchema = z.object({
	// Add your form fields here
});

type FormValues = z.infer<typeof formSchema>;

export function OnboardingStep2({ onCompleted }: { onCompleted: () => void }) {
	const t = useTranslations();
	const { zodErrorMap } = useFormErrors();
	
	const form = useForm<FormValues>({
		resolver: zodResolver(formSchema, {
			errorMap: zodErrorMap,
		}),
		mode: "onChange",
		reValidateMode: "onChange",
		defaultValues: {
			// Set default values for your form fields here
		},
	});

	const onSubmit = async (_values: FormValues) => {
		try {
			// Handle form submission
			// Update user data if needed
			onCompleted();
		} catch (e) {
			form.setError("root", {
				type: "server",
				message: t("onboarding.notifications.accountSetupFailed"),
			});
		}
	};

	return (
		<Form {...form}>
			<form onSubmit={form.handleSubmit(onSubmit)}>
				{/* forms fields here */}
				<Button type="submit" loading={form.formState.isSubmitting}>
					{t("onboarding.start")}
					<ArrowRightIcon className="ml-2 size-4 rtl:rotate-180" />
				</Button>
			</form>
		</Form>
	);
}
