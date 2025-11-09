"use client";
import { Button } from "@workspace/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogHeader,
} from "@workspace/ui/components/dialog";
import { CopyIcon } from "lucide-react";
import { toast } from "sonner";

export const SnnipetDialog = ({
  open,
  onOpenChange,
  snippet,
}: {
  open: boolean;
  onOpenChange: (value: boolean) => void;
  snippet: string;
}) => {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      toast.success("copied to clipboard");
    } catch (error) {
      toast.error("failed to copy to clipboard");
    }
  };
  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>integration with your website</DialogTitle>
          <DialogDescription>
            follow this step to add the chatbox to your website
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <div className="rounded-md bg-accent p-2 text-sm">
              1. Copy the following code
            </div>
            <div className="group relative">
              <pre className="max-h-[300px] overflow-x-auto overflow-y-auto whitespace-pre-wrap break-all rounded-md bg-foreground p-2 font-mono  text-secondary text-sm">
                {snippet}
              </pre>
              <Button
                className="absolute top-4 size-6 opacity-0 transition-opacity group-hover:opacity-100 right-6 "
                onClick={handleCopy}
                size="icon"
                variant="secondary"
              >
                <CopyIcon className="size-3" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            <div className="rounded-md bg-accent p-2 text-sm">
              2. ad the code in your page
            </div>
            <p className="text-muted-foreground tet"></p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
