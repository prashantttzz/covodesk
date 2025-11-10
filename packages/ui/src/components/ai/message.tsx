import type { ComponentProps, HTMLAttributes } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@workspace/ui/components/avatar";
import { cn } from "@workspace/ui/lib/utils";

export type AIMessageProps = HTMLAttributes<HTMLDivElement> & {
  from: "user" | "assistant";
};

export const AIMessage = ({ className, from, ...props }: AIMessageProps) => (
  <div
    className={cn(
      "group flex w-full items-end justify-end gap-2 py-2",
      from === "user" ? "is-user" : "is-assistant flex-row-reverse justify-end",
      "[&>div]:max-w-[80%]",
      className
    )}
    {...props}
  />
);

export type AIMessageContentProps = HTMLAttributes<HTMLDivElement>;

export const AIMessageContent = ({
  children,
  className,
  ...props
}: AIMessageContentProps) => (
  <div
    className={cn(
      // Base container
      "relative flex flex-col gap-2 rounded-2xl px-4 py-3 text-sm transition-all duration-300",

      // Dark glass layer
      "bg-[rgba(129,129,129,0.4)] backdrop-blur-[12px] border border-white/10",

      // Highlight edge for depth layering
      "before:absolute before:inset-0 before:rounded-2xl before:border before:border-white/[0.03] before:pointer-events-none",

      // User-specific gradient style (adds a faint glow)
      "group-[.is-user]:shadow-[0_8px_30px_rgba(0,0,0,0.5)] group-[.is-user]:bg-[rgba(56,56,56,0.4)]",

      // Text color control
      "text-gray-200 group-[.is-user]:text-white",

      // Subtle scale + hover depth for interactivity
      // "hover:scale-[1.01] hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)]",

      className
    )}
    {...props}
  >
    <div className="relative z-10">{children}</div>

    {/* Optional internal glow layer for depth */}

  </div>
);


export type AIMessageAvatarProps = ComponentProps<typeof Avatar> & {
  src: string;
  name?: string;
};

export const AIMessageAvatar = ({
  src,
  name,
  className,
  ...props
}: AIMessageAvatarProps) => (
  <Avatar className={cn("size-8", className)} {...props}>
    <AvatarImage alt="" className="mt-0 mb-0" src={src} />
    <AvatarFallback>{name?.slice(0, 2) || "ME"}</AvatarFallback>
  </Avatar>
);
