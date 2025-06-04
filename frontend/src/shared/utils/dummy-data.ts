import { User, Thread, Message } from "@/shared/types";

const dylanResponses = [
  "Hey! As someone who's lived in Singapore, Australia, and Mauritius before settling in NYC, I can definitely relate to that experience. What specifically would you like to know?",
  "That's a great question! From my experience as a software engineer here in Manhattan, I've found that...",
  "Interesting! This reminds me of when I was playing rugby back in Australia - the teamwork aspect is really similar to what we do in tech.",
  "Living in NYC has taught me a lot about adaptability. Coming from the smaller communities in Mauritius, the transition was quite something!",
  "As a 26-year-old who's moved around quite a bit, I think perspective is everything. When I was in Singapore working on fintech projects...",
  "That's exactly the kind of problem we face in software engineering every day! The logical thinking from my rugby days actually helps a lot.",
  "I love talking about travel! Having grown up across three different countries before moving to New York, I've got some thoughts on this.",
  "From a technical standpoint, that makes sense. I've been working on similar challenges in my current role here in the city.",
];

const getDylanResponse = (userMessage: string): string => {
  // Simple keyword-based response selection
  const message = userMessage.toLowerCase();

  if (
    message.includes("travel") ||
    message.includes("country") ||
    message.includes("place")
  ) {
    return "I love talking about travel! Having grown up across three different countries before moving to New York, I've got some thoughts on this. Mauritius has this incredible blend of cultures, Australia taught me about work-life balance, Singapore showed me the future of tech, and NYC... well, it's the city that never sleeps for a reason!";
  }

  if (
    message.includes("code") ||
    message.includes("programming") ||
    message.includes("software") ||
    message.includes("tech")
  ) {
    return "That's exactly the kind of problem we face in software engineering every day! From my experience working in NYC's tech scene, I've learned that clean code is like a good rugby play - it needs structure, teamwork, and clear execution. What specific area are you working on?";
  }

  if (
    message.includes("rugby") ||
    message.includes("sport") ||
    message.includes("team")
  ) {
    return "Rugby has taught me so much about teamwork and resilience! I played throughout my time in Australia and it's amazing how those lessons translate to software engineering. The communication, strategy, and supporting your teammates - it's all there in both worlds.";
  }

  if (
    message.includes("new york") ||
    message.includes("nyc") ||
    message.includes("city")
  ) {
    return "NYC is incredible! Coming from the laid-back vibes of Mauritius and Australia, the energy here is unmatched. As a software engineer, the opportunities are endless, but the pace definitely takes some getting used to. The diversity reminds me of Singapore though - so many different perspectives in one place.";
  }

  // Default responses
  return dylanResponses[Math.floor(Math.random() * dylanResponses.length)];
};

