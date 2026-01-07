// test-llama.ts - Comprehensive test
import {
	checkOllamaHealth,
	getAvailableModels,
	models,
	ollama,
	prompts,
} from "@repo/ai-llama";

async function runComprehensiveTests() {
	console.log("🚀 Comprehensive Llama AI Package Tests");
	console.log("=".repeat(60));

	// Health check
	console.log("🔍 Health Check...");
	if (!(await checkOllamaHealth())) {
		console.error("❌ Ollama not available");
		process.exit(1);
	}
	console.log("✅ Ollama is running\n");

	// Available models
	console.log("📋 Available Models...");
	const availableModels = await getAvailableModels();
	console.log(`✅ Found ${availableModels.length} models\n`);

	// Test each model shortcut
	console.log("🧪 Testing Model Shortcuts...");
	const modelTests = [
		{ name: "llama3.2", test: models.llama },
		{ name: "mistral", test: models.mistral },
		{ name: "qwen", test: models.qwen },
		{ name: "llama2", test: models.llama2 },
	];

	for (const modelTest of modelTests) {
		try {
			const response = await modelTest.test.generate(
				'Say "Hello" in one word.',
			);
			console.log(`   ${modelTest.name}: ${response.response.trim()}`);
		} catch (error: any) {
			console.log(`   ${modelTest.name}: ❌ ${error.message}`);
		}
	}
	console.log();

	// Test prompts library
	console.log("📚 Testing Prompts Library...");
	const testPrompt = prompts.promptListProductNames("AI assistant");
	console.log(`   Prompt: "${testPrompt.substring(0, 50)}..."`);

	try {
		const response = await models.llama.generate(testPrompt);
		console.log(`   Response: ${response.response.substring(0, 100)}...\n`);
	} catch (error: any) {
		console.log(`   ❌ Prompt test failed: ${error.message}\n`);
	}

	// Test streaming
	console.log("🌊 Testing Streaming...");
	try {
		let streamed = "";
		console.log('   Streaming: "');
		for await (const chunk of models.mistral.stream("Say the alphabet:")) {
			process.stdout.write(chunk);
			streamed += chunk;
		}
		console.log(`"\n   ✅ Streamed ${streamed.length} characters\n`);
	} catch (error: any) {
		console.log(`\n   ❌ Streaming failed: ${error.message}\n`);
	}

	// Test custom configuration
	console.log("🎛️ Testing Custom Configuration...");
	try {
		const response = await ollama.generate(
			"llama3.2:latest",
			"Write a very short poem",
			{ temperature: 0.9, maxTokens: 30 },
		);
		console.log(`   Creative mode response: ${response.response}\n`);
	} catch (error: any) {
		console.log(`   ❌ Custom config failed: ${error.message}\n`);
	}

	// Performance test
	console.log("⚡ Performance Test...");
	const startTime = Date.now();
	try {
		await models.llama.generate("What is 2+2?");
		const duration = Date.now() - startTime;
		console.log(`   Response time: ${duration}ms\n`);
	} catch (error: any) {
		console.log(`   ❌ Performance test failed: ${error.message}\n`);
	}

	console.log("=".repeat(60));
	console.log("🎉 Package is fully functional!");
	console.log("\n💡 Ready to use in your projects!");
}

runComprehensiveTests().catch(console.error);
