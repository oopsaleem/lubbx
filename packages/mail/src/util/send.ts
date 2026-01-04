import { config } from "@repo/config";
import { logger } from "@repo/logs";
import type { mailTemplates } from "../../emails";
import * as providers from "../provider";
import type { TemplateId } from "./templates";
import { getTemplate } from "./templates";

export async function sendEmail<T extends TemplateId>(
	params: {
		to: string;
		locale?: keyof typeof config.i18n.locales;
	} & (
		| {
				templateId: T;
				context: Omit<
					Parameters<(typeof mailTemplates)[T]>[0],
					"locale" | "translations"
				>;
		  }
		| {
				subject: string;
				text?: string;
				html?: string;
		  }
	),
) {
	const { to, locale = config.i18n.defaultLocale } = params;

	let html: string;
	let text: string;
	let subject: string;

	if ("templateId" in params) {
		const { templateId, context } = params;
		const template = await getTemplate({
			templateId,
			context,
			locale,
		});
		subject = template.subject;
		text = template.text;
		html = template.html;
	} else {
		subject = params.subject;
		text = params.text ?? "";
		html = params.html ?? "";
	}

	const mailProvider = config.mails.mailProvider;

	try {
		if (mailProvider === "nodemailer") {
			await providers.nodemailer({
				to,
				subject,
				text,
				html,
			});
		} else if (mailProvider === "plunk") {
			await providers.plunk({
				to,
				subject,
				text,
				html,
			});
		} else if (mailProvider === "mailgun") {
			await providers.mailgun({
				to,
				subject,
				text,
				html,
			});
		} else if (mailProvider === "resend") {
			await providers.resend({
				to,
				subject,
				text,
				html,
			});
		} else if (mailProvider === "postmark") {
			await providers.postmark({
				to,
				subject,
				text,
				html,
			});
		} else if (mailProvider === "console") {
			console.log({
				to,
				subject,
				text,
				html,
			});
		} else if (mailProvider === "custom") {
			await providers.custom({
				to,
				subject,
				text,
				html,
			});
		} else {
			throw new Error(`Unknown mail provider: ${mailProvider}`);
		}
		return true;
	} catch (e) {
		logger.error(e);
		return false;
	}
}
