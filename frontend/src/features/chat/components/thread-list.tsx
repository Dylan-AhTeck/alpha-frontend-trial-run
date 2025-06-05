import type { FC } from "react";
import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  useThreadList,
  useThreadListItem,
} from "@assistant-ui/react";
import { PlusIcon, MessageCircle, Trash2Icon } from "lucide-react";
import { useState, useEffect } from "react";

import { Button } from "@/shared/components/ui/button";
import { TooltipIconButton } from "@/features/chat/components/tooltip-icon-button";
import { getThreadState } from "@/features/chat/api/chat-api";

export const ThreadList: FC = () => {
  const threads = useThreadList((state) => state.threads);
  const hasThreads = threads && threads.length > 0;

  return (
    <ThreadListPrimitive.Root className="flex flex-col items-stretch gap-1.5">
      <ThreadListNew />
      {hasThreads ? (
        <ThreadListItems />
      ) : (
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <MessageCircle className="w-12 h-12 text-white/30 mb-3" />
          <p className="text-white/50 text-sm">No conversations yet</p>
          <p className="text-white/30 text-xs mt-1">
            Start a new conversation to begin
          </p>
        </div>
      )}
    </ThreadListPrimitive.Root>
  );
};

const ThreadListNew: FC = () => {
  return (
    <ThreadListPrimitive.New asChild>
      <Button
        className="w-full bg-white/10 border-white/20 text-white hover:bg-white/20 flex items-center justify-start gap-2 rounded-lg px-3 py-2 text-start"
        variant="outline"
      >
        <PlusIcon className="w-4 h-4" />
        New Thread
      </Button>
    </ThreadListPrimitive.New>
  );
};

const ThreadListItems: FC = () => {
  return <ThreadListPrimitive.Items components={{ ThreadListItem }} />;
};

const ThreadListItem: FC = () => {
  return (
    <ThreadListItemPrimitive.Root className="data-[active]:bg-white/20 hover:bg-white/10 focus-visible:bg-white/10 focus-visible:ring-ring flex items-center gap-2 rounded-lg transition-all focus-visible:outline-none focus-visible:ring-2 bg-white/5 border border-white/10 p-3">
      <ThreadListItemPrimitive.Trigger className="flex-grow flex items-start gap-3 text-start min-w-0">
        <MessageCircle className="w-4 h-4 text-white/60 mt-0.5 flex-shrink-0" />
        <div className="flex-grow min-w-0">
          <ThreadListItemTitle />
          <ThreadListItemMetadata />
        </div>
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemArchive />
    </ThreadListItemPrimitive.Root>
  );
};

const ThreadListItemTitle: FC = () => {
  return (
    <p className="text-sm text-white/90 truncate font-medium">
      <ThreadListItemPrimitive.Title fallback="New Conversation" />
    </p>
  );
};

const ThreadListItemMetadata: FC = () => {
  const threadId = useThreadListItem((state) => state.threadId);
  const externalId = useThreadListItem((state) => state.externalId);
  const [relativeTime, setRelativeTime] = useState<string>("Today");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchThreadData = async () => {
      const backendThreadId = externalId || threadId;

      if (!backendThreadId) {
        setIsLoading(false);
        return;
      }

      try {
        const state = await getThreadState(backendThreadId);
        const messages = state.values.messages || [];

        let lastMessageTime: Date;

        if (messages.length > 0) {
          const lastMessage = messages[messages.length - 1];
          const possibleTime =
            lastMessage.timestamp ||
            lastMessage.created_at ||
            lastMessage.createdAt ||
            lastMessage.time;

          if (possibleTime) {
            lastMessageTime = new Date(possibleTime);
          } else {
            lastMessageTime = new Date();
          }
        } else {
          lastMessageTime = new Date();
        }

        const timeDisplay = formatSimpleRelativeTime(lastMessageTime);
        setRelativeTime(timeDisplay);
      } catch (error) {
        setRelativeTime("Today");
      } finally {
        setIsLoading(false);
      }
    };

    fetchThreadData();
  }, [threadId, externalId]);

  const formatSimpleRelativeTime = (date: Date | string | undefined) => {
    if (!date) return "Today";

    const now = new Date();
    const targetDate = new Date(date);

    if (isNaN(targetDate.getTime())) {
      return "Today";
    }

    const diffMs = now.getTime() - targetDate.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays <= 1) {
      return "Today";
    } else if (diffDays === 2) {
      return "Yesterday";
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else if (diffDays < 14) {
      return "Last week";
    } else if (diffDays < 30) {
      const diffWeeks = Math.floor(diffDays / 7);
      return `${diffWeeks} weeks ago`;
    } else if (diffDays < 60) {
      return "Last month";
    } else if (diffDays < 365) {
      const diffMonths = Math.floor(diffDays / 30);
      return `${diffMonths} months ago`;
    } else {
      return "Over a year ago";
    }
  };

  if (isLoading) {
    return <p className="text-xs text-white/40 mt-0.5">•••</p>;
  }

  return <p className="text-xs text-white/50 mt-0.5">{relativeTime}</p>;
};

const ThreadListItemArchive: FC = () => {
  return (
    <ThreadListItemPrimitive.Archive asChild>
      <TooltipIconButton
        className="hover:text-red-400 text-white/60 size-4 p-0 flex-shrink-0"
        variant="ghost"
        tooltip="Delete thread"
      >
        <Trash2Icon />
      </TooltipIconButton>
    </ThreadListItemPrimitive.Archive>
  );
};
