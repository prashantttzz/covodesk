"use client";
import { screenAtom } from "@/components/widget-atom";
import WidgetAuthScreen from "@/components/widget-authScreen";
import WidgetChatScreen from "@/components/widget-chatScreen";
import WidgetErrorScreen from "@/components/widget-errorScreen";
import WidgetFooter from "@/components/widget-footer";
import WidgetInboxScreen from "@/components/widget-inboxScreen";
import WidgetLoadingScreen from "@/components/widget-loadingScreen";
import WidgetSelectionScreen from "@/components/widget-selectionScreen";
import { useAtomValue } from "jotai";
import { JSX } from "react";
import WidgetVoiceScreen from "./widget-voiceScreen";
import WidgetContactScreen from "./widget-contactSrceen";

type ScreenType = 'error' | 'loading' | 'contact' | 'chat' | 'voice' | 'inbox' | 'auth' | 'selection';

const WidgetHomeScreen = ({organizationId}:{organizationId:string}) => {
  const screen = useAtomValue(screenAtom) as ScreenType;    
  const screenComponent: Record<ScreenType, JSX.Element> = {
    error: <WidgetErrorScreen/>,
    loading:<WidgetLoadingScreen organizationId={organizationId}/>,
    contact: <WidgetContactScreen/>,
    chat: <WidgetChatScreen/>,
    voice: <WidgetVoiceScreen/>,
    inbox:<WidgetInboxScreen/>,
    auth: <WidgetAuthScreen />,
    selection: <WidgetSelectionScreen/>,
  };

  return (
    <main className=" flex h-full w-full flex-col overflow-hidden rounded-xl border bg-muted">
      {screenComponent[screen]}
      <WidgetFooter />
    </main>
  );
};

export default WidgetHomeScreen;
