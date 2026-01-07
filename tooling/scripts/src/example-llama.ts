// simple-test-llama.ts

import {
	checkOllamaHealth,
	generateText,
	models,
	ollama,
	prompts,
} from "@repo/ai-llama";

async function exampleLlama() {
	console.log("Example Llama AI package...\n");

	// Check health
	console.log("1. Checking Ollama connection...");
	const isHealthy = await checkOllamaHealth();

	if (!isHealthy) {
		console.error("❌ Ollama is not accessible at http://localhost:11434");
		console.log("\n💡 Make sure Ollama is running:");
		console.log("   $ ollama serve");
		console.log("   Then try: ollama pull llama3.2");
		return;
	}

	console.log("✅ Ollama is running!\n");

	// Simple generation test
	console.log("2. Testing text generation...");

	try {
		console.log("=== Ollama AI Examples ===\n");

		// 1. Basic generation
		console.log("1. Basic Generation:");
		const response = await ollama.generate(
			"llama3.2:latest",
			"Tell me a fun fact about space.",
		);
		console.log(`${response.response}\n`);

		// 2. Using model shortcuts
		console.log("2. Using Model Shortcuts:");
		const mistralResponse = await models.mistral.generate(
			"What is the capital of France?",
		);
		console.log(`${mistralResponse.response}\n`);

		// 3. Streaming
		console.log("3. Streaming Response:");
		console.log("Counting: ");
		for await (const chunk of models.llama.stream("Count from 1 to 3:")) {
			process.stdout.write(chunk);
		}
		console.log("\n");

		// 4. Using prompts library
		console.log("4. Using Prompts Library:");
		const productPrompt =
			prompts.promptListProductNames("smart coffee mug");
		const products = await generateText("llama3.2:latest", productPrompt);
		console.log(`${products}\n`);

		// 5. Custom configuration
		console.log("5. Custom Configuration (creative mode):");
		const creativeResponse = await ollama.generate(
			"mistral:latest",
			"Write a haiku about programming",
			{ temperature: 0.9, maxTokens: 50 },
		);
		console.log(`${creativeResponse.response}\n`);

		// 6. Check available models
		console.log("6. Available Models:");
		const availableModels = await ollama.getAvailableModels();
		console.log(availableModels.map((m, i) => `${i + 1}. ${m}`).join("\n"));
	} catch (error: any) {
		console.error("❌ Generation failed:", error.message);

		if (
			error.message.includes("model") &&
			error.message.includes("not found")
		) {
			console.log("\n💡 Try pulling the model:");
			console.log("   $ ollama pull llama3.2");
			console.log("   Then run this test again.");
		}
	}
}

exampleLlama().catch(console.error);