const createDummyMessages = (threadId: string, topic: string): Message[] => {
  const conversations: Record<string, { user: string; assistant: string }[]> = {
    "Welcome Chat": [
      {
        user: "Hi there! I'm excited to try out this IdentityX agent.",
        assistant:
          "Hey! Welcome to Alpha! I'm Dylan, and I'm excited to chat with you. As someone who's lived in Singapore, Australia, and Mauritius before settling in NYC, I love meeting new people. What would you like to know about me or discuss?",
      },
    ],
    "Tech Discussion": [
      {
        user: "What's your experience with React and modern web development?",
        assistant:
          "Great question! As a software engineer here in NYC, I work with React quite a bit. I love how it's evolved - coming from someone who's coded across different environments in Singapore and Australia, React's component-based architecture really appeals to the systematic thinking I developed playing rugby. The ecosystem is constantly evolving, which keeps things exciting!",
      },
      {
        user: "How do you stay updated with new technologies?",
        assistant:
          "Living in NYC's tech scene definitely helps! I follow a lot of engineering blogs, participate in local meetups when I can (though rugby training sometimes conflicts), and I've found that my international background helps me see different perspectives on tech trends. Singapore's fintech scene, Australia's startup culture, and NYC's enterprise focus all offer unique insights.",
      },
    ],
    "Travel Stories": [
      {
        user: "Tell me about your experience living in different countries.",
        assistant:
          "What a journey it's been! Growing up in Mauritius gave me this multicultural foundation - French, English, Creole all mixed together. Australia taught me about work-life balance and the importance of outdoor activities (which is where I really got into rugby). Singapore showed me the future of technology and urban living. And now NYC... it's like all those experiences rolled into one intense, incredible city!",
      },
      {
        user: "Which place was your favorite?",
        assistant:
          "That's like asking me to pick a favorite rugby position! Each place shaped me differently. Mauritius will always be home - there's something about that island life and family connections. Australia gave me confidence and a love for sports. Singapore taught me professionalism and efficiency. NYC is teaching me ambition and resilience. As a software engineer, I use skills I learned in each place every day.",
      },
    ],
    "Life in NYC": [
      {
        user: "How's life as a software engineer in New York?",
        assistant:
          "It's intense but amazing! The pace here is unlike anywhere I've lived before. Coming from the relaxed vibes of Mauritius and Australia, NYC definitely took some adjustment. But the opportunities in tech here are incredible. The diversity reminds me of Singapore, and there's always something new to learn. Plus, I found a rugby club here, which helps me stay connected to my Australian roots!",
      },
    ],
    "Rugby Talk": [
      {
        user: "Do you still play rugby in NYC?",
        assistant:
          "I do! Found a great club here in the city. It's amazing how rugby creates this instant global community - doesn't matter if you learned to play in Australia, Mauritius, or right here in NYC. The strategic thinking from rugby actually helps a lot in software engineering too. Both require teamwork, quick decision-making, and adapting to changing situations on the fly.",
      },
    ],
  };

  const messages: Message[] = [];
  const convs = conversations[topic] || conversations["Welcome Chat"];

  convs.forEach((conv, index) => {
    messages.push({
      id: `${threadId}-msg-${index * 2}`,
      content: conv.user,
      role: "user",
      timestamp: new Date(Date.now() - (convs.length - index) * 3600000), // Hours ago
    });

    messages.push({
      id: `${threadId}-msg-${index * 2 + 1}`,
      content: conv.assistant,
      role: "assistant",
      timestamp: new Date(
        Date.now() - (convs.length - index) * 3600000 + 30000
      ), // 30 seconds later
    });
  });

  return messages;
};

export const getDummyUsers = (): User[] => {
  const users: User[] = [
    {
      id: "user-1",
      email: "sarah.chen@gmail.com",
      threads: [],
      isAdmin: false,
    },
    {
      id: "user-2",
      email: "mike.rodriguez@yahoo.com",
      threads: [],
      isAdmin: false,
    },
    {
      id: "user-3",
      email: "emma.johnson@hotmail.com",
      threads: [],
      isAdmin: false,
    },
    {
      id: "user-4",
      email: "alex.kim@outlook.com",
      threads: [],
      isAdmin: false,
    },
    {
      id: "admin-1",
      email: "admin@alpha.com",
      threads: [],
      isAdmin: true,
    },
  ];

  // Add threads to users
  const threadTopics = [
    "Welcome Chat",
    "Tech Discussion",
    "Travel Stories",
    "Life in NYC",
    "Rugby Talk",
  ];

  users.forEach((user) => {
    if (!user.isAdmin) {
      const numThreads = Math.floor(Math.random() * 3) + 2; // 2-4 threads per user

      for (let i = 0; i < numThreads; i++) {
        const topic = threadTopics[i % threadTopics.length];
        const threadId = `thread-${user.id}-${i}`;

        const thread: Thread = {
          id: threadId,
          title: topic,
          messages: createDummyMessages(threadId, topic),
          lastUpdated: new Date(Date.now() - Math.random() * 7 * 24 * 3600000), // Within last 7 days
          userId: user.id,
        };

        user.threads.push(thread);
      }

      // Sort threads by lastUpdated
      user.threads.sort(
        (a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime()
      );
    }
  });

  return users;
};

export { getDylanResponse };
