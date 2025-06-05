// Chat Feature Exports
// This file provides a clean API for the chat feature

// Components
export { Thread } from "./components/Thread";
export { default as ThreadList } from "./components/ThreadList";
export { TooltipIconButton } from "./components/tooltip-icon-button";
export { MarkdownText } from "./components/markdown-text";

// Providers
export { ChatProvider } from "./providers/ChatProvider";

// Hooks
export { useAssistantCloud } from "./hooks/useAssistantCloud";

// API - Export both the object and individual functions
export { chatApi } from "./api/chat-api";
export {
  createThread,
  getThreadState,
  deleteThread,
  streamMessages,
  parseSSEStream,
  fetchAssistantToken,
} from "./api/chat-api";

// Types
export type * from "./types/chat.types";
export type {
  ChatMessage,
  CreateThreadResponse,
  SendMessageRequest,
  ThreadState,
} from "./api/chat-api";
