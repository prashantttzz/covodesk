import React from "react";
import { ConversationPanel } from "@/components/conversation-panel";

const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex h-screen w-full bg-card overflow-hidden">
      <div className="w-[400px] h-full border-r shrink-0">
        <ConversationPanel />
      </div>
      <main className="flex-1 h-full min-w-0 overflow-auto">
        {children}
      </main>
    </div>
  );
};

export default layout;
