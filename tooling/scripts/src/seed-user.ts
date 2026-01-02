import { auth } from "@repo/auth";
import { createUser, createUserAccount, getUserByEmail } from "@repo/database";
import { logger } from "@repo/logs";
// import { nanoid } from "nanoid";

async function main() {
	logger.info("Will seed some users");

	const authContext = await auth.$context;
	// uncomment to randomize generating password.
	// const adminPassword = nanoid(16);
	// const hashedPassword = await authContext.password.hash(adminPassword);

	const adminPassword = "password";
	const hashedPassword = await authContext.password.hash(adminPassword);

	// user1: admin user
	const accounts: {
		email: string;
		name: string;
		isAdmin: boolean;
	}[] = [
		{
			email: "admin@gmail.com",
			name: "Ghamdan Admin",
			isAdmin: true,
		},
		{
			email: "user1@gmail.com",
			name: "user1",
			isAdmin: false,
		},
		{
			email: "user2@gmail.com",
			name: "user2",
			isAdmin: false,
		},
		{
			email: "user3@gmail.com",
			name: "user3",
			isAdmin: false,
		},
	];

	accounts.forEach(async (account) => {
		const email = account.email;
		const name = account.name;
		const isAdmin = account.isAdmin;

		// check if user exists
		const user = await getUserByEmail(email);

		if (user) {
			logger.error("User with this email already exists!");
			return;
		}

		const adminUser = await createUser({
			email,
			name,
			role: isAdmin ? "admin" : "user",
			emailVerified: true,
			onboardingComplete: true,
		});

		if (!adminUser) {
			logger.error("Failed to create user!");
			return;
		}

		await createUserAccount({
			userId: adminUser.id,
			providerId: "credential",
			accountId: adminUser.id,
			hashedPassword,
		});

		logger.success("User created successfully!");
		logger.info(`New user ${email} created! Password: ${adminPassword}`);
	});
}

main();
