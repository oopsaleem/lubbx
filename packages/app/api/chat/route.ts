import { llamaModel } from "@repo/ai-llama";
import { streamText } from "ai";

export async function POST(req: Request) {
	const { messages } = await req.json();

	const result = await streamText({
		model: llamaModel,
		messages,
	});

	return result.toDataStreamResponse();
}
