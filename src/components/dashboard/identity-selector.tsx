import type { FC } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronDown, Clock } from "lucide-react";

interface IdentitySelectorProps {
  currentAgent?: string;
  onAgentChange?: (agentId: string) => void;
}

export const IdentitySelector: FC<IdentitySelectorProps> = ({
  currentAgent = "dylan",
  onAgentChange,
}) => {
  return (
    <Select value={currentAgent} onValueChange={onAgentChange} disabled={false}>
      <SelectTrigger className="border-none bg-transparent p-0 h-auto shadow-none focus:ring-0 focus:ring-offset-0 hover:bg-transparent [&>svg]:hidden">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
            <span className="text-sm font-bold">D</span>
          </div>
          <h1 className="text-xl font-bold text-white">
            <SelectValue placeholder="Dylan IdentityX" />
          </h1>
          <ChevronDown className="h-4 w-4 text-white/70" />
        </div>
      </SelectTrigger>

      <SelectContent className="bg-black/90 border-none backdrop-blur-md w-[280px]">
        <SelectItem
          value="dylan"
          className="text-white hover:bg-white/10 focus:bg-white/10 cursor-pointer"
        >
          <span>Dylan IdentityX</span>
        </SelectItem>

        <SelectItem
          value="coming-soon"
          disabled
          className="text-white/50 cursor-not-allowed"
        >
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-white/30" />
            <span>More identities coming soon...</span>
          </div>
        </SelectItem>
      </SelectContent>
    </Select>
  );
};
