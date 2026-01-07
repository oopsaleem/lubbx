import { type OllamaConfig, ollama } from "./lib/simple-ollama";

// index.ts - Main entry point
export { ollama, OllamaClient, type OllamaConfig } from "./lib/simple-ollama";
export { checkOllamaHealth, getAvailableModels } from "./lib/simple-ollama";

// Re-export AI SDK utilities
export * from "ai";

// Export prompts
export * as prompts from "./prompts";

// Helper functions
export async function generateText(
	modelId: string,
	prompt: string,
	options?: OllamaConfig,
) {
	const response = await ollama.generate(modelId, prompt, options);
	return response.response;
}

export async function* streamText(
	modelId: string,
	prompt: string,
	options?: OllamaConfig,
) {
	for await (const chunk of ollama.generateStream(modelId, prompt, options)) {
		yield chunk;
	}
}

// Pre-configured model shortcuts
export const models = {
	llama: {
		generate: (prompt: string, options?: OllamaConfig) =>
			ollama.generate("llama3.2:latest", prompt, options),
		stream: (prompt: string, options?: OllamaConfig) =>
			ollama.generateStream("llama3.2:latest", prompt, options),
	},

	mistral: {
		generate: (prompt: string, options?: OllamaConfig) =>
			ollama.generate("mistral:latest", prompt, options),
		stream: (prompt: string, options?: OllamaConfig) =>
			ollama.generateStream("mistral:latest", prompt, options),
	},

	qwen: {
		generate: (prompt: string, options?: OllamaConfig) =>
			ollama.generate("qwen2.5:7b", prompt, options),
		stream: (prompt: string, options?: OllamaConfig) =>
			ollama.generateStream("qwen2.5:7b", prompt, options),
	},

	llama2: {
		generate: (prompt: string, options?: OllamaConfig) =>
			ollama.generate("llama2:latest", prompt, options),
		stream: (prompt: string, options?: OllamaConfig) =>
			ollama.generateStream("llama2:latest", prompt, options),
	},
};

// Chat completion interface (similar to OpenAI format)
export interface ChatMessage {
	role: "system" | "user" | "assistant";
	content: string;
}

export async function createChatCompletion(
	modelId: string,
	messages: ChatMessage[],
	options?: OllamaConfig,
) {
	// Convert messages to a single prompt
	const prompt = messages.map((m) => `${m.role}: ${m.content}`).join("\n\n");
	const response = await ollama.generate(modelId, prompt, options);

	return {
		choices: [
			{
				message: {
					role: "assistant" as const,
					content: response.response,
				},
			},
		],
		usage: {
			prompt_tokens: response.prompt_eval_count || 0,
			completion_tokens: response.eval_count || 0,
			total_tokens:
				(response.prompt_eval_count || 0) + (response.eval_count || 0),
		},
	};
}
