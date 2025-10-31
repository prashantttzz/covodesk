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
import React from "react";
import { toast } from "sonner";
import { useVapiAssistant } from "../hooks/use-vapi-data";

const VapiAssistantTab = () => {
  const { data: assistants, isLoading } = useVapiAssistant();
  console.log("ass",assistants)
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("copied to clipboard");
    } catch {
      toast.error("failed to copy");
    }
  };
  return (
    <div className="border-t bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="px-6 py-4 ">Assistant</TableHead>
            <TableHead className="px-6 py-4 ">Model</TableHead>
            <TableHead className="px-6 py-4 ">First Message</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {(() => {
            if (isLoading) {
              return (
                <TableRow>
                  <TableCell
                    colSpan={3}
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
                    colSpan={3}
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
                  {assistant?.model?.model || ""}
                </TableCell>
                <TableCell className="px-6 py-4 truncate">
<span className="truncate">
                 {assistant?.firstMessage}
  </span>                </TableCell>
              </TableRow>
            ));
          })()}
        </TableBody>
      </Table>
    </div>
  );
};

export default VapiAssistantTab;
