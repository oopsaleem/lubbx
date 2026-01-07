// client.ts - React hooks
export * from "@ai-sdk/react";

// Custom hook for Ollama chat
import { useCallback, useState } from "react";
import { ollama } from "./index";
import type { OllamaConfig } from "./index";

export interface UseOllamaChatOptions {
	modelId?: string;
	config?: OllamaConfig;
	onResponse?: (response: string) => void;
	onError?: (error: Error) => void;
}

export function useOllamaChat(options: UseOllamaChatOptions = {}) {
	const { modelId = "llama3.2:latest", config } = options;
	const [isLoading, setIsLoading] = useState(false);
	const [error, setError] = useState<Error | null>(null);

	const sendMessage = useCallback(
		async (prompt: string): Promise<string> => {
			setIsLoading(true);
			setError(null);

			try {
				const response = await ollama.generate(modelId, prompt, config);
				const result = response.response;

				if (options.onResponse) {
					options.onResponse(result);
				}

				return result;
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error(String(err));
				setError(error);

				if (options.onError) {
					options.onError(error);
				}

				throw error;
			} finally {
				setIsLoading(false);
			}
		},
		[modelId, config, options.onResponse, options.onError],
	);

	const streamMessage = useCallback(
		async function* (prompt: string) {
			setIsLoading(true);
			setError(null);

			try {
				for await (const chunk of ollama.generateStream(
					modelId,
					prompt,
					config,
				)) {
					yield chunk;
				}
			} catch (err) {
				const error =
					err instanceof Error ? err : new Error(String(err));
				setError(error);

				if (options.onError) {
					options.onError(error);
				}

				throw error;
			} finally {
				setIsLoading(false);
			}
		},
		[modelId, config, options.onError],
	);

	return {
		sendMessage,
		streamMessage,
		isLoading,
		error,
	};
}
