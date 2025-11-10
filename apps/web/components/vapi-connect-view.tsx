import React, { useState } from "react";
import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import Image from "next/image";
import { Button } from "@workspace/ui/components/button";
import { BotIcon, PhoneIcon, SettingsIcon, UnplugIcon } from "lucide-react";
import Link from "next/link";
import VapiPhoneTab from "./vapi-phone-tab";
import VapiAssistantTab from "./vapi-assistant-tab";
interface VapiConnectViewProps {
  onDisconnect: () => void;
}

const VapiConnectView = ({ onDisconnect }: VapiConnectViewProps) => {
  const [activeTab, setActiveTab] = useState("phone-numbers");
  return (
    <div className="space-y-6">
      <Card className="glass-light !bg-card">
        <CardHeader>
          <div className="flex items-center  justify-between">
            <div className="flex items-center gap-4">
              <Image
                alt="vapi"
                className="rounded-lg object-contain"
                height={48}
                width={48}
                src="/vapi.jpg"
              />
              <div>
                <CardTitle>Vapi Integration</CardTitle>
                <CardDescription>
                  Manage you phone number and ai assistants
                </CardDescription>
              </div>
            </div>
            <Button
              variant="destructive"
              className="bg-red-500"
              onClick={onDisconnect}
              size="sm"
            >
              <UnplugIcon />
              Disconnect
            </Button>
          </div>
        </CardHeader>
      </Card>
      <Card className="glass-light !bg-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex size-12 items-center justify-center rounded-lg border bg-muted">
                <SettingsIcon className="size-6  glass-light text-white" />
              </div>
              <div>
                <CardTitle>Widget Configuration</CardTitle>
                <CardDescription>
                  set up voice calls for you chat widget
                </CardDescription>
              </div>
            </div>
            <Button asChild>
              <Link href="/customization">
                <SettingsIcon />
                Configure
              </Link>
            </Button>
          </div>
        </CardHeader>
      </Card>
      <div className="overflow-hidden rounded-lg border bg-background">
        <Tabs
          className="gap-0 glass-light !bg-card"
          defaultValue="phone-numbers"
          onValueChange={setActiveTab}
          value={activeTab}
        >
          <TabsList className="grid h-12 grid-cols-2 p-0">
            <TabsTrigger className="h-full rounded-none" value="phone-numbers">
              <PhoneIcon />
              Phone Numbers
            </TabsTrigger>
            <TabsTrigger className="h-full rounded-none" value="assistants">
              <BotIcon />
              Ai Assistants
            </TabsTrigger>
          </TabsList>
          <TabsContent value="phone-numbers" className="glass-light !bg-card">
            <VapiPhoneTab />
          </TabsContent>
          <TabsContent className="glass-light !bg-card" value="assistants">
            <VapiAssistantTab />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default VapiConnectView;
