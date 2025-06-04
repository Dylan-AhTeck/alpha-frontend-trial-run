// Admin Layout Component - Handles admin page structure and header
import React from "react";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, RefreshCw, Loader2, LogOut } from "lucide-react";
import { PageContainer, Header, MainContent } from "@/shared/components/layout";
import { AdminLayoutProps } from "../types/admin.types";

export default function AdminLayout({
  user,
  onLogout,
  onBackToDashboard,
  onRefresh,
  loading,
  children,
}: AdminLayoutProps & { children: React.ReactNode }) {
  return (
    <PageContainer>
      <Header>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBackToDashboard}
            className="text-white hover:bg-white/10"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <div className="h-6 w-px bg-white/20" />
          <h1 className="text-xl font-bold">Admin Dashboard</h1>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRefresh}
            disabled={loading}
            className="text-white hover:bg-white/10"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4" />
            )}
          </Button>
        </div>

        <div className="flex items-center space-x-4">
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

      <MainContent>{children}</MainContent>
    </PageContainer>
  );
}
