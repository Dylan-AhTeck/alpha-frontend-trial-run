import type { FC } from "react";
import {
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  useThreadList,
} from "@assistant-ui/react";
import { ArchiveIcon, PlusIcon, MessageCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { TooltipIconButton } from "@/components/assistant-ui/tooltip-icon-button";

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
          <ThreadListItemTimestamp />
        </div>
      </ThreadListItemPrimitive.Trigger>
      <ThreadListItemArchive />
    </ThreadListItemPrimitive.Root>
  );
};

const ThreadListItemTitle: FC = () => {
  return (
    <p className="text-sm text-white/90 truncate font-medium">
      <ThreadListItemPrimitive.Title fallback="New Chat" />
    </p>
  );
};

const ThreadListItemTimestamp: FC = () => {
  // Format the timestamp - for now we'll show a placeholder since we don't have real timestamps
  // In a real app, you'd get this from the thread metadata
  const formatTime = () => {
    // This is a placeholder - in a real implementation you'd get the actual timestamp
    // from the thread's last message or thread metadata
    return "Just now";
  };

  return <p className="text-xs text-white/50 mt-0.5">{formatTime()}</p>;
};

const ThreadListItemArchive: FC = () => {
  return (
    <ThreadListItemPrimitive.Archive asChild>
      <TooltipIconButton
        className="hover:text-red-400 text-white/60 size-4 p-0 flex-shrink-0"
        variant="ghost"
        tooltip="Archive thread"
      >
        <ArchiveIcon />
      </TooltipIconButton>
    </ThreadListItemPrimitive.Archive>
  );
};
