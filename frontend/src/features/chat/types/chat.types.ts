// Chat Types - Type definitions for chat feature
import { LangChainMessage } from "@assistant-ui/react-langgraph";

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp?: string;
  created_at?: string;
  createdAt?: string;
  time?: string;
}

export interface ThreadState {
  values: {
    messages?: LangChainMessage[];
  };
  tasks: {
    interrupts?: unknown[];
  }[];
}

export interface CreateThreadResponse {
  thread_id: string;
}

export interface ChatProviderProps {
  children: React.ReactNode;
}
