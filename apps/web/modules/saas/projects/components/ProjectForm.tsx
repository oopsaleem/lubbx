"use client";

import { Button } from "@ui/components/button";
import { Input } from "@ui/components/input";
import { Label } from "@ui/components/label";
import { Textarea } from "@ui/components/textarea";
import { useTranslations } from "next-intl";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const projectFormSchema = z.object({
	title: z.string().min(1, "Title is required"),
	description: z.string().optional(),
	address: z.string().optional(),
	price: z.coerce.number().positive().optional(),
});

export type ProjectFormValues = z.infer<typeof projectFormSchema>;

type Props = {
	defaultValues?: Partial<ProjectFormValues>;
	onSubmit: (values: ProjectFormValues) => Promise<void>;
	isLoading?: boolean;
};

export function ProjectForm({ defaultValues, onSubmit, isLoading }: Props) {
	const t = useTranslations();
	const {
		register,
		handleSubmit,
		formState: { errors },
	} = useForm<ProjectFormValues>({
		resolver: zodResolver(projectFormSchema),
		defaultValues: {
			title: "",
			description: "",
			address: "",
			price: undefined,
			...defaultValues,
		},
	});

	return (
		<form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
			<div className="space-y-2">
				<Label htmlFor="title">{t("projects.form.title")}</Label>
				<Input id="title" {...register("title")} />
				{errors.title && (
					<p className="text-sm text-destructive">
						{errors.title.message}
					</p>
				)}
			</div>

			<div className="space-y-2">
				<Label htmlFor="description">
					{t("projects.form.description")}
				</Label>
				<Textarea id="description" {...register("description")} />
			</div>

			<div className="space-y-2">
				<Label htmlFor="address">{t("projects.form.address")}</Label>
				<Input id="address" {...register("address")} />
			</div>

			<div className="space-y-2">
				<Label htmlFor="price">{t("projects.form.price")}</Label>
				<Input
					id="price"
					type="number"
					step="0.01"
					{...register("price")}
				/>
			</div>

			<Button type="submit" loading={isLoading}>
				{defaultValues
					? t("projects.form.update")
					: t("projects.form.create")}
			</Button>
		</form>
	);
}
