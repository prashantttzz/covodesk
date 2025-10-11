import { Doc } from "@workspace/backend/_generated/dataModel";
import React from "react";
import Hint from "../components/Hint";
import { Button } from "@workspace/ui/components/button";
import { ArrowRightIcon, ArrowUpIcon, CheckIcon } from "lucide-react";

const ConversationStatusButton = ({
  status,
  onClick,
  disabled,
}: {
  status: Doc<"conversations">["status"];
  onClick: () => void;
  disabled: boolean;
}) => {
  if (status === "resolved") {
    return (
      <Hint text="marked as unresolved">
        <Button
          disabled={disabled}
          onClick={onClick}
          size="sm"
          variant="tertiary"
        >
          <CheckIcon />
          Resolved
        </Button>
      </Hint>
    );
  }
  if (status === "escalated") {
    return (
      <Hint text="marked as resolved">
        <Button
          disabled={disabled}
          onClick={onClick}
          size="sm"
          variant="warning"
        >
          <ArrowUpIcon />
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
        variant="destructive"
      >
        <ArrowRightIcon />
        Unresolved
      </Button>
    </Hint>
  );
};

export default ConversationStatusButton;
