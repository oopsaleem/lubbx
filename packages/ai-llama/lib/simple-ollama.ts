// lib/simple-ollama.ts
export interface OllamaConfig {
	temperature?: number;
	maxTokens?: number;
	topP?: number;
	topK?: number;
	repeatPenalty?: number;
	seed?: number;
	stop?: string[];
}

export interface OllamaGenerateResponse {
	response: string;
	model: string;
	created_at: string;
	done: boolean;
	done_reason: string;
	total_duration: number;
	load_duration: number;
	prompt_eval_count: number;
	prompt_eval_duration: number;
	eval_count: number;
	eval_duration: number;
}

/**
 * Direct Ollama API client
 */
export class OllamaClient {
	constructor(private baseURL = "http://localhost:11434/api") {}

	async generate(
		modelId: string,
		prompt: string,
		config: OllamaConfig = {},
	): Promise<OllamaGenerateResponse> {
		const response = await fetch(`${this.baseURL}/generate`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				model: modelId,
				prompt,
				stream: false,
				options: {
					temperature: config.temperature ?? 0.7,
					top_p: config.topP,
					top_k: config.topK,
					num_predict: config.maxTokens,
					repeat_penalty: config.repeatPenalty,
					seed: config.seed,
					stop: config.stop,
				},
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`Ollama API error (${response.status}): ${errorText}`,
			);
		}

		return response.json();
	}

	async *generateStream(
		modelId: string,
		prompt: string,
		config: OllamaConfig = {},
	): AsyncGenerator<string, void, unknown> {
		const response = await fetch(`${this.baseURL}/generate`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				model: modelId,
				prompt,
				stream: true,
				options: {
					temperature: config.temperature ?? 0.7,
					top_p: config.topP,
					top_k: config.topK,
					num_predict: config.maxTokens,
					repeat_penalty: config.repeatPenalty,
					seed: config.seed,
					stop: config.stop,
				},
			}),
		});

		if (!response.ok) {
			const errorText = await response.text();
			throw new Error(
				`Ollama API error (${response.status}): ${errorText}`,
			);
		}

		const reader = response.body?.getReader();
		if (!reader) {
			throw new Error("Failed to create stream reader");
		}

		const decoder = new TextDecoder();

		try {
			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					break;
				}

				const chunk = decoder.decode(value);
				const lines = chunk.split("\n").filter((line) => line.trim());

				for (const line of lines) {
					try {
						const data = JSON.parse(line);
						if (data.response) {
							yield data.response;
						}
					} catch (e) {
						// Skip invalid JSON
					}
				}
			}
		} finally {
			reader.releaseLock();
		}
	}

	async checkHealth(): Promise<boolean> {
		try {
			const response = await fetch(`${this.baseURL}/tags`);
			return response.ok;
		} catch {
			return false;
		}
	}

	async getAvailableModels(): Promise<string[]> {
		try {
			const response = await fetch(`${this.baseURL}/tags`);
			if (!response.ok) {
				throw new Error(`Failed to fetch models: ${response.status}`);
			}

			const data = await response.json();
			return data.models?.map((model: any) => model.name) || [];
		} catch (error) {
			console.error("Error fetching models:", error);
			return [];
		}
	}

	async pullModel(modelId: string): Promise<void> {
		const response = await fetch(`${this.baseURL}/pull`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: modelId }),
		});

		if (!response.ok) {
			throw new Error(
				`Failed to pull model ${modelId}: ${response.status}`,
			);
		}

		// Stream the pull progress
		const reader = response.body?.getReader();
		if (reader) {
			const decoder = new TextDecoder();

			while (true) {
				const { done, value } = await reader.read();
				if (done) {
					break;
				}

				const chunk = decoder.decode(value);
				const lines = chunk.split("\n").filter((line) => line.trim());

				for (const line of lines) {
					try {
						const data = JSON.parse(line);
						if (data.status) {
							console.log(`Pulling ${modelId}: ${data.status}`);
						}
					} catch (e) {
						// Skip invalid JSON
					}
				}
			}
		}
	}

	async deleteModel(modelId: string): Promise<void> {
		const response = await fetch(`${this.baseURL}/delete`, {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: modelId }),
		});

		if (!response.ok) {
			throw new Error(
				`Failed to delete model ${modelId}: ${response.status}`,
			);
		}
	}

	async getModelInfo(modelId: string): Promise<any> {
		const response = await fetch(`${this.baseURL}/show`, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ name: modelId }),
		});

		if (!response.ok) {
			throw new Error(
				`Failed to get model info for ${modelId}: ${response.status}`,
			);
		}

		return response.json();
	}
}

// Create default client
export const ollama = new OllamaClient();

// Export helper functions
export async function checkOllamaHealth(
	baseURL = "http://localhost:11434/api",
): Promise<boolean> {
	const client = new OllamaClient(baseURL);
	return client.checkHealth();
}

export async function getAvailableModels(
	baseURL = "http://localhost:11434/api",
): Promise<string[]> {
	const client = new OllamaClient(baseURL);
	return client.getAvailableModels();
}
