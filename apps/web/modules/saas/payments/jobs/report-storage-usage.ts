import { db } from "@repo/database";

async function reportStorageUsage() {
	const stripe = (await import("@repo/payments")).getStripeClient?.();

	if (!stripe) {
		console.error("Stripe client not available");
		return;
	}

	const orgs = await db.organization.findMany({
		where: {
			plan: "FLEX",
			stripeCustomerId: { not: null },
		},
	});

	const today = new Date().toISOString().slice(0, 10);

	for (const org of orgs) {
		if (!org.stripeCustomerId) continue;

		const storageGB = Number(org.storageUsedBytes) / 1_000_000_000;

		try {
			await stripe.billing.meterEvents.create({
				event_name: "storage_usage_gb",
				payload: {
					stripe_customer_id: org.stripeCustomerId,
					value: storageGB.toFixed(4),
				},
				identifier: `${org.id}-${today}`,
			});
			console.log(
				`Reported storage for org ${org.id}: ${storageGB.toFixed(4)} GB`,
			);
		} catch (error) {
			console.error(`Failed to report storage for org ${org.id}:`, error);
		}
	}
}

reportStorageUsage();
