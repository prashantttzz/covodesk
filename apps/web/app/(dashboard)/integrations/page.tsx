"use client";
import { SnnipetDialog } from "@/components/snippet-dialog";
import { INTEGRATION, integrationId } from "@/constants";
import { createScript } from "@/lib/utils";
import { useOrganization } from "@clerk/nextjs";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Separator } from "@workspace/ui/components/separator";
import { CopyIcon } from "lucide-react";
import Image from "next/image";
import React, { useState } from "react";
import { toast } from "sonner";


const Integration = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedSnippet, setSelectedSnippet] = useState("");

  const { organization } = useOrganization();
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(organization?.id ?? "");
      toast.success("copied to clipboard");
    } catch (error) {
      toast.error("failed to copy to clipboard");
    }
  };
  const handleIntegrationClick = (integrationId: integrationId) => {
    if(!organization){
      toast.error("organization ID not found");
      return;
    }
    const snippet = createScript(integrationId,organization.id)
    setSelectedSnippet(snippet);
    setDialogOpen(true)
  };
  return (
    <>
    <SnnipetDialog open={dialogOpen} onOpenChange={setDialogOpen} snippet={selectedSnippet}/>
    <div className="flex w-full min-h-screen flex-col p-8 bg-muted">
      <div className="mx-auto w-full max-w-screen-md">
        <div className="space-y-2">
          <h1 className="text-2xl md:text-4xl">Setup and Integration</h1>
          <p className="text-muted-foreground">
            chose the integration that is right for you
          </p>
        </div>
        <div className="mt-8 space-y-6">
          <div className="flex items-center gap-4">
            <Label className="w-34" htmlFor="website-id">
              Organization Id
            </Label>
            <Input
              className="flex-1 bg-background font-mono text-sm"
              id="organization-id"
              disabled
              readOnly
              value={organization?.id ?? ""}
            />
            <Button className="gap-2" onClick={handleCopy} size="sm">
              <CopyIcon className="size-4" />
            </Button>
          </div>
        </div>
        <Separator className="my-8" />
        <div className="space-y-6">
          <div className="space-y-1">
            <Label className="text-lg">Integration</Label>
            <p className="text-muted-foreground text-sm">
              Add the following code to your website to enable chatbox
            </p>
          </div>
          <div className="grid gird-cols-2 gap-4 md:grid-cols-4">
            {INTEGRATION.map((integration) => (
              <button
                key={integration.id}
                onClick={()=>handleIntegrationClick(integration.id)}
                className="flex items-center gap-4 rounded-lg border bg-background p-4 hover:bg-accent"
              >
                <Image
                  src={integration.icon}
                  alt={integration.title}
                  width={32}
                  height={32}
                />
                <p>{integration.title}</p>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
    </>

  );
};

export default Integration;
