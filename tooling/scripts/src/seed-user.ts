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
			name: "User No01",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user2@gmail.com",
			name: "User No02",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user3@gmail.com",
			name: "User No03",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user4@gmail.com",
			name: "User No04",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user5@gmail.com",
			name: "User No05",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user6@gmail.com",
			name: "User No06",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user7@gmail.com",
			name: "User No07",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user8@gmail.com",
			name: "User No08",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user9@gmail.com",
			name: "User No09",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user10@gmail.com",
			name: "User No10",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user11@gmail.com",
			name: "User No11",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user12@gmail.com",
			name: "User No12",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user13@gmail.com",
			name: "User No13",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user14@gmail.com",
			name: "User No14",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user15@gmail.com",
			name: "User No15",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user16@gmail.com",
			name: "User No16",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user17@gmail.com",
			name: "User No17",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user18@gmail.com",
			name: "User No18",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user19@gmail.com",
			name: "User No19",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user20@gmail.com",
			name: "User No20",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user21@gmail.com",
			name: "User No21",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user22@gmail.com",
			name: "User No22",
			isAdmin: false,
			onboardingComplete: false,
		},
		{
			email: "user23@gmail.com",
			name: "User No23",
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
	});
	logger.success("Users created successfully!");
}

main();
