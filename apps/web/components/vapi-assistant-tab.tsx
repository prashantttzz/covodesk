import { Badge } from "@workspace/ui/components/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  CheckCircleIcon,
  PhoneIcon,
  XCircleIcon,
} from "lucide-react";
import React, { useState } from "react";
import { toast } from "sonner";
import { useVapiAssistant } from "../hooks/use-vapi-data";
import { useAction } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";
import { DatabaseIcon, Loader2Icon } from "lucide-react";

const VapiAssistantTab = () => {
  const { data: assistants, isLoading } = useVapiAssistant();
  const configureKnowledgeBase = useAction(api.private.vapi.configureKnowledgeBase);
  const [configuringId, setConfiguringId] = useState<string | null>(null);

  const handleLinkKnowledgeBase = async (assistantId: string) => {
    try {
      setConfiguringId(assistantId);
      await configureKnowledgeBase({ assistantId });
      toast.success("Knowledge base linked successfully");
    } catch (error) {
      console.error(error);
      toast.error("Failed to link knowledge base");
    } finally {
      setConfiguringId(null);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("copied to clipboard");
    } catch {
      toast.error("failed to copy");
    }
  };
  return (
    <div  className=" !bg-card">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-6 py-4 ">Assistant</TableHead>
            <TableHead className="px-6 py-4 ">Model</TableHead>
            <TableHead className="px-6 py-4 ">First Message</TableHead>
            <TableHead className="px-6 py-4 ">Knowledge Base</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(() => {
            if (isLoading) {
              return (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    Loading assistants...
                  </TableCell>
                </TableRow>
              );
            }
            if (assistants.length === 0) {
              return (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="px-6 py-8 text-center text-muted-foreground"
                  >
                    no assistant configured..
                  </TableCell>
                </TableRow>
              );
            }

            return assistants.map((assistant) => (
              <TableRow className="hover:bg-muted/50" key={assistant.id}>
                <TableCell className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <PhoneIcon className="size-4 text-muted-foreground" />
                    <span className="font-mono">
                      {assistant?.name || "no name"}
                    </span>
                  </div>
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Badge className="glass-light p-1 text-white">
                    {assistant?.model?.model || ""}
                  </Badge>
                </TableCell>
                <TableCell className="px-6 py-4 truncate">
                  <span className="truncate">{assistant?.firstMessage}</span>{" "}
                </TableCell>
                <TableCell className="px-6 py-4">
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-2"
                    onClick={() => handleLinkKnowledgeBase(assistant.id)}
                    disabled={configuringId === assistant.id}
                  >
                    {configuringId === assistant.id ? (
                      <Loader2Icon className="size-4 animate-spin" />
                    ) : (
                      <DatabaseIcon className="size-4" />
                    )}
                    Link KB
                  </Button>
                </TableCell>
              </TableRow>
            ));
          })()}
        </TableBody>
      </Table>
    </div>
  );
};

export default VapiAssistantTab;
