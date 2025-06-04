// Dashboard Header Component - Header specific to dashboard with identity selector and user actions
import { Button } from "@/shared/components/ui/button";
import { LogOut, Settings } from "lucide-react";
import { Header } from "@/shared/components/layout";
import IdentitySelector from "./IdentitySelector";
import { DashboardHeaderProps } from "../types/dashboard.types";

export default function DashboardHeader({
  currentAgent,
  onAgentChange,
  user,
  userRole,
  onLogout,
  onAdminClick,
}: DashboardHeaderProps) {
  const isAdmin = userRole === "admin";

  return (
    <Header>
      <IdentitySelector
        currentAgent={currentAgent}
        onAgentChange={onAgentChange}
      />

      <div className="flex items-center space-x-4">
        {isAdmin && (
          <Button
            variant="outline"
            size="sm"
            onClick={onAdminClick}
            className="bg-purple-600/20 border-purple-500/30 text-purple-200 hover:bg-purple-600 hover:text-white"
          >
            <Settings className="w-4 h-4 mr-2" />
            Admin Dashboard
          </Button>
        )}
        <span className="text-sm text-white/70">{user?.email}</span>
        <Button
          variant="outline"
          size="sm"
          onClick={onLogout}
          className="bg-white/10 border-white/20 text-white hover:bg-white hover:text-black"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Logout
        </Button>
      </div>
    </Header>
  );
}
