import { cn } from "@workspace/ui/lib/utils";

export const WidgetHeader = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <header
      className={cn(
        "glass-light !bg-card text-white rounded-t-2xl p-4",
        className
      )}
    >
      {children}
    </header>
  );
};
