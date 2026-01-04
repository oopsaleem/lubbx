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
		onboardingComplete: boolean;
	}[] = [
		{
			email: "admin@gmail.com",
			name: "Admin",
			isAdmin: true,
			onboardingComplete: false,
		},
		{
			email: "user1@gmail.com",
			name: "User No1",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user2@gmail.com",
			name: "User No2",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user3@gmail.com",
			name: "User No3",
			isAdmin: false,
			onboardingComplete: false,
		},
	];

	accounts.forEach(async (account) => {
		const email = account.email;
		const name = account.name;
		const isAdmin = account.isAdmin;
		const onboardingComplete = account.onboardingComplete;

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
			onboardingComplete,
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
