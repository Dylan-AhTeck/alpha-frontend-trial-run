import { NextRequest } from "next/server";
import { getDylanResponse } from "@/lib/dummy-data";

export async function POST(req: NextRequest) {
  try {
    const { messages } = await req.json();

    // Get the last user message
    const lastMessage = messages[messages.length - 1];

    if (!lastMessage || lastMessage.role !== "user") {
      return new Response("Invalid message format", { status: 400 });
    }

    // Ensure content is a string
    const messageContent =
      typeof lastMessage.content === "string"
        ? lastMessage.content
        : String(lastMessage.content || "");

    if (!messageContent.trim()) {
      return new Response("Empty message content", { status: 400 });
    }

    // Generate Dylan's response
    const dylanResponse = getDylanResponse(messageContent);

    // Simulate typing delay
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 2000)
    );

    // Return streaming response (simplified for demo)
    const response = new Response(
      JSON.stringify({
        id: `msg-${Date.now()}`,
        role: "assistant",
        content: dylanResponse,
        created_at: new Date().toISOString(),
      }),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response;
  } catch (error) {
    console.error("Chat API error:", error);
    return new Response("Internal server error", { status: 500 });
  }
}
