// test-llama.ts
import { checkOllamaHealth, getAvailableModels, ollama } from "@repo/ai-llama";

async function runTests() {
	console.log("🚀 Testing Llama AI Package");
	console.log("=".repeat(50));

	// Check health
	console.log("🔍 Checking Ollama connection...");
	const isHealthy = await checkOllamaHealth();

	if (!isHealthy) {
		console.error("❌ Ollama is not accessible at http://localhost:11434");
		console.log("\n💡 Make sure Ollama is running:");
		console.log("   $ ollama serve");
		return;
	}

	console.log("✅ Ollama is running!");

	// List models
	console.log("\n📋 Checking available models...");
	const models = await getAvailableModels();

	if (models.length === 0) {
		console.log("❌ No models found. Pull some models first:");
		console.log("   $ ollama pull llama3.2:latest");
		return;
	}

	console.log(`✅ Found ${models.length} model(s):`);
	models.forEach((model, index) => {
		console.log(`   ${index + 1}. ${model}`);
	});

	// Test basic generation with first model
	const testModel = models[0];
	console.log(`\n🧪 Testing generation with ${testModel}...`);

	try {
		const response = await ollama.generate(
			testModel,
			'Say "Hello from Ollama!" in one sentence.',
		);

		console.log("✅ Generation successful!");
		console.log(`\n📝 Response: ${response.response}`);
		console.log(
			`⏱️  Tokens: ${response.prompt_eval_count} prompt, ${response.eval_count} completion`,
		);
		console.log(`⏱️  Duration: ${response.total_duration}ns`);
	} catch (error: any) {
		console.error("❌ Generation failed:", error.message);
		return;
	}

	// Test streaming with first model
	console.log(`\n🌊 Testing streaming with ${testModel}...`);

	try {
		console.log("   Stream response:");
		let streamedText = "";

		for await (const chunk of ollama.generateStream(
			testModel,
			"Count from 1 to 5 with a short pause between each number:",
		)) {
			process.stdout.write(chunk);
			streamedText += chunk;
		}

		console.log("\n✅ Streaming successful!");
		console.log(`   Total streamed characters: ${streamedText.length}`);
	} catch (error: any) {
		console.error("\n❌ Streaming failed:", error.message);
		return;
	}

	console.log(`\n${"=".repeat(50)}`);
	console.log("🎉 All tests passed! Your Llama AI package is working!");
	console.log("\n💡 Usage examples:");
	console.log(`
// Basic generation
import { ollama } from "@repo/ai-llama";
const response = await ollama.generate('llama3.2:latest', 'Hello!');
console.log(response.response);

// Streaming
for await (const chunk of ollama.generateStream('mistral:latest', 'Tell me a story')) {
  process.stdout.write(chunk);
}

// Check health
import { checkOllamaHealth } from "@repo/ai-llama";
const isHealthy = await checkOllamaHealth();

// List models
import { getAvailableModels } from "@repo/ai-llama";
const models = await getAvailableModels();
  `);
}

// Run tests
runTests().catch(console.error);
