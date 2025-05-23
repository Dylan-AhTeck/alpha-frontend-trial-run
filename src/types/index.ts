export interface User {
  id: string;
  email: string;
  name?: string;
  threads: Thread[];
  isAdmin?: boolean;
}

export interface Thread {
  id: string;
  title: string;
  messages: Message[];
  lastUpdated: Date;
  userId: string;
}

export interface Message {
  id: string;
  content: string;
  role: "user" | "assistant";
  timestamp: Date;
}

export interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  login: (email: string) => Promise<void>;
  logout: () => void;
}
