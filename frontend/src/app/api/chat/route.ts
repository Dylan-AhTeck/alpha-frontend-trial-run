import { NextRequest } from "next/server";
import { streamText } from "ai";
import { getDylanResponse } from "@/shared/utils/dummy-data";

// Type for assistant-ui content items
interface ContentItem {
  type: string;
  text: string;
}

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Get the last user message
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || lastMessage.role !== "user") {
      return new Response("Invalid message format", { status: 400 });
    }

    // Handle both string content and array content from assistant-ui
    let messageContent = "";
    if (typeof lastMessage.content === "string") {
      messageContent = lastMessage.content;
    } else if (Array.isArray(lastMessage.content)) {
      // assistant-ui sends content as array of objects like [{"type":"text","text":"Hi"}]
      messageContent = lastMessage.content
        .filter((item: ContentItem) => item.type === "text")
        .map((item: ContentItem) => item.text)
        .join(" ");
    } else {
      messageContent = String(lastMessage.content || "");
    }

    if (!messageContent.trim()) {
      return new Response("Empty message content", { status: 400 });
    }

    // Generate Dylan's response
    const dylanResponse = getDylanResponse(messageContent);

    // Mock provider for AI SDK
    const mockProvider = {
      doStream: async () => {
        // Simulate delay
        await new Promise((resolve) =>
          setTimeout(resolve, 500 + Math.random() * 1000)
        );

        return {
          stream: new ReadableStream({
            start(controller) {
              // Send the complete text
              controller.enqueue({
                type: "text-delta",
                textDelta: dylanResponse,
              });

              // Send finish event
              controller.enqueue({
                type: "finish",
                finishReason: "stop",
                usage: {
                  promptTokens: messageContent.length,
                  completionTokens: dylanResponse.split(" ").length,
                },
              });

              controller.close();
            },
          }),
          rawCall: { rawPrompt: messageContent, rawSettings: {} },
          request: { body: JSON.stringify({ messages }) },
        };
      },
    };

    const result = await streamText({
      model: mockProvider as any,
      messages,
    });

    return result.toDataStreamResponse();
  } catch (error) {
    return new Response("Internal server error", { status: 500 });
  }
}
