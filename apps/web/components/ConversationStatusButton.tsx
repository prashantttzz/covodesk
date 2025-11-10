"use client"
import { Doc } from "@workspace/backend/_generated/dataModel";
import React from "react";
import Hint from "../components/Hint";
import { Button } from "@workspace/ui/components/button";
import { ArrowRightIcon, ArrowUpIcon, CheckIcon } from "lucide-react";
import { cn } from "@workspace/ui/lib/utils";

const ConversationStatusButton = ({
  status,
  onClick,
  disabled,
}: {
  status: Doc<"conversations">["status"];
  onClick: () => void;
  disabled: boolean;
}) => {
  const baseGlassStyles =
    "relative overflow-hidden backdrop-blur-[10px] border text-sm font-medium shadow-[inset_0_0_1px_rgba(255,255,255,0.2),0_4px_15px_rgba(0,0,0,0.2)] transition-all duration-300";

  if (status === "resolved") {
    return (
      <Hint text="Marked as unresolved">
        <Button
          disabled={disabled}
          onClick={onClick}
          size="sm"
          className={cn(
            baseGlassStyles,
            "border-green-400/30 text-green-200 bg-[rgba(46,255,113,0.12)] hover:bg-[rgba(46,255,113,0.18)]"
          )}
        >
          <CheckIcon className="mr-1 h-4 w-4" />
          Resolved
        </Button>
      </Hint>
    );
  }

  if (status === "escalated") {
    return (
      <Hint text="Marked as resolved">
        <Button
          disabled={disabled}
          onClick={onClick}
          size="sm"
          className={cn(
            baseGlassStyles,
            "border-amber-400/30 text-amber-200 bg-[rgba(255,200,100,0.12)] hover:bg-[rgba(255,200,100,0.18)]"
          )}
        >
          <ArrowUpIcon className="mr-1 h-4 w-4" />
          Escalated
        </Button>
      </Hint>
    );
  }

  return (
    <Hint text="Mark as escalated">
      <Button
        disabled={disabled}
        onClick={onClick}
        size="sm"
        className={cn(
          baseGlassStyles,
          "border-red-400/30 text-red-200 bg-[rgba(238,16,16,0.32)] hover:bg-[rgba(255,60,60,0.18)]"
        )}
      >
        <ArrowRightIcon className="mr-1 h-4 w-4" />
        Unresolved
      </Button>
    </Hint>
  );
};

export default ConversationStatusButton;
