// test-mail.ts
import "dotenv/config";
import { sendEmail as send } from "@repo/mail";

async function test() {
	try {
		await send({
			to: process.env.MAIL_USER!,
			subject: "Test Email",
			text: "This is a test email",
			html: "<p>This is a test email</p>",
		});
		console.log("Test email sent successfully!");
	} catch (error) {
		console.error("Failed to send test email:", error);
	}
}

test();
