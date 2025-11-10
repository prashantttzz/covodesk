import React from "react";
import {
  ResizablePanelGroup,
  ResizableHandle,
  ResizablePanel,
} from "@workspace/ui/components/resizable";
import { ConversationPanel } from "@/components/conversation-panel";
const layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ResizablePanelGroup className="h-full flex-1 bg-card" direction="horizontal">
      <ResizablePanel
        defaultSize={30}
        maxSize={30}
        minSize={20}
        className="h-screen "
      >
        <ConversationPanel />{" "}
      </ResizablePanel>
      <ResizableHandle />
      <ResizablePanel className="h-full" defaultSize={70}>
        {children}
      </ResizablePanel>
    </ResizablePanelGroup>
  );
};

export default layout;
