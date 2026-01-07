// prompts/prompts.ts

/**
 * List product names prompt
 */
export const promptListProductNames = (topic: string): string => {
	return `List me five funny product names that could be used for ${topic}`;
};

/**
 * Creative writing prompt
 */
export const promptCreativeWriting = (
	topic: string,
	style = "funny",
): string => {
	return `Write a short ${style} story about ${topic}. Keep it under 200 words.`;
};

/**
 * Code explanation prompt
 */
export const promptExplainCode = (
	codeSnippet: string,
	language = "TypeScript",
): string => {
	return `Explain this ${language} code in simple terms:\n\n${codeSnippet}`;
};

/**
 * Code generation prompt
 */
export const promptGenerateCode = (
	description: string,
	language = "TypeScript",
): string => {
	return `Generate ${language} code for: ${description}\n\nInclude comments and export the main function.`;
};

/**
 * Chat prompt template
 */
export const createChatPrompt = (
	systemMessage: string,
	userMessage: string,
): string => {
	return `System: ${systemMessage}\n\nUser: ${userMessage}\n\nAssistant:`;
};

/**
 * System prompts
 */
export const systemPrompts = {
	creativeAssistant:
		"You are a creative assistant with a great sense of humor and imagination.",
	codingAssistant:
		"You are an expert programming assistant that writes clean, efficient code.",
	helpfulAssistant: "You are a helpful, harmless, and honest assistant.",
	strictAssistant:
		"You are a strict, factual assistant that provides concise, accurate answers.",
} as const;
